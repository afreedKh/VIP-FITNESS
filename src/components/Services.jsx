const services = [
  {
    title: 'Strength Training',
    desc: 'Build raw power and muscle with our comprehensive strength training programs. Barbells, dumbbells, cables — everything you need.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5h11M6.5 17.5h11M3 12h18"/></svg>,
  },
  {
    title: 'Weight Loss Programs',
    desc: 'Structured fat-burning programs combining cardio, HIIT, and nutrition guidance to help you reach your ideal weight fast.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>,
  },
  {
    title: 'Personal Training',
    desc: 'One-on-one sessions with certified personal trainers who design custom workouts tailored to your specific goals.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    title: 'Muscle Building',
    desc: 'Hypertrophy-focused training with expert guidance on progressive overload, recovery, and optimal nutrition timing.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
  {
    title: 'Cardio Fitness',
    desc: 'Improve endurance and heart health with our wide range of cardio equipment — treadmills, bikes, ellipticals, and more.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  },
  {
    title: 'Online Fitness Classes',
    desc: 'Train from anywhere with our live and recorded online fitness classes led by expert VIP Fitness trainers.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
]

export default function Services() {
  return (
    <section id="services" className="section section-surface">
      <div className="container">
        <div className="reveal">
          <div className="section-label">
            <div className="line" />
            <span>What We Offer</span>
            <div className="line" />
          </div>
          <h2 className="section-title">Training Programs &amp;<br /><span className="accent">Services</span></h2>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card reveal" key={s.title} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-title">{s.title}</div>
              <p className="service-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
