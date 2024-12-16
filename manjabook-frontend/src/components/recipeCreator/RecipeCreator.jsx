import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Box, TextField, InputLabel, Typography, CircularProgress, Button} from '@mui/material';
import styles from "./RecipeCreator.module.css";
import ProductAdd from "../productAdd/ProductAdd.jsx";
import ProductDetail from "../productDetail/ProductDetail.jsx";
import addButtonIcon from "../../assets/images/add-button-icon.png";
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import API_ENDPOINTS from "../../apiConfig.js";

export default function RecipeCreator({recipeData = null}) {
    const {setError} = useError();
    const navigate = useNavigate();
    const [totalProducts, setTotalProducts] = useState(0);

    const [showProductModal, setShowProductModal] = useState(false);
    const [units, setUnits] = useState([]);

    const [formErrors, setFormErrors] = useState({
        name: "",
        quick_description: "",
        products: "",
        preparation: "",
        portions: "",
        time_to_prepare: "",
        time_to_cook: "",
        image: "",
    });
    const [formValues, setFormValues] = useState(() => {
        const recipeTemplate = {
            name: "",
            quick_description: "",
            products: [],
            preparation: "",
            portions: 0,
            time_to_prepare: 0,
            time_to_cook: 0,
            image: null,
        };

        return recipeData ? {...recipeTemplate, ...recipeData, image: null} : recipeTemplate;
    });
    const [loadingFormValues, setLoadingFormValues] = useState(false);

    const [selectedProducts, setSelectedProducts] = useState(recipeData ? recipeData.products : []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingFormValues(true);
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
                quantity: Number(itemInfo.quantity),
                custom_unit_id: itemInfo.custom_unit.id
            };
        })));

        try {
            const response = await fetch(recipeData ?
                `${API_ENDPOINTS.recipes}${recipeData.id}` :
                API_ENDPOINTS.recipes, {
                method: recipeData ? "PUT" : "POST",
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                navigate("/recipes");
            } else {
                const data = await response.json();

                setFormErrors(oldValues => ({...oldValues, ...data}));
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoadingFormValues(false);
        }
    };

    const fileInputRef = useRef(null);
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

    const resetImage = (e) => {
        setFormValues(oldValues => ({
            ...oldValues,
            image: null,
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.units, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setUnits(data);
                }
            } catch (e) {
                setError(e.message);
            }
        };

        fetchUnits()
    }, []);

    const handleSelectedProducts = (data) => {
        setSelectedProducts((oldValues) => {
            const existingIndex = oldValues.findIndex(
                (itemInfo) =>
                    itemInfo.product.id === data.product.id &&
                    itemInfo.unit.id === data.unit.id
            );

            if (existingIndex === -1) {
                data.uniqueKey = `${totalProducts}-${data.product.id}`;
                setTotalProducts(oldValue => oldValue + 1);
                return [...oldValues, data];
            }

            if (data.custom_unit && oldValues[existingIndex].custom_unit) {
                setError("Cannot set custom unit to a product with an existing custom unit!");
                return oldValues
            }
            const updatedProducts = [...oldValues];
            updatedProducts[existingIndex] = {
                ...updatedProducts[existingIndex],
                quantity: updatedProducts[existingIndex].quantity + data.quantity,
            };
            return updatedProducts;
        });
    };

    const handleDeleteProduct = (data) => {
        setSelectedProducts(oldValues =>
            oldValues.filter((itemInfo) => itemInfo.uniqueKey !== data.uniqueKey));
    };

    const handleEditProduct = (data) => {
        setSelectedProducts(oldValues =>
            oldValues.map((itemInfo) =>
                itemInfo.uniqueKey !== data.uniqueKey
                    ? itemInfo
                    : data)
        );
    };

    const handleModalMode = () => {
        setShowProductModal(!showProductModal);
    };

    return (
        <>
            <Box
                component="form"
                encType="multipart/form-data"
                sx={{
                    display: 'flex',
                    gap: 2,
                    padding: 2,
                    flexWrap: 'wrap',
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                    }
                }}
                onSubmit={handleSubmit}
            >
                <div className={styles.recipeImageInfo}>
                    <div className={styles.recipeImageContainer}>
                        {recipeData ?
                            <img src={recipeData.image} alt="recipe_image"/> :
                            <img src={defaultRecipeImage} alt="recipe_image"/>}

                        <div className={styles.imageUploadOverlay}>
                            <InputLabel htmlFor="image">Upload Image</InputLabel>
                            <input
                                id="image"
                                name="image"
                                accept="image/*"
                                type="file"
                                onChange={changeHandler}
                                ref={fileInputRef}
                                hidden
                            />
                            {formValues.image &&
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        padding: 1,
                                        '&:hover': {
                                            backgroundColor: '#45a049',
                                        },
                                    }}
                                    onClick={resetImage}
                                    disabled={loadingFormValues}
                                >
                                    Remove
                                </Button>}
                        </div>
                    </div>
                    {formValues.image &&
                        <Typography variant="caption" color="success">
                            Image uploaded!
                        </Typography>
                    }
                    {formErrors.image && <Typography variant="caption" color="error">
                        {formErrors.image}
                    </Typography>}
                    <TextField
                        name="portions"
                        type="number"
                        value={formValues.portions || ''}
                        onChange={changeHandler}
                        fullWidth
                        error={!!formErrors.portions}
                        helperText={formErrors.portions || ''}
                        variant="outlined"
                        label="Portions"
                        required
                    />

                    <TextField
                        name="time_to_prepare"
                        type="number"
                        value={formValues.time_to_prepare || ''}
                        onChange={changeHandler}
                        fullWidth
                        error={!!formErrors.time_to_prepare}
                        helperText={formErrors.time_to_prepare || ''}
                        variant="outlined"
                        label="Time to Prepare"
                        required
                    />

                    <TextField
                        name="time_to_cook"
                        type="number"
                        value={formValues.time_to_cook || ''}
                        onChange={changeHandler}
                        fullWidth
                        error={!!formErrors.time_to_cook}
                        helperText={formErrors.time_to_cook || ''}
                        variant="outlined"
                        label="Time to Cook"
                        required
                    />
                </div>

                <div className={styles.recipeBodyContainer}>
                    <div className={styles.recipeBody}>
                        <TextField
                            name="name"
                            value={formValues.name}
                            onChange={changeHandler}
                            fullWidth
                            error={!!formErrors.name}
                            helperText={formErrors.name || ''}
                            variant="outlined"
                            label="Name"
                            required
                        />

                        <TextField
                            name="quick_description"
                            value={formValues.quick_description}
                            onChange={changeHandler}
                            fullWidth
                            multiline
                            rows={4}
                            error={!!formErrors.quick_description}
                            helperText={formErrors.quick_description || ''}
                            variant="outlined"
                            label="Description"
                            required
                        />

                        <TextField
                            id="preparation"
                            name="preparation"
                            value={formValues.preparation}
                            onChange={changeHandler}
                            fullWidth
                            multiline
                            rows={4}
                            error={!!formErrors.preparation}
                            helperText={formErrors.preparation || ''}
                            variant="outlined"
                            label="Preparation"
                            required
                        />
                    </div>

                    <div className={styles.selectedProducts}>
                        <div className={styles.selectedProductsHeader}>
                            <h3>Selected Products:</h3>
                            <ProductAdd
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
                                <div key={productInfo.uniqueKey}>
                                    <ProductDetail productInfo={productInfo}
                                                   onDeleteProduct={handleDeleteProduct}
                                                   onEditProduct={handleEditProduct}
                                                   units={units}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.submitButtonContainer}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{
                                padding: 1.5,
                                '&:hover': {
                                    backgroundColor: '#45a049',
                                },
                            }}
                            disabled={loadingFormValues}
                        >
                            {loadingFormValues ? <CircularProgress size={24}/> : "Submit Recipe"}
                        </Button>
                    </div>
                </div>
            </Box>
        </>
    );
};

