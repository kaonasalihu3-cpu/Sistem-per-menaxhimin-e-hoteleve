import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    emri: '',
    mbiemri: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await register(form);
      setSuccess('Registration completed. You can now log in.');
      setTimeout(() => navigate('/login'), 900);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Register</h2>
      {error ? <div className="flash flash-error">{error}</div> : null}
      {success ? <div className="flash flash-success">{success}</div> : null}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Emri
          <input value={form.emri} onChange={(event) => setForm((current) => ({ ...current, emri: event.target.value }))} required />
        </label>
        <label>
          Mbiemri
          <input value={form.mbiemri} onChange={(event) => setForm((current) => ({ ...current, mbiemri: event.target.value }))} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
        </label>
        <label>
          Phone Number
          <input value={form.phone_number} onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))} />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="auth-link">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default RegisterPage;

