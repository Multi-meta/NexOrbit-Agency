import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api/api';

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
const OrbLogo = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sphereGradAdmin" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#4da8da" />
        <stop offset="50%" stopColor="#004e92" />
        <stop offset="100%" stopColor="#000428" />
      </radialGradient>
      <linearGradient id="swooshGradAdmin" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e0e0e0" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#9e9e9e" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="40" fill="url(#sphereGradAdmin)" />
    <path d="M10,70 Q50,90 90,30 Q50,10 10,70 Z" fill="url(#swooshGradAdmin)" opacity="0.85" />
    <path d="M15,75 Q50,95 85,35 Q50,15 15,75 Z" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5" />
    <circle cx="85" cy="25" r="1.5" fill="#fff" />
    <circle cx="15" cy="80" r="1.5" fill="#fff" />
  </svg>
);
const Icons = {
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" /><rect x="3" y="5" width="18" height="14" rx="2" /></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>,
  WhatsApp: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>,
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Globe: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Export: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Total: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  New: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Contacted: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Closed: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Idea: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  EmptyBox: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
};


/* ── Constants ───────────────────────────────────────────────────────────── */
const STATUS_COLORS = { New: '#60a5fa', Contacted: '#fbbf24', Closed: '#34d399' };
const STATUS_ORDER  = ['New', 'Contacted', 'Closed'];
const BUDGET_COLORS = ['#7c3aed', '#0d9488', '#d97706', '#2563eb'];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function exportCSV(leads) {
  const headers = ['Name', 'Email', 'Phone', 'Budget Range', 'Message', 'Status', 'Submitted'];
  const rows = leads.map(l => [
    `"${l.name.replace(/"/g, '""')}"`,
    l.email,
    l.phone || '',
    l.budgetRange,
    `"${l.message.replace(/"/g, '""')}"`,
    l.status,
    fmtDate(l.createdAt),
  ]);
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#12121f', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
      <p style={{ color: '#a78bfa', marginBottom: 2, fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#e8e8f5' }}>{payload[0].value} leads</p>
    </div>
  );
};

/* ── Contact Modal ───────────────────────────────────────────────────────── */
function ContactModal({ lead, onClose, onMessageSent }) {
  const toast = useToast();
  const [message, setMessage] = useState(
    `Hi ${lead.name},\n\nThank you for reaching out to NexOrbit! We've reviewed your project inquiry and would love to connect.\n\nCould we schedule a quick call to discuss your project in detail?\n\nBest regards,\nNexOrbit Team`
  );
  const [sending, setSending] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const sendEmail = async () => {
    if (!message.trim()) return toast.error('Please write a message first.');
    setSending(true);
    try {
      const { data } = await api.post(`/api/leads/${lead._id}/message`, {
        message: message.trim(), channel: 'email',
      });
      toast.success(`Email sent to ${lead.email}!`);
      onMessageSent(data.lead);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const openWhatsApp = async () => {
    if (!lead.phone) return;
    // Open WhatsApp Web / App with pre-filled message
    const phone = lead.phone.replace(/\D/g, '');
    const url   = `https://wa.me/${phone}?text=${encodeURIComponent(message.trim())}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Log the outreach in message history
    if (message.trim()) {
      try {
        const { data } = await api.post(`/api/leads/${lead._id}/message`, {
          message: message.trim(), channel: 'whatsapp',
        });
        onMessageSent(data.lead);
        toast.success('WhatsApp opened & message logged!');
      } catch { /* non-critical */ }
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Contact ${lead.name}`}
    >
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3>Contact Lead</h3>
            <p>Send a message directly to this lead</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <div className="modal-body">
          {/* Lead info */}
          <div className="lead-info-card">
            <div className="lead-info-card-name">{lead.name}</div>
            <div className="lead-info-card-email"><span style={{display:'inline-flex', alignItems:'center', gap:6, color:'var(--lp-text)'}}><Icons.Mail /> {lead.email}</span></div>
            {lead.phone
              ? <div className="lead-info-card-phone"><span style={{display:'inline-flex', alignItems:'center', gap:6, color:'var(--lp-text)'}}><Icons.Phone /> {lead.phone}</span></div>
              : <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}><span style={{display:'inline-flex', alignItems:'center', gap:6, color:'var(--lp-text)'}}><Icons.Phone /> No phone number provided</span></div>
            }
            <div className="lead-info-card-quote">"{lead.message}"</div>
          </div>

          {/* Budget + Status summary */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, padding: '10px 14px', background: 'var(--glass)', borderRadius: 'var(--r-md)', fontSize: 13 }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Budget</div>
              <div style={{ color: 'var(--teal-light)', fontWeight: 600 }}>{lead.budgetRange}</div>
            </div>
            <div style={{ flex: 1, padding: '10px 14px', background: 'var(--glass)', borderRadius: 'var(--r-md)', fontSize: 13 }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Status</div>
              <div style={{ color: STATUS_COLORS[lead.status], fontWeight: 600 }}>{lead.status}</div>
            </div>
            <div style={{ flex: 1, padding: '10px 14px', background: 'var(--glass)', borderRadius: 'var(--r-md)', fontSize: 13 }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Messages Sent</div>
              <div style={{ color: 'var(--text)', fontWeight: 600 }}>{lead.messages?.length ?? 0}</div>
            </div>
          </div>

          {/* Message composer */}
          <div className="form-group">
            <label className="form-label" htmlFor="compose-msg">Compose Message</label>
            <textarea
              id="compose-msg"
              className="form-input"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
            />
            <div className="form-char">{message.length} characters</div>
          </div>

          {/* Send buttons */}
          <div className="channel-btns">
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={sendEmail}
              disabled={sending}
              title={`Send email to ${lead.email}`}
            >
              {sending
                ? <><span className="spinner" aria-hidden="true" /> Sending...</>
                : <><Icons.Mail /> Send Email</>
              }
            </button>

            {lead.phone ? (
              <button
                className="btn-whatsapp"
                onClick={openWhatsApp}
                title={`Open WhatsApp for ${lead.phone}`}
              ><Icons.WhatsApp /> WhatsApp</button>
            ) : (
              <div style={{
                flex: 1, padding: '12px 16px', borderRadius: 'var(--r-md)',
                background: 'rgba(255,255,255,.02)', border: '1px solid var(--glass-border)',
                color: 'var(--text-dim)', fontSize: 12, display: 'flex',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              }}><Icons.WhatsApp /> No phone number — WhatsApp unavailable</div>
            )}
          </div>

          {/* Message history */}
          {lead.messages?.length > 0 && (
            <div className="msg-history">
              <div className="msg-history-title">
                Conversation History ({lead.messages.length} message{lead.messages.length > 1 ? 's' : ''})
              </div>
              {[...lead.messages].reverse().map((m, i) => (
                <div key={i} className="msg-item">
                  <div className="msg-item-head">
                    <span className={`msg-item-channel ${m.channel}`}>
                      {m.channel === 'email' ? 'Email' : 'WhatsApp'}
                    </span>
                    <span className="msg-item-date">{fmtDateTime(m.sentAt)}</span>
                  </div>
                  <div className="msg-item-text">{m.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Status dropdown cell ────────────────────────────────────────────────── */
function StatusCell({ lead, onUpdate }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div className="status-select-cell" ref={ref}>
      <button
        className={`status-select-btn ${lead.status}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {lead.status}
      </button>
      {open && (
        <div className="status-dropdown" role="listbox">
          {STATUS_ORDER.map(s => (
            <button
              key={s} role="option" aria-selected={s === lead.status}
              className={s === lead.status ? 'selected' : ''}
              onClick={() => { onUpdate(lead._id, s); setOpen(false); }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s], display: 'inline-block', flexShrink: 0 }} />
              {s} {s === lead.status && '✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Admin login form ────────────────────────────────────────────────────── */
function LoginForm() {
  const { login } = useAuth();
  const toast      = useToast();
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!creds.email || !creds.password) return setError('Both fields are required.');
    setBusy(true);
    try {
      await login(creds.email, creds.password);
      toast.success('Welcome back!');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" aria-hidden="true" />
      <div className="auth-orb auth-orb-2" aria-hidden="true" />
      <div className="auth-card" role="main">
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true" style={{ background: 'transparent' }}><OrbLogo className="w-8 h-8" style={{width: 32, height: 32}} /></div>
          <div>
            <div className="auth-logo-name">NexOrbit</div>
            <div className="auth-logo-sub">Admin Portal</div>
          </div>
        </div>
        <h1>Sign in</h1>
        <p className="auth-subtitle">Access your lead management dashboard.</p>
        {error && <div className="auth-error" role="alert">⚠ {error}</div>}
        <form id="admin-login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email</label>
            <input id="admin-email" type="email" className="form-input"
              placeholder="admin@leaddesk.com" value={creds.email}
              onChange={e => setCreds(p => ({ ...p, email: e.target.value }))}
              autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" className="form-input"
              placeholder="••••••••" value={creds.password}
              onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password" />
          </div>
          <button id="admin-login-btn" type="submit"
            className="btn btn-primary btn-full" disabled={busy} style={{ marginTop: 4 }}>
            {busy ? <><span className="spinner" /> Signing in...</> : 'Sign in →'}
          </button>
        </form>
        <div className="auth-footer"><a href="/">← Back to public site</a></div>
      </div>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */
function Dashboard() {
  const { admin, logout } = useAuth();
  const toast              = useToast();

  const [leads,        setLeads]        = useState([]);
  const [stats,        setStats]        = useState(null);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loadingData,  setLoadingData]  = useState(true);
  const [contactLead,  setContactLead]  = useState(null); // which lead is open in the modal

  /* ── Fetch ─────────────────────────────────────────────────────────────── */
  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setLoadingData(true);
    try {
      const params = {};
      if (search)               params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      const { data } = await api.get('/api/leads', { params });
      setLeads(data.leads);
      setStats(data.stats);
    } catch (err) {
      if (!silent) toast.error(err.response?.data?.error || 'Failed to load leads.');
    } finally {
      if (!silent) setLoadingData(false);
    }
  }, [search, statusFilter]); // eslint-disable-line

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Auto-refresh every 30 s
  useEffect(() => {
    const id = setInterval(() => fetchLeads(true), 30_000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  /* ── Status update ─────────────────────────────────────────────────────── */
  const handleStatusUpdate = async (id, status) => {
    setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
    try {
      await api.patch(`/api/leads/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchLeads(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status.');
      fetchLeads(true);
    }
  };

  /* ── Message sent callback from ContactModal ───────────────────────────── */
  const handleMessageSent = (updatedLead) => {
    setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
    setContactLead(updatedLead); // refresh modal with new messages + status
  };

  /* ── Logout ────────────────────────────────────────────────────────────── */
  const handleLogout = async () => {
    try { await logout(); toast.info('Logged out.'); }
    catch { toast.error('Logout failed.'); }
  };

  /* ── Chart data ────────────────────────────────────────────────────────── */
  const statusChartData = STATUS_ORDER.map(s => ({
    name: s, value: stats?.byStatus.find(x => x._id === s)?.count || 0,
  }));
  const budgetChartData = (stats?.byBudget || []).map(b => ({ name: b._id, count: b.count }));

  return (
    <div className="admin-layout">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="sidebar" aria-label="Admin navigation">
        <div className="sidebar-head">
          <div className="sidebar-logo-icon" aria-hidden="true" style={{ background: 'transparent' }}><OrbLogo className="w-6 h-6" style={{width: 24, height: 24}} /></div>
          <span className="sidebar-logo-text">NexOrbit</span>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-item active">
            <span className="sidebar-item-icon"><Icons.Dashboard /></span> Dashboard
          </button>
          <button className="sidebar-item"
            onClick={() => document.getElementById('leads-table')?.scrollIntoView({ behavior: 'smooth' })}>
            <span className="sidebar-item-icon"><Icons.Users /></span> Leads
          </button>
          <a href="/" className="sidebar-item" target="_blank" rel="noopener noreferrer">
            <span className="sidebar-item-icon"><Icons.Globe /></span> Public Site
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-card-email" title={admin?.email}>{admin?.email}</div>
            <div className="user-card-role">Administrator</div>
          </div>
          <button id="admin-logout-btn" className="btn btn-ghost btn-sm btn-full"
            onClick={handleLogout} style={{ marginTop: 8 }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div>
            <div className="topbar-title">Dashboard</div>
            <div className="topbar-sub">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="topbar-right">
            <div className="live-pill">
              <span className="live-dot" aria-hidden="true" /> Live · auto-refreshes
            </div>
            <button id="export-csv-btn" className="export-btn"
              onClick={() => { exportCSV(leads); toast.success('CSV downloaded!'); }}
              disabled={leads.length === 0}>
              📤 Export CSV
            </button>
          </div>
        </header>

        <div className="admin-body">
          {/* Stat cards */}
          <div className="stats-grid" role="region" aria-label="Lead statistics">
            {[
              { label: 'Total Leads',  icon: <Icons.Total />, color: 'purple', value: stats?.total ?? '—',                                                sub: 'all time'          },
              { label: 'New',          icon: <Icons.New />, color: 'blue',   value: stats?.byStatus.find(x=>x._id==='New')?.count       ?? 0,          sub: 'awaiting contact'  },
              { label: 'Contacted',    icon: <Icons.Contacted />, color: 'amber',  value: stats?.byStatus.find(x=>x._id==='Contacted')?.count ?? 0,          sub: 'in progress'       },
              { label: 'Closed',       icon: <Icons.Closed />, color: 'green',  value: stats?.byStatus.find(x=>x._id==='Closed')?.count    ?? 0,          sub: 'deals done'        },
            ].map((c, i) => (
              <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="stat-card-top">
                  <span className="stat-card-label">{c.label}</span>
                  <div className={`stat-icon ${c.color}`} aria-hidden="true">{c.icon}</div>
                </div>
                <div className="stat-value">{loadingData ? '…' : c.value}</div>
                <div className="stat-sub">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          {!loadingData && stats && (
            <div className="charts-row" role="region" aria-label="Lead charts">
              <div className="chart-card">
                <div className="chart-card-title">Status Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {statusChartData.map(e => <Cell key={e.name} fill={STATUS_COLORS[e.name]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13, color: '#7878a0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <div className="chart-card-title">Leads by Budget Range</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={budgetChartData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: '#7878a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#7878a0', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {budgetChartData.map((_, i) => <Cell key={i} fill={BUDGET_COLORS[i % BUDGET_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Workflow guide */}
          <div style={{
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 'var(--r-md)', padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <span style={{ color: 'var(--purple-light)', flexShrink: 0 }}><Icons.Idea /></span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--purple-light)', marginBottom: 4 }}>How the workflow works</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Click <strong style={{ color: 'var(--purple-light)' }}><Icons.Mail /> Contact </strong> on any lead to open the message composer.
                You can send a message directly to their <strong>email</strong> or open <strong>WhatsApp</strong> (if they provided a phone number).
                Status automatically changes to <strong style={{ color: 'var(--amber-light)' }}>Contacted</strong> on first message,
                and you can manually set it to <strong style={{ color: 'var(--green-light)' }}>Closed</strong> when the deal is done.
              </p>
            </div>
          </div>

          {/* Leads table */}
          <div className="leads-card" id="leads-table" role="region" aria-label="Leads table">
            <div className="leads-card-top">
              <div className="leads-card-title">
                All Leads
                {!loadingData && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>
                    ({leads.length})
                  </span>
                )}
              </div>
              <div className="leads-controls">
                <div className="search-wrap">
                  <span className="search-icon" aria-hidden="true"><Icons.Search /></span>
                  <input id="leads-search" type="search" className="search-input"
                    placeholder="Search name, email…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    aria-label="Search leads" />
                </div>
                <div className="filter-tabs" role="tablist">
                  {['All', ...STATUS_ORDER].map(s => (
                    <button key={s} role="tab" aria-selected={statusFilter === s}
                      className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
                      onClick={() => setStatusFilter(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loadingData ? (
              <div className="empty-state">
                <div className="page-spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : leads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-emoji">{search || statusFilter !== 'All' ? <Icons.Search /> : <Icons.EmptyBox />}</div>
                <h3>{search || statusFilter !== 'All' ? 'No results found' : 'No leads yet'}</h3>
                <p>{search || statusFilter !== 'All' ? 'Try adjusting your search or filter.' : 'Share your public landing page to start capturing leads.'}</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table aria-label="Leads list">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Budget</th>
                      <th scope="col">Message</th>
                      <th scope="col">Submitted</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead._id}>
                        <td className="td-name">{lead.name}</td>
                        <td className="td-email">
                          <a href={`mailto:${lead.email}`}
                            style={{ color: 'var(--purple-light)', textDecoration: 'none' }}
                            title="Click to email">
                            {lead.email}
                          </a>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--teal-light)', whiteSpace: 'nowrap' }}>
                          {lead.phone ? (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ color: '#25d366', textDecoration: 'none' }}
                              title="Open WhatsApp"
                            >
                              <span style={{display:'inline-flex', alignItems:'center', gap:4}}><Icons.WhatsApp /> {lead.phone}</span>
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>—</span>
                          )}
                        </td>
                        <td className="td-budget">{lead.budgetRange}</td>
                        <td className="td-message" title={lead.message}>{lead.message}</td>
                        <td className="td-date">{fmtDate(lead.createdAt)}</td>
                        <td><StatusCell lead={lead} onUpdate={handleStatusUpdate} /></td>
                        <td>
                          <button
                            className="contact-btn"
                            onClick={() => setContactLead(lead)}
                            aria-label={`Contact ${lead.name}`}
                          ><Icons.Mail /> Contact {lead.messages?.length > 0 && (
                              <span style={{
                                background: 'var(--purple)', color: '#fff',
                                borderRadius: '50%', width: 16, height: 16,
                                fontSize: 10, display: 'inline-flex',
                                alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                              }}>
                                {lead.messages.length}
                              </span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--text-dim)' }}>
            Built for{' '}
            <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--purple-light)' }}>
              Digital Heroes Training Task
            </a>
          </p>
        </div>
      </main>

      {/* ── Contact Modal ─────────────────────────────────────────────────── */}
      {contactLead && (
        <ContactModal
          lead={contactLead}
          onClose={() => setContactLead(null)}
          onMessageSent={handleMessageSent}
        />
      )}
    </div>
  );
}

/* ── Gate: shows Login or Dashboard ─────────────────────────────────────── */
export default function AdminPage() {
  const { admin, loading } = useAuth();
  if (loading) {
    return (
      <div className="admin-root">
        <div className="loading-center"><div className="page-spinner" /></div>
      </div>
    );
  }
  return (
    <div className="admin-root">
      {admin ? <Dashboard /> : <LoginForm />}
    </div>
  );
}
