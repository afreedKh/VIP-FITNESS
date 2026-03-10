import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMedia } from "../context/MediaContext";
import { uploadToCloudinary } from "../lib/cloudinary";

const MANAGE_PER_PAGE = 12;

export default function AdminPanel() {
  const { logout } = useAuth();
  const {
    media,
    homeMedia,
    generalMedia,
    addMedia,
    deleteMedia,
    updateMedia,
    usingFirebase,
  } = useMedia();
  const navigate = useNavigate();

  const [tab, setTab] = useState("home");
  const [uploadType, setUploadType] = useState("photo");
  const [uploadDest, setUploadDest] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Manage All — search & pagination
  const [manageSearch, setManageSearch] = useState("");
  const [managePage, setManagePage] = useState(1);

  const [form, setForm] = useState({ title: "" });
  const [files, setFiles] = useState([]);
  const fileRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const switchUploadType = (type) => {
    setUploadType(type);
    setFiles([]);
    setUploadError("");
    setSuccessMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) =>
      uploadType === "video"
        ? f.type.startsWith("video/")
        : f.type.startsWith("image/"),
    );
    if (valid.length === 0) {
      setUploadError(
        uploadType === "video"
          ? "Only video files are supported (MP4, MOV, WEBM)."
          : "Only image files are supported (JPG, PNG, GIF, WEBP).",
      );
      return;
    }
    setFiles(valid);
    setUploadError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setUploadError("Please select at least one file.");
      return;
    }
    setUploading(true);
    setUploadError("");
    setSuccessMsg("");

    const isHome = uploadDest === "home";
    if (isHome && homeMedia.length >= 6 && activeSlot === null) {
      setUploadError(
        "Home gallery is full (6/6). Click a slot in the Home Gallery tab to replace it.",
      );
      setUploading(false);
      return;
    }

    try {
      const slotIndex = isHome
        ? activeSlot !== null
          ? activeSlot
          : homeMedia.length
        : null;

      if (isHome && activeSlot !== null && homeMedia[activeSlot]) {
        await deleteMedia(homeMedia[activeSlot].id);
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mediaUpload = await uploadToCloudinary(file, (p) =>
          setProgress(Math.round((i / files.length) * 100 + p / files.length)),
        );

        let thumbnailUrl = mediaUpload.thumbnailUrl;
        if (uploadType === "video" && thumbnailFile) {
          const thumbUpload = await uploadToCloudinary(thumbnailFile);
          thumbnailUrl = thumbUpload.url;
        }

        await addMedia({
          type: uploadType,
          url: mediaUpload.url,
          thumbnailUrl: thumbnailUrl,
          publicId: mediaUpload.publicId,
          title: form.title || file.name.replace(/\.[^.]+$/, ""),
          category: "general",
          tags: [],
          homeGallery: isHome,
          homeSlot: isHome ? slotIndex : null,
        });
      }

      setSuccessMsg(
        `✓ ${files.length} file(s) uploaded to ${isHome ? "Home Gallery" : "General Gallery"}!`,
      );
      setFiles([]);
      setForm({ title: "" });
      setProgress(0);
      setActiveSlot(null);
      setThumbnailFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setUploadError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleHomeGallery = async (item) => {
    if (!item.homeGallery && homeMedia.length >= 6) {
      alert("Home gallery is full (6/6). Remove an item first.");
      return;
    }
    const slot = item.homeGallery ? null : homeMedia.length;
    await updateMedia(item.id, {
      homeGallery: !item.homeGallery,
      homeSlot: item.homeGallery ? null : slot,
    });
  };

  // Manage All — filtered + searched
  const allManaged = useMemo(() => {
    return media.filter((m) => filterType === "all" || m.type === filterType);
  }, [media, filterType]);

  const managed = useMemo(() => {
    if (!manageSearch.trim()) return allManaged;
    const q = manageSearch.toLowerCase();
    return allManaged.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q),
    );
  }, [allManaged, manageSearch]);

  const manageTotalPages = Math.max(
    1,
    Math.ceil(managed.length / MANAGE_PER_PAGE),
  );
  const safeManagedPage = Math.min(managePage, manageTotalPages);
  const managedPageItems = managed.slice(
    (safeManagedPage - 1) * MANAGE_PER_PAGE,
    safeManagedPage * MANAGE_PER_PAGE,
  );

  const managePageNumbers = (() => {
    if (manageTotalPages <= 7)
      return Array.from({ length: manageTotalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (safeManagedPage > 3) pages.push("...");
    for (
      let i = Math.max(2, safeManagedPage - 1);
      i <= Math.min(manageTotalPages - 1, safeManagedPage + 1);
      i++
    )
      pages.push(i);
    if (safeManagedPage < manageTotalPages - 2) pages.push("...");
    pages.push(manageTotalPages);
    return pages;
  })();

  const homeSlots = Array.from({ length: 6 }, (_, i) => homeMedia[i] || null);

  return (
    <div style={s.page}>
      {/* HEADER */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo} onClick={() => navigate("/")}>
            <span style={{ color: "#FF4400" }}>VIP</span>
            <span style={{ color: "#fff" }}>FITNESS</span>
            <span style={s.adminBadge}>ADMIN</span>
          </div>
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={s.viewSiteBtn}
            >
              View Site ↗
            </a>
            <a
              href="/gallery"
              target="_blank"
              rel="noopener noreferrer"
              style={s.viewSiteBtn}
            >
              View Gallery ↗
            </a>
            <button onClick={handleLogout} style={s.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {!usingFirebase && (
          <div style={s.warnBanner}>
            ⚠ Firebase not configured — uploads will not persist. Add
            credentials to <code>.env</code>.
          </div>
        )}

        {/* TABS */}
        <div style={s.tabs}>
          {[
            { key: "home", label: "🏠 Home Gallery" },
            { key: "upload", label: "⬆ Upload Media" },
            { key: "manage", label: `🗂 Manage All (${media.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ ...s.tabBtn, ...(tab === t.key ? s.tabActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB 1 — HOME GALLERY ═══ */}
        {tab === "home" && (
          <div style={s.card}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h2 style={{ ...s.cardTitle, marginBottom: "0.25rem" }}>
                  Home Gallery Slots
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "0.78rem",
                    margin: 0,
                  }}
                >
                  These 6 items appear in the "Our Gallery" section on the
                  homepage. Click a slot to replace it.
                </p>
              </div>
              <div
                style={{
                  ...s.slotCount,
                  background:
                    homeMedia.length >= 6
                      ? "rgba(255,68,0,0.15)"
                      : "rgba(74,222,128,0.1)",
                  borderColor: homeMedia.length >= 6 ? "#FF4400" : "#4ade80",
                  color: homeMedia.length >= 6 ? "#FF4400" : "#4ade80",
                }}
              >
                {homeMedia.length} / 6 slots filled
              </div>
            </div>

            <div style={s.homeGrid}>
              {homeSlots.map((item, i) => (
                <div
                  key={i}
                  style={{
                    ...s.homeSlot,
                    gridColumn: i === 0 ? "span 2" : "span 1",
                    gridRow: i === 0 ? "span 2" : "span 1",
                    ...(activeSlot === i ? s.homeSlotActive : {}),
                  }}
                  onMouseEnter={() => setHoveredSlot(i)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  onClick={() => {
                    setActiveSlot(activeSlot === i ? null : i);
                    setTab("upload");
                    setUploadDest("home");
                    setFiles([]);
                    setUploadError("");
                    setSuccessMsg("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  {item ? (
                    <>
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      {item.type === "video" && (
                        <div style={s.videoPin}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <polygon points="6,3 20,12 6,21" />
                          </svg>
                        </div>
                      )}
                      <div
                        style={{
                          ...s.slotOverlay,
                          opacity: hoveredSlot === i ? 1 : 0,
                        }}
                      >
                        <div style={s.slotNum}>Slot {i + 1}</div>
                        <div style={s.slotTitle}>{item.title}</div>
                        <button
                          style={s.slotReplaceBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlot(i);
                            setTab("upload");
                            setUploadDest("home");
                          }}
                        >
                          ↺ Replace
                        </button>
                        <button
                          style={s.slotRemoveBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({ id: item.id, fromSlot: true });
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={s.emptySlot}>
                      <div
                        style={{
                          fontSize: "1.75rem",
                          marginBottom: "0.5rem",
                          opacity: 0.3,
                        }}
                      >
                        +
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          opacity: 0.35,
                          fontFamily: "'Oswald', sans-serif",
                          letterSpacing: "0.08em",
                        }}
                      >
                        SLOT {i + 1}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          opacity: 0.25,
                          marginTop: "0.25rem",
                        }}
                      >
                        Click to add
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p
              style={{
                color: "rgba(255,255,255,0.2)",
                fontSize: "0.72rem",
                marginTop: "1rem",
                textAlign: "center",
              }}
            >
              💡 Click any slot to open Upload and replace its content. Or go to
              Manage All to promote any item to the homepage.
            </p>
          </div>
        )}

        {/* ═══ TAB 2 — UPLOAD MEDIA ═══ */}
        {tab === "upload" && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Upload Media</h2>

            {/* Destination toggle */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ ...s.label, marginBottom: "0.6rem" }}>
                Upload destination
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[
                  {
                    key: "home",
                    label: "🏠 Home Gallery",
                    sub: `${homeMedia.length}/6 slots`,
                  },
                  {
                    key: "general",
                    label: "🗂 General Gallery",
                    sub: `${generalMedia.length} items`,
                  },
                ].map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => {
                      setUploadDest(d.key);
                      setFiles([]);
                      setActiveSlot(null);
                      setUploadError("");
                    }}
                    style={{
                      ...s.destBtn,
                      ...(uploadDest === d.key ? s.destBtnActive : {}),
                    }}
                  >
                    <span style={{ fontSize: "0.9rem" }}>{d.label}</span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        opacity: 0.55,
                        display: "block",
                        marginTop: "2px",
                      }}
                    >
                      {d.sub}
                    </span>
                  </button>
                ))}
              </div>
              {uploadDest === "home" && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    background: "rgba(255,68,0,0.07)",
                    border: "1px solid rgba(255,68,0,0.2)",
                    padding: "0.6rem 0.9rem",
                    fontSize: "0.78rem",
                    color: "rgba(255,200,180,0.8)",
                  }}
                >
                  {activeSlot !== null
                    ? `↺ Replacing Slot ${activeSlot + 1}${homeMedia[activeSlot] ? ` (${homeMedia[activeSlot].title})` : ""}`
                    : homeMedia.length < 6
                      ? `Will fill Slot ${homeMedia.length + 1} of 6`
                      : "⚠ Home gallery is full. Go to Home Gallery tab and click a slot to replace it."}
                </div>
              )}
            </div>

            {/* Photo / Video toggle */}
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}
            >
              {["photo", "video"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchUploadType(t)}
                  style={{
                    ...s.typeToggle,
                    ...(uploadType === t ? s.typeToggleActive : {}),
                  }}
                >
                  {t === "photo" ? "🖼 Photos" : "🎬 Videos"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Drop zone */}
              <div
                style={{
                  ...s.dropZone,
                  ...(dragOver ? s.dropZoneActive : {}),
                  ...(files.length ? s.dropZoneHasFile : {}),
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={uploadType === "video" ? "video/*" : "image/*"}
                  multiple={uploadDest === "general"}
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                {files.length === 0 ? (
                  <>
                    <div style={s.dropIcon}>
                      {uploadType === "video" ? "🎬" : "🖼"}
                    </div>
                    <p style={s.dropText}>
                      {uploadType === "video"
                        ? "Drag & drop video here"
                        : "Drag & drop photos here"}
                    </p>
                    <p style={s.dropSub}>
                      {uploadType === "video"
                        ? "MP4, MOV, WEBM"
                        : "JPG, PNG, GIF, WEBP"}
                      {uploadDest === "home"
                        ? " · 1 file (home slot)"
                        : " · multiple OK"}
                    </p>
                  </>
                ) : (
                  <div style={s.fileList}>
                    {files.map((f, i) => (
                      <div key={i} style={s.fileItem}>
                        <span style={s.fileIcon}>
                          {f.type.startsWith("video/") ? "🎬" : "🖼"}
                        </span>
                        <span style={s.fileName}>{f.name}</span>
                        <span style={s.fileSize}>
                          ({(f.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                    ))}
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.75rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      Click to change
                    </p>
                  </div>
                )}
              </div>

              {uploadType === "video" && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={s.label}>
                    Video Thumbnail <span style={s.optional}>(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    style={{
                      background: "#121212",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      padding: "0.75rem",
                      width: "100%",
                      fontSize: "0.85rem",
                    }}
                  />
                  <p
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.72rem",
                      marginTop: "4px",
                    }}
                  >
                    If not provided, a frame from the video will be used
                    automatically.
                  </p>
                </div>
              )}

              {/* Title only — no category or tags */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={s.label}>
                  Title <span style={s.optional}>(optional)</span>
                </label>
                <input
                  style={s.input}
                  placeholder="e.g. Gym Floor, Weight Training…"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              {uploading && (
                <div style={s.progressWrap}>
                  <div style={{ ...s.progressBar, width: `${progress}%` }} />
                  <p style={s.progressText}>{progress}% uploading…</p>
                </div>
              )}
              {uploadError && <p style={s.errorMsg}>{uploadError}</p>}
              {successMsg && <p style={s.successMsg}>{successMsg}</p>}

              <button
                type="submit"
                disabled={uploading}
                style={{ ...s.submitBtn, opacity: uploading ? 0.6 : 1 }}
              >
                {uploading
                  ? `Uploading… ${progress}%`
                  : `⬆ Upload to ${uploadDest === "home" ? "Home Gallery" : "General Gallery"}`}
              </button>
            </form>
          </div>
        )}

        {/* ═══ TAB 3 — MANAGE ALL ═══ */}
        {tab === "manage" && (
          <div style={s.card}>
            {/* Header row */}
            <div style={s.manageHeader}>
              <h2 style={s.cardTitle}>
                All Media ({managed.length}
                {managed.length !== allManaged.length
                  ? ` of ${allManaged.length}`
                  : ""}
                )
              </h2>
              <div style={s.filterBtns}>
                {["all", "photo", "video"].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilterType(f);
                      setManagePage(1);
                    }}
                    style={{
                      ...s.filterBtn,
                      ...(filterType === f ? s.filterActive : {}),
                    }}
                  >
                    {f === "all"
                      ? "All"
                      : f === "photo"
                        ? "🖼 Photos"
                        : "🎬 Videos"}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
              <svg
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.35)",
                  pointerEvents: "none",
                }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                style={{ ...s.input, paddingLeft: "2.2rem", marginBottom: 0 }}
                placeholder="Search by title or category…"
                value={manageSearch}
                onChange={(e) => {
                  setManageSearch(e.target.value);
                  setManagePage(1);
                }}
              />
              {manageSearch && (
                <button
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                  onClick={() => {
                    setManageSearch("");
                    setManagePage(1);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {managed.length === 0 ? (
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  textAlign: "center",
                  padding: "3rem 0",
                  fontSize: "0.9rem",
                }}
              >
                {media.length === 0
                  ? "No uploaded media yet."
                  : "No results match your search."}
              </p>
            ) : (
              <>
                <div style={s.grid}>
                  {managedPageItems.map((item) => (
                    <div key={item.id} style={s.gridItem}>
                      <div style={s.thumbWrap}>
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.title}
                          style={s.thumb}
                          loading="lazy"
                        />
                        {item.type === "video" && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              pointerEvents: "none",
                            }}
                          >
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: "rgba(255,68,0,0.85)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="white"
                              >
                                <polygon points="6,3 20,12 6,21" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {item.homeGallery && <div style={s.homeBadge}>🏠</div>}
                      </div>
                      <div style={s.itemInfo}>
                        <p style={s.itemTitle}>{item.title}</p>
                        <p style={s.itemMeta}>
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          padding: "0 0.5rem 0.5rem",
                        }}
                      >
                        <button
                          title={
                            item.homeGallery
                              ? "Remove from Home Gallery"
                              : "Add to Home Gallery"
                          }
                          style={{
                            ...s.actionBtn,
                            flex: 1,
                            background: item.homeGallery
                              ? "rgba(255,68,0,0.2)"
                              : "rgba(255,255,255,0.05)",
                            color: item.homeGallery
                              ? "#FF4400"
                              : "rgba(255,255,255,0.4)",
                            fontSize: "0.65rem",
                          }}
                          onClick={() => toggleHomeGallery(item)}
                        >
                          {item.homeGallery ? "🏠 On Home" : "+ Home"}
                        </button>
                        <button
                          style={{
                            ...s.actionBtn,
                            background: "rgba(239,68,68,0.15)",
                            color: "#ef4444",
                          }}
                          onClick={() =>
                            setConfirmDelete({ id: item.id, fromSlot: false })
                          }
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {manageTotalPages > 1 && (
                  <div style={s.pagination}>
                    <button
                      style={{
                        ...s.pageBtn,
                        ...(safeManagedPage === 1 ? s.pageBtnDisabled : {}),
                      }}
                      onClick={() => setManagePage((p) => Math.max(1, p - 1))}
                      disabled={safeManagedPage === 1}
                    >
                      ‹ Prev
                    </button>

                    {managePageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span key={`dots-${i}`} style={s.pageDots}>
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          style={{
                            ...s.pageBtn,
                            ...(p === safeManagedPage ? s.pageBtnActive : {}),
                          }}
                          onClick={() => setManagePage(p)}
                        >
                          {p}
                        </button>
                      ),
                    )}

                    <button
                      style={{
                        ...s.pageBtn,
                        ...(safeManagedPage === manageTotalPages
                          ? s.pageBtnDisabled
                          : {}),
                      }}
                      onClick={() =>
                        setManagePage((p) => Math.min(manageTotalPages, p + 1))
                      }
                      disabled={safeManagedPage === manageTotalPages}
                    >
                      Next ›
                    </button>
                  </div>
                )}

                <p style={s.pageInfo}>
                  Showing {(safeManagedPage - 1) * MANAGE_PER_PAGE + 1}–
                  {Math.min(safeManagedPage * MANAGE_PER_PAGE, managed.length)}{" "}
                  of {managed.length} items
                </p>
              </>
            )}
          </div>
        )}
      </main>

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div style={s.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <p style={{ color: "#fff", marginBottom: "0.5rem" }}>
              Delete this item?
            </p>
            {confirmDelete.fromSlot && (
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.8rem",
                  marginBottom: "1.5rem",
                }}
              >
                This will free up the home gallery slot.
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "1.5rem",
              }}
            >
              <button
                style={s.modalCancel}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                style={s.modalConfirm}
                onClick={() => {
                  deleteMedia(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    fontFamily: "'Manrope', sans-serif",
    color: "#fff",
  },
  header: {
    background: "rgba(0,0,0,0.95)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "1.4rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  adminBadge: {
    background: "#FF4400",
    color: "#fff",
    fontSize: "0.6rem",
    padding: "2px 6px",
    letterSpacing: "0.1em",
    fontFamily: "'Oswald', sans-serif",
  },
  viewSiteBtn: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.8rem",
    textDecoration: "none",
    padding: "0.4rem 0.9rem",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  logoutBtn: {
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "0.4rem 0.9rem",
    fontSize: "0.8rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  main: { maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" },
  warnBanner: {
    background: "rgba(245,158,11,0.1)",
    border: "1px solid rgba(245,158,11,0.3)",
    color: "#f59e0b",
    padding: "0.75rem 1rem",
    fontSize: "0.82rem",
    marginBottom: "1.5rem",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  tabBtn: {
    fontFamily: "'Oswald', sans-serif",
    background: "transparent",
    color: "rgba(255,255,255,0.45)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "0.65rem 1.5rem",
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: { background: "#FF4400", color: "#fff", borderColor: "#FF4400" },
  card: {
    background: "#0A0A0A",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "2rem",
  },
  cardTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "1.2rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#fff",
    marginBottom: "1.5rem",
  },
  slotCount: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "0.8rem",
    padding: "0.35rem 0.9rem",
    border: "1px solid",
    letterSpacing: "0.06em",
    flexShrink: 0,
  },
  homeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },
  homeSlot: {
    position: "relative",
    aspectRatio: "4/3",
    overflow: "hidden",
    cursor: "pointer",
    border: "2px solid rgba(255,255,255,0.07)",
    transition: "border-color 0.2s",
  },
  homeSlotActive: {
    borderColor: "#FF4400",
    boxShadow: "0 0 0 2px rgba(255,68,0,0.3)",
  },
  emptySlot: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.02)",
    border: "2px dashed rgba(255,255,255,0.08)",
  },
  slotOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    transition: "opacity 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
  },
  slotNum: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "0.65rem",
    color: "#FF4400",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },
  slotTitle: {
    color: "#fff",
    fontSize: "0.8rem",
    textAlign: "center",
    padding: "0 0.5rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  slotReplaceBtn: {
    background: "#FF4400",
    color: "#fff",
    border: "none",
    padding: "0.3rem 0.8rem",
    fontSize: "0.7rem",
    cursor: "pointer",
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: "0.05em",
  },
  slotRemoveBtn: {
    background: "rgba(239,68,68,0.2)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.3)",
    padding: "0.3rem 0.8rem",
    fontSize: "0.7rem",
    cursor: "pointer",
    fontFamily: "'Oswald', sans-serif",
  },
  videoPin: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    background: "rgba(255,68,0,0.85)",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  destBtn: {
    flex: 1,
    background: "#121212",
    color: "rgba(255,255,255,0.45)",
    border: "2px solid rgba(255,255,255,0.1)",
    padding: "0.8rem 1rem",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
    textAlign: "center",
  },
  destBtnActive: {
    background: "rgba(255,68,0,0.1)",
    color: "#fff",
    borderColor: "#FF4400",
  },
  typeToggle: {
    flex: 1,
    fontFamily: "'Oswald', sans-serif",
    background: "#121212",
    color: "rgba(255,255,255,0.45)",
    border: "2px solid rgba(255,255,255,0.1)",
    padding: "0.75rem",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  typeToggleActive: {
    background: "rgba(255,68,0,0.12)",
    color: "#fff",
    borderColor: "#FF4400",
  },
  dropZone: {
    border: "2px dashed rgba(255,255,255,0.15)",
    padding: "2.5rem 2rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "1.5rem",
    background: "#050505",
  },
  dropZoneActive: { borderColor: "#FF4400", background: "rgba(255,68,0,0.05)" },
  dropZoneHasFile: {
    borderColor: "rgba(74,222,128,0.5)",
    background: "rgba(74,222,128,0.04)",
  },
  dropIcon: { fontSize: "2.5rem", marginBottom: "0.75rem" },
  dropText: { color: "#fff", fontSize: "0.95rem", marginBottom: "0.4rem" },
  dropSub: { color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" },
  fileList: { textAlign: "left" },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.35rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  fileIcon: { fontSize: "1.1rem" },
  fileName: {
    color: "#fff",
    fontSize: "0.85rem",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "0.75rem",
    flexShrink: 0,
  },
  label: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.5)",
    display: "block",
    marginBottom: "0.4rem",
  },
  optional: {
    color: "rgba(255,255,255,0.25)",
    textTransform: "none",
    fontSize: "0.7rem",
    fontFamily: "inherit",
    letterSpacing: 0,
  },
  input: {
    background: "#121212",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    padding: "0.75rem",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  progressWrap: {
    background: "#121212",
    marginBottom: "1rem",
    position: "relative",
    height: "8px",
  },
  progressBar: {
    background: "#FF4400",
    height: "100%",
    transition: "width 0.2s",
  },
  progressText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.75rem",
    margin: "0.5rem 0 0",
  },
  errorMsg: { color: "#ef4444", fontSize: "0.82rem", marginBottom: "1rem" },
  successMsg: { color: "#4ade80", fontSize: "0.82rem", marginBottom: "1rem" },
  submitBtn: {
    fontFamily: "'Oswald', sans-serif",
    background: "#FF4400",
    color: "#fff",
    border: "none",
    padding: "0.9rem 2rem",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    cursor: "pointer",
    width: "100%",
    fontWeight: 600,
    marginTop: "0.5rem",
  },
  manageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  filterBtns: { display: "flex", gap: "0.4rem" },
  filterBtn: {
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "0.35rem 0.85rem",
    fontSize: "0.78rem",
    fontFamily: "'Oswald', sans-serif",
    textTransform: "uppercase",
    cursor: "pointer",
    letterSpacing: "0.05em",
  },
  filterActive: {
    background: "#FF4400",
    color: "#fff",
    borderColor: "#FF4400",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "1rem",
  },
  gridItem: {
    background: "#121212",
    border: "1px solid rgba(255,255,255,0.07)",
    overflow: "hidden",
    position: "relative",
  },
  thumbWrap: { position: "relative", aspectRatio: "4/3", overflow: "hidden" },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  homeBadge: {
    position: "absolute",
    top: "5px",
    left: "5px",
    background: "rgba(255,68,0,0.85)",
    fontSize: "0.65rem",
    padding: "2px 5px",
    borderRadius: "2px",
  },
  itemInfo: { padding: "0.5rem 0.6rem 0.3rem" },
  itemTitle: {
    color: "#fff",
    fontSize: "0.78rem",
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    margin: 0,
    marginBottom: "2px",
  },
  itemMeta: { color: "rgba(255,255,255,0.3)", fontSize: "0.68rem", margin: 0 },
  actionBtn: {
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "0.3rem 0.4rem",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.7rem",
    letterSpacing: "0.03em",
    borderRadius: "2px",
  },
  // Pagination
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.4rem",
    marginTop: "2rem",
    flexWrap: "wrap",
  },
  pageBtn: {
    fontFamily: "'Oswald', sans-serif",
    background: "transparent",
    color: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "0.45rem 0.85rem",
    fontSize: "0.8rem",
    letterSpacing: "0.05em",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "38px",
    textAlign: "center",
  },
  pageBtnActive: {
    background: "#FF4400",
    color: "#fff",
    borderColor: "#FF4400",
  },
  pageBtnDisabled: { opacity: 0.3, cursor: "not-allowed" },
  pageDots: {
    color: "rgba(255,255,255,0.3)",
    padding: "0 0.25rem",
    fontSize: "0.9rem",
  },
  pageInfo: {
    textAlign: "center",
    color: "rgba(255,255,255,0.25)",
    fontSize: "0.75rem",
    marginTop: "0.75rem",
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#0A0A0A",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "2.5rem",
    textAlign: "center",
    maxWidth: "360px",
    width: "90%",
  },
  modalCancel: {
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "0.65rem 1.5rem",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.85rem",
  },
  modalConfirm: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "0.65rem 1.5rem",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.85rem",
  },
};
