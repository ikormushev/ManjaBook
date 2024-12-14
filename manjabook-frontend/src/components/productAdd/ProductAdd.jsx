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
    TextField,
} from "@mui/material";
import SearchBar from "../../utils/searchBar/SearchBar.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import leftButtonIcon from "../../assets/images/left-button-icon.png";

const productToAddTemplate = {
    product: null,
    unit: null,
    quantity: 0,
};


export default function ProductAdd({ units, onSendData, handleModalMode, showProductModal, children}) {
    const {setError} = useError();
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(productToAddTemplate);
    const [activeTab, setActiveTab] = useState(0);
    const [currentProductErrors, setCurrentProductErrors] = useState({
        product: "",
        unit: "", quantity: "",
    });

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

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (currentProduct.product && currentProduct.unit && currentProduct.quantity) {
            const data = {
                product: currentProduct.product,
                unit: currentProduct.unit,
                quantity: Number(currentProduct.quantity)
            };
            onSendData(data);
            setCurrentProduct(productToAddTemplate);
            resetModal();
        }
    };

    const handleSelectProduct = (targetName, targetValue) => {
        setCurrentProduct((oldValues) => (
            {...oldValues,
                [targetName]: targetValue}));
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
                    const productData = {...data,
                        shopped_from: createProductFormValues.shopped_from};
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

    const changeHandler = (e) => {
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
    }

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
                                <button type="button" onClick={openCreateProductMode}>Create it</button>
                            </div>
                        </div>

                        <div className={styles.allProductsContainer}>
                            {products.map((product) => (
                                <ProductCard product={product} key={`${product.id}-${product.name}`}>
                                    <button type="button" onClick={() => {
                                        handleSelectProduct("product", product)
                                        handleTabChange(null, 1);
                                    }}>
                                        Select
                                    </button>
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
                                    onChange={changeHandler}
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
                                    onChange={changeHandler}
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
                                        onChange={changeHandler}
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
                                        onChange={changeHandler}
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
                                    onChange={changeHandler}
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
                                    onChange={changeHandler}
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
                                    onChange={changeHandler}
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
                                    onChange={changeHandler}
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
                                    onChange={changeHandler}
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
                                    onChange={changeHandler}
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
                                    onChange={changeHandler}
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
                                    onChange={changeHandler}
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

                <div className={styles.finalizeProductPage}>
                    <div>
                        {currentProduct.product
                            ? <>
                                <ProductCard product={currentProduct.product}>
                                    <button type="button" onClick={() => {
                                        handleSelectProduct("product", null)
                                        handleTabChange(null, 0);
                                    }}>
                                        Remove
                                    </button>
                                </ProductCard>
                            </>
                            : <ProductCard product={{
                                name: "No product",
                                calories: 0,
                                carbohydrates: 0,
                                protein: 0,
                                fats: 0,
                                shopped_from: null,
                            }}/>}
                    </div>
                    <Box
                        component="form"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
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
                        >
                            Add
                        </Button>
                    </Box>
                </div>

            </MultiPageModal>
        </div>);
};