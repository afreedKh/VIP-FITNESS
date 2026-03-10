import { useState, useEffect } from 'react'

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = ['home', 'about', 'services', 'gallery', 'membership', 'contact']

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-inner">
        <div className="nav-logo" onClick={() => scrollTo('home')}>
          <span className="vip">VIP</span>
          <span className="fit">FITNESS</span>
        </div>
        <div className="nav-links">
          {navLinks.map((link) => (
            <a key={link} onClick={() => scrollTo(link)}>
              {link.charAt(0).toUpperCase() + link.slice(1)}
            </a>
          ))}
        </div>
        <button className="nav-cta" onClick={() => scrollTo('membership')}>Join Now</button>
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <a key={link} onClick={() => { scrollTo(link); setMenuOpen(false) }}>
            {link.charAt(0).toUpperCase() + link.slice(1)}
          </a>
        ))}
        <button className="mobile-cta" onClick={() => { scrollTo('membership'); setMenuOpen(false) }}>
          Join Now
        </button>
      </div>
    </nav>
  )
}
