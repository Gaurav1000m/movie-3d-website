import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { Play, Plus, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { getMovieDetails, getTvSeasons } from '@/services/tmdb';
import Player from '@/components/Player';
import Row from '@/components/Row';

function AdMobAd({ content }) {
  const adClient = (content || '').split('/')[0]?.replace('ca-app-pub', 'ca-pub') || '';
  const adSlot = (content || '').split('/')[1] || '';
  const containerRef = useRef(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isLoaded.current) return;

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.style.width = '100%';
    ins.style.height = '100%';
    ins.setAttribute('data-ad-client', adClient);
    ins.setAttribute('data-ad-slot', adSlot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    
    containerRef.current.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isLoaded.current = true;
    } catch (e) {
      console.error('AdSense injection error:', e);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      isLoaded.current = false;
    };
  }, [adClient, adSlot]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden" ref={containerRef}>
      <Script
        id={`adsbygoogle-script-${adSlot}`}
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </div>
  );
}

function RawHtmlAd({ html }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const fullHtml = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#050505;display:flex;justify-content:center;align-items:center;}ins{min-width:100%;min-height:100%;}</style></head><body>${html}</body></html>`;
        iframeRef.current.contentWindow.postMessage({ html: fullHtml }, '*');
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [html]);

  return (
    <iframe 
      ref={iframeRef}
      src="/ad.html"
      className="w-full h-full border-none bg-[#050505]"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-forms"
    />
  );
}

export default function Watch() {
  const router = useRouter();
  const id = router.query.id;
  const type = router.query.type || 'movie';
  const isTv = type === 'tv';

  const [details, setDetails] = useState(null);
  const [error, setError] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(30);
  const [currentAds, setCurrentAds] = useState([]);

  useEffect(() => {
    if (showAd) {
      const fetchAds = async () => {
        try {
          const { data, error } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
          if (data && data.length > 0) {
            setCurrentAds(data.slice(0, 4));
          } else {
            // No ads found, skip to content
            setShowAd(false);
          }
        } catch (err) {
          setShowAd(false); // Fail gracefully to content
        }
      };
      fetchAds();
    } else {
      setCurrentAds([]);
    }
  }, [showAd]);

  useEffect(() => {
    let interval;
    if (isPlaying && showAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (adTimer === 0) {
      // eslint-disable-next-line
      setShowAd(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, showAd, adTimer]);

  useEffect(() => {
    const syncData = async () => {
      if (!details) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: watchData } = await supabase.from('watchlist')
          .select('*').eq('user_id', session.user.id).eq('media_id', details.id.toString());
        setIsInWatchlist(watchData && watchData.length > 0);

        try {
           await supabase.from('history').delete().match({ user_id: session.user.id, media_id: details.id.toString() });
           await supabase.from('history').insert([{
              user_id: session.user.id,
              media_id: details.id.toString(),
              title: details.title || details.name,
              poster_path: details.poster_path,
              media_type: type,
              season: selectedSeason || 1,
              episode: currentEpisode || 1
           }]);
        } catch (e) {
           console.error('History mapping error:', e);
        }
      } else {
        const savedWatch = JSON.parse(localStorage.getItem('premium_ott_mylist') || '[]');
        setIsInWatchlist(savedWatch.some(item => item.id == details.id));
        
        let savedHist = JSON.parse(localStorage.getItem('premium_ott_history') || '[]');
        savedHist = savedHist.filter(item => item.id != details.id);
        savedHist.unshift({ ...details, watchedAt: new Date().toISOString() });
        localStorage.setItem('premium_ott_history', JSON.stringify(savedHist.slice(0, 30)));
      }
    };
    syncData();
  }, [details, type, selectedSeason, currentEpisode]);

  const toggleWatchlist = async () => {
    if (!details) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (isInWatchlist) {
          await supabase.from('watchlist').delete().match({ user_id: session.user.id, media_id: details.id.toString() });
        } else {
          await supabase.from('watchlist').insert([{
             user_id: session.user.id,
             media_id: details.id.toString(),
             title: details.title || details.name,
             poster_path: details.poster_path,
             media_type: type
          }]);
        }
        setIsInWatchlist(!isInWatchlist);
      } else {
        let parsed = JSON.parse(localStorage.getItem('premium_ott_mylist') || '[]');
        if (isInWatchlist) {
          parsed = parsed.filter(item => item.id != details.id);
        } else {
          parsed.push(details);
        }
        localStorage.setItem('premium_ott_mylist', JSON.stringify(parsed));
        setIsInWatchlist(!isInWatchlist);
      }
    } catch(e) { console.error('Watchlist Error', e); }
  };

  useEffect(() => {
    if (!id || !type) return;
    const fetchDetailedData = async () => {
      try {
        const data = await getMovieDetails(id, type);
        
        if (!data) {
          setError(true);
          return;
        }

        setDetails(data);
        
        if (isTv && data?.seasons) {
          const validSeasons = data.seasons.filter(s => s.season_number > 0);
          setSeasons(validSeasons);
          if (validSeasons.length > 0) {
            setSelectedSeason(validSeasons[0].season_number);
          }
        }
      } catch (err) {
        console.error("Failed to fetch detailed data", err);
      }
    };
    fetchDetailedData();
    // Reset states on new id asynchronously to satisfy lint
    Promise.resolve().then(() => {
        setIsPlaying(false);
        setCurrentEpisode(1);
        setShowAd(false);
        setAdTimer(30);
        setError(false);
    });
  }, [id, type, isTv]);

  useEffect(() => {
    if (!id || !isTv || !selectedSeason) return;
    const fetchEps = async () => {
      try {
         const data = await getTvSeasons(id, selectedSeason);
         setEpisodes(data.episodes || []);
      } catch(e) {}
    }
    fetchEps();
  }, [id, selectedSeason, isTv]);

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center p-6 text-white text-center bg-[#050505]">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Content Not Found</h2>
        <p className="text-gray-400 mb-6 max-w-sm">The movie or TV show you are looking for does not exist, has been removed, or could not be loaded.</p>
        <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-blue-600 rounded font-semibold tracking-wide hover:bg-blue-700 transition">Go Home</button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center p-6 bg-[#050505]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-medium text-gray-400">Loading...</h2>
      </div>
    );
  }

  const title = details.title || details.name || details.original_name;
  const year = details.release_date?.substring(0,4) || details.first_air_date?.substring(0,4) || '';
  const runtime = details.runtime ? `${Math.floor(details.runtime/60)}h ${details.runtime%60}m` : (details.episode_run_time?.[0] ? `${details.episode_run_time[0]}m / Ep` : '');
  const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  
  const backdropUrl = details.backdrop_path?.startsWith('http') ? details.backdrop_path : `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
  const posterUrl = details.poster_path?.startsWith('http') ? details.poster_path : `https://image.tmdb.org/t/p/w500${details.poster_path}`;
  
  return (
    <>
      <Head>
        <title>{title} - Premium OTT Watch</title>
      </Head>
      
      <div className="w-full relative min-h-screen">
        {!isPlaying ? (
          <div className="relative w-full h-[60vh] lg:h-[80vh] bg-[#0f1014]">
            <img 
              src={backdropUrl}
              className="w-full h-full object-cover object-top opacity-50 absolute inset-0 mix-blend-screen"
            />
            {/* Cinematic Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/50 to-transparent"></div>

            <div className="container mx-auto px-6 md:pl-[110px] lg:pl-[130px] lg:pr-12 relative z-10 h-full flex flex-col justify-end pb-12">
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                 <div className="max-w-4xl flex items-end gap-8">
                    {/* Poster (hidden on small mobile) */}
                    <div className="hidden md:block w-48 lg:w-64 shrink-0 rounded-md overflow-hidden bg-gray-900 border border-gray-800">
                       <img src={posterUrl} className="w-full h-auto object-cover"/>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-3 text-sm font-semibold tracking-wide">
                        <span className="text-gray-300 bg-white/10 px-2 py-1 rounded border border-white/20">
                          IMDb {details.omdb?.imdbRating && details.omdb.imdbRating !== 'N/A' ? details.omdb.imdbRating : details.vote_average?.toFixed(1)}
                        </span>
                        <span>{year}</span>
                        {runtime && <span>• {runtime}</span>}
                        <span className="bg-gray-800 px-2 py-1 rounded">
                          {details.adult ? '18+' : 'U/A'}
                        </span>
                        <span className="uppercase text-gray-400">{type}</span>
                      </div>
                      
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black">{title}</h1>
                      
                      <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                        {details.genres?.map(g => <span key={g.id} className="mr-2">{g.name}</span>)}
                      </div>
                      
                      <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 max-w-2xl">{details.overview}</p>
                      
                      <div className="flex items-center gap-4 mt-6">
                        <button 
                          onClick={() => { setIsPlaying(true); setShowAd(true); setAdTimer(30); }}
                          className="flex items-center gap-2 btn-primary px-8 py-3 rounded-md font-bold transition-all text-white border border-white/20"
                        >
                          <Play fill="currentColor" className="w-5 h-5" /> Watch {isTv ? 'S'+selectedSeason+' E'+currentEpisode : 'Now'}
                        </button>
                        <button 
                          onClick={toggleWatchlist}
                          className={`p-3 rounded-md transition-all font-bold flex items-center gap-2 ${isInWatchlist ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                          {isInWatchlist ? <Check className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                          <span className="hidden sm:block">{isInWatchlist ? 'Added to Watchlist' : 'Watchlist'}</span>
                        </button>
                      </div>
                    </div>
                 </div>
               </motion.div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="container mx-auto px-4 md:pl-[110px] lg:pl-[130px] lg:pr-12 pt-24 pb-8">
             <button 
               onClick={() => { setIsPlaying(false); setShowAd(false); }} 
               className="mb-8 group flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-full text-gray-300 hover:text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-indigo-500/20 active:scale-95 w-max"
             >
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" /> 
               Back to Details
             </button>
             {showAd ? (
               <div className="w-full aspect-video bg-[#050505] rounded-xl overflow-hidden relative flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                 {/* Ad Management System Area */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   {currentAds.length > 0 ? (
                     <div className={`w-full h-full grid gap-[2px] ${currentAds.length === 1 ? 'grid-cols-1' : currentAds.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                       {currentAds.map(ad => (
                         <div key={ad.id} className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden pointer-events-auto">
                           {ad.type === 'video' ? (
                             <video src={ad.content} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                           ) : ad.type === 'image' ? (
                             <img src={ad.content} className="w-full h-full object-cover" alt={ad.title} />
                            ) : ad.type === 'admob' ? (
                              <AdMobAd content={ad.content} />
                            ) : ad.type === 'adsterra' ? (
                              <RawHtmlAd html={ad.content} />
                            ) : (
                              <RawHtmlAd html={ad.content} />
                            )}
                           {/* Small Ad overlay badge */}
                           <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-[10px] text-white/50 px-2 py-0.5 rounded z-20 pointer-events-none uppercase tracking-widest border border-white/10">Ad</div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center px-4">
                       <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
                       <p className="text-gray-500 text-lg uppercase tracking-widest font-bold">Advertisement Space</p>
                       <p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">This area is reserved for your ad management system. You can integrate third-party ads or custom banners here.</p>
                     </div>
                   )}
                 </div>
                 
                 {/* Timer Overlay */}
                 <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 flex items-center gap-3 z-10">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                   <span className="text-white font-bold tracking-wide">Content starts in {adTimer}s</span>
                 </div>
               </div>
             ) : (
               <Player 
                 mediaId={id} 
                 type={type} 
                 season={selectedSeason} 
                 episode={currentEpisode} 
                 sourceUrl={details.video_url} 
                 imdbId={details?.external_ids?.imdb_id || details?.omdb?.imdbID || ''}
               />
             )}
          </motion.div>
        )}

        <div className="container mx-auto px-6 md:pl-[110px] lg:pl-[130px] lg:pr-12 py-12">
          {/* Cast Details */}
          {details.credits?.cast?.length > 0 && (
             <div className="mb-12">
               <h3 className="text-xl font-bold mb-6 text-white">Cast</h3>
               <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                 {details.credits.cast.slice(0, 10).map((actor) => (
                    <div key={actor.id} className="w-24 md:w-32 shrink-0 group text-center cursor-pointer">
                      <div className="w-full aspect-square rounded-full overflow-hidden bg-gray-800 mb-3 border-2 border-transparent transition-all flex items-center justify-center">
                        {actor.profile_path ? (
                          <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="text-gray-500 font-medium text-xs">No Photo</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-gray-300 transition-colors">{actor.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{actor.character}</p>
                    </div>
                 ))}
               </div>
             </div>
          )}

          {/* TV Shows Episodes */}
          {isTv && seasons.length > 0 && (
             <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-bold text-white">Episodes</h3>
                   <select 
                     value={selectedSeason} 
                     onChange={(e) => setSelectedSeason(e.target.value)}
                     className="bg-[#16181f] border border-gray-700 text-white rounded-md px-4 py-2 outline-none focus:border-gray-500 cursor-pointer text-sm font-medium"
                   >
                     {seasons.map(s => <option key={s.season_number} value={s.season_number}>Season {s.season_number}</option>)}
                   </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {episodes.map(ep => (
                      <div 
                        key={ep.id} 
                        onClick={() => { setCurrentEpisode(ep.episode_number); setShowAd(true); setIsPlaying(true); setAdTimer(30); window.scrollTo({top:0, behavior:'smooth'}); }}
                        className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-all border ${currentEpisode === ep.episode_number ? 'bg-[#2b3040] border-gray-500' : 'bg-[#16181f] border-transparent hover:bg-[#202430]'}`}
                      >
                         <div className="w-32 md:w-40 shrink-0 aspect-video rounded overflow-hidden relative group">
                            <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm text-white">
                                <Play size={20} fill="currentColor"/>
                              </div>
                            </div>
                         </div>
                         <div className="flex flex-col justify-center overflow-hidden">
                            <h4 className="text-sm md:text-base font-bold text-white mb-1 truncate"><span className="text-gray-400">E{ep.episode_number}</span> - {ep.name}</h4>
                            <p className="text-xs text-gray-400 line-clamp-2 md:line-clamp-3">{ep.overview || "No description available."}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

        </div>
        
        {/* Fallback Recommendations */}
        <div className="pb-12">
            {details?.recommendations?.results && details.recommendations.results.length > 0 && (
                <Row title="Because you watched this" fetchMethod={() => Promise.resolve(details.recommendations.results)} id="recs" />
            )}
        </div>
      </div>
    </>
  );
}
