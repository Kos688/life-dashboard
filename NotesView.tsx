'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StickyNote, Trash2, Save } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';
import { formatDate } from '@/lib/utils';

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function fetchNotes() {
    try {
      const res = await fetch('/api/notes', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setNotes(data);
    } catch {
      toast.error('Не удалось загрузить заметки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  const selectedNote = notes.find((n) => n.id === selectedId);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title.trim() || undefined, content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка');
      }
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setTitle('');
      setContent('');
      setSelectedId(note.id);
      toast.success('Заметка создана');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка создания');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!editingId || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/notes/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === editingId ? updated : n)));
      setEditingId(null);
      toast.success('Заметка сохранена');
    } catch {
      toast.error('Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setTitle(note.title || '');
    setContent(note.content);
    setSelectedId(note.id);
  }

  function cancelEdit() {
    setEditingId(null);
    if (selectedNote) {
      setTitle(selectedNote.title || '');
      setContent(selectedNote.content);
    }
  }

  async function deleteNote(id: string) {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) {
        setSelectedId(notes[0]?.id ?? null);
        setTitle('');
        setContent('');
        setEditingId(null);
      }
      toast.success('Заметка удалена');
    } catch {
      toast.error('Ошибка удаления');
    }
  }

  useEffect(() => {
    if (!selectedId) {
      setTitle('');
      setContent('');
      return;
    }
    const note = notes.find((n) => n.id === selectedId);
    if (note && !editingId) {
      setTitle(note.title || '');
      setContent(note.content);
    }
  }, [selectedId, editingId, notes]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <SkeletonList rows={6} />
          <Skeleton className="h-96 col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Заметки
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Список
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {notes.length}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {notes.length === 0 ? (
              <EmptyState
                title="Нет заметок"
                description="Создайте первую заметку справа"
                icon={<StickyNote className="w-6 h-6" />}
              />
            ) : (
              <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {notes.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(note.id);
                        setEditingId(null);
                        setTitle(note.title || '');
                        setContent(note.content);
                      }}
                      className={cn(
                        'w-full text-left px-5 py-3 hover:bg-surface-muted/50 transition',
                        selectedId === note.id && 'bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]'
                      )}
                    >
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {note.title || 'Без названия'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {formatDate(note.updatedAt)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Редактирование' : selectedNote ? 'Просмотр' : 'Новая заметка'}
              </h2>
              {editingId && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    Отмена
                  </Button>
                  <Button size="sm" onClick={handleUpdate} loading={submitting}>
                    <Save className="w-4 h-4 mr-1" />
                    Сохранить
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedNote && !editingId ? (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedNote.title || 'Без названия'}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(selectedNote)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(selectedNote.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedNote.content}
                  </p>
                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Обновлено: {formatDate(selectedNote.updatedAt)}
                  </p>
                </div>
              ) : (
                <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(); } : handleCreate} className="space-y-4">
                  <Input
                    placeholder="Заголовок (необяз.)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Текст заметки..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--surface)] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y min-h-[200px]"
                    required
                  />
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={!content.trim()}
                  >
                    {editingId ? 'Сохранить' : 'Создать заметку'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
