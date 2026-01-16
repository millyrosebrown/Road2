import { useState, useEffect } from 'react'
import { Target, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { journeyService } from '../lib/services'

export default function Goals() {
    const { user, isAuthenticated, authLoading } = useAuth()
    const [progress, setProgress] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProgress = async () => {
            if (user?.$id) {
                try {
                    const data = await journeyService.getProgress(user.$id)
                    setProgress(data)
                } catch (error) {
                    console.error('Error fetching goals:', error)
                } finally {
                    setLoading(false)
                }
            } else if (!authLoading && !isAuthenticated) {
                setLoading(false)
            }
        }

        fetchProgress()
    }, [user, isAuthenticated, authLoading])

    if (loading || authLoading) {
        return (
            <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--navy-primary)" />
            </div>
        )
    }

    const weeklyGoals = progress ? [
        progress.weeklyGoal1,
        progress.weeklyGoal2,
        progress.weeklyGoal3
    ].filter(Boolean) : []

    return (
        <div>
            {/* Header */}
            <header className="page-header navy">
                <h1>Weekly Focus</h1>
                <p>Track your 3 core activities</p>
            </header>

            {/* Content */}
            <div className="page-content">
                {weeklyGoals.length > 0 ? (
                    <div className="goal-inputs-container">
                        {weeklyGoals.map((goal, index) => (
                            <div key={index} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--teal-primary)' }}>
                                <div className="goal-number">{index + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{goal}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weekly improvement focus</span>
                                </div>
                                <CheckCircle2 size={24} color="var(--success)" style={{ opacity: 0.5 }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Target size={32} />
                        </div>
                        <h3>No Goals Set</h3>
                        <p>Start your journey on the Map page to set your 3 weekly activities.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
