import Head from 'next/head';
import { motion } from 'framer-motion';
import HeroSlider from '@/components/HeroSlider';
import Row from '@/components/Row';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getNetflixOriginals, getGenreMovies, getBollywoodMovies, getAnime } from '@/services/tmdb';

export async function getStaticProps() {
  try {
    const [trending, bollywood, popular] = await Promise.all([
      getTrendingMovies(),
      getBollywoodMovies(),
      getPopularMovies()
    ]);

    return {
      props: {
        initialData: {
          trending: Array.isArray(trending) ? trending.slice(0, 10) : [],
          bollywood: Array.isArray(bollywood) ? bollywood.slice(0, 10) : [],
          popular: Array.isArray(popular) ? popular.slice(0, 10) : [],
        }
      },
      revalidate: 3600
    };
  } catch (error) {
    return { props: { initialData: {} } };
  }
}

export default function Home({ initialData }) {
  return (
    <>
      <Head>
        <title>Cinevarse | Premium Streaming</title>
        <meta name="description" content="A simple, clean streaming platform for all your favorite content." />
      </Head>

      <div className="relative w-full min-h-screen bg-[#0f1014] selection:bg-blue-500/20 text-white pb-20 overflow-x-hidden">
        
        {/* Simple Page Container */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 space-y-12"
        >
          {/* Main Hero View */}
          <div className="w-full">
            <HeroSlider initialData={initialData?.trending} />
          </div>

          <div className="relative z-20 flex flex-col space-y-14 px-4 md:px-0">
            <Row title="Trending Movies" fetchMethod={getTrendingMovies} id="trending" />
            <Row title="Bollywood Greats" fetchMethod={getBollywoodMovies} id="bollywood" />
            <Row title="Original Hits" fetchMethod={getNetflixOriginals} id="originals" />
            <Row title="Top Picks" fetchMethod={getTopRatedMovies} id="top-rated" />
            <Row title="Anime Collection" fetchMethod={getAnime} id="anime" />
            
            <div className="py-20 text-center opacity-5 select-none font-black text-6xl md:text-9xl uppercase tracking-tighter">
              Cinevarse
            </div>

            <Row title="Action Stories" fetchMethod={() => getGenreMovies(28)} id="action" />
            <Row title="Comedy Night" fetchMethod={() => getGenreMovies(35)} id="comedy" />
          </div>
        </motion.div>
      </div>
    </>
  );
}
