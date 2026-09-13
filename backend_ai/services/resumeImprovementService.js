const { chatJSON } = require('./cohereService');
const { parseJSONFromAI } = require('./aiResponseParser');

const VALID_STYLES = ['professional', 'concise', 'ats optimized', 'achievement-focused'];
const RESUME_SECTION_HEADINGS = [
    'contact information', 'professional summary', 'summary', 'objective',
    'skills', 'technical skills', 'experience', 'work experience', 'professional experience',
    'projects', 'personal projects', 'education', 'certifications', 'achievements',
    'awards', 'publications', 'languages', 'interests',
];

function normalizeHeading(line) {
    return line.trim().replace(/[:]$/, '').toLowerCase();
}

function getSectionHeadings(resumeText) {
    if (!resumeText) return [];

    return String(resumeText).split(/\r?\n/)
        .map(normalizeHeading)
        .filter((heading, index, lines) => heading && RESUME_SECTION_HEADINGS.includes(heading)
            && lines.indexOf(heading) === index)
        .map((heading) => heading.replace(/\b\w/g, (character) => character.toUpperCase()));
}

function extractResumeSection(resumeText, sectionName) {
    if (!resumeText || !sectionName) return '';

    const lines = String(resumeText).split(/\r?\n/);
    const wanted = sectionName.trim().toLowerCase();
    const startIndex = lines.findIndex((line) => {
        return normalizeHeading(line) === wanted;
    });

    if (startIndex < 0) return '';

    const endIndex = lines.slice(startIndex + 1).findIndex((line) => {
        return RESUME_SECTION_HEADINGS.includes(normalizeHeading(line));
    });
    const sectionLines = endIndex < 0
        ? lines.slice(startIndex)
        : lines.slice(startIndex, startIndex + endIndex + 1);

    return sectionLines.join('\n').trim();
}

async function improveSection(originalText, style = 'professional', context = {}) {
    const normalizedStyle = VALID_STYLES.includes(style.toLowerCase()) ? style : 'professional';

    const prompt = `You are a professional resume writer. Rewrite the following resume section in a ${normalizedStyle} style.

CRITICAL RULES:
- Use ONLY information explicitly provided in the input resume text. Do not fabricate, infer, substitute, or introduce any project, technology, metric, achievement, responsibility, or result that is not present in the source text. Preserve factual accuracy.
- Preserve all factual information, including project names, dates, technologies, titles, and functionality.
- If the original lacks metrics, do NOT add numbers, percentages, achievements, or results.
- Improve grammar, action verbs, clarity, ATS keyword placement, concision, and organization only.
- Return ONLY the rewritten resume content in the improved JSON field. Do not include commentary, explanations, or labels such as "The improvements highlight...".
- Return JSON: {"improved": "rewritten text"}

${context.jobDesc ? `Job Description context:\n${context.jobDesc.slice(0, 2000)}\n` : ''}
Original section:
${originalText}`;

    const rawText = await chatJSON(prompt, { maxTokens: 1200 });
    const parsed = parseJSONFromAI(rawText);

    return {
        original: originalText,
        improved: parsed?.improved ? String(parsed.improved) : originalText,
        style: normalizedStyle,
    };
}

module.exports = { improveSection, extractResumeSection, getSectionHeadings, VALID_STYLES };
