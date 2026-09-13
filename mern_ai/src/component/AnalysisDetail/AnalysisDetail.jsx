import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';
import AnalysisResults from '../AnalysisResults/AnalysisResults';
import styles from './AnalysisDetail.module.css';

const AnalysisDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/resume/${id}?user=${userInfo._id}`);
                setData(res.data.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load analysis');
            } finally {
                setLoading(false);
            }
        };
        if (id && userInfo?._id) fetchAnalysis();
    }, [id, userInfo?._id]);

    return (
        <div className={styles.detail}>
            <button type="button" className={styles.backBtn} onClick={() => navigate('/history')}>
                ← Back to History
            </button>

            {loading && <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '20px' }} />}
            {error && <div className={styles.error}>{error}</div>}
            {data && (
                <>
                    <div className={styles.header}>
                        <h2>{data.resume_name}</h2>
                        <span>{data.createdAt ? new Date(data.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <AnalysisResults result={data} userId={userInfo._id} onUpdate={setData} />
                </>
            )}
        </div>
    );
};

export default WithAuthHOC(AnalysisDetail);
