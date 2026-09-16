import { Link } from 'react-router-dom';
import { SparkleIcon } from '../ui/Icons';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-cream">
      <div className="container-fit grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-ivory">
              <SparkleIcon className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-bold text-ink">
              OutFit<span className="text-burgundy">Maker</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-soft">
            AI-powered fashion discovery. Find your style from a photo and your perfect fit in
            seconds.
          </p>
        </div>

        <div>
          <h3 className="eyebrow mb-4">Shop</h3>
          <ul className="space-y-3 text-sm text-slate-soft">
            <li><Link to="/shop" className="transition hover:text-burgundy">All Products</Link></li>
            <li><Link to="/categories" className="transition hover:text-burgundy">Categories</Link></li>
            <li><Link to="/shop?g=male" className="transition hover:text-burgundy">Men</Link></li>
            <li><Link to="/shop?g=female" className="transition hover:text-burgundy">Women</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4">AI Tools</h3>
          <ul className="space-y-3 text-sm text-slate-soft">
            <li><Link to="/style-finder" className="transition hover:text-burgundy">AI Style Finder</Link></li>
            <li><Link to="/find-size" className="transition hover:text-burgundy">Find My Size</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4">Account</h3>
          <ul className="space-y-3 text-sm text-slate-soft">
            <li><Link to="/favorites" className="transition hover:text-burgundy">Favorites</Link></li>
            <li><Link to="/auth" className="transition hover:text-burgundy">Sign In</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-6">
        <div className="container-fit flex flex-col items-center justify-between gap-3 text-xs text-slate-faint sm:flex-row">
          <p>© {new Date().getFullYear()} OutFitMaker. All rights reserved.</p>
          <p>Fashion first. AI second.</p>
        </div>
      </div>
    </footer>
  );
}
