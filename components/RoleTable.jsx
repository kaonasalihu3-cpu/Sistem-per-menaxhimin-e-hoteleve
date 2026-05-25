function RoleTable({ roles, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Normalized</th>
            <th>Description</th>
            <th>Users</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.emertimi}</td>
              <td>{role.normalized_name}</td>
              <td>{role.pershkrimi || '-'}</td>
              <td>{role.users_count ?? 0}</td>
              <td className="actions-cell">
                <button type="button" className="btn btn-secondary" onClick={() => onEdit(role)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => onDelete(role)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {roles.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-cell">
                No roles found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default RoleTable;

