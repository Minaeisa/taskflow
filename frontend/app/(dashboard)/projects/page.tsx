'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Trash2, X } from 'lucide-react';
import { projectsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Project } from '@/types';
import { timeAgo, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6'];

export default function ProjectsPage() {
  const { activeWorkspace } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });

  useEffect(() => {
    if (activeWorkspace) loadProjects();
  }, [activeWorkspace]);

  const loadProjects = async () => {
    try {
      const res = await projectsApi.list(activeWorkspace!._id);
      setProjects(res.data.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await projectsApi.create({ ...form, workspaceId: activeWorkspace!._id });
      setProjects([res.data.data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', color: COLORS[0] });
      toast.success('Project created!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setCreating(false); }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Delete this project?')) return;
    try {
      await projectsApi.delete(id);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} in {activeWorkspace?.name}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-44 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <FolderKanban className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 text-lg mb-1">No projects yet</h3>
          <p className="text-muted-foreground text-sm mb-5">Create your first project and start organizing tasks</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group relative"
            >
              <button
                onClick={(e) => deleteProject(project._id, e)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xl font-bold mb-4"
                style={{ backgroundColor: project.color }}
              >
                {project.name[0].toUpperCase()}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">{project.name}</h3>
              {project.description && (
                <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <span className="text-xs text-muted-foreground">{timeAgo(project.createdAt)}</span>
                <span className="text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition">Open →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">New Project</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={cn('w-7 h-7 rounded-full transition-transform', form.color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110')}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
