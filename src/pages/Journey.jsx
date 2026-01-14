import { Map } from 'lucide-react'

export default function Journey() {
    return (
        <div>
            {/* Header */}
            <header className="page-header navy">
                <h1>Your Recovery Journey</h1>
            </header>

            {/* Content - Empty for iteration */}
            <div className="page-content">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Map size={32} />
                    </div>
                    <h3>Journey Page</h3>
                    <p>Ready to build together</p>
                </div>
            </div>
        </div>
    )
}
