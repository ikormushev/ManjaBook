import styles from "./ProductCard.module.css";

export default function ProductCard({product, children}) {
    return (
        <div className={styles.product}>
            <div className={styles.productHeader}>
                {children}
            </div>

            <div className={styles.productBody}>
                <div className={styles.productTitle}>
                    <span>{product.name}</span>
                </div>

                <div className={styles.productDetail}>

                    <span>{product.calories} kcal</span>
                    <div className={styles.productNutrients}>
                        <span>Carbs: {product.carbohydrates}</span>
                        <span>Protein: {product.protein}</span>
                        <span>Fats: {product.fats}</span>
                    </div>
                    {product.shopped_from && (
                        <div>
                            {product.shopped_from.map((shop) => (
                                <span key={`shop-${product.id}-${shop.id}`}>{shop.name}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};