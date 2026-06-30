import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, ShieldAlert } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
  theme?: "light" | "dark";
}

export default function Onboarding({ onComplete, theme = "dark" }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: "📍",
      title: "Be the Reporter",
      description: "See something happening around you? Post it. Photo, video, or text. You are on the ground — we are not.",
      tag: "REAL-TIME BROADCASTS"
    },
    {
      icon: "✅",
      title: "Verify the Truth",
      description: "Community decides what is real. Cap it if it is fake. Vouch it if you see it too. No editor needed.",
      tag: "CROWD VERIFICATION"
    },
    {
      icon: "⚡",
      title: "Hold Power Accountable",
      description: "Corruption, government failures, local injustice — post it anonymously. Your voice has reach. Their secrets do not.",
      tag: "DECRYPTED OPERATIONS"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div
      className={`w-full h-screen flex flex-col justify-between p-6 relative overflow-hidden transition-all duration-300 ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-[#FAFAFA] text-neutral-900'
      }`}
      id="onboarding-container"
    >
      {/* Background neon green grids/glows */}
      <div className={`absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full blur-3xl pointer-events-none ${
        theme === 'dark' ? 'bg-[#39FF14]/5' : 'bg-[#2ECC0F]/5'
      }`} />
      <div className={`absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] rounded-full blur-3xl pointer-events-none ${
        theme === 'dark' ? 'bg-[#39FF14]/5' : 'bg-[#2ECC0F]/5'
      }`} />

      {/* Header Info */}
      <div className="flex justify-between items-center z-10 py-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`px-1.5 py-0.5 text-[10px] font-mono font-black rounded tracking-widest uppercase ${
            theme === 'dark' ? 'bg-[#39FF14] text-black' : 'bg-[#2ECC0F] text-white'
          }`}>
            GRID
          </span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            INITIALIZATION
          </span>
        </div>
        {currentSlide < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className={`text-xs font-mono tracking-widest uppercase transition-colors cursor-pointer ${
              theme === 'dark' ? 'text-gray-500 hover:text-[#39FF14]' : 'text-gray-500 hover:text-[#2ECC0F]'
            }`}
            id="onboarding-skip-btn"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Slide Carousel Section */}
      <div className="flex-1 flex items-center justify-center relative z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center text-center space-y-6 px-4"
            id={`onboarding-slide-${currentSlide}`}
          >
            {/* Big Icon Container with Pulse Glow */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-2xl pointer-events-none ${
                theme === 'dark' ? 'bg-[#39FF14]/5' : 'bg-[#2ECC0F]/5'
              }`} />
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl relative z-10 select-none border ${
                theme === 'dark' ? 'bg-[#111111] border-neutral-900' : 'bg-white border-gray-200 shadow-md'
              }`}>
                {slides[currentSlide].icon}
              </div>
            </div>

            {/* Tag / Category */}
            <span className={`text-[10px] font-mono font-black tracking-[0.25em] uppercase ${
              theme === 'dark' ? 'text-[#39FF14]' : 'text-[#2ECC0F]'
            }`}>
              {slides[currentSlide].tag}
            </span>

            {/* Title */}
            <h2 className={`text-2xl md:text-3xl font-black tracking-tight uppercase leading-none ${
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
            }`}>
              {slides[currentSlide].title}
            </h2>

            {/* Description */}
            <p className={`text-sm font-sans leading-relaxed max-w-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-650'
            }`}>
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Operations Control Block */}
      <div className="z-10 py-6 flex flex-col items-center gap-6 shrink-0 max-w-md w-full mx-auto">
        {/* Navigation Dots */}
        <div className="flex items-center gap-2.5" id="onboarding-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? (theme === 'dark' ? "w-6 bg-[#39FF14]" : "w-6 bg-[#2ECC0F]") 
                  : (theme === 'dark' ? "w-2 bg-gray-800" : "w-2 bg-gray-300")
              }`}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="w-full">
          {currentSlide === slides.length - 1 ? (
            <button
              onClick={handleNext}
              className={`w-full py-4 font-black font-mono text-sm uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                theme === 'dark' ? 'bg-[#39FF14] text-black' : 'bg-[#2ECC0F] text-white shadow-md hover:opacity-90'
              }`}
              id="onboarding-get-started-btn"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 shrink-0 stroke-[3]" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`w-full py-4 border font-black font-mono text-sm uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-[#111111] hover:bg-[#151515] text-white hover:text-[#39FF14] border-neutral-900 hover:border-[#39FF14]/30' 
                  : 'bg-white hover:bg-gray-50 text-neutral-800 hover:text-[#2ECC0F] border-gray-200 hover:border-[#2ECC0F]/30 shadow-xs'
              }`}
              id="onboarding-next-btn"
            >
              <span>Next Sector</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>

        {/* Powered and Secure watermark */}
        <div className="flex items-center gap-1 text-[8px] text-gray-600 font-mono uppercase tracking-widest">
          <ShieldAlert className="w-3 h-3 text-gray-600" />
          <span>GroundZero Core Operations</span>
        </div>
      </div>
    </div>
  );
}
