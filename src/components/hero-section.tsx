
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // For animations

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const headlineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } },
  };

  return (
    <section className="w-full py-20 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 mix-blend-overlay">
        {/* Optional: subtle pattern or noise */}
        {/* <svg width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.5) rotate(45)"><path id="a" data-color="outline" fill="none" stroke="#FFF" strokeWidth="5" d="M50 0L50 100ZM0 50L100 50Z"></path></pattern></defs><rect fill="url(#p)" width="100%" height="100%"></rect></svg> */}
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {isMounted && (
          <>
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
              initial="hidden"
              animate="visible"
              variants={headlineVariants}
              style={{ fontFamily: "'Poppins', system-ui, -apple-system, sans-serif" }} // Using Poppins as a fallback
            >
              Discover Local Events in Karnataka
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={taglineVariants}
            >
              Find the best events near you, anytime, anywhere.
            </motion.p>
          </>
        )}
      </div>
    </section>
  );
}
