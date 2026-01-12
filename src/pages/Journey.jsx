import { Lock, CheckCircle2, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Journey() {
    const milestones = [
        { id: 1, week: 'Week 1', status: 'completed' },
        { id: 2, week: 'Week 2', status: 'completed' },
        { id: 3, week: 'Week 3', status: 'current' },
        { id: 4, week: 'Week 4', status: 'locked' },
        { id: 5, week: 'Week 5', status: 'locked' },
        { id: 6, week: 'Week 6', status: 'locked' },
        { id: 7, week: 'Week 7', status: 'locked' },
        { id: 8, week: 'Week 8', status: 'locked' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '100vh', background: 'var(--bg-beige)' }}
        >
            {/* Journey Title */}
            <div style={{
                padding: 'var(--spacing-6)',
                textAlign: 'center',
                position: 'relative'
            }}>
                <motion.h1
                    style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: 700,
                        color: 'var(--navy-road)',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase'
                    }}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    Your Recovery Journey
                </motion.h1>
            </div>

            {/* Road Container */}
            <div style={{
                position: 'relative',
                padding: '0 var(--spacing-6)',
                paddingBottom: 'var(--spacing-12)'
            }}>
                {/* SVG Road Path */}
                <svg
                    viewBox="0 0 200 600"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '100%',
                        zIndex: 0
                    }}
                >
                    <path
                        d="M 100 20 
               Q 40 80 100 140 
               Q 160 200 100 260 
               Q 40 320 100 380 
               Q 160 440 100 500
               Q 40 560 100 600"
                        fill="none"
                        stroke="var(--navy-road)"
                        strokeWidth="35"
                        strokeLinecap="round"
                    />
                    {/* Road center line */}
                    <path
                        d="M 100 20 
               Q 40 80 100 140 
               Q 160 200 100 260 
               Q 40 320 100 380 
               Q 160 440 100 500
               Q 40 560 100 600"
                        fill="none"
                        stroke="#F5F0E6"
                        strokeWidth="3"
                        strokeDasharray="15 10"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Milestones */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {milestones.map((milestone, index) => {
                        const isLeft = index % 2 === 0
                        const topOffset = 20 + (index * 70)

                        return (
                            <motion.div
                                key={milestone.id}
                                style={{
                                    position: 'absolute',
                                    top: topOffset,
                                    left: isLeft ? '15%' : '55%',
                                    display: 'flex',
                                    flexDirection: isLeft ? 'row' : 'row-reverse',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-3)'
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                {/* Milestone Circle */}
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 'var(--radius-full)',
                                    background: milestone.status === 'completed' ? 'var(--gradient-teal)'
                                        : milestone.status === 'current' ? 'var(--gradient-purple)'
                                            : 'var(--bg-secondary)',
                                    border: `3px solid ${milestone.status === 'completed' ? 'var(--teal-primary)'
                                            : milestone.status === 'current' ? 'var(--purple-primary)'
                                                : 'var(--navy-road)'
                                        }`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: milestone.status === 'locked' ? 'var(--text-muted)' : 'white',
                                    boxShadow: milestone.status === 'current'
                                        ? '0 0 20px rgba(124, 58, 237, 0.4)'
                                        : 'var(--shadow-md)',
                                    transform: milestone.status === 'current' ? 'scale(1.1)' : 'scale(1)'
                                }}>
                                    {milestone.status === 'completed' && <CheckCircle2 size={24} />}
                                    {milestone.status === 'current' && <Star size={24} />}
                                    {milestone.status === 'locked' && <Lock size={20} />}
                                </div>

                                {/* Milestone Label */}
                                <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 600,
                                    color: milestone.status === 'locked' ? 'var(--text-muted)' : 'var(--text-primary)'
                                }}>
                                    {milestone.week}
                                </span>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Spacer for absolute positioned elements */}
                <div style={{ height: 600 }} />
            </div>
        </motion.div>
    )
}
