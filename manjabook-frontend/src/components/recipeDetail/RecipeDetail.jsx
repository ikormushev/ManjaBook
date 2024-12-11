import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import PageNotFound from "../pageNotFound/PageNotFound.jsx";
import styles from './RecipeDetail.module.css';
import RecipeProducts from "../recipeProduct/RecipeProducts.jsx";
import defaultUserPicture from "../../assets/images/default-user-picture.png";
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const apiRecipeDetailURL = `${backendURL}/recipes`;

const recipeDetailTemplate = {
    id: 0,
    name: "",
    quick_description: "",
    time_to_cook: 0,
    time_to_prepare: 0,
    slug: ""
};

export default function RecipeDetail() {
    const {recipeID, recipeSlug} = useParams();
    const [recipe, setRecipe] = useState(recipeDetailTemplate);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const recipeResponse = await fetch(`${apiRecipeDetailURL}/${recipeID}`);
                if (recipeResponse.ok) {
                    const data = await recipeResponse.json();
                    setRecipe(data);
                }
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (recipe === recipeDetailTemplate) return <PageNotFound/>;
    const formatedDate = new Date(recipe.created_at);
    const date = {
        day: String(formatedDate.getDay()).padStart(2, '0'),
        month: String(formatedDate.getMonth()).padStart(2, '0'),
        year: formatedDate.getFullYear(),
    };


    return (<div className={styles.recipeContainer}>
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
                    <RecipeProducts products={recipe.products} />
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
    </div>);
}