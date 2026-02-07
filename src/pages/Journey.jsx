import { useState, useEffect } from 'react'
import { ArrowRight, Flag, Navigation, Search, Loader2, Play, CheckCircle2, Lock, Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { goalsService, journeyService } from '../lib/services'

// Get ring color based on exercises missed (total - completed)
const getRingColor = (missedExercises) => {
    if (missedExercises === 0) return '#16A34A' // Dark green - all complete
    if (missedExercises === 1) return '#22C55E' // Light green - missed 1
    if (missedExercises === 2) return '#EAB308' // Yellow - missed 2
    if (missedExercises === 3) return '#F97316' // Orange - missed 3
    return '#EF4444' // Red - missed 4+
}

export default function Journey() {
    const { profile, updateProfile, loading: authLoading, user, isAuthenticated } = useAuth()
    const [destinationInput, setDestinationInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [showWeeklySetup, setShowWeeklySetup] = useState(false)
    const [weeklyGoals, setWeeklyGoals] = useState(['', '', ''])
    const [localJourneyStarted, setLocalJourneyStarted] = useState(false)
    const [hasExistingGoals, setHasExistingGoals] = useState(false)
    const [journeyLoading, setJourneyLoading] = useState(true)
    const [journeyProgress, setJourneyProgress] = useState(null) // For week completion data
    const [newlyUnlocked, setNewlyUnlocked] = useState(null) // Track which week was just unlocked
    const [onboardingStep, setOnboardingStep] = useState('welcome') // 'welcome' or 'goal'
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
                    setJourneyProgress(progress)
                    if (progress && progress.weeklyGoal1) {
                        setHasExistingGoals(true)
                        setLocalJourneyStarted(true)
                    }
                    // Check for newly unlocked week
                    const currentWeek = profile?.currentWeek || 1
                    const completedWeeks = progress?.completedWeeks || []
                    if (currentWeek > 1 && completedWeeks.includes(currentWeek - 1)) {
                        setNewlyUnlocked(currentWeek)
                        // Clear animation after a few seconds
                        setTimeout(() => setNewlyUnlocked(null), 3000)
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
    }, [user, isAuthenticated, authLoading, profile?.currentWeek])

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
            // After saving goal, show How it Works
            setOnboardingStep('howItWorks')
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
            {/* 1. INITIAL ONBOARDING - ANIMATED FLOW */}
            {showOnboarding && (
                <div className={`onboarding-fullscreen ${onboardingStep === 'zooming' ? 'zooming' : ''} ${onboardingStep === 'goal' || onboardingStep === 'howItWorks' ? 'goal-ready' : ''}`}>
                    {/* Map Background */}
                    <div className="onboarding-map-bg" />

                    {/* Step 1: Welcome Screen */}
                    {onboardingStep === 'welcome' && (
                        <div className="welcome-content">
                            <div className="welcome-card">
                                <h1 className="welcome-title">Welcome to</h1>
                                <h2 className="welcome-brand">Road 2 Rehab</h2>
                                <p className="welcome-tagline">
                                    Your personalised journey from where you are now, to where you want to be.
                                </p>
                                <p className="welcome-question">Are you ready to begin?</p>
                                <button
                                    className="begin-btn"
                                    onClick={() => {
                                        setOnboardingStep('zooming')
                                        // After zoom animation, show goal input
                                        setTimeout(() => setOnboardingStep('goal'), 3500)
                                    }}
                                >
                                    Begin
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Zooming animation (intermediate) */}
                    {onboardingStep === 'zooming' && (
                        <div className="zoom-overlay">
                            <div className="zoom-text">Setting your destination...</div>
                        </div>
                    )}

                    {/* Step 3: How It Works Screen */}
                    {onboardingStep === 'howItWorks' && (
                        <div className="how-it-works-container">
                            <div className="how-it-works-card">
                                <div className="hiw-header">
                                    <div className="hiw-step-badge">How It Works</div>
                                </div>

                                <div className="hiw-quote-box">
                                    <p><strong>Your commitment determines your success.</strong> This app will help you stay on track.</p>
                                </div>

                                <div className="hiw-section">
                                    <h3 className="hiw-section-title">Week Color Scale:</h3>
                                    <p className="hiw-section-desc">Each week changes color based on exercises completed:</p>
                                    <div className="color-scale-list">
                                        <div className="color-scale-item"><span className="color-dot" style={{ background: '#16A34A' }}></span> 0 missed = Dark Green</div>
                                        <div className="color-scale-item"><span className="color-dot" style={{ background: '#22C55E' }}></span> 1 missed = Light Green</div>
                                        <div className="color-scale-item"><span className="color-dot" style={{ background: '#BEF264' }}></span> 2 missed = Yellow-Green</div>
                                        <div className="color-scale-item"><span className="color-dot" style={{ background: '#EAB308' }}></span> 3 missed = Yellow</div>
                                        <div className="color-scale-item"><span className="color-dot" style={{ background: '#F97316' }}></span> 4 missed = Orange</div>
                                        <div className="color-scale-item"><span className="color-dot" style={{ background: '#EF4444' }}></span> 5+ missed = Red</div>
                                    </div>
                                </div>

                                <div className="hiw-section">
                                    <h3 className="hiw-section-title">Appointment Readiness:</h3>
                                    <p className="hiw-section-desc">Shows how prepared you are for your next physio visit.</p>
                                    <div className="readiness-bar">
                                        <span className="readiness-label left">Not Ready</span>
                                        <span className="readiness-label right">Ready</span>
                                    </div>
                                </div>

                                <button
                                    className="hiw-continue-btn"
                                    onClick={() => setOnboardingStep('goal')}
                                >
                                    Got It!
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Goal Input Panel (Google Maps style) */}
                    {onboardingStep === 'goal' && (
                        <div className="goal-panel-container">
                            <div className="goal-panel">
                                <div className="goal-panel-header">
                                    <Flag size={22} color="white" />
                                    <span>Set Your Destination</span>
                                </div>
                                <div className="goal-panel-content">
                                    <h3 className="goal-panel-title">
                                        Now it's time to picture where you want this journey to lead.
                                    </h3>
                                    <p className="goal-panel-subtitle">
                                        <Flag size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                                        This is your main recovery goal
                                    </p>
                                    <div className="goal-panel-label">Where does your road lead 2?</div>
                                    <form onSubmit={handleSetDestination} className="goal-input-group">
                                        <input
                                            type="text"
                                            className="goal-input"
                                            placeholder="e.g. Back on the football pitch"
                                            value={destinationInput}
                                            onChange={(e) => setDestinationInput(e.target.value)}
                                            disabled={saving}
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            className="goal-submit-btn"
                                            disabled={saving || !destinationInput.trim()}
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 2. READY TO START STATE - Google Maps style destination */}
            {hasDestination && !journeyStarted && !showWeeklySetup && (
                <div className="journey-ready-container">
                    {/* Destination Pin/Bubble - Google Maps style */}
                    <div className="destination-bubble">
                        <div className="destination-bubble-content">
                            <div className="destination-icon">
                                <Flag size={24} color="white" />
                            </div>
                            <div className="destination-text-container">
                                <span className="destination-eyebrow">YOUR DESTINATION</span>
                                <h2 className="destination-goal-text">{profile.ultimateGoal}</h2>
                            </div>
                        </div>
                        <div className="destination-bubble-pointer" />
                    </div>

                    {/* Pulsing map pin dot */}
                    <div className="destination-pin-dot">
                        <div className="pin-pulse" />
                        <div className="pin-center" />
                    </div>

                    {/* Call to Action Card */}
                    <div className="journey-cta-card">
                        <div className="cta-icon-row">
                            <div className="route-line" />
                            <Navigation size={28} className="cta-nav-icon" />
                            <div className="route-line" />
                        </div>
                        <h3 className="cta-heading">Ready to reach your destination?</h3>
                        <p className="cta-subtext">
                            Click <strong>Begin Journey</strong> to discover the personalized route we've mapped to get you there.
                        </p>
                        <button className="begin-journey-btn" onClick={handleStartJourney}>
                            <Play size={22} fill="currentColor" />
                            <span>BEGIN JOURNEY</span>
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
                            src="/road2-banner.png"
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
                        {/* Winding Road SVG - curvy because recovery is not linear */}
                        <svg className="road-svg-full" viewBox="0 0 430 1600" preserveAspectRatio="none">
                            <path
                                d="M215,1600 C215,1500 100,1400 100,1300 C100,1200 330,1100 330,1000 C330,900 100,800 100,700 C100,600 330,500 330,400 C330,300 215,200 215,100 L215,0"
                                stroke="var(--navy-primary)"
                                strokeWidth="70"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <path
                                d="M215,1600 C215,1500 100,1400 100,1300 C100,1200 330,1100 330,1000 C330,900 100,800 100,700 C100,600 330,500 330,400 C330,300 215,200 215,100 L215,0"
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

                                // Week positions - evenly spaced and centered on the curved road
                                // Adjusted visually: left curves ~35%, right curves ~65%, center 50%
                                const positions = [
                                    { x: 50, y: 1450 }, // Week 1 - bottom center
                                    { x: 35, y: 1260 }, // Week 2 - left curve
                                    { x: 65, y: 1070 }, // Week 3 - right curve
                                    { x: 35, y: 880 },  // Week 4 - left curve
                                    { x: 65, y: 690 },  // Week 5 - right curve
                                    { x: 35, y: 500 },  // Week 6 - left curve
                                    { x: 65, y: 310 },  // Week 7 - right curve
                                    { x: 50, y: 120 }   // Week 8 - top center
                                ];

                                const pos = positions[weekNum - 1];
                                const isLocked = weekNum > (profile?.currentWeek || 1);
                                const isActive = weekNum === (profile?.currentWeek || 1);
                                const completedWeeks = journeyProgress?.completedWeeks || [];
                                const isComplete = completedWeeks.includes(weekNum);

                                // Get ring color from weekStats (based on missed exercises)
                                let ringColor = null;
                                if (isComplete) {
                                    try {
                                        const weekStats = journeyProgress?.weekStats ? JSON.parse(journeyProgress.weekStats) : {};
                                        const thisWeekStats = weekStats[weekNum];
                                        const missedExercises = thisWeekStats?.missed ?? 0;
                                        ringColor = getRingColor(missedExercises);
                                    } catch {
                                        ringColor = '#16A34A'; // Default green if parsing fails
                                    }
                                }
                                const isNewlyUnlocked = newlyUnlocked === weekNum;

                                return (
                                    <div
                                        key={weekNum}
                                        className={`week-node ${isNewlyUnlocked ? 'newly-unlocked' : ''}`}
                                        data-week={weekNum}
                                        style={{ left: `${pos.x}%`, top: `${pos.y}px` }}
                                    >
                                        <button
                                            className={`week-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${isComplete ? 'complete' : ''}`}
                                            onClick={() => !isLocked && navigate(`/week/${weekNum}`)}
                                            disabled={isLocked}
                                            style={ringColor ? { boxShadow: `0 0 0 4px ${ringColor}` } : {}}
                                        >
                                            <span>W{weekNum}</span>
                                            {isComplete && (
                                                <div className="complete-overlay">
                                                    <Check size={28} strokeWidth={3} />
                                                </div>
                                            )}
                                            {isLocked && !isComplete && (
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
