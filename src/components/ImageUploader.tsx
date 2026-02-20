import React, { useState } from 'react';
import { ImageData, ImageSlot } from '../types';

interface ImageUploaderProps {
  slots: ImageSlot[];
  setSlots: React.Dispatch<React.SetStateAction<ImageSlot[]>>;
  onReset: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ slots, setSlots, onReset }) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFile = (file: File, index: number) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newImage: ImageData = {
        id: Math.random().toString(36).substr(2, 9),
        base64,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file)
      };

      setSlots(prev => prev.map(slot => 
        slot.index === index ? { ...slot, image: newImage } : slot
      ));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, index);
  };

  const removeImage = (index: number) => {
    setSlots(prev => prev.map(slot => 
      slot.index === index ? { ...slot, image: null } : slot
    ));
  };

  const hasAnyImage = slots.some(s => s.image);

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">여정을 담은 14장의 사진</h2>
        </div>
        {hasAnyImage && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {slots.map((slot) => (
          <div
            key={slot.index}
            onDrop={(e) => handleDrop(e, slot.index)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(slot.index);
            }}
            onDragLeave={() => setDragOverIndex(null)}
            className={`
              aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer
              flex flex-col items-center justify-center overflow-hidden relative group
              ${dragOverIndex === slot.index 
                ? 'border-blue-500 bg-blue-50' 
                : slot.image 
                ? 'border-slate-200 bg-slate-50' 
                : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}
            `}
          >
            {slot.image ? (
              <>
                <img
                  src={slot.image.previewUrl}
                  alt={slot.label}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(slot.index)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-slate-500 font-medium">{slot.index + 1}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFile(e.target.files[0], slot.index)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
