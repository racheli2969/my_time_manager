import React, { useState, useEffect } from 'react';
import { LOCAL_STORAGE_CURRENT_USER_ID } from '../utils/constants';
import { X } from 'lucide-react';
import { Task } from '../types';
import { useUser } from '../contexts/UserContext';
import { useTeam } from '../contexts/TeamContext';

interface TaskFormProps {
  task?: Task | null;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const { users } = useUser();
  // Ensure currentUserId is set in localStorage before rendering
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let currentUserId = window.localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_ID);
      if (!currentUserId) {
        if (users && users.length > 0) {
          currentUserId = users[0].id;
          window.localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_ID, users[0].id);
        }
      }
      setFormData(prev => ({ ...prev, assignedTo: currentUserId || '' }));
    }
  }, [users]);
  const { teams } = useTeam();
  // State for form fields
  // Default dueDate to today
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: todayStr,
    estimatedDuration: 60,
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    assignedTo: '',
    teamId: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate).toISOString().split('T')[0],
        estimatedDuration: task.estimatedDuration,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo || '',
        teamId: task.teamId || '',
        tags: task.tags || []
      });
    } else {
      // On create, default assignedTo to current user
      if (users && users.length > 0) {
        setFormData(f => ({ ...f, assignedTo: users[0].id }));
      }
    }
  }, [task, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let assignedTo = formData.assignedTo;
    if (!assignedTo && typeof window !== 'undefined') {
      assignedTo = window.localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_ID) || '';
    }
    // Validate assignedTo and createdBy
    const validUserIds = users.map(u => u.id);
    if (!assignedTo || !validUserIds.includes(assignedTo)) {
      alert('Cannot create task: Assigned user does not exist.');
      return;
    }
    // Log payload for debugging
    console.log('Creating task with:', {
      ...formData,
      dueDate: new Date(formData.dueDate),
      assignedTo,
      teamId: formData.teamId || undefined
    });
    onSave({
      ...formData,
      dueDate: new Date(formData.dueDate),
      assignedTo,
      teamId: formData.teamId || undefined,
      start: new Date() // Assuming `start` is the current date/time. Adjust as needed.
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes) <span className="text-red-500">*</span></label>
            <input
              type="number"
              required
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter estimated duration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!users || users.length === 0}
            >
              {!users || users.length === 0 ? (
                <option value="" disabled>Loading users...</option>
              ) : (
                <>
                  {formData.teamId
                    ? (() => {
                      // If team selected, show all team members
                      const selectedTeam = teams.find(t => t.id === formData.teamId);
                      if (!selectedTeam) return null;
                      return users.filter(u => selectedTeam.members.includes(u.id)).map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ));
                    })()
                    : (() => {
                      // Only current user
                      const currentUserId = typeof window !== 'undefined' ? window.localStorage.getItem('currentUserId') || '' : '';
                      const me = users.find(u => u.id === currentUserId);
                      return me ? <option value={me.id}>{me.name} (Me)</option> : null;
                    })()}
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value, assignedTo: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Team</option>
              {(() => {
                const currentUserId = typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_ID) || '' : '';
                return teams
                  .filter(team => team.adminId === currentUserId || team.members.includes(currentUserId))
                  .map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ));
              })()}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}