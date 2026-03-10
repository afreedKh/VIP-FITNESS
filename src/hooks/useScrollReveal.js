import { useEffect } from 'react'

/**
 * Attaches an IntersectionObserver to all .reveal / .reveal-left / .reveal-right elements.
 * Pass a `deps` array to re-scan the DOM when new elements are added dynamically
 * (e.g. after Firebase adds items to the gallery).
 */
export function useScrollReveal(deps = []) {
  useEffect(() => {
    // Small timeout so the DOM has fully painted the new elements before we observe them
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible')
              observer.unobserve(e.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
      )
      els.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
    }, 50)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}