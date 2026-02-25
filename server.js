import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const BACKEND_API = process.env.BACKEND_API || 'http://localhost:3000';

app.post('/api/generate-story', async (req, res) => {
  try {
    const { images, keywords } = req.body;

    if (!images || images.length !== 14) {
      return res.status(400).json({ error: '14장의 사진이 필요합니다.' });
    }

    if (!keywords || !keywords.trim()) {
      return res.status(400).json({ error: '키워드가 필요합니다.' });
    }

    // 이미지를 base64로 변환
    const imageParts = images.map((img) => ({
      type: 'image',
      source: {
        bytes: img.split(',')[1], // data:image/... 제거
      },
    }));

    const prompt = `당신은 14장의 사진을 분석하여 호치민 출장 기록을 완성하는 전문 비즈니스 라이터입니다.

[절대 준수 규칙]
1. 제목: 반드시 "제목: "으로 시작하고, 키워드 '${keywords}'와 "노보텔 사이공센터"를 모두 포함해야 합니다.
2. 본문: 정확히 16개의 문단을 작성하며, 각 문단은 "1. ", "2. " 형식으로 숫자 시작
3. 사진 기반: 14장의 사진을 순서대로 분석하여 2~15번 문단에 1:1 대응
4. 키워드 배치: 정확히 5회 배치 (서론 1회, 본론 3회, 결론 1회)

[제목 작성 규칙]
- "제목: "으로 시작
- 키워드 '${keywords}'와 "노보텔 사이공센터" 반드시 포함
- 구절 형태 우선: 감각적이고 매력적인 구절로 작성
- 문장 형태 허용하되, 마침표(.) 절대 금지
- 제목의 길이: 15~40자 범위

[구조]
- 1번 문단: 서론 (여정의 시작, 첫 인상) - 키워드 포함 ①
- 2~15번 문단: 각각 사진 1장에 대응하는 본문 (각 100~150자) - 3회 키워드 포함 ②③④
- 16번 문단: 결론 (여정의 마무리, 감동) - 키워드 포함 ⑤

[키워드 배치 방식]
- ①${keywords}: 1번 문단 중간~후반부에 자연스럽게 삽입
- ②${keywords}: 2~5번 문단 중 한 곳에 자연스럽게 삽입
- ③${keywords}: 6~10번 문단 중 한 곳에 자연스럽게 삽입
- ④${keywords}: 11~15번 문단 중 한 곳에 자연스럽게 삽입
- ⑤${keywords}: 16번 문단의 마지막 1~2문장에 자연스럽게 삽입

[가독성 극대화]
- 문장 길이 변주: 짧은 문장(10~15자)과 긴 문장(40~60자)을 섞어서 리듬감 있게
- 종결어미 다양화: ~요(50%), ~죠(20%), ~습니다(20%), ~었다(10%)
- 과거형 통일: 모든 문장을 과거형으로 작성
- 1인칭 제거: "나", "저", "우리" 등 사용 금지
- 감각적 표현: 시각, 청각, 후각, 미각, 촉각을 활용한 생생한 묘사

[문법 정확성]
- 주어-술어 명확성: 모든 문장의 주어와 술어가 명확해야 함
- 조사 정확성: 은/는, 이/가, 을/를, 에/에게 등 정확한 사용
- 띄어쓰기: 정확한 띄어쓰기 준수
- 시제 일관성: 과거형으로 통일

[절대 금지]
- 마크다운 형식 사용 금지
- 제목에 마침표(.) 금지
- 불필요한 이모지나 특수문자 사용 금지
- 제목에 느낌표(!) 사용 금지

[키워드 문장 다양성 - 매우 중요]
- 5개의 키워드 문장이 서로 다른 문맥과 표현으로 작성되어야 함
- 같은 구조나 표현의 문장이 반복되면 안 됨
- 각 키워드 문장은 그 문단의 내용과 자연스럽게 어울려야 함

다음 14장의 사진을 분석하여 호치민 출장 후기를 완성해주세요. 정확히 16문단으로 작성하고, 키워드를 정확히 5회 배치해주세요.`;

    // 백엔드 서버의 AI 기능 사용
    const response = await axios.post(`${BACKEND_API}/api/ai/generate`, {
      prompt,
      images: imageParts,
      model: 'multimodal',
      maxTokens: 5000,
      temperature: 0.8,
    });

    const story = response.data.content || response.data.text;

    res.json({ success: true, story });
  } catch (error) {
    console.error('API 오류:', error.message);
    res.status(500).json({
      error: '후기 생성 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
