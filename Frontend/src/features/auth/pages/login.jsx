import React, { useState } from 'react';
import "../auth.form.scss";
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!email.trim() || !password.trim()) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        const result = await handleLogin({ email: email.trim(), password });

        if (result.success) {
            navigate('/home');
        } else {
            setErrorMessage(result.message || "Invalid email or password");
        }
    };

    if (loading) {
        return (
            <main>
                <div className="brand-header">
                    <div className="brand-logo-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                    </div>
                    <div className="brand-title-wrap">
                        <h1 className="brand-title">Career Copilot</h1>
                        <span className="ai-badge">AI</span>
                    </div>
                </div>
                <h2 style={{ marginTop: '1.5rem', color: '#8b949e', fontSize: '1.1rem' }}>Signing you in...</h2>
            </main>
        );
    }

    return (
        <main>
            <div className="form-wrapper">

                {/* ── Career Copilot AI Brand Header ── */}
                <div className="brand-header">
                    <div className="brand-logo-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                    </div>
                    <div className="brand-title-wrap">
                        <h1 className="brand-title">Career Copilot</h1>
                        <span className="ai-badge">AI</span>
                    </div>
                    <p className="brand-tagline">
                        Your AI-Powered Interview Preparation &amp; Career Acceleration Assistant
                    </p>
                </div>

                {/* ── Login Form Card ── */}
                <div className="form-container">
                    <div className="form-title-group">
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue to your customized interview preparation</p>
                    </div>

                    {errorMessage && (
                        <div className="error-banner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <input 
                                onChange={(e) => { setEmail(e.target.value) }}
                                value={email}
                                type="email" 
                                id="email" 
                                placeholder="name@example.com" 
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                onChange={(e) => { setPassword(e.target.value) }}
                                value={password}
                                type="password" 
                                id="password" 
                                placeholder="Enter your password" 
                                required
                            />
                        </div>
                        <button type="submit" className="auth-submit-btn">
                            Sign In to Career Copilot AI
                        </button>
                    </form>

                    <p className="auth-footer-link">
                        Don't have an account? <Link to="/register">Create an account</Link>
                    </p>
                </div>

                {/* ── Feature Highlights ── */}
                <div className="feature-pills">
                    <span className="pill">⚡ Instant Strategy Generation</span>
                    <span className="pill">🎯 Role Question Predictor</span>
                    <span className="pill">📄 ATS Resume Optimization</span>
                </div>

            </div>
        </main>
    );
};

export default Login;
