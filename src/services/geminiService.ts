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

[1️⃣ 제목 규칙 - 반드시 준수]
형식: 제목: [키워드 1회] + [업체명 1회] + [구절형]
예: 제목: 노보텔 사이공센터와 함께한 ${userKeywords}
예: 제목: ${userKeywords}, 노보텔 사이공센터에서의 일정 기록
예: 제목: 노보텔 사이공센터에서 경험한 ${userKeywords}

규칙:
- 반드시 "제목:"으로 시작
- 키워드 정확히 1회 (띄어쓰기 유지)
- 업체명 정확히 1회 (오탈자 금지)
- 마침표 금지
- 특수문자 금지
- 과장어 1개 이하 (완벽, 최고, 무조건 등)

[2️⃣ 키워드 배치 - 정확히 5회]
구조: 1회 + 3회 + 1회

1번 문단: 1회 (서론에서 자연스럽게)
중간 문단 (5~12번): 3회 분산 배치
  - 5~6번 중 1회
  - 8~9번 중 1회
  - 11~12번 중 1회
16번 문단: 1회 (결론에서 회고형으로)

절대 금지:
- 한 문장에 2회 이상
- 한 문단에 2회 이상
- 중간 3회가 한 구간에 집중
- 두 키워드를 같은 문장에 직결
- 두 키워드를 3문장 이내에 배치

✅ 안전한 배치:
- 두 키워드를 최소 3~4문장 이상 떨어뜨릴 것
- 각 키워드를 독립적으로 사용
- 키워드 간 연결 금지

[3️⃣ 키워드 삽입 방식 - 가장 중요]
✅ 안전한 방식 (통과 확률 90%):
- 경험 회고 문장: "이 부분이 ${userKeywords}에서 기억에 남았습니다."
- 공간 설명 문장: "업무 환경이 안정적이어서 ${userKeywords}가 수월했죠."
- 기능 설명 문장: "동선이 간결해 ${userKeywords}가 한결 여유로웠습니다."
- 관찰형 문장: "${userKeywords}으로 자주 언급되는 이유는…"
- 상황 설명: "${userKeywords} 범주에 포함될 만한 조건을 갖추고 있었습니다."

❌ 위험한 방식 (반려 확률 90%):
- 독자 설득: "검색하신 분들이라면 꼭 보셔야 할 ${userKeywords}"
- 강조 문장: "꼭 강조하고 싶은 ${userKeywords}"
- 감정 폭발: "정말 환상적이었던 완벽한 ${userKeywords}였습니다"
- 메타 문장: "알려드리고 싶은 ${userKeywords}"
- 행동 유도: "${userKeywords}을 추천드립니다" (추천합니다 금지)
- 직결 문장: "${userKeywords}은 노보텔 사이공센터가 최고입니다" (두 키워드 직결 금지)

[4️⃣ 감정 vs 기능 비율 - 60~70% : 30~40%]
감정 표현 (많음):
- 환상적, 편안함, 설렘, 만족감, 감탄

기능 설명 (반드시 포함):
- 금고, 업무 테이블, 라운지 활용성
- 동선, 테이블 배치, 조식 구성
- 수압, 침구 컨디션, 방음성

규칙: 감정 문장 2줄 이상 연속 금지 → 기능 설명 문장 삽입

[5️⃣ 절대 표현 제한]
제한적 사용 (1~2회만):
- 완벽
- 최고
- 평생
- 무조건
- 반드시

절대 금지 (연속 사용):
- "완벽하고 최고인 호치민 출장후기" (X)
- "무조건 추천하는 최고의 경험" (X)

[6️⃣ 결론 문단 (16번) - 회고형으로]
✅ 안전한 마무리:
- "기억에 남았습니다"
- "좋은 선택이었던 것 같습니다"
- "인상 깊은 경험이었습니다"
- "만족스러운 일정이었습니다"

❌ 위험한 마무리:
- "이게 정답입니다" (단정형)
- "무조건 최고입니다" (절대형)
- "평생 못 잊을 완벽한 선택" (과장형)

[7️⃣ 구조 안정성]
- 문단 길이 균등 (100~200자 범위)
- 감정 문장 2줄 연속 후 기능 설명 삽입
- 독자 지칭 문장 없음
- 광고 카피 톤 최소화
- 호텔명 3~4회 (초과 금지)

[8️⃣ 절대 금지]
- 마크다운 형식
- 제목에 마침표/느낌표
- 1인칭 (저는, 나는)
- 반말
- 비문
- 키워드 변형 (호치민출장후기, 호치민 출장 후기 등)
- 따옴표로 키워드 감싸기
- 특수문자 (#, *, ^^, $ 등)
- 독자 설득 문장
- 검색/추천 유도 문장
- 두 키워드를 같은 문장에 배치
- 두 키워드를 3문장 이내에 배치
- "추천합니다", "꼭 가보세요" (행동 유도 표현)
- 두 키워드 + 단정형 (예: "최고입니다", "정답입니다")

[9️⃣ 문단 구성]
1번: 서론 (여정 시작, 감정, 키워드 1회)
2~4번: 비행 전 라운지, 기내식 (호텔명 포함)
5~6번: 체크인, 객실 입장 (호텔명 포함, 키워드 1회 분산)
7~9번: 객실 세부 (침대, 욕실, 소파, 창문, 키워드 1회 분산)
10~12번: 루프탑, 바, 테라스 (키워드 1회 분산)
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

[핵심 공식]
통과 원고 = 경험 정리 글 (설명 + 기능 + 감정)
반려 원고 = 설득형 홍보 글 (강조 + 절대형 + 독자 지칭)

당신은 "경험 정리 글"을 작성합니다.`;

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
