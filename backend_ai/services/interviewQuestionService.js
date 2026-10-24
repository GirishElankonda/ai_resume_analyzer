const { chatJSON } = require('./cohereService');
const { parseJSONFromAI } = require('./aiResponseParser');

function normalizeQuestions(items) {
    if (!Array.isArray(items)) return [];
    return items.map((q) => {
        if (typeof q === 'string') return { question: q, suggestedPoints: [] };
        return {
            question: String(q.question || ''),
            suggestedPoints: Array.isArray(q.suggestedPoints) ? q.suggestedPoints.map(String) : [],
        };
    }).filter((q) => q.question);
}

async function generateInterviewQuestions(resumeText, jobDesc) {
    const prompt = `Generate interview questions based ONLY on the resume and job description.
Do NOT ask about technologies or projects not mentioned in the resume.

Return JSON:
{
  "technical": [{"question": "...", "suggestedPoints": ["point to cover"]}],
  "project": [{"question": "...", "suggestedPoints": ["..."]}],
  "behavioral": [{"question": "...", "suggestedPoints": ["..."]}],
  "jobSpecific": [{"question": "...", "suggestedPoints": ["..."]}]
}

Generate 4-5 questions per category.

Resume:
${resumeText.slice(0, 10000)}

Job Description:
${jobDesc.slice(0, 4000)}`;

    const rawText = await chatJSON(prompt, { maxTokens: 3500 });
    const parsed = parseJSONFromAI(rawText) || {};

    return {
        technical: normalizeQuestions(parsed.technical),
        project: normalizeQuestions(parsed.project),
        behavioral: normalizeQuestions(parsed.behavioral),
        jobSpecific: normalizeQuestions(parsed.jobSpecific),
    };
}

module.exports = { generateInterviewQuestions };
