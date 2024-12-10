import styles from './RecipeCard.module.css';

export default function RecipeCard(recipeDetails) {
    const totalTime = recipeDetails.time_to_prepare + recipeDetails.time_to_cook;
    const totalCalories = recipeDetails.total_nutrients.calories;
    const creatorInfo = recipeDetails.created_by;

    return (<li key={recipeDetails.id}>
            <div className={styles.recipeDetail}>
                <div className={styles.recipeDetailHeader}>
                    <img src={recipeDetails.image} alt="recipeDetails.image"/>
                </div>
                <div className="recipeDetailBody">
                    <div className={styles.recipeDetailTitle}>
                        <p>{recipeDetails.name}</p>
                    </div>
                    <div className={styles.recipeDetailInfo}>
                        <p>🔁 {totalTime} minutes</p>
                        <p>🔥 {totalCalories} calories</p>
                    </div>
                </div>
                <div className={styles.recipeDetailCreator}>
                    <div className={styles.profilePicture}>
                        <img src={creatorInfo.profile_picture} alt="recipeDetails.image"/>
                    </div>
                    <p>{creatorInfo.username}</p>
                </div>
            </div>
        </li>
    );
};