'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Calendar, Tag, AlertCircle } from 'lucide-react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { projectsApi, tasksApi } from '@/lib/api';
import { Project, Task, KanbanBoard, TaskStatus } from '@/types';
import { cn, PRIORITY_CONFIG, STATUS_CONFIG, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo',        label: 'To Do',       color: 'bg-gray-100 text-gray-600' },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-blue-100 text-blue-600' },
  { id: 'in_review',   label: 'In Review',    color: 'bg-purple-100 text-purple-600' },
  { id: 'done',        label: 'Done',         color: 'bg-green-100 text-green-600' },
];

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const p = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-4 shadow-sm cursor-pointer',
        'hover:shadow-md hover:border-indigo-100 transition-all group',
        isDragging && 'opacity-50 shadow-lg rotate-2',
      )}
    >
      <div className="flex items-start justify-between mb-2.5">
        <h4 className="font-medium text-gray-900 text-sm leading-snug flex-1 pr-2">{task.title}</h4>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', p.bg, p.color)}>
          {p.label}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
          {task.tags.length > 2 && <span className="text-xs text-muted-foreground">+{task.tags.length - 2}</span>}
        </div>
      )}

      <div className="flex items-center justify-between">
        {task.dueDate ? (
          <span className={cn('text-xs flex items-center gap-1', isOverdue ? 'text-red-500' : 'text-muted-foreground')}>
            <Calendar className="w-3 h-3" />
            {formatDate(task.dueDate)}
          </span>
        ) : <span />}

        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
            {task.assignee.name[0].toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  column, tasks, onAddTask,
  onTaskClick,
}: {
  column: (typeof COLUMNS)[0];
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', column.color)}>
            {column.label}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5 min-h-32">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [board, setBoard] = useState<KanbanBoard>({ todo: [], in_progress: [], in_review: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' });
  const [creating, setCreating] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    loadBoard();
  }, [id]);

  const loadBoard = async () => {
    try {
      const [pRes, tRes] = await Promise.all([projectsApi.get(id), tasksApi.list(id)]);
      setProject(pRes.data.data);
      setBoard(tRes.data.data);
    } catch { toast.error('Failed to load board'); }
    finally { setLoading(false); }
  };

  const openCreate = (status: TaskStatus) => {
    setDefaultStatus(status);
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' });
    setShowCreate(true);
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await tasksApi.create({
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        status: defaultStatus,
        projectId: id,
        dueDate: taskForm.dueDate || undefined,
        tags: taskForm.tags ? taskForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      const newTask: Task = res.data.data;
      setBoard(b => ({ ...b, [defaultStatus]: [...b[defaultStatus], newTask] }));
      setShowCreate(false);
      toast.success('Task created!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally { setCreating(false); }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const allTasks = Object.values(board).flat();
    const task = allTasks.find(t => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const allTasks = Object.values(board).flat();
    const draggedTask = allTasks.find(t => t._id === active.id);
    if (!draggedTask) return;

    let targetStatus: TaskStatus | null = null;
    for (const col of COLUMNS) {
      if (board[col.id].some(t => t._id === over.id)) {
        targetStatus = col.id;
        break;
      }
      if (col.id === over.id) { targetStatus = col.id; break; }
    }

    if (!targetStatus || targetStatus === draggedTask.status) return;

    const prevBoard = { ...board };
    const fromCol = draggedTask.status as keyof KanbanBoard;
    const toCol = targetStatus as keyof KanbanBoard;
    setBoard(b => {
      const src = b[fromCol].filter(t => t._id !== draggedTask._id);
      const dst = [...b[toCol], { ...draggedTask, status: toCol }];
      return { ...b, [fromCol]: src, [toCol]: dst };
    });

    try {
      await tasksApi.update(draggedTask._id, { status: targetStatus });
    } catch {
      setBoard(prevBoard);
      toast.error('Failed to move task');
    }
  };

  const updateTaskStatus = async (task: Task, status: TaskStatus) => {
    setBoard(b => {
      const fromCol = task.status as keyof KanbanBoard;
      const toCol = status as keyof KanbanBoard;
      const src = b[fromCol].filter(t => t._id !== task._id);
      return { ...b, [fromCol]: src, [toCol]: [...b[toCol], { ...task, status }] };
    });
    setSelectedTask(null);
    await tasksApi.update(task._id, { status });
  };

  const deleteTask = async (task: Task) => {
    if (!confirm('Delete this task?')) return;
    await tasksApi.delete(task._id);
    setBoard(b => ({ ...b, [task.status]: b[task.status].filter(t => t._id !== task._id) }));
    setSelectedTask(null);
    toast.success('Task deleted');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalTasks = Object.values(board).flat().length;
  const doneTasks = board.done.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects" className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: project?.color }}
          >
            {project?.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
            {project?.description && <p className="text-muted-foreground text-sm">{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalTasks > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.round((doneTasks / totalTasks) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{Math.round((doneTasks / totalTasks) * 100)}%</span>
            </div>
          )}
          <button
            onClick={() => openCreate('todo')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="w-72 flex-shrink-0">
              <KanbanColumn
                column={col}
                tasks={board[col.id]}
                onAddTask={openCreate}
                onTaskClick={setSelectedTask}
              />
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} onClick={() => {}} />}
        </DragOverlay>
      </DndContext>

      {/* Create Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Task</h2>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_CONFIG[defaultStatus].color)}>
                  {STATUS_CONFIG[defaultStatus].label}
                </span>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={createTask} className="space-y-4">
              <input
                required autoFocus
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Task title..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <textarea
                value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Description (optional)"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Due date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags (comma-separated)</label>
                <input
                  value={taskForm.tags}
                  onChange={e => setTaskForm({ ...taskForm, tags: e.target.value })}
                  placeholder="design, backend, urgent"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedTask.title}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', STATUS_CONFIG[selectedTask.status].color)}>
                    {STATUS_CONFIG[selectedTask.status].label}
                  </span>
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', PRIORITY_CONFIG[selectedTask.priority].bg, PRIORITY_CONFIG[selectedTask.priority].color)}>
                    {PRIORITY_CONFIG[selectedTask.priority].label}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {selectedTask.description && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{selectedTask.description}</p>
            )}

            <div className="space-y-3 text-sm">
              {selectedTask.dueDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Due {formatDate(selectedTask.dueDate)}</span>
                </div>
              )}
              {selectedTask.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tags.map(t => (
                      <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">#{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Move to</p>
              <div className="flex flex-wrap gap-2">
                {COLUMNS.filter(c => c.id !== selectedTask.status).map(c => (
                  <button
                    key={c.id}
                    onClick={() => updateTaskStatus(selectedTask, c.id)}
                    className={cn('text-xs px-3 py-1.5 rounded-lg font-medium transition', c.color, 'hover:opacity-80')}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => deleteTask(selectedTask)}
                className="flex-1 py-2 rounded-xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition"
              >
                Delete
              </button>
              <button onClick={() => setSelectedTask(null)} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
