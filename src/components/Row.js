import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, FreeMode, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';
import MovieCard from './MovieCard';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Row({ title, fetchMethod, id, href, initialData }) {
  const [movies, setMovies] = useState(initialData || []);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hasFetched, setHasFetched] = useState(!!initialData);
  const rowRef = useRef(null);

  useEffect(() => {
    if (initialData && movies.length === 0) {
      setMovies(initialData);
    }
  }, [initialData, movies.length]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasFetched) {
        setHasFetched(true);
      }
    }, { rootMargin: '300px' });
    
    if (rowRef.current) observer.observe(rowRef.current);
    
    return () => observer.disconnect();
  }, [hasFetched]);

  useEffect(() => {
    async function fetchData() {
      if (fetchMethod && hasFetched && movies.length === 0) {
         try {
           const data = await fetchMethod();
           setMovies(data);
         } catch (e) {
             console.error('fetch err', e);
         }
      }
    }
    fetchData();
  }, [fetchMethod, hasFetched, movies.length]);

  return (
    <div id={id} ref={rowRef} className="w-full relative py-3 md:py-5 pl-4 md:pl-[120px] 2xl:pl-[140px] z-20 overflow-visible row-container group/row min-h-[250px]">
      <div className="flex items-center justify-between pr-4 md:pr-12 mb-3 md:mb-4 gap-4">
        <h2 className="text-lg md:text-xl font-bold text-white/90 tracking-tight truncate min-w-0">
          {title}
        </h2>
        {href && (
          <Link href={href} className="shrink-0 text-sm md:text-base font-bold text-blue-500 hover:text-white transition-colors flex items-center gap-1 group whitespace-nowrap">
            See More <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      
      {(!movies || movies.length === 0) ? (
        <div className="w-full flex gap-4 overflow-hidden">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] shrink-0 aspect-[2/3] bg-[#1a1c23] animate-pulse rounded-md" />
           ))}
        </div>
      ) : (
        <div className="relative" onMouseLeave={() => setHoveredIndex(null)}>
          <Swiper
            modules={[Mousewheel, FreeMode, Scrollbar]}
            freeMode={true}
            mousewheel={{ forceToAxis: true }}
            scrollbar={{ draggable: true, hide: true }}
            spaceBetween={8}
            slidesPerView="auto"
            className="w-full h-full !overflow-visible pb-4 group-hover/row:visible"
            breakpoints={{
              320: { slidesPerView: 'auto', spaceBetween: 8 },
              640: { slidesPerView: 'auto', spaceBetween: 12 },
              1024: { slidesPerView: 'auto', spaceBetween: 16 },
              1440: { slidesPerView: 'auto', spaceBetween: 20 },
            }}
          >
            {movies.map((movie, index) => (
              <SwiperSlide key={movie.id} className="!w-auto">
                <MovieCard 
                  movie={movie} 
                  index={index}
                  hoveredIndex={hoveredIndex}
                  setHoveredIndex={setHoveredIndex}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}

