import { User } from 'lucide-react'

export default function Profile() {
    return (
        <div>
            {/* Header */}
            <header className="page-header navy">
                <img
                    src="/logo.png"
                    alt="Road2 Rehabilitation"
                    style={{ height: 40, marginBottom: 'var(--spacing-2)' }}
                />
                <h1>Patient Profile</h1>
            </header>

            {/* Content - Empty for iteration */}
            <div className="page-content">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <User size={32} />
                    </div>
                    <h3>Profile Page</h3>
                    <p>Ready to build together</p>
                </div>
            </div>
        </div>
    )
}
