import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import {
  uploadMedia,
  uploadMediaFromUrl,
  getMedia,
  deleteMedia,
  getPlacements,
  setPlacement,
  clearPlacement,
} from "../services/api";

type MediaItem = {
  id: number;
  filename: string;
  original_name?: string;
  url: string;
  type: string;
  size?: number;
  placements?: string[];
};

type PlacementSlot = { key: string; label: string };

export default function WriterMedia() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [slots, setSlots] = useState<PlacementSlot[]>([]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openPreview, setOpenPreview] = useState<MediaItem | null>(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [placeTarget, setPlaceTarget] = useState<MediaItem | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<MediaItem | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [openUrlUpload, setOpenUrlUpload] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlUploading, setUrlUploading] = useState(false);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await getMedia();
      setMedia(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlacements = async () => {
    try {
      const data = await getPlacements();
      setSlots(data.slots || []);
      setPlacements(data.placements || {});
    } catch (error) {
      console.error("Error fetching placements:", error);
    }
  };

  useEffect(() => {
    loadMedia();
    loadPlacements();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      await uploadMedia(compressed);
      await loadMedia();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUrlUpload = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setUrlUploading(true);
    try {
      await uploadMediaFromUrl(trimmed);
      await loadMedia();
      setOpenUrlUpload(false);
      setUrlInput("");
    } catch {
      alert("Could not upload from URL");
    } finally {
      setUrlUploading(false);
    }
  };

  // Swap an existing library image with a newly chosen file.
  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTarget) return;
    setReplacing(true);
    try {
      const compressed = await compressImage(file);
      await uploadMedia(compressed, replaceTarget.id);
      await loadMedia();
      await loadPlacements();
      setReplaceTarget(null);
    } catch (error) {
      console.error("Replace failed:", error);
      alert("Replace failed");
    } finally {
      setReplacing(false);
      e.target.value = "";
    }
  };

  const handlePlace = async (slotKey: string) => {
    if (!placeTarget) return;
    try {
      await setPlacement(slotKey, placeTarget.id);
      await loadPlacements();
      await loadMedia();
    } catch (error) {
      console.error("Placement failed:", error);
      alert("Could not place image");
    }
  };

  const handleClearPlacement = async (slotKey: string) => {
    try {
      await clearPlacement(slotKey);
      await loadPlacements();
      await loadMedia();
    } catch (error) {
      console.error("Clear placement failed:", error);
    }
  };

  const itemPlacementKeys = (item: MediaItem) =>
    media.find((m) => m.id === item.id)?.placements || [];

  return (
    <PageShell
      title="Media Library"
      description="Upload and manage images used across your content. Replace an image in place, or place it anywhere on the website."
      action={
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <span
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {uploading ? "Uploading…" : "Upload from device"}
            </span>
          </label>
          <button
            type="button"
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition"
            onClick={() => setOpenUrlUpload(true)}
          >
            Add from URL
          </button>
        </div>
      }
    >
      {/* Hidden input used by the per-item Replace action */}
      <input type="file" accept="image/*" className="hidden" id="replace-input" onChange={handleReplace} />

      {loading ? (
        <Loading label="Loading media…" />
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No media found.</p>
          <p className="mt-1 text-sm">Upload your first media file to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => {
            const placedKeys = itemPlacementKeys(item);
            return (
              <div key={item.id} className="group relative">
                <div
                  className={`aspect-square flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in ${
                    item.type.startsWith("image/") ? "p-0" : "p-3"
                  }`}
                  onClick={() => {
                    setOpenPreview(item);
                    setPreviewSrc(item.url);
                  }}
                >
                  {item.type.startsWith("image/") ? (
                    <img src={item.url} alt={item.original_name || item.filename} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📎</span>
                  )}
                </div>
                {placedKeys.length > 0 && (
                  <span className="absolute top-1 left-1 z-10 rounded bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">
                    Placed ×{placedKeys.length}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1 flex-wrap p-2">
                  <Button variant="ghost" size="sm" className="text-white" onClick={() => setOpenPreview(item)}>
                    Preview
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white" onClick={() => setReplaceTarget(item)}>
                    Replace
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white" onClick={() => setPlaceTarget(item)}>
                    Place
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={async () => {
                      if (!confirm("Delete this media item?")) return;
                      await deleteMedia(item.id);
                      loadMedia();
                      loadPlacements();
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500 truncate">{item.original_name || item.filename}</p>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={openPreview !== null} title={openPreview?.original_name || openPreview?.filename || "Preview"} onClose={() => { setOpenPreview(null); setPreviewSrc(""); }}>
        <div className="flex justify-center">
          {previewSrc && openPreview?.type.startsWith("image/") ? (
            <img src={previewSrc} alt={openPreview?.original_name || openPreview?.filename} className="max-w-full max-h-96 rounded" />
          ) : previewSrc ? (
            <iframe src={previewSrc} title={openPreview?.filename} className="w-full h-96 rounded" />
          ) : null}
        </div>
      </Modal>

      {/* Replace modal */}
      <Modal
        open={replaceTarget !== null}
        title={`Replace "${replaceTarget?.original_name || replaceTarget?.filename}"`}
        onClose={() => setReplaceTarget(null)}
      >
        <p className="text-sm text-gray-600 mb-4">
          Choose a new image file — it will replace this library item in place. Every
          spot on the website currently using it will show the new image automatically.
        </p>
        <label
          htmlFor="replace-input"
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium cursor-pointer ${
            replacing ? "bg-gray-400 pointer-events-none" : "bg-primary text-white hover:opacity-90"
          }`}
        >
          {replacing ? "Replacing…" : "Choose new image"}
        </label>
      </Modal>

      {/* Placement modal */}
      <Modal
        open={placeTarget !== null}
        title={`Place "${placeTarget?.original_name || placeTarget?.filename}"`}
        onClose={() => setPlaceTarget(null)}
      >
        <p className="text-sm text-gray-600 mb-3">
          Pick where this image should appear on the website. Click a slot to place it;
          click "Clear" to remove an existing placement.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {slots.map((slot) => {
            const isCurrent = (placeTarget?.placements || []).includes(slot.key);
            return (
              <div key={slot.key} className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2">
                <span className="text-sm truncate">{slot.label}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={isCurrent ? "ghost" : "primary"}
                    disabled={isCurrent}
                    onClick={() => handlePlace(slot.key)}
                  >
                    {isCurrent ? "Placed" : "Place here"}
                  </Button>
                  {isCurrent && (
                    <Button size="sm" variant="danger" onClick={() => handleClearPlacement(slot.key)}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* URL upload modal */}
      <Modal
        open={openUrlUpload}
        title="Add image from URL"
        onClose={() => { setOpenUrlUpload(false); setUrlInput(""); }}
      >
        <p className="text-sm text-gray-600 mb-3">
          Paste a direct link to an image (e.g. from Unsplash, your website, etc.).
          The image will be fetched, compressed, and added to your media library.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleUrlUpload(); }}
            disabled={urlUploading}
          />
          <Button
            disabled={urlUploading || !urlInput.trim()}
            onClick={handleUrlUpload}
          >
            {urlUploading ? "Adding…" : "Add image"}
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}