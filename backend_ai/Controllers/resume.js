const ResumeModel = require('../Models/resume');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { analyzeResume } = require('../services/resumeAnalysisService');
const {
    improveSection: improveSectionService,
    extractResumeSection,
} = require('../services/resumeImprovementService');
const { generateCoverLetter: generateCoverLetterService } = require('../services/coverLetterService');
const { generateInterviewQuestions: generateInterviewQuestionsService } = require('../services/interviewQuestionService');
const { compareAnalyses } = require('../services/comparisonService');

async function verifyOwnership(resumeId, userId) {
    const resume = await ResumeModel.findById(resumeId);
    if (!resume) return { error: 'Analysis not found', status: 404 };
    if (userId && resume.user.toString() !== userId.toString()) {
        return { error: 'Unauthorized access', status: 403 };
    }
    return { resume };
}

exports.addResume = async (req, res) => {
    let pdfPath = req.file?.path;
    try {
        const { job_desc, user } = req.body;
        console.log('[UPLOAD] Resume upload request received');
        console.log('[UPLOAD] User ID:', user);
        console.log('[UPLOAD] File info:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
        
        if (!req.file) {
            console.log('[UPLOAD] ERROR: No file uploaded');
            return res.status(400).json({ error: 'Resume PDF is required' });
        }
        if (!job_desc || !user) {
            console.log('[UPLOAD] ERROR: Missing job_desc or user');
            return res.status(400).json({ error: 'Job description and user are required' });
        }

        console.log('[PDF] Reading PDF file from:', pdfPath);
        const dataBuffer = fs.readFileSync(pdfPath);
        console.log('[PDF] File buffer size:', dataBuffer.length, 'bytes');
        
        console.log('[PDF] Parsing PDF...');
        let pdfData;
        try {
            pdfData = await pdfParse(dataBuffer);
        } catch (pdfErr) {
            console.error('[PDF] PDF parsing error:', pdfErr.message);
            throw new Error('Failed to parse PDF file: ' + pdfErr.message);
        }
        const resumeText = pdfData.text || '';
        console.log('[PDF] Extracted text length:', resumeText.length, 'characters');
        console.log('[PDF] First 200 chars:', resumeText.substring(0, 200));

        if (!resumeText.trim()) {
            console.log('[PDF] ERROR: No text extracted from PDF');
            return res.status(400).json({ error: 'Could not extract text from PDF. Please upload a text-based PDF.' });
        }

        console.log('[ANALYSIS] Starting analysis service with resume text length:', resumeText.length);
        const analysis = await analyzeResume(resumeText, job_desc);
        console.log('[ANALYSIS] Analysis complete, creating MongoDB document...');

        const newResume = new ResumeModel({
            user,
            resume_name: req.file.originalname,
            job_desc,
            jobTitle: analysis.jobTitle,
            company: analysis.company,
            resumeText: analysis.resumeText,
            score: analysis.score,
            overallMatch: analysis.overallMatch,
            feedback: analysis.feedback,
            keywordMatch: analysis.keywordMatch,
            skillsMatch: analysis.skillsMatch,
            experienceMatch: analysis.experienceMatch,
            educationScore: analysis.educationScore,
            projectScore: analysis.projectScore,
            formatting: analysis.formatting,
            jobRelevance: analysis.jobRelevance,
            matchingSkills: analysis.matchingSkills,
            missingSkills: analysis.missingSkills,
            matchingKeywords: analysis.matchingKeywords,
            missingKeywords: analysis.missingKeywords,
            skillGapAnalysis: analysis.skillGapAnalysis,
            qualityAnalysis: analysis.qualityAnalysis,
            sectionScores: analysis.sectionScores,
            roleRecommendations: analysis.roleRecommendations,
            suggestions: analysis.suggestions,
        });

        let persistenceWarning = '';
        try {
            console.log('[DB] Saving document to MongoDB...');
            await newResume.save();
            console.log('[DB] Document saved with ID:', newResume._id);
        } catch (dbErr) {
            persistenceWarning = 'Analysis completed, but it could not be saved to history because the database is unavailable.';
            console.error('[DB] Resume could not be saved:', dbErr.message);
        }

        if (pdfPath && fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            console.log('[CLEANUP] Temporary PDF file deleted');
        }

        console.log('[RESPONSE] Sending analysis result to frontend');
        console.log('[RESPONSE] Document ID:', newResume._id);
        console.log('[RESPONSE] Score:', newResume.score);
        console.log('[RESPONSE] matchingSkills count:', newResume.matchingSkills?.length || 0);
        console.log('[RESPONSE] missingSkills count:', newResume.missingSkills?.length || 0);
        
        const responseData = newResume.toObject();
        if (persistenceWarning) responseData.persistenceWarning = persistenceWarning;
        return res.status(200).json({ message: 'Your analysis is ready', data: responseData });
    } catch (err) {
        console.error('[ERROR] addResume error:', err.message);
        console.error('[ERROR] Stack:', err.stack);
        if (pdfPath && fs.existsSync(pdfPath)) {
            try { fs.unlinkSync(pdfPath); } catch (_) { /* ignore */ }
        }
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.getAllResumesForUser = async (req, res) => {
    try {
        const { user } = req.params;
        const resumes = await ResumeModel.find({ user })
            .select('-resumeText -job_desc')
            .sort({ createdAt: -1 });
        return res.status(200).json({ message: 'Your Previous History', resumes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.getResumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req.query;
        const { resume, error, status } = await verifyOwnership(id, user);
        if (error) return res.status(status).json({ error });
        return res.status(200).json({ message: 'Analysis retrieved', data: resume });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req.body;
        const { resume, error, status } = await verifyOwnership(id, user);
        if (error) return res.status(status).json({ error });
        await ResumeModel.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Analysis deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.deleteAllResumes = async (req, res) => {
    try {
        const { user } = req.body;
        if (!user) return res.status(400).json({ error: 'User is required' });

        const result = await ResumeModel.deleteMany({ user });
        return res.status(200).json({
            message: 'All analysis history deleted successfully',
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.compareResumes = async (req, res) => {
    try {
        const { analysisIdA, analysisIdB, user } = req.body;
        if (!analysisIdA || !analysisIdB) {
            return res.status(400).json({ error: 'Two analysis IDs are required' });
        }

        const [resumeA, resumeB] = await Promise.all([
            ResumeModel.findById(analysisIdA),
            ResumeModel.findById(analysisIdB),
        ]);

        if (!resumeA || !resumeB) {
            return res.status(404).json({ error: 'One or both analyses not found' });
        }
        if (user && (resumeA.user.toString() !== user || resumeB.user.toString() !== user)) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const comparison = compareAnalyses(resumeA, resumeB);
        return res.status(200).json({ message: 'Comparison ready', data: comparison });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.improveSection = async (req, res) => {
    try {
        const { analysisId, sectionName, sectionText, style, user } = req.body;

        if (analysisId && !sectionText?.trim()) {
            return res.status(400).json({ error: 'Type or paste a resume section before improving it' });
        }

        let jobDesc = '';
        let sourceText = sectionText;
        if (analysisId) {
            const { resume, error, status } = await verifyOwnership(analysisId, user);
            if (error) return res.status(status).json({ error });
            jobDesc = resume.job_desc || '';
            if (sectionName && !sectionText?.trim()) {
                sourceText = extractResumeSection(resume.resumeText, sectionName);
                if (!sourceText) {
                    return res.status(400).json({ error: `${sectionName} section was not found in the uploaded resume` });
                }
            } else if (sectionText?.trim()) {
                sourceText = sectionText;
            }
        }

        if (!sourceText?.trim()) {
            return res.status(400).json({ error: 'Section text is required' });
        }

        console.log('[IMPROVE] Improving section with style:', style);
        const result = await improveSectionService(sourceText, style, {
            jobDesc: '',
        });
        console.log('[IMPROVE] Section improved successfully');
        return res.status(200).json({ message: 'Section improved', data: result });
    } catch (err) {
        console.error('[IMPROVE] Error improving section:', err.message);
        console.error('[IMPROVE] Stack:', err.stack);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.generateCoverLetter = async (req, res) => {
    try {
        const { analysisId, user } = req.body;
        if (!analysisId) {
            return res.status(400).json({ error: 'Analysis ID is required' });
        }

        const { resume, error, status } = await verifyOwnership(analysisId, user);
        if (error) return res.status(status).json({ error });

        console.log('[COVER_LETTER] Generating cover letter for analysis:', analysisId);
        const result = await generateCoverLetterService(
            resume.resumeText,
            resume.job_desc,
            resume.jobTitle,
            resume.company
        );
        console.log('[COVER_LETTER] Cover letter generated successfully');

        resume.coverLetter = result.coverLetter;
        await resume.save();
        console.log('[COVER_LETTER] Cover letter saved to database');

        return res.status(200).json({ message: 'Cover letter generated', data: result });
    } catch (err) {
        console.error('[COVER_LETTER] Error generating cover letter:', err.message);
        console.error('[COVER_LETTER] Stack:', err.stack);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.generateInterviewQuestions = async (req, res) => {
    try {
        const { analysisId, user } = req.body;
        if (!analysisId) {
            return res.status(400).json({ error: 'Analysis ID is required' });
        }

        const { resume, error, status } = await verifyOwnership(analysisId, user);
        if (error) return res.status(status).json({ error });

        console.log('[INTERVIEW] Generating interview questions for analysis:', analysisId);
        const questions = await generateInterviewQuestionsService(resume.resumeText, resume.job_desc);
        console.log('[INTERVIEW] Questions generated, categories:', Object.keys(questions));
        
        resume.interviewQuestions = questions;
        await resume.save();
        console.log('[INTERVIEW] Interview questions saved to database');

        return res.status(200).json({ message: 'Interview questions generated', data: questions });
    } catch (err) {
        console.error('[INTERVIEW] Error generating interview questions:', err.message);
        console.error('[INTERVIEW] Stack:', err.stack);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.getResumeForAdmin = async (req, res) => {
    try {
        const resumes = await ResumeModel.find({})
            .select('-resumeText -job_desc')
            .sort({ createdAt: -1 })
            .populate('user');
        return res.status(200).json({ message: 'Fetched all history', resumes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};
