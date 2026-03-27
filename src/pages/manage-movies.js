import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Search, 
  PlusCircle, 
  Trash2, 
  Server, 
  ExternalLink, 
  Code, 
  PlayCircle, 
  Info,
  ChevronRight,
  Tv,
  Monitor
} from 'lucide-react';
import { searchContent, getMovieDetails } from '@/services/tmdb';

export default function ManageMovies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [newSource, setNewSource] = useState({ 
    title: '', 
    source_type: 'server', 
    url: '', 
    embed_code: '' 
  });
  
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.email !== 'gaurav1000m@gmail.com') {
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);

  const fetchSources = async (tmdbId, mediaType) => {
    const { data } = await supabase
      .from('movie_sources')
      .select('*')
      .eq('tmdb_id', tmdbId.toString())
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false });
    
    if (data) setSources(data);
  };

  // Removed redundant useEffect to avoid cascading renders
  // fetchSources is now called directly in selectMovie and handleAddSource

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    const results = await searchContent(searchQuery);
    setSearchResults(results.filter(r => r.media_type === 'movie' || r.media_type === 'tv'));
    setLoading(false);
  };

  const selectMovie = async (movie) => {
    setLoading(true);
    const details = await getMovieDetails(movie.id, movie.media_type);
    setSelectedMovie({ ...details, media_type: movie.media_type });
    await fetchSources(movie.id, movie.media_type);
    setLoading(false);
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !newSource.title) return;

    const sourceData = {
      tmdb_id: selectedMovie.id.toString(),
      media_type: selectedMovie.media_type,
      title: newSource.title,
      source_type: newSource.source_type,
      url: newSource.url,
      embed_code: newSource.embed_code,
      poster_path: selectedMovie.poster_path, // Useful for list views
      movie_title: selectedMovie.title || selectedMovie.name
    };

    const { data, error } = await supabase.from('movie_sources').insert([sourceData]).select();
    if (!error && data) {
      setSources([data[0], ...sources]);
      setNewSource({ title: '', source_type: 'server', url: '', embed_code: '' });
    } else {
      console.error(error);
      alert('Failed to save source. Ensure the movie_sources table exists in Supabase.');
    }
  };

  const handleDeleteSource = async (id) => {
    const { error } = await supabase.from('movie_sources').delete().eq('id', id);
    if (!error) {
      setSources(sources.filter(s => s.id !== id));
    }
  };

  const getSourceIcon = (type) => {
    switch(type) {
      case 'server': return <Server size={18} className="text-blue-400" />;
      case 'external': return <ExternalLink size={18} className="text-green-400" />;
      case 'direct': return <PlayCircle size={18} className="text-red-400" />;
      case 'embed': return <Code size={18} className="text-purple-400" />;
      default: return <Monitor size={18} />;
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] pt-16 pb-24 md:pl-[100px] lg:pl-[120px] font-sans selection:bg-indigo-500/30">
      <Head>
        <title>Manage Sources - Admin</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Film size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Movie Manager</h1>
              <p className="text-[#a0a0a0] mt-1 font-medium">Add and edit custom streaming sources for TMDB content.</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Movie / TV to manage..."
              className="w-full bg-[#111115] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Search Results / Selected Movie Info */}
          <div className="lg:col-span-4 space-y-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-medium">Searching TMDB...</p>
                </motion.div>
              ) : selectedMovie ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key="selected"
                  className="bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl sticky top-24"
                >
                  <div className="relative aspect-[2/3] group">
                    <Image 
                      src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`} 
                      className="w-full h-full object-cover"
                      alt={selectedMovie.title || selectedMovie.name}
                      width={500}
                      height={750}
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
                    <button 
                      onClick={() => setSelectedMovie(null)}
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                    >
                      Change Movie
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase rounded-full tracking-wider border border-indigo-500/20">
                         {selectedMovie.media_type}
                       </span>
                       <span className="px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-bold uppercase rounded-full tracking-wider border border-white/5">
                         {selectedMovie.release_date?.slice(0, 4) || selectedMovie.first_air_date?.slice(0, 4)}
                       </span>
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight">
                      {selectedMovie.title || selectedMovie.name}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {selectedMovie.overview}
                    </p>
                  </div>
                </motion.div>
              ) : searchResults.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 gap-3"
                >
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Results Found ({searchResults.length})</p>
                  {searchResults.map((result) => (
                    <button
                      key={`${result.media_type}-${result.id}`}
                      onClick={() => selectMovie(result)}
                      className="flex items-center gap-4 p-3 bg-[#111115] hover:bg-white/5 border border-white/5 rounded-2xl text-left transition-all group"
                    >
                      <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-gray-900 shadow-lg">
                        <Image 
                          src={result.poster_path ? `https://image.tmdb.org/t/p/w185${result.poster_path}` : '/placeholder.jpg'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={result.title || result.name || ""}
                          width={185}
                          height={278}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {result.media_type === 'tv' ? <Tv size={12} className="text-blue-400" /> : <Film size={12} className="text-indigo-400" />}
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{result.media_type}</span>
                        </div>
                        <h4 className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                          {result.title || result.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {result.release_date?.slice(0, 4) || result.first_air_date?.slice(0, 4)}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </motion.div>
              ) : (
                <div className="bg-[#0a0a0c] border border-white/5 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-300">Start Management</h3>
                  <p className="text-gray-500 text-sm max-w-[240px]">Search for a movie or TV show to see existing sources or add new ones.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Sources Management */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {selectedMovie ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Form to add new Source */}
                  <div className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <PlusCircle className="text-indigo-500" /> Add New Streaming Source
                    </h3>
                    
                    <form onSubmit={handleAddSource} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Source Label</label>
                        <input 
                          type="text"
                          value={newSource.title}
                          onChange={(e) => setNewSource({...newSource, title: e.target.value})}
                          placeholder="e.g., Premium Server 1"
                          className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Source Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'server', label: 'Server', icon: <Server size={14} /> },
                            { id: 'external', label: 'External', icon: <ExternalLink size={14} /> },
                            { id: 'embed', label: 'Embed Code', icon: <Code size={14} /> },
                            { id: 'direct', label: 'Direct Video', icon: <PlayCircle size={14} /> }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setNewSource({...newSource, source_type: t.id})}
                              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${newSource.source_type === t.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#111115] border-white/5 text-gray-500 hover:text-gray-300'}`}
                            >
                              {t.icon} {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                          {newSource.source_type === 'embed' ? 'HTML Embed Code' : 'Source URL (HLS/MP4/Iframe Link)'}
                        </label>
                        {newSource.source_type === 'embed' ? (
                          <textarea 
                            value={newSource.embed_code}
                            onChange={(e) => setNewSource({...newSource, embed_code: e.target.value})}
                            placeholder="<iframe src='...' ></iframe>"
                            className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all min-h-[120px] font-mono text-sm"
                            required
                          />
                        ) : (
                          <input 
                            type="url"
                            value={newSource.url}
                            onChange={(e) => setNewSource({...newSource, url: e.target.value})}
                            placeholder={newSource.source_type === 'direct' ? "https://example.com/video.m3u8" : "https://player.com/embed/..."}
                            className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                            required
                          />
                        )}
                      </div>

                      <div className="md:col-span-2 pt-2">
                        <button 
                          type="submit"
                          className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-base shadow-xl active:scale-[0.98]"
                        >
                          <PlusCircle size={20} /> Deploy Source to {selectedMovie.media_type === 'movie' ? 'Movie' : 'Series'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Sources List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3 px-2">
                      <Server className="text-gray-500" /> Active Sources ({sources.length})
                    </h3>
                    
                    {sources.length === 0 ? (
                      <div className="bg-[#0a0a0c] border border-white/5 border-dashed rounded-3xl py-12 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Info size={20} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-medium">No custom sources added yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {sources.map((source) => (
                          <div 
                            key={source.id}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                                 {getSourceIcon(source.source_type)}
                               </div>
                               <div>
                                 <h4 className="font-bold text-white flex items-center gap-2">
                                   {source.title}
                                   <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                                     {source.source_type}
                                   </span>
                                 </h4>
                                 <p className="text-xs text-gray-500 mt-1 truncate max-w-[300px] font-mono">
                                   {source.source_type === 'embed' ? 'HTML Snippet Hidden' : source.url}
                                 </p>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleDeleteSource(source.id)}
                                className="p-3 text-gray-500 hover:text-red-500 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                title="Delete Source"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4 opacity-50">
                    <div className="w-20 h-20 border-2 border-white/10 border-dashed rounded-full flex items-center justify-center mx-auto">
                      <Film size={32} />
                    </div>
                    <p className="text-gray-400 font-medium max-w-xs mx-auto">Select a movie from the search results to start managing its streaming links.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
