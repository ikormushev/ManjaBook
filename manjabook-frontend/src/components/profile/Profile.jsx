import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import PageNotFound from "../pageNotFound/PageNotFound.jsx";
import styles from "./Profile.module.css";
import { Tabs, Tab, Box } from '@mui/material';
import defaultUserPicture from "../../assets/images/default-user-picture.png";
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";
import Loading from "../../utils/loading/Loading.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";


const profileTemplate = {
    user_id: '',
    username: '',
    profile_picture: '',
    collections: [],
    recipes: []
}

export default function Profile() {
    const { setError } = useError();
    const {userID} = useParams();
    const [profile, setProfile] = useState(profileTemplate);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileResponse = await fetch(`${API_ENDPOINTS.profiles}${userID}`);
                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    setProfile(data);
                } else {
                    setProfile(null);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <Loading/>;
    if (!profile) return <PageNotFound/>;


    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profile}>

                <div className={styles.profileHeader}>

                    <div className={styles.profilePicture}>
                        {profile.profile_picture ?
                            <img src={profile.profile_picture} alt="profile_picture"/> :
                            <img src={defaultUserPicture} alt="profile_picture"/>}
                    </div>

                    <div className={styles.profileInfo}>
                        <h2>@{profile.username}</h2>
                    </div>
                </div>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="inherit"
                        indicatorColor="primary"
                        centered
                    >
                        <Tab label="Recipes" />
                        <Tab label="Collections" />
                    </Tabs>
                </Box>

                <div className={styles.profileBody}>
                    {activeTab === 0 &&
                        <div className={styles.profileRecipesContainer}>
                            {profile.recipes.map((recipe) =>
                                <Link
                                    to={`/recipes/${recipe.id}/${recipe.slug}`}
                                    key={recipe.id}
                                    style={{textDecoration: 'none', color: 'inherit'}}
                                    className={styles.recipePost}
                                >
                                    <div className={styles.recipeImage}>
                                        {recipe.image ?
                                            <img src={recipe.image} alt="recipe_image"/> :
                                            <img src={defaultRecipeImage} alt="default_recipe_image"/>}
                                        <div className={styles.hoverOverlay}>
                                            <p>{recipe.name}</p>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    }
                    {activeTab === 1 && <div>Колекции content</div>}
                </div>
            </div>
        </div>);
};