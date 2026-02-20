/**
 * Shared constants for priorities, statuses, categories.
 */

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const GOAL_STATUSES = ['active', 'completed', 'paused'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const FINANCE_TYPES = ['income', 'expense'] as const;
export type FinanceType = (typeof FINANCE_TYPES)[number];

export const FINANCE_CATEGORIES = [
  'Еда',
  'Транспорт',
  'Жильё',
  'Развлечения',
  'Здоровье',
  'Одежда',
  'Другое',
] as const;

/** Activity log action types for analytics */
export const ACTIVITY_ACTIONS = [
  'task_created',
  'task_completed',
  'task_deleted',
  'goal_created',
  'goal_updated',
  'goal_deleted',
  'habit_created',
  'habit_logged',
  'habit_deleted',
  'finance_created',
  'finance_deleted',
  'note_created',
  'note_updated',
  'note_deleted',
  'settings_updated',
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];
