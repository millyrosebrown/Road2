import { useState, useEffect } from 'react'
import { ArrowRight, Flag, Navigation, Search, Loader2, Play, CheckCircle2, Lock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { goalsService } from '../lib/services'

export default function Journey() {
    const { profile, updateProfile, loading: authLoading, user, isAuthenticated } = useAuth()
    const [destinationInput, setDestinationInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [showWeeklySetup, setShowWeeklySetup] = useState(false)
    const [weeklyGoals, setWeeklyGoals] = useState(['', '', ''])
    const [localJourneyStarted, setLocalJourneyStarted] = useState(false)
    const [hasExistingGoals, setHasExistingGoals] = useState(false)
    const navigate = useNavigate()
    const scrollRef = useState(null)

    // 1. Check for existing goals to determine journey status
    useEffect(() => {
        const checkGoals = async () => {
            if (user?.$id) {
                try {
                    const existing = await goalsService.getGoals(user.$id)
                    setHasExistingGoals(existing.total > 0)
                } catch (error) {
                    console.error('Error fetching existing goals:', error)
                }
            }
        }
        if (isAuthenticated && !authLoading) {
            checkGoals()
        }
    }, [user, isAuthenticated, authLoading])

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    // 3. Scroll to bottom of road on load
    useEffect(() => {
        if (journeyStarted) {
            const container = document.querySelector('.roadmap-scroll-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }, [journeyStarted]);

    // Derived states
    const hasDestination = profile?.ultimateGoal && profile.ultimateGoal.trim() !== ''
    // Journey is started if we have existing goals OR if we just started it locally
    const journeyStarted = hasExistingGoals || localJourneyStarted
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

            // 2. Mark journey as started locally and in DB
            // Note: We use valid fields only to avoid errors
            await updateProfile({
                currentWeek: 1
            })

            // Success!
            setHasExistingGoals(true)
            setLocalJourneyStarted(true)
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
                <div className="onboarding-overlay" style={{ zIndex: 2000 }}>
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
                    <div className="glass-card journey-start-card" style={{ zIndex: 100 }}>
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
                <div className="onboarding-overlay" style={{ zIndex: 3000 }}>
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
                <div className="roadmap-scroll-container">
                    <div className="roadmap-road-layer">
                        <div className="road-top-fade" />

                        {/* Winding Road SVG */}
                        <svg className="road-svg-full" viewBox="0 0 430 1600" preserveAspectRatio="none">
                            <path
                                d="M215,1550 C215,1550 215,1450 215,1400 C215,1300 100,1250 100,1150 C100,1050 330,1000 330,900 C330,800 100,750 100,650 C100,550 330,500 330,400 C330,300 215,250 215,150 L215,50"
                                stroke="var(--navy-primary)"
                                strokeWidth="50"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <path
                                d="M215,1550 C215,1550 215,1450 215,1400 C215,1300 100,1250 100,1150 C100,1050 330,1000 330,900 C330,800 100,750 100,650 C100,550 330,500 330,400 C330,300 215,250 215,150 L215,50"
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth="2"
                                strokeDasharray="15, 20"
                                fill="none"
                            />
                        </svg>

                        {/* Weekly Nodes */}
                        <div className="road-nodes-layer">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((weekNum) => {
                                // Calculate position based on a zigzag pattern matching the path
                                let left = "50%";
                                let bottom = (weekNum - 1) * 190 + 100; // Evenly spaced

                                if (weekNum === 2 || weekNum === 6) left = "23%";
                                if (weekNum === 4 || weekNum === 8) left = "77%";
                                if (weekNum === 1 || weekNum === 3 || weekNum === 5 || weekNum === 7) left = "50%";

                                // Adjust for the specific path curve
                                if (weekNum === 2) left = "25%";
                                if (weekNum === 3) left = "50%"; // Midpoint
                                if (weekNum === 4) left = "75%";
                                if (weekNum === 5) left = "25%";
                                if (weekNum === 6) left = "75%";
                                if (weekNum === 7) left = "50%";
                                if (weekNum === 8) left = "50%";

                                // Simpler zigzag for predictability
                                const positions = [
                                    { x: 50, y: 1510 }, // Week 1 (Bottom)
                                    { x: 23, y: 1300 }, // Week 2
                                    { x: 50, y: 1100 }, // Week 3
                                    { x: 77, y: 900 },  // Week 4
                                    { x: 23, y: 700 },  // Week 5
                                    { x: 77, y: 500 },  // Week 6
                                    { x: 50, y: 300 },  // Week 7
                                    { x: 50, y: 100 }   // Week 8 (Top)
                                ];

                                const pos = positions[weekNum - 1];
                                const isLocked = weekNum > (profile?.currentWeek || 1);
                                const isActive = weekNum === (profile?.currentWeek || 1);

                                return (
                                    <div
                                        key={weekNum}
                                        className="week-node"
                                        style={{ left: `${pos.x}%`, top: `${pos.y}px` }}
                                    >
                                        <button
                                            className={`week-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                            onClick={() => !isLocked && navigate('/diary')}
                                            disabled={isLocked}
                                        >
                                            <span>W{weekNum}</span>
                                            {isLocked && (
                                                <div className="lock-overlay">
                                                    <Lock size={12} />
                                                </div>
                                            )}
                                        </button>
                                        <span className="week-label">Week {weekNum}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
