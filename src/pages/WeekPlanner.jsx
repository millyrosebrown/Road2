import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flag, Calendar, Plus, Loader2, Check, X, Trophy, Star, Unlock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { journeyService, userService, exerciseService } from '../lib/services'

// Rating faces for set completion
const RATING_FACES = [
    { value: 1, emoji: '😫', label: 'Terrible' },
    { value: 2, emoji: '😔', label: 'Hard' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '🤩', label: 'Amazing' }
]

// Get face emoji from average rating
const getFaceFromRating = (rating) => {
    if (rating <= 1.5) return '😫'
    if (rating <= 2.5) return '😔'
    if (rating <= 3.5) return '😐'
    if (rating <= 4.5) return '😊'
    return '🤩'
}

// Helper: get local date as YYYY-MM-DD (avoids UTC timezone issues)
const getLocalDateStr = (date = new Date()) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export default function WeekPlanner() {
    const { weekNumber } = useParams()
    const navigate = useNavigate()
    const { profile, user, isAuthenticated, loading: authLoading, updateProfile } = useAuth()
    const [journeyProgress, setJourneyProgress] = useState(null)
    const [loading, setLoading] = useState(true)

    // Exercise state
    const [exercises, setExercises] = useState({}) // { "dateKey": [exercises] }
    const [addingExerciseDay, setAddingExerciseDay] = useState(null) // day index
    const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: 10 })

    // Rating modal state
    const [ratingModal, setRatingModal] = useState(null) // { dayKey, exerciseId, setIndex }
    const [selectedRating, setSelectedRating] = useState(null)
    const [ratingComment, setRatingComment] = useState('')

    // Week completion flow state
    const [showCongratsModal, setShowCongratsModal] = useState(false)
    const [showGoalsRating, setShowGoalsRating] = useState(false)
    const [goalRatings, setGoalRatings] = useState([null, null, null]) // 0-10 for each goal
    const [weekCompleted, setWeekCompleted] = useState(false)

    const weekNum = parseInt(weekNumber, 10) || 1

    // Fetch journey progress for the user's goal
    useEffect(() => {
        const fetchProgress = async () => {
            if (user?.$id) {
                try {
                    const progress = await journeyService.getProgress(user.$id)
                    setJourneyProgress(progress)

                    // Record Day 1 if this is Week 1 and no journeyStartDate exists yet
                    if (weekNum === 1 && progress && !progress.journeyStartDate) {
                        const today = getLocalDateStr()
                        const updated = await journeyService.saveProgress(user.$id, {
                            ...progress,
                            journeyStartDate: today
                        })
                        setJourneyProgress(updated)
                    }
                } catch (error) {
                    console.error('Error fetching journey progress:', error)
                } finally {
                    setLoading(false)
                }
            } else if (!authLoading) {
                setLoading(false)
            }
        }
        fetchProgress()
    }, [user, authLoading, weekNum])

    // Load exercises from database when weekDays are ready
    useEffect(() => {
        const loadExercises = async () => {
            if (!user?.$id || weekNum === undefined) return

            try {
                // Calculate the week date range anchored to journeyStartDate
                const startDateStr = journeyProgress?.journeyStartDate
                let weekStart

                if (startDateStr) {
                    const startDate = new Date(startDateStr + 'T00:00:00')
                    const dayOfWeek = startDate.getDay()
                    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                    const week1Monday = new Date(startDate)
                    week1Monday.setDate(startDate.getDate() + mondayOffset)
                    weekStart = new Date(week1Monday)
                    weekStart.setDate(week1Monday.getDate() + (weekNum - 1) * 7)
                } else {
                    const today = new Date()
                    weekStart = new Date(today)
                    const dayOfWeek = today.getDay()
                    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                    weekStart.setDate(today.getDate() + mondayOffset)
                    weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7)
                }

                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekEnd.getDate() + 6)

                const startDate = getLocalDateStr(weekStart)
                const endDate = getLocalDateStr(weekEnd)

                const dbExercises = await exerciseService.getWeekExercises(user.$id, startDate, endDate)

                // Convert to our exercises format { dateKey: [exercises] }
                const exercisesByDate = {}
                dbExercises.forEach(ex => {
                    if (!exercisesByDate[ex.date]) {
                        exercisesByDate[ex.date] = []
                    }
                    exercisesByDate[ex.date].push({
                        id: ex.$id,
                        name: ex.name,
                        sets: ex.sets,
                        reps: ex.reps,
                        completedSets: ex.notes ? JSON.parse(ex.notes) : []
                    })
                })
                setExercises(exercisesByDate)
            } catch (error) {
                console.error('Error loading exercises:', error)
            }
        }
        loadExercises()
    }, [user, weekNum, journeyProgress?.journeyStartDate])

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Calculate week dates anchored to journeyStartDate
    const getWeekDates = () => {
        const startDateStr = journeyProgress?.journeyStartDate
        let weekStartMonday

        if (startDateStr) {
            // Parse the journey start date
            const startDate = new Date(startDateStr + 'T00:00:00')
            // Find the Monday of the week containing the start date
            const dayOfWeek = startDate.getDay() // 0=Sun, 1=Mon, ...
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
            const week1Monday = new Date(startDate)
            week1Monday.setDate(startDate.getDate() + mondayOffset)

            // Offset to the requested week
            weekStartMonday = new Date(week1Monday)
            weekStartMonday.setDate(week1Monday.getDate() + (weekNum - 1) * 7)
        } else {
            // Fallback: current calendar week
            const today = new Date()
            weekStartMonday = new Date(today)
            const dayOfWeek = today.getDay()
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
            weekStartMonday.setDate(today.getDate() + mondayOffset)
            weekStartMonday.setDate(weekStartMonday.getDate() + (weekNum - 1) * 7)
        }

        const days = []
        const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStartMonday)
            date.setDate(weekStartMonday.getDate() + i)
            const dateKey = getLocalDateStr(date)
            const isDay1 = dateKey === journeyProgress?.journeyStartDate
            const isToday = dateKey === getLocalDateStr()

            days.push({
                dayName: dayNames[i],
                date: date,
                dateString: date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
                dateKey: dateKey,
                isDay1: isDay1,
                isToday: isToday
            })
        }

        return days
    }

    const weekDays = getWeekDates()
    const weekStartStr = weekDays[0].date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
    const weekEndStr = weekDays[6].date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })
    const ultimateGoal = journeyProgress?.ultimateGoal || profile?.ultimateGoal || 'your goal'

    // Check if this week is already completed (read-only)
    const completedWeeks = journeyProgress?.completedWeeks || []
    const isWeekComplete = completedWeeks.includes(weekNum)

    // Add exercise handler
    const handleAddExercise = async (dayKey) => {
        if (isWeekComplete) return // Can't add to completed weeks
        if (!newExercise.name.trim()) return

        try {
            // Save to database
            const saved = await exerciseService.logExercise(user.$id, {
                name: newExercise.name,
                sets: parseInt(newExercise.sets) || 3,
                reps: parseInt(newExercise.reps) || 10,
                date: dayKey,
                notes: '[]' // Empty completedSets as JSON
            })

            const exercise = {
                id: saved.$id, // Use Appwrite document ID
                name: newExercise.name,
                sets: parseInt(newExercise.sets) || 3,
                reps: parseInt(newExercise.reps) || 10,
                completedSets: []
            }

            setExercises(prev => ({
                ...prev,
                [dayKey]: [...(prev[dayKey] || []), exercise]
            }))

            setNewExercise({ name: '', sets: 3, reps: 10 })
            setAddingExerciseDay(null)
        } catch (error) {
            console.error('Error adding exercise:', error)
        }
    }

    // Open rating modal for a set
    const handleSetClick = (dayKey, exerciseId, setIndex) => {
        const dayExercises = exercises[dayKey] || []
        const exercise = dayExercises.find(e => e.id === exerciseId)

        // Can only complete the next set (must complete in order)
        if (setIndex !== exercise.completedSets.length) return

        setRatingModal({ dayKey, exerciseId, setIndex })
        setSelectedRating(null)
        setRatingComment('')
    }

    // Submit rating for a set
    const handleSubmitRating = async () => {
        if (!selectedRating || !ratingModal) return

        const { dayKey, exerciseId, setIndex } = ratingModal

        // Get the exercise to check if there are more sets
        const dayExercises = exercises[dayKey] || []
        const exercise = dayExercises.find(e => e.id === exerciseId)
        const totalSets = exercise?.sets || 0
        const nextSetIndex = setIndex + 1
        const isLastSet = nextSetIndex >= totalSets

        // Calculate new completedSets
        const newCompletedSets = [
            ...(exercise?.completedSets || []),
            { rating: selectedRating, comment: ratingComment }
        ]

        // Save to database
        try {
            await exerciseService.updateExercise(exerciseId, {
                notes: JSON.stringify(newCompletedSets),
                completed: newCompletedSets.length >= totalSets
            })
        } catch (error) {
            console.error('Error saving exercise rating:', error)
        }

        setExercises(prev => {
            const updatedDayExercises = [...(prev[dayKey] || [])]
            const exerciseIndex = updatedDayExercises.findIndex(e => e.id === exerciseId)

            if (exerciseIndex >= 0) {
                updatedDayExercises[exerciseIndex] = {
                    ...updatedDayExercises[exerciseIndex],
                    completedSets: newCompletedSets
                }
            }

            // Check if this completes Sunday's exercise
            const sundayKey = weekDays[6]?.dateKey
            if (isLastSet && dayKey === sundayKey) {
                // Check if all exercises for Sunday are complete
                const sundayExercises = updatedDayExercises
                const allComplete = sundayExercises.length > 0 &&
                    sundayExercises.every(ex => ex.completedSets.length >= ex.sets)

                if (allComplete && !weekCompleted) {
                    setTimeout(() => setShowCongratsModal(true), 500)
                }
            }

            return { ...prev, [dayKey]: updatedDayExercises }
        })

        setSelectedRating(null)
        setRatingComment('')

        // Auto-continue to next set if not complete
        if (nextSetIndex < totalSets) {
            setTimeout(() => {
                setRatingModal({ dayKey, exerciseId, setIndex: nextSetIndex })
            }, 300)
        } else {
            setRatingModal(null)
        }
    }

    // Handle weekly goals rating submission
    const handleGoalsSubmit = async () => {
        if (goalRatings.some(r => r === null)) return

        try {
            // Count total exercises and completed exercises for the week
            let totalExercises = 0
            let completedExercises = 0

            weekDays.forEach(day => {
                const dayExercises = exercises[day.dateKey] || []
                dayExercises.forEach(ex => {
                    totalExercises++
                    if (ex.completedSets.length >= ex.sets) {
                        completedExercises++
                    }
                })
            })

            const missedExercises = totalExercises - completedExercises

            // Get existing completed weeks and add current week
            const existingCompletedWeeks = journeyProgress?.completedWeeks || []
            const newCompletedWeeks = [...new Set([...existingCompletedWeeks, weekNum])]

            // Get existing week stats and add this week's stats
            const existingWeekStats = journeyProgress?.weekStats ? JSON.parse(journeyProgress.weekStats) : {}
            existingWeekStats[weekNum] = {
                total: totalExercises,
                completed: completedExercises,
                missed: missedExercises,
                goalRatings: goalRatings
            }

            // Save week completion with exercise stats
            await journeyService.saveProgress(user.$id, {
                ...journeyProgress,
                completedWeeks: newCompletedWeeks,
                weekStats: JSON.stringify(existingWeekStats)
            })

            // Update currentWeek to unlock next week - use AuthContext's updateProfile to refresh state
            await updateProfile({
                currentWeek: weekNum + 1
            })

            setWeekCompleted(true)
            setShowGoalsRating(false)
        } catch (error) {
            console.error('Error unlocking next week:', error)
        }
    }

    // Calculate average rating for completed exercise
    const getAverageRating = (exercise) => {
        if (exercise.completedSets.length === 0) return 0
        const sum = exercise.completedSets.reduce((acc, set) => acc + set.rating, 0)
        return sum / exercise.completedSets.length
    }

    if (loading || authLoading) {
        return (
            <div className="week-planner-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Loader2 className="animate-spin" size={40} color="var(--navy-primary)" />
            </div>
        )
    }

    return (
        <div className="week-planner-container">
            {/* Header */}
            <header className="week-planner-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="week-header-content">
                    <div className="week-title">
                        <span className="week-number-label">Week {weekNum}</span>
                        <span className="week-subtitle">of your Road 2</span>
                        {isWeekComplete && (
                            <span className="view-only-badge">✓ Completed</span>
                        )}
                    </div>
                    <div className="week-goal">
                        <Flag size={16} />
                        <span>"{ultimateGoal}"</span>
                    </div>
                    <div className="week-date-range">
                        <Calendar size={14} />
                        <span>{weekStartStr} - {weekEndStr}</span>
                    </div>
                </div>
            </header>

            {/* Weekly Goals Reminder */}
            {journeyProgress?.weeklyGoal1 && (
                <div className="weekly-focus-banner">
                    <h4>Your Weekly Focus</h4>
                    <div className="focus-goals">
                        <span>{journeyProgress.weeklyGoal1}</span>
                        <span>{journeyProgress.weeklyGoal2}</span>
                        <span>{journeyProgress.weeklyGoal3}</span>
                    </div>
                </div>
            )}

            {/* Day Cards */}
            <div className="week-days-container">
                {weekDays.map((day, index) => {
                    const dayExercises = exercises[day.dateKey] || []

                    return (
                        <div key={index} className="day-card">
                            <div className="day-header">
                                <div className="day-name-row">
                                    <span className="day-name">{day.dayName}</span>
                                    {day.isDay1 && <span className="day1-badge">🏁 Day 1</span>}
                                    {day.isToday && !day.isDay1 && <span className="today-badge">Today</span>}
                                </div>
                                <span className="day-date">{day.dateString}</span>
                            </div>
                            <div className="day-exercises">
                                {/* Existing exercises */}
                                {dayExercises.map((exercise) => {
                                    const isComplete = exercise.completedSets.length === exercise.sets
                                    const avgRating = getAverageRating(exercise)

                                    return (
                                        <div key={exercise.id} className={`exercise-card ${isComplete ? 'complete' : ''}`}>
                                            <div className="exercise-header">
                                                <span className="exercise-name">{exercise.name}</span>
                                                <span className="exercise-info">{exercise.sets} × {exercise.reps}</span>
                                            </div>

                                            {isComplete ? (
                                                <div className="exercise-complete-banner">
                                                    <Check size={24} className="complete-check-icon" />
                                                    <div className="complete-text">
                                                        <span className="complete-label">Complete!</span>
                                                        <span className="complete-rating">
                                                            {getFaceFromRating(avgRating)} {avgRating.toFixed(1)}/5
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : exercise.completedSets.length === 0 ? (
                                                <button
                                                    className="start-exercise-btn"
                                                    onClick={() => handleSetClick(day.dateKey, exercise.id, 0)}
                                                >
                                                    ▶ Start Exercise
                                                </button>
                                            ) : (
                                                <div className="exercise-progress">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${(exercise.completedSets.length / exercise.sets) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="progress-text">
                                                        Set {exercise.completedSets.length}/{exercise.sets}
                                                    </span>
                                                    <button
                                                        className="continue-btn"
                                                        onClick={() => handleSetClick(day.dateKey, exercise.id, exercise.completedSets.length)}
                                                    >
                                                        Continue →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Add Exercise Form */}
                                {addingExerciseDay === index ? (
                                    <div className="add-exercise-form">
                                        <input
                                            type="text"
                                            placeholder="Exercise name"
                                            value={newExercise.name}
                                            onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                                            className="exercise-input"
                                            autoFocus
                                        />
                                        <div className="exercise-numbers">
                                            <div className="number-input">
                                                <label>Sets</label>
                                                <input
                                                    type="number"
                                                    value={newExercise.sets}
                                                    onChange={(e) => setNewExercise(prev => ({ ...prev, sets: e.target.value }))}
                                                    min="1"
                                                    max="10"
                                                />
                                            </div>
                                            <div className="number-input">
                                                <label>Reps</label>
                                                <input
                                                    type="number"
                                                    value={newExercise.reps}
                                                    onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                                                    min="1"
                                                    max="100"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button className="btn-cancel" onClick={() => setAddingExerciseDay(null)}>
                                                <X size={18} />
                                            </button>
                                            <button className="btn-confirm" onClick={() => handleAddExercise(day.dateKey)}>
                                                <Check size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : !isWeekComplete ? (
                                    <button className="add-exercise-btn" onClick={() => setAddingExerciseDay(index)}>
                                        <Plus size={18} />
                                        <span>Add exercise</span>
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Rating Modal */}
            {ratingModal && (() => {
                const modalExercise = (exercises[ratingModal.dayKey] || []).find(e => e.id === ratingModal.exerciseId)
                const setNum = ratingModal.setIndex + 1
                const totalSets = modalExercise?.sets || 0

                return (
                    <div className="rating-modal-overlay">
                        <div className="rating-modal">
                            <div className="modal-set-indicator">Set {setNum} of {totalSets}</div>
                            <h3>How did this set feel?</h3>
                            <div className="rating-faces">
                                {RATING_FACES.map(face => (
                                    <button
                                        key={face.value}
                                        className={`rating-face ${selectedRating === face.value ? 'selected' : ''}`}
                                        onClick={() => setSelectedRating(face.value)}
                                    >
                                        <span className="face-emoji">{face.emoji}</span>
                                        <span className="face-label">{face.label}</span>
                                    </button>
                                ))}
                            </div>
                            <textarea
                                placeholder="Add a comment (optional)"
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                className="rating-comment"
                            />
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setRatingModal(null)}>Cancel</button>
                                <button
                                    className="btn-confirm"
                                    onClick={handleSubmitRating}
                                    disabled={!selectedRating}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* Congratulations Modal */}
            {showCongratsModal && (
                <div className="rating-modal-overlay">
                    <div className="congrats-modal">
                        <div className="congrats-icon">
                            <Trophy size={48} />
                        </div>
                        <h2>Week {weekNum} Complete!</h2>
                        <p className="congrats-quote">
                            "Consistency is key. You've taken another step on your Road 2 <strong>{ultimateGoal}</strong>"
                        </p>
                        <button
                            className="btn-next"
                            onClick={() => {
                                setShowCongratsModal(false)
                                setShowGoalsRating(true)
                            }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Weekly Goals Rating Modal */}
            {showGoalsRating && (
                <div className="rating-modal-overlay">
                    <div className="goals-rating-modal">
                        <h2>Let's Track Your Progress</h2>
                        <p className="goals-subtitle">Rate how you felt doing these activities this week</p>
                        <p className="goals-scale-hint">0 = Unable to perform → 10 = Prior level (no issue)</p>

                        <div className="goals-list">
                            {[journeyProgress?.weeklyGoal1, journeyProgress?.weeklyGoal2, journeyProgress?.weeklyGoal3].map((goal, idx) => (
                                <div key={idx} className="goal-rating-item">
                                    <div className="goal-rating-header">
                                        <span className="goal-number">{idx + 1}</span>
                                        <span className="goal-text">{goal}</span>
                                    </div>
                                    <div className="rating-scale">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <button
                                                key={num}
                                                className={`scale-btn ${goalRatings[idx] === num ? 'selected' : ''}`}
                                                onClick={() => {
                                                    const newRatings = [...goalRatings]
                                                    newRatings[idx] = num
                                                    setGoalRatings(newRatings)
                                                }}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn-unlock"
                            onClick={handleGoalsSubmit}
                            disabled={goalRatings.some(r => r === null)}
                        >
                            <Star size={20} /> Unlock Week {weekNum + 1}
                        </button>
                    </div>
                </div>
            )}

            {/* Week Unlocked Success */}
            {weekCompleted && (
                <div className="rating-modal-overlay">
                    <div className="congrats-modal">
                        <div className="congrats-icon success">
                            <Check size={48} />
                        </div>
                        <h2>Week {weekNum + 1} Unlocked!</h2>
                        <p className="congrats-quote">Keep up the great work on your journey!</p>
                        <button
                            className="btn-next"
                            onClick={() => navigate('/')}
                        >
                            Back to Journey
                        </button>
                    </div>
                </div>
            )}

            {/* Dev: Unlock Next Week Button */}
            {!isWeekComplete && !weekCompleted && (
                <div className="dev-unlock-container">
                    <button
                        className="dev-unlock-btn"
                        onClick={() => setShowCongratsModal(true)}
                    >
                        <Unlock size={16} />
                        <span>Unlock Next Week (Dev)</span>
                    </button>
                </div>
            )}
        </div>
    )
}
