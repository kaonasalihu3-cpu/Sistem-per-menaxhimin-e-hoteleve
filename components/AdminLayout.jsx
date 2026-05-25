import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/profile', label: 'Profile', roles: ['admin', 'manager', 'user'] },
    { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'manager'] },
    { to: '/users', label: 'Users', roles: ['admin'] },
    { to: '/roles', label: 'Roles', roles: ['admin'] },
    { to: '/assign-roles', label: 'Assign Roles', roles: ['admin'] },
    { to: '/rooms', label: 'Rooms', roles: ['admin', 'manager', 'user'] },
    { to: '/room-types', label: 'Room Types', roles: ['admin', 'manager', 'user'] },
    { to: '/guests', label: 'Guests', roles: ['admin', 'manager', 'user'] },
    { to: '/reservations', label: 'Reservations', roles: ['admin', 'manager', 'user'] },
    { to: '/check-in-out', label: 'Check-in/Check-out', roles: ['admin', 'manager'] },
    { to: '/services', label: 'Services', roles: ['admin', 'manager'] },
    { to: '/service-orders', label: 'Service Orders', roles: ['admin', 'manager'] },
    { to: '/invoices', label: 'Invoices', roles: ['admin', 'manager'] },
    { to: '/staff', label: 'Staff', roles: ['admin', 'manager'] },
    { to: '/reports', label: 'Reports', roles: ['admin', 'manager'] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.some((role) => hasRole(role)));

  return (
    <div className="admin-shell">
      {sidebarOpen ? (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <h2>Hoteli Admin</h2>
        <p className="sidebar-user">{user?.full_name || user?.email}</p>
        <nav className="sidebar-nav">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname.startsWith(item.to) ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
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
            <p>Secure access by role and module-level permissions</p>
          </div>
          <div className="topbar-actions">
            <button type="button" className="btn btn-secondary mobile-only" onClick={() => setSidebarOpen((current) => !current)}>
              Menu
            </button>
            <button type="button" className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <footer className="admin-footer">
          <span>Hotel Management System</span>
          <span>{new Date().getFullYear()} - Admin Console</span>
        </footer>
      </div>
    </div>
  );
}

export default AdminLayout;
