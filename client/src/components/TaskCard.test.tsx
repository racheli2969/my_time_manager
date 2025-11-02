import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { renderWithRouter, createMockTask } from '../test/test-utils';

// Mock the contexts
vi.mock('../core/contexts/TaskContext', () => ({
  useTask: () => ({
    splitTask: vi.fn(),
  }),
}));

vi.mock('../core/contexts/UserContext', () => ({
  useUser: () => ({
    users: [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' },
    ],
  }),
}));

describe('TaskCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task information correctly', () => {
    const task = createMockTask({
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'high',
    });

    renderWithRouter(
      <TaskCard
        task={task}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('to do')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const task = createMockTask();

    renderWithRouter(
      <TaskCard
        task={task}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(task);
  });

  it('calls onDelete when delete button is clicked', () => {
    const task = createMockTask({ id: '123' });

    renderWithRouter(
      <TaskCard
        task={task}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('123');
  });

  it('calls onStatusChange when status is changed', () => {
    const task = createMockTask({ id: '123', status: 'todo' });

    renderWithRouter(
      <TaskCard
        task={task}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'in-progress' } });

    expect(mockOnStatusChange).toHaveBeenCalledWith('123', 'in-progress');
  });

  it('shows overdue styling for overdue tasks', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const task = createMockTask({
      dueDate: pastDate.toISOString(),
      status: 'todo',
    });

    const { container } = renderWithRouter(
      <TaskCard
        task={task}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const card = container.querySelector('.border-red-300');
    expect(card).toBeInTheDocument();
  });

  it('displays assigned user name when available', () => {
    const task = createMockTask({ assignedTo: '1' });

    renderWithRouter(
      <TaskCard
        task={task}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    const task = createMockTask({ estimatedDuration: 125 }); // 2h 5m

    renderWithRouter(
      <TaskCard
        task={task}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('2h 5m')).toBeInTheDocument();
  });

  it('shows split button for tasks over 60 minutes', () => {
    const task = createMockTask({ 
      estimatedDuration: 120,
      intervals: undefined 
    });

    renderWithRouter(
      <TaskCard
        task={task}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Split')).toBeInTheDocument();
  });
});
