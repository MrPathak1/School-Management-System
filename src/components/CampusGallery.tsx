import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Button, Input } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, GalleryAlbum, GalleryImage } from '../lib/supabase';

interface Props {
  mode: 'admin' | 'viewer';
  userId?: string;
}

export function CampusGallery({ mode, userId }: Props) {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [albumModal, setAlbumModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [activeAlbum, setActiveAlbum] = useState<any>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);
  const addToast = useToastStore((s) => s.addToast);

  const [albumForm, setAlbumForm] = useState({ title: '', description: '', cover_url: '' });
  const [imageForm, setImageForm] = useState({ image_url: '', caption: '' });

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    const { data } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
    setAlbums(data || []);
    setLoading(false);
  };

  const fetchImages = async (albumId: string) => {
    const { data } = await supabase.from('gallery_images').select('*').eq('album_id', albumId).order('created_at');
    return data || [];
  };

  const openAlbum = async (album: any) => {
    const images = await fetchImages(album.id);
    setActiveAlbum({ ...album, images });
  };

  const handleCreateAlbum = async () => {
    if (!albumForm.title) { addToast({ type: 'error', title: 'Title required' }); return; }
    const { error } = await supabase.from('gallery_albums').insert({
      title: albumForm.title, description: albumForm.description || null,
      cover_url: albumForm.cover_url || null, created_by: userId || null,
    });
    if (error) { addToast({ type: 'error', title: 'Failed to create album' }); return; }
    addToast({ type: 'success', title: 'Album created' });
    setAlbumModal(false);
    setAlbumForm({ title: '', description: '', cover_url: '' });
    fetchAlbums();
  };

  const handleAddImage = async () => {
    if (!imageForm.image_url || !activeAlbum) { addToast({ type: 'error', title: 'Image URL required' }); return; }
    const { error } = await supabase.from('gallery_images').insert({
      album_id: activeAlbum.id, image_url: imageForm.image_url, caption: imageForm.caption || null,
    });
    if (error) { addToast({ type: 'error', title: 'Failed to add image' }); return; }
    addToast({ type: 'success', title: 'Image added' });
    setImageModal(false);
    setImageForm({ image_url: '', caption: '' });
    openAlbum(activeAlbum);
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Delete this album and all its images?')) return;
    await supabase.from('gallery_images').delete().eq('album_id', id);
    await supabase.from('gallery_albums').delete().eq('id', id);
    addToast({ type: 'success', title: 'Album deleted' });
    if (activeAlbum?.id === id) setActiveAlbum(null);
    fetchAlbums();
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    await supabase.from('gallery_images').delete().eq('id', id);
    if (activeAlbum) openAlbum(activeAlbum);
    addToast({ type: 'success', title: 'Image deleted' });
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  if (activeAlbum) {
    const imgs = activeAlbum.images || [];
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveAlbum(null)} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
          <ChevronLeft className="w-4 h-4" /> Back to Albums
        </button>
        <SectionCard title={activeAlbum.title} subtitle={`${imgs.length} photos`}
          action={mode === 'admin' ? <Button onClick={() => setImageModal(true)}><Plus className="w-4 h-4" /> Add Photo</Button> : undefined}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imgs.length === 0 ? (
              <p className="col-span-full text-center text-neutral-400 py-8">No photos in this album</p>
            ) : (
              imgs.map((img: any, idx: number) => (
                <div key={img.id} className="group relative rounded-lg overflow-hidden bg-neutral-100">
                  <img src={img.image_url} alt={img.caption || ''} className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => { setViewerIdx(idx); setViewerOpen(true); }} />
                  {img.caption && <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">{img.caption}</p>}
                  {mode === 'admin' && (
                    <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Image Viewer */}
        {viewerOpen && imgs.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setViewerOpen(false)}>
            <button className="absolute top-4 right-4 text-white p-2" onClick={() => setViewerOpen(false)}><X className="w-8 h-8" /></button>
            <button className="absolute left-4 text-white p-2" onClick={(e) => { e.stopPropagation(); setViewerIdx((viewerIdx - 1 + imgs.length) % imgs.length); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
            <img src={imgs[viewerIdx]?.image_url} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 text-white p-2" onClick={(e) => { e.stopPropagation(); setViewerIdx((viewerIdx + 1) % imgs.length); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
            <p className="absolute bottom-4 text-white text-sm">{imgs[viewerIdx]?.caption}</p>
          </div>
        )}

        <Modal isOpen={imageModal} onClose={() => setImageModal(false)} title="Add Photo">
          <div className="space-y-4">
            <Input label="Image URL" value={imageForm.image_url} onChange={(e) => setImageForm({ ...imageForm, image_url: e.target.value })} placeholder="https://example.com/photo.jpg" />
            <Input label="Caption (optional)" value={imageForm.caption} onChange={(e) => setImageForm({ ...imageForm, caption: e.target.value })} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setImageModal(false)}>Cancel</Button>
              <Button onClick={handleAddImage}>Add</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <SectionCard title="Campus Gallery" subtitle="Photo albums from school events"
      action={mode === 'admin' ? <Button onClick={() => setAlbumModal(true)}><Plus className="w-4 h-4" /> New Album</Button> : undefined}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {albums.length === 0 ? (
          <p className="col-span-full text-center text-neutral-400 py-8">No albums yet</p>
        ) : (
          albums.map((a) => (
            <div key={a.id} onClick={() => openAlbum(a)} className="group cursor-pointer rounded-xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="h-48 bg-neutral-100 flex items-center justify-center">
                {a.cover_url ? (
                  <img src={a.cover_url} alt={a.title} className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-16 h-16 text-neutral-300" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900">{a.title}</h3>
                {a.description && <p className="text-sm text-neutral-500 mt-1">{a.description}</p>}
                <p className="text-xs text-neutral-400 mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              {mode === 'admin' && (
                <div className="px-4 pb-3">
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(a.id); }} className="text-xs text-danger-600 hover:text-danger-700 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={albumModal} onClose={() => setAlbumModal(false)} title="Create Album">
        <div className="space-y-4">
          <Input label="Album Title" value={albumForm.title} onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })} />
          <Input label="Description (optional)" value={albumForm.description} onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })} />
          <Input label="Cover Image URL (optional)" value={albumForm.cover_url} onChange={(e) => setAlbumForm({ ...albumForm, cover_url: e.target.value })} placeholder="https://example.com/cover.jpg" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAlbumModal(false)}>Cancel</Button>
            <Button onClick={handleCreateAlbum}>Create</Button>
          </div>
        </div>
      </Modal>
    </SectionCard>
  );
}
