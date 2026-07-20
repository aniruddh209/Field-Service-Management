import { Wrench, Users, ClipboardList, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const features = [
    {
      icon: <ClipboardList size={28} />,
      title: 'Service Requests',
      description: 'Create and track service requests from customers efficiently.'
    },
    {
      icon: <Users size={28} />,
      title: 'Technician Management',
      description: 'Assign and manage field technicians for on-site services.'
    },
    {
      icon: <Wrench size={28} />,
      title: 'Job Tracking',
      description: 'Monitor job progress from assignment to completion.'
    }
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home__hero">
        <div className="container">
          <span className="home__badge">🚀 Field Service Management</span>
          <h1 className="home__title">
            Manage Your <span className="home__highlight">Field Service</span> Operations
          </h1>
          <p className="home__subtitle">
            Streamline service requests, assign technicians, and track jobs — all in one place.
          </p>
          <div className="home__actions">
            <Link to="/" className="home__btn home__btn--primary">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/" className="home__btn home__btn--secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home__features">
        <div className="container">
          <h2 className="home__section-title">Core Features</h2>
          <div className="home__features-grid">
            {features.map((feature, index) => (
              <div key={index} className="home__feature-card">
                <div className="home__feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home__footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Field Service. Built with React + Vite.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
