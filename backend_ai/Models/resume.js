const mongoose = require('mongoose');

const SkillItemSchema = new mongoose.Schema({
    skill: String,
    category: String,
}, { _id: false });

const SkillGapSchema = new mongoose.Schema({
    strong: [SkillItemSchema],
    moderate: [SkillItemSchema],
    missing: [SkillItemSchema],
    recommendations: [String],
}, { _id: false });

const QualityItemSchema = new mongoose.Schema({
    severity: { type: String, enum: ['strength', 'warning', 'critical'] },
    category: String,
    message: String,
}, { _id: false });

const SectionScoreSchema = new mongoose.Schema({
    section: String,
    score: Number,
    strengths: [String],
    problems: [String],
    recommendations: [String],
}, { _id: false });

const RoleRecommendationSchema = new mongoose.Schema({
    role: String,
    matchPercent: Number,
    reason: String,
}, { _id: false });

const InterviewQuestionSchema = new mongoose.Schema({
    question: String,
    suggestedPoints: [String],
}, { _id: false });

const InterviewQuestionsSchema = new mongoose.Schema({
    technical: [InterviewQuestionSchema],
    project: [InterviewQuestionSchema],
    behavioral: [InterviewQuestionSchema],
    jobSpecific: [InterviewQuestionSchema],
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    resume_name: {
        type: String,
        required: true,
    },
    job_desc: {
        type: String,
        required: true,
    },
    jobTitle: { type: String, default: '' },
    company: { type: String, default: '' },
    resumeText: { type: String, default: '' },
    score: { type: Number },
    overallMatch: { type: Number },
    feedback: { type: String },
    keywordMatch: { type: Number },
    skillsMatch: { type: Number },
    experienceMatch: { type: Number },
    educationScore: { type: Number },
    projectScore: { type: Number },
    formatting: { type: Number },
    jobRelevance: { type: Number },
    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    matchingKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    skillGapAnalysis: { type: SkillGapSchema, default: () => ({}) },
    qualityAnalysis: { type: [QualityItemSchema], default: [] },
    sectionScores: { type: [SectionScoreSchema], default: [] },
    roleRecommendations: { type: [RoleRecommendationSchema], default: [] },
    suggestions: { type: [String], default: [] },
    coverLetter: { type: String, default: '' },
    interviewQuestions: { type: InterviewQuestionsSchema, default: () => ({}) },
}, { timestamps: true });

const resumeModel = mongoose.model('resume', ResumeSchema);
module.exports = resumeModel;
