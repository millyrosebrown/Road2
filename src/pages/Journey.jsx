import { useState, useEffect } from 'react'
import { ArrowRight, MapPin, Navigation, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Journey() {
    const { profile, updateProfile, loading: authLoading } = useAuth()
    const [destination, setDestination] = useState('')
    const [saving, setSaving] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)

    // Check if user has an ultimate goal defined
    useEffect(() => {
        // Only show onboarding if we've finished loading and there's definitely no goal
        if (!authLoading && profile && !profile.ultimateGoal) {
            setShowOnboarding(true)
        } else {
            setShowOnboarding(false)
        }
    }, [profile, authLoading])

    const handleSetDestination = async (e) => {
        e.preventDefault()
        if (!destination.trim()) return

        setSaving(true)
        try {
            await updateProfile({ ultimateGoal: destination })
            setShowOnboarding(false)
        } catch (error) {
            console.error('Error saving destination:', error)
        } finally {
            setSaving(false)
        }
    }

    // Show a clean loading state instead of placeholders
    if (authLoading) {
        return (
            <div className="journey-map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={40} style={{ color: 'var(--navy-primary)', marginBottom: 'var(--spacing-4)' }} />
                    <p style={{ color: 'var(--navy-primary)', fontWeight: 500 }}>Loading your journey...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="journey-map-container">
            {/* Display persistent header if goal exists */}
            {profile?.ultimateGoal && (
                <div className="destination-header">
                    <div className="destination-card">
                        <div className="destination-dot" />
                        <div className="destination-info">
                            <span className="destination-label">Your Destination</span>
                            <div className="destination-text">{profile.ultimateGoal}</div>
                        </div>
                        <Navigation size={20} style={{ color: 'var(--navy-primary)' }} />
                    </div>
                </div>
            )}

            {/* Prompt for destination */}
            {showOnboarding && (
                <div className="onboarding-overlay">
                    <div className="onboarding-content">
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <MapPin size={48} color="var(--teal-light)" />
                        </div>
                        <h1 className="onboarding-title">Welcome to your recovery journey</h1>
                        <p className="onboarding-subtitle">Where does your Road lead 2?</p>

                        <form onSubmit={handleSetDestination} className="map-input-group" style={{ border: saving ? '2px solid var(--teal-primary)' : 'none' }}>
                            <input
                                type="text"
                                className="map-input"
                                placeholder="Enter your ultimate goal..."
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                disabled={saving}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="map-input-btn"
                                disabled={saving || !destination.trim()}
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={24} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Map background is handled by CSS journey-map-container */}
            {!showOnboarding && !profile?.ultimateGoal && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-8)' }}>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.8)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
                        <p>No destination set. Please check your profile or reload.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
