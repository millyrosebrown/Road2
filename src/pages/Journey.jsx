import { useState, useEffect } from 'react'
import { ArrowRight, Flag, Navigation, Search, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Journey() {
    const { profile, updateProfile, loading: authLoading, user } = useAuth()
    const [destinationInput, setDestinationInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)

    // Robust check for the goal status
    useEffect(() => {
        if (!authLoading) {
            // If user is logged in but has no profile or no goal defined, show the prompt
            if (user && (!profile || !profile.ultimateGoal || profile.ultimateGoal.trim() === '')) {
                setShowOnboarding(true)
            } else {
                setShowOnboarding(false)
            }
        }
    }, [profile, authLoading, user])

    const handleSetDestination = async (e) => {
        e.preventDefault()
        if (!destinationInput.trim()) return

        setSaving(true)
        try {
            await updateProfile({ ultimateGoal: destinationInput })
            setShowOnboarding(false)
        } catch (error) {
            console.error('Error saving goal:', error)
            alert('We could not save your destination. Please check your connection.')
        } finally {
            setSaving(false)
        }
    }

    // High-end loading experience
    if (authLoading) {
        return (
            <div className="journey-map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={40} style={{ color: 'var(--navy-primary)' }} />
                    <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--navy-primary)', fontWeight: 500 }}>Finding your position...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="journey-map-container">
            {/* 1. SAVED STATE - The persistent goal at the top */}
            {profile?.ultimateGoal && !showOnboarding && (
                <div className="destination-header">
                    <div className="destination-card">
                        <div className="destination-dot" />
                        <div className="destination-info">
                            <span className="destination-label">Your Road2 Destination</span>
                            <div className="destination-text">{profile.ultimateGoal}</div>
                        </div>
                        <Flag size={20} style={{ color: 'var(--navy-primary)' }} />
                    </div>
                </div>
            )}

            {/* 2. ONBOARDING STATE - The Search-style Prompt */}
            {showOnboarding && (
                <div className="onboarding-overlay">
                    <div className="onboarding-content">
                        <div style={{ marginBottom: 'var(--spacing-8)' }}>
                            <div className="nav-icon-wrapper" style={{ margin: '0 auto', background: 'var(--gradient-teal)', width: 80, height: 80, marginBottom: 'var(--spacing-4)' }}>
                                <Navigation size={40} color="white" />
                            </div>
                            <h1 className="onboarding-title">Welcome to your recovery journey</h1>
                            <p className="onboarding-subtitle" style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9 }}>
                                Where does your Road lead 2?
                            </p>
                        </div>

                        <form onSubmit={handleSetDestination} className="map-input-group" style={{
                            background: 'white',
                            padding: 'var(--spacing-2)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ paddingLeft: 'var(--spacing-3)', color: 'var(--text-muted)' }}>
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                className="map-input"
                                placeholder="Enter your rehab outcome goal..."
                                value={destinationInput}
                                onChange={(e) => setDestinationInput(e.target.value)}
                                disabled={saving}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="map-input-btn"
                                disabled={saving || !destinationInput.trim()}
                                style={{ background: 'var(--navy-primary)' }}
                            >
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. ACTIVE JOURNEY BACKGROUND (Placeholder view when goal is set) */}
            {profile?.ultimateGoal && !showOnboarding && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card glass-card" style={{
                        margin: 'var(--spacing-6)',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid white'
                    }}>
                        <div style={{ color: 'var(--teal-primary)', marginBottom: 'var(--spacing-2)', fontWeight: 700 }}>LIVE TRACKING</div>
                        <p>You are currently on the road to: <br /><strong>{profile.ultimateGoal}</strong></p>
                    </div>
                </div>
            )}
        </div>
    )
}
