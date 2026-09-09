import { useState, useRef } from "react";
import { Upload, Link, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";
import Button from "../Button";
import Field from "../Field";
import { compressImage, formatBytes, CompressionResult } from "../../utils/imageCompressor";
import { uploadMedia, uploadMediaFromUrl } from "../../services/api";

interface ImagePickerProps {
  onImageSelected: (url: string, mediaId?: number) => void;
  onCancel?: () => void;
  showUrlTab?: boolean;
  showDeviceTab?: boolean;
  currentImageUrl?: string;
  label?: string;
}

export default function ImagePicker({
  onImageSelected,
  onCancel,
  showUrlTab = true,
  showDeviceTab = true,
  currentImageUrl = "",
  label = "Select Image",
}: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<"device" | "url">("device");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string>(currentImageUrl);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError("");
    setCompressionInfo(null);
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setCompressing(true);
    try {
      const result = await compressImage(file);
      setCompressionInfo(result);
      if (result.wasCompressed) { URL.revokeObjectURL(objectUrl); setPreview(URL.createObjectURL(result.file)); }
    } catch { /* keep original preview */ } finally { setCompressing(false); }
  };

  const handleDeviceUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) await handleFileSelect(file);
  };

  const handleUrlFetch = async () => {
    if (!url.trim()) { setError("Please enter an image URL."); return; }
    setError(""); setUploading(true);
    try { const data = await uploadMediaFromUrl(url.trim()); onImageSelected(data.url, data.id); }
    catch { setError("Could not fetch image from URL. Make sure it is a direct image link."); }
    finally { setUploading(false); }
  };

  const handleConfirm = async () => {
    if (!preview || !compressionInfo) return;
    setUploading(true); setError("");
    try {
      const file = compressionInfo.wasCompressed ? compressionInfo.file : undefined;
      if (!file) { setError("No file selected."); return; }
      const data = await uploadMedia(file);
      onImageSelected(data.url, data.id);
    } catch { setError("Upload failed. Please try again."); }
    finally { setUploading(false); }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      {preview && (
        <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-200">
          <img src={preview} alt="Preview" className="w-full h-32 object-cover" />
          <button type="button" onClick={() => { setPreview(""); setCompressionInfo(null); }} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"><X size={12} /></button>
        </div>
      )}
      <div className="flex gap-1 mb-3">
        {showDeviceTab && (
          <button type="button" onClick={() => setActiveTab("device")} className={`flex-1 text-xs font-medium py-1.5 px-2 rounded transition-colors ${activeTab === "device" ? "bg-brand-yellow text-darkBlue" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
            <Upload size={14} className="inline mr-1" />From Device
          </button>
        )}
        {showUrlTab && (
          <button type="button" onClick={() => setActiveTab("url")} className={`flex-1 text-xs font-medium py-1.5 px-2 rounded transition-colors ${activeTab === "url" ? "bg-brand-yellow text-darkBlue" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
            <Link size={14} className="inline mr-1" />From URL
          </button>
        )}
      </div>
      {activeTab === "device" && showDeviceTab && (
        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${dragOver ? "border-brand-yellow bg-brand-yellow/5" : "border-gray-300 hover:border-gray-400"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFileSelect(file); }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleDeviceUpload} className="hidden" />
          <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">Drag & drop an image here, or <button type="button" onClick={() => fileInputRef.current?.click()} className="text-brand-yellow font-medium hover:underline">browse</button></p>
          <p className="text-xs text-gray-400">PNG, JPG, WebP up to 25 MB</p>
          {compressing && <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500"><Loader2 size={14} className="animate-spin" />Compressing...</div>}
          {compressionInfo?.wasCompressed && <div className="mt-2 text-xs text-green-600">Compressed from {formatBytes(compressionInfo.originalSize)} to {formatBytes(compressionInfo.compressedSize)} (saved {compressionInfo.reductionPercent}%)</div>}
        </div>
      )}
      {activeTab === "url" && showUrlTab && (
        <div className="space-y-2">
          <Field label="Image URL" placeholder="https://example.com/image.jpg" value={url} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} />
          <Button onClick={handleUrlFetch} disabled={uploading || !url.trim()} className="w-full">
            {uploading ? <><Loader2 size={14} className="animate-spin mr-2" />Fetching...</> : <><Link size={14} className="mr-2" />Add from URL</>}
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {preview && activeTab === "device" && compressionInfo && (
        <div className="mt-3 flex gap-2">
          <Button onClick={handleConfirm} disabled={uploading} className="flex-1">
            {uploading ? <><Loader2 size={14} className="animate-spin mr-2" />Uploading...</> : <><Check size={14} className="mr-2" />Use This Image</>}
          </Button>
          {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
        </div>
      )}
    </div>
  );
}
