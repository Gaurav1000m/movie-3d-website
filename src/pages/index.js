import Head from 'next/head';
import HeroSlider from '@/components/HeroSlider';
import Row from '@/components/Row';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getNetflixOriginals, getGenreMovies, getBollywoodMovies, getAnime } from '@/services/tmdb';

import { motion, useScroll, useSpring } from 'framer-motion';


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
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <Head>
        <title>Cineverse | Unlimited Movies & TV Shows</title>
        <meta name="description" content="Stream the latest movies and TV shows in stunning detail with Cineverse 3D." />
      </Head>

      <div className="relative w-full min-h-screen bg-[#0a0b0f] selection:bg-blue-500/30 overflow-x-hidden">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 z-[100] origin-left"
          style={{ scaleX }}
        />

        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="relative z-10"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="w-full">
            <HeroSlider initialData={initialData?.trending} />
          </motion.div>

          <div className="relative z-20 flex flex-col -mt-10 md:-mt-24 pb-20 space-y-10 md:space-y-16">
            <motion.div variants={itemVariants}>
              <Row title="Trending Now" fetchMethod={getTrendingMovies} initialData={initialData?.trending} id="trending" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Bollywood Hits" fetchMethod={getBollywoodMovies} initialData={initialData?.bollywood} id="bollywood" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Cineverse Originals" fetchMethod={getNetflixOriginals} id="originals" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Top Rated Classics" fetchMethod={getTopRatedMovies} id="top-rated" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Anime Universe" fetchMethod={getAnime} id="anime" />
            </motion.div>

            <motion.div variants={itemVariants}>
               <div className="py-10 text-center text-white/20 font-black text-5xl md:text-8xl tracking-tighter select-none pointer-events-none opacity-50 uppercase">
                 Cineverse
               </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Action Blockbusters" fetchMethod={() => getGenreMovies(28)} id="action" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row title="Laugh Out Loud" fetchMethod={() => getGenreMovies(35)} id="comedy" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}





