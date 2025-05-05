import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Box, TextField, InputLabel, Typography, CircularProgress, Button} from '@mui/material';
import ProductAdd from "../productAdd/ProductAdd.jsx";
import ProductDetail from "../productDetail/ProductDetail.jsx";
import addButtonIcon from "../../assets/images/add-button-icon.png";
import defaultRecipeImage from "../../assets/images/default-recipe-image.png";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useSuccess} from "../../context/successProvider/SuccessProvider.jsx";

export default function RecipeCreator({recipeData = null}) {
    const {setError} = useError();
    const {setSuccess} = useSuccess();
    const navigate = useNavigate();
    const [totalProducts, setTotalProducts] = useState(recipeData ? recipeData.products.length : 0);
    const [imagePreview, setImagePreview] = useState(null);
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

        try {
            let response;
            const isEditMode = Boolean(recipeData);

            const makeRequest = async (url, method, body, headers = {}) => {
                return await fetch(url, {
                    method,
                    body,
                    headers,
                    credentials: "include",
                });
            };

            if (isEditMode) {
                const editData = {
                    'name': formValues.name,
                    'quick_description': formValues.quick_description,
                    'preparation': formValues.preparation,
                    'portions': formValues.portions,
                    'time_to_prepare': formValues.time_to_prepare,
                    'time_to_cook': formValues.time_to_cook,
                    'products': selectedProducts.map((itemInfo) => {
                        return {
                            recipe_id: recipeData.id,
                            product_id: itemInfo.product.id,
                            unit_id: itemInfo.unit.id,
                            quantity: Number(itemInfo.quantity),
                            custom_unit_id: itemInfo.custom_unit?.id || null
                        };
                    })
                }

                response = await makeRequest(
                    `${API_ENDPOINTS.recipes}${recipeData.id}/`,
                    "PUT",
                    JSON.stringify(editData),
                    {'Content-Type': 'application/json',}
                );

                if (formValues.image) {
                    formData.append('image', formValues.image);
                    const fileResponse = await makeRequest(
                        `${API_ENDPOINTS.recipes}${recipeData.id}/image/`,
                        "PATCH",
                        formData
                    );
                }
            } else {
                formData.append('name', formValues.name);
                formData.append('quick_description', formValues.quick_description);
                formData.append('preparation', formValues.preparation);
                formData.append('portions', formValues.portions);
                formData.append('time_to_prepare', formValues.time_to_prepare);
                formData.append('time_to_cook', formValues.time_to_cook);

                formData.append('products', JSON.stringify(selectedProducts.map((itemInfo) => {
                    return {
                        product_id: itemInfo.product.id,
                        unit_id: itemInfo.unit.id,
                        quantity: Number(itemInfo.quantity),
                        custom_unit_id: itemInfo.custom_unit?.id || null
                    };
                })));

                if (formValues.image) {
                    formData.append('image', formValues.image);
                }

                response = await makeRequest(
                    API_ENDPOINTS.recipes,
                    "POST",
                    formData
                );
            }
            if (response.ok) {
                if (isEditMode) {
                    setSuccess("Recipe successfully edited!");
                }
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
        setFormErrors(oldValues => ({
            ...oldValues,
            [e.target.name]: "",
        }));

        const targetType = e.target.type;
        let targetValue = e.target.value;

        if (targetType === 'file') {
            const file = e.target.files?.[0];
            if (file) {
                targetValue = file;
                const imageURL = URL.createObjectURL(file);
                setImagePreview(imageURL);
            } else {
                return;
            }
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
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (recipeData) {
            selectedProducts.forEach((product) => {
                product.uniqueKey = `${totalProducts}-${product.product.id}`;
            });
        }

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

        fetchUnits();
    }, []);

    const handleSelectedProducts = (data) => {
        setSelectedProducts(oldValues => {
            const existingIndex = oldValues.findIndex(
                (itemInfo) =>
                    itemInfo.product.id === data.product.id &&
                    itemInfo.unit.id === data.unit.id
            );

            if (existingIndex === -1) {
                data.uniqueKey = `${totalProducts + 1}-${data.product.id}`;
                setTotalProducts(oldValue => oldValue + 1);
                return [...oldValues, data];
            }

            let canAddTogether = false;
            if (data.custom_unit && oldValues[existingIndex].custom_unit && data.custom_unit.custom_convert_to_base_rate === data.custom_unit.custom_convert_to_base_rate) {
                canAddTogether = true;
            } else if (!data.custom_unit && !oldValues[existingIndex].custom_unit) {
                canAddTogether = true;
            }

            if (!canAddTogether) {
                setError("Cannot set custom unit to a product with an existing custom unit!");
                return oldValues
            }

            const updatedProducts = [...oldValues];
            updatedProducts[existingIndex] = {
                ...updatedProducts[existingIndex],
                quantity: Number(updatedProducts[existingIndex].quantity) + Number(data.quantity),
            };


            return updatedProducts;
        });
    };

    const handleDeleteProduct = (data) => {
        setFormErrors(oldValues => ({
            ...oldValues,
            products: "",
        }));
        setSelectedProducts(oldValues =>
            oldValues.filter((itemInfo) => itemInfo.uniqueKey !== data.uniqueKey));

        setSuccess("Product successfully deleted!");
    };

    const handleEditProduct = (data, quantityValue, unitValue, customUnitValue) => {
        const productExists = selectedProducts.filter((itemInfo) =>
            itemInfo.product.id === data.product.id && itemInfo.unit.id === unitValue.id)[0];

        if (typeof productExists !== 'undefined' && productExists.uniqueKey !== data.uniqueKey) {
            let canAddTogether = false;

            if (customUnitValue && productExists.custom_unit && customUnitValue.id === productExists.custom_unit.id) {
                canAddTogether = true;
            } else if (!customUnitValue && !productExists.custom_unit) {
                canAddTogether = true;
            }

            if (!canAddTogether) {
                setError("Invalid edit!");
                return
            }


            productExists.quantity = Number(productExists.quantity) + Number(quantityValue);
            setSelectedProducts(oldValues => oldValues
                .filter((itemInfo) => itemInfo.uniqueKey !== data.uniqueKey
                ));
            return
        }

        setSelectedProducts(oldValues => oldValues.map((itemInfo) =>
            itemInfo.uniqueKey !== data.uniqueKey ? itemInfo :
                {
                    ...data,
                    quantity: quantityValue,
                    unit: unitValue,
                    custom_unit: customUnitValue
                }
        ));
        setFormErrors(prev => ({...prev, products: ""}));
        setSuccess("Product successfully edited!");
    };

    const handleModalMode = () => {
        setShowProductModal(!showProductModal);
    };

    return (
        <Box
            component="form"
            sx={{
                display: 'flex',
                gap: 2,
                padding: 2,
                flexWrap: 'wrap',
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                    e.preventDefault();
                }
            }}
            onSubmit={handleSubmit}
        >
            <Box
                sx={{
                    minWidth: "10em",
                    maxWidth: "33em",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                }}
            >
                <Box
                    sx={{
                        border: "0.1em #105D5E solid",
                        position: "relative",
                        overflow: "hidden",
                        "& img": {
                            objectFit: "cover",
                            height: "100%",
                        },
                        "&:hover div": {
                            opacity: 1,
                        },
                    }}
                >
                    <img
                        src={
                            imagePreview
                                ? imagePreview
                                : recipeData?.image
                                    ? recipeData.image
                                    : defaultRecipeImage
                        }
                        alt="recipe_image"
                    />

                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",

                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            opacity: 0,
                            transition: "opacity 0.3s ease",
                            gap: "0.5em",
                            "& hover": {
                                opacity: 1
                            }
                        }}
                    >
                        <InputLabel
                            htmlFor="image"
                            sx={{
                                backgroundColor: "#FFFFFF",
                                padding: "0.5em 1em",
                                borderRadius: "0.5em",
                                cursor: "pointer",
                            }}
                        >
                            Upload Image
                        </InputLabel>
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
                    </Box>
                </Box>

                {formValues.image &&
                    <Typography variant="caption" color="success">
                        Image uploaded successfully!
                    </Typography>
                }

                {formErrors.image &&
                    <Typography variant="caption" color="error">
                        {formErrors.image}
                    </Typography>
                }

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
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1em",
                    flex: 2,
                    minWidth: "10em",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1em",
                    }}
                >
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
                        rows={1}
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
                        rows={10}
                        error={!!formErrors.preparation}
                        helperText={formErrors.preparation || ''}
                        variant="outlined"
                        label="Preparation"
                        required
                    />
                </Box>

                <Box
                    sx={{
                        padding: "1em",
                        border: "1px solid #ccc",
                        borderRadius: "0.5em",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "bold"
                            }}
                        >
                            Selected Products:
                        </Typography>
                        <ProductAdd
                            units={units}
                            onSendData={handleSelectedProducts}
                            handleModalMode={handleModalMode}
                            showProductModal={showProductModal}
                        >
                            <Button
                                sx={{
                                    width: "2.5em",
                                    backgroundColor: "transparent",
                                }}
                                type="button"
                                onClick={handleModalMode}
                            >
                                <img src={addButtonIcon} alt="Add Product"/>
                            </Button>
                        </ProductAdd>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: "1em",
                            flexWrap: "wrap",
                        }}
                    >
                        {selectedProducts.map((productInfo) => (
                            <Box
                                key={`product-${productInfo.product.id}-${productInfo.unit.id}-${productInfo.quantity}`}>
                                <ProductDetail productInfo={productInfo}
                                               onDeleteProduct={handleDeleteProduct}
                                               onEditProduct={handleEditProduct}
                                               units={units}
                                />
                            </Box>
                        ))}
                    </Box>

                    {formErrors.products &&
                        <Typography variant="caption" color="error">
                            {formErrors.products}
                        </Typography>
                    }
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
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
                        {loadingFormValues ?
                            <CircularProgress size={24}/> : recipeData ? "Edit Recipe" : "Submit Recipe"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

