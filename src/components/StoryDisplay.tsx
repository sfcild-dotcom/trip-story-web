import React, { useState } from 'react';

interface Paragraph {
  id: string;
  number: number;
  content: string;
  isEditing: boolean;
}

interface StoryDisplayProps {
  story: string;
  keyword?: string;
}

interface WordStats {
  totalChars: number;
  totalCharsWithoutSpaces: number;
  paragraphCount: number;
  paragraphStats: Array<{ number: number; chars: number; charsWithoutSpaces: number }>;
}

interface ValidationResult {
  introduction: { chars: number; passed: boolean; required: number };
  body: { avgChars: number; minChars: number; passed: boolean; required: number };
  conclusion: { chars: number; passed: boolean; required: number };
  total: { chars: number; passed: boolean; required: number };
  allPassed: boolean;
}

const CIRCLED_NUMBERS = ['①', '②', '③', '④', '⑤'];

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, keyword = '' }) => {
  const allLines = story.split('\n').map(l => l.trim()).filter(l => l !== '');
  
  let title = "호치민 출장의 완벽한 밸런스: 노보텔 사이공 센터에서의 기록";
  let contentLines = allLines;

  // 제목 파싱
  if (allLines[0] && (allLines[0].startsWith('제목:') || allLines[0].includes('제목: '))) {
    title = allLines[0].split('제목:').pop()?.trim() || title;
    contentLines = allLines.slice(1);
  } else if (allLines[0] && !/^\d+\./.test(allLines[0]) && allLines[0].length < 100) {
    title = allLines[0];
    contentLines = allLines.slice(1);
  }

  // 문단 파싱
  const parseParagraphs = (): Paragraph[] => {
    return contentLines.map((para, idx) => ({
      id: `para-${idx}`,
      number: idx + 1,
      content: para,
      isEditing: false
    }));
  };

  const [editTitle, setEditTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>(parseParagraphs());
  const [editMode, setEditMode] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const calculateStats = (): WordStats => {
    const allText = paragraphs.map(p => p.content).join('\n\n');
    const totalChars = allText.length;
    const totalCharsWithoutSpaces = allText.replace(/\s/g, '').length;
    
    const paragraphStats = paragraphs.map((p, idx) => ({
      number: idx + 1,
      chars: p.content.length,
      charsWithoutSpaces: p.content.replace(/\s/g, '').length
    }));

    return {
      totalChars,
      totalCharsWithoutSpaces,
      paragraphCount: paragraphs.length,
      paragraphStats
    };
  };

  const validateArticleLength = (): ValidationResult => {
    const stats = calculateStats();
    const intro = stats.paragraphStats[0];
    const bodyParagraphs = stats.paragraphStats.slice(1, -1);
    const conclusion = stats.paragraphStats[stats.paragraphStats.length - 1];
    
    const introChars = intro?.charsWithoutSpaces || 0;
    const bodyAvgChars = bodyParagraphs.length > 0 
      ? Math.round(bodyParagraphs.reduce((sum, p) => sum + p.charsWithoutSpaces, 0) / bodyParagraphs.length)
      : 0;
    const bodyMinChars = bodyParagraphs.length > 0
      ? Math.min(...bodyParagraphs.map(p => p.charsWithoutSpaces))
      : 0;
    const conclusionChars = conclusion?.charsWithoutSpaces || 0;
    const totalChars = stats.totalCharsWithoutSpaces;
    
    const introPassed = introChars >= 250;
    const bodyPassed = bodyMinChars >= 150;
    const conclusionPassed = conclusionChars >= 250;
    const totalPassed = totalChars >= 2900;
    const allPassed = introPassed && bodyPassed && conclusionPassed && totalPassed;
    
    return {
      introduction: { chars: introChars, passed: introPassed, required: 250 },
      body: { avgChars: bodyAvgChars, minChars: bodyMinChars, passed: bodyPassed, required: 150 },
      conclusion: { chars: conclusionChars, passed: conclusionPassed, required: 250 },
      total: { chars: totalChars, passed: totalPassed, required: 2900 },
      allPassed
    };
  };

  const countKeywordOccurrences = (): number => {
    if (!keyword) return 0;
    const allText = paragraphs.map(p => p.content).join('\n\n');
    return (allText.match(new RegExp(keyword, 'g')) || []).length;
  };

  const highlightKeywordWithNumbers = (text: string): React.ReactNode[] => {
    if (!keyword) return [text];
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let keywordCount = 0;
    
    const regex = new RegExp(keyword, 'g');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // 키워드 전 텍스트
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // 원숫자 + 키워드
      keywordCount++;
      const circledNum = CIRCLED_NUMBERS[keywordCount - 1] || '⑤';
      parts.push(
        <span key={`keyword-${match.index}`} className="font-bold text-blue-600">
          {circledNum}{keyword}
        </span>
      );
      
      lastIndex = match.index + keyword.length;
    }
    
    // 마지막 텍스트
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  const handleEditParagraph = (id: string) => {
    setParagraphs(prev => prev.map(p => 
      p.id === id ? { ...p, isEditing: !p.isEditing } : p
    ));
  };

  const handleUpdateParagraph = (id: string, newContent: string) => {
    setParagraphs(prev => prev.map(p => 
      p.id === id ? { ...p, content: newContent } : p
    ));
  };

  const handleDeleteParagraph = (id: string) => {
    if (confirm("이 문단을 삭제하시겠습니까?")) {
      setParagraphs(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddParagraph = () => {
    const newId = `para-${Date.now()}`;
    setParagraphs(prev => [...prev, {
      id: newId,
      number: prev.length + 1,
      content: "새로운 문단을 입력하세요.",
      isEditing: true
    }]);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = paragraphs.findIndex(p => p.id === draggedId);
    const targetIndex = paragraphs.findIndex(p => p.id === targetId);

    const newParagraphs = [...paragraphs];
    const [draggedItem] = newParagraphs.splice(draggedIndex, 1);
    newParagraphs.splice(targetIndex, 0, draggedItem);

    setParagraphs(newParagraphs);
    setDraggedId(null);
  };

  const handleCopy = () => {
    const fullText = `${editTitle}\n\n${paragraphs.map(p => p.content).join('\n\n')}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert('제목과 모든 문단이 클립보드에 복사되었습니다!');
    }).catch(err => {
      console.error('복사 실패:', err);
    });
  };

  const handleDownload = () => {
    const fullText = `${editTitle}\n\n${paragraphs.map(p => p.content).join('\n\n')}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fullText));
    element.setAttribute('download', `호치민출장후기_${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <header className="mb-16 text-center relative">
          <div className="inline-block px-6 py-2 mb-6 text-sm font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
            Premium Business Trip Report
          </div>
          
          {/* 제목 편집 */}
          <div className="relative group">
            {isEditingTitle ? (
              <div className="flex gap-2 justify-center mb-8">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-3xl md:text-5xl font-black text-slate-900 border-2 border-blue-500 rounded-lg p-4 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div 
                onClick={() => editMode && setIsEditingTitle(true)}
                className={`text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8 ${editMode ? 'cursor-pointer hover:bg-blue-50 p-4 rounded-lg transition-colors' : ''}`}
              >
                {editTitle}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-6 text-slate-400 font-medium">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Business Consultant</span>
            </div>
            <span className="h-6 w-px bg-slate-200"></span>
            <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        {/* 편집 모드 토글 및 통계 */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                editMode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              {editMode ? '편집 완료' : '문단 편집'}
            </button>
            
            {editMode && (
              <button
                onClick={handleAddParagraph}
                className="px-6 py-3 rounded-lg font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                문단 추가
              </button>
            )}

            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                showStats
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              {showStats ? '통계 닫기' : '글자수 통계'}
            </button>
          </div>

          {/* 글자수 통계 패널 */}
          {showStats && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                글자수 통계
              </h3>
              
              {(() => {
                const stats = calculateStats();
                return (
                  <div className="space-y-6">
                    {/* 전체 통계 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                        <p className="text-slate-600 text-sm font-semibold mb-2">전체 글자수 (공백 포함)</p>
                        <p className="text-4xl font-black text-purple-600">{stats.totalChars.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-2">자</p>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                        <p className="text-slate-600 text-sm font-semibold mb-2">글자수 (공백 제외)</p>
                        <p className="text-4xl font-black text-blue-600">{stats.totalCharsWithoutSpaces.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-2">자</p>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <p className="text-slate-600 text-sm font-semibold mb-2">문단 수</p>
                        <p className="text-4xl font-black text-slate-700">{stats.paragraphCount}</p>
                        <p className="text-xs text-slate-500 mt-2">개</p>
                      </div>
                    </div>

                    {/* 키워드 개수 확인 */}
                    {keyword && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-200">
                        <p className="text-slate-600 text-sm font-semibold mb-2">키워드 배치 확인</p>
                        <p className="text-3xl font-black text-blue-600 flex items-center gap-2">
                          {countKeywordOccurrences()}
                          <span className="text-lg text-slate-600">/ 5회</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {countKeywordOccurrences() === 5 ? '✅ 정확히 5회 배치됨' : '⚠️ 키워드 개수 확인 필요'}
                        </p>
                      </div>
                    )}

                    {/* 문단별 통계 */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-4 text-lg">문단별 글자수</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {stats.paragraphStats.map((stat) => (
                          <div key={stat.number} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                                {stat.number}
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min((stat.charsWithoutSpaces / 200) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-slate-900">{stat.chars}</p>
                              <p className="text-xs text-slate-500">({stat.charsWithoutSpaces})</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 분량 규칙 검증 */}
                    <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        분량 규칙 검증
                      </h4>
                      {(() => {
                        const validation = validateArticleLength();
                        return (
                          <div className="space-y-3">
                            <div className={`p-3 rounded-lg flex items-center justify-between ${
                              validation.introduction.passed 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                            }`}>
                              <span className="font-semibold text-slate-700">서론 (1번 문단)</span>
                              <span className={`font-bold ${
                                validation.introduction.passed ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {validation.introduction.chars}자 / {validation.introduction.required}자 이상
                              </span>
                            </div>
                            
                            <div className={`p-3 rounded-lg flex items-center justify-between ${
                              validation.body.passed 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                            }`}>
                              <span className="font-semibold text-slate-700">본문 (2~15번 문단)</span>
                              <span className={`font-bold ${
                                validation.body.passed ? 'text-green-600' : 'text-red-600'
                              }`}>
                                최소 {validation.body.minChars}자 / {validation.body.required}자 이상 필요
                              </span>
                            </div>
                            
                            <div className={`p-3 rounded-lg flex items-center justify-between ${
                              validation.conclusion.passed 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                            }`}>
                              <span className="font-semibold text-slate-700">결론 (16번 문단)</span>
                              <span className={`font-bold ${
                                validation.conclusion.passed ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {validation.conclusion.chars}자 / {validation.conclusion.required}자 이상
                              </span>
                            </div>
                            
                            <div className={`p-3 rounded-lg flex items-center justify-between border-2 ${
                              validation.total.passed 
                                ? 'bg-blue-50 border-blue-300' 
                                : 'bg-orange-50 border-orange-300'
                            }`}>
                              <span className="font-bold text-slate-900">전체 분량</span>
                              <span className={`font-bold text-lg ${
                                validation.total.passed ? 'text-blue-600' : 'text-orange-600'
                              }`}>
                                {validation.total.chars}자 / {validation.total.required}자 이상
                              </span>
                            </div>
                            
                            <div className={`p-4 rounded-lg text-center font-bold text-lg ${
                              validation.allPassed
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            }`}>
                              {validation.allPassed ? '✅ 모든 분량 규칙 통과!' : '⚠️ 분량 규칙 미충족 항목 있음'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* 통계 요약 */}
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border border-purple-200">
                      <p className="text-slate-700 font-medium leading-relaxed">
                        <span className="font-bold text-purple-700">총 {stats.paragraphCount}개 문단</span>으로 구성된 이 글은 <span className="font-bold text-blue-700">{stats.totalCharsWithoutSpaces.toLocaleString()}자</span>입니다. 
                        <span className="block text-sm text-slate-600 mt-2">평균 {Math.round(stats.totalCharsWithoutSpaces / stats.paragraphCount)}자/문단</span>
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* 문단 목록 */}
        <article className="space-y-6">
          {paragraphs.map((para, idx) => (
            <div
              key={para.id}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, para.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, para.id)}
              className={`
                transition-all duration-300 relative group
                ${editMode ? 'cursor-move hover:bg-slate-50 p-4 rounded-lg border-2 border-dashed border-transparent hover:border-blue-300' : ''}
                ${draggedId === para.id ? 'opacity-50 bg-blue-50 border-blue-300' : ''}
              `}
            >
              {para.isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="text-sm font-bold text-slate-500 pt-2">{idx + 1}.</span>
                    <textarea
                      value={para.content}
                      onChange={(e) => handleUpdateParagraph(para.id, e.target.value)}
                      className="flex-1 text-lg text-slate-700 border-2 border-blue-500 rounded-lg p-3 focus:outline-none font-light resize-none"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEditParagraph(para.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-sm"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => handleDeleteParagraph(para.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-slate-700 leading-relaxed font-light">
                      {highlightKeywordWithNumbers(para.content)}
                    </p>
                    {editMode && (
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditParagraph(para.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 font-semibold text-sm"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleDeleteParagraph(para.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 font-semibold text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </article>

        {/* 액션 버튼 */}
        <div className="flex gap-3 justify-center mt-12 flex-wrap">
          <button
            onClick={handleCopy}
            className="px-6 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-bold transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 011 1v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9a2 2 0 01-2-2v-2H6a1 1 0 110-2h1V9H6a1 1 0 110-2h1V5a2 2 0 012-2h2V3zM9 5a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V6a1 1 0 00-1-1H9z" />
            </svg>
            복사
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-bold transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1m3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryDisplay;
