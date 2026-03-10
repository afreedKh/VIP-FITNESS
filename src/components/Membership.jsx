const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const openWhatsApp = (msg) => {
  window.open('https://wa.me/919526711773?text=' + encodeURIComponent(msg), '_blank')
}

const plans = [
  {
    name: 'Silver',
    desc: 'Perfect for beginners starting their fitness journey.',
    price: '1,500',
    period: '/month',
    popular: false,
    features: ['Full Gym Access','Cardio Zone','General Trainer Support','Locker Room Access','Fitness Assessment'],
    ctaLabel: 'Get Started',
    ctaMsg: 'Hi! I am interested in the Silver membership plan at VIP Fitness Mukkam.',
    delay: '0s',
  },
  {
    name: 'Gold',
    desc: 'Our most popular plan for serious fitness enthusiasts.',
    price: '2,500',
    period: '/month',
    popular: true,
    features: ['All Silver Benefits','Personal Trainer (2 sessions/week)','Custom Diet Plan','Steam Bath Access','Priority Equipment Access','Monthly Progress Review'],
    ctaLabel: 'Join Gold',
    ctaMsg: 'Hi! I am interested in the Gold membership plan at VIP Fitness Mukkam.',
    delay: '0.15s',
  },
  {
    name: 'Elite',
    desc: 'The ultimate transformation package for elite results.',
    price: '6,000',
    period: '/3 months',
    popular: false,
    features: ['All Gold Benefits','Dedicated Personal Trainer','Nutrition Consulting','VIP Merchandise Kit','Unlimited Group Classes','Injury Prevention Guidance'],
    ctaLabel: 'Go Elite',
    ctaMsg: 'Hi! I am interested in the Elite membership plan at VIP Fitness Mukkam.',
    delay: '0.3s',
  },
]

export default function Membership() {
  return (
    <section id="membership" className="section section-surface">
      <div className="container">
        <div className="reveal">
          <div className="section-label">
            <div className="line" />
            <span>Membership Plans</span>
            <div className="line" />
          </div>
          <h2 className="section-title">Choose Your<br /><span className="accent">Fitness Plan</span></h2>
          <p className="section-subtitle" style={{ marginTop: '0.75rem' }}>
            Flexible membership plans designed to suit every fitness goal and budget.
          </p>
        </div>
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`plan-card reveal${plan.popular ? ' popular' : ''}`}
              style={{ transitionDelay: plan.delay }}
            >
              {plan.popular && <div className="plan-badge">★ Most Popular ★</div>}
              <div className={`plan-name${plan.popular ? ' accent' : ''}`}>{plan.name}</div>
              <p className="plan-desc">{plan.desc}</p>
              <div className="plan-price">
                <span className="plan-currency">₹</span>
                <span className="plan-amount">{plan.price}</span>
                <span className="plan-period">{plan.period}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((f) => (
                  <li key={f} className="plan-feature">
                    <span className="check-icon"><CheckIcon /></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`plan-cta ${plan.popular ? 'primary' : 'secondary'}`}
                onClick={() => openWhatsApp(plan.ctaMsg)}
              >
                {plan.ctaLabel}
              </button>
            </div>
          ))}
        </div>
        <p className="plans-note">All plans include locker room access and free parking. Contact us on WhatsApp for special offers.</p>
      </div>
    </section>
  )
}
