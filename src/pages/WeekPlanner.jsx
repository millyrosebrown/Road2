import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flag, Calendar, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { journeyService } from '../lib/services'

export default function WeekPlanner() {
    const { weekNumber } = useParams()
    const navigate = useNavigate()
    const { profile, user, isAuthenticated, loading: authLoading } = useAuth()
    const [journeyProgress, setJourneyProgress] = useState(null)
    const [loading, setLoading] = useState(true)

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
        // For now, calculate dates relative to today for Week 1
        // In the future, this should use the journey's actual start date
        const today = new Date()
        const startOfCurrentWeek = new Date(today)
        startOfCurrentWeek.setDate(today.getDate() - today.getDay() + 1) // Monday

        // Adjust for the week number (Week 1 = current week, Week 2 = next week, etc.)
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
                dateString: date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
            })
        }

        return days
    }

    const weekDays = getWeekDates()
    const weekStartStr = weekDays[0].date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
    const weekEndStr = weekDays[6].date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })

    const ultimateGoal = journeyProgress?.ultimateGoal || profile?.ultimateGoal || 'your goal'

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
                {weekDays.map((day, index) => (
                    <div key={index} className="day-card">
                        <div className="day-header">
                            <span className="day-name">{day.dayName}</span>
                            <span className="day-date">{day.dateString}</span>
                        </div>
                        <div className="day-exercises">
                            <div className="empty-exercises">
                                <Plus size={20} />
                                <span>Add exercises</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
