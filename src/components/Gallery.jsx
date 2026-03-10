import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMedia } from '../context/MediaContext'

// Layout classes: slot 0 = wide+tall (big left), slot 5 = wide (bottom)
const gridClasses = ['wide tall', '', '', '', '', 'wide']

export default function Gallery() {
  const { homeMedia, generalMedia } = useMedia()
  const navigate  = useNavigate()
  const [lightbox, setLightbox] = useState(null)

  // homeMedia is already sorted by homeSlot (0–5) from context
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

        {/* View More button */}
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

      {/* Lightbox */}
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
              <span style={{ color: '#FF4400', fontSize: '0.8rem', textTransform: 'capitalize', fontFamily: "'Oswald', sans-serif" }}>{lightbox.category}</span>
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
