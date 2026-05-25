import { useEffect, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import RoleTable from '../components/RoleTable';
import { createRole, deleteRole, getRoles, updateRole } from '../services/roleService';
import RoleForm from './RoleForm';

function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRoles();
      setRoles(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      if (editing) {
        await updateRole(editing.id, payload);
        setSuccess('Role updated successfully.');
      } else {
        await createRole(payload);
        setSuccess('Role created successfully.');
      }

      setFormOpen(false);
      setEditing(null);
      await loadRoles();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete role "${role.emertimi}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteRole(role.id);
      setSuccess('Role deleted successfully.');
      await loadRoles();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="section-head">
        <h2>Roles Management</h2>
        <button type="button" className="btn" onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Role
        </button>
      </div>

      {success ? <div className="flash flash-success">{success}</div> : null}
      {loading ? <LoadingState text="Loading roles..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadRoles} /> : null}

      {!loading && !error ? (
        <RoleTable
          roles={roles}
          onEdit={(role) => {
            setEditing(role);
            setFormOpen(true);
          }}
          onDelete={handleDelete}
        />
      ) : null}

      <RoleForm
        open={formOpen}
        initialValue={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  );
}

export default RolesPage;

