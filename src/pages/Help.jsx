import { Info } from 'lucide-react'

export default function Help() {
    return (
        <div>
            {/* Header */}
            <header className="page-header navy">
                <h1>Information & Help</h1>
            </header>

            {/* Content - Empty for iteration */}
            <div className="page-content">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Info size={32} />
                    </div>
                    <h3>Help Page</h3>
                    <p>Ready to build together</p>
                </div>
            </div>
        </div>
    )
}
