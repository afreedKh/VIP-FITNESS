const stats = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    val: '500+', lbl: 'Active Members'
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    val: '4.8', lbl: 'Google Rating'
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    val: '100+', lbl: 'Equipment'
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
    val: '16+', lbl: 'Hours Daily'
  },
]

export default function About() {
  return (
    <section id="about" className="section section-dark">
      <div className="container">
        <div className="about-grid">
          <div className="about-img-wrap reveal-left">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200"
              alt="VIP Fitness Premium Interior"
            />
            <div className="about-img-accent" />
            <div className="about-img-badge">
              <div className="badge-num">4.8</div>
              <div>
                <div className="badge-stars">{[...Array(5)].map((_, i) => <span key={i}>★</span>)}</div>
                <div className="badge-sub">Google Reviews</div>
              </div>
            </div>
          </div>
          <div className="reveal-right">
            <div className="about-text-top">
              <div className="about-section-label">
                <div className="line" />
                <span>About VIP Fitness</span>
              </div>
              <h2 className="about-h2">
                Mukkam's Most Trusted<br />
                <span className="accent">Fitness Destination</span>
              </h2>
              <p className="about-p">
                VIP Fitness is one of the most trusted gyms in Mukkam with modern equipment, expert trainers, and personalized fitness programs designed to help you achieve your goals.
              </p>
              <p className="about-p">
                Whether you're starting your fitness journey or pushing to the next level, our state-of-the-art facility and certified trainers are here to guide you every step of the way. We offer a premium experience unlike anything else in Kozhikode.
              </p>
            </div>
            <div className="about-stats">
              {stats.map((s) => (
                <div className="stat-card" key={s.lbl}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
