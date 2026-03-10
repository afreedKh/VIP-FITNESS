import Navbar       from '../components/Navbar'
import Hero         from '../components/Hero'
import About        from '../components/About'
import Services     from '../components/Services'
import Gallery      from '../components/Gallery'
import Membership   from '../components/Membership'
import Reviews      from '../components/Reviews'
import Timings      from '../components/Timings'
import Location     from '../components/Location'
import Contact      from '../components/Contact'
import Footer       from '../components/Footer'
import WhatsAppFloat from '../components/WhatsAppFloat'
import { useScrollReveal } from '../hooks/useScrollReveal'

const Divider = () => <div className="divider" />

export default function HomePage() {
  useScrollReveal()
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Divider />
      <Services />
      <Divider />
      <Gallery />
      <Divider />
      <Membership />
      <Divider />
      <Reviews />
      <Divider />
      <Timings />
      <Divider />
      <Location />
      <Divider />
      <Contact />
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
