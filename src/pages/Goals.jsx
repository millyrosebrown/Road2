import { Target, Plus, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Goals() {
    const goals = [
        { id: 1, title: 'Complete Week 1 Exercises', completed: true },
        { id: 2, title: 'Walk 5000 steps daily', completed: false },
        { id: 3, title: 'Attend physiotherapy session', completed: false },
    ]

    const hasGoals = goals.length > 0
    const showOnboarding = !hasGoals

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Purple-Blue Header */}
            <header className="page-header purple-blue">
                <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-1)' }}>
                    ROAD2
                </p>
                <h1>Daily Goals</h1>
            </header>

            {/* Content */}
            <div className="page-content">
                {showOnboarding ? (
                    /* Empty State / Onboarding */
                    <motion.div
                        className="goal-card"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{ marginTop: 'var(--spacing-8)' }}
                    >
                        <div className="goal-icon">
                            <Target size={32} />
                        </div>
                        <h3>Set Your Daily Goals</h3>
                        <p>Complete your onboarding to add personalized rehabilitation goals.</p>
                        <button className="btn btn-primary btn-full">
                            Get Started
                        </button>
                    </motion.div>
                ) : (
                    /* Goals List */
                    <>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                <h3>Today's Goals</h3>
                                <button className="btn btn-primary" style={{ padding: 'var(--spacing-2) var(--spacing-3)' }}>
                                    <Plus size={18} />
                                </button>
                            </div>

                            {goals.map((goal, index) => (
                                <motion.div
                                    key={goal.id}
                                    className="card"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-3)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 'var(--radius-full)',
                                        border: goal.completed ? 'none' : '2px solid var(--purple-primary)',
                                        background: goal.completed ? 'var(--success)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {goal.completed && <CheckCircle2 size={18} color="white" />}
                                    </div>
                                    <span style={{
                                        flex: 1,
                                        textDecoration: goal.completed ? 'line-through' : 'none',
                                        color: goal.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                        fontWeight: 500
                                    }}>
                                        {goal.title}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Progress Summary */}
                        <motion.div
                            className="card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                marginTop: 'var(--spacing-6)',
                                background: 'var(--gradient-purple)',
                                color: 'var(--text-white)'
                            }}
                        >
                            <h4 style={{ color: 'var(--text-white)', marginBottom: 'var(--spacing-2)' }}>
                                Today's Progress
                            </h4>
                            <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                                {goals.filter(g => g.completed).length} of {goals.length} goals completed
                            </p>
                            <div style={{
                                marginTop: 'var(--spacing-3)',
                                height: 8,
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden'
                            }}>
                                <motion.div
                                    style={{
                                        height: '100%',
                                        background: 'white',
                                        borderRadius: 'var(--radius-full)'
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(goals.filter(g => g.completed).length / goals.length) * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    )
}
