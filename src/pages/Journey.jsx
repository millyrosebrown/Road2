import { useState, useEffect } from 'react'
import { ArrowRight, Flag, Navigation, Search, Loader2, Play, CheckCircle2, Lock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { goalsService, journeyService } from '../lib/services'

export default function Journey() {
    const { profile, updateProfile, loading: authLoading, user, isAuthenticated } = useAuth()
    const [destinationInput, setDestinationInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [showWeeklySetup, setShowWeeklySetup] = useState(false)
    const [weeklyGoals, setWeeklyGoals] = useState(['', '', ''])
    const [localJourneyStarted, setLocalJourneyStarted] = useState(false)
    const [hasExistingGoals, setHasExistingGoals] = useState(false)
    const [journeyLoading, setJourneyLoading] = useState(true) // Prevents flash while checking
    const navigate = useNavigate()

    // Derived states
    const hasDestination = profile?.ultimateGoal && profile.ultimateGoal.trim() !== ''
    // Journey is started if we have existing goals OR if we just started it locally
    const journeyStarted = hasExistingGoals || localJourneyStarted
    // Only show onboarding after loading is complete and user has no destination
    const showOnboarding = isAuthenticated && !authLoading && !journeyLoading && !hasDestination

    // 1. Check for existing goals to determine journey status
    useEffect(() => {
        const checkJourney = async () => {
            if (user?.$id) {
                try {
                    const progress = await journeyService.getProgress(user.$id)
                    if (progress && progress.weeklyGoal1) {
                        setHasExistingGoals(true)
                        setLocalJourneyStarted(true)
                    }
                } catch (error) {
                    console.error('Error fetching journey progress:', error)
                } finally {
                    setJourneyLoading(false)
                }
            } else {
                setJourneyLoading(false)
            }
        }
        if (isAuthenticated && !authLoading) {
            checkJourney()
        } else if (!authLoading) {
            setJourneyLoading(false)
        }
    }, [user, isAuthenticated, authLoading])

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    // 3. Scroll to current/active week on load
    useEffect(() => {
        if (journeyStarted) {
            const currentWeek = profile?.currentWeek || 1
            // Find the active week element and scroll it into view
            const activeWeekElement = document.querySelector(`[data-week="${currentWeek}"]`)
            if (activeWeekElement) {
                activeWeekElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [journeyStarted, profile?.currentWeek]);

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
            // 1. Save goals to the journey document
            await journeyService.saveProgress(user.$id, {
                ultimateGoal: profile.ultimateGoal,
                currentWeek: 1,
                weeklyGoal1: weeklyGoals[0],
                weeklyGoal2: weeklyGoals[1],
                weeklyGoal3: weeklyGoals[2]
            })

            // 2. Also save to goals collection for legacy/daily tracking if needed
            for (const goalTitle of weeklyGoals) {
                await goalsService.createGoal(user.$id, {
                    title: goalTitle,
                    description: 'Weekly focus activity',
                    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    category: 'journey'
                })
            }

            // 3. Mark journey as started locally
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

    if (authLoading || journeyLoading) {
        return (
            <div className="journey-map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--navy-primary)" />
            </div>
        )
    }

    return (
        <div className="journey-map-container">
            {/* 1. INITIAL ONBOARDING (SET DESTINATION) */}
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

            {/* 2. READY TO START STATE */}
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

            {/* 3. WEEKLY GOALS SETUP OVERLAY */}
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

            {/* 4. ACTIVE JOURNEY ROAD MAP */}
            {journeyStarted && !showWeeklySetup && (
                <div className="roadmap-scroll-container">
                    {/* Banner Image */}
                    <div className="journey-banner-container">
                        <img
                            src="/src/assets/road2-banner.png"
                            alt="Road2 Rehabilitation"
                            className="journey-banner-image"
                        />
                        {/* Destination text underneath banner */}
                        {hasDestination && (
                            <div className="destination-mini">
                                <span className="destination-mini-label">Your Road2 Destination</span>
                                <span className="destination-mini-text">"{profile.ultimateGoal}"</span>
                            </div>
                        )}
                    </div>

                    <div className="roadmap-road-layer">
                        {/* Winding Road SVG - adjusted to connect with banner */}
                        <svg className="road-svg-full" viewBox="0 0 430 1600" preserveAspectRatio="none">
                            <path
                                d="M340,0 C340,50 340,100 330,150 C300,250 100,300 100,400 C100,500 330,550 330,650 C330,750 100,800 100,900 C100,1000 330,1050 330,1150 C330,1250 215,1300 215,1400 C215,1450 215,1500 215,1550"
                                stroke="var(--navy-primary)"
                                strokeWidth="50"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <path
                                d="M340,0 C340,50 340,100 330,150 C300,250 100,300 100,400 C100,500 330,550 330,650 C330,750 100,800 100,900 C100,1000 330,1050 330,1150 C330,1250 215,1300 215,1400 C215,1450 215,1500 215,1550"
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

                                // Week positions matching the road from banner (top-right) to bottom (center)
                                // Road path: M340,0 → curves to left (100) → right (330) → etc. → ends at center (215),1550
                                const positions = [
                                    { x: 50, y: 1510 }, // Week 1 (Bottom center)
                                    { x: 50, y: 1350 }, // Week 2
                                    { x: 77, y: 1100 }, // Week 3 (right side)
                                    { x: 23, y: 900 },  // Week 4 (left side)
                                    { x: 77, y: 700 },  // Week 5 (right side)
                                    { x: 23, y: 500 },  // Week 6 (left side)
                                    { x: 77, y: 300 },  // Week 7 (right side)
                                    { x: 77, y: 80 }    // Week 8 (Top, connecting to banner road)
                                ];

                                const pos = positions[weekNum - 1];
                                const isLocked = weekNum > (profile?.currentWeek || 1);
                                const isActive = weekNum === (profile?.currentWeek || 1);

                                return (
                                    <div
                                        key={weekNum}
                                        className="week-node"
                                        data-week={weekNum}
                                        style={{ left: `${pos.x}%`, top: `${pos.y}px` }}
                                    >
                                        <button
                                            className={`week-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                            onClick={() => !isLocked && navigate(`/week/${weekNum}`)}
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
