import { Link, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Hotel Management</p>
          <h1>Admin Dashboard</h1>
        </div>
        <nav className="nav-links">
          <Link className={location.pathname.startsWith('/reservations') ? 'active' : ''} to="/reservations">
            Reservations
          </Link>
          <Link className={location.pathname.startsWith('/guests') ? 'active' : ''} to="/guests">
            Guests
          </Link>
          <Link className={location.pathname.startsWith('/check-in-out') ? 'active' : ''} to="/check-in-out">
            Check-in/Out
          </Link>
          <Link className={location.pathname.startsWith('/rooms') ? 'active' : ''} to="/rooms">
            Rooms
          </Link>
          <Link className={location.pathname.startsWith('/room-types') ? 'active' : ''} to="/room-types">
            Room Types
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;