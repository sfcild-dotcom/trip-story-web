/**
 * 호치민 출장 후기 AI 생성 서비스
 * Vercel API 라우트를 통해 Gemini API 호출
 * API 키는 서버에만 존재 (브라우저에 노출 안 됨)
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
  try {
    // Manus 백엔드 서버로 요청
    const backendUrl = 'https://3000-ioryejvencx35oj59rq37-718f2262.sg1.manus.computer/api/generate-story';
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images,
        userKeywords,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {}
      throw new Error(`API 오류: ${errorMessage}`);
    }

    const data = await response.json();
    const generatedText = data.story || '';

    if (!generatedText) {
      throw new Error('API에서 텍스트를 생성하지 못했습니다.');
    }

    return generatedText;
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw error;
  }
};
