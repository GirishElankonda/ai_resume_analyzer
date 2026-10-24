function compareAnalyses(analysisA, analysisB) {
    const getScore = (a) => a?.score ?? 0;

    const scoreDiff = getScore(analysisB) - getScore(analysisA);
    const matchDiff = (analysisB?.overallMatch ?? 0) - (analysisA?.overallMatch ?? 0);

    const diffArrays = (arrA = [], arrB = []) => {
        const setA = new Set((arrA || []).map(String));
        const setB = new Set((arrB || []).map(String));
        const added = [...setB].filter((x) => !setA.has(x));
        const removed = [...setA].filter((x) => !setB.has(x));
        return { added, removed };
    };

    const keywordsA = analysisA?.matchingKeywords || [];
    const keywordsB = analysisB?.matchingKeywords || [];
    const skillsA = analysisA?.matchingSkills || [];
    const skillsB = analysisB?.matchingSkills || [];

    const keywordDiff = diffArrays(keywordsA, keywordsB);
    const skillDiff = diffArrays(skillsA, skillsB);

    const sectionA = analysisA?.sectionScores || [];
    const sectionB = analysisB?.sectionScores || [];
    const sectionMapB = Object.fromEntries(sectionB.map((s) => [s.section, s.score]));

    const improvedSections = [];
    const declinedSections = [];

    sectionA.forEach((s) => {
        const bScore = sectionMapB[s.section];
        if (bScore != null) {
            const diff = bScore - s.score;
            if (diff > 0) improvedSections.push({ section: s.section, from: s.score, to: bScore, change: diff });
            if (diff < 0) declinedSections.push({ section: s.section, from: s.score, to: bScore, change: diff });
        }
    });

    const weaknessesA = (analysisA?.qualityAnalysis || [])
        .filter((q) => q.severity !== 'strength')
        .map((q) => q.message);
    const weaknessesB = (analysisB?.qualityAnalysis || [])
        .filter((q) => q.severity !== 'strength')
        .map((q) => q.message);

    const remainingWeaknesses = weaknessesB;
    const resolvedWeaknesses = weaknessesA.filter((w) => !weaknessesB.includes(w));

    return {
        versionA: {
            id: analysisA._id,
            resumeName: analysisA.resume_name,
            atsScore: getScore(analysisA),
            matchScore: analysisA.overallMatch ?? analysisA.jobRelevance ?? 0,
            date: analysisA.createdAt,
        },
        versionB: {
            id: analysisB._id,
            resumeName: analysisB.resume_name,
            atsScore: getScore(analysisB),
            matchScore: analysisB.overallMatch ?? analysisB.jobRelevance ?? 0,
            date: analysisB.createdAt,
        },
        atsImprovement: scoreDiff,
        matchImprovement: matchDiff,
        improvedSections,
        declinedSections,
        newKeywords: keywordDiff.added,
        removedKeywords: keywordDiff.removed,
        newSkills: skillDiff.added,
        removedSkills: skillDiff.removed,
        resolvedWeaknesses,
        remainingWeaknesses,
    };
}

module.exports = { compareAnalyses };
