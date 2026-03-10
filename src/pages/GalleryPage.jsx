import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMedia } from '../context/MediaContext'

const CATEGORIES = ['all', 'facility', 'training', 'events', 'members', 'equipment', 'other']
const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest First' },
  { value: 'oldest',   label: 'Oldest First' },
  { value: 'title_az', label: 'Title A–Z' },
  { value: 'title_za', label: 'Title Z–A' },
]

export default function GalleryPage() {
  const { generalMedia: media, loading } = useMedia()
  const navigate = useNavigate()

  const [typeFilter, setTypeFilter] = useState('all')
  const [catFilter,  setCatFilter]  = useState('all')
  const [sortBy,     setSortBy]     = useState('newest')
  const [search,     setSearch]     = useState('')
  const [lightbox,   setLightbox]   = useState(null)
  const [page,       setPage]       = useState(1)
  const PER_PAGE = 18

  useEffect(() => setPage(1), [typeFilter, catFilter, sortBy, search])

  const filtered = useMemo(() => {
    let list = [...media]
    if (typeFilter !== 'all') list = list.filter(m => m.type === typeFilter)
    if (catFilter  !== 'all') list = list.filter(m => m.category === catFilter)
    if (search.trim()) list = list.filter(m =>
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      (m.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    )
    switch (sortBy) {
      case 'oldest':   list.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt)); break
      case 'title_az': list.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break
      case 'title_za': list.sort((a, b) => (b.title || '').localeCompare(a.title || '')); break
      default:         list.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    }
    return list
  }, [media, typeFilter, catFilter, sortBy, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice(0, page * PER_PAGE)
  const hasMore    = page < totalPages

  const navLightbox = (dir) => {
    const idx  = filtered.findIndex(m => m.id === lightbox?.id)
    const next = filtered[idx + dir]
    if (next) setLightbox(next)
  }

  useEffect(() => {
    if (!lightbox) return
    const handle = (e) => {
      if (e.key === 'Escape')     setLightbox(null)
      if (e.key === 'ArrowRight') navLightbox(1)
      if (e.key === 'ArrowLeft')  navLightbox(-1)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [lightbox, filtered])

  const activeFilters = (typeFilter !== 'all' ? 1 : 0) + (catFilter !== 'all' ? 1 : 0) + (search ? 1 : 0)

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo} onClick={() => navigate('/')}>
            <span style={{ color: '#FF4400' }}>VIP</span>
            <span style={{ color: '#fff' }}>FITNESS</span>
          </div>
          <button onClick={() => navigate('/')} style={s.backBtn}>← Back to Home</button>
        </div>
      </nav>

      <div style={s.container}>
        {/* Page header */}
        <div style={s.pageHeader}>
          <div style={s.eyebrow}>
            <div style={s.eyebrowLine} />
            <span style={s.eyebrowText}>Inside VIP Fitness</span>
            <div style={s.eyebrowLine} />
          </div>
          <h1 style={s.pageTitle}>Our <span style={{ color: '#FF4400' }}>Gallery</span></h1>
          <p style={s.pageSubtitle}>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            {activeFilters > 0 ? ' (filtered)' : ''}
          </p>
        </div>

        {/* Filters bar */}
        <div style={s.filtersBar}>
          <div style={s.searchWrap}>
            <svg style={s.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              style={s.searchInput}
              placeholder="Search by title or tag…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button style={s.clearSearch} onClick={() => setSearch('')}>✕</button>}
          </div>

          <div style={s.pillGroup}>
            {['all', 'photo', 'video'].map(t => (
              <button key={t}
                style={{ ...s.pill, ...(typeFilter === t ? s.pillActive : {}) }}
                onClick={() => setTypeFilter(t)}>
                {t === 'all' ? 'All' : t === 'photo' ? '🖼 Photos' : '🎬 Videos'}
              </button>
            ))}
          </div>

          <select style={s.select} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>

          <select style={s.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {activeFilters > 0 && (
            <button style={s.resetBtn}
              onClick={() => { setTypeFilter('all'); setCatFilter('all'); setSearch('') }}>
              Reset ({activeFilters})
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={s.loading}>Loading gallery…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: '2rem' }}>🏋️</p>
            <p>No media found for the selected filters.</p>
          </div>
        ) : (
          <>
            <div style={s.grid}>
              {paginated.map(item => (
                <GalleryCard key={item.id} item={item} onClick={() => setLightbox(item)} />
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <button style={s.loadMoreBtn} onClick={() => setPage(p => p + 1)}>
                  Load More ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={s.lbOverlay} onClick={() => setLightbox(null)}>
          <button style={s.lbClose} onClick={() => setLightbox(null)}>✕</button>
          <button style={{ ...s.lbNav, left: '1rem' }} onClick={e => { e.stopPropagation(); navLightbox(-1) }}>‹</button>
          <div style={s.lbContent} onClick={e => e.stopPropagation()}>
            {lightbox.type === 'video' ? (
              <video src={lightbox.url} controls autoPlay style={s.lbMedia} />
            ) : (
              <img src={lightbox.url} alt={lightbox.title} style={s.lbMedia} />
            )}
            <div style={s.lbCaption}>
              <span style={s.lbTitle}>{lightbox.title}</span>
              <span style={s.lbCat}>{lightbox.category}</span>
            </div>
          </div>
          <button style={{ ...s.lbNav, right: '1rem' }} onClick={e => { e.stopPropagation(); navLightbox(1) }}>›</button>
        </div>
      )}
    </div>
  )
}

function GalleryCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ ...s.card, ...(hovered ? s.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={s.cardThumb}>
        {/*
          Use <img> for ALL thumbnails including videos.
          Videos get a Cloudinary-generated JPG snapshot as thumbnailUrl.
        */}
        <img
          src={item.thumbnailUrl || item.url}
          alt={item.title}
          style={{ ...s.cardImg, transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          loading="lazy"
        />

        {/* Centered play button for videos */}
        {item.type === 'video' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(255,68,0,0.88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 4px rgba(255,68,0,0.25), 0 4px 16px rgba(0,0,0,0.5)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div style={{ ...s.cardOverlay, opacity: hovered ? 1 : 0 }}>
          {item.type !== 'video' && (
            <div style={s.expandIcon}>⤢</div>
          )}
        </div>

        <div style={s.cardTopLine} />

        {item.type === 'video' && (
          <div style={s.videoBadge}>🎬 VIDEO</div>
        )}
      </div>

      <div style={s.cardBody}>
        <p style={s.cardTitle2}>{item.title}</p>
        <div style={s.cardMeta}>
          <span style={s.catBadge}>{item.category}</span>
          <span style={s.cardDate}>{new Date(item.uploadedAt).toLocaleDateString()}</span>
        </div>
        {item.tags?.length > 0 && (
          <div style={s.tagsRow}>
            {item.tags.slice(0, 3).map(t => <span key={t} style={s.tag}>#{t}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page:         { minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Manrope', sans-serif" },
  nav:          { background: 'rgba(0,0,0,0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 100 },
  navInner:     { maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo:         { fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', fontWeight: 700, display: 'flex', gap: '4px', cursor: 'pointer' },
  backBtn:      { background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 1rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' },
  container:    { maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem' },
  pageHeader:   { textAlign: 'center', marginBottom: '3rem' },
  eyebrow:      { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' },
  eyebrowLine:  { height: '1px', width: '2rem', background: '#FF4400' },
  eyebrowText:  { fontFamily: "'Oswald', sans-serif", color: '#FF4400', textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '0.8rem' },
  pageTitle:    { fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '0.75rem' },
  pageSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' },
  filtersBar:   { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem', padding: '1.25rem', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.08)' },
  searchWrap:   { position: 'relative', flex: '1 1 200px', minWidth: '180px' },
  searchIcon:   { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' },
  searchInput:  { width: '100%', background: '#121212', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '0.6rem 2.2rem', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  clearSearch:  { position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', padding: '2px' },
  pillGroup:    { display: 'flex', gap: '0.35rem' },
  pill:         { fontFamily: "'Oswald', sans-serif", background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.45rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s' },
  pillActive:   { background: '#FF4400', color: '#fff', borderColor: '#FF4400' },
  select:       { background: '#121212', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '0.55rem 0.9rem', fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' },
  resetBtn:     { background: 'transparent', color: '#FF4400', border: '1px solid rgba(255,68,0,0.35)', padding: '0.45rem 1rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' },
  loading:      { textAlign: 'center', padding: '5rem 0', color: 'rgba(255,255,255,0.4)' },
  empty:        { textAlign: 'center', padding: '5rem 0', color: 'rgba(255,255,255,0.4)' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' },
  card:         { background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'border-color 0.3s, transform 0.3s', overflow: 'hidden' },
  cardHover:    { borderColor: 'rgba(255,68,0,0.5)', transform: 'translateY(-4px)' },
  cardThumb:    { position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#121212' },
  cardImg:      { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' },
  cardOverlay:  { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.3s' },
  expandIcon:   { color: '#fff', fontSize: '1.8rem', textShadow: '0 0 20px rgba(255,255,255,0.5)' },
  cardTopLine:  { position: 'absolute', top: 0, left: 0, height: '3px', width: '100%', background: 'linear-gradient(to right, #FF4400, transparent)' },
  videoBadge:   { position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.65rem', padding: '3px 7px', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' },
  cardBody:     { padding: '1rem' },
  cardTitle2:   { fontFamily: "'Oswald', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardMeta:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' },
  catBadge:     { background: 'rgba(255,68,0,0.12)', color: '#FF4400', fontSize: '0.7rem', padding: '2px 7px', textTransform: 'capitalize', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em' },
  cardDate:     { color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem' },
  tagsRow:      { display: 'flex', gap: '0.35rem', flexWrap: 'wrap' },
  tag:          { color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' },
  loadMoreBtn:  { fontFamily: "'Oswald', sans-serif", background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.2)', padding: '0.85rem 2.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.2s' },
  lbOverlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lbClose:      { position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', width: '40px', height: '40px', fontSize: '1rem', cursor: 'pointer', zIndex: 1 },
  lbNav:        { position: 'absolute', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', width: '48px', height: '48px', fontSize: '1.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  lbContent:    { maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  lbMedia:      { maxWidth: '85vw', maxHeight: '78vh', objectFit: 'contain', display: 'block' },
  lbCaption:    { display: 'flex', alignItems: 'center', gap: '1rem' },
  lbTitle:      { fontFamily: "'Oswald', sans-serif", color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  lbCat:        { color: '#FF4400', fontSize: '0.8rem', textTransform: 'capitalize', fontFamily: "'Oswald', sans-serif" },
}
