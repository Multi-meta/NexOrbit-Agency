import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import LandingPage from './pages/LandingPage';
import AdminPage   from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/"      element={<LandingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*"      element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="loading-center" style={{ flexDirection: 'column', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)' }}>This page doesn't exist.</p>
      <a href="/" style={{ color: 'var(--purple-light)', marginTop: 8 }}>← Back to Home</a>
    </div>
  );
}
