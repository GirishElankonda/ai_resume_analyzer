const ResumeModel = require('../Models/resume');
const pdfParse = require("pdf-parse");
const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});




exports.addResume = async (req, res) => {
    try {
        const { job_desc, user } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a PDF resume." });
        }
        if (!job_desc || !job_desc.trim()) {
            return res.status(400).json({ error: "Please provide a job description." });
        }
        if (!user) {
            return res.status(400).json({ error: "A logged-in user is required." });
        }
        if (!process.env.COHERE_API_KEY) {
            return res.status(503).json({ error: "AI service is not configured on the server." });
        }

        const pdfData = await pdfParse(req.file.buffer);
        const prompt = `
            You are a resume screening assistant.
            Compare the following resume text with the provided Job Description (JD) and give a match score (0-100) and feedback.

            Resume:
            ${pdfData.text}

            Job Description:
            ${job_desc}

            Return the score and a brief explanation in this format:
            Score: XX
            Reason: ...

            `
            ;
        const response = await cohere.generate({
            model: "command",
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.7,
        });

        const result = response.generations?.[0]?.text?.trim();
        if (!result) {
            throw new Error("The AI service returned an empty analysis.");
        }
        const scoreMatch = result.match(/score\s*:\s*(\d{1,3})/i);
        const score = scoreMatch ? String(Math.min(100, Number(scoreMatch[1]))) : "";
        const feedback = result.replace(/score\s*:\s*\d{1,3}\s*/i, "").replace(/^reason\s*:\s*/i, "").trim();

        const newResume = new ResumeModel({
            user,
            resume_name: req.file.originalname,
            job_desc: job_desc.trim(),
            score,
            feedback,
        });
        await newResume.save();
        res.status(200).json({ message: "Your analysis are ready", data: newResume });



    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}



exports.getAllResumesForUser = async (req, res) => {
    try {
        const resumes = await ResumeModel.find({ user: req.params.user }).sort({ createdAt: -1 });
        return res.status(200).json({ data: resumes });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getResumeForAdmin = async (req, res) => {
    try {
        const resumes = await ResumeModel.find().populate("user", "name email").sort({ createdAt: -1 });
        return res.status(200).json({ data: resumes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
}