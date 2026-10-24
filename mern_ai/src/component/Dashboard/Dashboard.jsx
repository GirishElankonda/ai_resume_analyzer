
import styles from './Dashboard.module.css'
import Skeleton from '@mui/material/Skeleton';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import { useState } from 'react';
import axios from '../../utils/axios';
import { useContext } from 'react';
import { AuthContext } from '../../utils/AuthContext';

const Dashboard = () => {
    const [uploadFiletext, setUploadFileText] = useState("Upload your resume");
    const [loading, setLoading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDesc, setJobDesc] = useState("");

    const [result, setResult] = useState(null);

    const { userInfo } = useContext(AuthContext);

    const handleOnChangeFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            setUploadFileText(file.name);
        }
    }

    const handleUpload = async () => {
        if (!resumeFile || !jobDesc.trim()) {
            alert("Please select a PDF resume and enter the job description.");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("resume", resumeFile);
            formData.append("job_desc", jobDesc.trim());
            formData.append("user", userInfo?._id);
            const response = await axios.post("/resume/addResume", formData);
            setResult(response.data.data);
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.Dashboard}>
            <div className={styles.DashboardLeft}>
                <div className={styles.DashboardHeader}>
                    <div className={styles.DashboardHeaderTitle}>Smart Resume Screening</div>
                    <div className={styles.DashboardHeaderLargeTitle}>Resume Match Score</div>
                </div>

                <div className={styles.alertInfo}>
                    <div>🔔 Important Instructions:</div>
                    <div className={styles.dashboardInstruction}>📄 Please paste the complete job description before submitting.</div>
                    <div className={styles.dashboardInstruction}>📎 Only PDF format resumes are accepted.</div>
                </div>

                <div className={styles.DashboardUploadResume}>
                    <div className={styles.DashboardResumeBlock}>{uploadFiletext}</div>
                    <label className={styles.analyzeAIBtn}>
                        Upload Resume
                        <input type="file" accept="application/pdf" onChange={handleOnChangeFile} />
                    </label>
                </div>

                <div className={styles.jobDesc}>
                    <textarea value={jobDesc} onChange={(e) => { setJobDesc(e.target.value) }} className={styles.textArea} placeholder='Paste Your Job Description' rows={10} cols={50} />
                    <div className={styles.AnalyzeBtn} onClick={handleUpload}>{loading ? "..." : "Analyze"}</div>
                </div>
            </div>

            <div className={styles.DashboardRight}>
                <div className={styles.DashboardRightTopCard}>
                    <div>Analyze With AI</div>

                    <img className={styles.profileImg} src={userInfo?.photoUrl} />

                    <h2>{userInfo?.name}</h2>
                </div>


                {
                    result && <div className={styles.DashboardRightTopCard}>
                        <div>Result</div>

                    <div className={styles.cardPercentage}>{result.score}%</div>
                    <p>{result.feedback}</p>
                        
                    </div>
                }

                {
                    loading && <Skeleton variant="rectangular" sx={{ borderRadius: "20px" }} width={280} height={280} />
                }


            </div>

        </div>


    )
}

export default WithAuthHOC(Dashboard)