import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Home, Target, Dumbbell, TrendingUp, User, Menu } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import Exercises from './pages/Exercises'
import Progress from './pages/Progress'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <TrendingUp size={24} />
          </div>
          <span className="logo-text">Road2</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Home className="nav-icon" size={20} />
              <span className="nav-text">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Target className="nav-icon" size={20} />
              <span className="nav-text">Goals</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/exercises" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Dumbbell className="nav-icon" size={20} />
              <span className="nav-text">Exercises</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/progress" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <TrendingUp className="nav-icon" size={20} />
              <span className="nav-text">Progress</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">Client</span>
            <span className="user-status">Active Plan</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default App
