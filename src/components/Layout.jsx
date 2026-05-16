import{
    Link, useLocation
}
from 'react-router-dom';

function Layout({ children}){
    const location = useLocation();

    return(
        <div className="app-shell">
            <header className="topbar">
                <div>
                    <p className="eyebrow">Hotel Management</p>
                    <h1>Room & Room Type Management</h1>
                </div>
                <nav className="nav-links">
                    <Link className={location.pathname.startsWith('/rooms') ? 'active' : ''} to="/rooms">
                     Rooms
                    </Link>
                    <Link className={location.pathname.startsWith('/room-typrs') ? 'active' : ''} to="/room-types">
                    Room Type
                    </Link>
                </nav>
            </header>
            <main>{children}</main>
        </div>
    );
}

export default Layout;