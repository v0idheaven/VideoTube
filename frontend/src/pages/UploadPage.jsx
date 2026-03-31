import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import StudioSidebar from "../components/StudioSidebar.jsx";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

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

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [thumbnailFile]);

  const primaryButtonLabel = useMemo(
    () => (visibility === "public" ? "Upload and publish" : "Save as draft"),
    [visibility]
  );

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#ff2d2d]" />
        <div>
          <p className="font-semibold text-white">Opening upload workspace</p>
          <p className="text-sm text-white/45">Checking your session before preparing the upload form.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Uploading is protected because it uses the real video publish endpoint with multipart files."
        title="Sign in to upload videos"
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[220px,minmax(0,1fr)]">
      <StudioSidebar active="upload" user={user} />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#181818] p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-300/75">Upload</p>
            <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-white md:text-[2.5rem]">
              Publish a new video
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/48">
              This page follows the real backend flow: upload a video file, add a thumbnail, and choose whether it should stay private or go live right away.
            </p>
          </div>
          <Link className="alt-button w-fit" to="/studio">
            Back to dashboard
          </Link>
        </div>

        {message ? (
          <div className="rounded-[22px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[22px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6 md:p-8">
          <form
            className="space-y-7"
            ref={formRef}
            onSubmit={async (event) => {
              event.preventDefault();

              if (!videoFile || !thumbnailFile) {
                setError("Please choose both a video file and a thumbnail.");
                return;
              }

              setSubmitting(true);
              setError("");
              setMessage("");

              try {
                const formData = new FormData();
                formData.append("title", title);
                formData.append("description", description);
                formData.append("videoFile", videoFile);
                formData.append("thumbnail", thumbnailFile);

                const response = await apiRequest("/api/v1/videos", {
                  method: "POST",
                  body: formData,
                });

                const createdVideo = response?.data;

                if (visibility === "public" && createdVideo?._id) {
                  await apiRequest(`/api/v1/videos/toggle/publish/${createdVideo._id}`, {
                    method: "PATCH",
                  });
                }

                formRef.current?.reset();
                setTitle("");
                setDescription("");
                setVisibility("private");
                setVideoFile(null);
                setThumbnailFile(null);
                setThumbnailPreview("");
                setMessage(
                  visibility === "public"
                    ? "Video uploaded and published successfully."
                    : "Video uploaded successfully and saved as a draft."
                );
              } catch (requestError) {
                setError(requestError.message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="rounded-[24px] border-2 border-dashed border-white/10 bg-[#121212] p-8 text-center transition hover:border-white/20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a]">
                <svg className="h-7 w-7 text-white/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M17 8l-5-5-5 5" />
                  <path d="M12 3v12" />
                </svg>
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white">Drag and drop video files to upload</h2>
              <p className="mt-2 text-sm text-white/42">
                MP4, MOV, AVI and more. Videos stay private until you publish them.
              </p>
              <label className="mt-5 inline-flex cursor-pointer items-center rounded-full bg-[#ff2d2d] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                Select video file
                <input
                  accept="video/*"
                  className="hidden"
                  name="videoFile"
                  onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                  required
                  type="file"
                />
              </label>
              <p className="mt-4 text-sm text-white/60">
                {videoFile ? videoFile.name : "No video selected yet"}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),320px]">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                    Title
                  </label>
                  <input
                    className="input-shell"
                    maxLength={120}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Add a clear, searchable title"
                    required
                    value={title}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                    Description
                  </label>
                  <textarea
                    className="input-shell min-h-32"
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Tell viewers what this video is about"
                    required
                    value={description}
                  />
                </div>

                <div>
                  <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                    Visibility
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      {
                        id: "private",
                        title: "Private",
                        description: "Only you can open this video until you publish it later.",
                      },
                      {
                        id: "public",
                        title: "Public",
                        description: "Publish immediately after upload so it can appear in the feed.",
                      },
                    ].map((option) => {
                      const selected = visibility === option.id;

                      return (
                        <button
                          className={`rounded-[20px] border p-4 text-left transition ${
                            selected
                              ? "border-[#ff2d2d] bg-[#1a0000]"
                              : "border-white/10 bg-[#121212] hover:border-white/20"
                          }`}
                          key={option.id}
                          onClick={() => setVisibility(option.id)}
                          type="button"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                                selected ? "border-[#ff2d2d]" : "border-white/30"
                              }`}
                            >
                              {selected ? <span className="h-2 w-2 rounded-full bg-[#ff2d2d]" /> : null}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">{option.title}</p>
                              <p className="mt-1 text-xs leading-6 text-white/45">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#121212] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                  Thumbnail
                </p>
                <label className="mt-4 flex cursor-pointer flex-col gap-4">
                  <div className="aspect-video overflow-hidden rounded-2xl border border-dashed border-white/10 bg-[#181818]">
                    {thumbnailPreview ? (
                      <img alt="Thumbnail preview" className="h-full w-full object-cover" src={thumbnailPreview} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/35">
                        Thumbnail preview
                      </div>
                    )}
                  </div>
                  <input
                    accept="image/*"
                    className="hidden"
                    name="thumbnail"
                    onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)}
                    required
                    type="file"
                  />
                  <span className="inline-flex w-fit items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5">
                    Choose image
                  </span>
                </label>
                <p className="mt-3 text-sm text-white/58">
                  {thumbnailFile ? thumbnailFile.name : "PNG, JPG, WEBP recommended"}
                </p>
                <div className="mt-4 text-xs leading-6 text-white/38">
                  Recommended size: 1280 x 720
                  <br />
                  Keep text bold and readable in smaller previews.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-5">
              <button
                className="alt-button"
                disabled={submitting}
                onClick={() => navigate("/studio")}
                type="button"
              >
                Cancel
              </button>
              <button className="gradient-button" disabled={submitting} type="submit">
                {submitting ? "Uploading..." : primaryButtonLabel}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default UploadPage;
