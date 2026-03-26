import Link from 'next/link';

const BRANDS = [
  { name: 'Netflix', href: '/tvshows' },
  { name: 'Prime', href: '/movies' },
  { name: 'Max', href: '/movies' },
  { name: 'Disney+', href: '/movies' },
  { name: 'AppleTV', href: '/tvshows' },
  { name: 'Paramount', href: '/movies' },
];

export default function BrandStrip() {
  return (
    <div className="w-full bg-[#16181f]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-black text-white">Streaming</h3>
        <span className="text-xs text-gray-400 hidden sm:inline">Explore by network</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {BRANDS.map((b) => (
          <Link
            key={b.name}
            href={b.href}
            className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all font-bold text-sm text-white/90"
          >
            {b.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

