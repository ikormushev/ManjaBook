import {NavLink,} from 'react-router-dom';
import styles from './Header.module.css';
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import logoIcon from "../../assets/images/manja-logo.avif";
import profilePhoto from "../../assets/images/photo-icon.png";


export default function Header() {
    const { authState } = useAuth();

    const isAuthenticated = authState.isAuthenticated;
    const userID = authState.userID;

    return (
        <div className={styles.headerDiv}>
            <div>
                <NavLink to="/" className={styles.logoImg}>
                    <img src={logoIcon} alt="manjaLogo"/>
                </NavLink>

                <nav className={styles.mainNav}>
                    <NavLink to="/" className={styles.link}>Home</NavLink>
                    <NavLink to="/recipes" className={styles.link}>Recipes</NavLink>
                </nav>
            </div>

            <div className={styles.headerButtons}>
                {isAuthenticated ?
                    (<>
                        <NavLink to="/create-recipe" className={styles.link}>Create a Recipe</NavLink>
                        <NavLink to={`/profile/${userID}`} className={styles.profileImg}>
                            <img src={profilePhoto} alt="profilePhoto"/>
                        </NavLink>
                    </>) :
                    (<NavLink to='/login'>Login</NavLink>)}
            </div>
        </div>
    );
};