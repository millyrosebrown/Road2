import { useState } from 'react'
import {
    Target,
    Plus,
    CheckCircle2,
    Circle,
    Calendar,
    Flag,
    Trash2,
    Edit3,
    ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const initialGoals = [
    {
        id: 1,
        title: 'Walk 5000 steps daily',
        description: 'Build up walking endurance to improve mobility',
        progress: 75,
        category: 'mobility',
        priority: 'high',
        dueDate: '2024-02-15',
        milestones: [
            { id: 1, text: 'Walk 2000 steps', completed: true },
            { id: 2, text: 'Walk 3500 steps', completed: true },
            { id: 3, text: 'Walk 5000 steps', completed: false },
        ]
    },
    {
        id: 2,
        title: 'Complete knee strengthening program',
        description: 'Follow the 6-week knee rehabilitation protocol',
        progress: 100,
        category: 'strength',
        priority: 'high',
        dueDate: '2024-02-01',
        milestones: [
            { id: 1, text: 'Week 1-2: Basic exercises', completed: true },
            { id: 2, text: 'Week 3-4: Intermediate exercises', completed: true },
            { id: 3, text: 'Week 5-6: Advanced exercises', completed: true },
        ]
    },
    {
        id: 3,
        title: 'Reduce pain level to 2/10',
        description: 'Track and manage pain through exercises and rest',
        progress: 60,
        category: 'pain',
        priority: 'medium',
        dueDate: '2024-02-28',
        milestones: [
            { id: 1, text: 'Achieve pain level 6/10', completed: true },
            { id: 2, text: 'Achieve pain level 4/10', completed: true },
            { id: 3, text: 'Achieve pain level 2/10', completed: false },
        ]
    },
    {
        id: 4,
        title: 'Improve range of motion by 30°',
        description: 'Increase knee flexion through daily stretching',
        progress: 45,
        category: 'flexibility',
        priority: 'medium',
        dueDate: '2024-03-15',
        milestones: [
            { id: 1, text: 'Gain 10° flexion', completed: true },
            { id: 2, text: 'Gain 20° flexion', completed: false },
            { id: 3, text: 'Gain 30° flexion', completed: false },
        ]
    },
]

const categories = [
    { value: 'all', label: 'All Goals' },
    { value: 'mobility', label: 'Mobility' },
    { value: 'strength', label: 'Strength' },
    { value: 'pain', label: 'Pain Management' },
    { value: 'flexibility', label: 'Flexibility' },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export default function Goals() {
    const [goals, setGoals] = useState(initialGoals)
    const [filter, setFilter] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [expandedGoal, setExpandedGoal] = useState(null)

    const filteredGoals = filter === 'all'
        ? goals
        : goals.filter(g => g.category === filter)

    const completedGoals = goals.filter(g => g.progress === 100).length
    const inProgressGoals = goals.filter(g => g.progress > 0 && g.progress < 100).length

    const toggleMilestone = (goalId, milestoneId) => {
        setGoals(goals.map(goal => {
            if (goal.id === goalId) {
                const updatedMilestones = goal.milestones.map(m =>
                    m.id === milestoneId ? { ...m, completed: !m.completed } : m
                )
                const completedCount = updatedMilestones.filter(m => m.completed).length
                const progress = Math.round((completedCount / updatedMilestones.length) * 100)
                return { ...goal, milestones: updatedMilestones, progress }
            }
            return goal
        }))
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Page Header */}
            <motion.div className="page-header" variants={itemVariants}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Goals</h1>
                        <p className="page-subtitle">Track your rehabilitation milestones and celebrate your progress.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={20} /> Add Goal
                    </button>
                </div>
            </motion.div>

            {/* Stats Summary */}
            <motion.div className="stats-grid" variants={itemVariants} style={{ marginBottom: 'var(--spacing-6)' }}>
                <div className="card stat-card">
                    <div className="stat-value">{goals.length}</div>
                    <div className="stat-label">Total Goals</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value" style={{ background: 'var(--gradient-success)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {completedGoals}
                    </div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value" style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {inProgressGoals}
                    </div>
                    <div className="stat-label">In Progress</div>
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div variants={itemVariants} style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            className={`btn ${filter === cat.value ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(cat.value)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Goals List */}
            <motion.div variants={itemVariants}>
                <AnimatePresence>
                    {filteredGoals.map((goal, index) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            index={index}
                            isExpanded={expandedGoal === goal.id}
                            onToggleExpand={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                            onToggleMilestone={(milestoneId) => toggleMilestone(goal.id, milestoneId)}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredGoals.length === 0 && (
                <div className="empty-state">
                    <Target size={64} className="empty-state-icon" />
                    <h3>No goals found</h3>
                    <p>Try changing your filter or add a new goal.</p>
                </div>
            )}
        </motion.div>
    )
}

function GoalCard({ goal, index, isExpanded, onToggleExpand, onToggleMilestone }) {
    const priorityColors = {
        high: 'var(--color-error)',
        medium: 'var(--color-warning)',
        low: 'var(--color-success)'
    }

    const categoryIcons = {
        mobility: '🚶',
        strength: '💪',
        pain: '❤️‍🩹',
        flexibility: '🧘'
    }

    return (
        <motion.div
            className="card"
            style={{ marginBottom: 'var(--spacing-4)', cursor: 'pointer' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            onClick={onToggleExpand}
            whileHover={{ scale: 1.01 }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-4)' }}>
                {/* Status Icon */}
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-lg)',
                    background: goal.progress === 100 ? 'var(--gradient-success)' : 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0
                }}>
                    {categoryIcons[goal.category] || '🎯'}
                </div>

                {/* Goal Content */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
                        <h4 style={{ margin: 0, textDecoration: goal.progress === 100 ? 'line-through' : 'none' }}>
                            {goal.title}
                        </h4>
                        <span className={`badge ${goal.progress === 100 ? 'badge-success' : 'badge-primary'}`}>
                            {goal.progress === 100 ? 'Complete' : `${goal.progress}%`}
                        </span>
                        <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: priorityColors[goal.priority],
                            marginLeft: 'auto'
                        }} title={`${goal.priority} priority`} />
                    </div>

                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, marginBottom: 'var(--spacing-3)' }}>
                        {goal.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="progress-bar" style={{ marginBottom: 'var(--spacing-2)' }}>
                        <motion.div
                            className={`progress-bar-fill ${goal.progress === 100 ? 'progress-bar-success' : ''}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ background: goal.progress === 100 ? 'var(--gradient-success)' : 'var(--gradient-primary)' }}
                        />
                    </div>

                    {/* Meta Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                            <Calendar size={14} /> Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
                            <Flag size={14} /> {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
                        </span>
                    </div>
                </div>

                {/* Expand Icon */}
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={24} color="var(--color-text-muted)" />
                </motion.div>
            </div>

            {/* Expanded Content - Milestones */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            marginTop: 'var(--spacing-4)',
                            paddingTop: 'var(--spacing-4)',
                            borderTop: '1px solid var(--glass-border)'
                        }}>
                            <h5 style={{ marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                Milestones
                            </h5>
                            {goal.milestones.map(milestone => (
                                <div
                                    key={milestone.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-3)',
                                        padding: 'var(--spacing-2)',
                                        marginBottom: 'var(--spacing-2)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'background var(--transition-fast)'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleMilestone(milestone.id)
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-card-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    {milestone.completed ? (
                                        <CheckCircle2 size={20} color="var(--color-success)" />
                                    ) : (
                                        <Circle size={20} color="var(--color-text-muted)" />
                                    )}
                                    <span style={{
                                        textDecoration: milestone.completed ? 'line-through' : 'none',
                                        color: milestone.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)'
                                    }}>
                                        {milestone.text}
                                    </span>
                                </div>
                            ))}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
                                <button className="btn btn-secondary" onClick={(e) => e.stopPropagation()}>
                                    <Edit3 size={16} /> Edit
                                </button>
                                <button className="btn btn-secondary" style={{ color: 'var(--color-error)' }} onClick={(e) => e.stopPropagation()}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
