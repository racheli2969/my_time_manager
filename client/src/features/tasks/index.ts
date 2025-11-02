/**
 * Tasks Feature Public API
 * Export all public components, hooks, and utilities from the tasks feature
 */

// Pages
export { TaskManagerPage } from './pages/TaskManagerPage';

// Components
export { TaskCardItem } from './components/TaskCardItem';
export { TaskDetailModal } from './components/TaskDetailModal';
export { TaskFormModal } from './components/TaskFormModal';
export { TaskList } from './components/TaskList';
export { TaskFilters } from './components/TaskFilters';
export { TaskSort } from './components/TaskSort';
export { EmptyTaskState } from './components/EmptyTaskState';

// Utils
export { formatDuration, formatDateLong } from './utils/taskFormatters';

// Re-export types that consumers might need
export type { Task } from '../../types';
