import styles from './RecipeCard.module.css';
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";

export default function RecipeCard(recipeDetails) {
    const totalTime = recipeDetails.time_to_prepare + recipeDetails.time_to_cook;
    const totalCalories = recipeDetails.total_nutrients.calories;
    const creatorInfo = recipeDetails.created_by;

    return (<li key={recipeDetails.id}>
            <div className={styles.recipeDetail}>
                <div className={styles.recipeDetailHeader}>
                    {recipeDetails.image ?
                        <img src={recipeDetails.image} alt="recipe_image"/> :
                        <img src={defaultRecipeImage} alt="default_recipe_image"/>}
                </div>

                <div className={styles.recipeDetailBody}>
                    <div className={styles.recipeDetailTitle}>
                        <p>{recipeDetails.name}</p>
                    </div>
                    <div className={styles.recipeDetailInfo}>
                        <p>🔁 {totalTime} minutes</p>
                        <p>🔥 {totalCalories} calories</p>
                    </div>
                </div>

                {creatorInfo ? <div className={styles.recipeDetailCreator}>
                    <div className={styles.profilePicture}>
                        <img src={creatorInfo.profile_picture} alt="recipeDetails.image"/>
                    </div>
                    <p>{creatorInfo.username}</p>
                </div> : null}
            </div>
        </li>
    );
};