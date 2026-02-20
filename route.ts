/**
 * PATCH /api/notes/[id] - update note
 * DELETE /api/notes/[id] - delete note
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, apiError, apiSuccess } from '@/lib/api';
import { sanitizeTitle, sanitizeContent } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const note = await prisma.note.findFirst({ where: { id, userId: user.userId } });
  if (!note) return notFound('Заметка не найдена');

  try {
    const body = await request.json().catch(() => ({}));
    const data: { title?: string | null; content?: string } = {};
    if (body.title !== undefined) data.title = body.title ? sanitizeTitle(body.title) : null;
    if (typeof body.content === 'string') data.content = sanitizeContent(body.content);

    const updated = await prisma.note.update({ where: { id }, data });
    await logActivity(user.userId, 'note_updated', id, {});
    return apiSuccess(updated);
  } catch (e) {
    logger.error('Update note error', { err: e });
    return apiError('Не удалось обновить заметку', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const note = await prisma.note.findFirst({ where: { id, userId: user.userId } });
  if (!note) return notFound('Заметка не найдена');

  await prisma.note.delete({ where: { id } });
  await logActivity(user.userId, 'note_deleted', id, {});
  return apiSuccess({ ok: true });
}
