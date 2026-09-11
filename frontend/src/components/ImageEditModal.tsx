import { useState } from 'react';

interface ImageEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  currentSrc?: string;
}

export function ImageEditModal({ open, onClose, onSave, currentSrc }: ImageEditModalProps) {
  const [mode, setMode] = useState<'upload' | 'url' | 'media'>('url');
  const [url, setUrl] = useState(currentSrc || '');
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Simulate upload - in real app would upload to server
    const reader = new FileReader();
    reader.onload = () => {
      setUrl(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (url) {
      onSave(url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Change Image</h3>
        
        {/* Mode tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'url', label: '🔗 URL' },
            { key: 'upload', label: '📤 Upload' },
            { key: 'media', label: '🖼️ Media' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key as any)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                mode === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* URL mode */}
        {mode === 'url' && (
          <div className="space-y-3">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
            />
            {url && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt="Preview" className="w-full h-40 object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Upload mode */}
        {mode === 'upload' && (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <span className="text-3xl mb-1">📁</span>
              <span className="text-sm text-gray-500">Click to upload image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
            {url && !uploading && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt="Preview" className="w-full h-40 object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Media Library mode */}
        {mode === 'media' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Select from media library:</p>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {/* Placeholder media items - would be fetched from API */}
              {[
                'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200',
                'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200',
                'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=200',
                'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=200',
              ].map((src, i) => (
                <button
                  key={i}
                  onClick={() => setUrl(src)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    url === src ? 'border-blue-500 scale-95' : 'border-transparent hover:border-blue-300'
                  }`}
                >
                  <img src={src} alt={`Media ${i+1}`} className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!url}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-blue-600"
          >
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
}
