import { useEffect, useState } from 'react';
import AssignRoleModal from '../components/AssignRoleModal';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getRoles } from '../services/roleService';
import { assignRole, getUserRoles, getUsers, removeRole } from '../services/userService';

function AssignRolesPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [manageOpen, setManageOpen] = useState(false);

  const loadBaseData = async () => {
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
    loadBaseData();
  }, []);

  const selectedUser = users.find((item) => item.id === Number(selectedUserId)) || null;

  const loadUserRoles = async (userId) => {
    try {
      const list = await getUserRoles(userId);
      setUserRoles(list);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleAssign = async (roleId) => {
    if (!selectedUser) return;
    try {
      setError('');
      await assignRole(selectedUser.id, roleId);
      await loadUserRoles(selectedUser.id);
      setSuccess('Role assigned successfully.');
      await loadBaseData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleRemove = async (roleId) => {
    if (!selectedUser) return;
    try {
      setError('');
      await removeRole(selectedUser.id, roleId);
      await loadUserRoles(selectedUser.id);
      setSuccess('Role removed successfully.');
      await loadBaseData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Assign Roles</h2>
      </div>

      {success ? <div className="flash flash-success">{success}</div> : null}
      {loading ? <LoadingState text="Loading users and roles..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadBaseData} /> : null}

      {!loading && !error ? (
        <div className="detail-card">
          <label>
            Select User
            <select
              value={selectedUserId}
              onChange={async (event) => {
                const value = event.target.value;
                setSelectedUserId(value);
                setUserRoles([]);
                setManageOpen(false);
                if (value) {
                  await loadUserRoles(Number(value));
                }
              }}
            >
              <option value="">Choose user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </label>
          {selectedUser ? (
            <button type="button" className="btn" onClick={() => setManageOpen(true)}>
              Manage Selected User Roles
            </button>
          ) : null}
        </div>
      ) : null}

      <AssignRoleModal
        open={manageOpen}
        user={selectedUser}
        roles={roles}
        userRoles={userRoles}
        onClose={() => setManageOpen(false)}
        onAssign={handleAssign}
        onRemove={handleRemove}
      />
    </section>
  );
}

export default AssignRolesPage;
