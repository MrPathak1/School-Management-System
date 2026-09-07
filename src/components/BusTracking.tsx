import React, { useState, useEffect } from 'react';
import { Bus, Phone, MapPin, Clock, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Badge, Button, Input, Select } from './ui/Table';
import { useToastStore } from '../hooks/useToast';
import { supabase, BusRoute } from '../lib/supabase';

interface Props {
  readOnly?: boolean;
}

export function BusTracking({ readOnly }: Props) {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BusRoute | null>(null);
  const [form, setForm] = useState<{
    route_name: string; driver_name: string; driver_phone: string; bus_number: string;
    capacity: number; start_point: string; end_point: string; stops: string;
    departure_time: string; arrival_time: string; status: 'active' | 'inactive' | 'maintenance';
  }>({
    route_name: '', driver_name: '', driver_phone: '', bus_number: '',
    capacity: 40, start_point: '', end_point: '', stops: '',
    departure_time: '', arrival_time: '', status: 'active',
  });
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    const { data } = await supabase.from('bus_routes').select('*').order('route_name');
    setRoutes(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ route_name: '', driver_name: '', driver_phone: '', bus_number: '', capacity: 40, start_point: '', end_point: '', stops: '', departure_time: '', arrival_time: '', status: 'active' as const });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (r: BusRoute) => {
    setForm({
      route_name: r.route_name, driver_name: r.driver_name, driver_phone: r.driver_phone,
      bus_number: r.bus_number, capacity: r.capacity, start_point: r.start_point,
      end_point: r.end_point, stops: (r.stops || []).join(', '),
      departure_time: r.departure_time?.substring(0, 5) || '', arrival_time: r.arrival_time?.substring(0, 5) || '',
      status: r.status,
    });
    setEditing(r);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.route_name || !form.driver_name || !form.driver_phone || !form.bus_number) {
      addToast({ type: 'error', title: 'Fill required fields' });
      return;
    }
    const payload = {
      ...form,
      capacity: Number(form.capacity),
      stops: form.stops.split(',').map(s => s.trim()).filter(Boolean),
    };
    if (editing) {
      const { error } = await supabase.from('bus_routes').update(payload).eq('id', editing.id);
      if (error) { addToast({ type: 'error', title: 'Failed to update route' }); return; }
      addToast({ type: 'success', title: 'Route updated' });
    } else {
      const { error } = await supabase.from('bus_routes').insert(payload);
      if (error) { addToast({ type: 'error', title: 'Failed to create route' }); return; }
      addToast({ type: 'success', title: 'Route created' });
    }
    resetForm();
    fetchRoutes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this route?')) return;
    const { error } = await supabase.from('bus_routes').delete().eq('id', id);
    if (error) { addToast({ type: 'error', title: 'Failed to delete route' }); return; }
    addToast({ type: 'success', title: 'Route deleted' });
    fetchRoutes();
  };

  const statusVariant = (s: string) => s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'default';

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Bus Route Management</h2>
          <p className="text-sm text-neutral-500">{routes.length} route{routes.length !== 1 ? 's' : ''}</p>
        </div>
        {!readOnly && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} icon={<Plus className="w-4 h-4" />}>
            Add Route
          </Button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">{editing ? 'Edit Route' : 'New Route'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Input label="Route Name *" value={form.route_name} onChange={(e) => setForm(f => ({ ...f, route_name: e.target.value }))} /></div>
                <Input label="Driver Name *" value={form.driver_name} onChange={(e) => setForm(f => ({ ...f, driver_name: e.target.value }))} />
                <Input label="Driver Phone *" value={form.driver_phone} onChange={(e) => setForm(f => ({ ...f, driver_phone: e.target.value }))} />
                <Input label="Bus Number *" value={form.bus_number} onChange={(e) => setForm(f => ({ ...f, bus_number: e.target.value }))} />
                <Input label="Capacity" type="number" value={String(form.capacity)} onChange={(e) => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
                <Input label="Start Point *" value={form.start_point} onChange={(e) => setForm(f => ({ ...f, start_point: e.target.value }))} />
                <Input label="End Point *" value={form.end_point} onChange={(e) => setForm(f => ({ ...f, end_point: e.target.value }))} />
                <div className="col-span-2"><Input label="Stops (comma separated)" value={form.stops} onChange={(e) => setForm(f => ({ ...f, stops: e.target.value }))} placeholder="Stop 1, Stop 2, Stop 3" /></div>
                <Input label="Departure Time" type="time" value={form.departure_time} onChange={(e) => setForm(f => ({ ...f, departure_time: e.target.value }))} />
                <Input label="Arrival Time" type="time" value={form.arrival_time} onChange={(e) => setForm(f => ({ ...f, arrival_time: e.target.value }))} />
                <div className="col-span-2">
                  <Select label="Status" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'maintenance', label: 'Maintenance' },
                    ]} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleSave} className="flex-1">{editing ? 'Update' : 'Create'} Route</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {routes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
          <Bus className="w-12 h-12 mb-3" />
          <p className="font-medium">No bus routes configured</p>
          {!readOnly && <p className="text-sm">Add a route to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-primary-50 rounded-xl">
                    <Bus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900">{route.route_name}</h3>
                      <Badge variant={statusVariant(route.status) as any}>{route.status}</Badge>
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      <span className="font-mono">{route.bus_number}</span>
                    </p>
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(route)} className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(route.id)} className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>{route.start_point} → {route.end_point}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Users className="w-4 h-4 text-neutral-400" />
                  <span>Capacity: {route.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>{route.departure_time?.substring(0, 5)} - {route.arrival_time?.substring(0, 5)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>{route.driver_name}: {route.driver_phone}</span>
                </div>
              </div>

              {route.stops && route.stops.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {route.stops.map((stop, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                      {i + 1}. {stop}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
