import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Play, Plus, Check } from 'lucide-react';
import { getTrendingMovies } from '@/services/tmdb';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Image from 'next/image';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w500';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10765: 'Sci-Fi & Fantasy', 
  10768: 'War & Politics', 10763: 'News', 10764: 'Reality', 10766: 'Soap', 10767: 'Talk'
};

const getGenreNames = (ids) => {
  if (!ids) return '';
  return ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 3).join(', ');
};

function HeroWatchlistBtn({ movie }) {
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (!movie?.id) return;
    const saved = localStorage.getItem('premium_ott_mylist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInWatchlist(parsed.some(item => item.id === movie.id));
      } catch (e) {}
    }
  }, [movie]);

  const toggleWatchlist = () => {
    const saved = localStorage.getItem('premium_ott_mylist');
    let parsed = [];
    try { parsed = saved ? JSON.parse(saved) : []; } catch(e){}
    
    if (inWatchlist) {
      parsed = parsed.filter(item => item.id !== movie.id);
      setInWatchlist(false);
    } else {
      parsed.unshift(movie);
      setInWatchlist(true);
    }
    localStorage.setItem('premium_ott_mylist', JSON.stringify(parsed));
  };

  return (
    <button 
      onClick={toggleWatchlist}
      className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border transition-all duration-300 rounded-md font-bold tracking-wide backdrop-blur-md shadow-lg ${
        inWatchlist 
          ? 'bg-white/20 border-white/50 text-white hover:bg-white/30' 
          : 'bg-black/40 border-white/20 hover:border-white/50 hover:bg-white/10 text-white'
      }`}
    >
       {inWatchlist ? <Check size={18} /> : <Plus size={18} />}
       <span className="hidden sm:inline">{inWatchlist ? 'SAVED' : 'MY LIST'}</span>
    </button>
  );
}

export default function HeroSlider({ initialData }) {
  const [movies, setMovies] = useState(initialData || []);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if ((!movies || movies.length === 0)) {
        const fetchMovies = async () => {
        const trending = await getTrendingMovies();
        setMovies(trending.slice(0, 10)); // Top 10 to give more scroll options
        };
        fetchMovies();
    }
  }, [movies.length]);

  if (!movies || movies.length === 0) {
    return <div className="w-full h-[60vh] md:h-[85vh] bg-[#141414] animate-pulse"></div>;
  }

  // Mobile View - Redesigned to match taratv style
  if (isMobile) {
    return (
      <div className="relative w-full bg-[#0a0b0f] hero-slider-mobile">
        <Swiper
          modules={[Autoplay, Pagination]}
          grabCursor={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          touchEventsTarget="container"
          threshold={5}
          className="w-full h-[85vh]"
        >
          {movies.map((movie, index) => {
            const title = movie.title || movie.name || movie.original_name;
            const type = movie.media_type || (movie.title ? 'movie' : 'tv');
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';
            const year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            const genres = getGenreNames(movie.genre_ids);
            
            return (
              <SwiperSlide key={movie.id}>
                <div className="relative w-full h-full overflow-hidden">
                  {/* Background Image - Blurred Backdrop */}
                   <Image 
                     src={`${TMDB_IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`} 
                     alt={title}
                     fill
                     className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm opacity-60"
                     priority={index < 2}
                     sizes="100vw"
                   />
                   
                   <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0f1014] via-[#0f1014]/80 to-transparent"></div>
 
                   <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                    {/* Centered Poster */}
                    <div className="w-32 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl mb-6 ring-1 ring-white/20">
                       <Image 
                         src={`${TMDB_POSTER_URL}${movie.poster_path}`} 
                         alt="poster" 
                         width={128}
                         height={192}
                         className="w-full h-full object-cover" 
                         priority={index < 2}
                       />
                     </div>

                    <div className="flex flex-col items-center text-center px-6">
                      <h3 className="text-white text-3xl font-black leading-tight mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] uppercase tracking-tight">
                        {title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4 text-sm font-bold">
                        <span className="text-yellow-400 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                          <Star size={14} className="fill-yellow-400" /> {rating}
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/80">{year}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/80 uppercase tracking-widest text-[10px]">{type}</span>
                      </div>

                      <p className="text-white/70 text-sm font-medium mb-6 line-clamp-2 max-w-[90%] drop-shadow-md">
                        {genres ? `${genres} • ` : ''}{movie.overview}
                      </p>

                      <div className="flex items-center gap-4 w-full justify-center">
                        <Link 
                          href={`/watch/${movie.id}?type=${type}`}
                          className="flex-1 max-w-[160px] flex items-center justify-center gap-2 bg-white text-black py-3.5 rounded-full text-sm font-black shadow-[0_4px_20px_rgba(255,255,255,0.3)] active:scale-95 transition-all uppercase tracking-widest"
                        >
                          <Play size={16} fill="currentColor" />
                          Watch
                        </Link>
                        <HeroWatchlistBtn movie={movie} />
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <style jsx global>{`
          .hero-slider-mobile .swiper-pagination { 
            bottom: 20px !important; 
            display: flex;
            justify-content: center;
            gap: 4px;
          }
          .hero-slider-mobile .swiper-pagination-bullet { 
            background: rgba(255,255,255,0.3) !important; 
            opacity: 1 !important;
            width: 8px;
            height: 8px;
            margin: 0 !important;
            transition: all 0.3s ease;
          }
          .hero-slider-mobile .swiper-pagination-bullet-active { 
            background: #fff !important; 
            width: 24px !important; 
            border-radius: 4px !important;
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
          }
        `}</style>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="relative w-full h-[75vh] md:h-[90vh] bg-[#0a0b0f] overflow-hidden select-none hero-slider-container">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        grabCursor={true}
        allowTouchMove={true}
        simulateTouch={true}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ 
          clickable: true,
          renderBullet: function (index, className) {
            return '<span class="' + className + ' custom-bullet"></span>';
          },
        }}
        loop={true}
        className="w-full h-full"
      >
        {movies.map((movie, index) => {
          const type = movie.media_type || (movie.title ? 'movie' : 'tv');
          const title = movie.title || movie.name || movie.original_name;
          const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';
          
          return (
            <SwiperSlide key={movie.id}>
              {/* Main Backdrop Image with Next/Image */}
              <div className="absolute inset-0 w-full h-full">
                 <Image
                   src={`${TMDB_IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`}
                   alt={title}
                   fill
                   className="object-cover object-top"
                   priority={index < 2}
                   sizes="100vw"
                   quality={90}
                 />
                 
                 {/* Subtle Vignette & Bottom Gradient */}
                 <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent pointer-events-none" />
                 <div className="absolute inset-y-0 left-0 w-full md:w-[80%] lg:w-[60%] bg-gradient-to-r from-[#0f1014] via-[#0f1014]/40 to-transparent pointer-events-none" />
              </div>
              
              {/* Hero Content */}
              <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 sm:px-8 md:pl-[120px] md:pr-12 pb-[50px] md:pb-[90px]">
                <div className="w-full flex md:items-center gap-6 md:gap-10">
                  
                  {/* Poster on Desktop */}
                  <div className="hidden lg:block w-[200px] xl:w-[240px] shrink-0 transform shadow-2xl rounded-xl overflow-hidden mt-10 border border-white/10 ring-1 ring-white/20">
                    <Image 
                      src={`${TMDB_POSTER_URL}${movie.poster_path}`} 
                      alt={title} 
                      width={240}
                      height={360}
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                      priority={index < 2}
                    />
                  </div>
                  
                  {/* Text Info */}
                  <div className="flex flex-col gap-3 md:gap-4 max-w-full md:max-w-[600px] lg:max-w-[700px]">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 leading-tight drop-shadow-2xl tracking-tight">
                      {title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-gray-300 font-medium">
                       <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-sm text-green-400 font-bold backdrop-blur-sm shadow-sm border border-white/5">
                         <Star size={14} className="fill-green-400" /> {rating}
                       </span>
                       <span className="text-gray-500">•</span>
                       <span>{movie.release_date?.substring(0,4) || movie.first_air_date?.substring(0,4)}</span>
                       <span className="text-gray-500">•</span>
                       <span className="truncate max-w-[200px] sm:max-w-none">{getGenreNames(movie.genre_ids)}</span>
                    </div>

                    <p className="text-sm md:text-base text-gray-400 font-normal max-w-full md:max-w-2xl line-clamp-3 lg:line-clamp-4 drop-shadow-md mt-1 leading-relaxed">
                      {movie.overview}
                    </p>

                    <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                      <Link
                        href={`/watch/${movie.id}?type=${type}`}
                        className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-white transition-all duration-300 rounded-md text-black font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                      >
                        <Play className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] fill-black" />
                        <span>WATCH NOW</span>
                      </Link>
                      
                      <HeroWatchlistBtn movie={movie} />
                    </div>
                  </div>

                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

