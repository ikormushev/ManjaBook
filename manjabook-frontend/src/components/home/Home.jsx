import {Box, Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import Loading from "../../utils/loading/Loading.jsx";
import RecipeCard from "../recipeCard/RecipeCard.jsx";

export default function Home() {
    const {setError} = useError();
    const navigate = useNavigate();
    const [featuredRecipes, setFeaturedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipesResponse = await fetch(`${API_ENDPOINTS.recipes}?limit=9`, {
                    method: "GET",
                    credentials: "include",
                });
                if (recipesResponse.ok) {
                    const data = await recipesResponse.json();
                    setFeaturedRecipes(data);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    return (<Box
        sx={{
            padding: 3,
            display: "flex",
            flexDirection: "column",
            gap: 4
        }}
    >
        <Box
            sx={{
                backgroundColor: '#F4F4F4',
                padding: 4,
                borderRadius: 2,
                textAlign: "center",
            }}
        >
            <Typography variant="h3" gutterBottom>
                Welcome to ManjaBook
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                The cookbook of the F U T U R E!
            </Typography>
            <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{marginTop: 2}}
                onClick={() => navigate("/recipes")}
            >
                Explore Recipes
            </Button>
        </Box>

        {loading ? <Loading/> : <Box>
            <Typography variant="h4" gutterBottom
                        sx={{
                            color: "#105D5E",
                            fontWeight: "bold",
                            textAlign: "center",
                            textTransform: "uppercase",
                            padding: 1
                        }}>
                Featured Recipes
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: {
                        xs: "center",
                        sm: "flex-start"
                    },
                    gap: 3,
                }}
            >
                {featuredRecipes.map((recipe) =>
                        <Link to={`recipes/${recipe.id}/${recipe.slug}`} key={`${recipe.id}-${recipe.name}`}>
                    <RecipeCard recipe={recipe}/>
                </Link>
                )}
            </Box>
        </Box>}
        <Box
            sx={{
                backgroundColor: '#e0f7fa',
                padding: 4,
                borderRadius: 2,
                textAlign: 'center',
            }}
        >
            <Typography variant="h5" gutterBottom>
                Ready to Create Your Own Recipe?
            </Typography>
            <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/create-recipe')}
            >
                Start Creating
            </Button>
        </Box>
    </Box>);
};