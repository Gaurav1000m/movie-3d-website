import { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function MovieCard({ movie, index, isGrid }) {
  const [isHovered, setIsHovered] = useState(false);
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');
  const title = movie.title || movie.name || movie.original_name;
  
  if(!movie.poster_path) return null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 100
      }}
      className={`relative ${isGrid ? 'w-full' : 'w-[140px] sm:w-[170px] md:w-[200px] lg:w-[220px]'} shrink-0 cursor-pointer h-full z-10`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/watch/${movie.id}?type=${type}`} className="block w-full h-full p-2">
        <div className="relative group/card w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
          
          {/* Animated Glowing Border on Hover */}
          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 via-purple-500/20 to-blue-400/40 p-[2px]">
              <div className="w-full h-full bg-[#0f1014] rounded-2xl" />
            </div>
          </div>

          <Image
             src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
             alt={title}
             fill
             sizes="(max-width: 768px) 170px, (max-width: 1200px) 200px, 220px"
             className={`w-full h-full object-cover transition-transform duration-700 ease-out z-0 ${isHovered ? 'scale-110 blur-[2px]' : 'scale-100'}`}
             priority={index < 8}
             loading={index < 8 ? 'eager' : 'lazy'}
          />
          
          {/* Content Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-4"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  <h3 className="text-white font-black text-sm md:text-base leading-tight drop-shadow-lg line-clamp-2">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                    <span>{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
                    <span>•</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-white">{movie.vote_average?.toFixed(1) || 'NR'}</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Static Title for non-hovered state (subtle) */}
          {!isHovered && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity">
               <span className="text-white text-[10px] font-bold truncate block">{title}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
