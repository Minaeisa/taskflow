'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Settings, LogOut, Plus, ChevronDown } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects',   label: 'Projects',  icon: FolderKanban },
  { href: '/settings',   label: 'Settings',  icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeWorkspace, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-950 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-white text-sm">TaskFlow</p>
          <p className="text-gray-400 text-xs truncate max-w-[140px]">{activeWorkspace?.name}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800',
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition p-1 rounded-lg hover:bg-gray-800"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
