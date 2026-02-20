import React, { useState, useEffect } from 'react';

const LoadingOverlay: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "사진 속 숨겨진 호치민의 활기를 찾아내고 있어요! ✨",
    "생동감 넘치는 어휘들로 문장에 리듬을 불어넣는 중입니다. 🎵",
    "1인칭을 쏙 뺀, 객관적이면서도 매력적인 시선을 담고 있어요. 🖋️",
    "과거의 기억을 눈부신 서사로 생생하게 복원합니다. 📸",
    "~요/죠와 ~습니다의 완벽한 박자감을 조율하고 있어요. 🥁",
    "곧 16문단의 리드미컬한 비즈니스 리포트가 완성됩니다! 🚀"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md">
      <div className="relative w-28 h-28 mb-10">
        <div className="absolute inset-0 border-[6px] border-blue-50 rounded-full"></div>
        <div className="absolute inset-0 border-[6px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      </div>
      <div className="h-16 flex items-center justify-center overflow-hidden px-6">
        <h2 className="text-2xl font-black text-slate-800 text-center leading-tight transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
          {messages[messageIndex]}
        </h2>
      </div>
      <div className="mt-8 flex flex-col items-center">
        <p className="text-slate-400 text-sm font-medium tracking-wide">활기찬 감동과 비즈니스의 조화를 엮어내는 중</p>
        <div className="mt-4 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 animate-[loading_15s_ease-in-out_infinite]"></div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 98%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
