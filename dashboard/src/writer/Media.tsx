import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { uploadMedia, getMedia, deleteMedia } from "../services/api";

type MediaItem = {
  id: number;
  filename: string;
  url: string;
  type: string;
  size?: number;
};

export default function WriterMedia() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openPreview, setOpenPreview] = useState<MediaItem | null>(null);
  const [previewSrc, setPreviewSrc] = useState("");

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

  useEffect(() => {
    loadMedia();
  }, []);

  return (
    <PageShell
      title="Media Library"
      description="Upload and manage images, documents and videos used across your content."
      action={
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                const item = await uploadMedia(file);
                setMedia((prev) => [item, ...prev]);
              } catch (error) {
                console.error("Upload failed:", error);
                alert("Upload failed");
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
          />
          <span
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            {uploading ? "Uploading…" : "Upload media"}
          </span>
        </label>
      }
    >
      {loading ? (
        <Loading label="Loading media…" />
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No media found.</p>
          <p className="mt-1 text-sm">Upload your first media file to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <div key={item.id} className="group relative">
              <div
                className={`aspect-square flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in ${item.type.startsWith("image/") ? "p-0" : "p-3"}`}
                onClick={() => {
                  setOpenPreview(item);
                  setPreviewSrc(item.url);
                }}
              >
                {item.type.startsWith("image/") ? (
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📎</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button variant="ghost" size="sm" className="text-white" onClick={() => setOpenPreview(item)}>
                  Preview
                </Button>
                <Button variant="danger" size="sm" onClick={async () => { await deleteMedia(item.id); loadMedia(); }}>
                  Remove
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500 truncate">{item.filename}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={openPreview !== null} title={openPreview?.filename || "Preview"} onClose={() => { setOpenPreview(null); setPreviewSrc(""); }}>
        <div className="flex justify-center">
          {previewSrc && openPreview?.type.startsWith("image/") ? (
            <img src={previewSrc} alt={openPreview?.filename} className="max-w-full max-h-96 rounded" />
          ) : previewSrc ? (
            <iframe src={previewSrc} title={openPreview?.filename} className="w-full h-96 rounded" />
          ) : null}
        </div>
      </Modal>
    </PageShell>
  );
}