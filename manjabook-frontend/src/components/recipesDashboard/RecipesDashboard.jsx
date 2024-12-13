import {useEffect, useState} from "react";
import RecipeCard from "../recipeCard/RecipeCard.jsx";
import styles from './RecipesDashboard.module.css';
import {Link} from "react-router-dom";
import Loading from "../../utils/loading/Loading.jsx";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const apiUrl = `${backendURL}/recipes/`;

export default function RecipesDashboard(){
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(()=> {
        const fetchData = async () => {
            try {
                const recipesResponse = await fetch(apiUrl);
                if (recipesResponse.ok) {
                    const data = await recipesResponse.json();
                    setRecipes(data);
                }
            } catch (e) {
                console.log(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loading/>;

    return (
        <ul className={styles.recipeDashboard}>
            {recipes.map((recipe) =>
                <Link 
                    to={`${recipe.id}/${recipe.slug}`}
                    key={recipe.id}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    {RecipeCard(recipe)}
                </Link>
            )}
        </ul>
    );
};