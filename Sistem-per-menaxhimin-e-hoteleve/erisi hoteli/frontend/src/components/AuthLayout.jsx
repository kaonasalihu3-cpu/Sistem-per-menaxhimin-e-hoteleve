import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Hoteli Security</h1>
        <p className="auth-subtitle">Authentication & Authorization</p>
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;

