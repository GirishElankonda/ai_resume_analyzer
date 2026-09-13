const { chatJSON } = require('./cohereService');
const { parseJSONFromAI, toStringArray } = require('./aiResponseParser');
const { buildDeterministicScores, mergeScores } = require('./atsScoringService');
const { analyzeResumeQuality } = require('./resumeQualityService');

function buildAnalysisPrompt(resumeText, jobDesc, deterministic) {
    return `You are an expert ATS resume analyst. Analyze the resume against the job description.
Use ONLY information present in the resume. Do NOT invent companies, skills, metrics, or experience.

Pre-computed keyword analysis (use as reference, you may refine):
- Matching keywords: ${deterministic.matchingKeywords.slice(0, 15).join(', ') || 'none'}
- Missing keywords: ${deterministic.missingKeywords.slice(0, 15).join(', ') || 'none'}

Return a JSON object with EXACTLY these fields:
{
  "jobTitle": "extracted job title from JD or empty string",
  "company": "extracted company from JD or empty string",
  "skillsMatch": 0-100,
  "experienceMatch": 0-100,
  "educationScore": 0-100,
  "projectScore": 0-100,
  "formatting": 0-100,
  "jobRelevance": 0-100,
  "overallMatch": 0-100,
  "matchingSkills": ["skills in BOTH resume and JD"],
  "missingSkills": ["important JD skills NOT in resume"],
  "matchingKeywords": ["keywords in both"],
  "missingKeywords": ["important JD keywords missing from resume"],
  "skillGapAnalysis": {
    "strong": [{"skill": "...", "category": "Programming Languages|Frameworks|Databases|Cloud|DevOps|Tools|Soft Skills|Domain Skills"}],
    "moderate": [{"skill": "...", "category": "..."}],
    "missing": [{"skill": "...", "category": "..."}],
    "recommendations": ["concise learning/improvement suggestions"]
  },
  "qualityIssues": [
    {"severity": "strength|warning|critical", "category": "...", "message": "..."}
  ],
  "sectionScores": [
    {
      "section": "Contact Information|Professional Summary|Skills|Experience|Projects|Education|Certifications|Achievements",
      "score": 0-100,
      "strengths": ["..."],
      "problems": ["..."],
      "recommendations": ["..."]
    }
  ],
  "roleRecommendations": [
    {"role": "...", "matchPercent": 0-100, "reason": "brief explanation based on resume only"}
  ],
  "suggestions": ["actionable improvement suggestions"],
  "feedback": "2-4 sentence summary"
}

Resume:
${resumeText.slice(0, 12000)}

Job Description:
${jobDesc.slice(0, 6000)}`;
}

function normalizeSkillGap(skillGap) {
    const defaultGap = { strong: [], moderate: [], missing: [], recommendations: [] };
    if (!skillGap || typeof skillGap !== 'object') return defaultGap;

    const normalizeItems = (items) => {
        if (!Array.isArray(items)) return [];
        return items.map((item) => {
            if (typeof item === 'string') return { skill: item, category: 'Tools' };
            return { skill: String(item.skill || ''), category: String(item.category || 'Tools') };
        }).filter((i) => i.skill);
    };

    return {
        strong: normalizeItems(skillGap.strong),
        moderate: normalizeItems(skillGap.moderate),
        missing: normalizeItems(skillGap.missing),
        recommendations: toStringArray(skillGap.recommendations),
    };
}

function normalizeSectionScores(sections) {
    if (!Array.isArray(sections)) return [];
    return sections.map((s) => ({
        section: String(s.section || 'Unknown'),
        score: Math.min(Math.max(Number(s.score) || 0, 0), 100),
        strengths: toStringArray(s.strengths),
        problems: toStringArray(s.problems),
        recommendations: toStringArray(s.recommendations),
    }));
}

function normalizeRoleRecommendations(roles) {
    if (!Array.isArray(roles)) return [];
    return roles.map((r) => ({
        role: String(r.role || ''),
        matchPercent: Math.min(Math.max(Number(r.matchPercent) || 0, 0), 100),
        reason: String(r.reason || ''),
    })).filter((r) => r.role).slice(0, 6);
}

async function analyzeResume(resumeText, jobDesc) {
    console.log('[ANALYSIS] Starting resume analysis...');
    console.log('[ANALYSIS] Resume text length:', resumeText?.length || 0);
    console.log('[ANALYSIS] Job description length:', jobDesc?.length || 0);

    const deterministic = buildDeterministicScores(resumeText, jobDesc);
    console.log('[ANALYSIS] Deterministic scores calculated:', {
        keywordMatch: deterministic.keywordMatch,
        formatting: deterministic.formatting,
        experienceMatch: deterministic.experienceMatch,
    });

    let aiData = {};
    try {
        console.log('[LLM] Sending analysis request to Cohere...');
        const rawText = await chatJSON(buildAnalysisPrompt(resumeText, jobDesc, deterministic), { maxTokens: 4000 });
        console.log('[LLM] Raw response received, length:', rawText?.length || 0);
        console.log('[LLM] Raw response (first 500 chars):', rawText?.substring(0, 500) || '');
        
        aiData = parseJSONFromAI(rawText) || {};
        console.log('[LLM] Parsed JSON keys:', Object.keys(aiData));
        console.log('[LLM] matchingSkills:', aiData.matchingSkills);
        console.log('[LLM] missingSkills:', aiData.missingSkills);
        console.log('[LLM] skillGapAnalysis:', aiData.skillGapAnalysis);
        console.log('[LLM] sectionScores count:', aiData.sectionScores?.length || 0);
    } catch (err) {
        console.error('[LLM] AI analysis failed:', err.message);
        console.error('[LLM] Error stack:', err.stack);
    }

    const scores = mergeScores(deterministic, aiData);
    console.log('[ANALYSIS] Merged scores:', {
        score: scores.score,
        overallMatch: scores.overallMatch,
        skillsMatch: scores.skillsMatch,
        jobRelevance: scores.jobRelevance,
    });

    const matchingKeywords = toStringArray(aiData.matchingKeywords).length > 0
        ? toStringArray(aiData.matchingKeywords)
        : deterministic.matchingKeywords;

    const missingKeywords = toStringArray(aiData.missingKeywords).length > 0
        ? toStringArray(aiData.missingKeywords)
        : deterministic.missingKeywords;

    // Fallback: if LLM didn't provide skills, derive from keywords (technical skills)
    const aiMatchingSkills = toStringArray(aiData.matchingSkills);
    const aiMissingSkills = toStringArray(aiData.missingSkills);
    
    let matchingSkills = aiMatchingSkills;
    let missingSkills = aiMissingSkills;
    
    if (aiMatchingSkills.length === 0 && matchingKeywords.length > 0) {
        console.log('[ANALYSIS] No skills from LLM, using matching keywords as skills');
        matchingSkills = matchingKeywords.filter(k => k && k.length > 2).slice(0, 20);
    }
    
    if (aiMissingSkills.length === 0 && missingKeywords.length > 0) {
        console.log('[ANALYSIS] No missing skills from LLM, using missing keywords as skills');
        missingSkills = missingKeywords.filter(k => k && k.length > 2).slice(0, 15);
    }

    const qualityAnalysis = analyzeResumeQuality(resumeText, aiData.qualityIssues);

    const finalAnalysis = {
        ...scores,
        jobTitle: String(aiData.jobTitle || '').trim(),
        company: String(aiData.company || '').trim(),
        matchingSkills,
        missingSkills,
        matchingKeywords,
        missingKeywords,
        skillGapAnalysis: normalizeSkillGap(aiData.skillGapAnalysis),
        qualityAnalysis,
        sectionScores: normalizeSectionScores(aiData.sectionScores),
        roleRecommendations: normalizeRoleRecommendations(aiData.roleRecommendations),
        suggestions: toStringArray(aiData.suggestions),
        feedback: aiData.feedback ? String(aiData.feedback).trim() : 'Analysis completed.',
        resumeText: resumeText.slice(0, 15000),
    };

    console.log('[ANALYSIS] Final analysis prepared:');
    console.log('  - matchingSkills:', finalAnalysis.matchingSkills.length, 'items');
    console.log('  - missingSkills:', finalAnalysis.missingSkills.length, 'items');
    console.log('  - skillGapAnalysis.strong:', finalAnalysis.skillGapAnalysis.strong?.length || 0, 'items');
    console.log('  - sectionScores:', finalAnalysis.sectionScores?.length || 0, 'items');
    console.log('  - suggestions:', finalAnalysis.suggestions?.length || 0, 'items');
    console.log('[ANALYSIS] Analysis complete. Ready to save to database.');

    return finalAnalysis;
}

module.exports = { analyzeResume };
