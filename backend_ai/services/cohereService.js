const { CohereClientV2 } = require('cohere-ai');

const cohere = new CohereClientV2({
    token: process.env.COHERE_API_KEY,
});

const PRIMARY_MODEL = 'command-r-plus-08-2024';
const FALLBACK_MODEL = 'command-r-08-2024';

async function chatJSON(prompt, options = {}) {
    const { maxTokens = 4000, temperature = 0.3 } = options;
    const request = {
        model: PRIMARY_MODEL,
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
        max_tokens: maxTokens,
        temperature,
    };

    try {
        console.log('[COHERE] Sending request to', PRIMARY_MODEL);
        console.log('[COHERE] Prompt length:', prompt.length);
        console.log('[COHERE] Request diagnostics:', {
            model: request.model,
            promptLength: prompt.length,
        });
        const response = await cohere.chat(request);
        console.log('[COHERE] Successful response diagnostics:', {
            httpStatus: response?.status ?? response?.statusCode ?? response?.meta?.status,
            responseType: typeof response,
            finishReason: response?.finishReason ?? response?.finish_reason ?? response?.meta?.finishReason,
            responseLength: extractText(response).length,
        });
        const text = extractText(response);
        console.log('[COHERE] Response received, length:', text.length);
        return text;
    } catch (primaryErr) {
        console.error(`[COHERE] Primary model failed (${PRIMARY_MODEL}):`, {
            exceptionType: primaryErr?.constructor?.name,
            message: primaryErr?.message,
            httpStatus: primaryErr?.status ?? primaryErr?.statusCode ?? primaryErr?.response?.status,
            responseBody: primaryErr?.body ?? primaryErr?.response?.body ?? primaryErr?.response?.data,
        });
        try {
            console.log('[COHERE] Retrying with fallback model:', FALLBACK_MODEL);
            const fallbackRequest = {
                ...request,
                model: FALLBACK_MODEL,
            };
            console.log('[COHERE] Fallback request diagnostics:', {
                model: fallbackRequest.model,
                promptLength: prompt.length,
            });
            const fallbackResponse = await cohere.chat(fallbackRequest);
            console.log('[COHERE] Successful fallback response diagnostics:', {
                httpStatus: fallbackResponse?.status ?? fallbackResponse?.statusCode ?? fallbackResponse?.meta?.status,
                responseType: typeof fallbackResponse,
                finishReason: fallbackResponse?.finishReason ?? fallbackResponse?.finish_reason ?? fallbackResponse?.meta?.finishReason,
                responseLength: extractText(fallbackResponse).length,
            });
            const text = extractText(fallbackResponse);
            console.log('[COHERE] Fallback response received, length:', text.length);
            return text;
        } catch (fallbackErr) {
            console.error('[COHERE] Fallback model also failed:', {
                exceptionType: fallbackErr?.constructor?.name,
                message: fallbackErr?.message,
                httpStatus: fallbackErr?.status ?? fallbackErr?.statusCode ?? fallbackErr?.response?.status,
                responseBody: fallbackErr?.body ?? fallbackErr?.response?.body ?? fallbackErr?.response?.data,
            });
            throw fallbackErr;
        }
    }
}

function extractText(response) {
    return response?.message?.content?.find((item) => item.type === 'text')?.text || '';
}

module.exports = { chatJSON };
