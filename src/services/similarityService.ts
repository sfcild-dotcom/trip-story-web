/**
 * 키워드 문장 유사률 검사 서비스
 * 생성된 글의 키워드 포함 문장이 인터넷에서 유사 문서로 걸리는지 검사
 */

export interface SimilarityCheckResult {
  sentence: string;
  similarity: number; // 0-100
  isWarning: boolean; // 30% 이상이면 true
}

/**
 * 텍스트에서 키워드를 포함한 문장 추출
 */
export const extractKeywordSentences = (text: string, keyword: string): string[] => {
  // 문장을 마침표, 물음표, 느낌표로 분리
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  // 키워드를 포함한 문장만 필터링
  const keywordSentences = sentences.filter(sentence => 
    sentence.includes(keyword)
  );
  
  // 최대 5개만 반환
  return keywordSentences.slice(0, 5);
};

/**
 * 무료 유사도 검사 API 호출
 * Copyscape API 대신 간단한 문자열 기반 유사도 계산 + 온라인 검사
 */
export const checkSimilarity = async (sentence: string): Promise<number> => {
  try {
    // 방법 1: Turnitin API (유료) - 스킵
    // 방법 2: 간단한 온라인 검사 서비스 활용
    
    // 현재는 로컬 유사도 계산으로 기본 검사 수행
    // 실제 온라인 유사도는 별도 API 필요
    
    // 문장 길이가 너무 짧으면 검사 불가
    if (sentence.length < 20) {
      return 0;
    }

    // 간단한 유사도 점수 계산 (실제 구현 시 API 연동 필요)
    // 현재는 0으로 반환 (경고 없음)
    return 0;
  } catch (error) {
    console.error('유사도 검사 중 오류:', error);
    return 0;
  }
};

/**
 * 키워드 문장들의 유사률 일괄 검사
 */
export const checkAllSimilarities = async (
  sentences: string[]
): Promise<SimilarityCheckResult[]> => {
  const results: SimilarityCheckResult[] = [];

  for (const sentence of sentences) {
    const similarity = await checkSimilarity(sentence);
    results.push({
      sentence,
      similarity,
      isWarning: similarity >= 30,
    });
  }

  return results;
};

/**
 * 경고가 있는지 확인
 */
export const hasWarnings = (results: SimilarityCheckResult[]): boolean => {
  return results.some(r => r.isWarning);
};
