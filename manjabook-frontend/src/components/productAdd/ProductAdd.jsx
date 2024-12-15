import {useEffect, useState} from "react";
import styles from './ProductAdd.module.css';
import ProductCard from "../productCard/ProductCard.jsx";
import MultiPageModal from "../multiPageModal/MultiPageModal.jsx";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField, Typography,
} from "@mui/material";
import SearchBar from "../../utils/searchBar/SearchBar.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import leftButtonIcon from "../../assets/images/left-button-icon.png";


export default function ProductAdd({units, onSendData, handleModalMode, showProductModal, children}) {
    const {setError} = useError();
    const [activeTab, setActiveTab] = useState(0);
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState({
        product: null,
        unit: null,
        quantity: 0,
        custom_unit: null,
    });
    const [currentProductErrors, setCurrentProductErrors] = useState({product: "", unit: "", quantity: ""});

    const [createProductState, setCreateProductState] = useState(false);
    const [createProductLoading, setCreateProductLoading] = useState(false);
    const [createProductErrors, setCreateProductErrors] = useState({
        name: [],
        brand: [],
        nutrition_per: [],
        calories: [],
        protein: [],
        carbohydrates: [],
        sugars: [],
        fats: [],
        saturated_fats: [],
        salt: [],
        fibre: [],
        shopped_from: []
    });
    const [createProductFormValues, setCreateProductFormValues] = useState({
        name: "",
        brand: "",
        nutrition_per: "",
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        sugars: 0,
        fats: 0,
        saturated_fats: 0,
        salt: 0,
        fibre: 0,
        shopped_from: []
    });

    const [shops, setShops] = useState([]);
    const choices = [{name: "Grams", abbreviation: "g"},
        {name: "Milliliters", abbreviation: "ml"}];

    const [createCustomUnit, setCreateCustomUnit] = useState({unit: null,
        custom_convert_to_base_rate: 0});
    const [createCustomUnitState, setCreateCustomUnitState] = useState(false);
    const [createCustomUnitErrors, setCreateCustomUnitErrors] = useState({unit: "",
        custom_convert_to_base_rate: ""});

    const handleCreateCustomUnitState = () => {
        if (!createCustomUnitState) {
            handleCreateCustomUnitFormValues("unit", currentProduct.unit.id);
        } else {
            handleCreateCustomUnitFormValues("unit", null);
        }

        setCreateCustomUnitState(!createCustomUnitState);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.products, {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (error) {
                setError(error);
            }
        };
        const fetchShops = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.shops);

                if (response.ok) {
                    const data = await response.json();
                    setShops(data);
                }
            } catch (e) {
                setError(e.message);
            }
        };

        fetchShops();
        fetchProducts();
    }, []);

    const handleAddErrors = (field, message) => {
        setCurrentProductErrors(oldValues => ({...oldValues, [field]: message}));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentProduct.quantity <= 0) {
            handleAddErrors("quantity", "Quantity must be a positive integer!");
        }

        if (!currentProduct.product) {
            handleAddErrors("product", "Choose a product before adding!");
        }
        if (!currentProduct.unit) {
            handleAddErrors("unit", "Choose a unit before adding!");
        }

        if (currentProduct.product && currentProduct.unit && currentProduct.quantity > 0) {
            const data = {
                product: currentProduct.product,
                unit: currentProduct.unit,
                quantity: Number(currentProduct.quantity)
            };
            onSendData(data);
            resetModal();
            setCurrentProduct({
                product: null,
                unit: null,
                quantity: 0,
            });
            setCurrentProductErrors({
                product: "",
                unit: "", quantity: "",
            });
        }
    };

    const handleSelectProduct = (targetName, targetValue) => {
        handleAddErrors(targetName, "");
        setCurrentProduct((oldValues) => (
            {
                ...oldValues, [targetName]: targetValue
            }));
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSearch = async (searchTerm) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.products}?search=${searchTerm}`);

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (e) {
            setError(e.message);
        }
    };

    const openCreateProductMode = () => {
        setCreateProductState(true);
    };

    const closeCreateProductMode = () => {
        setCreateProductState(false);
        setCreateProductFormValues({
            name: "",
            brand: "",
            nutrition_per: "",
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            sugars: 0,
            fats: 0,
            saturated_fats: 0,
            salt: 0,
            fibre: 0,
            shopped_from: []
        });
        setCreateProductErrors({
            name: [],
            brand: [],
            nutrition_per: [],
            calories: [],
            protein: [],
            carbohydrates: [],
            sugars: [],
            fats: [],
            saturated_fats: [],
            salt: [],
            fibre: [],
            shopped_from: []
        });
    };

    const resetModal = () => {
        closeCreateProductMode();
        handleTabChange(null, 0);
        handleModalMode();
    };

    const handleCreateProduct = (e) => {
        setCreateProductLoading(true);
        e.preventDefault();
        e.stopPropagation();

        const handleSubmit = async (e) => {
            const shopIDs = createProductFormValues.shopped_from.map((shop) => shop.id);
            const formData = {...createProductFormValues, shopped_from: shopIDs};

            try {
                const response = await fetch(API_ENDPOINTS.products, {
                    method: "POST",
                    body: JSON.stringify(formData),
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const productData = {
                        ...data,
                        shopped_from: createProductFormValues.shopped_from
                    };
                    handleSelectProduct('product', productData);
                    handleTabChange(null, 1);
                    closeCreateProductMode();
                } else {
                    const data = await response.json();
                    setCreateProductErrors(oldValues => ({...oldValues, ...data}));
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setCreateProductLoading(false);
            }
        };

        handleSubmit();
    };

    const shoppedFromChangeHandler = (e) => {
        const targetName = e.target.name;
        const targetValue = e.target.value;

        if (targetName === 'shopped_from' && createProductFormValues.shopped_from.includes(targetValue)) {
            return
        }

        setCreateProductFormValues(oldValues => ({
            ...oldValues,
            [targetName]: name === "shopped_from"
                ? [...oldValues.shopped_from, targetValue]
                : targetValue,
        }))
    };

    const handleCreateCustomUnitFormValues = (targetName, targetValue) => {
        setCreateCustomUnit(oldValues => ({...oldValues, [targetName]: targetValue}));
    };
    const handleCreateCustomUnitSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const handleSubmit = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.customUnits, {
                    method: "POST",
                    body: JSON.stringify(createCustomUnit),
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    handleSelectProduct("custom_unit", createCustomUnit)
                    handleCreateCustomUnitState();
                } else {
                    const data = await response.json();
                    setCreateCustomUnitErrors(data);
                }
            } catch (error) {
                setError(error.message);
            }
        };

        handleSubmit();
    };

    return (
        <div>
            {children}
            <MultiPageModal isOpen={showProductModal} onClose={resetModal}
                            pagesLabels={["Select Product", "Finalize Product"]}
                            activeTab={activeTab} handleTabChange={handleTabChange}>
                {!createProductState ?
                    <div className={styles.productsContainer}>
                        <div className={styles.searchContainer}>
                            <SearchBar onSearch={handleSearch}/>

                            <div className={styles.productCreateContainer}>
                                <span>Product not found?</span>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    onClick={openCreateProductMode}
                                    sx={{padding: 0.75}}
                                    disabled={createCustomUnitState}
                                >
                                    Create it
                                </Button>
                            </div>
                        </div>

                        <div className={styles.allProductsContainer}>
                            {products.map((product) => (
                                <ProductCard product={product} key={`${product.id}-${product.name}`}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            handleSelectProduct("product", null)
                                            handleTabChange(null, 1);
                                        }}
                                        sx={{padding: 0.5}}
                                        disabled={createCustomUnitState}
                                    >
                                        Select
                                    </Button>
                                </ProductCard>
                            ))}
                        </div>
                    </div>
                    : <div className={styles.createProductContainer}>
                        <div className={styles.createProductHeader}>
                            <button onClick={closeCreateProductMode}>
                                <img src={leftButtonIcon} alt="return"/>
                            </button>
                        </div>
                        <Box
                            component="form"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                            onSubmit={handleCreateProduct}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    label="Name"
                                    type="text"
                                    value={createProductFormValues.name}
                                    name="name"
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.name?.length}
                                    helperText={createProductErrors.name}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    label="Brand"
                                    type="text"
                                    value={createProductFormValues.brand}
                                    name="brand"
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.brand?.length}
                                    helperText={createProductErrors.brand}
                                    required
                                    fullWidth
                                />
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                            }}>
                                <FormControl small="true" sx={{flex: 2}} required>
                                    <InputLabel id="shopped-from-label">Shops</InputLabel>
                                    <Select
                                        labelId="shopped-from-label"
                                        value={createProductFormValues.shopped_from || []}
                                        onChange={shoppedFromChangeHandler}
                                        name="shopped_from"
                                        multiple
                                        variant="outlined"
                                        label="Shops"
                                        error={!!createProductErrors.shopped_from?.length}
                                    >
                                        {
                                            shops.map((shop) => (
                                                <MenuItem key={shop.id} value={shop}>
                                                    {shop.name}
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                                <FormControl small="true" required sx={{flex: 2}}>
                                    <InputLabel id="nutrition-per-label">Nutrition per</InputLabel>
                                    <Select
                                        labelId="nutrition-per-label"
                                        value={createProductFormValues.nutrition_per || ""}
                                        onChange={shoppedFromChangeHandler}
                                        name="nutrition_per"
                                        variant="outlined"
                                        label="Nutrition per"
                                        error={!!createProductErrors.nutrition_per?.length}
                                    >
                                        {
                                            choices.map((nutrition_per) => (
                                                <MenuItem key={nutrition_per.name} value={nutrition_per.abbreviation}>
                                                    {nutrition_per.name}
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                            }}>
                                <TextField
                                    name="calories"
                                    type="number"
                                    value={createProductFormValues.calories || ""}
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.calories?.length}
                                    helperText={createProductErrors.calories}
                                    variant="outlined"
                                    label="Calories"
                                    required
                                />
                                <TextField
                                    name="protein"
                                    type="number"
                                    value={createProductFormValues.protein || ""}
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.protein?.length}
                                    helperText={createProductErrors.protein[0]}
                                    variant="outlined"
                                    label="Protein"
                                    required
                                />
                                <TextField
                                    name="carbohydrates"
                                    type="number"
                                    value={createProductFormValues.carbohydrates || ""}
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.carbohydrates?.length}
                                    helperText={createProductErrors.carbohydrates}
                                    variant="outlined"
                                    label="Carbohydrates"
                                    required
                                />
                                <TextField
                                    name="sugars"
                                    type="number"
                                    value={createProductFormValues.sugars || ""}
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.sugars?.length}
                                    helperText={createProductErrors.sugars}
                                    variant="outlined"
                                    label="Sugars"
                                    required
                                />
                                <TextField
                                    name="fats"
                                    type="number"
                                    value={createProductFormValues.fats || ""}
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.fats?.length}
                                    helperText={createProductErrors.fats}
                                    variant="outlined"
                                    label="Fats"
                                    required
                                />
                                <TextField
                                    name="saturated_fats"
                                    type="number"
                                    value={createProductFormValues.saturated_fats || ""}
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.saturated_fats?.length}
                                    helperText={createProductErrors.saturated_fats}
                                    variant="outlined"
                                    label="Saturated Fats"
                                    required
                                />
                                <TextField
                                    name="salt"
                                    type="number"
                                    value={createProductFormValues.salt || ""}
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.salt?.length}
                                    helperText={createProductErrors.salt}
                                    variant="outlined"
                                    label="Salt"
                                    required
                                />
                                <TextField
                                    name="fibre"
                                    type="number"
                                    value={createProductFormValues.fibre || ""}
                                    onChange={shoppedFromChangeHandler}
                                    error={!!createProductErrors.fibre?.length}
                                    helperText={createProductErrors.fibre}
                                    variant="outlined"
                                    label="Fibre"
                                    required
                                />
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{padding: 1.5}}
                                disabled={createProductLoading}
                            >
                                {createProductLoading ? <CircularProgress size={24}/> : "Create"}
                            </Button>

                        </Box>
                    </div>}

                <div className={styles.finalizeProductPageContainer}>
                    <div className={styles.finalizeProductPage}>
                        <div>
                            {currentProduct.product ?
                                <ProductCard product={currentProduct.product}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            handleSelectProduct("product", null)
                                            handleTabChange(null, 0);
                                        }}
                                        sx={{padding: 0.5}}
                                        disabled={createCustomUnitState}
                                    >
                                        Remove
                                    </Button>
                                </ProductCard>
                                : <ProductCard product={{
                                    name: "No product",
                                    calories: 0,
                                    carbohydrates: 0,
                                    protein: 0,
                                    fats: 0,
                                    shopped_from: null,
                                }}/>}
                            {currentProductErrors.product && <Typography variant="caption" color="error">
                                {currentProductErrors.product}
                            </Typography>}
                        </div>
                        <Box
                            component="form"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                            onSubmit={handleAdd}
                        >
                            <TextField
                                label="Quantity"
                                variant="outlined"
                                type="number"
                                onChange={(e) => handleSelectProduct("quantity", e.target.value)}
                                required
                                error={!!currentProductErrors.quantity}
                                name="quantity"
                                helperText={currentProductErrors.quantity}
                                disabled={createCustomUnitState}
                            />
                            <FormControl small="true" required>
                                <InputLabel id="unit-label">Unit</InputLabel>
                                <Select
                                    labelId="unit-label"
                                    value={currentProduct.unit || ""}
                                    onChange={(e) => handleSelectProduct('unit', e.target.value)}
                                    variant="outlined"
                                    required
                                    label="Unit"
                                    error={!!currentProductErrors.unit}
                                    name="unit"
                                    disabled={createCustomUnitState}
                                >
                                    {
                                        units.map((unit) => (
                                            <MenuItem key={unit.id} value={unit}>
                                                {unit.name}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{padding: 0.5}}
                                disabled={createCustomUnitState}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                            }}
                        >
                            {currentProduct.unit && currentProduct.unit.is_customizable &&
                                <>
                                {!createCustomUnitState &&
                                    <Typography variant="body1">
                                        <span style={{fontWeight: 'bold'}}>{currentProduct.unit.name}</span> are
                                        usually{' '}
                                        <span
                                            style={{fontWeight: 'bold'}}>{currentProduct.unit.convert_to_base_rate} {currentProduct.unit.base_unit}</span>.
                                    </Typography>}
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="secondary"
                                        sx={{padding: 1}}
                                        onClick={handleCreateCustomUnitState}
                                    >
                                        {!createCustomUnitState ? "YOU CAN MODIFY IT" : "Close modification"}
                                    </Button>
                                    {createCustomUnitState &&
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1.5,
                                            }}
                                        >
                                            <TextField
                                                label="Custom Unit Rate"
                                                variant="outlined"
                                                type="text"
                                                onChange={(e) => {handleCreateCustomUnitFormValues(e.target.name, e.target.value)}}
                                                required
                                                name="custom_convert_to_base_rate"
                                                error={!!createCustomUnitErrors.custom_convert_to_base_rate || ""}
                                                helperText={createCustomUnitErrors.custom_convert_to_base_rate}
                                            />
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                sx={{padding: 1}}
                                                onClick={handleCreateCustomUnitSubmit}>
                                                Create custom unit
                                            </Button>
                                        </Box>
                                    }
                                </>
                            }
                        </Box>
                    </div>
                </div>
            </MultiPageModal>
        </div>);
};