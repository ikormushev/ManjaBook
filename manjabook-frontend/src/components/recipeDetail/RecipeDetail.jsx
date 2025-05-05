import {Link, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import PageNotFound from "../pageNotFound/PageNotFound.jsx";
import RecipeProducts from "../recipeProduct/RecipeProducts.jsx";
import defaultUserPicture from "../../assets/images/default-user-picture.png";
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";
import editButtonIcon from "../../assets/images/edit-button-icon.png";
import deleteButtonIcon from '../../assets/images/delete-button-icon.png';
import addButtonIcon from "../../assets/images/add-button-icon.png";
import Loading from "../../utils/loading/Loading.jsx";
import RecipeCreator from "../recipeCreator/RecipeCreator.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import {Avatar, Box, IconButton, Typography} from "@mui/material";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import CustomModal from "../../utils/customModal/CustomModal.jsx";
import RecipeAddToCollection from "../recipeAddToCollection/RecipeAddToCollection.jsx";
import {useSuccess} from "../../context/successProvider/SuccessProvider.jsx";

const anonymousUser = {
    profile_picture: defaultUserPicture,
    username: "AnonymousUser",
};

export default function RecipeDetail() {
    const {setError} = useError();
    const {setSuccess} = useSuccess();
    const {authState} = useAuth();
    const isAuthenticated = authState.isAuthenticated;

    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const {recipeID, recipeSlug} = useParams();
    const [recipe, setRecipe] = useState(null);
    const [editRecipe, setEditRecipe] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const recipeResponse = await fetch(`${API_ENDPOINTS.recipes}${recipeID}`, {
                    method: "GET",
                    credentials: "include", // later - same-origin
                });
                if (recipeResponse.ok) {
                    const data = await recipeResponse.json();
                    setRecipe(data);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, []);

    if (loading) return <Loading/>;
    if (!recipe) return <PageNotFound/>;
    const formatedDate = new Date(recipe.created_at);

    const date = {
        day: String(formatedDate.getDate()).padStart(2, '0'),
        month: String(formatedDate.getMonth() + 1).padStart(2, '0'),
        year: formatedDate.getFullYear(),
    };

    const handleModalMode = () => {
        setShowCollectionModal(!showCollectionModal);
    };

    const handleEditButton = () => {
        setEditRecipe(true);
    };
    const handleDeleteButton = () => {
        const fetchDelete = async () => {
            try {
                const recipeResponse = await fetch(`${API_ENDPOINTS.recipes}${recipeID}/`, {
                    method: "DELETE",
                    credentials: "include", // later - same-origin
                });
                if (recipeResponse.ok) {
                    navigate("/recipes");
                    setSuccess("Recipe successfully deleted!");
                }
            } catch (e) {
                setError(e.message);
            }
        };

        fetchDelete();
    };

    const userCard = (url, user) => {
        return (
            <Link to={url}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,

                        backgroundColor: "white",
                        borderRadius: "3em",
                        padding: "0.5em 2em",
                        boxShadow: 1,

                        position: "absolute",
                        top: "1.5em",
                        left: "2em",
                        zIndex: 10,
                    }}
                >
                    <Avatar
                        src={user.profile_picture}
                        alt={user.username}
                        sx={{
                            width: {
                                xs: "2em",
                                md: "3em"
                            },
                            height: {
                                xs: "2em",
                                md: "3em"
                            },
                    }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: "bold",
                            maxWidth: "15em",
                            fontSize: "1.2em",
                        }}
                        noWrap
                    >
                        {user.username}
                    </Typography>
                </Box>
            </Link>
        );
    };

    return (
        editRecipe ?
            <RecipeCreator recipeData={recipe}/> :
            <Box sx={{
                padding: "2em",
                display: "flex",
                gap: 5,
                flexDirection: {
                    xs: "column",
                    lg: "row"
                },
            }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    justifyContent: {
                        xs: "center",
                        lg: "flex-start"
                    },
                    alignItems: {
                        xs: "center",
                        lg: "flex-start"
                    },
                }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: "bold"
                        }}
                    >
                        {recipe.name}
                    </Typography>
                    <Box
                        sx={{
                            position: "relative",
                            overflow: "visible",
                        }}
                    >
                        {recipe.created_by && recipe.created_by.is_active ?
                            userCard(`/profiles/${recipe.created_by.user_id}`, recipe.created_by) :
                            userCard("/profiles", anonymousUser)}

                        <Box
                            sx={{
                                maxWidth: "50em",
                                height: "auto",
                                position: "relative",
                            }}
                        >
                            {recipe.image ?
                                <img src={recipe.image} alt="recipe_image"/> :
                                <img src={defaultRecipeImage} alt="default_recipe_image"/>}

                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "0.5em",
                                    right: "0.25em",
                                    zIndex: 11,
                                }}
                            >
                                {isAuthenticated &&
                                    <>
                                        <IconButton onClick={handleModalMode} sx={{width: "3em"}}>
                                            <img src={addButtonIcon} alt="addButtonIcon"/>
                                        </IconButton>

                                        <CustomModal isOpen={showCollectionModal} onClose={handleModalMode}>
                                            <RecipeAddToCollection recipe={recipe}/>
                                        </CustomModal>
                                    </>
                                }
                            </Box>

                            {recipe.is_owner &&
                                <Box
                                    sx={{
                                        display: "flex",
                                        position: "absolute",
                                        bottom: "5em",
                                        right: "0.25em",
                                        zIndex: 10,
                                        "& img": {
                                            width: "2.5em"
                                        }
                                    }}
                                >
                                    <IconButton onClick={handleEditButton}>
                                        <img src={editButtonIcon} alt="editButtonIcon"/>
                                    </IconButton>
                                    <IconButton onClick={handleDeleteButton}>
                                        <img src={deleteButtonIcon} alt="deleteButtonIcon"/>
                                    </IconButton>
                                </Box>
                            }

                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontStyle: "italic",
                                    padding: "1em 0",
                                    textAlign: "center",
                                    fontSize: "1.2em"
                                }}
                            >
                                &quot;{recipe.quick_description}&quot;
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-around",
                                flexWrap: "wrap",
                                gap: "1.5em",
                                "& div": {
                                    backgroundColor: "white",
                                    borderRadius: "0.2em",
                                    padding: "0.5em",
                                    boxShadow: "rgba(0, 0, 0, 0.02) 0 0.1em 0.3em 0, " +
                                        "rgba(27, 31, 35, 0.15) 0 0 0 0.1em",
                                }
                            }}
                        >
                            <div>
                                <p>📅 {`${date.day}/${date.month}/${date.year}`}</p>
                            </div>

                            <div>
                                <p>🍲 {recipe.portions} portions</p>
                            </div>

                            <div>
                                <p>📄 Prep: {recipe.time_to_prepare} min</p>
                                <p>🍳 Cooking: {recipe.time_to_cook} min</p>
                            </div>
                            <div>
                                <p>🔥 {recipe.total_nutrients.calories} cals</p>
                            </div>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                }}>
                    <Box>
                        <Typography
                            sx={{
                                color: "white",
                                backgroundColor: "#105D5E",
                                padding: "1em",
                                margin: "0 0.5em",
                                fontWeight: "bold",
                            }}
                        >
                            Products
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                padding: "1em",
                                gap: "1em",
                                alignItems: "flex-start",
                                boxShadow: "rgba(0, 0, 0, 0.02) 0 0.1em 0.3em 0, " +
                                    "rgba(27, 31, 35, 0.15) 0 0 0 0.1em",
                                backgroundColor: "white",
                            }}
                        >
                            <RecipeProducts products={recipe.products}/>
                        </Box>
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                color: "white",
                                backgroundColor: "#105D5E",
                                padding: "1em",
                                margin: "0 0.5em",
                                fontWeight: "bold",
                            }}
                        >
                            Preparation
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                padding: "1em",
                                boxShadow: "rgba(0, 0, 0, 0.02) 0 0.1em 0.3em 0, " +
                                    "rgba(27, 31, 35, 0.15) 0 0 0 0.1em",
                            }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    whiteSpace: "pre-line",
                                    fontSize: "1.2em",
                                }}
                            >
                                {recipe.preparation}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
    );
}