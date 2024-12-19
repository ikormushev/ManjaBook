import {useEffect, useState} from "react";
import RecipeCard from "../recipeCard/RecipeCard.jsx";
import styles from './RecipesDashboard.module.css';
import {Link} from "react-router-dom";
import Loading from "../../utils/loading/Loading.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import SearchBar from "../../utils/searchBar/SearchBar.jsx";
import {Typography} from "@mui/material";

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

    const showRecipe = (recipe) => {
      return (<Link
          to={`${recipe.id}/${recipe.slug}`}
          key={recipe.id}
          style={{textDecoration: 'none', color: 'inherit'}}
      >
          {RecipeCard(recipe)}
      </Link>);
    };

    return (
        <div className={styles.recipesContainer}>
            <Typography variant="h4" gutterBottom
                        sx={{
                            color: '#ab47bc',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            padding: 1
                        }}>
                Recipes
            </Typography>
            <SearchBar onSearch={handleSearch} removeSearch={() => setSearchedRecipes(null)} />

            <ul className={styles.recipeDashboard}>
                {searchedRecipes ?
                    searchedRecipes.map((recipe) => showRecipe(recipe)) :
                    recipes.map((recipe) => showRecipe(recipe))}
            </ul>
        </div>
    );
};