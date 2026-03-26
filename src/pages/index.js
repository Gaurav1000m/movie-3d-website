import Head from 'next/head';
import HeroSlider from '@/components/HeroSlider';
import Row from '@/components/Row';
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


