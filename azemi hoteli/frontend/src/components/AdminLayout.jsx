import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/profile', label: 'Profile', roles: ['admin', 'manager', 'user'] },
    { to: '/rooms', label: 'Rooms', roles: ['admin', 'manager', 'user'] },
    { to: '/room-types', label: 'Room Types', roles: ['admin', 'manager', 'user'] },
    { to: '/guests', label: 'Guests', roles: ['admin', 'manager', 'user'] },
    { to: '/reservations', label: 'Reservations', roles: ['admin', 'manager', 'user'] },
    { to: '/services', label: 'Services', roles: ['admin', 'manager'] },
    { to: '/service-orders', label: 'Service Orders', roles: ['admin', 'manager'] },
    { to: '/invoices', label: 'Invoices', roles: ['admin', 'manager'] },
    { to: '/check-in-out', label: 'Check-in/Out', roles: ['admin', 'manager'] },
    { to: '/users', label: 'Users', roles: ['admin'] },
    { to: '/roles', label: 'Roles', roles: ['admin'] },
    { to: '/assign-roles', label: 'Assign Roles', roles: ['admin'] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.some((role) => hasRole(role)));

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <h2>Hoteli Admin</h2>
        <p className="sidebar-user">{user?.full_name || user?.email}</p>
        <nav className="sidebar-nav">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname.startsWith(item.to) ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>Hotel Management Dashboard</h1>
            <p>Secure access by role</p>
          </div>
          <button type="button" className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
