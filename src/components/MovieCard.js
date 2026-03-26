import { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

import Image from 'next/image';

export default function MovieCard({ movie, index, hoveredIndex, setHoveredIndex, isGrid }) {
  const [localHover, setLocalHover] = useState(false);
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');
  const title = movie.title || movie.name || movie.original_name;
  
  if(!movie.poster_path) return null;

  const isHovered = hoveredIndex !== undefined ? hoveredIndex === index : localHover;
  const isAnyHovered = hoveredIndex !== undefined ? hoveredIndex !== null : false;

  const handleMouseEnter = () => {
    if (setHoveredIndex) setHoveredIndex(index);
    setLocalHover(true);
  };

  const handleMouseLeave = () => {
    setLocalHover(false);
  };

  return (
    <div 
      className={`relative ${isGrid ? 'w-full max-w-[220px]' : 'w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px]'} shrink-0 cursor-pointer h-full my-4 md:my-0 transition-transform duration-500 ease-out`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: isHovered ? 50 : 10 }}
    >
      <Link href={`/watch/${movie.id}?type=${type}`} className="block w-full h-full">
        {/* The Card Object */}
        <div className={`relative w-full aspect-[2/3] overflow-hidden bg-[#16181f] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-center
           ${isGrid 
              ? (isHovered ? 'scale-110 -translate-y-3 rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.15)] ring-2 ring-blue-500/50' : 'rounded-xl shadow-lg scale-100')
              : (isHovered ? 'scale-[1.12] -translate-y-2 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] ring-1 ring-white/40' : `rounded-md shadow-md ${isAnyHovered ? 'scale-[0.96] opacity-50' : 'scale-100 opacity-100'}`)
           }
        `}>
          <Image
             src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
             alt={title}
             fill
             sizes="(max-width: 768px) 150px, (max-width: 1200px) 180px, 200px"
             className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
             priority={index < 8}
             loading={index < 8 ? 'eager' : 'lazy'}
             placeholder="blur"
             blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMTYxODFmIi8+"
             onError={(e) => {
               // Fallback if image.tmdb.org is blocked
               e.currentTarget.src = `https://www.themoviedb.org/t/p/w342${movie.poster_path}`;
             }}
          />
          
          {/* Smooth bottom gradient that appears on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          </div>

          {/* Elegant Center Play Button & Title */}
          <div className={`absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end items-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg mb-3">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
             </div>
             
             <span className="text-white text-xs md:text-sm font-semibold text-center w-full truncate drop-shadow-md tracking-wide">
                {title}
             </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

