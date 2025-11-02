/**
 * Team Manager Page
 * Main page for managing teams and collaboration
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTeam } from '../../../core/contexts/TeamContext';
import { useUser } from '../../../core/contexts/UserContext';
import { useAuthRedirect } from '../../../hooks/useAuthRedirect';
import { AuthDialog } from '../../../components/AuthDialog';
import { TeamForm } from '../components/TeamForm';
import { TeamList } from '../components/TeamList';
import { MemberPicker } from '../components/MemberPicker';
import { EmptyTeamsState } from '../components/EmptyTeamsState';
import { Team } from '../../../types';

/**
 * Team management page with create, edit, and member management
 */
export const TeamManagerPage: React.FC = () => {
  const { requireAuth, dialog } = useAuthRedirect();
  const { teams, deleteTeam, addMemberToTeam, removeMemberFromTeam, loadTeams } = useTeam();
  const { users, currentUser } = useUser();
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userPickerTeam, setUserPickerTeam] = useState<Team | null>(null);

  // Load teams from DB on mount
  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line
  }, []);

  /**
   * Open team form for editing with auth check
   */
  const handleEditTeam = (team: Team) => {
    requireAuth(() => {
      setEditingTeam(team);
      setShowTeamForm(true);
    }, 'You need to be signed in to edit teams. Would you like to login now?');
  };

  /**
   * Open member picker for adding members with auth check
   */
  const handleEditMembers = (team: Team) => {
    requireAuth(() => {
      setUserPickerTeam(team);
      setShowUserPicker(true);
    }, 'You need to be signed in to manage team members. Would you like to login now?');
  };

  /**
   * Close team form and reset editing state
   */
  const handleCloseForm = () => {
    setShowTeamForm(false);
    setEditingTeam(null);
  };

  /**
   * Close member picker and reset state
   */
  const handleCloseMemberPicker = () => {
    setShowUserPicker(false);
    setUserPickerTeam(null);
  };

  /**
   * Get user name by user ID
   */
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  /**
   * Check if current user can manage a team
   */
  const canManageTeam = (team: Team): boolean => {
    return Boolean(currentUser && (currentUser.role === 'admin' || team.adminId === currentUser.id));
  };

  /**
   * Handle create team button click with auth check
   */
  const handleCreateTeam = () => {
    requireAuth(() => {
      setShowTeamForm(true);
    }, 'You need to be signed in to create teams. Would you like to login now?');
  };

  return (
    <div className="space-y-6">
      {/* Auth Dialog */}
      {dialog && (
        <AuthDialog
          show={dialog.show}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Teams</h2>
          <p className="text-gray-600 mt-1">Manage teams and collaborate on tasks</p>
        </div>
        <button
          onClick={handleCreateTeam}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Team</span>
        </button>
      </div>

      {/* Teams Content */}
      {teams.length === 0 ? (
        <EmptyTeamsState onCreateTeam={handleCreateTeam} />
      ) : (
        <TeamList
          teams={teams}
          currentUserId={currentUser?.id}
          getUserName={getUserName}
          canManageTeam={canManageTeam}
          onEditTeam={handleEditTeam}
          onDeleteTeam={deleteTeam}
          onEditMembers={handleEditMembers}
          onRemoveMember={removeMemberFromTeam}
        />
      )}

      {/* Team Form Modal */}
      {showTeamForm && (
        <TeamForm
          team={editingTeam}
          onClose={handleCloseForm}
        />
      )}

      {/* Member Picker Modal */}
      {showUserPicker && userPickerTeam && (
        <MemberPicker
          team={userPickerTeam}
          users={users}
          onAddMember={addMemberToTeam}
          onClose={handleCloseMemberPicker}
        />
      )}
    </div>
  );
};

export default TeamManagerPage;
