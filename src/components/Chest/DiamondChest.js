import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import BaseChest from './BaseChest';
import DiamondModal from '../modals/DiamondModal';

const diamondQuotes = [
  {
    text: "鑽石寶箱中藏著無盡的智慧，等待著勇敢的探索者來開啟。",
    author: "寶藏守護者"
  },
  {
    text: "每一顆鑽石都閃耀著知識的光芒，照亮探索的道路。",
    author: "智者"
  },
  {
    text: "鑽石寶箱的密碼，是通往更高境界的鑰匙。",
    author: "解謎者"
  }
];

export default function DiamondChest({ 
  id, 
  position, 
  state, 
  user,
  image,
  handleProgressUpdate
}) {
  const [showDiamondModal, setShowDiamondModal] = useState(false);
  const [password, setPassword] = useState(null);

  useEffect(() => {
    const fetchPassword = async () => {
      if (!user) return;
      
      try {
        const passwordRef = doc(db, "diamond_passwords", `${id + 1}`);
        const passwordDoc = await getDoc(passwordRef);
        
        if (passwordDoc.exists()) {
          setPassword(passwordDoc.data().keyword);
        }
      } catch (error) {
        console.error("Error fetching diamond password:", error);
      }
    };

    fetchPassword();
  }, [user, id]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (state === 'completed') {
      // QuoteModal is handled by BaseChest
    } else if (state === 'open') {
      setShowDiamondModal(true);
    }
  };

  const handlePasswordSubmit = async (enteredPassword) => {
    if (!user || !password) return false;

    if (enteredPassword === password) {
      try {
        // Update user's diamond progress in Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [`progress.diamond.${id}`]: true
        });
        handleProgressUpdate("diamondChest");
        console.log("handleProgressUpdate diamondChest");
        setShowDiamondModal(false);
        return true;
      } catch (error) {
        console.error("Error updating diamond progress:", error);
        return false;
      }
    }
    return false;
  };

  return (
    <>
      <BaseChest
        id={id}
        type="diamond"
        state={state}
        position={position}
        size={80}
        onClick={handleClick}
        quotes={diamondQuotes}
        showHoverShadow={true}
        customIcon={image}
      />
      <DiamondModal
        isOpen={showDiamondModal}
        onClose={() => setShowDiamondModal(false)}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
} 