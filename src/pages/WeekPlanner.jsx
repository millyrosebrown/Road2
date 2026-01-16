import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flag, Calendar, Plus, Loader2, Check, X } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { journeyService } from '../lib/services'

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
    const handleAddExercise = (dayKey) => {
        if (!newExercise.name.trim()) return

        const exercise = {
            id: Date.now(),
            name: newExercise.name,
            sets: parseInt(newExercise.sets) || 3,
            reps: parseInt(newExercise.reps) || 10,
            completedSets: [] // { rating, comment }
        }

        setExercises(prev => ({
            ...prev,
            [dayKey]: [...(prev[dayKey] || []), exercise]
        }))

        setNewExercise({ name: '', sets: 3, reps: 10 })
        setAddingExerciseDay(null)
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
    const handleSubmitRating = () => {
        if (!selectedRating || !ratingModal) return

        const { dayKey, exerciseId } = ratingModal

        setExercises(prev => {
            const dayExercises = [...(prev[dayKey] || [])]
            const exerciseIndex = dayExercises.findIndex(e => e.id === exerciseId)

            if (exerciseIndex >= 0) {
                dayExercises[exerciseIndex] = {
                    ...dayExercises[exerciseIndex],
                    completedSets: [
                        ...dayExercises[exerciseIndex].completedSets,
                        { rating: selectedRating, comment: ratingComment }
                    ]
                }
            }

            return { ...prev, [dayKey]: dayExercises }
        })

        setRatingModal(null)
        setSelectedRating(null)
        setRatingComment('')
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
                                                <div className="exercise-complete">
                                                    <span className="complete-face">{getFaceFromRating(avgRating)}</span>
                                                    <span className="complete-score">{avgRating.toFixed(1)}/5</span>
                                                    <Check size={16} className="complete-check" />
                                                </div>
                                            ) : (
                                                <div className="exercise-sets">
                                                    {Array.from({ length: exercise.sets }, (_, i) => {
                                                        const isCompleted = i < exercise.completedSets.length
                                                        const isNext = i === exercise.completedSets.length

                                                        return (
                                                            <button
                                                                key={i}
                                                                className={`set-btn ${isCompleted ? 'completed' : ''} ${isNext ? 'next' : ''}`}
                                                                onClick={() => handleSetClick(day.dateKey, exercise.id, i)}
                                                                disabled={!isNext}
                                                            >
                                                                {isCompleted ? (
                                                                    <span>{exercise.completedSets[i].rating}</span>
                                                                ) : (
                                                                    <span>{i + 1}</span>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
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
            {ratingModal && (
                <div className="rating-modal-overlay">
                    <div className="rating-modal">
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
            )}
        </div>
    )
}
