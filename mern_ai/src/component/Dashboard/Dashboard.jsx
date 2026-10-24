import styles from './Dashboard.module.css';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import Skeleton from '@mui/material/Skeleton';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import { useState, useContext } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';
import AnalysisResults from '../AnalysisResults/AnalysisResults';

const Dashboard = () => {
    const [uploadFiletext, setUploadFileText] = useState('Upload your resume');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [result, setResult] = useState(null);

    const { userInfo } = useContext(AuthContext);

    const handleOnChangeFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            setUploadFileText(file.name);
        }
    };

    const handleUpload = async () => {
        setResult(null);
        setError('');
        if (!jobDesc || !resumeFile) {
            setError('Please fill the job description and upload resume correctly');
            return;
        }
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('job_desc', jobDesc);
        formData.append('user', userInfo._id);
        setLoading(true);
        try {
            console.log('[FRONTEND] Sending resume upload request...');
            const response = await axios.post('/api/resume/addResume', formData);
            console.log('[FRONTEND] Response received:', response.status);
            console.log('[FRONTEND] Response data keys:', Object.keys(response.data));
            console.log('[FRONTEND] Analysis data keys:', Object.keys(response.data.data || {}));
            console.log('[FRONTEND] Analysis score:', response.data.data?.score);
            console.log('[FRONTEND] matchingSkills:', response.data.data?.matchingSkills);
            console.log('[FRONTEND] missingSkills:', response.data.data?.missingSkills);
            console.log('[FRONTEND] skillGapAnalysis:', response.data.data?.skillGapAnalysis);
            setResult(response.data.data);
            if (response.data.data?.persistenceWarning) {
                setError(response.data.data.persistenceWarning);
            }
            console.log('[FRONTEND] Result state updated');
        } catch (err) {
            console.error('[FRONTEND] Upload error:', err.message);
            console.error('[FRONTEND] Error response:', err.response?.data);
            console.error('[FRONTEND] Full error:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.Dashboard}>
            <div className={styles.DashboardLeft}>
                <div className={styles.DashboardHeader}>
                    <div className={styles.DashboardHeaderTitle}>Smart Resume Screening</div>
                    <div className={styles.DashboardHeaderTitle}>Resume Match Score</div>
                </div>

                <div className={styles.alertInfo}>
                    <div>🔔 Important Instructions:</div>
                    <div className={styles.dashboardInstruction}>
                        <div>📄 Please paste the complete job description in the &quot;Job Description&quot; field before submitting.</div>
                        <div>📎 Only PDF format resumes are accepted</div>
                    </div>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.DashboardUploadResume}>
                    <div className={styles.DashboardResumeBlock}>{uploadFiletext}</div>
                    <div className={styles.DashboardInputField}>
                        <label htmlFor="inputField" className={styles.analyzeAIBtn}>Upload Resume</label>
                        <input type="file" accept=".pdf" id="inputField" onChange={handleOnChangeFile} />
                    </div>
                </div>

                <div className={styles.jobDesc}>
                    <textarea
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        className={styles.textArea}
                        placeholder="Paste Your Job Description"
                        rows={10}
                        cols={50}
                    />
                    <div className={styles.AnalyzeBtn} onClick={handleUpload} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleUpload()}>
                        {loading ? '...' : 'Analyze'}
                    </div>
                </div>

                {loading && (
                    <div className={styles.atsSection}>
                        <Skeleton variant="rectangular" sx={{ borderRadius: '16px', marginBottom: '16px' }} height={40} />
                        <Skeleton variant="rectangular" sx={{ borderRadius: '16px', marginBottom: '12px' }} height={28} />
                        <Skeleton variant="rectangular" sx={{ borderRadius: '16px', marginBottom: '12px' }} height={28} />
                        <Skeleton variant="rectangular" sx={{ borderRadius: '16px', marginBottom: '12px' }} height={28} />
                    </div>
                )}

                {result && !loading && (
                    <AnalysisResults
                        result={result}
                        userId={userInfo._id}
                        onUpdate={setResult}
                    />
                )}
            </div>

            <div className={styles.DashboardRight}>
                <div className={styles.DashboardRightTopCard}>
                    <div>Analyze With AI</div>
                    <img className={styles.profileImg} src={userInfo?.photoUrl} alt="Profile" />
                    <h2>{userInfo?.name}</h2>
                </div>

                {result && (
                    <div className={styles.DashboardRightTopCard}>
                        <div>ATS Score</div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                            <h1>{result?.score}%</h1>
                            <CreditScoreIcon sx={{ fontSize: 22 }} />
                        </div>
                        <div className={styles.feedback}>
                            <h3>Feedback</h3>
                            <p>{result?.feedback}</p>
                        </div>
                    </div>
                )}

                {loading && <Skeleton variant="rectangular" sx={{ borderRadius: '20px' }} width={280} height={280} />}
            </div>
        </div>
    );
};

export default WithAuthHOC(Dashboard);
