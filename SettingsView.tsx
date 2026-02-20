'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

export function SettingsView() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [loadingDelete, setLoadingDelete] = useState(false);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Укажите имя');
      return;
    }
    setLoadingProfile(true);
    const result = await apiFetch<{ user: { id: string; email: string; name: string } }>(
      '/api/settings',
      { method: 'PATCH', body: JSON.stringify({ name: name.trim() }), parseJson: true }
    );
    setLoadingProfile(false);
    if (result.ok) {
      setUser(result.data.user);
      toast.success('Имя обновлено');
    } else {
      toast.error(getErrorMessage(result));
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Новый пароль не менее 6 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    setLoadingPassword(true);
    const result = await apiFetch<{ user: unknown }>(
      '/api/settings',
      {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        parseJson: true,
      }
    );
    setLoadingPassword(false);
    if (result.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Пароль изменён');
    } else {
      toast.error(getErrorMessage(result));
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'удалить') {
      toast.error('Введите «удалить» для подтверждения');
      return;
    }
    if (!deletePassword) {
      toast.error('Введите пароль для подтверждения');
      return;
    }
    setLoadingDelete(true);
    const result = await apiFetch<{ deleted: boolean }>(
      '/api/settings',
      {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
        parseJson: true,
      }
    );
    setLoadingDelete(false);
    if (result.ok) {
      window.location.href = '/';
    } else {
      toast.error(getErrorMessage(result));
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Настройки
      </h1>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Профиль
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleUpdateProfile} className="space-y-3 max-w-md">
            <Input
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
            />
            <Button type="submit" loading={loadingProfile}>
              Сохранить имя
            </Button>
          </form>
          {user?.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Email: {user.email}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Сменить пароль
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
            <Input
              type="password"
              label="Текущий пароль"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              type="password"
              label="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Не менее 6 символов"
            />
            <Input
              type="password"
              label="Подтвердите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button type="submit" loading={loadingPassword}>
              Сменить пароль
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900/50 hover:shadow-md transition-shadow">
        <CardHeader>
          <h2 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Удаление аккаунта
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Все ваши данные (задачи, цели, привычки, финансы, заметки) будут удалены безвозвратно.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            label="Введите «удалить» для подтверждения"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="удалить"
            className="max-w-xs"
          />
          <Input
            type="password"
            label="Ваш пароль"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Пароль для подтверждения"
            className="max-w-xs"
          />
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            loading={loadingDelete}
            disabled={deleteConfirm !== 'удалить' || !deletePassword}
          >
            Удалить аккаунт
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
