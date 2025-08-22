import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '../services/api';
import { Task, TaskInterval, ScheduleEntry } from '../types';

interface TaskContextType {
  tasks: Task[];
  teamTasks: Task[];
  events: ScheduleEntry[];
  scheduleEntries: ScheduleEntry[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  generateSchedule: (userId: string) => void;
  splitTask: (taskId: string, intervals: number) => void;
  loadTasks: (userId?: string) => Promise<void>;
  loadSchedule: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<ScheduleEntry[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);

  const loadTasks = async (userId?: string) => {
    try {
      let fetchedTasks;
      if (userId) {
        // Backend should support filtering by createdBy or assignedTo
        fetchedTasks = await apiService.getTasksByUserOrAssigned(userId);
      } else {
        fetchedTasks = await apiService.getTasks();
      }
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  /**
   * Adds a new task, mapping frontend fields to backend expectations.
   * Allows assignment to current user or any team member.
   * @param taskData - Task data from form
   */
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'> & { assignedTo?: string; teamId?: string }) => {
    try {
      // Map frontend camelCase to backend snake_case
      const payload = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        estimatedDuration: taskData.estimatedDuration,
        priority: taskData.priority,
        status: taskData.status,
        assigned_to: taskData.assignedTo || taskData.createdBy,
        team_id: taskData.teamId || null,
        tags: taskData.tags || [],
      };
      const newTask = await apiService.createTask(payload);
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const updated = await apiService.updateTask(updatedTask.id, updatedTask);
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updated : task));
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setScheduleEntries(prev => prev.filter(entry => entry.taskId !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const splitTask = async (taskId: string, intervals: number) => {
    try {
      const taskIntervals = await apiService.splitTask(taskId, intervals);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, intervals: taskIntervals } : t
        ));
      }
    } catch (error) {
      console.error('Failed to split task:', error);
      throw error;
    }
  };

  const generateSchedule = async (userId: string) => {
  try {
    const { scheduleEntries, conflicts } = await apiService.generateSchedule(userId, []);
    setScheduleEntries(scheduleEntries);
    if (conflicts && conflicts.length > 0) {
      // handle conflicts if needed
      console.warn('Conflicts detected:', conflicts);
    }
  } catch (error) {
    console.error('Failed to generate schedule:', error);
    throw error;
  }
};


  const loadSchedule = async () => {
    try {
      const entries = await apiService.getSchedule();
      setScheduleEntries(entries);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      teamTasks,
      events,
      scheduleEntries,
      addTask,
      updateTask,
      deleteTask,
      generateSchedule,
      splitTask,
      loadTasks,
      loadSchedule,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};