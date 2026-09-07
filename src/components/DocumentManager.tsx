import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Trash2, File, Image } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Badge, Button, Input, Select } from './ui/Table';
import { useToastStore } from '../hooks/useToast';
import { supabase, Document } from '../lib/supabase';

interface Props {
  userId: string;
  studentId?: string;
  category?: string;
}

export function DocumentManager({ userId, studentId, category }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [docCategory, setDocCategory] = useState('other');
  const [description, setDescription] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    let query = supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (studentId) query = query.eq('student_id', studentId);
    if (category) query = query.eq('category', category);
    const { data } = await query;
    setDocs(data || []);
    setLoading(false);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !title) {
      addToast({ type: 'error', title: 'Select a file and enter a title' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from('documents').upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);

      await supabase.from('documents').insert({
        user_id: userId,
        student_id: studentId || null,
        title,
        description,
        file_url: urlData.publicUrl,
        file_type: file.type || ext || 'unknown',
        file_size: file.size,
        category: docCategory as any,
      });

      addToast({ type: 'success', title: 'Document uploaded' });
      setTitle('');
      setDescription('');
      if (fileRef.current) fileRef.current.value = '';
      fetchDocs();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await supabase.from('documents').delete().eq('id', id);
    addToast({ type: 'success', title: 'Document deleted' });
    fetchDocs();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-primary-600" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-danger-600" />;
    return <File className="w-5 h-5 text-neutral-600" />;
  };

  const categoryLabels: Record<string, string> = {
    report_card: 'Report Card',
    certificate: 'Certificate',
    assignment: 'Assignment',
    other: 'Other',
  };

  return (
    <SectionCard title="Documents" subtitle="Upload and manage your files">
      <div className="mb-6 p-4 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
          <Select label="Category" value={docCategory} onChange={(e) => setDocCategory(e.target.value)}
            options={[
              { value: 'report_card', label: 'Report Card' },
              { value: 'certificate', label: 'Certificate' },
              { value: 'assignment', label: 'Assignment' },
              { value: 'other', label: 'Other' },
            ]} />
          <div className="md:col-span-2">
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="md:col-span-2">
            <input ref={fileRef} type="file" className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleUpload} loading={uploading} icon={<Upload className="w-4 h-4" />}>
            Upload Document
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : docs.length === 0 ? (
        <p className="text-center text-neutral-400 py-8">No documents uploaded yet</p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(doc.file_type)}
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{formatSize(doc.file_size)}</span>
                    <Badge variant="info">{categoryLabels[doc.category] || doc.category}</Badge>
                    {doc.description && <span className="truncate max-w-[200px]">{doc.description}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => handleDelete(doc.id)}
                  className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
