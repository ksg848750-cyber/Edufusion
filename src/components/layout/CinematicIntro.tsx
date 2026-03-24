'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = sessionStorage.getItem('edufusion_intro_seen');
    if (!seen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem('edufusion_intro_seen', 'true');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const skip = () => {
    setShow(false);
    sessionStorage.setItem('edufusion_intro_seen', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'var(--app-bg)' }}
        >
          <div className="nb-scanline-overlay" />

          {/* 3D Cube */}
          <motion.div
            initial={{ scale: 0, rotateY: 0 }}
            animate={{ scale: 1.54, rotateY: 360 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="nb-cube-scene mb-8"
          >
            <div className="nb-cube">
              <div className="nb-cube-face nb-cube-front">E</div>
              <div className="nb-cube-face nb-cube-back">D</div>
              <div className="nb-cube-face nb-cube-top">U</div>
              <div className="nb-cube-face nb-cube-bottom">F</div>
              <div className="nb-cube-face nb-cube-left">U</div>
              <div className="nb-cube-face nb-cube-right">!</div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center absolute"
            style={{ top: '55%' }}
          >
            <h1
              className="nb-display nb-glitch"
              style={{ fontSize: '56px', color: 'var(--volt)', letterSpacing: '0.1em' }}
            >
              EDUFUSION
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="nb-mono mt-2"
              style={{ fontSize: '11px', color: '#666', letterSpacing: '0.15em' }}
            >
              LEARN THROUGH WHAT YOU LOVE
            </motion.p>
          </motion.div>

          {/* Skip */}
          <button
            onClick={skip}
            className="nb-mono absolute bottom-6 right-6"
            style={{
              fontSize: '11px',
              color: '#666',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.1em',
            }}
          >
            SKIP →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
