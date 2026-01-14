import { useState, useEffect } from 'react'
import { ArrowRight, Flag, Navigation, Search, Loader2, Play, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { goalsService } from '../lib/services'

export default function Journey() {
    const { profile, updateProfile, loading: authLoading, user, isAuthenticated } = useAuth()
    const [destinationInput, setDestinationInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [showWeeklySetup, setShowWeeklySetup] = useState(false)
    const [weeklyGoals, setWeeklyGoals] = useState(['', '', ''])
    const navigate = useNavigate()

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    // Derived states
    const hasDestination = profile?.ultimateGoal && profile.ultimateGoal.trim() !== ''
    const journeyStarted = profile?.journeyStarted || false
    const showOnboarding = isAuthenticated && !authLoading && !hasDestination

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

    const handleStartJourney = () => {
        setShowWeeklySetup(true)
    }

    const handleSaveWeeklyGoals = async () => {
        if (weeklyGoals.some(g => !g.trim())) {
            alert('Please fill in all 3 goals to improve upon weekly.')
            return
        }

        setSaving(true)
        try {
            // 1. Save goals to the goals collection
            for (const goalTitle of weeklyGoals) {
                await goalsService.createGoal(user.$id, {
                    title: goalTitle,
                    description: 'Weekly focus activity',
                    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    category: 'journey'
                })
            }

            // 2. Mark journey as started in profile
            await updateProfile({
                journeyStarted: true,
                currentWeek: 1
            })

            // Reset setup state
            setShowWeeklySetup(false)
        } catch (error) {
            console.error('Error during journey setup:', error)
            alert('Failed to save goals. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (authLoading) {
        return (
            <div className="journey-map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--navy-primary)" />
            </div>
        )
    }

    return (
        <div className="journey-map-container">
            {/* 1. PERSISTENT DESTINATION HEADER */}
            {hasDestination && (
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

            {/* 2. INITIAL ONBOARDING (SET DESTINATION) */}
            {showOnboarding && (
                <div className="onboarding-overlay">
                    <div className="onboarding-content">
                        <div className="nav-icon-wrapper" style={{ margin: '0 auto 1.5rem', background: 'var(--gradient-teal)', width: 80, height: 80 }}>
                            <Navigation size={40} color="white" />
                        </div>
                        <h1 className="onboarding-title">Welcome to your recovery journey</h1>
                        <p className="onboarding-subtitle">Where does your Road lead 2?</p>

                        <form onSubmit={handleSetDestination} className="map-input-group">
                            <div style={{ paddingLeft: '1rem', color: 'var(--text-muted)' }}><Search size={22} /></div>
                            <input
                                type="text"
                                className="map-input"
                                placeholder="e.g. Back on the football pitch"
                                value={destinationInput}
                                onChange={(e) => setDestinationInput(e.target.value)}
                                disabled={saving}
                                autoFocus
                            />
                            <button type="submit" className="map-input-btn" disabled={saving || !destinationInput.trim()}>
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. READY TO START STATE */}
            {hasDestination && !journeyStarted && !showWeeklySetup && (
                <div className="journey-overlay-center">
                    <div className="glass-card journey-start-card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--navy-primary)' }}>Are you ready to start your Road 2:</h2>
                        <div className="goal-highlight">{profile.ultimateGoal}</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '280px', margin: '0 auto 1.5rem' }}>
                            We'll start by setting 3 weekly activities to focus on.
                        </p>
                        <button className="btn btn-primary btn-full flex-center" onClick={handleStartJourney} style={{ gap: '0.5rem' }}>
                            <Play size={20} fill="currentColor" /> START JOURNEY
                        </button>
                    </div>
                </div>
            )}

            {/* 4. WEEKLY GOALS SETUP OVERLAY */}
            {showWeeklySetup && (
                <div className="onboarding-overlay">
                    <div className="onboarding-content setup-card">
                        <h2 className="setup-title">Weekly Focus</h2>
                        <p className="setup-subtitle">What 3 daily activities would you like to improve upon weekly?</p>

                        <div className="goal-inputs-container">
                            {weeklyGoals.map((goal, index) => (
                                <div key={index} className="goal-input-wrapper">
                                    <span className="goal-number">{index + 1}</span>
                                    <input
                                        type="text"
                                        className="setup-goal-input"
                                        placeholder={`Activity ${index + 1}...`}
                                        value={goal}
                                        onChange={(e) => {
                                            const newGoals = [...weeklyGoals]
                                            newGoals[index] = e.target.value
                                            setWeeklyGoals(newGoals)
                                        }}
                                        disabled={saving}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary btn-full flex-center"
                            onClick={handleSaveWeeklyGoals}
                            disabled={saving || weeklyGoals.some(g => !g.trim())}
                            style={{ marginTop: '1rem' }}
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> DONE</>}
                        </button>
                    </div>
                </div>
            )}

            {/* 5. ACTIVE JOURNEY ROAD MAP */}
            {journeyStarted && !showWeeklySetup && (
                <div className="journey-road-view">
                    {/* Arbitrary winding road SVG */}
                    <svg className="road-svg" viewBox="0 0 430 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M215 800C215 800 215 700 215 650C215 550 100 500 100 400C100 300 330 250 330 150C330 50 215 0 215 0"
                            stroke="var(--navy-primary)"
                            strokeWidth="40"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: 0.9 }}
                        />
                        <path
                            d="M215 800C215 800 215 700 215 650C215 550 100 500 100 400C100 300 330 250 330 150C330 50 215 0 215 0"
                            stroke="white"
                            strokeWidth="2"
                            strokeDasharray="10 10"
                        />
                    </svg>

                    {/* Week 1 Button */}
                    <div className="week-marker" style={{ bottom: '150px', left: '215px', transform: 'translateX(-50%)' }}>
                        <button className="week-btn active" onClick={() => navigate('/diary')}>
                            <span>Week 1</span>
                        </button>
                    </div>

                    <div className="road-info-overlay">
                        <div className="current-status-chip">WEEK 1: FOUNDATION</div>
                    </div>
                </div>
            )}
        </div>
    )
}
