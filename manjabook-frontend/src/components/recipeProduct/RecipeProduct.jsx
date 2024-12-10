import styles from "./RecipeProduct.module.css";

export default function RecipeProduct({recipeProduct, children}) {
    const product = recipeProduct.product;

    return (
        <div className={styles.product}>
            <div className={styles.productHeader}>
                {children}
            </div>

            <div className={styles.productBody}>
                <div className={styles.productTitle}>
                    <span>{product.name} - {recipeProduct.quantity} {recipeProduct.unit.abbreviation}</span>
                </div>

                <div className={styles.productDetail}>
                    <div className={styles.productNutrients}>
                        <span>Calories: {recipeProduct.calories}</span>
                        <span>Carbs: {recipeProduct.carbohydrates}</span>
                        <span>Protein: {recipeProduct.protein}</span>
                        <span>Fats: {recipeProduct.fats}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}