import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Dumbbell } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Diary() {
    const [currentWeek, setCurrentWeek] = useState('Jan 12 - Jan 18')

    const days = [
        {
            name: 'Monday',
            date: 'Jan 12',
            isToday: true,
            exercises: []
        },
        {
            name: 'Tuesday',
            date: 'Jan 13',
            isToday: false,
            exercises: [
                { id: 1, name: 'Quad Stretches', sets: 3, reps: 10 },
                { id: 2, name: 'Heel Slides', sets: 3, reps: 15 }
            ]
        },
        {
            name: 'Wednesday',
            date: 'Jan 14',
            isToday: false,
            exercises: []
        },
    ]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Teal Header */}
            <header className="page-header teal">
                <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-1)' }}>
                    ROAD2
                </p>
                <h1>Fitness Diary</h1>
            </header>

            {/* Content */}
            <div className="page-content">
                {/* Week Selector */}
                <motion.div
                    className="week-selector"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <button className="week-selector-btn">
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <div className="week-selector-text">Week of</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentWeek}</div>
                    </div>
                    <button className="week-selector-btn">
                        <ChevronRight size={18} />
                    </button>
                </motion.div>

                {/* Program Week */}
                <motion.div
                    className="card"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    style={{ marginBottom: 'var(--spacing-4)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500 }}>Current Program Week</span>
                        <span style={{
                            fontWeight: 700,
                            color: 'var(--teal-primary)',
                            background: 'rgba(20, 184, 166, 0.1)',
                            padding: 'var(--spacing-1) var(--spacing-3)',
                            borderRadius: 'var(--radius-full)'
                        }}>
                            Week 1
                        </span>
                    </div>
                </motion.div>

                {/* Day Cards */}
                {days.map((day, index) => (
                    <motion.div
                        key={day.name}
                        className="day-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <div className="day-card-header">
                            <div>
                                <div className="day-card-title">{day.name}</div>
                                <div className="day-card-date">
                                    {day.date} {day.isToday && '• Today'}
                                </div>
                            </div>
                            <div className="day-card-count">
                                {day.exercises.length} exercises
                            </div>
                        </div>

                        {day.exercises.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                                {day.exercises.map(exercise => (
                                    <div
                                        key={exercise.id}
                                        style={{
                                            background: 'rgba(255,255,255,0.15)',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: 'var(--spacing-3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-3)'
                                        }}
                                    >
                                        <Dumbbell size={18} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 500 }}>{exercise.name}</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                                                {exercise.sets} sets × {exercise.reps} reps
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="exercise-placeholder">
                                <p style={{ margin: 0, marginBottom: 'var(--spacing-2)', opacity: 0.8 }}>
                                    No exercises planned
                                </p>
                            </div>
                        )}

                        <button className="add-exercise-btn" style={{ marginTop: 'var(--spacing-3)' }}>
                            <Plus size={18} />
                            Add Extra Exercise
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
