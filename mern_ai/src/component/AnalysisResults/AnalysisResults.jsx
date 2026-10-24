import { useState } from 'react';
import styles from './AnalysisResults.module.css';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from '../../utils/axios';

function getScoreColor(value) {
    if (value == null) return '#ccc';
    if (value >= 75) return 'linear-gradient(90deg, #fca326, #f94a6b)';
    if (value >= 50) return 'linear-gradient(90deg, #f6d365, #fda085)';
    return 'linear-gradient(90deg, #f093fb, #f5576c)';
}

function SeverityIcon({ severity }) {
    if (severity === 'strength') return <span className={styles.iconStrength}>✓</span>;
    if (severity === 'critical') return <span className={styles.iconCritical}>✕</span>;
    return <span className={styles.iconWarning}>⚠</span>;
}

function ExpandableSection({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={styles.expandSection}>
            <button type="button" className={styles.expandHeader} onClick={() => setOpen(!open)}>
                <span>{title}</span>
                {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>
            {open && <div className={styles.expandBody}>{children}</div>}
        </div>
    );
}

const AnalysisResults = ({ result, userId, onUpdate }) => {
    const [coverLetter, setCoverLetter] = useState(result?.coverLetter || '');
    const [coverLoading, setCoverLoading] = useState(false);
    const [interviewQuestions, setInterviewQuestions] = useState(result?.interviewQuestions || null);
    const [interviewLoading, setInterviewLoading] = useState(false);

    if (!result) return null;

    const atsMetrics = [
        { label: 'Keyword Match', value: result.keywordMatch },
        { label: 'Skills Match', value: result.skillsMatch },
        { label: 'Experience Match', value: result.experienceMatch },
        { label: 'Education', value: result.educationScore },
        { label: 'Projects', value: result.projectScore },
        { label: 'Formatting & Readability', value: result.formatting },
        { label: 'Job Relevance', value: result.jobRelevance },
    ];

    const handleCoverLetter = async () => {
        setCoverLoading(true);
        try {
            const res = await axios.post('/api/resume/cover-letter', {
                analysisId: result._id,
                user: userId,
            });
            setCoverLetter(res.data.data.coverLetter);
            if (onUpdate) onUpdate({ ...result, coverLetter: res.data.data.coverLetter });
        } catch (err) {
            console.error(err);
            alert('Failed to generate cover letter');
        } finally {
            setCoverLoading(false);
        }
    };

    const handleInterviewQuestions = async () => {
        setInterviewLoading(true);
        try {
            const res = await axios.post('/api/resume/interview-questions', {
                analysisId: result._id,
                user: userId,
            });
            setInterviewQuestions(res.data.data);
            if (onUpdate) onUpdate({ ...result, interviewQuestions: res.data.data });
        } catch (err) {
            console.error(err);
            alert('Failed to generate interview questions');
        } finally {
            setInterviewLoading(false);
        }
    };

    const skillGap = result.skillGapAnalysis || {};

    return (
        <div className={styles.results}>
            <div className={styles.atsSectionTitle}>📊 ATS Analysis</div>

            <div className={styles.scoreCards}>
                <div className={styles.scoreCard}>
                    <div className={styles.scoreCardValue}>{result.score ?? '—'}</div>
                    <div className={styles.scoreCardLabel}>ATS Score /100</div>
                </div>
                <div className={styles.scoreCard}>
                    <div className={styles.scoreCardValue}>{result.overallMatch ?? result.jobRelevance ?? '—'}%</div>
                    <div className={styles.scoreCardLabel}>Job Match</div>
                </div>
                {(result.jobTitle || result.company) && (
                    <div className={styles.scoreCardMeta}>
                        {result.jobTitle && <span>{result.jobTitle}</span>}
                        {result.company && <span> @ {result.company}</span>}
                    </div>
                )}
            </div>

            <div className={styles.atsOverallBanner}>
                <div className={styles.atsOverallScore}>
                    <span className={styles.atsOverallNumber}>{result.score ?? '—'}</span>
                    <span className={styles.atsOverallLabel}>/ 100</span>
                </div>
                <div>
                    <div className={styles.atsOverallTitle}>Overall ATS Score</div>
                    <div className={styles.atsOverallSub}>Hybrid deterministic + AI analysis</div>
                </div>
                <CreditScoreIcon sx={{ fontSize: 48, color: '#f94a6b', marginLeft: 'auto' }} />
            </div>

            <div className={styles.atsMetricsBlock}>
                {atsMetrics.map((metric) => (
                    <div key={metric.label} className={styles.atsMetricRow}>
                        <div className={styles.atsMetricHeader}>
                            <span className={styles.atsMetricLabel}>{metric.label}</span>
                            <span className={styles.atsMetricValue}>{metric.value ?? '—'}%</span>
                        </div>
                        <div className={styles.atsProgressBar}>
                            <div
                                className={styles.atsProgressFill}
                                style={{
                                    width: `${metric.value ?? 0}%`,
                                    background: getScoreColor(metric.value),
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <ExpandableSection title="🎯 Job Description Matching" defaultOpen>
                <div className={styles.twoCol}>
                    <div className={styles.atsCardBlock}>
                        <div className={styles.atsCardTitle}>✅ Matching Skills</div>
                        <div className={styles.atsBadgeGroup}>
                            {(result.matchingSkills || []).length > 0
                                ? result.matchingSkills.map((s, i) => (
                                    <span key={i} className={`${styles.atsBadge} ${styles.badgeGreen}`}>{s}</span>
                                ))
                                : <span className={styles.emptyText}>None detected</span>}
                        </div>
                    </div>
                    <div className={styles.atsCardBlock}>
                        <div className={styles.atsCardTitle}>❌ Missing Skills</div>
                        <div className={styles.atsBadgeGroup}>
                            {(result.missingSkills || []).length > 0
                                ? result.missingSkills.map((s, i) => (
                                    <span key={i} className={`${styles.atsBadge} ${styles.badgeRed}`}>{s}</span>
                                ))
                                : <span className={styles.emptyText}>None detected</span>}
                        </div>
                    </div>
                </div>
            </ExpandableSection>

            <ExpandableSection title="📈 Skill Gap Analysis">
                {['strong', 'moderate', 'missing'].map((level) => (
                    <div key={level} className={styles.atsCardBlock}>
                        <div className={styles.atsCardTitle}>
                            {level === 'strong' ? '💪 Strong Skills' : level === 'moderate' ? '⚡ Moderate Skills' : '📚 Missing Skills'}
                        </div>
                        <div className={styles.atsBadgeGroup}>
                            {(skillGap[level] || []).map((item, i) => (
                                <span key={i} className={styles.skillBadge} title={item.category}>
                                    {item.skill} <small>({item.category})</small>
                                </span>
                            ))}
                            {(skillGap[level] || []).length === 0 && <span className={styles.emptyText}>None</span>}
                        </div>
                    </div>
                ))}
                {(skillGap.recommendations || []).length > 0 && (
                    <ul className={styles.atsSuggestionList}>
                        {skillGap.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                )}
            </ExpandableSection>

            <ExpandableSection title="🔎 Resume Quality Analysis">
                <div className={styles.qualityList}>
                    {(result.qualityAnalysis || []).map((item, i) => (
                        <div key={i} className={`${styles.qualityItem} ${styles[item.severity]}`}>
                            <SeverityIcon severity={item.severity} />
                            <div>
                                <strong>{item.category}</strong>
                                <p>{item.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ExpandableSection>

            <ExpandableSection title="📋 Section Scores">
                {(result.sectionScores || []).map((section, i) => (
                    <div key={i} className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <span>{section.section}</span>
                            <span className={styles.sectionScore}>{section.score}/100</span>
                        </div>
                        <div className={styles.atsProgressBar}>
                            <div
                                className={styles.atsProgressFill}
                                style={{ width: `${section.score}%`, background: getScoreColor(section.score) }}
                            />
                        </div>
                        {section.strengths?.length > 0 && (
                            <div className={styles.sectionDetail}>
                                <strong>Strengths:</strong> {section.strengths.join('; ')}
                            </div>
                        )}
                        {section.problems?.length > 0 && (
                            <div className={styles.sectionDetail}>
                                <strong>Problems:</strong> {section.problems.join('; ')}
                            </div>
                        )}
                        {section.recommendations?.length > 0 && (
                            <div className={styles.sectionDetail}>
                                <strong>Recommendations:</strong> {section.recommendations.join('; ')}
                            </div>
                        )}
                    </div>
                ))}
            </ExpandableSection>

            {result.suggestions?.length > 0 && (
                <div className={styles.atsCardBlock}>
                    <div className={styles.atsCardTitle}>💡 Improvement Suggestions</div>
                    <ul className={styles.atsSuggestionList}>
                        {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            )}

            {result.roleRecommendations?.length > 0 && (
                <ExpandableSection title="🎯 Job Role Recommendations">
                    {result.roleRecommendations.map((role, i) => (
                        <div key={i} className={styles.roleCard}>
                            <div className={styles.roleHeader}>
                                <span>{i + 1}. {role.role}</span>
                                <span className={styles.rolePercent}>{role.matchPercent}%</span>
                            </div>
                            <p>{role.reason}</p>
                        </div>
                    ))}
                </ExpandableSection>
            )}

            <ExpandableSection title="📝 Cover Letter Generator">
                <button type="button" className={styles.actionBtn} onClick={handleCoverLetter} disabled={coverLoading}>
                    {coverLoading ? 'Generating...' : coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
                </button>
                {coverLetter && (
                    <textarea className={styles.coverLetterBox} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={12} />
                )}
            </ExpandableSection>

            <ExpandableSection title="🎤 Interview Questions">
                <button type="button" className={styles.actionBtn} onClick={handleInterviewQuestions} disabled={interviewLoading}>
                    {interviewLoading ? 'Generating...' : interviewQuestions ? 'Regenerate Questions' : 'Generate Questions'}
                </button>
                {interviewQuestions && ['technical', 'project', 'behavioral', 'jobSpecific'].map((cat) => (
                    <div key={cat} className={styles.atsCardBlock}>
                        <div className={styles.atsCardTitle}>
                            {cat === 'jobSpecific' ? 'Job-Specific' : cat.charAt(0).toUpperCase() + cat.slice(1)} Questions
                        </div>
                        {(interviewQuestions[cat] || []).map((q, i) => (
                            <div key={i} className={styles.questionItem}>
                                <p><strong>Q{i + 1}:</strong> {q.question}</p>
                                {q.suggestedPoints?.length > 0 && (
                                    <ul className={styles.atsSuggestionList}>
                                        {q.suggestedPoints.map((p, j) => <li key={j}>{p}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </ExpandableSection>
        </div>
    );
};

export default AnalysisResults;
