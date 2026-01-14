import { useState, useEffect } from 'react'
import { ArrowRight, MapPin, Navigation } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Journey() {
    const { profile, updateProfile } = useAuth()
    const [destination, setDestination] = useState('')
    const [loading, setLoading] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)

    // Check if user has an ultimate goal
    useEffect(() => {
        if (profile && !profile.ultimateGoal) {
            setShowOnboarding(true)
        } else {
            setShowOnboarding(false)
        }
    }, [profile])

    const handleSetDestination = async (e) => {
        e.preventDefault()
        if (!destination.trim()) return

        setLoading(true)
        try {
            await updateProfile({ ultimateGoal: destination })
            setShowOnboarding(false)
        } catch (error) {
            console.error('Error saving destination:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="journey-map-container">
            {/* Destination Header */}
            {profile?.ultimateGoal && (
                <div className="destination-header">
                    <div className="destination-card">
                        <div className="destination-dot" />
                        <div className="destination-info">
                            <span className="destination-label">Your Destination</span>
                            <div className="destination-text">{profile.ultimateGoal}</div>
                        </div>
                        <Navigation size={20} className="text-navy" style={{ color: 'var(--navy-primary)' }} />
                    </div>
                </div>
            )}

            {/* Onboarding Overlay */}
            {showOnboarding && (
                <div className="onboarding-overlay">
                    <div className="onboarding-content">
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <MapPin size={48} color="var(--teal-light)" />
                        </div>
                        <h1 className="onboarding-title">Welcome to your recovery journey</h1>
                        <p className="onboarding-subtitle">Where does your Road lead 2?</p>
                        
                        <form onSubmit={handleSetDestination} className="map-input-group">
                            <input
                                type="text"
                                className="map-input"
                                placeholder="e.g. Back on the football pitch"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                            <button 
                                type="submit" 
                                className="map-input-btn"
                                disabled={loading || !destination.trim()}
                            >
                                <ArrowRight size={24} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Map View (Placeholder for now) */}
            <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                paddingTop: '80px' 
            }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.8)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
                    <p>Your recovery route is being calculated...</p>
                    <div style={{ 
                        marginTop: 'var(--spacing-4)',
                        height: '4px',
                        width: '100px',
                        background: 'var(--bg-secondary)',
                        margin: 'var(--spacing-4) auto',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ 
                            height: '100%', 
                            width: '40%', 
                            background: 'var(--navy-primary)',
                            borderRadius: 'var(--radius-full)'
                         }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
