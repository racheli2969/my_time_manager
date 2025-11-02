import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { useTask } from '../core/contexts/TaskContext';
import { useUser } from '../core/contexts/UserContext';
import { Task } from '../types';

interface TaskManagerProps {
  onAction: (action: () => void) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ onAction }) => {
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'progress' | 'assigned'>('date');
  const { tasks, addTask, updateTask, deleteTask } = useTask();
  const { currentUser, users } = useUser();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | string>('all');

  const filteredTasks = tasks.filter(task => {
    let statusMatch = filter === 'all' || task.status === filter;
    let assignedMatch = assignedFilter === 'all' || task.assignedTo === assignedFilter;
    return statusMatch && assignedMatch;
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-600 mt-1">Manage your tasks and stay organized</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date" onSelect={() => setSortBy('date')}>Sort by Date</option>
            <option value="status" onSelect={() => setSortBy('status')}>Sort by Status</option>
            <option value="progress" onSelect={() => setSortBy('progress')}>Sort by Progress</option>
            <option value="assigned" onSelect={() => setSortBy('assigned')}>Sort by Assigned To</option>
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={assignedFilter}
            onChange={e => setAssignedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Assignees</option>
            <option value={currentUser?.id || ''}>Assigned to Me</option>
            {users && users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <button
            onClick={() => onAction(() => setShowTaskForm(true))}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
            <div className="flex flex-col items-center justify-center bg-white/70 border-2 border-blue-100 rounded-2xl shadow-lg px-10 py-16 max-w-2xl mx-auto">
              <img src="/image.png" alt="No tasks" className="w-28 h-28 mb-8 opacity-70" />
              <h1 className="text-3xl font-bold text-blue-500 mb-3 text-center">No Tasks Created</h1>
              <p className="text-lg text-blue-900/80 text-center mb-6">Get started by creating a task to manage your workload and boost your productivity.</p>
              <button
                onClick={() => onAction(() => setShowTaskForm(true))}
                className="mt-2 px-8 py-3 bg-blue-100 text-blue-700 text-lg rounded-xl shadow hover:bg-blue-200 transition-colors font-semibold border border-blue-200"
              >
                Create Your First Task
              </button>
            </div>
          </div>
        ) : (
          [...filteredTasks].sort((a, b) => {
            if (sortBy === 'date') {
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            } else if (sortBy === 'status') {
              return a.status.localeCompare(b.status);
            } else if (sortBy === 'progress') {
              // Example: completed first, then in-progress, then todo
              const order = { completed: 0, 'in-progress': 1, todo: 2 };
              return (order[a.status] ?? 3) - (order[b.status] ?? 3);
            } else if (sortBy === 'assigned') {
              return (a.assignedTo || '').localeCompare(b.assignedTo || '');
            }
            return 0;
          }).map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(task) => onAction(() => handleEditTask(task))}
              onDelete={(taskId) => onAction(() => deleteTask(taskId))}
              onStatusChange={(taskId, newStatus) => {
                onAction(() => {
                  const t = tasks.find(t => t.id === taskId);
                  if (t) {
                    updateTask({ ...t, status: newStatus });
                  }
                });
              }}
            />
          ))
        )}
      </div>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSave={(taskData) => {
            onAction(() => {
              if (editingTask) {
                updateTask({ ...editingTask, ...taskData });
              } else {
                // Use currentUser from context, or fallback to localStorage
                let userId = currentUser?.id;
                if (!userId && typeof window !== 'undefined') {
                  userId = window.localStorage.getItem('currentUserId') || undefined;
                }
                addTask({ ...taskData, createdBy: userId || '' });
              }
              handleCloseForm();
            });
          }}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};