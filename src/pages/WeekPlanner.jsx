import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flag, Calendar, Plus, Loader2, Check, X, Trophy, Star } from 'lucide-react'
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

export default function WeekPlanner() {
    const { weekNumber } = useParams()
    const navigate = useNavigate()
    const { profile, user, isAuthenticated, loading: authLoading } = useAuth()
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
    }, [user, authLoading])

    // Load exercises from database when weekDays are ready
    useEffect(() => {
        const loadExercises = async () => {
            if (!user?.$id || weekNum === undefined) return

            try {
                // Calculate the week date range
                const today = new Date()
                const startOfCurrentWeek = new Date(today)
                startOfCurrentWeek.setDate(today.getDate() - today.getDay() + 1)
                const weekOffset = (weekNum - 1) * 7
                const weekStart = new Date(startOfCurrentWeek)
                weekStart.setDate(weekStart.getDate() + weekOffset)
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekEnd.getDate() + 6)

                const startDate = weekStart.toISOString().split('T')[0]
                const endDate = weekEnd.toISOString().split('T')[0]

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
    }, [user, weekNum])

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Calculate week dates based on journey start
    const getWeekDates = () => {
        const today = new Date()
        const startOfCurrentWeek = new Date(today)
        startOfCurrentWeek.setDate(today.getDate() - today.getDay() + 1)

        const weekOffset = (weekNum - 1) * 7
        const weekStart = new Date(startOfCurrentWeek)
        weekStart.setDate(weekStart.getDate() + weekOffset)

        const days = []
        const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart)
            date.setDate(weekStart.getDate() + i)
            days.push({
                dayName: dayNames[i],
                date: date,
                dateString: date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
                dateKey: date.toISOString().split('T')[0]
            })
        }

        return days
    }

    const weekDays = getWeekDates()
    const weekStartStr = weekDays[0].date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
    const weekEndStr = weekDays[6].date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })
    const ultimateGoal = journeyProgress?.ultimateGoal || profile?.ultimateGoal || 'your goal'

    // Add exercise handler
    const handleAddExercise = async (dayKey) => {
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
            // Count days with at least one completed exercise
            let daysWithExercises = 0
            weekDays.forEach(day => {
                const dayExercises = exercises[day.dateKey] || []
                const hasCompletedExercise = dayExercises.some(ex => ex.completedSets.length >= ex.sets)
                if (hasCompletedExercise) daysWithExercises++
            })

            // Get existing completed weeks and add current week
            const existingCompletedWeeks = journeyProgress?.completedWeeks || []
            const newCompletedWeeks = [...new Set([...existingCompletedWeeks, weekNum])]

            // Save week completion - add weekNum to completedWeeks array
            await journeyService.saveProgress(user.$id, {
                ...journeyProgress,
                completedWeeks: newCompletedWeeks
            })

            // Update currentWeek to unlock next week
            await userService.updateProfile(user.$id, {
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
                                <span className="day-name">{day.dayName}</span>
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
                                ) : (
                                    <button className="add-exercise-btn" onClick={() => setAddingExerciseDay(index)}>
                                        <Plus size={18} />
                                        <span>Add exercise</span>
                                    </button>
                                )}
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
        </div>
    )
}
