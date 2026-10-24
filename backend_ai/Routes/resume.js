const express = require('express');
const router = express.Router();
const ResumeController = require('../Controllers/resume');
const { upload } = require('../utils/multer');

router.post('/addResume', (req, res, next) => {
	upload.single('resume')(req, res, (err) => {
		if (err) return res.status(400).json({ error: err.message || 'Resume upload failed' });
		return next();
	});
}, ResumeController.addResume);
router.get('/get/:user', ResumeController.getAllResumesForUser);
router.get('/get/', ResumeController.getResumeForAdmin);
router.delete('/all', ResumeController.deleteAllResumes);
router.get('/:id', ResumeController.getResumeById);
router.delete('/:id', ResumeController.deleteResume);
router.post('/compare', ResumeController.compareResumes);
router.post('/improve', ResumeController.improveSection);
router.post('/cover-letter', ResumeController.generateCoverLetter);
router.post('/interview-questions', ResumeController.generateInterviewQuestions);

module.exports = router;
