import React, { useState, useRef } from 'react'
import "../style/Home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ errorMessage, setErrorMessage ] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        if (!isPdf) {
            setErrorMessage("Please upload a PDF file (.pdf)")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage("Resume file size must be less than 5MB")
            return
        }

        setErrorMessage("")
        setResumeFile(file)
    }

    const handleRemoveResume = () => {
        setResumeFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 KB"
        const kb = bytes / 1024
        if (kb < 1024) return `${kb.toFixed(1)} KB`
        return `${(kb / 1024).toFixed(1)} MB`
    }

    const handleGenerateReport = async () => {
        setErrorMessage("")

        if (!jobDescription.trim()) {
            setErrorMessage("Target Job Description is required. Please paste it before proceeding.")
            return
        }

        if (!resumeFile && !selfDescription.trim()) {
            setErrorMessage("Please either upload a resume PDF or enter a quick self-description.")
            return
        }

        const result = await generateReport({ 
            jobDescription: jobDescription.trim(), 
            selfDescription: resumeFile ? "" : selfDescription.trim(), 
            resumeFile 
        })

        if (result && result.success && result.report) {
            navigate(`/interview/${result.report._id}`)
        } else {
            setErrorMessage(result?.message || "Failed to generate report. Please try again.")
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='loading-spinner'></div>
                <h1>Generating Your Interview Strategy...</h1>
                <p>Career Copilot AI is analyzing your profile against the target job requirements. This typically takes just a few seconds.</p>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Top Navigation Bar with Career Copilot AI Branding */}
            <nav className='home-nav'>
                <div className='brand-logo'>
                    <div className='brand-icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                    </div>
                    <span>Career Copilot</span>
                    <span className='ai-pill'>AI</span>
                </div>
                {user && (
                    <div className='user-actions'>
                        <span className='user-greeting'>Hi, <strong>{user.username || user.email}</strong></span>
                        <button onClick={handleLogout} className='logout-btn'>Log out</button>
                    </div>
                )}
            </nav>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let Career Copilot AI analyze the job requirements and your candidate profile to build a winning interview strategy.</p>
            </header>

            {/* Error Banner */}
            {errorMessage && (
                <div className='error-banner'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>

                            {resumeFile ? (
                                /* Showing exactly which PDF was uploaded */
                                <div className='uploaded-file-card'>
                                    <div className='uploaded-file-card__info'>
                                        <div className='uploaded-file-card__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                                <polyline points="10 9 9 9 8 9" />
                                            </svg>
                                        </div>
                                        <div className='uploaded-file-card__details'>
                                            <span className='uploaded-file-card__name' title={resumeFile.name}>
                                                {resumeFile.name}
                                            </span>
                                            <span className='uploaded-file-card__meta'>
                                                <span>{formatFileSize(resumeFile.size)}</span>
                                                <span>&bull;</span>
                                                <span className='uploaded-file-card__badge'>✓ Uploaded PDF</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className='uploaded-file-card__actions'>
                                        <button 
                                            type='button' 
                                            onClick={handleRemoveResume} 
                                            className='uploaded-file-card__remove-btn'
                                            title='Remove uploaded resume'>
                                            ✕ Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    </span>
                                    <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                    <p className='dropzone__subtitle'>PDF Document (Max 5MB)</p>
                                    <input 
                                        ref={resumeInputRef} 
                                        onChange={handleFileChange}
                                        hidden 
                                        type='file' 
                                        id='resume' 
                                        name='resume' 
                                        accept='.pdf' 
                                    />
                                </label>
                            )}
                        </div>

                        {/* Divider */}
                        <div className='or-divider'><span>or</span></div>

                        {/* Quick Self-Description (Disabled when resume is uploaded) */}
                        <div className='self-description'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className='section-label' htmlFor='selfDescription'>
                                    Quick Self-Description
                                </label>
                                {resumeFile && (
                                    <span className='badge badge--disabled'>Disabled</span>
                                )}
                            </div>
                            <textarea
                                value={resumeFile ? "" : selfDescription}
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                disabled={Boolean(resumeFile)}
                                className={`panel__textarea panel__textarea--short ${resumeFile ? 'panel__textarea--disabled' : ''}`}
                                placeholder={
                                    resumeFile
                                        ? "Description disabled: Using your uploaded PDF resume for interview planning."
                                        : "Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                }
                            />
                            {resumeFile && (
                                <div className='disabled-notice'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    <span>Disabled because resume PDF is uploaded. Remove resume above to type manually.</span>
                                </div>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume PDF</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Fast (3-6s)</span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <div className='reports-list'>
                        {reports.map(report => (
                            <div key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Target Role'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className='match-score'>Match Score: {report.matchScore}%</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home
