const { SECTION_PATTERNS } = require('./atsScoringService');

const WEAK_VERBS = ['worked', 'helped', 'did', 'made', 'responsible for', 'involved in'];
const BUZZWORDS = ['synergy', 'leverage', 'paradigm', 'rockstar', 'ninja', 'guru', 'go-getter', 'think outside the box'];

function analyzeResumeQuality(resumeText, aiQuality = []) {
    const issues = [];
    const text = resumeText || '';
    const lower = text.toLowerCase();
    const lines = text.split('\n').filter((l) => l.trim());

    const checkSection = (name, pattern) => {
        if (!pattern.test(text)) {
            issues.push({
                severity: name === 'contact' || name === 'experience' ? 'critical' : 'warning',
                category: 'Missing Section',
                message: `Missing or unclear ${name} section`,
            });
        }
    };

    Object.entries(SECTION_PATTERNS).forEach(([name, pattern]) => checkSection(name, pattern));

    if (lower.includes('summary') || lower.includes('objective') || lower.includes('profile')) {
        const summaryMatch = text.match(/(?:summary|objective|profile)[:\s]*([^\n]{10,300})/i);
        if (summaryMatch && summaryMatch[1].split(/\s+/).length < 15) {
            issues.push({ severity: 'warning', category: 'Weak Summary', message: 'Professional summary appears too brief' });
        }
    } else {
        issues.push({ severity: 'warning', category: 'Weak Summary', message: 'No professional summary detected' });
    }

    const weakVerbHits = WEAK_VERBS.filter((v) => lower.includes(v));
    if (weakVerbHits.length >= 2) {
        issues.push({
            severity: 'warning',
            category: 'Weak Action Verbs',
            message: `Uses weak verbs like: ${weakVerbHits.slice(0, 3).join(', ')}`,
        });
    }

    const buzzHits = BUZZWORDS.filter((b) => lower.includes(b));
    if (buzzHits.length > 0) {
        issues.push({
            severity: 'warning',
            category: 'Excessive Buzzwords',
            message: `Contains buzzwords: ${buzzHits.join(', ')}`,
        });
    }

    const longSentences = lines.filter((l) => l.split(/\s+/).length > 35);
    if (longSentences.length >= 2) {
        issues.push({ severity: 'warning', category: 'Long Sentences', message: 'Several bullet points or sentences are too long' });
    }

    const words = lower.split(/\s+/).filter(Boolean);
    const wordFreq = {};
    words.forEach((w) => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const repeated = Object.entries(wordFreq).filter(([w, c]) => c > 8 && w.length > 4).map(([w]) => w);
    if (repeated.length > 0) {
        issues.push({
            severity: 'warning',
            category: 'Repeated Words',
            message: `Overused words: ${repeated.slice(0, 3).join(', ')}`,
        });
    }

    const hasMetrics = /\b\d+%|\$\d+|\d+\+|\d{2,}\s*(users|clients|customers|projects|team members)\b/i.test(text);
    if (!hasMetrics) {
        issues.push({
            severity: 'warning',
            category: 'Measurable Achievements',
            message: 'Few or no quantifiable achievements detected',
        });
    }

    const bulletLines = lines.filter((l) => /^[\s•\-\*]/.test(l) || l.trim().startsWith('-'));
    if (bulletLines.length > 0) {
        const weakBullets = bulletLines.filter((b) => b.split(/\s+/).length < 6);
        if (weakBullets.length >= 3) {
            issues.push({ severity: 'warning', category: 'Poor Bullet Points', message: 'Several bullet points are too short or vague' });
        }
    }

    const years = text.match(/\b(19|20)\d{2}\b/g) || [];
    const uniqueYears = [...new Set(years)];
    if (uniqueYears.length >= 2) {
        const sorted = uniqueYears.map(Number).sort((a, b) => a - b);
        const gaps = sorted.slice(1).some((y, i) => y - sorted[i] > 15);
        if (gaps) {
            issues.push({ severity: 'warning', category: 'Inconsistent Dates', message: 'Date ranges may be inconsistent or unclear' });
        }
    }

    const wordCount = words.length;
    if (wordCount > 1000) {
        issues.push({ severity: 'warning', category: 'Resume Length', message: 'Resume may be too long for ATS scanning' });
    }

    if (SECTION_PATTERNS.skills.test(text) === false) {
        issues.push({ severity: 'critical', category: 'Technical Skills', message: 'No dedicated skills section detected' });
    }

    const strengths = [];
    if (hasMetrics) strengths.push({ severity: 'strength', category: 'Achievements', message: 'Includes measurable achievements' });
    if (SECTION_PATTERNS.experience.test(text)) strengths.push({ severity: 'strength', category: 'Experience', message: 'Experience section is present' });
    if (SECTION_PATTERNS.education.test(text)) strengths.push({ severity: 'strength', category: 'Education', message: 'Education section is present' });
    if (bulletLines.length >= 5) strengths.push({ severity: 'strength', category: 'Formatting', message: 'Uses bullet points for readability' });

    const aiIssues = Array.isArray(aiQuality) ? aiQuality : [];
    const merged = [...strengths, ...issues, ...aiIssues];

    const seen = new Set();
    return merged.filter((item) => {
        const key = `${item.severity}-${item.category}-${item.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

module.exports = { analyzeResumeQuality };
