import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await (await import('../lib/api')).default.post('/auth/register', form);
      // Após registrar, redireciona para login
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Criar Conta</h2>
        <input
          type="text"
          name="name"
          placeholder="Nome completo"
          value={form.name}
          onChange={handleChange}
          className="input w-full"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          className="input w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          className="input w-full"
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        <div className="text-center text-sm mt-2">
          Já tem conta? <a href="/login" className="text-primary-600 hover:underline">Entrar</a>
        </div>
      </form>
    </div>
  );
}
