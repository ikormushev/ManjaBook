import {useEffect, useState} from "react";
import RecipeCard from "../recipeCard/RecipeCard.jsx";
import styles from './RecipesDashboard.module.css';
import {Link} from "react-router-dom";
import Loading from "../../utils/loading/Loading.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import SearchBar from "../../utils/searchBar/SearchBar.jsx";

export default function RecipesDashboard() {
    const {setError} = useError();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

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
                setRecipes(data);
            }
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className={styles.recipesContainer}>
            <SearchBar onSearch={handleSearch} />
            <ul className={styles.recipeDashboard}>
                {recipes.map((recipe) =>
                    <Link
                        to={`${recipe.id}/${recipe.slug}`}
                        key={recipe.id}
                        style={{textDecoration: 'none', color: 'inherit'}}
                    >
                        {RecipeCard(recipe)}
                    </Link>
                )}
            </ul>
        </div>
    );
};