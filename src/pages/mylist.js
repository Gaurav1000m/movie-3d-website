import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from '@/components/MovieCard';
import { Bookmark, Ghost, ArrowLeft, Trash2 } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

export default function MyList() {
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session) {
          const { data, error } = await supabase.from('watchlist').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
          if (data && !error) {
             const formatted = data.map(item => ({
                id: item.media_id,
                title: item.title,
                name: item.title,
                poster_path: item.poster_path,
                media_type: item.media_type || 'movie'
             }));
             setSavedItems(formatted);
          }
       } else {
          const saved = localStorage.getItem('premium_ott_mylist');
          if (saved) {
             try { setSavedItems(JSON.parse(saved)); } catch(e) {}
          }
       }
    };
    fetchData();
  }, []);

  const clearList = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('watchlist').delete().eq('user_id', session.user.id);
    } else {
      localStorage.removeItem('premium_ott_mylist');
    }
    setSavedItems([]);
  };

  return (
    <>
      <Head>
        <title>My List - Cineverse</title>
      </Head>
      
      <div className="container mx-auto px-6 md:pl-[110px] lg:pl-[130px] lg:pr-12 pt-20 pb-24 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
             <Link href="/myspace" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                 <ArrowLeft size={20} className="text-gray-300" />
             </Link>
             <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">My Watchlist</h1>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                   <Bookmark size={16} /> Saved movies and shows.
                </p>
             </div>
          </div>
          
          {savedItems.length > 0 && (
             <button 
               onClick={clearList}
               className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors font-semibold shadow-lg"
             >
               <Trash2 size={18} /> Clear All
             </button>
          )}
        </div>

        <AnimatePresence>
          {savedItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-700 rounded-xl bg-[#16181f]"
            >
               <Ghost size={64} className="text-gray-600 mb-6 drop-shadow" />
               <h3 className="text-2xl font-bold text-white mb-2">No movies saved yet!</h3>
               <p className="text-gray-400 max-w-md">It&apos;s a bit empty here. Click the <span className="text-white font-bold">+</span> icon on any movie or TV show to add it to your personal watchlist.</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10"
            >
              {savedItems.map((movie, index) => (
                 <div key={movie.id} className="flex justify-center">
                   <MovieCard movie={movie} index={index} />
                 </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}


