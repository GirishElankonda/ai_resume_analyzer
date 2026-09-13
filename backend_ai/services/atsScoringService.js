const { matchKeywords } = require('./keywordService');
const { parseScore } = require('./aiResponseParser');

const SECTION_PATTERNS = {
    contact: /\b(email|phone|linkedin|github|address|contact)\b/i,
    summary: /\b(summary|objective|profile|about me)\b/i,
    skills: /\b(skills|technical skills|competencies|technologies)\b/i,
    experience: /\b(experience|employment|work history|professional experience)\b/i,
    projects: /\b(projects|portfolio|personal projects)\b/i,
    education: /\b(education|degree|university|college|bachelor|master|phd)\b/i,
    certifications: /\b(certification|certified|certificate)\b/i,
    achievements: /\b(achievements|awards|honors|accomplishments)\b/i,
};

const ACTION_VERBS = [
    'developed', 'designed', 'implemented', 'led', 'managed', 'created', 'built',
    'optimized', 'improved', 'delivered', 'achieved', 'reduced', 'increased',
    'automated', 'architected', 'deployed', 'migrated', 'collaborated', 'analyzed',
];

function computeFormattingScore(resumeText) {
    if (!resumeText || resumeText.trim().length < 50) return 30;

    let score = 50;
    const text = resumeText;
    const lines = text.split('\n').filter((l) => l.trim().length > 0);

    Object.values(SECTION_PATTERNS).forEach((pattern) => {
        if (pattern.test(text)) score += 5;
    });

    const hasBullets = /[•\-\*]/.test(text) || /^\s*[-•*]\s/m.test(text);
    if (hasBullets) score += 8;

    const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / Math.max(lines.length, 1);
    if (avgLineLength < 120) score += 7;
    if (avgLineLength > 200) score -= 10;

    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 900) score += 10;
    if (wordCount > 1200) score -= 15;

    return Math.min(Math.max(score, 0), 100);
}

function computeExperienceIndicators(resumeText) {
    const text = resumeText.toLowerCase();
    let score = 40;

    const yearMatches = text.match(/\b(19|20)\d{2}\b/g) || [];
    if (yearMatches.length >= 2) score += 15;

    const rolePatterns = /\b(developer|engineer|manager|analyst|intern|lead|architect|consultant)\b/gi;
    const roleCount = (text.match(rolePatterns) || []).length;
    score += Math.min(roleCount * 5, 20);

    const actionCount = ACTION_VERBS.filter((v) => text.includes(v)).length;
    score += Math.min(actionCount * 3, 21);

    const hasMetrics = /\b\d+%|\$\d+|\d+\+|\d{2,}\s*(users|clients|customers|projects)\b/i.test(text);
    if (hasMetrics) score += 14;

    return Math.min(Math.max(score, 0), 100);
}

function computeOverallAtsScore(scores) {
    const weights = {
        keywordMatch: 0.20,
        skillsMatch: 0.20,
        experienceMatch: 0.15,
        educationScore: 0.10,
        projectScore: 0.10,
        formatting: 0.10,
        jobRelevance: 0.15,
    };

    let total = 0;
    let weightSum = 0;

    Object.entries(weights).forEach(([key, weight]) => {
        if (scores[key] != null) {
            total += scores[key] * weight;
            weightSum += weight;
        }
    });

    return weightSum === 0 ? 0 : Math.round(total / weightSum);
}

function buildDeterministicScores(resumeText, jobDesc) {
    const keywordResult = matchKeywords(resumeText, jobDesc);
    const formatting = computeFormattingScore(resumeText);
    const experienceMatch = computeExperienceIndicators(resumeText);

    const hasEducation = SECTION_PATTERNS.education.test(resumeText);
    const hasProjects = SECTION_PATTERNS.projects.test(resumeText);
    const educationScore = hasEducation ? 75 : 35;
    const projectScore = hasProjects ? 78 : 45;

    return {
        keywordMatch: keywordResult.keywordScore,
        formatting,
        experienceMatch,
        educationScore,
        projectScore,
        matchingKeywords: keywordResult.matchingKeywords,
        missingKeywords: keywordResult.missingKeywords,
    };
}

function mergeScores(deterministic, aiData = {}) {
    const scores = {
        keywordMatch: parseScore(deterministic.keywordMatch, 55),
        skillsMatch: parseScore(aiData.skillsMatch ?? deterministic.skillsMatch, 55),
        experienceMatch: parseScore(
            Math.round((deterministic.experienceMatch + parseScore(aiData.experienceMatch, deterministic.experienceMatch)) / 2),
            deterministic.experienceMatch
        ),
        educationScore: parseScore(aiData.educationScore ?? deterministic.educationScore, deterministic.educationScore),
        projectScore: parseScore(aiData.projectScore ?? deterministic.projectScore, deterministic.projectScore),
        formatting: parseScore(
            Math.round((deterministic.formatting + parseScore(aiData.formatting, deterministic.formatting)) / 2),
            deterministic.formatting
        ),
        jobRelevance: parseScore(aiData.jobRelevance, 55),
    };

    scores.score = computeOverallAtsScore(scores);
    scores.overallMatch = parseScore(aiData.overallMatch ?? scores.jobRelevance, scores.jobRelevance);

    return scores;
}

module.exports = {
    buildDeterministicScores,
    mergeScores,
    computeFormattingScore,
    computeOverallAtsScore,
    SECTION_PATTERNS,
};
