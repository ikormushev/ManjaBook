import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import PageNotFound from "../pageNotFound/PageNotFound.jsx";
import styles from "./Profile.module.css";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const apiProfileURL = `${backendURL}/profiles`;

const profileTemplate = {
    user_id: '',
    username: '',
    profile_picture: '',
    collections: []
}

export default function  Profile() {
    const { userID } = useParams();
    const [profile, setProfile] = useState(profileTemplate);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileResponse = await fetch(`${apiProfileURL}/${userID}`);
                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    setProfile(data);
                } else {
                    setProfile(null);
                }
            } catch (e) {
                console.log(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (!profile) return <PageNotFound/>;

    return (<div className={styles.profile}>
        <div className={styles.profileHeader}>
            <div className={styles.profilePicture}>
                <img alt='profilePicture' src={profile.profile_picture}/>
            </div>
            <div className='profileName'>
                <p>@{profile.username}</p>
            </div>
        </div>
    </div>);
};