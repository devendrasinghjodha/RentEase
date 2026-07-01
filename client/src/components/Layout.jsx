import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, HeartHandshake, ShoppingBag, Sparkles } from 'lucide-react';

export const SiteHeader = ({ user, onLogout }) => (
  <header className="navbar">
    <div className="container navbar-inner">
      <Link to="/" className="navbar-logo">
        <HeartHandshake size={24} />
        Rent<span>Ease</span>
      </Link>

      <nav className="navbar-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/cart">Cart</NavLink>
        <NavLink to="/rentals">Rentals</NavLink>
        <NavLink to="/support">Support</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <NavLink to="/dashboard">Overview</NavLink>
        <NavLink to="/documentation">Docs</NavLink>
      </nav>

      <div className="navbar-actions">
        <Link to="/shop" className="btn btn-secondary btn-sm">
          <ShoppingBag size={16} /> Browse
        </Link>
        {user ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm">
            <Sparkles size={16} /> Sign in
          </Link>
        )}
      </div>
    </div>
  </header>
);

export const Hero = ({ title, subtitle, actions, highlight, metrics }) => (
  <section className="hero">
    <div className="container hero-shell">
      <div className="hero-content animate-in">
        <span className="eyebrow">Furniture and appliance rental for urban moves</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="hero-actions">
          {actions}
        </div>
        {highlight ? <div className="hero-highlight glass-card">{highlight}</div> : null}
        {metrics ? (
          <div className="hero-stats">
            {metrics.map((metric) => (
              <div key={metric.label} className="hero-stat">
                <h3>{metric.value}</h3>
                <p>{metric.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  </section>
);

export const SectionHeader = ({ eyebrow, title, description }) => (
  <div className="section-title">
    {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
    <h2>{title}</h2>
    {description ? <p>{description}</p> : null}
  </div>
);

export const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <Link to="/" className="navbar-logo">
          <HeartHandshake size={22} /> Rent<span>Ease</span>
        </Link>
        <p>Monthly rentals for furniture and appliances, built for quick move-ins and low-friction living.</p>
      </div>
      <div>
        <h4>Platform</h4>
        <div className="footer-links">
          <Link to="/catalog">Catalog</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/documentation">Documentation</Link>
        </div>
      </div>
      <div>
        <h4>Use Cases</h4>
        <div className="footer-links">
          <Link to="/">Students</Link>
          <Link to="/">Professionals</Link>
          <Link to="/">Urban relocations</Link>
        </div>
      </div>
      <div>
        <h4>Flow</h4>
        <div className="footer-links">
          <Link to="/catalog">Browse</Link>
          <Link to="/dashboard">Track rentals</Link>
          <Link to="/documentation">Read PRD</Link>
        </div>
      </div>
    </div>
    <div className="container footer-bottom">
      <span>Deployment-ready React + Express reference build.</span>
      <Link to="/documentation" className="footer-link-inline">
        View technical documentation <ArrowRight size={14} />
      </Link>
    </div>
  </footer>
);
