import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { User, Target, Map, BookOpen, Info } from 'lucide-react'
import { AuthProvider } from './lib/AuthContext'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Goals from './pages/Goals'
import Journey from './pages/Journey'
import Diary from './pages/Diary'
import Help from './pages/Help'
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
    { to: '/', icon: Map, label: 'Journey' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/diary', icon: BookOpen, label: 'Diary' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/help', icon: Info, label: 'Help' },
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
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
