import { Link, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../utils/imageHelper';

export function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const total = params.get('total');

  return (
    <div className="container-fit flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white/70 p-10 text-center animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-burgundy text-2xl text-ivory">
          ✓
        </div>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-ink">Order placed!</h1>
        <p className="mt-3 text-sm text-slate-soft">
          Thank you for shopping with OutFitMaker. Your order has been received.
        </p>
        {orderId && (
          <p className="mt-4 text-xs text-slate-faint">Order reference: {orderId.slice(0, 8)}</p>
        )}
        {total && (
          <p className="mt-2 font-serif text-2xl font-semibold text-burgundy">
            Total {formatPrice(Number(total))}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          <Link to="/style-finder" className="btn-ghost">Discover More with AI</Link>
        </div>
      </div>
    </div>
  );
}
