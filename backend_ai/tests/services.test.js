const { parseJSONFromAI, parseScore, toStringArray } = require('../services/aiResponseParser');
const { matchKeywords } = require('../services/keywordService');
const { buildDeterministicScores, computeOverallAtsScore } = require('../services/atsScoringService');
const { analyzeResumeQuality } = require('../services/resumeQualityService');
const { compareAnalyses } = require('../services/comparisonService');
const { extractResumeSection } = require('../services/resumeImprovementService');

describe('AI Response Parser', () => {
    test('parseJSONFromAI extracts JSON from code fences', () => {
        const raw = '```json\n{"score": 82}\n```';
        expect(parseJSONFromAI(raw)).toEqual({ score: 82 });
    });

    test('parseScore clamps values to 0-100', () => {
        expect(parseScore(150)).toBe(100);
        expect(parseScore(-10)).toBe(0);
        expect(parseScore('75')).toBe(75);
        expect(parseScore(null, 50)).toBe(50);
    });

    test('toStringArray filters invalid entries', () => {
        expect(toStringArray(['a', 1, '', null])).toEqual(['a', '1']);
    });
});

describe('Keyword Service', () => {
    test('matchKeywords finds matching and missing keywords', () => {
        const resume = 'Experienced React and Node.js developer with MongoDB experience';
        const jd = 'Looking for React developer with AWS and Docker skills';
        const result = matchKeywords(resume, jd);
        expect(result.matchingKeywords.length).toBeGreaterThan(0);
        expect(result.keywordScore).toBeGreaterThanOrEqual(0);
        expect(result.keywordScore).toBeLessThanOrEqual(100);
    });
});

describe('ATS Scoring Service', () => {
    test('buildDeterministicScores returns valid scores', () => {
        const resume = 'John Doe\nExperience\nSoftware Engineer at Tech Co 2020-2024\nDeveloped React apps\nSkills: JavaScript, Node.js\nEducation: BS Computer Science';
        const jd = 'React developer with Node.js and MongoDB experience required';
        const scores = buildDeterministicScores(resume, jd);
        expect(scores.keywordMatch).toBeGreaterThanOrEqual(0);
        expect(scores.formatting).toBeGreaterThanOrEqual(0);
        expect(scores.educationScore).toBeGreaterThan(0);
    });

    test('computeOverallAtsScore calculates weighted average', () => {
        const score = computeOverallAtsScore({
            keywordMatch: 80,
            skillsMatch: 70,
            experienceMatch: 60,
            educationScore: 90,
            projectScore: 50,
            formatting: 75,
            jobRelevance: 85,
        });
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
    });
});

describe('Resume Quality Service', () => {
    test('analyzeResumeQuality detects missing sections', () => {
        const shortResume = 'John Doe\nWorked on stuff';
        const issues = analyzeResumeQuality(shortResume);
        expect(issues.length).toBeGreaterThan(0);
        expect(issues.some((i) => i.severity === 'critical' || i.severity === 'warning')).toBe(true);
    });
});

describe('Resume Improvement Service', () => {
    test('extractResumeSection returns only the uploaded Projects section', () => {
        const resume = [
            'Skills',
            'React.js, Node.js',
            'Projects',
            'AI Resume Analyzer and Job Matcher',
            'Tech Stack: React.js, Vite, JavaScript',
            'Description: Developed an AI-powered application.',
            'Education',
            'Bachelor of Science',
        ].join('\n');

        expect(extractResumeSection(resume, 'projects')).toBe([
            'Projects',
            'AI Resume Analyzer and Job Matcher',
            'Tech Stack: React.js, Vite, JavaScript',
            'Description: Developed an AI-powered application.',
        ].join('\n'));
    });
});

describe('Comparison Service', () => {
    test('compareAnalyses calculates score difference', () => {
        const a = {
            _id: '1',
            resume_name: 'v1.pdf',
            score: 64,
            overallMatch: 60,
            matchingKeywords: ['react'],
            matchingSkills: ['javascript'],
            sectionScores: [{ section: 'Skills', score: 70 }],
            qualityAnalysis: [{ severity: 'warning', message: 'Weak summary' }],
            createdAt: '2024-01-01',
        };
        const b = {
            _id: '2',
            resume_name: 'v2.pdf',
            score: 78,
            overallMatch: 75,
            matchingKeywords: ['react', 'node'],
            matchingSkills: ['javascript', 'node'],
            sectionScores: [{ section: 'Skills', score: 85 }],
            qualityAnalysis: [],
            createdAt: '2024-02-01',
        };
        const result = compareAnalyses(a, b);
        expect(result.atsImprovement).toBe(14);
        expect(result.newKeywords).toContain('node');
        expect(result.improvedSections.length).toBeGreaterThan(0);
    });
});
