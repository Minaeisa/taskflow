'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, activeWorkspace, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try { await authApi.logout(); } catch {}
    logout();
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and workspace</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">Member since {user ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</p>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Workspace</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-medium text-gray-900">{activeWorkspace?.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">Members</span>
            <span className="text-sm font-medium text-gray-900">{activeWorkspace?.members.length || 0}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Your role</span>
            <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold capitalize">
              {activeWorkspace?.members.find(m => m.user._id === user?._id)?.role || 'member'}
            </span>
          </div>
        </div>
      </div>

      {/* Members */}
      {activeWorkspace && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Team Members</h2>
          <div className="space-y-3">
            {activeWorkspace.members.map(({ user: m, role }) => (
              <div key={m._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                    {getInitials(m.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">{role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
        <h2 className="font-semibold text-red-600 mb-4">Account</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Sign out</p>
            <p className="text-xs text-muted-foreground">Log out of your account on this device</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}
