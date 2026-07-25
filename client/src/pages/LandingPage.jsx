import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../components/Toast';

/* ── SVG Icon Components ─────────────────────────────────────────────────── */

// Sphere + swoosh logo (matches the blue/silver globe style)
const OrbLogo = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="orb-sphere" cx="36%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#63b3ff"/>
        <stop offset="45%"  stopColor="#1a60d4"/>
        <stop offset="100%" stopColor="#0a2a8f"/>
      </radialGradient>
      <linearGradient id="orb-swoosh" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#c8d0e4"/>
        <stop offset="30%"  stopColor="#f4f7ff"/>
        <stop offset="65%"  stopColor="#dde3f0"/>
        <stop offset="100%" stopColor="#8a94b0"/>
      </linearGradient>
      <filter id="orb-glow">
        <feGaussianBlur stdDeviation="1.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Sphere */}
    <circle cx="40" cy="40" r="36" fill="url(#orb-sphere)"/>
    {/* Highlight on sphere */}
    <ellipse cx="30" cy="26" rx="10" ry="7" fill="white" opacity="0.12" transform="rotate(-20 30 26)"/>
    {/* Top swoosh ribbon */}
    <path d="M 8 22 Q 18 4 42 8 Q 58 11 68 22 Q 54 18 40 22 Q 26 26 8 22 Z"
          fill="url(#orb-swoosh)" opacity="0.93" filter="url(#orb-glow)"/>
    {/* Bottom swoosh ribbon */}
    <path d="M 72 58 Q 62 76 38 72 Q 22 69 12 58 Q 26 62 40 58 Q 54 54 72 58 Z"
          fill="url(#orb-swoosh)" opacity="0.93" filter="url(#orb-glow)"/>
    {/* Star sparkles */}
    <g fill="white" opacity="0.95">
      <path d="M11 20 L12 17 L13 20 L16 21 L13 22 L12 25 L11 22 L8 21 Z" transform="scale(0.75) translate(4,5)"/>
      <path d="M69 57 L70 54 L71 57 L74 58 L71 59 L70 62 L69 59 L66 58 Z" transform="scale(0.65) translate(36,26)"/>
    </g>
  </svg>
);

// Gmail-style envelope icon
const MailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="23" height="17" rx="1.5" fill="#f5f5f5" stroke="#ddd" strokeWidth="0.5"/>
    {/* Red M-fold */}
    <path d="M0 0 L12 10 L24 0 Z" fill="#ea4335"/>
    {/* Shadow folds on sides */}
    <path d="M0 0 L0 18 L8 11 Z" fill="#c5221f"/>
    <path d="M24 0 L24 18 L16 11 Z" fill="#c5221f"/>
    {/* Bottom envelope flap */}
    <path d="M0 18 L8 11 L12 14.5 L16 11 L24 18 Z" fill="#ececec"/>
  </svg>
);

// Realistic phone/mobile icon
const PhoneIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="1" width="14" height="22" rx="3" fill="#2d2d3a" stroke="#44445a" strokeWidth="0.8"/>
    <rect x="7" y="3.5" width="10" height="15" rx="1" fill="#1a1a28"/>
    {/* Home button */}
    <rect x="9.5" y="20" width="5" height="1.5" rx="0.75" fill="#44445a"/>
    {/* Speaker */}
    <rect x="9" y="2" width="6" height="1" rx="0.5" fill="#44445a"/>
    {/* Camera dot */}
    <circle cx="15.5" cy="2.5" r="0.5" fill="#555"/>
    {/* Screen content lines */}
    <rect x="8.5" y="5.5" width="7" height="1" rx="0.5" fill="#3a3a4a" opacity="0.8"/>
    <rect x="8.5" y="7.5" width="5" height="0.8" rx="0.4" fill="#3a3a4a" opacity="0.5"/>
  </svg>
);

// Lock icon for admin button
const LockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" opacity="0.9"/>
    <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="12" cy="16" r="1.5" fill="white" opacity="0.7"/>
  </svg>
);

/* ── Data ─────────────────────────────────────────────────────────────────── */
const BUDGET_RANGES = ['Under $1,000', '$1,000 – $5,000', '$5,000 – $20,000', '$20,000+'];

const SERVICES = [
  { icon: '💻', title: 'Web Development',    desc: 'Fast, scalable web apps built with modern stacks — React, Next.js, Node.js. We don\'t cut corners.' },
  { icon: '📱', title: 'Mobile Apps',         desc: 'iOS & Android apps using React Native. From idea to App Store — we handle the full journey.' },
  { icon: '🎨', title: 'UI/UX Design',        desc: 'Interfaces people actually enjoy using. Clean, purposeful, and conversion-focused design.' },
  { icon: '📈', title: 'Digital Marketing',   desc: 'SEO, paid ads, email campaigns — traffic that turns into actual paying customers.' },
  { icon: '🤖', title: 'AI & Automation',     desc: 'Workflows that run themselves. We build AI tools that give your team their time back.' },
  { icon: '🎯', title: 'Brand Identity',      desc: 'Logos, systems, and messaging that stick in people\'s heads long after they\'ve left your site.' },
];

const TICKER_ITEMS = [
  '200+ Clients', 'Web Development', 'Mobile Apps',
  'UI/UX Design', 'AI Automation', 'Digital Marketing',
  'Brand Identity', '500+ Projects', '98% Satisfaction',
  '200+ Clients', 'Web Development', 'Mobile Apps',
  'UI/UX Design', 'AI Automation', 'Digital Marketing',
  'Brand Identity', '500+ Projects', '98% Satisfaction',
];

const MOCK_LEADS = [
  { name: 'Sarah Johnson', email: 'sarah@startup.io',  budget: '$5k–20k', status: 'New',       color: '#e84d19', bg: 'rgba(232,77,25,.18)' },
  { name: 'Raj Patel',     email: 'raj@techcorp.com',  budget: '$20k+',   status: 'Contacted', color: '#fbbf24', bg: 'rgba(251,191,36,.18)' },
  { name: 'Emma Clarke',   email: 'emma@agency.co',    budget: '$1k–5k',  status: 'Closed',    color: '#34d399', bg: 'rgba(52,211,153,.18)' },
  { name: 'Mike Torres',   email: 'mike@brand.studio', budget: '$20k+',   status: 'New',       color: '#e84d19', bg: 'rgba(232,77,25,.18)' },
];

/* ── Validation ───────────────────────────────────────────────────────────── */
function validate(f) {
  const e = {};
  if (!f.name.trim())                        e.name        = 'What\'s your name?';
  else if (f.name.length > 100)              e.name        = 'Name too long (max 100)';
  if (!f.email.trim())                       e.email       = 'We need your email to reach you';
  else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email       = 'That doesn\'t look like a valid email';
  if (!f.budgetRange)                        e.budgetRange = 'Please pick a range — helps us prepare';
  if (!f.message.trim())                     e.message     = 'Tell us a little about the project';
  else if (f.message.trim().length < 10)     e.message     = 'A bit more detail would help (10+ chars)';
  else if (f.message.length > 2000)          e.message     = 'Keep it under 2,000 characters please';
  return e;
}

/* ── Page Component ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const toast = useToast();
  const [scrolled,  setScrolled]  = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [fields,    setFields]    = useState({ name: '', email: '', budgetRange: '', message: '', phone: '' });
  const [errors,    setErrors]    = useState({});
  const [touched,   setTouched]   = useState({});

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const set = (e) => {
    const { name, value } = e.target;
    setFields(p => ({ ...p, [name]: value }));
    if (touched[name]) setErrors(p => ({ ...p, [name]: validate({ ...fields, [name]: value })[name] }));
  };
  const blur = (e) => {
    const { name } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validate(fields)[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, budgetRange: true, message: true });
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await api.post('/api/leads', fields);
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.fields) { setErrors(data.fields); toast.error('Fix the highlighted fields and try again.'); }
      else toast.error(data?.error || 'Hmm, something went wrong. Try again in a sec.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setFields({ name: '', email: '', budgetRange: '', message: '', phone: '' });
    setTouched({}); setErrors({});
  };

  const scrollToForm = () =>
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="lp-wrap">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="lp-nav-inner">

            {/* Logo */}
            <a href="/" className="lp-logo" aria-label="NexOrbit home">
              <OrbLogo size={38} />
              <div>
                <div className="lp-logo-text">NexOrbit</div>
                <div style={{ fontSize: 9, letterSpacing: '.12em', color: 'var(--lp-muted)', textTransform: 'uppercase', marginTop: -2 }}>Agency</div>
              </div>
            </a>

            {/* Pill nav links */}
            <div className="lp-nav-links">
              <a href="#hero"     className="lp-nav-link active">Home</a>
              <a href="#services" className="lp-nav-link">Services</a>
              <a href="#how"      className="lp-nav-link">Process</a>
              <button className="lp-nav-link" onClick={scrollToForm}>Contact</button>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>

              {/* Highlighted Admin button */}
              <a
                href="/admin"
                id="admin-portal-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px',
                  background: 'var(--lp-dark)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  fontSize: 13, fontWeight: 600,
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  position: 'relative',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                  letterSpacing: '-.01em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--lp-brand)';
                  e.currentTarget.style.boxShadow = '0 6px 20px var(--lp-brand-glow)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--lp-dark)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <LockIcon size={13} />
                Admin Panel
                {/* Online indicator dot */}
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 6px #22c55e',
                  flexShrink: 0,
                }} />
              </a>

              <button className="lp-nav-cta" onClick={scrollToForm}>
                Book a Call ↗
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="lp-hero" id="hero">
        <div className="lp-watermark" aria-hidden="true">ORBIT</div>
        <div className="lp-side-text"  aria-hidden="true">EST. 2026 · NEXORBIT AGENCY</div>
        <div className="lp-brand-line" aria-hidden="true">
          <div className="lp-brand-line-bar" />
          <div className="lp-brand-line-dot" />
          <div className="lp-brand-line-bar" />
        </div>

        <div className="container">
          <div className="lp-hero-grid">

            {/* ── Left: copy + form ─────────────────────────────── */}
            <div className="lp-hero-content">
              <div className="lp-eyebrow">
                <span className="lp-eyebrow-dot" aria-hidden="true" />
                Full-Service Digital Agency
              </div>

              <h1 className="lp-hero-title">
                NO MORE<br />
                <span className="strike">GUESSING.</span><br />
                <span className="brand-word">GROW.</span>
              </h1>

              <p className="lp-hero-sub">
                We build custom software, mobile apps, web apps and digital solutions.
                Done fast, done right, done once —&nbsp;<em>the first time.</em>
              </p>

              {/* ── Lead form or success ────────────────────────── */}
              {submitted ? (
                <div className="lp-success">
                  <div className="lp-success-icon">🎉</div>
                  <h3>Got it — we'll be in touch!</h3>
                  <p>
                    Our team reviews every inquiry personally. Expect to hear from us
                    within <strong>24 hours</strong>, usually sooner.
                  </p>
                  <button className="lp-btn-primary" onClick={reset} style={{ margin: '0 auto' }}>
                    Submit another
                  </button>
                </div>
              ) : (
                <form
                  id="contact-form"
                  className="lp-form"
                  onSubmit={handleSubmit}
                  noValidate
                  aria-label="Project inquiry form"
                >
                  {/* Row: name + email */}
                  <div className="lp-form-row">
                    <div>
                      <input id="ld-name" name="name" type="text"
                        className={`lp-input ${errors.name && touched.name ? 'has-error' : ''}`}
                        placeholder="Name" value={fields.name}
                        onChange={set} onBlur={blur} autoComplete="name" />
                      {errors.name && touched.name && <p className="lp-field-err">⚠ {errors.name}</p>}
                    </div>
                    <div>
                      <input id="ld-email" name="email" type="email"
                        className={`lp-input ${errors.email && touched.email ? 'has-error' : ''}`}
                        placeholder="Email" value={fields.email}
                        onChange={set} onBlur={blur} autoComplete="email" />
                      {errors.email && touched.email && <p className="lp-field-err">⚠ {errors.email}</p>}
                    </div>
                  </div>

                  {/* Phone — realistic icon prefix */}
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)', pointerEvents: 'none',
                      display: 'flex', alignItems: 'center',
                    }}>
                      <PhoneIcon size={16} />
                    </span>
                    <input id="ld-phone" name="phone" type="tel"
                      className="lp-input" style={{ paddingLeft: 38 }}
                      placeholder="Phone / WhatsApp (optional)"
                      value={fields.phone} onChange={set} autoComplete="tel" />
                  </div>

                  {/* Budget */}
                  <div>
                    <select id="ld-budget" name="budgetRange"
                      className={`lp-input ${errors.budgetRange && touched.budgetRange ? 'has-error' : ''}`}
                      value={fields.budgetRange} onChange={set} onBlur={blur}>
                      <option value="">Project budget range...</option>
                      {BUDGET_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {errors.budgetRange && touched.budgetRange && <p className="lp-field-err">⚠ {errors.budgetRange}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <textarea id="ld-message" name="message" rows={3}
                      className={`lp-input ${errors.message && touched.message ? 'has-error' : ''}`}
                      placeholder="About your project..."
                      value={fields.message} onChange={set} onBlur={blur} />
                    <div className="lp-char" aria-live="polite">{fields.message.length} / 2000</div>
                    {errors.message && touched.message && <p className="lp-field-err">⚠ {errors.message}</p>}
                  </div>

                  {/* Submit buttons */}
                  <div className="lp-btns">
                    {/* Email us — Gmail icon */}
                    <button id="submit-lead-btn" type="submit"
                      className="lp-btn-primary" disabled={loading}>
                      {loading ? (
                        <><span className="lp-spinner" /> Sending…</>
                      ) : (
                        <><MailIcon size={17} /> Send message</>
                      )}
                    </button>

                    {/* WhatsApp (shows only if phone typed) */}
                    {fields.phone && (
                      <a
                        href={`https://wa.me/${fields.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi NexOrbit! I\'d like to discuss my project.')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="lp-btn-wa"
                      >
                        {/* WhatsApp logo SVG */}
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25d366"/>
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.918-1.422A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.079-1.12l-.29-.174-3.007.869.851-3.062-.19-.306A8 8 0 1112 20z" fill="#25d366"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}

                    {/* Live chat icon button */}
                    <button type="button" className="lp-btn-icon"
                      onClick={scrollToForm}
                      title="Live chat coming soon"
                      aria-label="Chat">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--lp-dim)', marginTop: 4, lineHeight: 1.5 }}>
                    🔒 Private & confidential. We never spam, share, or sell your data.
                  </p>
                </form>
              )}
            </div>

            {/* ── Right: mock dashboard card ─────────────────────── */}
            <div className="lp-preview">
              <div style={{ position: 'relative' }}>
                {/* Top floating badge */}
                <div style={{
                  position: 'absolute', top: -14, left: 20, zIndex: 10,
                  background: 'var(--lp-brand)', color: '#fff',
                  padding: '5px 15px', borderRadius: 999,
                  fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
                  boxShadow: '0 6px 20px var(--lp-brand-glow)',
                }}>
                  2,000+ LEADS CAPTURED
                </div>

                <div className="lp-card">
                  {/* Browser bar */}
                  <div className="lp-card-bar">
                    <div className="lp-card-dot" style={{ background: '#ff5f57' }} />
                    <div className="lp-card-dot" style={{ background: '#ffbd2e' }} />
                    <div className="lp-card-dot" style={{ background: '#28ca41' }} />
                    <div className="lp-card-url">nexorbit.app/admin</div>
                  </div>

                  <div className="lp-card-body">
                    {/* Mock stat cards */}
                    <div className="mock-stats">
                      {[
                        { val: '48',  lbl: 'Total',    col: '#a78bfa' },
                        { val: '21',  lbl: 'New',      col: '#60a5fa' },
                        { val: '18',  lbl: 'Contacted',col: '#fbbf24' },
                        { val: '9',   lbl: 'Closed',   col: '#34d399' },
                      ].map(s => (
                        <div key={s.lbl} className="mock-stat">
                          <div className="mock-stat-val" style={{ color: s.col }}>{s.val}</div>
                          <div className="mock-stat-lbl">{s.lbl}</div>
                        </div>
                      ))}
                    </div>

                    {/* Mini bar chart */}
                    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 52, marginBottom: 14, padding: '0 2px' }}>
                      {[38,62,28,78,50,88,42,66,32,82,56,72].map((h, i) => (
                        <div key={i} style={{
                          flex: 1, height: `${h}%`,
                          background: i === 9 ? 'var(--lp-brand)' : i === 5 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.09)',
                          borderRadius: '3px 3px 0 0',
                        }} />
                      ))}
                    </div>

                    {/* Mock leads */}
                    <div className="mock-table">
                      {MOCK_LEADS.map((l, i) => (
                        <div key={i} className="mock-row">
                          <div className="mock-avatar" style={{ background: l.bg, color: l.color, fontWeight: 700, fontSize: 13 }}>
                            {l.name[0]}
                          </div>
                          <div className="mock-name">{l.name}</div>
                          <div className="mock-email">{l.email}</div>
                          <div className="mock-badge" style={{ background: l.bg, color: l.color }}>
                            {l.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom badge */}
                <div style={{
                  position: 'absolute', bottom: -14, right: 24, zIndex: 10,
                  background: 'var(--lp-surface)', border: '1px solid var(--lp-border)',
                  padding: '5px 14px', borderRadius: 999,
                  fontSize: 11, fontWeight: 700, color: 'var(--lp-text)',
                  boxShadow: '0 6px 20px rgba(0,0,0,.10)',
                }}>
                  🌍 55+ Countries
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────────────────── */}
      <div className="lp-ticker">
        <div className="lp-ticker-track" aria-hidden="true">
          {TICKER_ITEMS.map((item, i) => (
            <div key={i} className="lp-ticker-item">{item}</div>
          ))}
        </div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <section className="lp-stats">
        <div className="container">
          <div className="lp-stats-grid">
            {[
              { val: '200', suf: '+', lbl: 'Clients Served'       },
              { val: '500', suf: '+', lbl: 'Projects Delivered'    },
              { val: '5',   suf: '+', lbl: 'Years Experience'      },
              { val: '98',  suf: '%', lbl: 'Client Satisfaction'   },
            ].map((s, i) => (
              <div key={i} className="lp-stat-item">
                <div className="lp-stat-val">{s.val}<span>{s.suf}</span></div>
                <div className="lp-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────────────── */}
      <section className="lp-services" id="services">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 52, alignItems: 'start', marginBottom: 52 }}>
            <div>
              <div className="lp-section-tag">What We Do</div>
              <h2 className="lp-section-title">
                Everything your business needs&nbsp;<span style={{ color: 'var(--lp-brand)' }}>online</span>
              </h2>
            </div>
            <div style={{ paddingTop: 14 }}>
              <p className="lp-section-sub">
                Not a one-trick agency. We cover the full stack of digital —
                from code to campaigns, design to deployment.
                One partner, everything covered, no finger-pointing between vendors.
              </p>
            </div>
          </div>
          <div className="lp-services-grid">
            {SERVICES.map((s, i) => (
              <div key={i} className="lp-service-card">
                <div className="lp-service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process (dark section) ───────────────────────────────────── */}
      <section className="lp-process" id="how">
        <div className="lp-process-bg" aria-hidden="true">PROCESS</div>
        <div className="container lp-process-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 56 }}>
            <div>
              <div className="lp-section-tag" style={{ borderColor: 'rgba(232,77,25,.4)', color: 'var(--lp-brand)' }}>
                How It Works
              </div>
              <h2 className="lp-section-title">
                Simple. Honest.&nbsp;<span style={{ color: 'var(--lp-brand)' }}>Effective.</span>
              </h2>
            </div>
            <p className="lp-section-sub">
              No endless discovery calls. No surprises mid-project.
              Just a clear process — from your first message to launch day.
            </p>
          </div>

          <div className="lp-steps">
            {[
              { n: '01', icon: '📝', title: 'Drop Us a Line',   body: 'Fill in the form — your name, budget, and what you\'re building. Takes about 90 seconds.' },
              { n: '02', icon: '🔍', title: 'We Take a Look',   body: 'A real human reviews your project within 24 hours. We ask smart questions, not boilerplate ones.' },
              { n: '03', icon: '🚀', title: 'We Get to Work',   body: 'We align on scope, sign off, and start building. You get updates — not silence.' },
            ].map((s, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <button className="lp-nav-cta" style={{ fontSize: 16, padding: '14px 32px' }} onClick={scrollToForm}>
              Start Your Project →
            </button>
          </div>
        </div>
      </section>

      {/* ── Reverse ticker ──────────────────────────────────────────── */}
      <div className="lp-ticker">
        <div className="lp-ticker-track" style={{ animationDirection: 'reverse' }} aria-hidden="true">
          {TICKER_ITEMS.map((item, i) => <div key={i} className="lp-ticker-item">{item}</div>)}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="container">
          <div className="lp-footer-inner">
            <div className="lp-footer-logo">
              <OrbLogo size={24} />
              NexOrbit
            </div>
            <p className="lp-footer-credit">
              Built for{' '}
              <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer">
                Digital Heroes Training Task
              </a>
            </p>
            <p className="lp-footer-copy">© {new Date().getFullYear()} NexOrbit Agency</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
