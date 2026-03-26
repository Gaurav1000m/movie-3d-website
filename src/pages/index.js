import Head from 'next/head';
import HeroSlider from '@/components/HeroSlider';
import Row from '@/components/Row';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getNetflixOriginals, getGenreMovies, getBollywoodMovies, getAnime } from '@/services/tmdb';

import { motion } from 'framer-motion';


export async function getStaticProps() {
  try {
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
      revalidate: 3600
    };
  } catch (err) {
    console.error("GStaticProps Error:", err);
    return { 
      props: { initialData: {} },
      revalidate: 60 
    };
  }
}


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home({ initialData }) {
  return (
    <>
      <Head>
        <title>Home - Cineverse</title>
        <meta name="description" content="Cinematic streaming experience for movies and TV shows." />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </Head>

      <div className="w-full relative bg-[#0f1014] min-h-screen overflow-x-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10"
        >
          <motion.div variants={itemVariants}>
            <HeroSlider initialData={initialData?.trending} />
          </motion.div>
          
          <div className="relative z-20 -mt-8 md:-mt-[60px] flex flex-col gap-6 md:gap-12 pb-20 overflow-visible">
            <motion.div variants={itemVariants}>
              <Row title="Trending Now" fetchMethod={getTrendingMovies} initialData={initialData?.trending} id="trending" href="/trending" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Bollywood Hits" fetchMethod={getBollywoodMovies} initialData={initialData?.bollywood} id="bollywood" href="/movies" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Popular on Cineverse" fetchMethod={getPopularMovies} initialData={initialData?.popular} id="popular" href="/movies" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Cineverse Originals" fetchMethod={getNetflixOriginals} id="originals" href="/tvshows" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Top Rated" fetchMethod={getTopRatedMovies} id="top-rated" href="/movies" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Anime Collection" fetchMethod={getAnime} id="anime" href="/anime" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Action Blockbusters" fetchMethod={() => getGenreMovies(28)} id="action" href="/movies?genre=28" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Laugh Out Loud Comedies" fetchMethod={() => getGenreMovies(35)} id="comedy" href="/movies?genre=35" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}




