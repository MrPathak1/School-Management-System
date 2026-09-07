import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeftCircle, ArrowRightCircle, Edit } from 'lucide-react';
import { SectionCard } from './ui/Card';
import { Badge, Button, Input, Select } from './ui/Table';
import { Modal } from './ui/Modal';
import { useToastStore } from '../hooks/useToast';
import { supabase, Book, BookBorrow, Subject } from '../lib/supabase';

interface Props {
  mode: 'admin' | 'teacher' | 'student';
  userId: string;
  borrowerId?: string;
  borrowerType?: 'student' | 'teacher';
}

export function LibraryPanel({ mode, userId, borrowerId, borrowerType }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrows, setBorrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({ title: '', author: '', isbn: '', publisher: '', quantity: 1, available: 1, subject_id: '' });

  useEffect(() => {
    fetchSubjects();
    fetchBooks();
    if (mode !== 'admin') fetchBorrows();
  }, []);

  const fetchSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').order('name');
    setSubjects(data || []);
  };

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*, subject:subjects(name)').order('title');
    setBooks(data || []);
    setLoading(false);
  };

  const fetchBorrows = async () => {
    const bid = borrowerId || userId;
    const { data } = await supabase.from('book_borrows').select('*, book:books(title, author)').eq('borrower_id', bid).order('borrowed_date', { ascending: false });
    setBorrows(data || []);
  };

  const openCreate = () => {
    setEditingBook(null);
    setForm({ title: '', author: '', isbn: '', publisher: '', quantity: 1, available: 1, subject_id: '' });
    setModalOpen(true);
  };

  const openEdit = (b: Book) => {
    setEditingBook(b);
    setForm({ title: b.title, author: b.author, isbn: b.isbn || '', publisher: b.publisher || '', quantity: b.quantity, available: b.available, subject_id: b.subject_id || '' });
    setModalOpen(true);
  };

  const handleSaveBook = async () => {
    if (!form.title || !form.author) { addToast({ type: 'error', title: 'Title and author required' }); return; }
    const payload = { title: form.title, author: form.author, isbn: form.isbn || null, publisher: form.publisher || null, quantity: form.quantity, available: editingBook ? Math.min(form.available, form.quantity) : form.quantity, subject_id: form.subject_id || null };
    if (editingBook) {
      await supabase.from('books').update(payload).eq('id', editingBook.id);
      addToast({ type: 'success', title: 'Book updated' });
    } else {
      await supabase.from('books').insert(payload);
      addToast({ type: 'success', title: 'Book added' });
    }
    setModalOpen(false);
    fetchBooks();
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Delete this book?')) return;
    await supabase.from('books').delete().eq('id', id);
    addToast({ type: 'success', title: 'Book deleted' });
    fetchBooks();
  };

  const handleBorrow = async (book: Book) => {
    if (book.available < 1) { addToast({ type: 'error', title: 'No copies available' }); return; }
    const due = new Date(); due.setDate(due.getDate() + 14);
    const { error } = await supabase.from('book_borrows').insert({
      book_id: book.id, borrower_id: borrowerId || userId, borrower_type: borrowerType || 'student',
      borrowed_date: new Date().toISOString().split('T')[0], due_date: due.toISOString().split('T')[0],
    });
    if (error) { addToast({ type: 'error', title: 'Failed to borrow' }); return; }
    const newAvailable = Math.max(0, book.available - 1);
    await supabase.from('books').update({ available: newAvailable }).eq('id', book.id);
    addToast({ type: 'success', title: `Borrowed "${book.title}"` });
    fetchBooks();
    fetchBorrows();
  };

  const handleReturn = async (borrow: any) => {
    await supabase.from('book_borrows').update({ returned_date: new Date().toISOString().split('T')[0], status: 'returned' }).eq('id', borrow.id);
    if (borrow.book) {
      await supabase.from('books').update({ available: (borrow.book.available || 0) + 1 }).eq('id', borrow.book_id);
    }
    addToast({ type: 'success', title: 'Book returned' });
    fetchBooks();
    fetchBorrows();
  };

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Library" subtitle={`${books.length} books in catalog`}
        action={mode === 'admin' ? <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Book</Button> : undefined}>
        <div className="flex gap-3 mb-4">
          <div className="flex-1"><Input placeholder="Search by title or author..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Book</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Available</th>
                {mode !== 'admin' && <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Action</th>}
                {mode === 'admin' && <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={mode === 'admin' ? 5 : 4} className="px-4 py-8 text-center text-neutral-400">No books found</td></tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3"><p className="font-medium text-neutral-900">{b.title}</p><p className="text-xs text-neutral-400">{b.isbn ? `ISBN: ${b.isbn}` : ''}</p></td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{b.author}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{(b as any).subject?.name || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={b.available > 0 ? 'success' : 'danger'}>{b.available}/{b.quantity}</Badge>
                    </td>
                    {mode !== 'admin' ? (
                      <td className="px-4 py-3 text-center">
                        <Button onClick={() => handleBorrow(b)} disabled={b.available < 1}><ArrowRightCircle className="w-4 h-4" /> Borrow</Button>
                      </td>
                    ) : (
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openEdit(b)} className="p-1.5 text-neutral-400 hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteBook(b.id)} className="p-1.5 text-neutral-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {mode !== 'admin' && (
        <SectionCard title="My Borrowed Books" subtitle={`${borrows.length} books`}>
          <div className="space-y-3">
            {borrows.length === 0 ? <p className="text-center text-neutral-400 py-4">No books borrowed</p> : (
              borrows.map((br) => {
                const overdue = br.status === 'active' && new Date(br.due_date) < new Date();
                return (
                  <div key={br.id} className={`flex items-center justify-between p-4 rounded-lg ${overdue ? 'bg-danger-50 border border-danger-200' : 'bg-neutral-50'}`}>
                    <div>
                      <p className="font-medium text-neutral-900">{br.book?.title || 'Unknown'}</p>
                      <p className="text-sm text-neutral-500">{br.book?.author} · Borrowed {new Date(br.borrowed_date).toLocaleDateString()}</p>
                      <p className={`text-xs ${overdue ? 'text-danger-600' : 'text-neutral-400'}`}>
                        Due: {new Date(br.due_date).toLocaleDateString()}{overdue ? ' (OVERDUE)' : ''}
                      </p>
                    </div>
                    {br.status === 'active' && (
                      <Button onClick={() => handleReturn(br)} variant="secondary"><ArrowLeftCircle className="w-4 h-4" /> Return</Button>
                    )}
                    {br.status === 'returned' && <Badge variant="success">Returned {new Date(br.returned_date).toLocaleDateString()}</Badge>}
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      )}

      {/* Admin borrow history */}
      {mode === 'admin' && (
        <SectionCard title="All Borrowings" subtitle="Library transaction history">
          <BorrowHistoryTable />
        </SectionCard>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingBook ? 'Edit Book' : 'Add Book'}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="ISBN (optional)" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
            <Input label="Publisher (optional)" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
            {editingBook && <Input label="Available" type="number" value={form.available} onChange={(e) => setForm({ ...form, available: parseInt(e.target.value) || 0 })} />}
          </div>
          <Select label="Subject (optional)" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            options={[{ value: '', label: 'None' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBook}>{editingBook ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function BorrowHistoryTable() {
  const [borrows, setBorrows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('book_borrows').select('*, book:books(title, author)').order('borrowed_date', { ascending: false }).limit(100).then(({ data }) => setBorrows(data || []));
  }, []);
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Book</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Borrower</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Borrowed</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Due</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {borrows.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No transactions</td></tr> : (
            borrows.map((br) => {
              const overdue = br.status === 'active' && new Date(br.due_date) < new Date();
              return (
                <tr key={br.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm text-neutral-900">{br.book?.title}</td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{br.borrower_id?.slice(0, 8)}... ({br.borrower_type})</td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{new Date(br.borrowed_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{new Date(br.due_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={br.status === 'returned' ? 'success' : overdue ? 'danger' : 'info'}>{br.status}{overdue ? ' (overdue)' : ''}</Badge>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
