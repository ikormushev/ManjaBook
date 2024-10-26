import {useEffect, useState} from "react";
import RecipeDetail from "../recipeDetail/RecipeDetail.jsx";
import styles from './RecipesDashboard.module.css';

const backendURL = import.meta.env.VITE_BACKEND_URL;
const apiUrl = `${backendURL}/recipes/`;

export default function RecipesDashboard(){
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(()=> {
        const fetchData = async () => {
            try {
                const recipesResponse = await fetch(apiUrl);
                if (!recipesResponse.ok) {
                    throw new Error();
                }
                const data = await recipesResponse.json();
                setRecipes(data);
            } catch (e) {
                console.log(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <ul className={styles.recipeDashboard}>
            {recipes.map((recipe) =>
                RecipeDetail(recipe)
            )}
        </ul>
    );
};