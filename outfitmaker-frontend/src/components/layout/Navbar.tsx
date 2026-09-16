import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  BagIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  SparkleIcon,
  RulerIcon,
  UserIcon,
} from '../ui/Icons';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/style-finder', label: 'AI Style Finder' },
  { to: '/find-size', label: 'Find My Size' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { count, openCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'relative text-sm font-medium transition-colors hover:text-burgundy ' +
    (isActive ? 'text-burgundy' : 'text-charcoal');

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/90 backdrop-blur-md">
      <div className="container-fit flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-full p-2 text-ink lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-ivory">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg font-bold tracking-tight text-ink">
            OutFit<span className="text-burgundy">Maker</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>
              {({ isActive }) => (
                <span className="relative">
                  {l.label.replace('AI Style Finder', 'AI Style Finder')}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded bg-burgundy" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <form onSubmit={submitSearch} className="hidden items-center md:flex" role="search">
            <div className="flex items-center gap-2 rounded-full border border-transparent bg-transparent px-2 py-1.5 transition focus-within:border-ink/20">
              <SearchIcon className="h-4 w-4 text-slate-soft" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                aria-label="Search products"
                className="w-24 bg-transparent text-sm text-ink placeholder:text-slate-faint focus:outline-none focus:ring-0"
              />
            </div>
          </form>

          <Link
            to="/favorites"
            className="relative rounded-full p-2 text-ink transition hover:bg-ink/5 hover:text-burgundy"
            aria-label="Favorites"
          >
            <HeartIcon className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2 text-ink transition hover:bg-ink/5 hover:text-burgundy"
            aria-label="Open cart"
          >
            <BagIcon className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full p-2 text-ink transition hover:bg-ink/5"
                aria-label="Account"
              >
                <UserIcon className="h-5 w-5" />
              </button>
              <div className="invisible absolute right-0 top-full mt-2 w-56 rounded-2xl border border-line bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <p className="px-3 py-2 text-sm font-semibold text-ink">{user?.name || 'Account'}</p>
                <Link to="/favorites" className="block rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-ivory">
                  My Favorites
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-burgundy hover:bg-ivory"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ivory transition hover:bg-burgundy sm:inline-flex"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="border-t border-line bg-ivory px-6 py-4 lg:hidden animate-fade-in"
          aria-label="Mobile"
        >
          <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5" role="search">
            <SearchIcon className="h-4 w-4 text-slate-soft" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </form>
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium ' +
                    (isActive ? 'bg-burgundy/10 text-burgundy' : 'text-charcoal hover:bg-white')
                  }
                >
                  {l.label === 'AI Style Finder' && <SparkleIcon className="h-4 w-4" />}
                  {l.label === 'Find My Size' && <RulerIcon className="h-4 w-4" />}
                  <span>{l.label.replace('AI Style Finder', 'AI Style Finder')}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-line pt-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full rounded-xl px-3 py-3 text-left text-base font-medium text-burgundy hover:bg-white"
              >
                Sign out ({user?.name})
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-ink px-4 py-3 text-sm font-semibold text-ivory"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
