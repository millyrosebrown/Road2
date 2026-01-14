import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, Navigation } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login, signup, connectionStatus } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                await login(email, password)
            } else {
                await signup(email, password, name)
            }
            navigate('/') // Go to Journey (home)
        } catch (err) {
            console.error('Login/Signup UI Error:', err);
            let message = 'Something went wrong';

            if (err.message?.includes('fetch')) {
                message = 'Network error: Cannot reach the server. Please check your internet or Appwrite settings.';
            } else if (err.code === 409) {
                message = 'An account with this email already exists.';
            } else if (err.code === 401) {
                message = 'Invalid email or password.';
            } else {
                message = err.message || message;
            }

            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--gradient-navy)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)'
        }}>
            {/* Logo */}
            <div style={{ marginBottom: 'var(--spacing-8)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-4)' }}>
                    <div className="nav-icon-wrapper" style={{ background: 'white', width: 64, height: 64 }}>
                        <Navigation size={32} color="var(--navy-primary)" />
                    </div>
                </div>
                <h1 style={{ color: 'white', fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-1)' }}>Road2</h1>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Your Recovery Journey Starts Here
                </p>
            </div>

            {/* Login Card */}
            <div style={{
                width: '100%',
                maxWidth: 380,
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--spacing-8)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                {/* Connection Warning */}
                {connectionStatus.status === 'error' && (
                    <div style={{
                        padding: 'var(--spacing-3)',
                        marginBottom: 'var(--spacing-4)',
                        background: 'rgba(239,68,68,0.1)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--error)',
                        fontSize: 'var(--font-size-xs)',
                        textAlign: 'center',
                        border: '1px solid rgba(239,68,68,0.2)'
                    }}>
                        <strong>⚠️ Connection Error:</strong> {connectionStatus.message}
                        <br />
                        <span style={{ fontSize: '10px' }}>Make sure this domain/hostname is added to your Appwrite Project Platforms.</span>
                    </div>
                )}
                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    marginBottom: 'var(--spacing-6)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-1)'
                }}>
                    <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-3)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            background: isLogin ? 'white' : 'transparent',
                            color: isLogin ? 'var(--navy-primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-3)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            background: !isLogin ? 'white' : 'transparent',
                            color: !isLogin ? 'var(--navy-primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: 'var(--spacing-3)',
                        marginBottom: 'var(--spacing-4)',
                        background: 'rgba(239,68,68,0.1)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--error)',
                        fontSize: 'var(--font-size-sm)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={{ marginBottom: 'var(--spacing-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Smith"
                                required={!isLogin}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-4)',
                                    border: '2px solid var(--bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    fontSize: 'var(--font-size-base)'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-4)',
                                border: '2px solid var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: 'var(--font-size-base)'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-6)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                            Password
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-4)',
                                border: '2px solid var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: 'var(--font-size-base)'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-full"
                        style={{ padding: 'var(--spacing-4)' }}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                </form>

                {/* Guest */}
                <div style={{ marginTop: 'var(--spacing-4)', textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)'
                        }}
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    )
}
