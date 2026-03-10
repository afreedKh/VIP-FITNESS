export default function Location() {
  return (
    <section id="location" className="section section-dark">
      <div className="container">
        <div className="reveal">
          <div className="section-label">
            <div className="line" /><span>Find Us</span><div className="line" />
          </div>
          <h2 className="section-title">Our <span className="accent">Location</span></h2>
        </div>
        <div className="location-grid" style={{ marginTop: '4rem' }}>
          <div className="loc-info reveal-left">
            <div className="loc-card">
              <div className="loc-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="loc-label">Address</div>
              <div className="loc-val">VIP FITNESS<br />Mukkam, Kozhikode<br />Kerala – 673602<br />India</div>
            </div>
            <div className="loc-card">
              <div className="loc-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91A16 16 0 0 0 14.09 15.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="loc-label">Contact</div>
              <div className="loc-val"><a href="tel:+919526711773">+91 9526711773</a></div>
            </div>
            <a
              href="https://maps.google.com/?q=VIP+Fitness+Mukkam+Kozhikode+Kerala"
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Get Directions
            </a>
          </div>
          <div className="map-wrap reveal-right">
            <div className="map-top-bar" />
            <iframe
              title="VIP Fitness Location"
              src="https://maps.google.com/maps?q=Mukkam+Kozhikode+Kerala+673602&t=&z=14&ie=UTF8&iwloc=&output=embed"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ filter: 'grayscale(80%) invert(90%) contrast(90%)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
