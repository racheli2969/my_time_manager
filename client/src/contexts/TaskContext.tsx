import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Task, ScheduleEntry } from '../types';

type TaskContextType = {
  tasks: Task[];
  teamTasks: Task[];
  events: ScheduleEntry[];
  scheduleEntries: ScheduleEntry[];
  conflicts: any[];
  personalEvents: any[];
  scheduleStats: any;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  generateSchedule: (userId: string, options?: any) => Promise<void>;
  splitTask: (taskId: string, intervals: number) => void;
  updateScheduleEntry: (entryId: string, updates: any) => Promise<void>;
  loadTasks: (userId?: string, page?: number, pageSize?: number, append?: boolean) => Promise<void>;
  loadMoreTasks: (userId?: string) => Promise<void>;
  hasMoreTasks: boolean;
  resetTaskPaging: () => void;
  loadSchedule: () => Promise<void>;
  loadConflicts: () => Promise<void>;
  resolveConflict: (conflictId: string, action: string) => Promise<void>;
  addPersonalEvent: (event: any) => Promise<void>;
  loadPersonalEvents: () => Promise<void>;
  deletePersonalEvent: (eventId: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskPage, setTaskPage] = useState(1);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const pageSize = 6;
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<ScheduleEntry[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [personalEvents, setPersonalEvents] = useState<any[]>([]);
  const [scheduleStats, setScheduleStats] = useState<any>(null);

  /**
   * Loads tasks from the backend with paging support.
   * @param userId - user to filter by
   * @param page - page number (1-based)
   * @param pageSize - number of tasks per page
   * @param append - if true, append to current tasks; else, replace
   */
  const loadTasks = useCallback(async (userId?: string, page: number = 1, pageSizeParam: number = pageSize, append: boolean = false) => {
    try {
      let fetchedTasks;
      if (userId) {
        fetchedTasks = await apiService.getTasksByUserOrAssigned(userId, page, pageSizeParam);
      } else {
        fetchedTasks = await apiService.getTasks(page, pageSizeParam);
      }
      if (Array.isArray(fetchedTasks)) {
        if (append) {
          setTasks(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const newTasks = fetchedTasks.filter(t => !existingIds.has(t.id));
            const combined = [...prev, ...newTasks];
            console.log('[TaskContext] setTasks (append):', combined.length, 'prev:', prev.length, 'new:', newTasks.length);
            return combined;
          });
          // Only update page if we successfully appended new tasks
          if (fetchedTasks.length > 0) {
            setTaskPage(page);
          }
        } else {
          console.log('[TaskContext] setTasks (replace):', fetchedTasks.length);
          setTasks(fetchedTasks);
          setTaskPage(page);
        }
        // Set hasMoreTasks to false if we got fewer tasks than requested (indicating we're at the end)
        setHasMoreTasks(fetchedTasks.length === pageSizeParam);
      } else {
        setHasMoreTasks(false);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setHasMoreTasks(false);
    }
  }, [pageSize]);

  /**
   * Loads the next page of tasks and appends them.
   */
  const loadMoreTasks = useCallback(async (userId?: string) => {
    if (!hasMoreTasks) return; // Don't load if we know there are no more tasks
    
    const nextPage = taskPage + 1;
    console.log('[TaskContext] Loading page:', nextPage, 'current page:', taskPage);
    await loadTasks(userId, nextPage, pageSize, true);
  }, [hasMoreTasks, taskPage, pageSize, loadTasks]);

  /**
   * Resets paging state and tasks (e.g. on logout or user change)
   */
  const resetTaskPaging = useCallback(() => {
    setTaskPage(1);
    setHasMoreTasks(true);
    setTasks([]);
  }, []);

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
        dueDate: taskData.dueDate instanceof Date ? taskData.dueDate.toISOString() : taskData.dueDate,
        estimatedDuration: taskData.estimatedDuration,
        priority: taskData.priority,
        status: taskData.status,
        assigned_to: taskData.assignedTo || taskData.createdBy,
        team_id: taskData.teamId || null,
        tags: taskData.tags || [],
      };
      const newTask = await apiService.createTask(payload);
      setTasks(prev => {
        // Avoid duplicate if already present
        if (prev.some(t => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
      // Reset hasMoreTasks to true since we added a new task
      // This ensures the "Load More" button appears if needed
      setHasMoreTasks(true);
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

  const generateSchedule = async (userId: string, options: any = {}) => {
    try {
      const result = await apiService.generateSchedule(userId, options);
      setScheduleEntries(result.scheduleEntries || []);
      setConflicts(result.conflicts || []);
      setScheduleStats(result.stats || null);
      
      if (result.conflicts && result.conflicts.length > 0) {
        console.warn('Conflicts detected:', result.conflicts);
      }
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      throw error;
    }
  };

  const updateScheduleEntry = async (entryId: string, updates: any) => {
    try {
      const updatedEntry = await apiService.updateScheduleEntry(entryId, updates);
      setScheduleEntries(prev => prev.map(entry => 
        entry.id === entryId ? updatedEntry : entry
      ));
    } catch (error) {
      console.error('Failed to update schedule entry:', error);
      throw error;
    }
  };

  const loadConflicts = async () => {
    try {
      const conflicts = await apiService.getScheduleConflicts();
      setConflicts(conflicts);
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  const resolveConflict = async (conflictId: string, action: string) => {
    try {
      await apiService.resolveConflict(conflictId, action);
      setConflicts(prev => prev.filter(conflict => conflict.id !== conflictId));
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  };

  const addPersonalEvent = async (event: any) => {
    try {
      const newEvent = await apiService.addPersonalEvent(event);
      setPersonalEvents(prev => [...prev, newEvent]);
    } catch (error) {
      console.error('Failed to add personal event:', error);
      throw error;
    }
  };

  const loadPersonalEvents = async () => {
    try {
      const events = await apiService.getPersonalEvents();
      setPersonalEvents(events);
    } catch (error) {
      console.error('Failed to load personal events:', error);
    }
  };

  const deletePersonalEvent = async (eventId: string) => {
    try {
      await apiService.deletePersonalEvent(eventId);
      setPersonalEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Failed to delete personal event:', error);
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
      conflicts,
      personalEvents,
      scheduleStats,
      addTask,
      updateTask,
      deleteTask,
      generateSchedule,
      splitTask,
      updateScheduleEntry,
      loadTasks,
      loadMoreTasks,
      hasMoreTasks,
      resetTaskPaging,
      loadSchedule,
      loadConflicts,
      resolveConflict,
      addPersonalEvent,
      loadPersonalEvents,
      deletePersonalEvent,
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