import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user } = useAuth();

  return (
    <section className="page">
      <div className="section-head">
        <h2>My Profile</h2>
      </div>

      <article className="detail-card">
        <div className="detail-row">
          <span>Full Name</span>
          <strong>{user?.full_name}</strong>
        </div>
        <div className="detail-row">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
        <div className="detail-row">
          <span>Phone</span>
          <strong>{user?.phone_number || '-'}</strong>
        </div>
        <div className="detail-row">
          <span>Status</span>
          <strong>{user?.statusi}</strong>
        </div>
        <div className="detail-row">
          <span>Roles</span>
          <strong>
            {(user?.roles || []).map((role) => role.emertimi).join(', ') || '-'}
          </strong>
        </div>
      </article>
    </section>
  );
}

export default ProfilePage;

