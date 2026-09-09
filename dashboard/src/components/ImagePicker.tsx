import { useState, useRef } from "react";
import { Upload, Link, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { compressImage, fetchImageAsFile } from "../utils/imageCompressor";
import Button from "../components/Button";

interface ImagePickerProps {
  onSelect: (file: File) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
  previewUrl?: string;
  onClear?: () => void;
}

/**
 * Reusable image picker that supports both device upload and URL input.
 * Automatically compresses images before passing to the parent.
 */
export default function ImagePicker({
  onSelect,
  disabled = false,
  className = "",
  buttonText = "Add Image",
  showPreview = true,
  previewUrl,
  onClear,
}: ImagePickerProps) {
  const [mode, setMode] = useState<"idle" | "url" | "device">("idle");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const compressed = await compressImage(file);
      await onSelect(compressed);
      setMode("idle");
    } catch (err) {
      setError("Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    e.target.value = "";
  };

  const handleUrlUpload = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const file = await fetchImageAsFile(url.trim());
      const compressed = await compressImage(file);
      await onSelect(compressed);
      setUrl("");
      setMode("idle");
    } catch (err) {
      setError("Failed to fetch image from URL");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  if (showPreview && previewUrl) {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={previewUrl}
          alt="Selected"
          className="w-full h-40 object-cover rounded-lg border border-gray-200"
        />
        {onClear && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {mode === "idle" && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver
              ? "border-brand-yellow bg-brand-yellow/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <ImageIcon className="mx-auto mb-2 text-gray-400" size={24} />
          <p className="text-sm text-gray-500 mb-3">{buttonText}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || loading}
              icon={<Upload size={14} />}
            >
              From Device
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMode("url")}
              disabled={disabled || loading}
              icon={<Link size={14} />}
            >
              From URL
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleDeviceUpload}
          />
        </div>
      )}

      {mode === "url" && (
        <div className="border border-gray-300 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Link size={14} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Image URL</span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
              onKeyDown={(e) => e.key === "Enter" && handleUrlUpload()}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleUrlUpload}
              disabled={!url.trim() || loading}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Add"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("idle");
                setUrl("");
                setError("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
