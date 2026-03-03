/**
 * 이미지 압축 유틸리티
 * 사진 크기를 줄여서 API 요청 크기 감소
 */

export const compressImage = async (
  base64: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 비율 유지하면서 크기 조정
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = base64;
  });
};

export const compressImages = async (
  images: Array<{ base64: string; mimeType: string; name: string }>
): Promise<Array<{ base64: string; mimeType: string; name: string }>> => {
  const compressed = await Promise.all(
    images.map(async (img) => {
      try {
        const compressedBase64 = await compressImage(img.base64, 600, 600, 0.6);
        return {
          base64: compressedBase64,
          mimeType: 'image/jpeg',
          name: img.name,
        };
      } catch (error) {
        console.warn(`Failed to compress ${img.name}:`, error);
        return img;
      }
    })
  );

  return compressed;
};
