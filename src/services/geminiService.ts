/**
 * 호치민 출장 후기 AI 생성 서비스
 * Gemini 2.5 Flash API를 사용하여 14장의 사진으로부터 16문단의 고객후기 생성
 */

export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export const generateTripStory = async (
  images: ImageData[],
  userKeywords: string
): Promise<string> => {
  // 빌드 시점에 환경변수가 포함됨
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
  }

  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.base64.split(",")[1],
    },
  }));

  const fullPrompt = `호텔 고객후기 전문 라이터입니다. 14장 사진을 분석하여 "노보텔 사이공센터" 고객후기를 작성하세요.

[필수 규칙]
- 제목: "노보텔 사이공센터 [키워드 포함 감각적 문장]" (마침표 없음)
- 저자: "Business Consultant" + 날짜
- 구조: 정확히 16개 문단 (1. 2. 3. ... 16. 형식)
- 분량: 공백 제외 정확히 1800자

[문단별 내용]
1번: 서론 (여정 시작, 감정) 200~250자
2~5번: 비행 전 라운지, 기내식, 체크인 등 각 100~150자
6~9번: 객실 (침대, 욕실, 소파, 창문) 각 100~150자
10번: 루프탑 바 (①키워드 필수) 100~150자
11~12번: 바, 테라스 각 100~150자
13번: 조식 (②키워드 필수) 100~150자
14~15번: 라운지 (③키워드 필수) 각 100~150자
16번: 결론 (종합정리, 감사) 200~250자

[키워드 배치 - 정확히 6회]
키워드: "${userKeywords}"

1. 제목: 1회 - "노보텔 사이공센터 [키워드 포함]"
2. 1번 문단: 1회 - "너무나도 알차게 보내고 온 이번 ${userKeywords}..."
3. 10번 문단: 1회 - "①${userKeywords} 중에 가장 기억에 남는 장소..."
4. 13번 문단: 1회 - "②${userKeywords} 중에 꼭 이야기 하고 싶은 게..."
5. 15번 문단: 1회 - "③${userKeywords} 기간 내내 집중력을 잃지 않고..."
6. 16번 문단: 1회 - "이번 ${userKeywords}를 한 단어로 정리하면 '대만족'이었습니다."

절대 준수:
- 원숫자 ①②③은 키워드 바로 앞에 붙임 (①${userKeywords})
- 각 위치에 정확히 1회만 (중복 금지)
- 호텔명 "노보텔 사이공센터"는 정확히 5회 (제목 1회 + 본론 2~5번 중 4회)

[톤과 스타일]
- 종결어미: ~어요, ~죠, ~답니다, ~더라고요, ~더군요, ~네요 (다양하게)
- 감정: 감탄, 미소, 편안함, 설렘, 만족감 등 풍부하게
- 시각: 색상(붉은색, 푸른색, 베이지), 질감(부드럽게, 아삭한), 조명(은은한, 화려한)
- 절대 금지: 마크다운, 제목 마침표/느낌표, 1인칭(저는/나는), 반말, 메타적 표현, 중복 단어 10회 이상

[출력 형식]
제목

Business Consultant
날짜

1. 첫 번째 문단
2. 두 번째 문단
...
16. 마지막 문단

모든 규칙을 정확히 준수하여 16개 문단을 완성하세요.`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
                ...imageParts,
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      throw new Error("API에서 텍스트를 생성하지 못했습니다.");
    }

    return generatedText;
  } catch (error) {
    console.error("Gemini API 오류:", error);
    throw error;
  }
};
