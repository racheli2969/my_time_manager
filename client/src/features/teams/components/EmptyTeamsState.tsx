/**
 * Empty Teams State Component
 * Displays when no teams exist yet
 */

import React from 'react';
import { Users } from 'lucide-react';

interface EmptyTeamsStateProps {
  onCreateTeam: () => void;
}

/**
 * Empty state message for teams page
 */
export const EmptyTeamsState: React.FC<EmptyTeamsStateProps> = ({ onCreateTeam }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
      <p className="text-gray-600 mb-4">
        Create your first team to start collaborating on tasks.
      </p>
      <button
        onClick={onCreateTeam}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Team
      </button>
    </div>
  );
};
