import { useState, useEffect, useRef } from 'react';

const MUSIC_FILES = [
  { name: '喜迎人生', path: '/music/喜迎人生.mp3' },
  { name: '因為有太陽', path: '/music/因為有太陽.mp3' },
  { name: '天賜活力', path: '/music/天賜活力.mp3' },
  { name: '如願圓通', path: '/music/如願圓通.mp3' },
  { name: '快樂工廠', path: '/music/快樂工廠.mp3' },
  { name: '莫擦肩而過', path: '/music/莫擦肩而過.mp3' },
  { name: '輕鬆', path: '/music/輕鬆.mp3' },
  { name: '黃金娃娃ing', path: '/music/黃金娃娃ing.mp3' },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(() => {
    // Initialize from localStorage or default to true
    const savedState = localStorage.getItem('musicPlaying');
    return savedState ? JSON.parse(savedState) : true;
  });
  const [currentMusic, setCurrentMusic] = useState(() => {
    // Initialize from localStorage or default to 黃金娃娃ing
    const savedMusic = localStorage.getItem('currentMusic');
    return savedMusic ? JSON.parse(savedMusic) : MUSIC_FILES.find(m => m.name === '黃金娃娃ing');
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const audioRef = useRef(null);
  const wasPlayingRef = useRef(true);
  const playlistRef = useRef(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('musicPlaying', JSON.stringify(isPlaying));
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem('currentMusic', JSON.stringify(currentMusic));
  }, [currentMusic]);

  // Handle click outside to close playlist
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playlistRef.current && !playlistRef.current.contains(event.target)) {
        setShowPlaylist(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, pause music
        wasPlayingRef.current = isPlaying;
        setIsPlaying(false);
      } else {
        // Tab is visible again, resume if it was playing
        if (wasPlayingRef.current) {
          setIsPlaying(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        // Add autoplay attribute
        audio.autoplay = true;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              // Try to play again after a short delay
              setTimeout(() => {
                audio.play().catch(e => console.error("Second attempt failed:", e));
              }, 1000);
            });
        }
      } else {
        audio.pause();
        console.log("Audio playback paused");
      }
    }
  }, [isPlaying]);

  // Handle music change
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleLoadedData = () => {
        setIsLoading(false);
        if (isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("New track started successfully");
              })
              .catch(error => {
                console.error("Error playing new track:", error);
                setIsPlaying(false);
              });
          }
        }
      };

      audio.addEventListener('loadeddata', handleLoadedData);
      return () => {
        audio.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [currentMusic, isPlaying]);

  const handleMusicChange = (music) => {
    setIsLoading(true);
    setCurrentMusic(music);
    setShowPlaylist(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <div className="flex flex-col items-center gap-2" ref={playlistRef}>
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="p-2 rounded-full bg-amber-50/80 backdrop-blur-sm shadow-lg hover:bg-amber-100/50 transition-colors duration-200"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-amber-600" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </button>

        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-amber-50/80 backdrop-blur-sm shadow-lg hover:bg-amber-100/50 transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-amber-600 animate-spin" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 text-amber-600 ${isPlaying ? 'animate-spin' : ''}`} 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              {isPlaying ? (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              ) : (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              )}
            </svg>
          )}
        </button>

        {showPlaylist && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-amber-50/80 backdrop-blur-sm rounded-lg shadow-lg py-1">
            {MUSIC_FILES.map((music) => (
              <button
                key={music.path}
                onClick={() => handleMusicChange(music)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-amber-100/50 transition-colors duration-200 flex items-center gap-2 ${
                  currentMusic.path === music.path 
                    ? 'text-amber-600 font-medium bg-amber-100/50' 
                    : 'text-amber-700'
                }`}
              >
                {currentMusic.path === music.path && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-amber-600" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                )}
                <span className="flex-1">{music.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <audio 
        ref={audioRef}
        id="background-music" 
        loop
        preload="auto"
      >
        <source src={currentMusic.path} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
} 