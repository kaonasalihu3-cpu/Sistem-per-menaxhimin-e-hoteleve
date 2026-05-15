import { useEffect, useState } from 'react';
import AssignRoleModal from '../components/AssignRoleModal';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import UserTable from '../components/UserTable';
import { getRoles } from '../services/roleService';
import {
  activateUser,
  assignRole,
  createUser,
  deactivateUser,
  deleteUser,
  getUserRoles,
  getUsers,
  removeRole,
  updateUser,
} from '../services/userService';
import UserForm from './UserForm';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      if (editing) {
        await updateUser(editing.id, payload);
        setSuccess('User updated successfully.');
      } else {
        await createUser(payload);
        setSuccess('User created successfully.');
      }
      setFormOpen(false);
      setEditing(null);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.full_name}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteUser(user.id);
      setSuccess('User deleted successfully.');
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleActivateToggle = async (user, action) => {
    try {
      setError('');
      setSuccess('');
      if (action === 'activate') {
        await activateUser(user.id);
        setSuccess('User activated successfully.');
      } else {
        await deactivateUser(user.id);
        setSuccess('User deactivated successfully.');
      }
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openAssignRoles = async (user) => {
    try {
      setSelectedUser(user);
      const list = await getUserRoles(user.id);
      setSelectedUserRoles(list);
      setAssignOpen(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleAssignRole = async (roleId) => {
    if (!selectedUser) {
      return;
    }

    try {
      const list = await assignRole(selectedUser.id, roleId);
      setSelectedUserRoles(list);
      setSuccess('Role assigned successfully.');
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!selectedUser) {
      return;
    }

    try {
      const list = await removeRole(selectedUser.id, roleId);
      setSelectedUserRoles(list);
      setSuccess('Role removed successfully.');
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Users Management</h2>
        <button type="button" className="btn" onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add User
        </button>
      </div>

      {success ? <div className="flash flash-success">{success}</div> : null}
      {loading ? <LoadingState text="Loading users..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadData} /> : null}

      {!loading && !error ? (
        <UserTable
          users={users}
          onEdit={(user) => {
            setEditing(user);
            setFormOpen(true);
          }}
          onDelete={handleDelete}
          onActivate={(user) => handleActivateToggle(user, 'activate')}
          onDeactivate={(user) => handleActivateToggle(user, 'deactivate')}
          onManageRoles={openAssignRoles}
        />
      ) : null}

      <UserForm
        open={formOpen}
        initialValue={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AssignRoleModal
        open={assignOpen}
        user={selectedUser}
        roles={roles}
        userRoles={selectedUserRoles}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssignRole}
        onRemove={handleRemoveRole}
      />
    </section>
  );
}

export default UsersPage;

