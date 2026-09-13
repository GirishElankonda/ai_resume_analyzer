import styles from './History.module.css';
import { Skeleton } from '@mui/material';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';

const History = () => {
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState('');
    const [deleteAllLoading, setDeleteAllLoading] = useState(false);

    const { userInfo } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoader(true);
        setError('');
        try {
            const results = await axios.get(`/api/resume/get/${userInfo?._id}`);
            setData(results.data.resumes || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load history');
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        if (userInfo?._id) {
            fetchData();
        }
    }, [userInfo?._id]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this analysis?')) return;
        try {
            await axios.delete(`/api/resume/${id}`, { data: { user: userInfo._id } });
            setData((prev) => prev.filter((item) => item._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete analysis');
        }
    };

    const handleDeleteAll = async () => {
      if (!data.length || !window.confirm('Delete all analysis history? This cannot be undone.')) return;
      setDeleteAllLoading(true);
        try {
        await axios.delete('/api/resume/all', { data: { user: userInfo._id } });
        setData([]);
        } catch (err) {
            console.error(err);
        alert('Failed to delete all history');
        } finally {
        setDeleteAllLoading(false);
        }
    };

  return (
    <div className={styles.History}>
      <div className={styles.HistoryHeader}>
        <h2>Analysis History</h2>
        <div className={styles.HistoryActions}>
          <button type="button" className={styles.deleteAllBtn} onClick={handleDeleteAll} disabled={deleteAllLoading || !data.length}>
            {deleteAllLoading ? 'Deleting...' : 'Delete All'}
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.HistoryCardBlock}>
        {loader && (
          <>
            <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: '20px' }} />
            <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: '20px' }} />
            <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: '20px' }} />
          </>
        )}

        {!loader && data.length === 0 && (
          <div className={styles.emptyState}>
            <p>No analyses yet. Upload a resume on the Dashboard to get started.</p>
          </div>
        )}

        {!loader && data.map((item) => (
          <div
            key={item._id}
            className={styles.HistoryCard}
          >
            <div className={styles.cardPercentage}>{item.score != null ? `${item.score}%` : '—'}</div>
            <div className={styles.cardScores}>
              <span>Match: {item.overallMatch ?? item.jobRelevance ?? '—'}%</span>
            </div>
            <p><strong>Resume:</strong> {item.resume_name}</p>
            {item.jobTitle && <p><strong>Role:</strong> {item.jobTitle}</p>}
            {item.company && <p><strong>Company:</strong> {item.company}</p>}
            <p className={styles.feedbackPreview}>{item.feedback}</p>
            {item.missingKeywords?.length > 0 && (
              <p><strong>Missing:</strong> {item.missingKeywords.slice(0, 3).join(', ')}{item.missingKeywords.length > 3 ? '...' : ''}</p>
            )}
            <p className={styles.dateText}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</p>
            <div className={styles.cardActions}>
              <button type="button" className={styles.viewBtn} onClick={() => navigate(`/analysis/${item._id}`)}>View</button>
              <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(item._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WithAuthHOC(History);
