import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sparkles, Palette } from 'lucide-react';

// Videasy configuration options
const VIDEASY_CONFIG = {
  color: '8B5CF6', // Purple theme default
  nextEpisode: true,
  episodeSelector: true,
  autoplayNextEpisode: true,
  overlay: true,
};

// Build Videasy URL with all customization options
const buildVideasyUrl = (type, id, s, e, imdb, options = {}) => {
  const isTmdb = !imdb || (id && !imdb.startsWith('tt'));
  const videoId = imdb || id;

  let baseUrl;
  if (type === 'anime') {
    // Anime: https://player.videasy.net/anime/anilist_id/episode
    baseUrl = e
      ? `https://player.videasy.net/anime/${videoId}/${e}`
      : `https://player.videasy.net/anime/${videoId}`;
  } else if (type === 'movie') {
    baseUrl = `https://player.videasy.net/movie/${videoId}`;
  } else {
    baseUrl = `https://player.videasy.net/tv/${videoId}/${s}/${e}`;
  }

  const params = new URLSearchParams();

  // TMDB flag
  if (isTmdb) params.append('tmdb', '1');

  // Customization options
  if (options.color) params.append('color', options.color);
  if (options.quality) params.append('q', options.quality);
  if (options.nextEpisode) params.append('nextEpisode', 'true');
  if (options.episodeSelector) params.append('episodeSelector', 'true');
  if (options.autoplayNextEpisode) params.append('autoplayNextEpisode', 'true');
  if (options.overlay) params.append('overlay', 'true');
  if (options.progress) params.append('progress', options.progress.toString());

  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
};

const SERVERS = [
  // Primary Servers - Most Reliable & Popular
  { name: "Server 1 ⭐ VidLink", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidlink.pro/movie/${id}` : `https://vidlink.pro/tv/${id}/${s}/${e}` },

  { name: "Server 2 Vidsrc.to", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },

  { name: "Server 3 Vidsrc.icu", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.icu/embed/movie/${imdb || id}` : `https://vidsrc.icu/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "Server 4 Vidsrc.cc", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.cc/v3/embed/movie/${imdb || id}` : `https://vidsrc.cc/v3/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "Server 5 GoDrivePlayer", getUrl: (t, id, s, e) => t === 'movie' ? `https://godriveplayer.com/player.php?tmdb=${id}` : `https://godriveplayer.com/player.php?type=series&tmdb=${id}&season=${s}&episode=${e}` },

  { name: "Server 6 VidKing", getUrl: (t, id, s, e) => t === 'movie' ? `https://www.vidking.net/embed/movie/${id}` : `https://www.vidking.net/embed/tv/${id}/${s}/${e}` },

  { name: "Server 7 Vidsrc.me", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.me/embed/movie?${imdb ? 'imdb=' + imdb : 'tmdb=' + id}` : `https://vidsrc.me/embed/tv?${imdb ? 'imdb=' + imdb : 'tmdb=' + id}&season=${s}&episode=${e}` },

  { name: "Server 8 SuperFlix", getUrl: (t, id, s, e) => t === 'movie' ? `https://superflix.to/embed/movie/${id}` : `https://superflix.to/embed/tv/${id}/${s}/${e}` },

  { name: "Server 9 Embed.su", getUrl: (t, id, s, e) => t === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${s}/${e}` },

  { name: "Server 10 VidSrc.xyz", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidsrc.xyz/embed/movie/${id}` : `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },

  { name: "Server 11 2Embed", getUrl: (t, id, s, e) => t === 'movie' ? `https://www.2embed.cc/embed/${id}` : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },

  { name: "Server 12 AutoEmbed", getUrl: (t, id, s, e) => t === 'movie' ? `https://autoembed.cc/embed/movie/${id}` : `https://autoembed.cc/embed/tv/${id}/${s}/${e}` },

  { name: "Server 13 MultiEmbed", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://multiembed.mov/?video_id=${imdb || id}&tmdb=${imdb ? 0 : 1}` : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },

  { name: "Server 14 VidSrc.wtf", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidsrc.wtf/embed/movie/${id}` : `https://vidsrc.wtf/embed/tv/${id}/${s}/${e}` },

  { name: "Server 15 SmashyStream", getUrl: (t, id, s, e) => t === 'movie' ? `https://player.smashy.stream/movie/${id}` : `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}` },

  { name: "Server 16 Videasy Premium", getUrl: (t, id, s, e, imdb) => buildVideasyUrl(t, id, s, e, imdb, { ...VIDEASY_CONFIG }) },

  { name: "Server 17 PrimeWire", getUrl: (t, id, s, e) => t === 'movie' ? `https://primewire.mx/embed/movie/${id}` : `https://primewire.mx/embed/tv/${id}/${s}/${e}` },

  { name: "vidsrc.mov ⭐", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://vidsrc.mov/embed/movie/${imdb || id}` : `https://vidsrc.mov/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "Vidzee", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://player.vidzee.wtf/embed/movie/${imdb || id}` : `https://player.vidzee.wtf/embed/tv/${imdb || id}/${s}/${e}` },

  { name: "VidRock", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidrock.net/embed/movie/${id}` : `https://vidrock.net/embed/tv/${id}/${s}/${e}` },

  { name: "VidSrc.wtf (API 1)", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidsrc.wtf/api/1/movie?id=${id}` : `https://vidsrc.wtf/api/1/tv?id=${id}&s=${s}&e=${e}` },

  { name: "VidSrc.wtf (API 2)", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidsrc.wtf/api/2/movie?id=${id}` : `https://vidsrc.wtf/api/2/tv?id=${id}&s=${s}&e=${e}` },

  { name: "VidSrc.wtf (API 3)", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidsrc.wtf/api/3/movie?id=${id}` : `https://vidsrc.wtf/api/3/tv?id=${id}&s=${s}&e=${e}` },

  { name: "Vidnest", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidnest.fun/embed/movie/${id}` : `https://vidnest.fun/embed/tv/${id}/${s}/${e}` },

  { name: "RiveEmbed", getUrl: (t, id, s, e) => t === 'movie' ? `https://rive.stream/embed/movie/${id}` : `https://rive.stream/embed/tv/${id}/${s}/${e}` },

  { name: "SmashyStream", getUrl: (t, id, s, e) => t === 'movie' ? `https://player.smashy.stream/movie/${id}` : `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}` },

  { name: "111Movies", getUrl: (t, id, s, e) => t === 'movie' ? `https://111movies.net/movie/${id}` : `https://111movies.net/tv/${id}/${s}/${e}` },

  { name: "Videasy", getUrl: (t, id, s, e, imdb) => buildVideasyUrl(t, id, s, e, imdb, { ...VIDEASY_CONFIG }) },

  { name: "VidLink", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidlink.pro/movie/${id}` : `https://vidlink.pro/tv/${id}/${s}/${e}` },

  { name: "VidFast", getUrl: (t, id, s, e) => t === 'movie' ? `https://www.vidfast.in/embed/movie/${id}` : `https://www.vidfast.in/embed/tv/${id}/${s}/${e}` },

  { name: "Embed.su", getUrl: (t, id, s, e) => t === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${s}/${e}` },

  { name: "2Embed", getUrl: (t, id, s, e) => t === 'movie' ? `https://www.2embed.cc/embed/${id}` : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },

  { name: "MoviesAPI", getUrl: (t, id, s, e) => t === 'movie' ? `https://moviesapi.club/movie/${id}` : `https://moviesapi.club/tv/${id}-${s}-${e}` },

  { name: "AutoEmbed", getUrl: (t, id, s, e) => t === 'movie' ? `https://autoembed.cc/embed/movie/${id}` : `https://autoembed.cc/embed/tv/${id}/${s}/${e}` },

  { name: "MultiEmbed", getUrl: (t, id, s, e, imdb) => t === 'movie' ? `https://multiembed.mov/?video_id=${imdb || id}&tmdb=${imdb ? 0 : 1}` : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },

  { name: "VidSrc.xyz", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidsrc.xyz/embed/movie/${id}` : `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },

  { name: "PrimeWire", getUrl: (t, id, s, e) => t === 'movie' ? `https://primewire.mx/embed/movie/${id}` : `https://primewire.mx/embed/tv/${id}/${s}/${e}` },

  { name: "WarezCDN", getUrl: (t, id, s, e) => t === 'movie' ? `https://embed.warezcdn.com/embed/movie/${id}` : `https://embed.warezcdn.com/embed/tv/${id}/${s}/${e}` },

  { name: "SuperFlix", getUrl: (t, id, s, e) => t === 'movie' ? `https://superflix.to/embed/movie/${id}` : `https://superflix.to/embed/tv/${id}/${s}/${e}` },

  { name: "VidUp", getUrl: (t, id, s, e) => t === 'movie' ? `https://vidup.me/embed/movie/${id}` : `https://vidup.me/embed/tv/${id}/${s}/${e}` },
];


export default function Player({ mediaId, type = 'movie', season = 1, episode = 1, sourceUrl, imdbId: propImdbId, anilistId }) {
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const activeServer = SERVERS[activeServerIndex] || SERVERS[0];
  const [showServers, setShowServers] = useState(false);
  const [videoUrl, setVideoUrl] = useState(sourceUrl || '');
  const [imdbId, setImdbId] = useState(propImdbId || null);
  const [watchProgress, setWatchProgress] = useState(null);
  const iframeRef = useRef(null);


  // Sync imdbId when prop changes - removed from effects to avoid cascading renders
  // Using direct assignment instead
  if (propImdbId !== undefined && propImdbId !== imdbId) {
    setImdbId(propImdbId);
  }

  // Reset when content changes - use layout effect pattern
  useEffect(() => {
    // Skip on initial mount
    if (mediaId) {
      setActiveServerIndex(0);
    }
  }, [mediaId, season, episode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch IMDB ID if missing (skip for anime)
  useEffect(() => {
    let isMounted = true;
    const fetchImdbId = async () => {
      try {
        const TMDB_API_KEY = 'f36507198e7cb992d3012d8cf70ad609';
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${mediaId}/external_ids?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        if (isMounted && data.imdb_id) setImdbId(data.imdb_id);
      } catch {
        // Silent fail
      }
    };

    if (mediaId && !imdbId && !propImdbId && type !== 'anime') {
      fetchImdbId();
    }
    return () => { isMounted = false; };
  }, [mediaId, type, imdbId, propImdbId]);

  // Generate video URL when server changes
  useEffect(() => {
    if (sourceUrl) {
      setVideoUrl(sourceUrl);
      return;
    }
    if (activeServer && mediaId && !mediaId.toString().startsWith('admin_')) {
      const videoId = type === 'anime' ? (anilistId || mediaId) : mediaId;
      const url = activeServer.getUrl(type, videoId, season, episode, imdbId);
      if (url) {
        setVideoUrl(url);
      }
    }
  }, [mediaId, type, season, episode, activeServer, imdbId, sourceUrl, anilistId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Watch Progress Tracking - Listen for messages from Videasy player
  useEffect(() => {
    const handleMessage = (event) => {
      // Check if message is from Videasy player
      if (!event.origin.includes('videasy.net')) return;

      try {
        let data;
        if (typeof event.data === 'string') {
          data = JSON.parse(event.data);
        } else {
          data = event.data;
        }

        console.log('Videasy progress update:', data);

        // Save progress data
        if (data && (data.progress || data.timestamp)) {
          setWatchProgress(data);

          // Save to localStorage for resume functionality
          const progressKey = `watch-progress-${mediaId}-${season}-${episode}`;
          localStorage.setItem(progressKey, JSON.stringify({
            ...data,
            savedAt: new Date().toISOString()
          }));
        }
      } catch {
        // Silent fail for non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [mediaId, season, episode]);

  // Get server icon
  const getServerIcon = (serverName) => {
    if (serverName.includes('Videasy')) return <Sparkles size={14} className="text-purple-400" />;
    if (serverName.includes('⭐')) return <Cloud size={14} className="text-yellow-400" />;
    return <Cloud size={14} />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col gap-6">
      {/* Video Player Container - 16:9 Aspect Ratio */}
      <div className="w-full relative bg-black rounded-xl overflow-hidden border border-gray-800 shadow-2xl" style={{ paddingBottom: '56.25%' }}>
        {videoUrl ? (
          <iframe
            ref={iframeRef}
            src={videoUrl}
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            frameBorder="0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; autoplay"
            className="w-full h-full"
            referrerPolicy="origin"
            loading="eager"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-[#16181f]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Loading Player...</span>
            </div>
          </div>
        )}
      </div>

      {/* Watch Progress Indicator */}
      {watchProgress && watchProgress.progress > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Palette size={16} />
            <span>Progress: {Math.round(watchProgress.progress)}%</span>
            {watchProgress.timestamp && (
              <span className="text-gray-500">
                ({Math.floor(watchProgress.timestamp / 60)}:{String(watchProgress.timestamp % 60).padStart(2, '0')})
              </span>
            )}
          </div>
          <button
            onClick={() => {
              // Clear progress
              const progressKey = `watch-progress-${mediaId}-${season}-${episode}`;
              localStorage.removeItem(progressKey);
              setWatchProgress(null);
            }}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}

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
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${activeServer.name === server.name
                          ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                          : 'bg-[#0f1014] text-gray-300 hover:bg-white/10 hover:border-white/30 border-[#2b3040]'
                          }`}
                      >
                        {getServerIcon(server.name)}
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

