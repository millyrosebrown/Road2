import { useState } from 'react'
import { 
  Dumbbell, 
  Plus, 
  CheckCircle2, 
  Clock,
  Play,
  RotateCcw,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const initialExercises = [
  {
    id: 1,
    title: 'Quad Stretches',
    description: 'Stretch your quadriceps by pulling your foot toward your glutes while standing.',
    sets: 3,
    reps: 10,
    holdTime: 30,
    category: 'stretching',
    difficulty: 'easy',
    completed: false,
    painLevel: null
  },
  {
    id: 2,
    title: 'Heel Slides',
    description: 'Lie on your back and slowly slide your heel toward your buttocks, bending your knee.',
    sets: 3,
    reps: 15,
    holdTime: null,
    category: 'mobility',
    difficulty: 'easy',
    completed: true,
    painLevel: 2
  },
  {
    id: 3,
    title: 'Straight Leg Raises',
    description: 'Lie on your back with one leg bent. Lift the straight leg to the height of the bent knee.',
    sets: 3,
    reps: 12,
    holdTime: 5,
    category: 'strength',
    difficulty: 'medium',
    completed: false,
    painLevel: null
  },
  {
    id: 4,
    title: 'Wall Squats',
    description: 'Lean against a wall and lower into a squat position, holding for the specified time.',
    sets: 3,
    reps: 10,
    holdTime: 15,
    category: 'strength',
    difficulty: 'medium',
    completed: false,
    painLevel: null
  },
  {
    id: 5,
    title: 'Calf Raises',
    description: 'Stand on one foot and raise up onto your toes, then slowly lower back down.',
    sets: 3,
    reps: 15,
    holdTime: null,
    category: 'strength',
    difficulty: 'easy',
    completed: true,
    painLevel: 1
  },
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

export default function Exercises() {
  const [exercises, setExercises] = useState(initialExercises)
  const [filter, setFilter] = useState('all')
  const [activeExercise, setActiveExercise] = useState(null)

  const filteredExercises = filter === 'all' 
    ? exercises 
    : filter === 'completed'
    ? exercises.filter(e => e.completed)
    : filter === 'pending'
    ? exercises.filter(e => !e.completed)
    : exercises.filter(e => e.category === filter)

  const completedCount = exercises.filter(e => e.completed).length
  const pendingCount = exercises.filter(e => !e.completed).length

  const markComplete = (id, painLevel) => {
    setExercises(exercises.map(e => 
      e.id === id ? { ...e, completed: true, painLevel } : e
    ))
    setActiveExercise(null)
  }

  const resetExercise = (id) => {
    setExercises(exercises.map(e => 
      e.id === id ? { ...e, completed: false, painLevel: null } : e
    ))
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
            <h1>Exercises</h1>
            <p className="page-subtitle">Your prescribed exercises for today's rehabilitation session.</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={20} /> Add Exercise
          </button>
        </div>
      </motion.div>

      {/* Progress Summary */}
      <motion.div variants={itemVariants} className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Today's Progress</h3>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {completedCount} of {exercises.length} exercises completed
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{ width: 200 }}>
              <div className="progress-bar" style={{ height: 12 }}>
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / exercises.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ background: 'var(--gradient-success)' }}
                />
              </div>
            </div>
            <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
              {Math.round((completedCount / exercises.length) * 100)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: `Pending (${pendingCount})` },
            { value: 'completed', label: `Completed (${completedCount})` },
            { value: 'stretching', label: 'Stretching' },
            { value: 'strength', label: 'Strength' },
            { value: 'mobility', label: 'Mobility' },
          ].map(tab => (
            <button
              key={tab.value}
              className={`btn ${filter === tab.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Exercises List */}
      <motion.div variants={itemVariants}>
        <AnimatePresence>
          {filteredExercises.map((exercise, index) => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              index={index}
              isActive={activeExercise === exercise.id}
              onStart={() => setActiveExercise(exercise.id)}
              onComplete={(painLevel) => markComplete(exercise.id, painLevel)}
              onReset={() => resetExercise(exercise.id)}
              onCancel={() => setActiveExercise(null)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredExercises.length === 0 && (
        <div className="empty-state">
          <Dumbbell size={64} className="empty-state-icon" />
          <h3>No exercises found</h3>
          <p>Try changing your filter or add a new exercise.</p>
        </div>
      )}
    </motion.div>
  )
}

function ExerciseCard({ exercise, index, isActive, onStart, onComplete, onReset, onCancel }) {
  const [selectedPain, setSelectedPain] = useState(null)

  const difficultyColors = {
    easy: 'var(--color-success)',
    medium: 'var(--color-warning)',
    hard: 'var(--color-error)'
  }

  const categoryEmojis = {
    stretching: '🧘',
    strength: '💪',
    mobility: '🦵',
    balance: '⚖️'
  }

  return (
    <motion.div
      className="exercise-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      style={{
        opacity: exercise.completed ? 0.7 : 1,
        borderColor: isActive ? 'var(--color-primary)' : 'var(--glass-border)'
      }}
    >
      {/* Thumbnail */}
      <div className="exercise-thumbnail" style={{ 
        background: exercise.completed ? 'var(--gradient-success)' : 'var(--gradient-accent)',
        fontSize: '2rem'
      }}>
        {exercise.completed ? <CheckCircle2 size={32} /> : categoryEmojis[exercise.category] || '🏋️'}
      </div>

      {/* Exercise Info */}
      <div className="exercise-info" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-1)' }}>
          <h4 className="exercise-title" style={{ 
            margin: 0,
            textDecoration: exercise.completed ? 'line-through' : 'none'
          }}>
            {exercise.title}
          </h4>
          <span className={`badge ${exercise.completed ? 'badge-success' : 'badge-primary'}`}>
            {exercise.completed ? 'Done' : exercise.difficulty}
          </span>
        </div>
        
        <p className="exercise-description">{exercise.description}</p>
        
        <div className="exercise-stats">
          <span className="exercise-stat">
            <strong>{exercise.sets}</strong> sets
          </span>
          <span className="exercise-stat">
            <strong>{exercise.reps}</strong> reps
          </span>
          {exercise.holdTime && (
            <span className="exercise-stat">
              <strong>{exercise.holdTime}s</strong> hold
            </span>
          )}
          {exercise.painLevel !== null && (
            <span className="exercise-stat" style={{ color: exercise.painLevel <= 3 ? 'var(--color-success)' : exercise.painLevel <= 6 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              Pain: <strong>{exercise.painLevel}/10</strong>
            </span>
          )}
        </div>

        {/* Active Exercise Panel */}
        <AnimatePresence>
          {isActive && !exercise.completed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ 
                marginTop: 'var(--spacing-4)', 
                paddingTop: 'var(--spacing-4)', 
                borderTop: '1px solid var(--glass-border)',
                overflow: 'hidden'
              }}
            >
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                Rate your pain level after completing this exercise:
              </p>
              
              <div className="pain-scale" style={{ marginBottom: 'var(--spacing-4)' }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <button
                    key={level}
                    className={`pain-level ${selectedPain === level ? 'selected' : ''} ${level <= 3 ? 'low' : level <= 6 ? 'medium' : 'high'}`}
                    onClick={() => setSelectedPain(level)}
                    style={{
                      background: selectedPain === level 
                        ? level <= 3 ? 'rgba(16, 185, 129, 0.3)' 
                        : level <= 6 ? 'rgba(245, 158, 11, 0.3)' 
                        : 'rgba(239, 68, 68, 0.3)'
                        : 'transparent'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <button 
                  className="btn btn-success" 
                  onClick={() => onComplete(selectedPain ?? 0)}
                  disabled={selectedPain === null}
                  style={{ opacity: selectedPain === null ? 0.5 : 1 }}
                >
                  <CheckCircle2 size={16} /> Mark Complete
                </button>
                <button className="btn btn-secondary" onClick={onCancel}>
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {!exercise.completed && !isActive && (
          <button className="btn btn-primary" onClick={onStart}>
            <Play size={16} /> Start
          </button>
        )}
        {exercise.completed && (
          <button className="btn btn-secondary" onClick={onReset}>
            <RotateCcw size={16} /> Reset
          </button>
        )}
      </div>
    </motion.div>
  )
}
