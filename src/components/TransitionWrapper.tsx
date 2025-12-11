/**
 * TransitionWrapper - Smooth Page Transitions
 * Provides fade and slide animations between routes using Framer Motion
 * Matches the premium gold/leather aesthetic
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface TransitionWrapperProps {
  children: React.ReactNode;
}

/**
 * Animation variants for page transitions
 * Smooth fade with subtle slide for premium feel
 */
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10, // Subtle slide down
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const, // Custom easing for smooth feel
    },
  },
  exit: {
    opacity: 0,
    y: -10, // Subtle slide up on exit
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

