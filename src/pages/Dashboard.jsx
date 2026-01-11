import { useState } from 'react'
import {
    Target,
    Dumbbell,
    Flame,
    Calendar,
    TrendingUp,
    ChevronRight,
    CheckCircle2,
    Clock,
    Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

// Sample data - this would come from Appwrite later
const sampleGoals = [
    { id: 1, title: 'Walk 5000 steps daily', progress: 75, category: 'mobility', dueDate: '2 days left' },
    { id: 2, title: 'Complete knee exercises', progress: 100, category: 'strength', dueDate: 'Completed' },
    { id: 3, title: 'Reduce pain level to 2/10', progress: 60, category: 'pain', dueDate: '1 week left' },
]

const sampleExercises = [
    { id: 1, title: 'Quad Stretches', sets: 3, reps: 10, completed: true },
    { id: 2, title: 'Heel Slides', sets: 3, reps: 15, completed: true },
    { id: 3, title: 'Straight Leg Raises', sets: 3, reps: 12, completed: false },
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

export default function Dashboard() {
    const [streak] = useState(12)
    const completedToday = sampleExercises.filter(e => e.completed).length
    const totalToday = sampleExercises.length

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Page Header */}
            <motion.div className="page-header" variants={itemVariants}>
                <h1>Welcome back! 👋</h1>
                <p className="page-subtitle">Track your recovery journey and stay on top of your rehab goals.</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div className="stats-grid" variants={itemVariants}>
                <StatCard
                    icon={<Flame />}
                    value={streak}
                    label="Day Streak"
                    gradient="warning"
                />
                <StatCard
                    icon={<Target />}
                    value={`${completedToday}/${totalToday}`}
                    label="Today's Exercises"
                    gradient="primary"
                />
                <StatCard
                    icon={<TrendingUp />}
                    value="78%"
                    label="Weekly Progress"
                    gradient="success"
                />
                <StatCard
                    icon={<Calendar />}
                    value="14"
                    label="Days Active"
                    gradient="accent"
                />
            </motion.div>

            {/* Main Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Left Column - Today's Plan */}
                <motion.div variants={itemVariants}>
                    <div className="card">
                        <div className="section-header">
                            <h3 className="section-title">Today's Exercises</h3>
                            <button className="btn btn-secondary">
                                View All <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="todays-plan">
                            {sampleExercises.map((exercise, index) => (
                                <ExerciseItem key={exercise.id} exercise={exercise} index={index} />
                            ))}
                        </div>
                    </div>

                    {/* Goals Section */}
                    <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
                        <div className="section-header">
                            <h3 className="section-title">Active Goals</h3>
                            <button className="btn btn-secondary">
                                View All <ChevronRight size={16} />
                            </button>
                        </div>

                        {sampleGoals.slice(0, 3).map((goal, index) => (
                            <GoalItem key={goal.id} goal={goal} index={index} />
                        ))}
                    </div>
                </motion.div>

                {/* Right Column - Progress Overview */}
                <motion.div variants={itemVariants}>
                    <div className="card">
                        <h3 className="section-title" style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
                            Weekly Progress
                        </h3>

                        <ProgressCircle progress={78} />

                        <div style={{ marginTop: 'var(--spacing-6)' }}>
                            <ProgressItem label="Exercises Completed" value="24/28" progress={86} />
                            <ProgressItem label="Goals Achieved" value="5/7" progress={71} />
                            <ProgressItem label="Pain Reduction" value="40%" progress={40} />
                        </div>
                    </div>

                    {/* Motivation Card */}
                    <div className="card" style={{ marginTop: 'var(--spacing-6)', background: 'var(--gradient-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
                            <Zap size={24} />
                            <h4 style={{ margin: 0 }}>Keep it up!</h4>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                            You're on a {streak}-day streak! Complete today's exercises to keep your momentum going.
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

function StatCard({ icon, value, label, gradient }) {
    const gradientColors = {
        primary: 'var(--gradient-primary)',
        success: 'var(--gradient-success)',
        accent: 'var(--gradient-accent)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
    }

    return (
        <motion.div
            className="card stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="card-icon" style={{ background: gradientColors[gradient], margin: '0 auto var(--spacing-4)' }}>
                {icon}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </motion.div>
    )
}

function ExerciseItem({ exercise, index }) {
    return (
        <motion.div
            className="plan-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className={`plan-item-icon exercise`}>
                {exercise.completed ? <CheckCircle2 size={24} /> : <Dumbbell size={24} />}
            </div>
            <div className="plan-item-content">
                <div className="plan-item-title" style={{
                    textDecoration: exercise.completed ? 'line-through' : 'none',
                    opacity: exercise.completed ? 0.6 : 1
                }}>
                    {exercise.title}
                </div>
                <div className="plan-item-meta">
                    {exercise.sets} sets × {exercise.reps} reps
                </div>
            </div>
            <div className={`badge ${exercise.completed ? 'badge-success' : 'badge-primary'}`}>
                {exercise.completed ? 'Done' : 'Pending'}
            </div>
        </motion.div>
    )
}

function GoalItem({ goal, index }) {
    return (
        <motion.div
            className="goal-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className={`goal-checkbox ${goal.progress === 100 ? 'checked' : ''}`}>
                {goal.progress === 100 && <CheckCircle2 size={16} />}
            </div>
            <div className="goal-content">
                <div className="goal-title">{goal.title}</div>
                <div className="goal-meta">{goal.dueDate}</div>
            </div>
            <div className="goal-progress">
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${goal.progress}%` }}
                    />
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', textAlign: 'right' }}>
                    {goal.progress}%
                </div>
            </div>
        </motion.div>
    )
}

function ProgressCircle({ progress }) {
    const radius = 50
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference

    return (
        <div className="progress-circle-container">
            <svg width="120" height="120" viewBox="0 0 120 120">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                </defs>
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="var(--color-bg-tertiary)"
                    strokeWidth="10"
                />
                <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
            </svg>
            <div className="progress-circle-text">
                <div className="progress-circle-value">{progress}%</div>
                <div className="progress-circle-label">Complete</div>
            </div>
        </div>
    )
}

function ProgressItem({ label, value, progress }) {
    return (
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{value}</span>
            </div>
            <div className="progress-bar">
                <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}
