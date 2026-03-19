'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FlashcardProps {
  front: string;
  back: string;
  className?: string;
}

export function Flashcard({ front, back, className }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`nb-flashcard w-full h-[250px] relative cursor-pointer ${className}`}
      onClick={() => setFlipped(!flipped)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 backface-hidden flex items-center justify-center p-6 text-center border-4 border-volt"
          style={{ background: 'var(--ink)' }}
        >
          <span className="nb-mono text-xs text-volt absolute top-3 left-3 tracking-widest">
            CONCEPT
          </span>
          <h3 className="nb-display text-2xl text-chalk">{front}</h3>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden flex items-center text-left p-6 border-4 border-plasma"
          style={{
            background: 'var(--ink)',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="nb-mono text-xs text-plasma absolute top-3 left-3 tracking-widest">
            DEFINITION
          </span>
          <p className="text-base text-chalk leading-tight mt-4 overflow-y-auto w-full max-h-full">
            {back}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
