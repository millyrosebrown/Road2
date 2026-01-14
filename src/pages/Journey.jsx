import { useState, useEffect } from 'react'
import { ArrowRight, Flag, Navigation, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Journey() {
    const { profile, updateProfile, loading: authLoading } = useAuth()
    const [destinationInput, setDestinationInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)

    // Ensure we check the profile as soon as it's available
    useEffect(() => {
        if (!authLoading && profile) {
            // Show prompt if the ultimate goal is empty or null
            if (!profile.ultimateGoal || profile.ultimateGoal.trim() === '') {
                setShowOnboarding(true)
            } else {
                setShowOnboarding(false)
            }
        }
    }, [profile, authLoading])

    const handleSetDestination = async (e) => {
        e.preventDefault()
        if (!destinationInput.trim()) return

        setSaving(true)
        try {
            await updateProfile({ ultimateGoal: destinationInput })
            setShowOnboarding(false)
        } catch (error) {
            console.error('Error saving destination:', error)
            alert('Could not save your goal. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (authLoading) {
        return (
            <div className="journey-map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={32} color="var(--navy-primary)" />
            </div>
        )
    }

    return (
        <div className="journey-map-container">
            {/* 1. Persistent Goal at the Top */}
            {profile?.ultimateGoal && !showOnboarding && (
                <div className="destination-header">
                    <div className="destination-card">
                        <div className="destination-dot" />
                        <div className="destination-info">
                            <span className="destination-label">Your Road2 Goal</span>
                            <div className="destination-text">{profile.ultimateGoal}</div>
                        </div>
                        <Flag size={20} style={{ color: 'var(--navy-primary)' }} />
                    </div>
                </div>
            )}

            {/* 2. Onboarding Prompt (The Rehab "Destination") */}
            {showOnboarding && (
                <div className="onboarding-overlay">
                    <div className="onboarding-content">
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <Flag size={48} color="var(--teal-light)" />
                        </div>
                        <h1 className="onboarding-title">Welcome to your recovery journey</h1>
                        <p className="onboarding-subtitle">Where does your Road lead 2?</p>

                        <form onSubmit={handleSetDestination} className="map-input-group">
                            <input
                                type="text"
                                className="map-input"
                                placeholder="e.g. Back on the football pitch"
                                value={destinationInput}
                                onChange={(e) => setDestinationInput(e.target.value)}
                                disabled={saving}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="map-input-btn"
                                disabled={saving || !destinationInput.trim()}
                            >
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Empty State (If goal set but no map data yet) */}
            {profile?.ultimateGoal && !showOnboarding && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ padding: 'var(--spacing-6)', textAlign: 'center', maxWidth: '80%' }}>
                        <Navigation size={32} color="var(--navy-primary)" style={{ marginBottom: 'var(--spacing-3)' }} />
                        <h3>You're on the right track</h3>
                        <p>Keep logging your exercises to move closer to your goal.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
