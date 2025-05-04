import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedChest from './AnimatedChest';
import ChestLabel from './ChestLabel';
import QuoteModal from '../modals/QuoteModal';

export default function BaseChest({
  id,
  type,
  state,
  position,
  size,
  onClick,
  onComplete,
  quotes = [],
  showHoverShadow = true,
  customIcon = null,
  customLabel = null,
  userName = ''
}) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e) => {
    console.log('handleClick', type, state);
    e.stopPropagation();
    if (state === 'completed') {
      setShowModal(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const getChestIcon = () => {
    if (customIcon) return customIcon;
    
    switch (state) {
      case 'locked':
        return '/icons/lock.svg';
      case 'open':
        return '/icons/chest-closed.svg';
      case 'completed':
        return '/icons/chest-open.svg';
      default:
        return '/icons/chest-closed.svg';
    }
  };

  return (
    <div 
      className="fixed z-20 cursor-pointer"
      style={position}
      onClick={handleClick}
    >
      <div className="relative">
        <AnimatedChest
          src={getChestIcon()}
          size={size}
          onClick={handleClick}
          isCheckedIn={state === 'completed'}
          showHoverShadow={showHoverShadow}
        />
        <ChestLabel
          id={id}
          type={type}
          state={state}
          customLabel={customLabel}
        />
      </div>
      <QuoteModal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        quotes={quotes}
        type={type}
        userName={userName}
      />
    </div>
  );
} 