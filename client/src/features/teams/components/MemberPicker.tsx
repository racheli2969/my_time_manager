/**
 * Member Picker Component
 * Modal for adding members to a team
 */

import React from 'react';
import { X } from 'lucide-react';
import { Team, User } from '../../../types';

interface MemberPickerProps {
  team: Team;
  users: User[];
  onAddMember: (teamId: string, userId: string) => void;
  onClose: () => void;
}

/**
 * Modal for selecting and adding users to a team
 */
export const MemberPicker: React.FC<MemberPickerProps> = ({
  team,
  users,
  onAddMember,
  onClose
}) => {
  const availableUsers = users.filter(u => !team.members.includes(u.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Members to {team.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 mb-4">
          {availableUsers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              No users available to add
            </p>
          ) : (
            availableUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {user.name} <span className="text-xs text-gray-500">({user.email})</span>
                </span>
                <button
                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  onClick={() => onAddMember(team.id, user.id)}
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
