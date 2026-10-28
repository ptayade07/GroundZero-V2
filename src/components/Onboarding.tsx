import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, ShieldAlert, MapPin, CheckCircle, Zap } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
  theme?: "light" | "dark";
}

export default function Onboarding({ onComplete, theme = "dark" }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <MapPin className={`w-10 h-10 ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`} />,
      title: "Be the Reporter",
      description: "See something happening around you? Post it. Photo, video, or text. You are on the ground — we are not.",
      tag: "REAL-TIME BROADCASTS"
    },
    {
      icon: <CheckCircle className={`w-10 h-10 ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`} />,
      title: "Verify the Truth",
      description: "Community decides what is real. Flag any fake info as CAP. Vouch it if you see it too. No editor needed.",
      tag: "CROWD VERIFICATION"
    },
    {
      icon: <Zap className={`w-10 h-10 ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}`} />,
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
      className={`w-full h-screen flex flex-col justify-between p-6 relative overflow-hidden transition-all duration-300 font-ui ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-[#FAFCFA] text-[#171B18]'
      }`}
      id="onboarding-container"
    >
      {/* Background neon green grids/glows */}
      <div className={`absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full blur-3xl pointer-events-none ${
        theme === 'dark' ? 'bg-[#B7FF38]/5' : 'bg-[#537A00]/5'
      }`} />
      <div className={`absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] rounded-full blur-3xl pointer-events-none ${
        theme === 'dark' ? 'bg-[#B7FF38]/5' : 'bg-[#537A00]/5'
      }`} />

      {/* Header Info */}
      <div className="flex justify-between items-center z-10 py-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 text-[10px] font-meta font-bold rounded-[6px] tracking-widest uppercase ${
            theme === 'dark' ? 'bg-[#B7FF38] text-black' : 'bg-[#537A00] text-white'
          }`}>
            GRID
          </span>
          <span className="text-[10px] text-[#A3A3A3] font-meta tracking-widest uppercase">
            INITIALIZATION
          </span>
        </div>
        {currentSlide < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className={`text-xs font-meta tracking-widest uppercase transition-colors cursor-pointer ${
              theme === 'dark' ? 'text-[#A3A3A3] hover:text-[#B7FF38]' : 'text-[#626862] hover:text-[#537A00]'
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
            className={`w-full max-w-[340px] border rounded-[12px] p-6 flex flex-col items-center text-center space-y-4 shadow-2xl transition-all duration-300 ${
              theme === 'dark'
                ? "bg-[#111111] border-[#303030] text-white"
                : "bg-white border-[#E1E5DF] text-[#171B18]"
            }`}
            id={`onboarding-slide-${currentSlide}`}
          >
            {/* Big Icon Container with Pulse Glow */}
            <div className="relative">
              <div className={`w-18 h-18 rounded-[12px] flex items-center justify-center relative z-10 select-none border ${
                theme === 'dark' ? 'bg-[#191919] border-[#303030]' : 'bg-[#F1F4EF] border-[#E1E5DF]'
              }`}>
                {React.cloneElement(slides[currentSlide].icon, { className: `w-8 h-8 ${theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'}` })}
              </div>
            </div>

            {/* Tag / Category */}
            <span className={`text-[10px] font-meta font-bold tracking-[0.25em] uppercase ${
              theme === 'dark' ? 'text-[#B7FF38]' : 'text-[#537A00]'
            }`}>
              {slides[currentSlide].tag}
            </span>

            {/* Title */}
            <h2 className={`text-xl md:text-2xl font-display font-black tracking-tight uppercase leading-none ${
              theme === 'dark' ? 'text-white' : 'text-[#171B18]'
            }`}>
              {slides[currentSlide].title}
            </h2>

            {/* Description */}
            <p className={`text-xs leading-relaxed max-w-xs ${
              theme === 'dark' ? 'text-[#A3A3A3]' : 'text-[#626862]'
            }`}>
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Operations Control Block */}
      <div className="z-10 py-4 flex flex-col items-center gap-4 shrink-0 max-w-sm w-full mx-auto">
        {/* Navigation Dots */}
        <div className="flex items-center gap-2" id="onboarding-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? (theme === 'dark' ? "w-5 bg-[#B7FF38]" : "w-5 bg-[#537A00]") 
                  : (theme === 'dark' ? "w-1.5 bg-[#303030]" : "w-1.5 bg-[#E1E5DF]")
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
              className={`w-full min-h-[38px] font-bold font-ui text-xs uppercase tracking-wider rounded-[8px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                theme === 'dark' ? 'bg-[#B7FF38] hover:bg-[#A6ED27] active:bg-[#94D91F] text-black shadow-md' : 'bg-[#537A00] text-white shadow-md'
              }`}
              id="onboarding-get-started-btn"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`w-full min-h-[38px] border font-bold font-ui text-xs uppercase tracking-wider rounded-[8px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-[#191919] hover:bg-[#222222] text-white hover:text-[#B7FF38] border-[#303030] hover:border-[#B7FF38]/40' 
                  : 'bg-white hover:bg-gray-50 text-[#171B18] hover:text-[#537A00] border-[#E1E5DF] hover:border-[#537A00]/40 shadow-xs'
              }`}
              id="onboarding-next-btn"
            >
              <span>Next Sector</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>

        {/* Powered and Secure watermark */}
        <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3] font-meta uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span>GroundZero Core Operations</span>
        </div>
      </div>
    </div>
  );
}
