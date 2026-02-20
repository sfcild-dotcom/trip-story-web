import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import StoryDisplay from './components/StoryDisplay';
import LoadingOverlay from './components/LoadingOverlay';
import { generateTripStory } from './services/geminiService';
import { ImageSlot, GenerationState } from './types';

const INITIAL_SLOTS: ImageSlot[] = Array.from({ length: 14 }, (_, i) => ({
  index: i,
  label: `${i + 1}번 사진`,
  image: null,
}));

const App: React.FC = () => {
  const [slots, setSlots] = useState<ImageSlot[]>(INITIAL_SLOTS);
  const [keywords, setKeywords] = useState<string>("");
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    story: null,
  });

  const handleGenerate = async () => {
    const filledImages = slots
      .map(s => s.image)
      .filter((img): img is NonNullable<typeof img> => img !== null);

    if (filledImages.length !== 14) {
      alert("전체 여정을 구성하기 위해 14장의 사진을 모두 채워주세요!");
      return;
    }

    if (!keywords.trim()) {
      alert("글의 중심이 될 키워드를 입력해주세요!");
      return;
    }

    setState({ ...state, isLoading: true, error: null });

    try {
      const generatedStory = await generateTripStory(filledImages, keywords);
      setState({
        isLoading: false,
        story: generatedStory,
        error: null
      });
      
      setTimeout(() => {
        document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setState({
        isLoading: false,
        story: null,
        error: "후기 생성 중 에너지가 부족했나 봐요. 다시 한 번 시도해주시겠어요?"
      });
      console.error(err);
    }
  };

  const handleReset = () => {
    if (slots.some(s => s.image) || state.story || keywords) {
      if (confirm("새로운 영감을 위해 모든 기록을 초기화할까요?")) {
        setSlots(INITIAL_SLOTS);
        setKeywords("");
        setState({ isLoading: false, story: null, error: null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 px-4 md:px-8 font-['Noto_Sans_KR']">
      <nav className="max-w-7xl mx-auto py-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tighter uppercase">호치민 출장후기</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto">
        <section className="text-center mb-16 py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            사진을 보여주면 완성되는<br/><span className="text-blue-600">감각적인 호치민</span> 출장 기록
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
            AI가 14장의 사진 속 시각 정보를 직접 분석하여<br className="hidden md:block" />
            활기찬 리듬이 느껴지는 16문단의 과거형 후기를 완성합니다.
          </p>
        </section>

        <section className="mb-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">이야기의 중심 키워드</h2>
          </div>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="예: 호치민의열기, 비즈니스와쉼의조화"
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-lg text-slate-700 placeholder:text-slate-300 font-medium"
          />
        </section>

        <ImageUploader slots={slots} setSlots={setSlots} onReset={handleReset} />

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
          <button
            onClick={handleGenerate}
            disabled={slots.some(s => !s.image) || state.isLoading || !keywords.trim()}
            className={`
              px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300
              flex items-center space-x-3 transform w-full sm:w-auto justify-center
              ${!slots.some(s => !s.image) && !state.isLoading && keywords.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>감각적인 후기 생성</span>
          </button>
        </div>
        
        {state.story && (
          <div id="story-section" className="relative scroll-mt-20">
            <StoryDisplay story={state.story} />
          </div>
        )}
      </main>

      {state.isLoading && <LoadingOverlay />}
    </div>
  );
};

export default App;
