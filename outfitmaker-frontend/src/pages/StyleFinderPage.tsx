import { useRef, useState } from 'react';
import type { Product } from '../types';
import { recommendFromImage } from '../services/productService';
import { ProductCard } from '../components/ui/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SparkleIcon, UploadIcon, CloseIcon } from '../components/ui/Icons';

type Phase = 'idle' | 'analyzing' | 'success' | 'error';

export function StyleFinderPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [dragOver, setDragOver] = useState(false);

  function selectFile(file: File | undefined | null) {
    if (!file) return;
    // Client-side preview via object URL
    const url = URL.createObjectURL(file);
    setPreview(url);
    analyze(file);
  }

  async function analyze(file: File) {
    setPhase('analyzing');
    setResults([]);
    try {
      const data = await recommendFromImage(file);
      setResults(data);
      setPhase(data.length ? 'success' : 'error');
    } catch {
      setPhase('error');
    }
  }

  function resetAll() {
    setPhase('idle');
    setResults([]);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="container-fit py-12 lg:py-16">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <p className="eyebrow mb-4 flex items-center justify-center gap-2">
          <SparkleIcon className="h-4 w-4 text-burgundy" /> AI Style Finder
        </p>
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Find Your Style From a Photo</h1>
        <p className="mt-4 text-lg text-slate-soft">
          Upload a clothing item you love and let our AI find visually similar pieces from our
          collection.
        </p>
      </header>

      {/* Upload area */}
      {phase === 'idle' && (
        <div
          className={`mx-auto max-w-xl rounded-3xl border-2 border-dashed p-10 text-center transition ${
            dragOver ? 'border-burgundy bg-burgundy/5' : 'border-line bg-white/60'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            selectFile(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            id="style-upload"
            onChange={(e) => selectFile(e.target.files?.[0])}
          />
          <label
            htmlFor="style-upload"
            className="flex cursor-pointer flex-col items-center gap-5"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-burgundy/10 text-burgundy transition group-hover:bg-burgundy">
              <UploadIcon className="h-9 w-9" />
            </span>
            <span>
              <span className="block text-lg font-semibold text-ink">Upload a clothing image</span>
              <span className="mt-1 block text-sm text-slate-soft">JPG, PNG supported</span>
            </span>
            <span className="btn-primary pointer-events-none">Choose Image</span>
          </label>
        </div>
      )}

      {/* Analyzing */}
      {phase === 'analyzing' && (
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white/70 p-10 text-center animate-fade-in">
          <div className="mb-6 overflow-hidden rounded-2xl bg-cream">
            {preview && (
              <img src={preview} alt="Your uploaded clothing" className="mx-auto max-h-72 object-contain" />
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-burgundy">
            <SparkleIcon className="h-5 w-5" />
            <h2 className="font-serif text-2xl font-semibold">ANALYZING YOUR STYLE</h2>
          </div>
          <p className="mt-3 text-sm text-slate-soft">
            We’re comparing your image with our fashion collection…
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="ai-dot" />
            <span className="ai-dot [animation-delay:150ms]" />
            <span className="ai-dot [animation-delay:300ms]" />
          </div>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="mx-auto max-w-xl animate-fade-in">
          <ErrorState
            title="We couldn’t analyze that image."
            message="Please try another clothing image."
            actionLabel="Try Again"
            onAction={resetAll}
          />
        </div>
      )}

      {/* Results */}
      {phase === 'success' && (
        <div className="animate-fade-in">
          <div className="mx-auto mb-8 max-w-xl overflow-hidden rounded-3xl border border-line bg-white/70 text-center">
            <div className="bg-cream p-6">
              <h2 className="font-serif text-3xl font-semibold text-ink">Style Matches Found</h2>
              <p className="mt-2 text-sm text-slate-soft">
                We found pieces you might love.
              </p>
            </div>
            {preview && (
              <div className="border-t border-line p-6">
                <p className="mb-3 text-xs uppercase tracking-widest text-slate-faint">Your Image</p>
                <img
                  src={preview}
                  alt="Your uploaded clothing"
                  className="mx-auto max-h-64 rounded-2xl object-contain"
                />
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Similar Styles We Found</h2>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy hover:underline"
            >
              <CloseIcon className="h-4 w-4" /> New search
            </button>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No similar styles found"
              message="Try another image for better matches."
              actionLabel="Try Another Image"
              onAction={resetAll}
            />
          )}
        </div>
      )}
    </div>
  );
}
