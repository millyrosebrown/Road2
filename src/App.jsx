import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { User, Target, Map, BookOpen, Info } from 'lucide-react'
import Profile from './pages/Profile'
import Goals from './pages/Goals'
import Journey from './pages/Journey'
import Diary from './pages/Diary'
import Help from './pages/Help'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/help" element={<Help />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  )
}

function BottomNav() {
  const navItems = [
    { to: '/', icon: User, label: 'Profile' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/journey', icon: Map, label: 'Journey' },
    { to: '/diary', icon: BookOpen, label: 'Diary' },
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
