import { Target } from 'lucide-react'

export default function Goals() {
    return (
        <div>
            {/* Header */}
            <header className="page-header navy">
                <h1>Daily Goals</h1>
            </header>

            {/* Content - Empty for iteration */}
            <div className="page-content">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Target size={32} />
                    </div>
                    <h3>Goals Page</h3>
                    <p>Ready to build together</p>
                </div>
            </div>
        </div>
    )
}
