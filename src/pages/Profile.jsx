import { User, MapPin, Calendar, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Profile() {
    const patient = {
        name: 'John Smith',
        id: '12345',
        nextAppointment: {
            location: 'Main Clinic, Room 204',
            date: 'January 15, 2024',
            time: '10:30 AM'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Purple Header */}
            <header className="page-header purple">
                <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-1)' }}>
                    ROAD2
                </p>
                <h1>Patient Profile</h1>
            </header>

            {/* Profile Content */}
            <div className="page-content">
                {/* Avatar Section */}
                <motion.div
                    style={{ textAlign: 'center', marginTop: '-40px', marginBottom: 'var(--spacing-6)' }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="avatar avatar-large">
                        <User size={48} />
                    </div>
                    <h2 style={{ marginTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-1)' }}>
                        {patient.name}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Patient ID: {patient.id}
                    </p>
                </motion.div>

                {/* Case Info */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 600,
                        marginBottom: 'var(--spacing-4)',
                        color: 'var(--text-primary)'
                    }}>
                        CASE 1: Road 2 Your Recovery Journey
                    </h3>

                    {/* Appointment Card */}
                    <div className="card">
                        <h4 style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-4)',
                            color: 'var(--text-primary)'
                        }}>
                            Next Appointment Scheduled
                        </h4>

                        <div className="info-row">
                            <div className="info-row-icon">
                                <MapPin size={16} />
                            </div>
                            <div className="info-row-content">
                                <div className="info-row-label">Location</div>
                                <div className="info-row-value">{patient.nextAppointment.location}</div>
                            </div>
                        </div>

                        <div className="info-row">
                            <div className="info-row-icon">
                                <Calendar size={16} />
                            </div>
                            <div className="info-row-content">
                                <div className="info-row-label">Date</div>
                                <div className="info-row-value">
                                    {patient.nextAppointment.date} at {patient.nextAppointment.time}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="card" style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ marginBottom: 'var(--spacing-1)' }}>View Recovery Plan</h4>
                                <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                                    See your personalized rehab roadmap
                                </p>
                            </div>
                            <ChevronRight size={24} color="var(--purple-primary)" />
                        </div>
                    </div>

                    <div className="card" style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ marginBottom: 'var(--spacing-1)' }}>Update Personal Info</h4>
                                <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                                    Manage your profile details
                                </p>
                            </div>
                            <ChevronRight size={24} color="var(--purple-primary)" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
