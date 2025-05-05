import {Accordion, AccordionSummary, AccordionDetails, Typography, Box} from '@mui/material';
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
                            <b>{product.name}</b> - {productInfo.quantity} {productInfo.unit.abbreviation} {productInfo.unit.is_customizable && (productInfo.custom_unit ? `(${productInfo.custom_unit.custom_convert_to_base_rate} ${productInfo.unit.base_unit})`: `(${productInfo.unit.convert_to_base_rate} ${productInfo.unit.base_unit})`)}
                        </Typography>

                    </AccordionSummary>

                    <AccordionDetails>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.2em"
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "0.8em",
                                    "& span": {
                                        color: "#007bff",
                                        backgroundColor: "#eaf4fc",
                                        padding: "0.2em 0.4em",
                                        borderRadius: "0.2em",
                                }
                                }}
                            >
                                <span>Calories: {productInfo.calories}</span>
                                <span>Protein: {productInfo.protein}</span>

                                <span>Carbohydrates: {productInfo.carbohydrates}</span>
                                <span>Sugars: {productInfo.sugars}</span>

                                <span>Fats: {productInfo.fats}</span>
                                <span>Saturated Fats: {productInfo.saturated_fats}</span>

                                <span>Salt: {productInfo.salt}</span>
                                <span>Fibre: {productInfo.fibre}</span>
                            </Box>
                            <br/>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5em",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                    }}
                                >
                                    Shopped from:
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: "1em",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {product.shopped_from.map((shop) => {
                                        return <span key={`${shop.name}-${shop.id}`}>{shop.name}</span>
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            })
    );
}