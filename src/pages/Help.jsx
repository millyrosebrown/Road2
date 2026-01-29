import { useState } from 'react'
import { Info, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { journeyService, exerciseService, userService } from '../lib/services'

export default function Help() {
    const { user, updateProfile } = useAuth()
    const [showConfirm, setShowConfirm] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [resetComplete, setResetComplete] = useState(false)

    const handleRefreshData = async () => {
        if (!user?.$id) return

        setResetting(true)
        try {
            // 1. Reset user profile to defaults
            await updateProfile({
                currentWeek: 1,
                ultimateGoal: '',
                name: user.name || 'User'
            })

            // 2. Delete journey progress
            const journey = await journeyService.getProgress(user.$id)
            if (journey) {
                await journeyService.saveProgress(user.$id, {
                    ultimateGoal: '',
                    currentWeek: 1,
                    completedWeeks: [],
                    weeklyGoal1: '',
                    weeklyGoal2: '',
                    weeklyGoal3: '',
                    weekStats: ''
                })
            }

            // 3. Delete all exercises for this user
            const exercises = await exerciseService.getUserExercises(user.$id)
            for (const exercise of exercises) {
                await exerciseService.deleteExercise(exercise.$id)
            }

            setResetComplete(true)
            setShowConfirm(false)

            // Reload the page to restart onboarding
            setTimeout(() => {
                window.location.href = '/'
            }, 1500)
        } catch (error) {
            console.error('Error resetting data:', error)
            alert('Error resetting data. Please try again.')
        } finally {
            setResetting(false)
        }
    }

    return (
        <div>
            {/* Header */}
            <header className="page-header navy">
                <h1>Information & Help</h1>
            </header>

            {/* Content */}
            <div className="page-content">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Info size={32} />
                    </div>
                    <h3>Help Page</h3>
                    <p>Ready to build together</p>
                </div>

                {/* Developer Section */}
                <div className="settings-section" style={{ marginTop: '2rem', padding: '0 1rem' }}>
                    <h3 style={{ color: 'var(--navy)', marginBottom: '1rem' }}>Developer Tools</h3>

                    <button
                        className="refresh-data-btn"
                        onClick={() => setShowConfirm(true)}
                    >
                        <RefreshCw size={20} />
                        <span>Refresh Data</span>
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                        Deletes all your data and restarts onboarding
                    </p>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content confirm-modal">
                        <div className="confirm-icon">
                            <AlertTriangle size={48} color="#EF4444" />
                        </div>
                        <h3>Are you sure?</h3>
                        <p>This will permanently delete all your data including:</p>
                        <ul>
                            <li>Your ultimate goal</li>
                            <li>All weekly goals</li>
                            <li>All exercises logged</li>
                            <li>Week completion progress</li>
                        </ul>
                        <p style={{ fontWeight: 600, color: '#EF4444' }}>
                            This action cannot be undone.
                        </p>
                        <div className="confirm-actions">
                            <button
                                className="btn-cancel-confirm"
                                onClick={() => setShowConfirm(false)}
                                disabled={resetting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-delete-confirm"
                                onClick={handleRefreshData}
                                disabled={resetting}
                            >
                                {resetting ? (
                                    <>
                                        <Loader2 size={18} className="spinner" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Yes, Delete Everything'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {resetComplete && (
                <div className="success-toast">
                    ✓ Data reset complete! Restarting...
                </div>
            )}
        </div>
    )
}
