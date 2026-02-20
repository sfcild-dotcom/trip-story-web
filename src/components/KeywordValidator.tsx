import React, { useMemo } from 'react';

interface KeywordValidatorProps {
  story: string;
  keyword: string;
}

interface KeywordInstance {
  number: number;
  paragraph: string;
  circledKeyword: string;
  context: string;
  isNatural: boolean;
}

const KeywordValidator: React.FC<KeywordValidatorProps> = ({ story, keyword }) => {
  const keywordInstances = useMemo(() => {
    const instances: KeywordInstance[] = [];
    const lines = story.split('\n').filter(l => l.trim());
    
    // 원숫자 패턴 찾기
    const circledNumbers = ['①', '②', '③', '④', '⑤'];
    
    lines.forEach((line, idx) => {
      circledNumbers.forEach((circle, circleIdx) => {
        const pattern = new RegExp(`${circle}[^\\n]*${keyword}[^\\n]*`, 'g');
        const matches = line.match(pattern);
        
        if (matches) {
          matches.forEach(match => {
            // 문단 번호 추출
            const paragraphMatch = line.match(/^(\d+)\./);
            const paragraphNum = paragraphMatch ? parseInt(paragraphMatch[1]) : idx;
            
            // 전후 문맥 추출 (최대 50자)
            const keywordIndex = line.indexOf(keyword);
            const start = Math.max(0, keywordIndex - 30);
            const end = Math.min(line.length, keywordIndex + keyword.length + 30);
            const context = line.substring(start, end);
            
            instances.push({
              number: circleIdx + 1,
              paragraph: paragraphNum,
              circledKeyword: `${circle}${keyword}`,
              context: context.trim(),
              isNatural: validateNaturalness(line, keyword)
            });
          });
        }
      });
    });
    
    return instances;
  }, [story, keyword]);

  const validateNaturalness = (sentence: string, keyword: string): boolean => {
    // 기본 문법 검증
    const hasProperGrammar = /[가-힣]+[다요죠예습니다]+$/.test(sentence);
    const hasProperSubject = /[가-힣]+[이가을를에게서로부터]/.test(sentence);
    const keywordNotAlone = sentence.match(new RegExp(`[가-힣]${keyword}[가-힣]`));
    
    return hasProperGrammar && hasProperSubject && !!keywordNotAlone;
  };

  const naturalCount = keywordInstances.filter(k => k.isNatural).length;
  const totalCount = keywordInstances.length;
  const naturalPercentage = totalCount > 0 ? Math.round((naturalCount / totalCount) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <h3 className="text-2xl font-bold text-slate-900">키워드 자연스러움 검증</h3>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-blue-100">
          <p className="text-slate-600 text-sm font-semibold mb-2">키워드 배치 횟수</p>
          <p className="text-4xl font-black text-blue-600">{totalCount}</p>
          <p className="text-xs text-slate-500 mt-2">회</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-green-100">
          <p className="text-slate-600 text-sm font-semibold mb-2">자연스러운 배치</p>
          <p className="text-4xl font-black text-green-600">{naturalCount}</p>
          <p className="text-xs text-slate-500 mt-2">회</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-purple-100">
          <p className="text-slate-600 text-sm font-semibold mb-2">자연스러움 비율</p>
          <p className="text-4xl font-black text-purple-600">{naturalPercentage}%</p>
          <p className="text-xs text-slate-500 mt-2">달성도</p>
        </div>
      </div>

      {/* 키워드별 상세 분석 */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h4 className="font-bold text-slate-900 mb-4 text-lg">키워드별 배치 상세</h4>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {keywordInstances.length > 0 ? (
            keywordInstances.map((instance, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border-l-4 transition-all ${
                  instance.isNatural 
                    ? 'bg-green-50 border-l-green-500' 
                    : 'bg-yellow-50 border-l-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-700">{instance.circledKeyword}</span>
                    <span className="text-sm font-semibold text-slate-600">
                      {instance.paragraph}번 문단
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {instance.isNatural ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        자연스러움
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        검토 필요
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 font-medium">
                  "{instance.context}"
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-8">키워드가 아직 배치되지 않았습니다.</p>
          )}
        </div>
      </div>

      {/* 검증 결과 요약 */}
      <div className="mt-6 p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl border border-blue-200">
        <p className="text-slate-700 font-medium leading-relaxed">
          {naturalPercentage === 100 ? (
            <>
              <span className="font-bold text-green-700">✓ 완벽합니다!</span> 모든 키워드가 자연스럽고 문법적으로 정확하게 배치되었습니다. 이 글은 높은 수준의 완성도를 갖추고 있습니다.
            </>
          ) : naturalPercentage >= 80 ? (
            <>
              <span className="font-bold text-green-700">✓ 매우 좋습니다!</span> 대부분의 키워드가 자연스럽게 배치되었습니다. 검토 필요 항목을 확인하시고 필요시 수정하세요.
            </>
          ) : naturalPercentage >= 50 ? (
            <>
              <span className="font-bold text-yellow-700">△ 보통입니다.</span> 키워드 배치가 부분적으로 어색합니다. 검토 필요 항목들을 편집 모드에서 수정하시기를 권장합니다.
            </>
          ) : (
            <>
              <span className="font-bold text-red-700">✗ 개선 필요합니다.</span> 많은 키워드가 어색하게 배치되었습니다. 편집 모드에서 문장을 다시 작성하시기를 강력히 권장합니다.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default KeywordValidator;
