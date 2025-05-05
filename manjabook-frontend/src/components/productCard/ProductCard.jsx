import {Box, Typography} from "@mui/material";

export default function ProductCard({product, children}) {

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
                width: "350px",
                padding: 2,
                border: "1px solid #DDD",
                borderRadius: 3,
                boxShadow: "rgba(0, 0, 0, 0.02) 0 0.1em 0.3em 0",
                gap: 1
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                {children}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }}
            >
                <Typography
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1.2em",
                    }}
                >
                    {product.name}
                </Typography>

                <Typography>
                    {product.calories} kcal
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.6em",
                        "& span": {
                            color: "#007bff",
                            backgroundColor: "#eaf4fc",
                            padding: "0.2em 0.4em",
                            borderRadius: "0.2em",
                        }
                    }}
                >
                    <span>Protein: {product.protein}</span>

                    <span>Carbs: {product.carbohydrates}</span>
                    <span>Sugars: {product.sugars}</span>

                    <span>Fats: {product.fats}</span>
                    <span>Saturated Fats: {product.saturated_fats}</span>

                    <span>Salt: {product.salt}</span>
                    <span>Fibre: {product.fibre}</span>
                </Box>

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
                        {product.shopped_from?.map((shop) => {
                            return <span key={`${shop.name}-${shop.id}`}>{shop.name}</span>
                        })}
                    </Box>
                </Box>
            </Box>
        </Box>

    );
};