import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMedia } from '../context/MediaContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

const gridClasses = ['wide tall', '', '', '', '', 'wide']

export default function Gallery() {
  const { homeMedia, generalMedia, loading } = useMedia()
  const navigate  = useNavigate()
  const [lightbox, setLightbox] = useState(null)

  // Re-run scroll reveal whenever homeMedia changes so newly uploaded
  // items (which arrive as new DOM nodes) get the 'visible' class applied.
  useScrollReveal([homeMedia.length])

  const preview = homeMedia.slice(0, 6)
  const totalGalleryCount = generalMedia.length

  return (
    <section id="gallery" className="section section-dark">
      <div className="container">
        <div className="reveal">
          <div className="section-label">
            <div className="line" /><span>Inside VIP Fitness</span><div className="line" />
          </div>
          <h2 className="section-title">Our <span className="accent">Gallery</span></h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
            Loading gallery…
          </div>
        ) : preview.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.25)', fontSize: '0.88rem' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏋️</p>
            <p>No gallery images yet. Upload media from the admin panel.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {preview.map((item, i) => (
              <GalleryThumb
                key={item.id}
                item={item}
                className={`gallery-item reveal ${gridClasses[i] || ''}`}
                style={{ transitionDelay: `${i * 0.05}s` }}
                onClick={() => setLightbox(item)}
              />
            ))}
          </div>
        )}

        <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button
            className="btn-primary"
            onClick={() => navigate('/gallery')}
            style={{ gap: '0.75rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            View Full Gallery ({totalGalleryCount} more items)
          </button>
        </div>
      </div>

      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}
        >
          <button
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', width: '40px', height: '40px', fontSize: '1rem', cursor: 'pointer' }}
            onClick={() => setLightbox(null)}
          >✕</button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {lightbox.type === 'video' ? (
              <video src={lightbox.url} controls autoPlay style={{ maxWidth: '85vw', maxHeight: '78vh', objectFit: 'contain' }} />
            ) : (
              <img src={lightbox.url} alt={lightbox.title} style={{ maxWidth: '85vw', maxHeight: '78vh', objectFit: 'contain' }} />
            )}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase' }}>{lightbox.title}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function GalleryThumb({ item, className, style, onClick }) {
  return (
    <div className={className} style={style} onClick={onClick}>
      <img
        src={item.thumbnailUrl || item.url}
        alt={item.title}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {item.type === 'video' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(255, 68, 0, 0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 6px rgba(255,68,0,0.22), 0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </div>
        </div>
      )}
      <div className="gallery-overlay">
        <div className="gallery-label">{item.title}</div>
      </div>
      <div className="gallery-top-line" />
    </div>
  )
}