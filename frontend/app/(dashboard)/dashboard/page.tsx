'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, CheckCircle2, Clock, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { workspacesApi, projectsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Project, Workspace } from '@/types';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Stats { totalProjects: number; totalMembers: number }

export default function DashboardPage() {
  const { user, activeWorkspace, setActiveWorkspace } = useAuthStore();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const wsRes = await workspacesApi.list();
      const wsList: Workspace[] = wsRes.data.data;
      setWorkspaces(wsList);

      let ws = activeWorkspace;
      if (!ws && wsList.length > 0) {
        ws = wsList[0];
        setActiveWorkspace(ws);
      }

      if (ws) {
        const pRes = await projectsApi.list(ws._id);
        setProjects(pRes.data.data);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Active', value: projects.filter(p => !p.archived).length, icon: CheckCircle2, color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Team Members', value: activeWorkspace?.members.length || 0, icon: Clock, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Workspaces', value: workspaces.length, icon: AlertCircle, color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeWorkspace ? `${activeWorkspace.name} • ` : ''}{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.text}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-muted-foreground text-sm mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Projects</h2>
          <Link href="/projects" className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">No projects yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first project to get started</p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(project.createdAt)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">{project.name}</h3>
                {project.description && (
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-1 mt-3">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
                  <span className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition font-medium">Open board</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
