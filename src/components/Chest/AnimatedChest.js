import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AnimatedChest({ 
  src, 
  size, 
  onClick, 
  isCheckedIn = false,
  className = "",
  showHoverShadow = true
}) {
  const [animationType, setAnimationType] = useState(null);

  useEffect(() => {
    // Random interval between 5 to 15 seconds
    const getRandomInterval = () => Math.floor(Math.random() * 10000) + 5000;
    
    const startAnimation = () => {
      // Randomly choose between wiggle and float
      const isWiggle = Math.random() > 0.5;
      setAnimationType(isWiggle ? 'wiggle' : 'float');
      
      setTimeout(() => {
        setAnimationType(null);
        // Schedule next animation
        setTimeout(startAnimation, getRandomInterval());
      }, isWiggle ? 1000 : 2000); // Wiggle is shorter than float
    };

    // Start the first animation after a random delay
    setTimeout(startAnimation, getRandomInterval());

    return () => {
      setAnimationType(null);
    };
  }, []);

  const getAnimation = () => {
    if (!animationType) return {};
    
    if (animationType === 'wiggle') {
      return {
        rotate: [0, -5, 5, -5, 5, 0],
        transition: { duration: 1, ease: "easeInOut" }
      };
    } else {
      return {
        y: [0, -5, 0],
        transition: { 
          duration: 2,
          ease: "easeInOut",
          repeat: 1
        }
      };
    }
  };

  return (
    <motion.div
      whileHover={!isCheckedIn ? { scale: 1.05 } : {}}
      whileTap={!isCheckedIn ? { scale: 0.95 } : {}}
      animate={getAnimation()}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt="Chest"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
} 