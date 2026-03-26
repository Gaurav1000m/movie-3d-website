import Head from 'next/head';
import HeroSlider from '@/components/HeroSlider';
import Row from '@/components/Row';
import Top10Widget from '@/components/Top10Widget';
import BrandStrip from '@/components/BrandStrip';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getNetflixOriginals, getGenreMovies, getBollywoodMovies, getAnime } from '@/services/tmdb';

export async function getStaticProps() {
  try {
    // We pre-fetch some data for the static page, but with a high revalidate
    // so it doesn't block page loads if the API is slow.
    const [trending, bollywood, popular] = await Promise.all([
      getTrendingMovies().catch(() => []),
      getBollywoodMovies().catch(() => []),
      getPopularMovies().catch(() => [])
    ]);

    return {
      props: {
        initialData: {
          trending,
          bollywood,
          popular
        }
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (err) {
    console.error("GStaticProps Error:", err);
    return { 
      props: { initialData: {} },
      revalidate: 60 
    };
  }
}

export default function Home({ initialData }) {
  return (
    <>
      <Head>
        <title>Home - Cineverse</title>
        <meta name="description" content="Cinematic streaming experience for movies and TV shows." />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </Head>

      <div className="w-full relative bg-[#0f1014] min-h-screen">
         <HeroSlider />
         
         {/* Adjusted spacing between hero slider and row */}
         <div className="relative z-20 -mt-8 md:-mt-[60px] flex flex-col gap-8 md:gap-14 pb-20">
           <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6 md:gap-8 items-start pl-4 md:pl-[120px] 2xl:pl-[140px] pr-4 md:pr-12">
             <Top10Widget items={initialData?.trending || []} />
             <div className="space-y-4">
               <BrandStrip />
               <div className="w-full bg-[#16181f]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                 <h3 className="text-base md:text-lg font-black text-white">Cineverse UI</h3>
                 <p className="text-sm md:text-[14px] text-gray-400 mt-1 leading-relaxed">
                   A cleaner, faster browsing experience inspired by cineby.sc, with a modern hero, sharper typography, and
                   more “glass” surfaces.
                 </p>
                 <div className="mt-4 flex flex-wrap gap-2">
                   <span className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full font-semibold">Tailwind</span>
                   <span className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full font-semibold">Framer</span>
                   <span className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full font-semibold">Swiper</span>
                 </div>
               </div>
             </div>
           </div>

           <Row title="Trending Now" fetchMethod={getTrendingMovies} initialData={initialData?.trending} id="trending" href="/trending" />
           <Row title="Bollywood Hits" fetchMethod={getBollywoodMovies} initialData={initialData?.bollywood} id="bollywood" href="/movies" />
           <Row title="Popular on Cineverse" fetchMethod={getPopularMovies} initialData={initialData?.popular} id="popular" href="/movies" />
           <Row title="Cineverse Originals" fetchMethod={getNetflixOriginals} id="originals" href="/tvshows" />
           <Row title="Top Rated" fetchMethod={getTopRatedMovies} id="top-rated" href="/movies" />
           <Row title="Anime" fetchMethod={getAnime} id="anime" href="/anime" />
           <Row title="Action Movies" fetchMethod={() => getGenreMovies(28)} id="action" href="/movies?genre=28" />
           <Row title="Comedies" fetchMethod={() => getGenreMovies(35)} id="comedy" href="/movies?genre=35" />
           <Row title="Horror Movies" fetchMethod={() => getGenreMovies(27)} id="horror" href="/movies?genre=27" />
           <Row title="Romance" fetchMethod={() => getGenreMovies(10749)} id="romance" href="/movies?genre=10749" />
         </div>
      </div>
    </>
  );
}


