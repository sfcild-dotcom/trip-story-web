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

[1️⃣ 기본 설정]
- 목표: 16개 문단, 정확히 완성
- 톤: 발랄 70% + 전문성 30%
- 어미: 회상형 구어체 (~했죠, ~더군요, ~같았어요)
- 감탄부호: 절대 금지
- 길이: 한 문장 25자 이내 (짧게 끊기)
- 문단: 3~4문장 구성

[2️⃣ 제목 규칙]
형식: 제목: [키워드] [감각적 표현]
예: 제목: 노보텔 사이공센터, 부족함 없이 보낸 아름다운 ${userKeywords}
예: 제목: 노보텔 사이공센터, 일과 휴식이 어우러진 ${userKeywords}

규칙:
- "제목:"으로 시작
- 키워드 정확히 1회
- 업체명 정확히 1회
- 마침표/특수문자 금지

[3️⃣ 키워드 배치 - 정확히 5회]
- 1번: 1회
- 5~6번 중: 1회
- 8~9번 중: 1회
- 11~12번 중: 1회
- 16번: 1회

금지:
- 한 문장에 2회 이상
- 한 문단에 2회 이상
- 두 키워드 직결

[4️⃣ 키워드 삽입 방식]
✅ 안전:
- 경험 회고: "이 부분이 ${userKeywords}에서 기억에 남았어요."
- 상황 설명: "${userKeywords} 범주에 포함될 조건을 갖추고 있었죠."
- 관찰형: "${userKeywords}으로 자주 언급되는 이유는…"

❌ 위험:
- "검색하신 분들이라면 꼭 보셔야 할 ${userKeywords}"
- "${userKeywords}을 추천드립니다"
- "완벽한 ${userKeywords}는 최고입니다"

[5️⃣ 톤과 스타일]
발랄 70%:
- 생생한 감정 표현
- 활기찬 리듬감
- 긍정적 톤

전문성 30%:
- 구체적 기능 설명
- 객관적 관찰
- 신뢰감 있는 표현

규칙:
- 감정 문장 2줄 연속 금지 → 기능 설명 삽입
- 동일 종결어미 3회 이상 반복 금지
- 추상어 금지 (구체 묘사만)
- 접속사 남발 금지
- 의문형 10% 포함

[6️⃣ 문장 구조]
- 한 문장 25자 이내
- 단문 위주 (짧게 끊기)
- 한 문단 3~4문장
- 동일 구조 반복 금지

예시:
✅ "침구가 부드러웠어요. 베개도 좋았죠. 숙면을 취할 수 있었습니다."
❌ "침구가 부드럽고 베개도 좋으며 숙면을 취할 수 있었어요."

[7️⃣ 절대 금지]
- 마크다운 형식
- 감탄부호 (!, 와, 오)
- 1인칭 (저는, 나는)
- 반말
- 비문
- 키워드 변형
- 따옴표로 키워드 감싸기
- 메타 문장
- 독자 설득
- 행동 유도
- 두 키워드 직결
- 절대 표현 과밀 (한 문장에 2개 이상)

[8️⃣ 절대 표현 제한]
1~2회만 사용:
- 완벽
- 최고
- 평생
- 레전드
- 압도적

[9️⃣ 문단 구성]
1번: 서론 (여정 시작, 감정, 키워드 1회)
2~4번: 비행 전 라운지, 기내식
5~6번: 체크인, 객실 입장 (키워드 1회)
7~9번: 객실 세부 (침대, 욕실, 소파)
10~12번: 루프탑, 바, 테라스 (키워드 2회)
13~15번: 라운지, 조식
16번: 결론 (회고형, 키워드 1회)

[🔟 출력 형식]
제목: [제목 내용]

Business Consultant
2026년 2월 26일

1. 첫 번째 문단
2. 두 번째 문단
...
16. 마지막 문단

[핵심]
- 16개 문단 모두 완성할 때까지 계속 작성
- 절대 중간에 멈추지 말 것
- 각 문단은 완전한 문장으로 마무리
- 발랄하면서도 신뢰감 있는 톤 유지`;

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
