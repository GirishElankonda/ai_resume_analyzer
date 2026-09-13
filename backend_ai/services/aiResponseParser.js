function parseJSONFromAI(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        console.error('[JSON] Raw text is empty or not a string');
        return null;
    }

    let jsonString = rawText.trim();
    console.log('[JSON] Raw response length:', rawText.length);
    console.log('[JSON] First 300 chars:', rawText.substring(0, 300));
    
    if (jsonString.startsWith('```')) {
        console.log('[JSON] Detected code fence, removing...');
        jsonString = jsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        console.log('[JSON] Extracting JSON from indices', firstBrace, 'to', lastBrace);
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    console.log('[JSON] Attempting to parse:', jsonString.substring(0, 200) + '...');
    try {
        const parsed = JSON.parse(jsonString);
        console.log('[JSON] Successfully parsed, top-level keys:', Object.keys(parsed));
        return parsed;
    } catch (err) {
        console.error('[JSON] Failed to parse AI JSON:', err.message);
        console.error('[JSON] Problem area:', jsonString.substring(Math.max(0, err.message.match(/position (\d+)/) ? parseInt(err.message.match(/position (\d+)/)[1]) - 50 : 0), Math.max(0, err.message.match(/position (\d+)/) ? parseInt(err.message.match(/position (\d+)/)[1]) + 50 : 100)));
        return null;
    }
}

function parseScore(val, fallback = 0) {
    if (val == null || val === '') return fallback;
    const num = Number(val);
    if (Number.isNaN(num)) return fallback;
    return Math.min(Math.max(Math.round(num), 0), 100);
}

function toStringArray(val) {
    if (!Array.isArray(val)) return [];
    return val.map(String).filter((s) => s && s !== 'null' && s !== 'undefined');
}

function clampPercent(val, fallback = 0) {
    return parseScore(val, fallback);
}

module.exports = { parseJSONFromAI, parseScore, toStringArray, clampPercent };
