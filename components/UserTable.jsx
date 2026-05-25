function UserTable({ users, onEdit, onDelete, onActivate, onDeactivate, onManageRoles }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.phone_number || '-'}</td>
              <td>
                <span className={`status-badge ${user.statusi === 'active' ? 'status-available' : 'status-cancelled'}`}>
                  {user.statusi}
                </span>
              </td>
              <td>
                {(user.roles || []).map((role) => (
                  <span key={role.id} className="tag">
                    {role.emertimi}
                  </span>
                ))}
              </td>
              <td className="actions-cell">
                <button type="button" className="btn btn-secondary" onClick={() => onEdit(user)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => onDelete(user)}>
                  Delete
                </button>
                {user.statusi === 'active' ? (
                  <button type="button" className="btn btn-secondary" onClick={() => onDeactivate(user)}>
                    Deactivate
                  </button>
                ) : (
                  <button type="button" className="btn" onClick={() => onActivate(user)}>
                    Activate
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => onManageRoles(user)}>
                  Roles
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-cell">
                No users found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;

