import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud } from 'lucide-react';

const SERVERS = [
  // Primary Servers (Most Reliable)
  { name: "Server 1 ⭐", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidlink.pro/movie/${id}` : `https://vidlink.pro/tv/${id}/${s}/${e}` },
  
  { name: "Server 2", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.me/embed/movie?${imdb ? 'imdb='+imdb : 'tmdb='+id}` : `https://vidsrc.me/embed/tv?${imdb ? 'imdb='+imdb : 'tmdb='+id}&season=${s}&episode=${e}` },

  { name: "Server 3", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.to/embed/movie/${imdb || id}` : `https://vidsrc.to/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "Server 4", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.xyz/embed/movie/${imdb || id}` : `https://vidsrc.xyz/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "Server 5", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.pro/embed/movie/${imdb || id}` : `https://vidsrc.pro/embed/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 6", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://player.smashy.stream/movie/${id}` : `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}` },
  
  { name: "Server 7", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://player.autoembed.co/embed/movie/${id}` : `https://player.autoembed.co/embed/tv/${id}/${s}/${e}` },

  { name: "Server 8", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://multiembed.mov/?video_id=${imdb || id}&tmdb=${imdb?0:1}` : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },

  { name: "Server 9", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://embed.su/embed/movie/${imdb || id}` : `https://embed.su/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "Server 10", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://www.2embed.cc/embed/${imdb || id}` : `https://www.2embed.cc/embedtv/${imdb || id}&s=${s}&e=${e}` },

  { name: "Server 11", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://superflix.cc/embed/movie/${imdb || id}` : `https://superflix.cc/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "Server 12", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://moviesapi.club/movie/${id}` : `https://moviesapi.club/tv/${id}-${s}-${e}` },
  
  // Additional Working Servers
  { name: "Server 13", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.vip/embed/movie/${imdb || id}` : `https://vidsrc.vip/embed/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 14", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.cc/v2/embed/movie/${imdb || id}` : `https://vidsrc.cc/v2/embed/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 15", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.dev/embed/movie/${imdb || id}` : `https://vidsrc.dev/embed/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 16", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://player.123embed.net/movie/${imdb || id}` : `https://player.123embed.net/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 17", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://flicky.host/embed/movie/?id=${imdb || id}` : `https://flicky.host/embed/tv/?id=${imdb || id}&s=${s}&e=${e}` },
  
  { name: "Server 18", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://novaembed.com/embed/movie/${imdb || id}` : `https://novaembed.com/embed/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 19", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://cineflow.xyz/embed/movie/${imdb || id}` : `https://cineflow.xyz/embed/tv/${imdb || id}/${s}/${e}` },    
  
  { name: "Server 20", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://streamhub.to/e/${imdb || id}` : `https://streamhub.to/e/${imdb || id}?season=${s}&episode=${e}` },
  
  { name: "Server 21", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://playembed.com/embed/movie/${imdb || id}` : `https://playembed.com/embed/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 22", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://watchflix.com/embed/movie/${imdb || id}` : `https://watchflix.com/embed/tv/${imdb || id}/${s}/${e}` },           
  
  { name: "Server 23", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://gomovies.to/embed/movie/${imdb || id}` : `https://gomovies.to/embed/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 24", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://moviebox.to/embed/movie/${imdb || id}` : `https://moviebox.to/embed/tv/${imdb || id}/${s}/${e}` },
  
  { name: "Server 25", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://godriveplayer.com/embed/movie/${imdb || id}` : `https://godriveplayer.com/embed/tv/${imdb || id}/${s}/${e}` },

  // Videasy.net API - Fixed URL structure (NO /embed/ in path)
  // Supports IMDB (tt prefix) and TMDB IDs
  // Quality options: auto, 1080, 720, 480
  { name: "Server 26 - Videasy ", getUrl: (t, id, s, e, imdb) => {
    const isTmdb = !imdb || (id && !imdb.startsWith('tt'));
    const videoId = imdb || id;
    if (t === 'movie') {
      return `https://player.videasy.net/movie/${videoId}${isTmdb ? '?tmdb=1' : ''}`;
    }
    return `https://player.videasy.net/tv/${videoId}/${s}/${e}${isTmdb ? '?tmdb=1' : ''}`;
  }},

  // Videasy with 1080p quality preference
  { name: "Server 26a - Videasy HD", getUrl: (t, id, s, e, imdb) => {
    const isTmdb = !imdb || (id && !imdb.startsWith('tt'));
    const videoId = imdb || id;
    if (t === 'movie') {
      return `https://player.videasy.net/movie/${videoId}?q=1080${isTmdb ? '&tmdb=1' : ''}`;
    }
    return `https://player.videasy.net/tv/${videoId}/${s}/${e}?q=1080${isTmdb ? '&tmdb=1' : ''}`;
  }},

  { name: "Server 27", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.net/embed/movie/${imdb || id}` : `https://vidsrc.net/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "Server 28", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://www.provid.me/embed/movie/${imdb || id}` : `https://www.provid.me/embed/tv/${imdb || id}/${s}/${e}` },        

  { name: "Server 29", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://111.movie.net/embed/movie/${imdb || id}` : `https://111.movie.net/embed/tv/${imdb || id}/${s}/${e}` },

  // 111movies.net API - Supports IMDB (tt prefix) and TMDB IDs
  { name: "Server 29a - 111movies", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://111movies.net/movie/${imdb || id}` : `https://111movies.net/tv/${imdb || id}/${s}/${e}` },

  // Free Streaming API Server
  { name: "Server 30", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://api.freeapi.top/movie/${imdb || id}` : `https://api.freeapi.top/tv/${imdb || id}/${s}/${e}` },
];

export default function Player({ mediaId, type='movie', season=1, episode=1, sourceUrl, imdbId: propImdbId }) {
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const activeServer = SERVERS[activeServerIndex] || SERVERS[0];
  const [showServers, setShowServers] = useState(false);
  const [videoUrl, setVideoUrl] = useState(sourceUrl || '');
  const [imdbId, setImdbId] = useState(propImdbId || null);

  // Sync imdbId when prop changes
  useEffect(() => {
    if (propImdbId) {
      setImdbId(propImdbId);
    }
  }, [propImdbId]);

  // Reset server index when content changes
  useEffect(() => {
    setActiveServerIndex(0);
  }, [mediaId, season, episode]);

  // Fetch IMDB ID if missing
  useEffect(() => {
    let isMounted = true;
    const fetchImdbId = async () => {
      try {
        const TMDB_API_KEY = 'f36507198e7cb992d3012d8cf70ad609';
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${mediaId}/external_ids?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        
        if (isMounted && data.imdb_id) {
          setImdbId(data.imdb_id);
        }
      } catch (err) {
        console.error("Error fetching IMDB ID:", err);
      }
    };

    if (mediaId && !imdbId && !propImdbId) {
      fetchImdbId();
    }
    return () => { isMounted = false; };
  }, [mediaId, type, imdbId, propImdbId]);

  useEffect(() => {
    if (sourceUrl) {
      setVideoUrl(sourceUrl);
      return;
    }
    if (activeServer && mediaId && !mediaId.toString().startsWith('admin_')) {
      const url = activeServer.getUrl(type, mediaId, season, episode, imdbId);
      if (url) {
        setVideoUrl(url);
      }
    }
  }, [mediaId, type, season, episode, activeServer, imdbId, sourceUrl]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col gap-6">
      {/* Video Player */}
      <div className="w-full relative bg-black aspect-video rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
        {videoUrl ? (
          <iframe
            src={videoUrl}
            allowFullScreen
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; autoplay"
            className="w-full h-full"
            referrerPolicy="origin"
            loading="eager"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#16181f]">
             Loading Player...
          </div>
        )}
      </div>

      {/* Cloud Server Selection - Trigger & Dropdown Tray */}
      {!sourceUrl && (
        <div className="w-full flex-col flex items-start">
          <button 
             onClick={() => setShowServers(!showServers)}
             className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600/20 to-transparent hover:from-blue-600/30 border border-blue-500/30 rounded-full text-white font-medium transition-all"
          >
             <Cloud size={20} className="text-[#1f80e0]" fill="#1f80e0" />
             <span>Change Streaming Server</span>
             <span className="text-gray-400 text-sm ml-2">({activeServer.name})</span>
          </button>

          <AnimatePresence>
            {showServers && (
              <motion.div 
                 initial={{ opacity: 0, height: 0 }} 
                 animate={{ opacity: 1, height: 'auto' }} 
                 exit={{ opacity: 0, height: 0 }}
                 className="overflow-hidden w-full mt-4"
              >
                <div className="bg-[#16181f] border border-[#2b3040] p-6 rounded-xl shadow-xl">
                   <div className="flex flex-wrap gap-3">
                       {SERVERS.map((server, idx) => (
                         <button
                           key={server.name}
                           onClick={() => { setActiveServerIndex(idx); setShowServers(false); }}
                           className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                             activeServer.name === server.name 
                               ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                               : 'bg-[#0f1014] text-gray-300 hover:bg-white/10 hover:border-white/30 border-[#2b3040]'
                           }`}
                         >
                           <Cloud size={14} className={activeServer.name === server.name ? 'text-white' : 'text-gray-400'} />
                           {server.name}
                         </button>
                      ))}
                   </div>
                   <div className="mt-4 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-500/80 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-yellow-500 block animate-pulse"></span> 
                       If the video does not load or buffers, select a different cloud server.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

