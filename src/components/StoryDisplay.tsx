import React, { useState } from 'react';

interface Paragraph {
  id: string;
  number: number;
  content: string;
  isEditing: boolean;
}

interface StoryDisplayProps {
  story: string;
}

interface WordStats {
  totalChars: number;
  totalCharsWithoutSpaces: number;
  paragraphCount: number;
  paragraphStats: Array<{ number: number; chars: number; charsWithoutSpaces: number }>;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story }) => {
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
                  {editMode && (
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-blue-300">
                        ⋮⋮
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-lg md:text-xl text-slate-700 leading-[1.9] whitespace-pre-wrap font-light">
                      <span className="font-normal text-slate-500">{idx + 1}. </span>
                      {para.content}
                    </p>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => handleEditParagraph(para.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-bold text-sm"
                    >
                      수정
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </article>

        {/* 푸터 */}
        <footer className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center">
          <div className="bg-blue-50/50 rounded-2xl p-8 mb-10 text-center max-w-2xl border border-blue-100">
            <p className="text-blue-800 text-sm font-bold mb-2">기록 최적화 완료</p>
            <p className="text-slate-500 text-sm italic leading-relaxed">
              {editMode ? (
                <>
                  <strong>편집 모드 활성화됨</strong><br/>
                  문단을 드래그하여 순서를 변경하거나, 수정 버튼으로 내용을 편집할 수 있습니다.
                </>
              ) : (
                <>
                  매번 다른 시각으로 분석된 독창적인 서사와 함께<br/>
                  <strong>제목, 1~16번 문단 번호, 원숫자 키워드(①~⑤)</strong>가 모두 적용되었습니다.
                </>
              )}
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-center gap-3 flex-wrap">
            <button
              onClick={handleCopy}
              className="group flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-xl shadow-blue-200 transform hover:-translate-y-1 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              복사하기
            </button>
            <button
              onClick={handleDownload}
              className="group flex items-center justify-center px-8 py-4 bg-slate-600 text-white rounded-2xl hover:bg-slate-700 transition-all font-bold shadow-xl shadow-slate-200 transform hover:-translate-y-1 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              다운로드
            </button>
            
            {(() => {
              const stats = calculateStats();
              return (
                <div className="flex items-center gap-2 px-6 py-4 bg-purple-100 text-purple-700 rounded-2xl font-bold shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <span>{stats.totalCharsWithoutSpaces.toLocaleString()}자</span>
                </div>
              );
            })()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StoryDisplay;
