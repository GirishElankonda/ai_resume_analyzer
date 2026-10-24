const { chatJSON } = require('./cohereService');
const { parseJSONFromAI } = require('./aiResponseParser');

async function generateCoverLetter(resumeText, jobDesc, jobTitle = '', company = '') {
    const prompt = `Write a professional, concise cover letter based ONLY on information in the resume.
Do NOT invent experience, skills, companies, or achievements not present in the resume.

Job Title: ${jobTitle || 'the position'}
Company: ${company || 'the company'}

Return JSON: {"coverLetter": "full cover letter text"}

Resume:
${resumeText.slice(0, 10000)}

Job Description:
${jobDesc.slice(0, 4000)}`;

    const rawText = await chatJSON(prompt, { maxTokens: 2000 });
    const parsed = parseJSONFromAI(rawText);

    return {
        coverLetter: parsed?.coverLetter ? String(parsed.coverLetter).trim() : 'Unable to generate cover letter.',
    };
}

module.exports = { generateCoverLetter };
