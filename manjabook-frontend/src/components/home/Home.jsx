import {Box, Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import Loading from "../../utils/loading/Loading.jsx";

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
                backgroundColor: '#f4f4f4',
                padding: 4,
                borderRadius: 2,
                textAlign: 'center',
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
                onClick={() => navigate('/recipes')}
            >
                Explore Recipes
            </Button>
        </Box>

        {loading ? <Loading/> : <Box>
            <Typography variant="h4" gutterBottom
                        sx={{
                            color: '#105D5E',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            padding: 1
                        }}>
                Featured Recipes
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: 3,
                }}
            >
                {featuredRecipes.map((recipe) => (
                    <Box
                        key={recipe.id}
                        sx={{
                            flex: '1 1 calc(33% - 16px)',
                            maxWidth: 'calc(33% - 16px)',
                            minWidth: '200px',
                        }}
                    >
                        <Card>
                            <CardMedia
                                component="img"
                                image={recipe.image}
                                alt={recipe.name}
                            />
                            <CardContent>
                                <Typography variant="h6">{recipe.name}</Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => navigate(`/recipes/${recipe.id}/${recipe.slug}`)}
                                    sx={{marginTop: 1}}
                                >
                                    View Recipe
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
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