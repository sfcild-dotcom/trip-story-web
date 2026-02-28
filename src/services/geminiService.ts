/**
 * 호치민 출장 후기 AI 생성 서비스
 * 백엔드 프록시 서버를 통해 Gemini API 호출 (API 키 보안)
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
    // 백엔드 서버 주소
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    const response = await fetch(`${BACKEND_URL}/api/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: images.map((img) => ({
          base64: img.base64,
          mimeType: img.mimeType,
          name: img.name,
        })),
        userKeywords,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${JSON.stringify(errorData)}`);
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
