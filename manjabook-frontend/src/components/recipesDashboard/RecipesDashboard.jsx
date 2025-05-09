import {useEffect, useState} from "react";
import RecipeCard from "../recipeCard/RecipeCard.jsx";
import Loading from "../../utils/loading/Loading.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import SearchBar from "../../utils/searchBar/SearchBar.jsx";
import {Box, Typography} from "@mui/material";
import {Link} from "react-router-dom";

export default function RecipesDashboard() {
    const {setError} = useError();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchedRecipes, setSearchedRecipes] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipesResponse = await fetch(API_ENDPOINTS.recipes, {
                    method: "GET",
                    credentials: "include",
                });
                if (recipesResponse.ok) {
                    const data = await recipesResponse.json();
                    setRecipes(data);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loading/>;

    const handleSearch = async (searchTerm) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.recipes}?search=${searchTerm}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setSearchedRecipes(data);
            }
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                gap: 3,
                flexDirection: "column",
                padding: 3,
            }}
        >
            <Box>
                <Typography variant="h4" gutterBottom
                            sx={{
                                color: "#ab47bc",
                                fontWeight: "bold",
                                textAlign: "center",
                                textTransform: "uppercase",
                                padding: 1
                            }}>
                    Recipes
                </Typography>
                <SearchBar onSearch={handleSearch} removeSearch={() => setSearchedRecipes(null)} />
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    justifyContent: {
                        xs: "center",
                        sm: "flex-start"
                    },
                }}
            >
                {searchedRecipes ?
                    searchedRecipes.map((recipe) => <Link to={`${recipe.id}/${recipe.slug}`} key={`${recipe.id}-${recipe.name}`}>
                        <RecipeCard recipe={recipe}/>
                    </Link>
                    ) :
                    recipes.map((recipe) => <Link to={`${recipe.id}/${recipe.slug}`} key={`${recipe.id}-${recipe.name}`}>
                        <RecipeCard recipe={recipe}/>
                    </Link>
                    )}
            </Box>
        </Box>
    );
};