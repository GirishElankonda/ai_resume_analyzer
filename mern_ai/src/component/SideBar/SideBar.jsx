import React from 'react'
import styles from './SideBar.module.css';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../utils/AuthContext';

const SideBar = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { isLogin, setLogin, userInfo, setUserInfo } = useContext(AuthContext);

    const handleLogout = () => {
        localStorage.clear();
        setLogin(false);
        setUserInfo(null);
        navigate("/");
    }
    return (
        <div className={styles.sideBar}>
            <div className={styles.sideBarIcon}>
                <DocumentScannerIcon sx={{ fontSize: 54, marginBottom: 2 }} />
                <div className={styles.sideBarTopContent}>Resume Screening</div>
            </div>

            <div className={styles.sideBarOptionsBlock}>

                <Link to={'/dashboard'} className={[styles.sideBarOption, location.pathname === '/dashboard' ? styles.selectedOption : null].join(' ')}>
                    <DashboardIcon sx={{ fontSize: 22 }} />
                    <div>Dashboard</div>
                </Link>


                <Link to={'/history'} className={[styles.sideBarOption, location.pathname === '/history' ? styles.selectedOption : null].join(' ')}>
                    <ManageSearchIcon sx={{ fontSize: 22 }} />
                    <div>History</div>
                </Link>

                {
                    userInfo?.role==='admin' && <Link to={'/admin'} className={[styles.sideBarOption, location.pathname === '/admin' ? styles.selectedOption : null].join(' ')}>
                        <AdminPanelSettingsIcon sx={{ fontSize: 22 }} />
                        <div>Admin</div>
                    </Link>
                }

                <div onClick={handleLogout} className={styles.sideBarOption}>
                    <LogoutIcon sx={{ fontSize: 22 }} />
                    <div>LogOut</div>
                </div>

            </div>
        </div>
    )
}

export default SideBar