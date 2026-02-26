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

  const fullPrompt = `당신은 호텔 고객후기 전문 라이터입니다. 14장 사진을 분석하여 "노보텔 사이공센터" 고객후기를 작성합니다.

[절대 규칙 - 반드시 지킬 것]

1. 제목: "노보텔 사이공센터, [감각적 표현] ${userKeywords}"
   예: "노보텔 사이공센터, 완벽한 비즈니스 휴식을 누린 ${userKeywords}"

2. 저자: "Business Consultant" + 날짜

3. 16개 문단 작성 (1. 2. 3. ... 16.)
   - 모든 문단을 반드시 완성할 것
   - 각 문단은 완전한 문장으로 끝날 것

4. 키워드 "${userKeywords}" 정확히 6회 배치:
   - 제목: 1회
   - 1번 문단: 1회
   - 10번 문단: 1회 (반드시 ①${userKeywords} 형식)
   - 13번 문단: 1회 (반드시 ②${userKeywords} 형식)
   - 15번 문단: 1회 (반드시 ③${userKeywords} 형식)
   - 16번 문단: 1회

5. 원숫자 규칙 - 매우 중요:
   - 10번 문단에서: 반드시 "①${userKeywords}"라고 쓸 것 (원숫자 ① 필수)
   - 13번 문단에서: 반드시 "②${userKeywords}"라고 쓸 것 (원숫자 ② 필수)
   - 15번 문단에서: 반드시 "③${userKeywords}"라고 쓸 것 (원숫자 ③ 필수)
   - 원숫자 없으면 안 됨

6. 호텔명 "노보텔 사이공센터" 정확히 5회:
   - 제목: 1회
   - 2~5번 문단 중: 4회

[문단별 내용]
1번: 서론 (여정 시작, 감정, 키워드 1회)
2~5번: 비행 전 라운지, 기내식, 체크인 (호텔명 4회)
6~9번: 객실 내용
10번: 루프탑 바 (반드시 ①${userKeywords} 포함)
11~12번: 바, 테라스
13번: 조식 (반드시 ②${userKeywords} 포함)
14~15번: 라운지 (15번에 반드시 ③${userKeywords} 포함)
16번: 결론 (키워드 1회, 감사)

[톤]
- 종결어미: ~어요, ~죠, ~답니다, ~더라고요, ~더군요, ~네요 (다양하게)
- 감정: 감탄, 미소, 편안함, 설렘
- 시각: 색상, 질감, 조명 구체적으로

[절대 금지]
- 마크다운 형식
- 제목에 마침표/느낌표
- 1인칭 (저는, 나는)
- 반말
- 비문 (문법 오류)
- 원숫자 없이 키워드만 쓰기 (10, 13, 15번에는 반드시 ①②③ 붙일 것)

[출력]
제목

Business Consultant
날짜

1. 문단1
2. 문단2
...
16. 문단16`;

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
            maxOutputTokens: 12000,
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
