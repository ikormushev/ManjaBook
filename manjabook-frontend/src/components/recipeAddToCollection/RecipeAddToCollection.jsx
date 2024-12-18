import {
    Box,
    Button,
    Checkbox, CircularProgress,
    FormControlLabel,
    ListItem, ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography
} from "@mui/material";
import {useEffect, useState} from "react";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import {useSuccess} from "../../context/successProvider/SuccessProvider.jsx";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";

export default function RecipeAddToCollection({recipe}) {
    const {authState} = useAuth();
    const {setError} = useError();
    const {setSuccess} = useSuccess();

    const [collections, setCollections] = useState([]);

    const [createCollectionMode, setCreateCollectionMode] = useState(false);
    const [newCollection, setNewCollection] = useState({
        name: "",
        is_private: false,
    });
    const [newCollectionErrors, setNewCollectionErrors] = useState({
        name: "",
        is_private: "",
    });
    const [recipeAddLoad, setRecipeAddLoad] = useState(false);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const recipeResponse = await fetch(`${API_ENDPOINTS.recipesCollections}?userId=${authState.userID}`, {
                    method: "GET",
                    credentials: "include", // later - same-origin
                });

                if (recipeResponse.ok) {
                    const data = await recipeResponse.json();
                    setCollections(data);
                }
            } catch (e) {
                setError(e.message);
            }
        };

        fetchCollections();
    }, []);

    const handleCreateCollectionMode = () => {
        setCreateCollectionMode(!createCollectionMode);
    };
    const handleNewCollectionValues = (targetName, targetValue) => {
        setNewCollection(oldValues => ({...oldValues, [targetName]: targetValue}));
    };
    const handleNewCollectionSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const handleSubmit = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.recipesCollections, {
                    method: "POST",
                    body: JSON.stringify(newCollection),
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCollections(oldValues => [...oldValues, data]);
                    setCreateCollectionMode(false);
                    setSuccess("Collection created!");
                } else {
                    const data = await response.json();
                    setNewCollectionErrors(oldValues => ({...oldValues, ...data}));
                }
            } catch (error) {
                setError(error.message);
            }
        };

        handleSubmit();
    };

    const checkIfRecipeExists = (collection) => {
        return collection.recipes.includes(recipe.id);
    };

    const handleRecipeAddToCollection = (checkedStatus, collection, recipeId) => {

        if (checkedStatus) {
            collection.recipes.push(recipeId);
        } else {
            collection.recipes = collection.recipes.filter((recipe) => recipe !== recipeId);
        }

        delete collection.image;

        const handleRecipeCollectionSubmit = async () => {
            setRecipeAddLoad(true);

            try {
                const response = await fetch(`${API_ENDPOINTS.recipesCollections}${collection.id}/`, {
                    method: "PUT",
                    body: JSON.stringify(collection),
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    if (checkedStatus) {
                        setSuccess("Recipe added to collection!");
                    } else {
                        setSuccess("Recipe removed from collection!");
                    }
                } else {
                    const data = await response.json();
                    console.log(data);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setRecipeAddLoad(false);
            }
        };
        handleRecipeCollectionSubmit();
    };

    return (
        <Box
            sx={{
                display: "flex",
                gap: "1em",
                flexDirection: "column",
            }}
        >

            {!createCollectionMode ?
                <>
                    <Typography variant="h6">
                        Add recipe to:
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {collections.map((collection) => (
                            <ListItem key={collection.id}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={checkIfRecipeExists(collection)}
                                            onChange={(e) => handleRecipeAddToCollection(e.target.checked, collection, recipe.id)}
                                            disabled={recipeAddLoad}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={collection.name}/>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{padding: 1}}
                        onClick={handleCreateCollectionMode}
                        disabled={recipeAddLoad}
                    >
                        Create a new collection
                    </Button>
                </> :
                <>
                    <Typography variant="h6">
                        New Collection
                    </Typography>
                    <TextField
                        label="Name"
                        variant="outlined"
                        type="text"
                        onChange={(e) =>
                            handleNewCollectionValues('name', e.target.value)}
                        required
                        name="name"
                        error={!!newCollectionErrors.name}
                        helperText={newCollectionErrors.name || ''}
                    />
                    <FormControlLabel
                        control={<Checkbox
                            checked={newCollection.is_private}
                            onChange={(e) => handleNewCollectionValues('is_private', e.target.checked)}
                        />}
                        label="Make Private"
                    />
                    <Box
                        sx={{
                            display: "flex",
                            gap: 0.5,
                        }}
                        component="form"
                        onSubmit={handleNewCollectionSubmit}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{padding: 1}}
                            onClick={handleCreateCollectionMode}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{padding: 1}}
                            type="submit"
                        >
                            Create collection
                        </Button>
                    </Box>
                </>}
        </Box>
    )
}