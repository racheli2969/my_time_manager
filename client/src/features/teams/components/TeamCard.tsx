/**
 * Team Card Component
 * Displays individual team information with member management
 */

import React from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { Team } from '../../../types';

interface TeamCardProps {
  team: Team;
  currentUserId: string | undefined;
  canManageTeam: boolean;
  getUserName: (userId: string) => string;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onAddMembers: (team: Team) => void;
  onRemoveMember: (teamId: string, memberId: string) => void;
}

/**
 * Team card displaying team details and member list
 */
export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  canManageTeam,
  getUserName,
  onEdit,
  onDelete,
  onAddMembers,
  onRemoveMember
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-600">Admin: {getUserName(team.adminId)}</p>
          </div>
          {canManageTeam && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(team)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(team.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {team.description && (
          <p className="text-gray-600 text-sm mb-4">{team.description}</p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Members ({team.members.length})
            </span>
            {canManageTeam && (
              <button
                className="text-blue-600 hover:text-blue-800"
                title="Add Members"
                onClick={() => onAddMembers(team)}
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {team.members.map(memberId => (
              <div key={memberId} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{getUserName(memberId)}</span>
                {canManageTeam && memberId !== team.adminId && (
                  <button
                    onClick={() => onRemoveMember(team.id, memberId)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
        Created {new Date(team.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};
