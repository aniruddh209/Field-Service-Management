import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Star, Phone, ChevronRight } from 'lucide-react'
import { getTechnicians, createTechnician } from '../../services/technicianService.js'
import { getTechnicianStatus, statusBadgeClasses } from '../../utils/technicianHelpers.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { LoadingState, EmptyState } from '../../components/ui/PageStates.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Modal from '../../components/ui/Modal.jsx'
import TechnicianForm from '../../components/technicians/TechnicianForm.jsx'

function ManagementTechniciansPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [technicians, setTechnicians] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Modal & Notification state
  const [showAddModal, setShowAddModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const isManageAllowed = user?.role === 'Owner' || user?.role === 'Manager'

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const data = await getTechnicians()
      setTechnicians(data)
      setIsLoading(false)
    }
    load()
  }, [])

  // Auto-suggest employee code TECH-00X
  const nextEmployeeCode = (() => {
    const nextNum = technicians.length + 1
    return `TECH-${String(nextNum).padStart(3, '0')}`
  })()

  const handleAddSubmit = async (formData) => {
    try {
      const newTech = await createTechnician(formData)
      setTechnicians(prev => [newTech, ...prev])
      setShowAddModal(false)
      
      // Show success toast
      setSuccessMessage('Technician added successfully')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      console.error(err)
      throw err // Let the form handle local error message display
    }
  }

  const filtered = technicians.filter(t => {
    const status = getTechnicianStatus(t)
    const matchesStatus = statusFilter === 'All' || status === statusFilter

    const matchesSearch = search === '' ||
      (t.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.employeeCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.phone || '').includes(search)

    return matchesSearch && matchesStatus
  })

  if (isLoading) return <PageContainer><LoadingState message="Loading technicians..." /></PageContainer>

  return (
    <PageContainer>
      {/* Toast Notification */}
      {successMessage && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: 'var(--color-success)', color: 'white',
          padding: '12px 24px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--dropdown-shadow)', fontSize: '0.88rem',
          fontWeight: 600, animation: 'fadeIn 0.2s ease'
        }}>
          {successMessage}
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div className="page-header__info">
          <h1 className="page-header__title" style={{ fontSize: '1.6rem', fontWeight: 700 }}>Technicians</h1>
          <p className="page-header__subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Manage your field service team</p>
        </div>
        {isManageAllowed && technicians.length > 0 && (
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            + Add Technician
          </button>
        )}
      </div>

      {technicians.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <Users size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No technicians yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
            Add your first technician to start assigning field service jobs.
          </p>
          {isManageAllowed && (
            <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
              + Add Technician
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="filters-bar__search">
              <Search size={16} className="filters-bar__search-icon" />
              <input 
                className="filters-bar__search-input" 
                placeholder="Search technicians..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <select 
              className="form-select" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              style={{ maxWidth: 200 }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Cards Grid / Empty Search Results */}
          {filtered.length === 0 ? (
            <EmptyState 
              icon={Users} 
              title="No technicians found" 
              message="Try changing your search or status filter." 
            />
          ) : (
            <div className="cards-grid">
              {filtered.map(tech => {
                const status = getTechnicianStatus(tech)
                const badgeClass = statusBadgeClasses[status] || 'badge--pending'

                return (
                  <div 
                    key={tech.id} 
                    className="data-card" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => navigate(`/management/technicians/${tech.id}`)}
                  >
                    <div className="data-card__header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          width: 40, height: 40, borderRadius: '50%', 
                          background: 'var(--color-primary)', color: 'white', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 
                        }}>
                          {tech.fullName ? tech.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tech.fullName}</h3>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{tech.employeeCode}</span>
                        </div>
                      </div>
                      <span className={`badge ${badgeClass}`}>{status}</span>
                    </div>
                    
                    <div className="data-card__body">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{tech.specialization}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Star size={13} style={{ color: 'var(--color-warning)' }} />
                          <span>
                            {tech.rating > 0 ? `${tech.rating} rating` : 'New'} · Active Jobs: {tech.activeJobs}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Phone size={13} /> <span>{tech.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="data-card__footer">
                      <button className="btn btn--ghost btn--sm">
                        View Profile <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Add Technician Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Add New Technician"
        size="lg"
      >
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          Create a technician profile and prepare access for field service jobs.
        </p>
        <TechnicianForm 
          mode="create" 
          onSubmit={handleAddSubmit} 
          onCancel={() => setShowAddModal(false)}
          nextEmployeeCode={nextEmployeeCode}
        />
      </Modal>
    </PageContainer>
  )
}

export default ManagementTechniciansPage