import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import PageNotFound from "../pageNotFound/PageNotFound.jsx";
import styles from "./Profile.module.css";
import {
    Tabs,
    Tab,
    Box,
    Drawer,
    Typography,
    Button,
    Divider
} from '@mui/material';
import defaultUserPicture from "../../assets/images/default-user-picture.png";
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";
import Loading from "../../utils/loading/Loading.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";


export default function Profile() {
    const { setError } = useError();
    const {userID} = useParams();


    const [profile, setProfile] = useState({
        user_id: '',
        username: '',
        profile_picture: '',
        owned_collections: [],
        recipes: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const handleDrawerOpen = (collection) => {
        setSelectedCollection(collection);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedCollection(null);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileResponse = await fetch(`${API_ENDPOINTS.profiles}${userID}`, {
                    method: "GET",
                    credentials: "include",
                });
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
                        <div className={styles.profileTabContainer}>
                            {profile.recipes.map((recipe) =>
                                <Link
                                    to={`/recipes/${recipe.id}/${recipe.slug}`}
                                    key={`recipe-${recipe.id}`}
                                    style={{textDecoration: 'none', color: 'inherit'}}
                                    className={styles.post}
                                >
                                    <div className={styles.postImage}>
                                        {recipe.image ?
                                            <img src={recipe.image} alt="recipeImage"/> :
                                            <img src={defaultRecipeImage} alt="defaultRecipeImage"/>}
                                        <div className={styles.hoverOverlay}>
                                            <p>{recipe.name}</p>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    }
                    {activeTab === 1 &&
                        <>
                            <div className={styles.profileTabContainer}>
                                {profile.owned_collections.map((collection) =>
                                    <div key={`collection-${collection.id}`} onClick={() => handleDrawerOpen(collection)}>
                                        <div className={styles.postImage}>
                                            <img src={collection.image} alt="collectionImage"/>
                                            <div className={styles.hoverOverlay}>
                                                <p>{collection.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                                <Box
                                    sx={{
                                        padding: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        maxWidth: "15em",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Typography variant="h6">{selectedCollection?.name}</Typography>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleDrawerClose}
                                            sx={{padding: 0.75}}
                                        >
                                            Close
                                        </Button>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2
                                        }}
                                    >
                                        {selectedCollection?.recipes.map((recipe) => (
                                            <Link
                                                to={`/recipes/${recipe.id}/${recipe.slug}`}
                                                key={`recipeFromCollection-${recipe.id}`}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                            }}
                                                className={styles.post}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        wordWrap: "break-word",
                                                        whiteSpace: "normal",
                                                        overflow: "hidden",
                                                        textAlign: "center"
                                                    }}
                                                >
                                                    {recipe.name}
                                                </Typography>
                                                <Divider />
                                            </Link>
                                        ))}
                                    </Box>
                                </Box>
                            </Drawer>
                        </>
                    }
                </div>
            </div>
        </div>);
};