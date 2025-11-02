/**
 * Empty Task State Component
 * Shows when no tasks are available
 */

import React from 'react';

interface EmptyTaskStateProps {
  onCreateTask: () => void;
}

/**
 * Placeholder when no tasks exist
 */
export const EmptyTaskState: React.FC<EmptyTaskStateProps> = ({ onCreateTask }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center justify-center bg-white/70 border-2 border-blue-100 rounded-2xl shadow-lg px-10 py-16 max-w-2xl mx-auto">
        <img
          src="/image.png"
          alt="No tasks"
          className="w-28 h-28 mb-8 opacity-70"
        />
        <h1 className="text-3xl font-bold text-blue-500 mb-3 text-center">
          No Tasks Created
        </h1>
        <p className="text-lg text-blue-900/80 text-center mb-6">
          Get started by creating a task to manage your workload and boost your
          productivity.
        </p>
        <button
          onClick={onCreateTask}
          className="mt-2 px-8 py-3 bg-blue-100 text-blue-700 text-lg rounded-xl shadow hover:bg-blue-200 transition-colors font-semibold border border-blue-200"
        >
          Create Your First Task
        </button>
      </div>
    </div>
  );
};

export default EmptyTaskState;
