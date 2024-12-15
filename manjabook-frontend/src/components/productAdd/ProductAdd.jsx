import {useEffect, useState} from "react";
import styles from './ProductAdd.module.css';
import ProductCard from "../productCard/ProductCard.jsx";
import MultiPageModal from "../multiPageModal/MultiPageModal.jsx";
import {
    Box,
    Button,
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
import CreateCustomProduct from "../createCustomProduct/CreateCustomProduct.jsx";


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
    const [createProductState, setCreateProductState] = useState(false);
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

    const [createCustomUnit, setCreateCustomUnit] = useState({
        unit: null,
        custom_convert_to_base_rate: 0, id: null
    });
    const [createCustomUnitState, setCreateCustomUnitState] = useState(false);
    const [createCustomUnitErrors,
        setCreateCustomUnitErrors] = useState({unit: "", custom_convert_to_base_rate: ""});

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

        fetchProducts();
    }, []);

    const handleAddErrors = (field, message) => {
        setCurrentProductErrors(oldValues => ({...oldValues, [field]: message}));
    };

    const handleAddSelectedProduct = (e) => {
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
                quantity: Number(currentProduct.quantity),
                custom_unit: createCustomUnit,
            };

            onSendData(data);
            resetModal();
        }
    };

    const handleSelectProductFormValues = (targetName, targetValue) => {
        handleAddErrors(targetName, "");
        setCurrentProduct((oldValues) => (
            {
                ...oldValues,
                [targetName]: targetValue
            }));

        if (targetName === "unit") {
            handleSelectProductFormValues("custom_unit", null);
            setCreateCustomUnit({unit: null, custom_convert_to_base_rate: 0, id: null});
        }
    };

    const resetCustomUnit = () => {
        setCreateCustomUnit({unit: null, custom_convert_to_base_rate: 0, id: null});
        handleSelectProductFormValues("custom_unit", null);
    };
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSearchSubmit = async (searchTerm) => {
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
    const redirectFromCreateProductMode = () => {
        handleTabChange(null, 1);
        closeCreateProductMode();
    }

    const resetModal = () => {
        closeCreateProductMode();
        handleTabChange(null, 0);
        setCurrentProduct({
            product: null,
            unit: null,
            quantity: 0,
            custom_unit: null,
        });
        setCurrentProductErrors({
            product: "",
            unit: "",
            quantity: "",
            custom_unit: ""
        });
        setCurrentProductErrors({product: "", unit: "", quantity: ""});
        handleModalMode();
        resetCustomUnit();
        setCreateCustomUnitState(false);
    };

    const handleCreateCustomUnitState = () => {
        setCreateCustomUnitState((prevState) => {
            const newState = !prevState;
            if (newState) {
                handleCreateCustomUnitFormValues("unit", currentProduct.unit.id);
            }
            return newState;
        });
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
                    const data = await response.json();

                    handleCreateCustomUnitFormValues("id", data.id);
                    handleSelectProductFormValues("custom_unit", createCustomUnit)
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
                            <SearchBar onSearch={handleSearchSubmit}/>

                            <div className={styles.productCreateContainer}>
                                <span>Product not found?</span>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    onClick={(e) => {
                                        setCreateProductState(true)
                                    }}
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
                                            handleSelectProductFormValues("product", product)
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
                        <CreateCustomProduct
                            createProductFormValues={createProductFormValues}
                            setCreateProductFormValues={setCreateProductFormValues}
                            createProductErrors={createProductErrors}
                            setCreateProductErrors={setCreateProductErrors}
                            handleSelectProduct={handleSelectProductFormValues}
                            redirectFromCreateProductMode={redirectFromCreateProductMode}
                        />
                    </div>}

                <div className={styles.finalizeProductPageContainer}>
                    <div className={styles.finalizeProductPage}>
                        <div className={styles.selectedProductContainer}>
                            {currentProduct.product ?
                                <ProductCard product={currentProduct.product}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            handleSelectProductFormValues("product", null)
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
                            onSubmit={handleAddSelectedProduct}
                        >
                            <TextField
                                label="Quantity"
                                variant="outlined"
                                type="number"
                                onChange={(e) => handleSelectProductFormValues("quantity", e.target.value)}
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
                                    onChange={(e) => handleSelectProductFormValues('unit', e.target.value)}
                                    variant="outlined"
                                    required
                                    label="Unit"
                                    error={!!currentProductErrors.unit}
                                    name="unit"
                                    disabled={createCustomUnitState || !currentProduct.product}
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
                                    {currentProduct.custom_unit ? <>
                                        <Typography variant="body1">
                                            <span style={{fontWeight: 'bold'}}>{currentProduct.unit.name}</span> are
                                            now {' '}
                                            <span
                                                style={{fontWeight: 'bold'}}>{createCustomUnit.custom_convert_to_base_rate} {currentProduct.unit.base_unit}</span>.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            sx={{padding: 1}}
                                            onClick={resetCustomUnit}
                                        >
                                            Remove custom unit
                                        </Button>
                                    </> : <>
                                        {!createCustomUnitState &&
                                            <Typography variant="body1">
                                                <span style={{fontWeight: 'bold'}}>{currentProduct.unit.name}</span> are
                                                usually {' '}
                                                <span
                                                    style={{fontWeight: 'bold'}}>{currentProduct.unit.convert_to_base_rate} {currentProduct.unit.base_unit}</span>.
                                            </Typography>}
                                        <Button
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
                                                    onChange={(e) => {
                                                        handleCreateCustomUnitFormValues(e.target.name, e.target.value)
                                                    }}
                                                    required
                                                    name="custom_convert_to_base_rate"
                                                    error={!!createCustomUnitErrors.custom_convert_to_base_rate}
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
                                    </>}
                                </>
                            }
                        </Box>
                    </div>
                </div>
            </MultiPageModal>
        </div>);
};