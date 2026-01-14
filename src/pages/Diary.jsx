import { BookOpen } from 'lucide-react'

export default function Diary() {
    return (
        <div>
            {/* Header */}
            <header className="page-header teal">
                <h1>Fitness Diary</h1>
            </header>

            {/* Content - Empty for iteration */}
            <div className="page-content">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <BookOpen size={32} />
                    </div>
                    <h3>Diary Page</h3>
                    <p>Ready to build together</p>
                </div>
            </div>
        </div>
    )
}
