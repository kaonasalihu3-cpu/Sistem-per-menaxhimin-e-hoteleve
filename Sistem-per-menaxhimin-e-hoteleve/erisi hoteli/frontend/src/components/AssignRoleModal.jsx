import { useMemo, useState } from 'react';

function AssignRoleModal({ open, user, roles, userRoles, onClose, onAssign, onRemove }) {
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const assignedIds = useMemo(() => new Set((userRoles || []).map((role) => role.id)), [userRoles]);
  const availableRoles = roles.filter((role) => !assignedIds.has(role.id));

  if (!open || !user) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Manage Roles - {user.full_name}</h3>
        <div className="form-grid">
          <label>
            Assign New Role
            <select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)}>
              <option value="">Select role</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.emertimi}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn"
            disabled={!selectedRoleId}
            onClick={() => {
              onAssign(Number(selectedRoleId));
              setSelectedRoleId('');
            }}
          >
            Assign Role
          </button>
        </div>

        <h4>Assigned Roles</h4>
        <div className="role-list">
          {(userRoles || []).map((role) => (
            <div key={role.id} className="role-item">
              <span>{role.emertimi}</span>
              <button type="button" className="btn btn-danger" onClick={() => onRemove(role.id)}>
                Remove
              </button>
            </div>
          ))}
          {(userRoles || []).length === 0 ? <p>No roles assigned.</p> : null}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignRoleModal;

