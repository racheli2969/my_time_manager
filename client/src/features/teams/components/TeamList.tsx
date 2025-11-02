/**
 * Team List Component
 * Displays a grid of team cards
 */

import React from 'react';
import { TeamCard } from './TeamCard';
import { Team } from '../../../types';

interface TeamListProps {
  teams: Team[];
  currentUserId: string | undefined;
  getUserName: (userId: string) => string;
  canManageTeam: (team: Team) => boolean;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onEditMembers: (team: Team) => void;
  onRemoveMember: (teamId: string, memberId: string) => void;
}

/**
 * Grid layout for displaying team cards
 */
export const TeamList: React.FC<TeamListProps> = ({
  teams,
  currentUserId,
  getUserName,
  canManageTeam,
  onEditTeam,
  onDeleteTeam,
  onEditMembers,
  onRemoveMember
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map(team => (
        <TeamCard
          key={team.id}
          team={team}
          currentUserId={currentUserId}
          canManageTeam={canManageTeam(team)}
          getUserName={getUserName}
          onEdit={onEditTeam}
          onDelete={onDeleteTeam}
          onAddMembers={onEditMembers}
          onRemoveMember={onRemoveMember}
        />
      ))}
    </div>
  );
};
