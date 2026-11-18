import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return { success: true, report: response.interviewReport }
            }
            return { success: false, message: "No report returned from server." }
        } catch (error) {
            console.error("Error generating report:", error)
            const message = error.response?.data?.message || error.message || "Failed to generate report."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (id) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return { success: true, report: response.interviewReport }
            }
            return { success: false, message: "Report not found" }
        } catch (error) {
            console.error("Error fetching report:", error)
            const message = error.response?.data?.message || error.message || "Failed to load report."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            if (response && response.interviewReports) {
                setReports(response.interviewReports)
                return { success: true, reports: response.interviewReports }
            }
            return { success: false, message: "No reports found" }
        } catch (error) {
            console.error("Error fetching reports:", error)
            const message = error.response?.data?.message || error.message || "Failed to load reports."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            return { success: true }
        } catch (error) {
            console.error("Error downloading resume:", error)
            const message = error.response?.data?.message || error.message || "Failed to generate resume PDF."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { 
        loading, 
        report, 
        reports, 
        generateReport, 
        getReportById, 
        getReports, 
        getResumePdf 
    }
}
