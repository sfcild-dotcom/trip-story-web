/**
 * Vercel API 라우트
 * API 키는 서버 환경변수에만 존재
 * 프론트엔드는 이 엔드포인트로 요청만 함
 */

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { images, userKeywords } = req.body;

    if (!images || !userKeywords) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const imageParts = images.map((img) => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64.split(',')[1],
      },
    }));

    const fullPrompt = `당신은 호치민 비즈니스 출장 전문 라이터입니다. 14장 사진을 분석하여 "노보텔 사이공센터" 고객후기를 작성합니다.

[🎯 핵심 관점]
호치민 비즈니스 출장을 가는 사람 입장에서의 고객후기를 작성해주십시오.
- 업무 효율성: 비즈니스 센터, 회의실, 와이파이 등
- 휴식과 회복: 피로 회복, 숙면, 스트레스 해소
- 편의성: 위치, 교통, 식사, 서비스
- 비용 대비 가치: 프리미엄 서비스의 합리성

[호텔 정보 - 노보텔 사이공센터]
호텔 등급: 4성 호텔
위치: 호치민 중심부
주요 시설:
- 1층: 로비, 커피숍
- 2층: 조식 뷔페
- 3층: 수영장, 미니 바
- 4층: 마사지 시설, 헬스/피트니스
- 19층: 프리미어 라운지
- 20층: 루프탑바

글 작성 시 이러한 구체적인 시설 정보를 최대한 많이 포함하여 생생하고 신뢰감 있는 내용으로 구성해주세요.

[1️⃣ 기본 설정]
- 목표: 16개 문단, 정확히 완성
- 톤: 발랄 80% + 유머러스 10% + 전문성 10%
- 어미: 회상형 구어체 (~했죠, ~더군요, ~같았어요)
- 감탄부호: 절대 금지
- 길이: 한 문장 25자 이내 (짧게 끊기)
- 문단: 3~4문장 구성
- 관점: 비즈니스 출장자의 실질적 필요와 만족도

[2️⃣ 제목 규칙 - 반드시 사용자 키워드 포함]
형식: 제목: [사용자 입력 키워드], [감각적 표현]
예: 제목: ${userKeywords}, 호치민 비즈니스 출장의 현명한 선택

규칙:
- "제목:"으로 시작
- 반드시 사용자 입력 키워드(${userKeywords}) 정확히 1회 사용
- 마침표/특수문자 금지

[3️⃣ 키워드 배치 - 정확히 5회]
키워드 리스트:
1. 노보텔 사이공센터
2. 호치민 4성호텔 추천
3. 호치민호텔
4. 호치민호텔 추천
5. 호치민 노보텔
6. 호치민 비즈니스클래스

배치 규칙:
- 제목: 1개 키워드
- 1번 서론: 1개 키워드
- 5~6번 중: 1개 키워드
- 8~9번 중: 1개 키워드
- 11~12번 중: 1개 키워드
- 16번 결론: 1개 키워드

금지:
- 한 문장에 2회 이상
- 한 문단에 2회 이상

[4️⃣ 키워드 삽입 방식]
✅ 자연스러운 삽입:
- "호치민 비즈니스클래스 호텔답게 업무 공간이 잘 갖춰져 있었어요."
- "호치민호텔 추천을 받을 만한 이유가 숙면에 있었죠."
- "호치민 노보텔이라는 평가가 교통 편의성에서 드러났어요."

✅ 시점 일관성 (강제):
- 모든 기억은 과거식 회상으로 일관
- 금지: "찾는 분들을 위해" (미래시제)
- 사용: "찾아본 만한" (과거식)

❌ 절대 금지:
- "완벽한", "최고", "매우" 등 절대 표현
- 키워드 변형
- 부자연스러운 문법

[5️⃣ 톤과 스타일]
발랄 80%: 생생한 감정, 활기찬 리듬감, 구체적 디테일
유머러스 10%: 가벼운 위트, 따뜻한 웃음
전문성 10%: 객관적 관찰, 신뢰감

[6️⃣ 문장 구조]
- 한 문장 25자 이내
- 단문 위주
- 한 문단 3~4문장
- 문장 길이 변화: 짧음 → 중간 → 짧음
- 문장 끝 다양화 ("어요", "었죠", "더군요", "같았어요")

[분량 관리 - 반드시 준수]
- 공백 제외 2900자 이상 필수
- 서론(1번): 250자 이상
- 본문(2~15번): 각 150자 이상
- 결론(16번): 250자 이상
- 16개 문단 모두 완성할 때까지 계속 작성
- 각 문단이 최소 분량에 미달하면 내용 추가

[7️⃣ 절대 금지]
- 마크다운 형식
- 감탄부호
- 1인칭 (저는, 나는)
- 반말
- 비문
- 키워드 변형
- 따옴표로 키워드 감싸기

[8️⃣ 문단 구성]
1번: 서론 (호치민 출장 시작, 기대감, 키워드 1회)
2~4번: 비행, 호텔 도착
5~6번: 체크인, 객실, 업무 공간 (키워드 1회)
7~9번: 객실 세부 (침대, 욕실, 소파)
10~12번: 루프탑, 바, 비즈니스 센터 (키워드 2회)
13~15번: 라운지, 조식, 마무리
16번: 결론 (회고, 다음 출장 기대, 키워드 1회)

[🔟 출력 형식]
제목: [제목 내용]

Business Consultant
2026년 2월 26일

1. 첫 번째 문단
2. 두 번째 문단
...
16. 마지막 문단

[핵심]
- 호치민 비즈니스 출장자 입장에서 작성
- 업무 효율성과 휴식의 밸런스 강조
- 호텔의 구체적 시설 정보 포함
- 16개 문단 모두 완성
- 발랄하면서도 유머러스하고 신뢰감 있는 톤
- 키워드가 자연스럽게 녹아들기
- 친구에게 이야기하는 듯한 자연스러운 글쓰기`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return res.status(500).json({ error: 'Failed to generate text' });
    }

    return res.status(200).json({ text: generatedText });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
