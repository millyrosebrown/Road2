import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { User, Target, Navigation, Calendar, Settings } from 'lucide-react'
import { AuthProvider } from './lib/AuthContext'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Goals from './pages/Goals'
import Journey from './pages/Journey'
import Diary from './pages/Diary'
import Help from './pages/Help'
import WeekPlanner from './pages/WeekPlanner'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Journey />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/journey" element={<Journey />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/help" element={<Help />} />
            <Route path="/week/:weekNumber" element={<WeekPlanner />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  )
}

function BottomNav() {
  // Hide nav on login page
  if (window.location.pathname === '/login') return null

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'goals', label: 'Goals', icon: Target, path: '/goals' },
    { id: 'journey', label: 'Journey', icon: Navigation, path: '/' },
    { id: 'diary', label: 'Fitness Diary', icon: Calendar, path: '/diary' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/help' },
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map(({ path, icon: Icon, label, id }) => (
        <NavLink
          key={id}
          to={path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <Icon size={20} />
          </div>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default App
