import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import StudioSidebar from "../components/StudioSidebar.jsx";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const readUploadPayload = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text }; }
};

const uploadAssetDirectToCloudinary = async ({ file, resourceType, signaturePayload }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signaturePayload.apiKey);
  formData.append("timestamp", String(signaturePayload.timestamp));
  formData.append("signature", signaturePayload.signature);
  if (signaturePayload.folder) formData.append("folder", signaturePayload.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  const payload = await readUploadPayload(response);
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || `Cloudinary ${resourceType} upload failed`);
  return payload;
};

const UploadPage = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState("form"); // "form" | "uploading"

  useEffect(() => {
    if (!thumbnailFile) { setThumbnailPreview(""); return; }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  const primaryButtonLabel = useMemo(
    () => (visibility === "public" ? "Publish" : "Save as private"),
    [visibility]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#272727] border-t-[#f1f1f1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate description="Sign in to upload videos." title="Sign in to upload" />;
  }

  return (
    <div className="flex gap-6">
      <StudioSidebar active="upload" user={user} />

      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#f1f1f1]">Upload video</h1>
          <Link className="alt-button" to="/studio">Back to Studio</Link>
        </div>

        {message && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        <form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!videoFile || !thumbnailFile) { setError("Please select both a video file and a thumbnail."); return; }
            setSubmitting(true);
            setError("");
            setMessage("");
            setUploadStep("uploading");
            try {
              const signatureResponse = await apiRequest("/api/v1/videos/direct-upload-signature", { method: "POST" });
              const signaturePayload = signatureResponse?.data;
              const videoAsset = await uploadAssetDirectToCloudinary({ file: videoFile, resourceType: "video", signaturePayload });
              const thumbnailAsset = await uploadAssetDirectToCloudinary({ file: thumbnailFile, resourceType: "image", signaturePayload });
              await apiRequest("/api/v1/videos/direct", { method: "POST", body: { title, description, visibility, videoAsset, thumbnailAsset } });
              formRef.current?.reset();
              setTitle(""); setDescription(""); setVisibility("private");
              setVideoFile(null); setThumbnailFile(null); setThumbnailPreview("");
              setMessage(visibility === "public" ? "Video uploaded and published successfully." : "Video saved as private.");
              setUploadStep("form");
            } catch (err) {
              setError(err.message);
              setUploadStep("form");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {/* Drop zone */}
          {!videoFile ? (
            <div className="rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.2)] bg-[#212121] p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#272727]">
                <svg className="h-8 w-8 text-[#aaaaaa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <h2 className="mt-4 text-base font-medium text-[#f1f1f1]">Drag and drop video files to upload</h2>
              <p className="mt-2 text-sm text-[#aaaaaa]">Your videos will be private until you publish them.</p>
              <label className="mt-6 inline-flex cursor-pointer items-center rounded-full bg-[#3ea6ff] px-6 py-2.5 text-sm font-medium text-black hover:bg-[#5bb8ff]">
                Select files
                <input accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} type="file" />
              </label>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
              {/* Left: form fields */}
              <div className="space-y-5">
                {/* Video selected indicator */}
                <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] px-4 py-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-[#3ea6ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#f1f1f1]">{videoFile.name}</p>
                    <p className="text-xs text-[#aaaaaa]">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button className="text-xs text-[#aaaaaa] hover:text-[#f1f1f1]" onClick={() => setVideoFile(null)} type="button">Remove</button>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#f1f1f1]">Title (required)</label>
                  <input
                    className="input-shell"
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a title that describes your video"
                    required
                    value={title}
                  />
                  <p className="mt-1 text-right text-xs text-[#aaaaaa]">{title.length}/100</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#f1f1f1]">Description</label>
                  <textarea
                    className="input-shell min-h-[120px] resize-none"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers about your video"
                    required
                    value={description}
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-[#f1f1f1]">Visibility</label>
                  <div className="space-y-2">
                    {[
                      { id: "private", label: "Private", desc: "Only you can watch your video" },
                      { id: "public", label: "Public", desc: "Everyone can watch your video" },
                    ].map((opt) => (
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${visibility === opt.id ? "border-[#3ea6ff] bg-[#263850]" : "border-[rgba(255,255,255,0.1)] bg-[#212121] hover:border-[rgba(255,255,255,0.2)]"}`}
                        key={opt.id}
                      >
                        <input
                          checked={visibility === opt.id}
                          className="mt-0.5 accent-[#3ea6ff]"
                          onChange={() => setVisibility(opt.id)}
                          type="radio"
                          value={opt.id}
                        />
                        <div>
                          <p className="text-sm font-medium text-[#f1f1f1]">{opt.label}</p>
                          <p className="text-xs text-[#aaaaaa]">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: thumbnail */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#f1f1f1]">Thumbnail</label>
                  <p className="mb-3 text-xs text-[#aaaaaa]">Upload a picture that shows what's in your video.</p>
                  <div className="aspect-video overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#272727]">
                    {thumbnailPreview ? (
                      <img alt="Thumbnail preview" className="h-full w-full object-cover" src={thumbnailPreview} />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-[#aaaaaa]">
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                        </svg>
                        <span className="text-xs">Upload thumbnail</span>
                      </div>
                    )}
                  </div>
                  <label className="mt-3 inline-flex cursor-pointer items-center rounded-full border border-[rgba(255,255,255,0.2)] px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#272727]">
                    {thumbnailFile ? "Change thumbnail" : "Upload thumbnail"}
                    <input accept="image/*" className="hidden" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} required type="file" />
                  </label>
                  {thumbnailFile && <p className="mt-1 text-xs text-[#aaaaaa]">{thumbnailFile.name}</p>}
                </div>

                {/* Upload progress indicator */}
                {submitting && (
                  <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#272727] border-t-[#3ea6ff]" />
                      <p className="text-sm text-[#f1f1f1]">Uploading to Cloudinary...</p>
                    </div>
                    <p className="mt-2 text-xs text-[#aaaaaa]">Do not close this page until the upload completes.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {videoFile && (
            <div className="flex items-center justify-end gap-3 border-t border-[rgba(255,255,255,0.1)] pt-4">
              <button className="alt-button" disabled={submitting} onClick={() => navigate("/studio")} type="button">Cancel</button>
              <button className="gradient-button" disabled={submitting} type="submit">
                {submitting ? "Uploading..." : primaryButtonLabel}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
