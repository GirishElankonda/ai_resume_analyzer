const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'also', 'into', 'over', 'after', 'before', 'between', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'any', 'our', 'your', 'their', 'my', 'me', 'him', 'her',
    'us', 'them', 'about', 'above', 'below', 'up', 'down', 'out', 'off', 'through', 'during',
    'while', 'within', 'without', 'across', 'along', 'around', 'per', 'via', 'able', 'work',
    'working', 'experience', 'years', 'year', 'role', 'position', 'job', 'team', 'company',
    'required', 'preferred', 'including', 'using', 'use', 'using', 'looking', 'join', 'help',
    'build', 'develop', 'strong', 'excellent', 'good', 'knowledge', 'skills', 'ability',
]);

const TECH_PATTERNS = [
    /\b(?:javascript|typescript|python|java|c\+\+|c#|ruby|go|golang|rust|php|swift|kotlin|scala|r)\b/gi,
    /\b(?:react|angular|vue|node\.?js|express|django|flask|spring|laravel|next\.?js|nestjs)\b/gi,
    /\b(?:mongodb|postgresql|mysql|redis|elasticsearch|dynamodb|sqlite|oracle|sql server)\b/gi,
    /\b(?:aws|azure|gcp|docker|kubernetes|k8s|terraform|jenkins|ci\/cd|github actions)\b/gi,
    /\b(?:rest|graphql|api|microservices|agile|scrum|git|linux|html|css|sass|tailwind)\b/gi,
    /\b(?:machine learning|deep learning|nlp|data science|tensorflow|pytorch|pandas|numpy)\b/gi,
];

function normalizeText(text) {
    return (text || '').toLowerCase().replace(/[^\w\s+#.\-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractKeywords(text) {
    const normalized = normalizeText(text);
    const words = normalized.split(' ').filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    const freq = {};

    words.forEach((w) => {
        freq[w] = (freq[w] || 0) + 1;
    });

    const techKeywords = new Set();
    TECH_PATTERNS.forEach((pattern) => {
        const matches = text.match(pattern) || [];
        matches.forEach((m) => techKeywords.add(m.toLowerCase()));
    });

    const ranked = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 60)
        .map(([word]) => word);

    return [...new Set([...techKeywords, ...ranked])];
}

function keywordPresentInResume(keyword, resumeText) {
    const normalizedResume = normalizeText(resumeText);
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) return false;
    if (normalizedResume.includes(normalizedKeyword)) return true;

    const parts = normalizedKeyword.split(/[\s/]+/).filter((p) => p.length > 2);
    if (parts.length > 1) {
        return parts.every((part) => normalizedResume.includes(part));
    }
    return false;
}

function matchKeywords(resumeText, jobDesc) {
    const jdKeywords = extractKeywords(jobDesc);
    const matchingKeywords = [];
    const missingKeywords = [];

    jdKeywords.forEach((kw) => {
        if (keywordPresentInResume(kw, resumeText)) {
            matchingKeywords.push(kw);
        } else {
            missingKeywords.push(kw);
        }
    });

    const keywordScore = jdKeywords.length === 0
        ? 70
        : Math.round((matchingKeywords.length / jdKeywords.length) * 100);

    return {
        matchingKeywords: matchingKeywords.slice(0, 30),
        missingKeywords: missingKeywords.slice(0, 20),
        keywordScore,
        totalJdKeywords: jdKeywords.length,
    };
}

module.exports = { extractKeywords, matchKeywords, keywordPresentInResume, normalizeText };
