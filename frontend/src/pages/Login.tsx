import { useState } from 'react';
import { api, setAuth } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      setToken(res.data.accessToken);
      setAuth(res.data.accessToken);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '3rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      {token && <pre>Token: {token.slice(0, 20)}...</pre>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
