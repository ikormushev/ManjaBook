import styles from "./RecipeProducts.module.css";
import {Accordion, AccordionSummary, AccordionDetails, Typography} from '@mui/material';
import {useState} from "react";


export default function RecipeProducts({products}) {
    const [expanded, setExpanded] = useState(null);

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : null);
    };

    return (
            products.map((productInfo) => {
                const product = productInfo.product;

                return  <
                    Accordion
                    expanded={expanded === `${product.id}-${productInfo.unit.id}`}
                    onChange={handleAccordionChange(`${product.id}-${productInfo.unit.id}`)}
                    key={`${product.id}-${product.name}-${productInfo.unit.id}`}
                    disableGutters
                    sx={{
                        width: '20em',
                    }}
                >
                    <AccordionSummary>
                        <Typography>
                            {product.name} - {productInfo.quantity} {productInfo.unit.abbreviation} {productInfo.unit.is_customizable && (productInfo.custom_unit ? `(${productInfo.custom_unit.custom_convert_to_base_rate} ${productInfo.unit.base_unit})`: `(${productInfo.unit.convert_to_base_rate} ${productInfo.unit.base_unit})`)}
                        </Typography>

                    </AccordionSummary>

                    <AccordionDetails>
                        <div className={styles.productDetail}>
                            <div className={styles.productNutrients}>
                                <span>Calories: {productInfo.calories}</span>
                                <span>Protein: {productInfo.protein}</span>

                                <span>Carbohydrates: {productInfo.carbohydrates}</span>
                                <span>Sugars: {productInfo.sugars}</span>

                                <span>Fats: {productInfo.fats}</span>
                                <span>Saturated Fats: {productInfo.saturated_fats}</span>

                                <span>Salt: {productInfo.salt}</span>
                                <span>Fibre: {productInfo.fibre}</span>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>
            })
    );
}