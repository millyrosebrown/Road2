import { Info, HelpCircle, MessageSquare, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Help() {
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
                <h1>Information & Help</h1>
            </header>

            {/* Content */}
            <div className="page-content">
                {/* About Section */}
                <motion.div
                    className="card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}
                >
                    <div style={{
                        width: 64,
                        height: 64,
                        margin: '0 auto var(--spacing-4)',
                        background: 'var(--gradient-purple)',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Info size={32} />
                    </div>
                    <h3 style={{ marginBottom: 'var(--spacing-2)' }}>ROAD2 Recovery</h3>
                    <p style={{ margin: 0, marginBottom: 'var(--spacing-2)' }}>
                        Your personalized physio rehabilitation companion
                    </p>
                    <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-muted)'
                    }}>
                        Version 1.0.0
                    </span>
                </motion.div>

                {/* Help Cards */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card" style={{ cursor: 'pointer', marginBottom: 'var(--spacing-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                            <div className="card-icon teal">
                                <HelpCircle size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ marginBottom: 'var(--spacing-1)' }}>How to Use ROAD2</h4>
                                <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                                    Follow your personalized recovery roadmap week by week
                                </p>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </div>
                    </div>

                    <div className="card" style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                            <div className="card-icon" style={{ background: 'var(--success)' }}>
                                <MessageSquare size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ marginBottom: 'var(--spacing-1)' }}>Contact Support</h4>
                                <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                                    Get help from our support team
                                </p>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </div>
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginTop: 'var(--spacing-6)' }}
                >
                    <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Frequently Asked Questions</h3>

                    <div className="card">
                        <h4 style={{ marginBottom: 'var(--spacing-2)' }}>How do I track my progress?</h4>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                            Visit the Journey tab to see your recovery roadmap and completed milestones.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: 'var(--spacing-2)' }}>How do I add exercises?</h4>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                            Go to the Diary tab and tap "Add Extra Exercise" on any day.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: 'var(--spacing-2)' }}>When is my next appointment?</h4>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                            Check the Profile tab for your upcoming appointment details.
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
