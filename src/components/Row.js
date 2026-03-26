import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
    <motion.div 
      id={id} 
      ref={rowRef} 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full relative py-4 md:py-8 pl-4 md:pl-[110px] 2xl:pl-[130px] z-20 overflow-visible row-container group/row min-h-[250px]"
    >
      <div className="flex items-end justify-between pr-4 md:pr-14 mb-5 md:mb-7 gap-4">

        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-none group-hover/row:text-blue-500 transition-colors duration-500">
            {title}
          </h2>
          <div className="w-12 h-1 bg-blue-600 rounded-full scale-x-0 group-hover/row:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
        {href && (
          <Link href={href} className="shrink-0 text-sm md:text-base font-bold text-gray-400 hover:text-white transition-all flex items-center gap-1 group/more pb-1">
            Explore All <ChevronRight size={18} className="group-hover/more:translate-x-1.5 transition-transform" />
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
    </motion.div>
  );
}


