import { useState, useRef } from "react";
import { compressImage, formatBytes } from "../utils/imageCompressor";
import { uploadMedia, uploadMediaFromUrl } from "../services/api";

interface ImagePickerProps {
  value?: string;
  onImageReady?: (url: string) => void;
  onClear?: () => void;
  label?: string;
  compact?: boolean;
}

export default function ImagePicker({ value, onImageReady, onClear, label, compact }: ImagePickerProps) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setStatus("Compressing…");
    setBusy(true);
    try {
      const { file: compressed, originalSize, compressedSize, wasCompressed } = await compressImage(file);
      await doUpload(compressed, wasCompressed ? `Compressed ${formatBytes(originalSize)} → ${formatBytes(compressedSize)}` : null);
    } catch (e) {
      setError("Could not process image");
    } finally {
      setBusy(false);
    }
  };

  const doUpload = async (file: File, compressionMsg: string | null) => {
    setStatus("Uploading…");
    try {
      const res = await uploadMedia(file);
      if (compressionMsg) setStatus(compressionMsg);
      else setStatus("Uploaded");
      onImageReady?.(res.url);
    } catch {
      setError("Upload failed");
      setStatus(null);
    }
  };

  const handleUrlAdd = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setStatus("Fetching URL…");
    setBusy(true);
    try {
      const res = await uploadMediaFromUrl(trimmed);
      setStatus("Uploaded from URL");
      onImageReady?.(res.url);
      setUrl("");
    } catch {
      setError("Could not fetch URL");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      {value && (
        <div className="flex items-center gap-3 border rounded-lg p-2 bg-gray-50">
          <img src={value} alt="Selected" className="w-16 h-16 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{value}</p>
          </div>
          <button
            type="button"
            className="text-xs text-red-600 hover:underline"
            onClick={() => { onClear?.(); setStatus(null); setError(null); }}
          >
            Clear
          </button>
        </div>
      )}

      {!compact && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
            dragOver ? "border-primary bg-primary/5" : "border-gray-300"
          } ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <p className="text-sm text-gray-600">
            {busy ? "Processing…" : "Drag & drop an image here, or click to choose"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Images are compressed automatically</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Or paste an image URL…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleUrlAdd(); }}
          disabled={busy}
        />
        <button
          type="button"
          className="px-3 py-2 text-sm rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
          onClick={handleUrlAdd}
          disabled={busy || !url.trim()}
        >
          Add URL
        </button>
        {compact && (
          <button
            type="button"
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            Upload
          </button>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {status && !error && <p className="text-xs text-emerald-600">{status}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
