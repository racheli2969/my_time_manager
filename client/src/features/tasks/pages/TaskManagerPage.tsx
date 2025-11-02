/**
 * Task Manager Page
 * Main container for task management with filters, sorting, and CRUD operations
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskCardItem } from '../components/TaskCardItem';
import { useTask } from '../../../core/contexts/TaskContext';
import { useUser } from '../../../core/contexts/UserContext';
import { useAuthRedirect } from '../../../hooks/useAuthRedirect';
import { AuthDialog } from '../../../components/AuthDialog';
import { Task } from '../../../types';

/**
 * Main task management page component
 * Handles task CRUD operations, filtering, and sorting
 */
export const TaskManagerPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTask();
  const { currentUser, users } = useUser();
  const { requireAuth, dialog } = useAuthRedirect();

  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'progress' | 'assigned'>('date');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const assignedMatch = assignedFilter === 'all' || task.assignedTo === assignedFilter;
    return statusMatch && assignedMatch;
  });

  /**
   * Handle creating a new task
   */
  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      await addTask({
        ...taskData,
        createdBy: currentUser?.id || ''
      });
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  /**
   * Handle updating an existing task
   */
  const handleEditTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!editingTask) return;
    
    try {
      await updateTask({
        ...editingTask,
        ...taskData
      });
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  /**
   * Open create form with auth check
   */
  const openCreateForm = () => {
    requireAuth(() => {
      setIsFormOpen(true);
      setEditingTask(null);
    }, 'You need to be signed in to create tasks. Would you like to login now?');
  };

  /**
   * Open edit form with auth check
   */
  const openEditForm = (task: Task) => {
    requireAuth(() => {
      setEditingTask(task);
      setIsFormOpen(true);
    }, 'You need to be signed in to edit tasks. Would you like to login now?');
  };

  /**
   * Handle deleting a task
   */
  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  /**
   * Handle updating task status
   */
  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      try {
        await updateTask({ ...taskToUpdate, status });
      } catch (error) {
        console.error('Failed to update task status:', error);
        alert('Failed to update task status. Please try again.');
      }
    }
  };

  /**
   * Close form modal
   */
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Auth Dialog */}
      {dialog && (
        <AuthDialog
          show={dialog.show}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-600 mt-1">Manage your tasks and stay organized</p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="progress">Sort by Progress</option>
            <option value="assigned">Sort by Assigned To</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Assigned Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Assignees</option>
            <option value={currentUser?.id || ''}>Assigned to Me</option>
            {users && users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>

          {/* Add Task Button */}
          <button
            onClick={openCreateForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          /* Empty State */
          <div className="col-span-full flex flex-col items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center justify-center bg-white/70 border-2 border-blue-100 rounded-2xl shadow-lg px-10 py-16 max-w-2xl mx-auto">
              <img src="/image.png" alt="No tasks" className="w-28 h-28 mb-8 opacity-70" />
              <h1 className="text-3xl font-bold text-blue-500 mb-3 text-center">No Tasks Created</h1>
              <p className="text-lg text-blue-900/80 text-center mb-6">
                Get started by creating a task to manage your workload and boost your productivity.
              </p>
              <button
                onClick={openCreateForm}
                className="mt-2 px-8 py-3 bg-blue-100 text-blue-700 text-lg rounded-xl shadow hover:bg-blue-200 transition-colors font-semibold border border-blue-200"
              >
                Create Your First Task
              </button>
            </div>
          </div>
        ) : (
          /* Task Cards */
          filteredTasks.map(task => (
            <TaskCardItem
              key={task.id}
              task={task}
              onEdit={openEditForm}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* Task Form Modal */}
      {isFormOpen && (
        <TaskFormModal
          task={editingTask}
          onSave={editingTask ? handleEditTask : handleAddTask}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default TaskManagerPage;
