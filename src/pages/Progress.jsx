import { useState } from 'react'
import {
    TrendingUp,
    Calendar,
    Activity,
    Target,
    Flame
} from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

// Sample progress data
const weeklyData = [
    { day: 'Mon', exercises: 4, pain: 6, goals: 2 },
    { day: 'Tue', exercises: 5, pain: 5, goals: 3 },
    { day: 'Wed', exercises: 3, pain: 5, goals: 2 },
    { day: 'Thu', exercises: 5, pain: 4, goals: 4 },
    { day: 'Fri', exercises: 4, pain: 4, goals: 3 },
    { day: 'Sat', exercises: 2, pain: 3, goals: 1 },
    { day: 'Sun', exercises: 3, pain: 3, goals: 2 },
]

const monthlyPainData = [
    { week: 'Week 1', avg: 7 },
    { week: 'Week 2', avg: 6 },
    { week: 'Week 3', avg: 5 },
    { week: 'Week 4', avg: 4 },
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

export default function Progress() {
    const [timeRange, setTimeRange] = useState('week')

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Page Header */}
            <motion.div className="page-header" variants={itemVariants}>
                <h1>Progress</h1>
                <p className="page-subtitle">Track your rehabilitation journey and see how far you've come.</p>
            </motion.div>

            {/* Time Range Selector */}
            <motion.div variants={itemVariants} style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    {['week', 'month', 'all'].map(range => (
                        <button
                            key={range}
                            className={`btn ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div className="stats-grid" variants={itemVariants} style={{ marginBottom: 'var(--spacing-6)' }}>
                <StatCard
                    icon={<Activity />}
                    title="Exercise Completion"
                    value="86%"
                    change="+12%"
                    positive
                />
                <StatCard
                    icon={<Target />}
                    title="Goals Achieved"
                    value="5/7"
                    change="+2 this week"
                    positive
                />
                <StatCard
                    icon={<TrendingUp />}
                    title="Pain Reduction"
                    value="43%"
                    change="From 7 to 4"
                    positive
                />
                <StatCard
                    icon={<Flame />}
                    title="Current Streak"
                    value="12 days"
                    change="Personal best!"
                    positive
                />
            </motion.div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-6)' }}>
                {/* Exercise Completion Chart */}
                <motion.div className="card" variants={itemVariants}>
                    <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Exercise Activity</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="exerciseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="day" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a2e',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="exercises"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#exerciseGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Pain Level Chart */}
                <motion.div className="card" variants={itemVariants}>
                    <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Pain Level Trend</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <LineChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="day" stroke="#64748b" />
                                <YAxis stroke="#64748b" domain={[0, 10]} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a2e',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pain"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#10b981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', textAlign: 'center' }}>
                        Great progress! Your pain levels are trending downward 📉
                    </p>
                </motion.div>
            </div>

            {/* Monthly Overview */}
            <motion.div className="card" variants={itemVariants} style={{ marginTop: 'var(--spacing-6)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Monthly Pain Reduction</h3>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <AreaChart data={monthlyPainData}>
                            <defs>
                                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="week" stroke="#64748b" />
                            <YAxis stroke="#64748b" domain={[0, 10]} />
                            <Tooltip
                                contentStyle={{
                                    background: '#1a1a2e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="avg"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fill="url(#monthlyGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Achievements */}
            <motion.div className="card" variants={itemVariants} style={{ marginTop: 'var(--spacing-6)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Recent Achievements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                    <AchievementBadge
                        emoji="🔥"
                        title="7-Day Streak"
                        description="Completed exercises 7 days in a row"
                        unlocked
                    />
                    <AchievementBadge
                        emoji="🎯"
                        title="Goal Crusher"
                        description="Completed 5 goals this week"
                        unlocked
                    />
                    <AchievementBadge
                        emoji="💪"
                        title="Pain Fighter"
                        description="Reduced pain by 30%"
                        unlocked
                    />
                    <AchievementBadge
                        emoji="🏆"
                        title="Consistency King"
                        description="Complete 30 days of exercises"
                        unlocked={false}
                    />
                </div>
            </motion.div>
        </motion.div>
    )
}

function StatCard({ icon, title, value, change, positive }) {
    return (
        <motion.div
            className="card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-3)' }}>
                <div className="card-icon" style={{ width: 40, height: 40 }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                {value}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
                {title}
            </div>
            <div style={{
                fontSize: 'var(--font-size-xs)',
                color: positive ? 'var(--color-success)' : 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-1)'
            }}>
                <TrendingUp size={14} />
                {change}
            </div>
        </motion.div>
    )
}

function AchievementBadge({ emoji, title, description, unlocked }) {
    return (
        <motion.div
            style={{
                padding: 'var(--spacing-4)',
                background: unlocked ? 'var(--color-bg-card)' : 'transparent',
                border: `1px solid ${unlocked ? 'var(--glass-border)' : 'var(--color-bg-tertiary)'}`,
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                opacity: unlocked ? 1 : 0.4
            }}
            whileHover={unlocked ? { scale: 1.05 } : {}}
        >
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-2)' }}>
                {unlocked ? emoji : '🔒'}
            </div>
            <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>
                {title}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {description}
            </div>
        </motion.div>
    )
}
