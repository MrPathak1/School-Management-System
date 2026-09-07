import React, { useState, useEffect } from 'react';
import { Send, Mail, MailOpen, Trash2, MessageSquare } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Button, Input, Select, Badge } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase } from '../lib/supabase';

interface Props {
  mode: 'teacher' | 'parent' | 'admin';
  userId: string;
  teacherId?: string;
  parentId?: string;
  teacherName?: string;
}

export function MessagingPanel({ mode, userId, teacherId, parentId, teacherName }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({ subject: '', body: '' });

  useEffect(() => {
    if (mode === 'parent') fetchTeachers();
    fetchMessages();
  }, []);

  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers').select('id, user:users(full_name)').eq('status', 'active');
    if (data) setTeachers(data.map((t: any) => ({ id: t.id, name: t.user?.full_name || 'Unknown' })));
  };

  const fetchMessages = async () => {
    let query = supabase.from('messages').select('*').order('created_at', { ascending: false });

    if (mode === 'teacher' && teacherId) {
      query = query.or(`receiver_id.eq.${teacherId},and(sender_id.eq.${teacherId},parent_id.neq.null)`);
    } else if (mode === 'parent' && parentId) {
      query = query.eq('parent_id', parentId);
    } else if (mode === 'admin') {
      // Admin sees all
    }

    const { data } = await query;
    setMessages(data || []);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!form.subject || !form.body) {
      addToast({ type: 'error', title: 'Subject and message are required' });
      return;
    }
    if (mode === 'parent' && !selectedTeacher) {
      addToast({ type: 'error', title: 'Please select a teacher' });
      return;
    }

    const receiverId = mode === 'parent' ? selectedTeacher : replyTo?.sender_id;
    if (!receiverId) { addToast({ type: 'error', title: 'No receiver selected' }); return; }

    const { error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: receiverId,
      subject: form.subject,
      body: form.body,
      parent_id: mode === 'parent' ? parentId : null,
    });
    if (error) { addToast({ type: 'error', title: 'Failed to send message' }); return; }
    addToast({ type: 'success', title: 'Message sent' });
    setModalOpen(false);
    setReplyTo(null);
    setForm({ subject: '', body: '' });
    fetchMessages();
  };

  const handleReply = (msg: any) => {
    setReplyTo(msg);
    setForm({ subject: `Re: ${msg.subject}`, body: '' });
    setModalOpen(true);
  };

  const markRead = async (id: string) => {
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', id);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await supabase.from('messages').delete().eq('id', id);
    addToast({ type: 'success', title: 'Message deleted' });
    fetchMessages();
  };

  const unreadCount = messages.filter((m) => !m.read_at && (
    mode === 'teacher' ? m.receiver_id === teacherId :
    mode === 'parent' ? m.receiver_id === userId :
    mode === 'admin' ? true : false
  )).length;

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <SectionCard title="Messages" subtitle={mode === 'parent' ? 'Send messages to your child\'s teachers' : mode === 'teacher' ? `Inbox (${unreadCount} unread)` : 'All Messages'}
      action={mode === 'parent' ? <Button onClick={() => { setReplyTo(null); setForm({ subject: '', body: '' }); setModalOpen(true); }}><Send className="w-4 h-4" /> New Message</Button> : undefined}>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-neutral-400 py-8">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const isUnread = !msg.read_at && (
              mode === 'teacher' ? msg.receiver_id === teacherId :
              mode === 'parent' ? msg.receiver_id === userId :
              mode === 'admin' ? true : false
            );
            const isSent = mode === 'parent' || (mode === 'teacher' && msg.sender_id === teacherId);
            return (
              <div key={msg.id} className={`flex items-start justify-between p-4 rounded-lg ${isUnread ? 'bg-primary-50 border border-primary-200' : 'bg-neutral-50'}`}
                onClick={() => isUnread && markRead(msg.id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isUnread ? <Mail className="w-4 h-4 text-primary-600" /> : <MailOpen className="w-4 h-4 text-neutral-400" />}
                    <p className={`font-medium text-sm ${isUnread ? 'text-primary-900' : 'text-neutral-900'}`}>{msg.subject}</p>
                    {isUnread && <Badge variant="info">New</Badge>}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1 ml-6">{msg.body}</p>
                  <p className="text-xs text-neutral-400 mt-1 ml-6">
                    {isSent ? 'You' : (mode === 'admin' ? `User ${msg.sender_id}` : teacherName || 'Teacher')} · {new Date(msg.created_at).toLocaleString()}
                    {msg.read_at && <span className="ml-2">· Read {new Date(msg.read_at).toLocaleString()}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {(mode === 'teacher' && msg.receiver_id === teacherId) && (
                    <button onClick={() => handleReply(msg)} className="p-1.5 text-neutral-400 hover:text-primary-600 rounded-lg" title="Reply">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                  {mode === 'admin' && (
                    <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-neutral-400 hover:text-danger-600 rounded-lg" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setReplyTo(null); }} title={replyTo ? 'Reply to Message' : 'New Message'}>
        <div className="space-y-4">
          {mode === 'parent' && !replyTo && (
            <Select label="To Teacher" value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}
              options={[{ value: '', label: 'Select Teacher' }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]} />
          )}
          <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Message subject" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Type your message..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setModalOpen(false); setReplyTo(null); }}>Cancel</Button>
            <Button onClick={handleSend}><Send className="w-4 h-4" /> Send</Button>
          </div>
        </div>
      </Modal>
    </SectionCard>
  );
}
