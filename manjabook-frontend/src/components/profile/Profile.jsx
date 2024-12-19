import {Link, useNavigate, useParams} from "react-router-dom";
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
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    CircularProgress, InputLabel
} from '@mui/material';
import defaultUserPicture from "../../assets/images/default-user-picture.png";
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";
import Loading from "../../utils/loading/Loading.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import editButtonIcon from "../../assets/images/edit-button-icon.png";
import deleteButtonIcon from "../../assets/images/delete-button-icon.png";
import CustomModal from "../../utils/modal/CustomModal.jsx";
import {useSuccess} from "../../context/successProvider/SuccessProvider.jsx";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";


export default function Profile() {
    const {setError} = useError();
    const {userID} = useParams();
    const { authState, setAuthState } = useAuth();
    const navigate = useNavigate();
    const {setSuccess} = useSuccess();

    const [profile, setProfile] = useState({
        user_id: '',
        username: '',
        profile_picture: '',
        owned_collections: [],
        recipes: [],
        is_owner: false,
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [profileEditValues, setProfileEditValues] = useState({
        username: "",
        profile_picture: null,
    });
    const [profileEditErrors, setProfileEditErrors] = useState({
        username: "",
        profile_picture: "",
    });
    const [profileEditLoading, setProfileEditLoading] = useState(false);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
                    setProfileEditValues(oldValues => ({...oldValues, username: data.username}));
                } else {
                    setProfile(null);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, [userID]);

    if (profileLoading) return <Loading/>;
    if (!profile) return <PageNotFound/>;

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleClose = () => {
        setShowDeleteDialog(false);
    };

    const handleConfirmEdit = (e) => {
        setProfileEditLoading(true);

        const handleSubmit = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
                let requestBody;
                let requestHeaders = {};
                if (profileEditValues.profile_picture) {
                    const formData = new FormData();
                    formData.append('username', profileEditValues.username);
                    formData.append('profile_picture', profileEditValues.profile_picture);
                    requestBody = formData;
                } else {
                    requestBody = JSON.stringify(profileEditValues);
                    requestHeaders = {'Content-Type': 'application/json',};
                }

                const makeRequest = async (url, method, body, headers = {}) => {
                    return await fetch(url, {
                        method,
                        body,
                        headers,
                        credentials: "include",
                    });
                };

                const response = await makeRequest(
                    `${API_ENDPOINTS.profiles}${userID}/`,
                    "PUT",
                    requestBody,
                    requestHeaders
                );
                const data = await response.json();

                if (response.ok) {
                    setProfileEditValues({profile_picture: null, username: data.username});
                    setProfile(oldValues => ({...oldValues, ...data}));
                    setShowEditModal(false);
                } else {
                    if (response.status === 403) {
                        setError("Login required!");
                        navigate("/login");
                        return
                    }
                    console.log(data);
                    setProfileEditErrors(oldValues => ({...oldValues, ...data}));
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setProfileEditLoading(false);
            }
        };

        handleSubmit(e);
    };

    const handleConfirmDelete = () => {
        handleClose();

         const handleDeleteConfirm = async () => {
             try {
                 const response = await fetch(`${API_ENDPOINTS.profiles}${userID}/`, {
                     method: "DELETE",
                     credentials: "include",
                 });

                 if (response.ok) {
                     navigate("/");
                     setSuccess("Profile successfully deleted!");

                     if (authState.userID == profile.user_id) {
                         setAuthState({
                             isAuthenticated: false,
                             username: "",
                             userID: "",
                         });
                     }
                 } else {
                     if (response.status === 403) {
                         setError("Login required!");
                         navigate("/login");
                     }
                 }
             } catch (error) {
                 setError(error.message);
             }
         };

        handleDeleteConfirm();
    };

    const handleEditModalClose = () => {
        changeHandler("username", profile.username);
        changeHandler("profile_picture", null);

        setShowEditModal(false);
    };

    const changeHandler = (targetName, targetValue) => {
        setProfileEditErrors(oldValues => ({
            ...oldValues,
            [targetName]: "",
        }));

        setProfileEditValues(oldValues => ({...oldValues, [targetName]: targetValue}));
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
                    {profile.is_owner && <>
                        <Box sx={{
                            display: "flex",
                            gap: 0.5,
                            alignSelf: "flex-start",
                            "& button": {
                                width: "2.5em",
                            },
                        }}>
                            <IconButton onClick={() => {setShowEditModal(true)}}>
                                <img src={editButtonIcon} alt="editButtonIcon"/>
                            </IconButton>
                            <IconButton onClick={() => setShowDeleteDialog(true)}>
                                <img src={deleteButtonIcon} alt="deleteButtonIcon"/>
                            </IconButton>
                        </Box>

                        <Dialog
                            open={showDeleteDialog}
                            onClose={handleClose}
                        >
                            <DialogTitle>
                                {"Delete profile"}
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to delete your profile? This action cannot be undone.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleConfirmDelete} color="error">
                                    Yes
                                </Button>
                                <Button onClick={handleClose} color="primary">
                                    No
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <CustomModal isOpen={showEditModal} onClose={handleEditModalClose}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 3
                                }}
                                component="form"
                                onSubmit={handleConfirmEdit}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        flexDirection: "column"
                                    }}
                                >

                                    <InputLabel htmlFor="profile_picture">Upload Image</InputLabel>
                                    <input
                                        id="profile_picture"
                                        name="profile_picture"
                                        accept="image/*"
                                        type="file"
                                        onChange={(e) => changeHandler(e.target.name, e.target.files[0])}
                                        disabled={profileEditLoading}
                                    />

                                    {profileEditValues.profile_picture &&
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{
                                                padding: 1,
                                                '&:hover': {
                                                    backgroundColor: '#45a049',
                                                },
                                            }}
                                            onClick={() => changeHandler("profile_picture", null)}
                                            disabled={profileEditLoading}
                                        >
                                            Remove Image
                                        </Button>}
                                </Box>
                                {profileEditValues.profile_picture &&
                                    <Typography variant="caption" color="success">
                                        Image uploaded successfully! The image will be visualised after profile edit.
                                    </Typography>
                                }
                                {profileEditErrors.profile_picture && <Typography variant="caption" color="error">
                                    {profileEditErrors.profile_picture}
                                </Typography>}
                                <TextField
                                    name="username"
                                    type="text"
                                    value={profileEditValues.username || ''}
                                    onChange={(e) => changeHandler(e.target.name, e.target.value)}
                                    fullWidth
                                    error={!!profileEditErrors.username}
                                    helperText={profileEditErrors.username || ''}
                                    variant="outlined"
                                    label="Username"
                                    required
                                    disabled={profileEditLoading}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        padding: 1.5,
                                    }}
                                    disabled={profileEditLoading}
                                >
                                    {profileEditLoading ? <CircularProgress size={24}/> : "Edit Profile"}
                                </Button>
                            </Box>
                        </CustomModal>
                    </>}
                </div>

                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="inherit"
                        indicatorColor="primary"
                        centered
                    >
                        <Tab label="Recipes"/>
                        <Tab label="Collections"/>
                    </Tabs>
                </Box>

                <div>
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
                                    <div key={`collection-${collection.id}`}
                                         onClick={() => handleDrawerOpen(collection)}>
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
                                                <Divider/>
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