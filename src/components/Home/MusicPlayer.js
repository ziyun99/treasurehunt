import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function MusicPlayer({ user }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef(null);
  const volumeTimeoutRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Initialize audio element
    if (audioRef.current && !isInitialized.current) {
      audioRef.current.volume = volume;
      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    // Load user's music preference from Firestore
    const loadUserPreference = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const musicEnabled = data?.musicEnabled ?? false;
          setIsPlaying(musicEnabled);
          setVolume(data?.musicVolume ?? 0.5);
          setIsMuted(data?.musicMuted ?? false);
          
          // Sync audio state with user preference
          if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
            if (musicEnabled) {
              try {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                  playPromise
                    .then(() => {
                      console.log("Audio playback started successfully");
                    })
                    .catch(error => {
                      console.error("Error playing audio:", error);
                      setIsPlaying(false);
                    });
                }
              } catch (error) {
                console.error("Error in play attempt:", error);
                setIsPlaying(false);
              }
            } else {
              audioRef.current.pause();
            }
          }
        }
      }
    };
    loadUserPreference();
  }, [user, volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              setIsPlaying(false);
            });
        }
      } else {
        audio.pause();
        console.log("Audio playback paused");
      }
    }
  }, [isPlaying, volume, isMuted]);

  const handleMouseEnter = () => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    setShowVolume(true);
  };

  const handleMouseLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolume(false);
    }, 500); // Hide after 500ms of no interaction
  };

  const togglePlay = async () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    // Save preference to Firestore
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        musicEnabled: newState
      });
    }
  };

  const toggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Save preference to Firestore
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        musicMuted: newMutedState
      });
    }
  };

  const handleVolumeChange = async (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    // Save preference to Firestore
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        musicVolume: newVolume
      });
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <audio 
        ref={audioRef}
        id="background-music" 
        loop
        preload="auto"
      >
        <source src="/music/bg-music.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <div className="relative flex flex-col items-center">
        {showVolume && (
          <div 
            className="absolute bottom-full mb-2 p-2 bg-amber-50/80 backdrop-blur-sm rounded-lg shadow-lg"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex flex-col items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-1 h-24 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500 [writing-mode:vertical-lr] [direction:rtl]"
                style={{
                  background: `linear-gradient(to top, rgb(245 158 11) ${volume * 100}%, rgb(254 243 199) ${volume * 100}%)`,
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-amber-100 transition-colors duration-200"
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-amber-50/80 backdrop-blur-sm shadow-lg hover:bg-amber-100 transition-all duration-200"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 text-amber-600 ${isPlaying ? 'animate-spin' : ''}`} 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            {isPlaying ? (
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            ) : (
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
} 