import { useState, useEffect } from 'react'
import { ArrowRight, Flag, Navigation, Search, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Journey() {
    const { profile, updateProfile, loading: authLoading, user, isAuthenticated } = useAuth()
    const [destinationInput, setDestinationInput] = useState('')
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    // 1. Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    // Derived state for onboarding
    const hasGoal = profile?.ultimateGoal && profile.ultimateGoal.trim() !== ''
    const showOnboarding = isAuthenticated && !authLoading && !hasGoal

    const handleSetDestination = async (e) => {
        e.preventDefault()
        if (!destinationInput.trim()) return

        setSaving(true)
        try {
            await updateProfile({ ultimateGoal: destinationInput })
        } catch (error) {
            console.error('Error saving goal:', error)
        } finally {
            setSaving(false)
        }
    }

    // High-end loading experience
    if (authLoading) {
        return (
            <div className="journey-map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--navy-primary)" />
                    <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--navy-primary)', fontWeight: 600 }}>Locating Journey...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="journey-map-container">
            {/* 1. THE GOAL HEADER (Only if goal exists) */}
            {hasGoal && (
                <div className="destination-header" style={{ opacity: 1, visibility: 'visible', zIndex: 100 }}>
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

            {/* 2. THE ONBOARDING PROMPT (Only if goal is missing) */}
            {showOnboarding && (
                <div className="onboarding-overlay" style={{ zIndex: 1000 }}>
                    <div className="onboarding-content">
                        <div style={{ marginBottom: 'var(--spacing-8)' }}>
                            <div className="nav-icon-wrapper" style={{
                                margin: '0 auto',
                                background: 'var(--gradient-teal)',
                                width: 80,
                                height: 80,
                                marginBottom: 'var(--spacing-4)',
                                boxShadow: '0 10px 20px rgba(20, 184, 166, 0.3)'
                            }}>
                                <Navigation size={40} color="white" />
                            </div>
                            <h1 className="onboarding-title">Welcome to your recovery journey</h1>
                            <p className="onboarding-subtitle" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                                Where does your Road lead 2?
                            </p>
                        </div>

                        <form onSubmit={handleSetDestination} className="map-input-group">
                            <div style={{ paddingLeft: 'var(--spacing-3)', color: 'var(--text-muted)' }}>
                                <Search size={22} />
                            </div>
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

            {/* 3. MAP VIEW CONTENT (If goal is set) */}
            {hasGoal && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div className="glass-card" style={{
                        margin: 'var(--spacing-6)',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.95)',
                        padding: 'var(--spacing-6)',
                        borderRadius: 'var(--radius-2xl)',
                        boxShadow: 'var(--shadow-lg)',
                        pointerEvents: 'auto'
                    }}>
                        <div style={{ color: 'var(--teal-primary)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: 'var(--spacing-1)', fontWeight: 800 }}>VITAL TRACKING</div>
                        <p style={{ color: 'var(--navy-primary)', fontSize: '1rem' }}>
                            You're on the road 2: <br />
                            <strong style={{ fontSize: '1.25rem' }}>{profile.ultimateGoal}</strong>
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
