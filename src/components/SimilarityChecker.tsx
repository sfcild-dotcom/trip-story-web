import React from 'react';
import { SimilarityCheckResult } from '../services/similarityService';

interface SimilarityCheckerProps {
  results: SimilarityCheckResult[];
  onRetry: () => void;
}

export const SimilarityChecker: React.FC<SimilarityCheckerProps> = ({
  results,
  onRetry,
}) => {
  const hasWarnings = results.some(r => r.isWarning);

  if (!hasWarnings) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="text-green-600 text-xl">✓</div>
          <div>
            <h3 className="font-semibold text-green-900">유사도 검사 완료</h3>
            <p className="text-green-700 text-sm mt-1">
              모든 키워드 문장이 유사도 기준을 통과했습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-red-600 text-xl">⚠</div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">유사도 경고</h3>
          <p className="text-red-700 text-sm mt-1 mb-3">
            다음 문장들이 30% 이상의 유사도를 보입니다. 글이 반려될 수 있으니 재생성을 권장합니다.
          </p>
          
          <div className="space-y-2 mb-3">
            {results
              .filter(r => r.isWarning)
              .map((result, idx) => (
                <div key={idx} className="bg-white rounded p-2 border border-red-100">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm text-gray-700 flex-1">"{result.sentence}"</p>
                    <span className="text-red-600 font-semibold text-sm whitespace-nowrap">
                      {result.similarity}%
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            글 재생성하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimilarityChecker;
