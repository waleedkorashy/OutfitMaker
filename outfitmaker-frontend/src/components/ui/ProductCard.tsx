import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { resolveImageUrl, formatPrice } from '../../utils/imageHelper';
import { useCart } from '../../context/CartContext';
import { FavoriteButton } from './FavoriteButton';
import { BagIcon } from './Icons';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const imageSrc = resolveImageUrl(product.imageUrl);

  return (
    <article className="group/card relative flex flex-col">
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden rounded-2xl bg-sand">
        <div className="aspect-[3/4] w-full overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = resolveImageUrl(undefined);
            }}
          />
        </div>

        <div className="absolute right-3 top-3">
          <FavoriteButton product={product} />
        </div>

        {/* Hover actions */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-3 items-center gap-2 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="pointer-events-auto flex flex-1 items-center justify-center gap-2 rounded-full bg-ink/90 px-4 py-2.5 text-xs font-semibold text-ivory backdrop-blur transition hover:bg-burgundy"
          >
            <BagIcon className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </Link>

      <div className="mt-3 px-0.5">
        <Link
          to={`/product/${product.id}`}
          className="flex items-baseline justify-between gap-2"
        >
          <h3 className="line-clamp-1 font-medium text-ink transition-colors hover:text-burgundy">
            {product.name}
          </h3>
        </Link>
        {product.categoryName && (
          <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-faint">
            {product.categoryName}
          </p>
        )}
        <p className="mt-1.5 font-serif text-lg font-semibold text-burgundy">
          {formatPrice(product.price)}
        </p>
        <button
          type="button"
          onClick={() => navigate(`/product/${product.id}`)}
          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ink underline-offset-4 hover:text-burgundy hover:underline"
        >
          View product
        </button>
      </div>
    </article>
  );
}
