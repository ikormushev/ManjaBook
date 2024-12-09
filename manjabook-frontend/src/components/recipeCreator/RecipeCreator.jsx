import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Typography,
    InputLabel,
} from '@mui/material';
import styles from "./RecipeCreator.module.css";
import ProductAdd from "../productAdd/ProductAdd.jsx";
import ProductDetail from "../productDetail/ProductDetail.jsx";
import addButtonIcon from "../../assets/images/add-button-icon.png";
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const apiRecipeCreate = `${backendURL}/recipes/`;
const apiProducts = `${backendURL}/products/`;
const apiUnits = `${backendURL}/units/`;

const recipeTemplate = {
    name: "",
    quick_description: "",
    products: [],
    preparation: "",
    portions: 0,
    time_to_prepare: 0,
    time_to_cook: 0,
    image: null
};


export default function RecipeCreator() {
    const navigate = useNavigate();
    const location = useLocation();
    const recipeData = location.state?.recipeData || null;

    if (recipeData) {
        Object.entries(recipeTemplate).forEach(([key, value]) => {
            recipeTemplate[key] = recipeData[key];
        });
        recipeTemplate.image = null;
    }
    const [showProductModal, setShowProductModal] = useState(false);

    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [fetchErrors, setFetchErrors] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const [formValues, setFormValues] = useState(recipeTemplate);
    const [selectedProducts, setSelectedProducts] = useState(recipeData ? recipeData.products : []);

    const validateForms = (values) => {
        const errors = {};
        if (!values.name.trim()) {
            errors.name = "Name is required!";
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForms(formValues);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return null;
        }

        const formData = new FormData();
        if (!formValues.image) {
            delete formValues.image;
        }
        for (const key in formValues) {
            formData.append(key, formValues[key]);
        }

        formData.append('products', JSON.stringify(selectedProducts.map((itemInfo) => {
            return {
                product_id: itemInfo.product.id,
                unit_id: itemInfo.unit.id,
                quantity: Number(itemInfo.quantity)
            };
        })));

        try {
            const response = await fetch(recipeData ?
                `${apiRecipeCreate}${recipeData.id}/`:
                apiRecipeCreate, {
                method: recipeData ? "PUT": "POST",
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                navigate("/recipes");
            } else {
                console.log(response);
                setFetchErrors(response.error.message);
            }
        } catch (error) {
            setFetchErrors(error.message);
        }
    };

    const changeHandler = (e) => {
        const targetType = e.target.type;
        let targetValue = e.target.value;
        if (targetType === 'file') {
            targetValue = e.target.files[0];
        }
        setFormValues(oldValues => ({
            ...oldValues,
            [e.target.name]: targetValue,
        }));
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(apiProducts, {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                setFetchErrors(error);
            }
        };

        const fetchUnits = async () => {
            try {
                const response = await fetch(apiUnits, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setUnits(data);
                }
            } catch (error) {
                setFetchErrors(error);
            }
        };

        fetchProducts();
        fetchUnits()
    }, []);

    const handleSelectedProducts = (data) => {
        setSelectedProducts(oldValues => [...oldValues, data]);
    };

    const handleDeleteProduct = (itemID) => {
        setSelectedProducts(oldValues =>
            oldValues.filter((itemInfo) => itemInfo.product.id !== itemID));
    };

    const handleEditProduct = (data) => {
        setSelectedProducts(oldValues =>
            oldValues.map((itemInfo) =>
                itemInfo.product.id !== data.product.id
                    ? itemInfo
                    : data)
        );
    };

    const handleModalMode = () => {
        setShowProductModal(!showProductModal);
    };

    return (
        <Box
            component="form"
            encType="multipart/form-data"
            sx={{
                display: 'flex',
                gap: 2,
                padding: 2,
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                }
            }}
            onSubmit={handleSubmit} // Trigger your submit logic here
        >
            <div className={styles.recipeImageInfo}>
                <div className={styles.recipeImageContainer}>
                    {recipeData ?
                        <img src={recipeData.image} alt="recipe_image"/> :
                        <img src={defaultRecipeImage} alt="recipe_image"/>}
                </div>
                <InputLabel htmlFor="image">Upload Image:</InputLabel>
                <input
                    id="image"
                    name="image"
                    type="file"
                    onChange={changeHandler}
                />

                <div>
                    <InputLabel htmlFor="portions">Portions:</InputLabel>
                    <TextField
                        id="portions"
                        name="portions"
                        type="number"
                        value={formValues.portions}
                        onChange={changeHandler}
                        placeholder="0"
                        fullWidth
                        error={!!formErrors.portions}
                        helperText={formErrors.portions || ''}
                        variant="outlined"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="time_to_prepare">Time to Prepare:</InputLabel>
                    <TextField
                        id="time_to_prepare"
                        name="time_to_prepare"
                        type="number"
                        value={formValues.time_to_prepare}
                        onChange={changeHandler}
                        placeholder="0"
                        fullWidth
                        error={!!formErrors.time_to_prepare}
                        helperText={formErrors.time_to_prepare || ''}
                        variant="outlined"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="time_to_cook">Time to Cook:</InputLabel>
                    <TextField
                        id="time_to_cook"
                        name="time_to_cook"
                        type="number"
                        value={formValues.time_to_cook}
                        onChange={changeHandler}
                        placeholder="0"
                        fullWidth
                        error={!!formErrors.time_to_cook}
                        helperText={formErrors.time_to_cook || ''}
                        variant="outlined"
                    />
                </div>
            </div>

            <div className={styles.recipeBodyContainer}>
                <div className={styles.recipeBody}>
                    <div>
                        <InputLabel htmlFor="name">Recipe Name:</InputLabel>
                        <TextField
                            id="name"
                            name="name"
                            value={formValues.name}
                            onChange={changeHandler}
                            placeholder="Recipe Name"
                            fullWidth
                            error={!!formErrors.name}
                            helperText={formErrors.name || ''}
                            variant="outlined"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="quick_description">Description:</InputLabel>
                        <TextField
                            id="quick_description"
                            name="quick_description"
                            value={formValues.quick_description}
                            onChange={changeHandler}
                            placeholder="Description"
                            fullWidth
                            multiline
                            rows={4}
                            error={!!formErrors.quick_description}
                            helperText={formErrors.quick_description || ''}
                            variant="outlined"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="preparation">Preparation:</InputLabel>
                        <TextField
                            id="preparation"
                            name="preparation"
                            value={formValues.preparation}
                            onChange={changeHandler}
                            placeholder="Preparation"
                            fullWidth
                            multiline
                            rows={4}
                            error={!!formErrors.preparation}
                            helperText={formErrors.preparation || ''}
                            variant="outlined"
                        />
                    </div>
                </div>

                <div className={styles.selectedProducts}>
                    <div className={styles.selectedProductsHeader}>
                        <h3>Selected Products:</h3>
                        <ProductAdd
                            products={products}
                            units={units}
                            onSendData={handleSelectedProducts}
                            handleModalMode={handleModalMode}
                            showProductModal={showProductModal}
                        >
                            <button className={styles.addButton} type="button" onClick={handleModalMode}>
                                <img src={addButtonIcon} alt="Add Product"/>
                            </button>
                        </ProductAdd>
                    </div>
                    <div className={styles.selectedProductsBody}>
                        {selectedProducts.map((productInfo) => (
                            <div key={`${productInfo.product.id}-${productInfo.unit.id}-${productInfo.quantity}`}>
                                <ProductDetail productInfo={productInfo}
                                               onDeleteProduct={handleDeleteProduct}
                                               onEditProduct={handleEditProduct}
                                               units={units}
                                />
                            </div>

                        ))}
                    </div>
                    <button
                        type="submit"
                        className={`${styles.submitButton} ${styles.submitButtonHover}`}
                    >
                        Submit Recipe
                    </button>
                </div>
            </div>

            {/*<button*/}
            {/*    type="submit"*/}
            {/*    className={`${styles.submitButton} ${styles.submitButtonHover}`}*/}
            {/*>*/}
            {/*    Submit Recipe*/}
            {/*</button>*/}
        </Box>
    );
};

