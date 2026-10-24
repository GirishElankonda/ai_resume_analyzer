import React, { useContext } from 'react'
import styles from './Login.module.css';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GoogleIcon from '@mui/icons-material/Google';

import { auth, provider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { AuthContext } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const Login = () => {

    const { isLogin, setLogin, userInfo, setUserInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const { displayName: name, email, photoURL: photoUrl } = result.user;
            const response = await axios.post("/user", { name, email, photoUrl });
            setUserInfo(response.data.user);
            localStorage.setItem("userInfo", JSON.stringify(response.data.user));

            setLogin(true);
            localStorage.setItem("isLogin", true)

            navigate('/dashboard')
        } catch (err) {
            alert("Something Went Wrong");
            console.log(err)
        }
    }
    return (
        <div className={styles.Login}>
            <div className={styles.loginCard}>
                <div className={styles.loginCardTitle}>
                    <h1>Login </h1>
                    <VpnKeyIcon />
                </div>

                <div className={styles.googleBtn} onClick={handleLogin}><GoogleIcon sx={{ fontSize: 20, color: "red" }} /> Sign in with Google</div>

            </div>
        </div>
    )
}

export default Login