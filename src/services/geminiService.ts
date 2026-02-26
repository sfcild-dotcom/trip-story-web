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

  const fullPrompt = `당신은 호텔 고객후기 전문 라이터입니다. 고객이 촬영한 14장의 사진을 분석하여 "노보텔 사이공센터"에 대한 솔직하고 감동적인 고객후기를 작성합니다.

[핵심 규칙]
- 제목: "노보텔 사이공센터 [키워드 포함 감각적 문장]" (마침표 없음)
- 저자: "Business Consultant" + 날짜
- 본문: 정확히 16개 문단 (1~16번)
- 분량: 공백 제외 정확히 1800자

[문단 구성]
1번: 서론 (여정 시작, 감정) 200~250자
2~5번: 비행 전 라운지, 기내식 등 각 100~150자
6~9번: 호텔 도착, 객실, 욕실 각 100~150자
10번: 루프탑 바 (①키워드) 100~150자
11~12번: 바, 테라스 각 100~150자
13번: 조식 (②키워드) 100~150자
14~15번: 라운지 (③키워드) 각 100~150자
16번: 결론 (종합정리) 200~250자

[사진 배치]
1~2번: 비행기/기내식/과일
3~5번: 공항 라운지/체크인/로비
6~9번: 객실 (침대/욕실/소파/창문)
10~12번: 루프탑 바/야경/칵테일
13번: 조식 뷔페
14~15번: 라운지 공간

[키워드 배치 - 정확히 6회]
사용자 키워드: "${userKeywords}"

위치:
1. 제목: 1회 ("노보텔 사이공센터 [키워드 포함 감각적 문장]")
2. 1번 문단: 1회 (감정 표현과 함께)
3. 10번 문단: 1회 (①키워드, 원숫자 필수)
4. 13번 문단: 1회 (②키워드, 원숫자 필수)
5. 15번 문단: 1회 (③키워드, 원숫자 필수)
6. 16번 문단: 1회 (종합정리 표현)

규칙: 각 위치에 정확히 1회만, 중복 금지, 원숫자 ①②③만 사용

[키워드 배치 방법]
방법 1: 감정 표현 - "너무나도 알차게 보내고 온 이번 호치민 출장후기..."
방법 2: 상황 설명 - "①호치민 출장 중에 가장 기억에 남는 장소..."
방법 3: 목적 표현 - "자세한 호치민 출장후기를 통해 분위기를 전해드릴게요."
방법 4: 강조 표현 - "이처럼 완벽한 호치민 출장을 만들어준 노보텔 사이공센터..."
방법 5: 종합정리 표현 - "이번 호치민 출장을 한 단어로 정리하면 '대만족'이었습니다."

[톤과 스타일]
종결어미: "~어요", "~죠", "~답니다", "~더라고요", "~더군요", "~네요" (다양하게)
감정: "감탄", "미소", "편안함", "스트레스 해소" 등 풍부하게
시각: 색상(붉은색, 푸른색, 베이지), 질감(부드럽게, 아삭한), 조명(은은한, 화려한)

[호텔명 배치 - 정확히 5회]
제목: 1회
본론 2~5번: 각 1회씩 4회

[분량 - 정확히 1800자]
1번: 200~250자
2~15번: 각 100~150자
16번: 200~250자

[절대 금지]
마크다운, 제목 마침표/느낌표, 1인칭, 반말, 메타적 표현, 억지 키워드, 사진 번호, 중복 단어 10회 이상, 원숫자 오류

[체크]
- 키워드 정확히 6회 (제목 1, 1번 1, 10번 1, 13번 1, 15번 1, 16번 1)
- 원숫자 ①②③ 정확히
- 호텔명 정확히 5회
- 분량 정확히 1800자
- 중복 단어 최대 9회 이하
- 모든 문단이 사진 내용 반영
- 감정과 시각적 표현 풍부

[출력 형식]
제목

Business Consultant
날짜

1. 문단 1
2. 문단 2
...
16. 문단 16

모든 규칙을 정확히 준수하여 16개 문단을 완성하세요. 특히 키워드 6회, 원숫자 ①②③, 호텔명 5회, 분량 1800자를 정확히 지키세요.`;

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
