const { GoogleGenAI } = require("@google/genai");
const z = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Fast lightweight model for lightning-quick responses with fallback
const PRIMARY_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_MODEL = "gemini-3.8-flash";

const interviewReportSchema = z.object({
    title: z.string().default("Interview Preparation Report"),
    matchScore: z.coerce.number().min(0).max(100).default(75),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string().default(""),
        answer: z.string().default("")
    })).min(1),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string().default(""),
        answer: z.string().default("")
    })).min(1),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.string().default("medium")
    })).default([]),
    preparationPlan: z.array(z.object({
        day: z.coerce.number().default(1),
        focus: z.string().default("Preparation Milestone"),
        tasks: z.array(z.string()).default([])
    })).min(1)
});

async function callGeminiWithFallback({ contents, config }) {
    try {
        const response = await ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents,
            config
        });
        if (response && response.text) return response;
    } catch (primaryErr) {
        console.warn(`Primary model ${PRIMARY_MODEL} failed, falling back to ${FALLBACK_MODEL}:`, primaryErr.message);
    }

    return await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents,
        config
    });
}

function cleanJsonResponse(text) {
    if (!text) return "";
    return text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert technical interviewer and recruitment specialist.
Analyze the following candidate information data files and generate a structured interview report.

================ CANDIDATE RESUME ================
${resume}

================ SELF DESCRIPTION ================
${selfDescription}

================ JOB DESCRIPTION ================
${jobDescription}

CRITICAL RULES:
1. You MUST populate EVERY single field requested in the JSON schema.
2. You MUST generate 5 technical questions inside the technicalQuestions array, targeting deep engineering profiles and architectural gaps.
3. You MUST generate 5 comprehensive scenario-based questions inside the behavioralQuestions array matching the STAR framework layout.
4. Fill technicalQuestions, behavioralQuestions, skillGaps, and preparationPlan arrays with deeply detailed objects.
5. Under skillGaps, enforce that 'severity' string must be textually exact to 'low', 'medium', or 'high'.
6. For preparationPlan, generate a 7-day preparation plan. The array should contain objects representing Day 1 through Day 7 sequentially.
7. Do NOT leave fields blank or omit arrays.`;

    const GoogleSchema = {
        type: "OBJECT",
        properties: {
            title: { 
                type: "STRING", 
                description: "The targeted role title extracted from the job description context." 
            },
            matchScore: { 
                type: "INTEGER", 
                description: "Alignment scoring index evaluate between 0 and 100." 
            },
            technicalQuestions: {
                type: "ARRAY",
                description: "An array containing detailed technical interview questions tailored to the role context.", 
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING", description: "Deep architectural technical question targeting profile gaps." },
                        intention: { type: "STRING", description: "The baseline reasoning strategy the interviewer is testing." },
                        answer: { type: "STRING", description: "Thorough model response outline for candidate guidance." }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            behavioralQuestions: {
                type: "ARRAY",
                description: "An array containing comprehensive behavioral questions mapping to workplace psychology indices.",
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING", description: "Scenario based cultural or team challenge matching the STAR framework." },
                        intention: { type: "STRING", description: "The underlying workplace psychology metric evaluated." },
                        answer: { type: "STRING", description: "Strategic response framework guidance metrics." }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            skillGaps: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        skill: { type: "STRING", description: "Missing requirement framework item on the active resume mapping." },
                        severity: { type: "STRING", description: "Priority tracking tier: low, medium, or high." }
                    },
                    required: ["skill", "severity"]
                }
            },
            preparationPlan: {
                type: "ARRAY",
                description: "A chronological study roadmap with sequential objects.",
                items: {
                    type: "OBJECT",
                    properties: {
                        day: { type: "INTEGER", description: "Day counter integer tracking milestones starting at 1." },
                        focus: { type: "STRING", description: "Ecosystem block target study topic for the candidate." },
                        tasks: { 
                            type: "ARRAY", 
                            items: { type: "STRING" },
                            description: "Explicit coding practice items or conceptual tutorials lists." 
                        }
                    },
                    required: ["day", "focus", "tasks"]
                }
            }
        },
        required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
    };

    const response = await callGeminiWithFallback({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: GoogleSchema
        }
    });

    if (!response || !response.text) {
        throw new Error("Gemini returned an empty response");
    }

    let parsedData;
    const cleanedText = cleanJsonResponse(response.text);

    try {
        parsedData = JSON.parse(cleanedText);
    } catch (error) {
        console.error("Invalid JSON from Gemini:", response.text);
        throw new Error("Gemini returned invalid JSON");
    }

    const validatedData = interviewReportSchema.parse(parsedData);
    return validatedData;

}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ 
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    });
    await browser.close();
    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a professional resume for a candidate with the following details:
Resume info: ${resume}
Self Description: ${selfDescription}
Target Job Description: ${jobDescription}

The response must be a valid JSON object with a single field "html", containing clean, well-styled, ATS-friendly HTML for a 1-2 page professional resume.
Include styled headers, contact info placeholder, skills section, work experience, and education formatted for standard A4 printing.`;

    const resumeGoogleSchema = {
        type: "OBJECT",
        properties: {
            html: {
                type: "STRING",
                description: "The complete, styled HTML markup for the ATS-friendly resume."
            }
        },
        required: ["html"]
    };

    const response = await callGeminiWithFallback({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeGoogleSchema
        }
    });

    if (!response || !response.text) {
        throw new Error("Gemini returned an empty response for resume generation");
    }

    const cleanedText = cleanJsonResponse(response.text);
    const jsonContent = JSON.parse(cleanedText);

    if (!jsonContent.html || typeof jsonContent.html !== "string") {
        throw new Error("Gemini response does not contain valid HTML");
    }

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);
    return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
