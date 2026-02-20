/**
 * Shared types for API and UI
 */

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
  habitId: string;
}

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  logs: HabitLog[];
}

export interface Finance {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  tasks: { total: number; completed: number };
  goals: { total: number; active: number; completed: number; avgProgress: number };
  habits: { total: number; streaks: { habitId: string; name: string; streak: number }[] };
  finance: {
    balance: number;
    income: number;
    expense: number;
    byCategory: { name: string; value: number }[];
  };
  activity: { date: string; tasks: number; habits: number; total: number }[];
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  action: string;
  entityId: string | null;
  meta: string | null;
  createdAt: string;
}

export interface AnalyticsData {
  days: number;
  taskTrend: { date: string; count: number }[];
  habitTrend: { date: string; count: number }[];
  incomeTrend: { date: string; amount: number }[];
  expenseTrend: { date: string; amount: number }[];
  actionCounts: Record<string, number>;
  summary: {
    tasksTotal: number;
    tasksCompleted: number;
    goalsTotal: number;
    habitsTotal: number;
    activityTotal: number;
  };
}
