import {Link, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import PageNotFound from "../pageNotFound/PageNotFound.jsx";
import styles from './RecipeDetail.module.css';
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
import {IconButton} from "@mui/material";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import CustomModal from "../../utils/modal/CustomModal.jsx";
import RecipeAddToCollection from "../recipeAddToCollection/RecipeAddToCollection.jsx";
import {useSuccess} from "../../context/successProvider/SuccessProvider.jsx";

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

    return (
        editRecipe ?
            <RecipeCreator recipeData={recipe}/> :
            <div className={styles.recipeContainer}>
                <div className={styles.recipeInfo}>
                    <h2>{recipe.name}</h2>
                    <div className={styles.recipeImageContainer}>
                        <div className={styles.creator}>
                            <Link to={`/profile/${recipe.created_by.user_id}`}>
                                <div className={styles.profilePicture}>
                                    {recipe.created_by.profile_picture ?
                                        <img src={recipe.created_by.profile_picture} alt="profile_picture"/> :
                                        <img src={defaultUserPicture} alt="profile_picture"/>}

                                </div>
                            </Link>
                            <div className={styles.creatorInfo}>
                                <div className={styles.creatorUsername}>
                                    <p>@{recipe.created_by.username}</p>
                                </div>
                                <div className={styles.recipeDate}>
                                    <p>📅 {`${date.day}/${date.month}/${date.year}`}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.recipeImage}>
                            {recipe.image ?
                                <img src={recipe.image} alt="recipe_image"/> :
                                <img src={defaultRecipeImage} alt="default_recipe_image"/>}
                            <div className={styles.recipeMenuButtons}>
                                {isAuthenticated &&
                                    <>
                                        <IconButton onClick={handleModalMode}>
                                            <img src={addButtonIcon} alt="addButtonIcon"/>
                                        </IconButton>
                                        <CustomModal isOpen={showCollectionModal} onClose={handleModalMode}>
                                            <RecipeAddToCollection recipe={recipe}/>
                                        </CustomModal>
                                    </>
                                }
                            </div>
                            {recipe.is_owner && <div className={styles.recipeOwnerButtons}>
                                <IconButton onClick={handleEditButton}>
                                    <img src={editButtonIcon} alt="editButtonIcon"/>
                                </IconButton>
                                <IconButton onClick={handleDeleteButton}>
                                    <img src={deleteButtonIcon} alt="deleteButtonIcon"/>
                                </IconButton>
                            </div>}
                            <div className={styles.recipeQuickDescription}>
                                <p>"{recipe.quick_description}"</p>
                            </div>
                        </div>
                        <div className={styles.recipeCookInfo}>
                            <div className={styles.recipeCookInfoField}>
                                <p>🍲 {recipe.portions} portions</p>
                            </div>

                            <div className={styles.recipeCookInfoField}>
                                <p>📄 Prep: {recipe.time_to_prepare} min</p>
                                <p>🍳 Cooking: {recipe.time_to_cook} min</p>
                            </div>

                            <div className={styles.recipeCookInfoField}>
                                <p>🔥 {recipe.total_nutrients.calories} cals</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.recipeBodyContainer}>
                    <div className={styles.productsContainer}>
                        <div className={styles.productsHeader}>
                            <p>Products</p>
                        </div>
                        <div className={styles.products}>
                            <RecipeProducts products={recipe.products}/>
                        </div>
                    </div>
                    <div className={styles.preparationContainer}>
                        <div className={styles.preparationHeader}>
                            <p>Preparation</p>
                        </div>
                        <div className={styles.preparationBody}>
                            <span>{recipe.preparation}</span>
                        </div>
                    </div>
                </div>
            </div>
    );
}