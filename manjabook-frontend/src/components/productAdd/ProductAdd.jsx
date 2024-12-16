import {useEffect, useState} from "react";
import styles from './ProductAdd.module.css';
import ProductCard from "../productCard/ProductCard.jsx";
import MultiPageModal from "../multiPageModal/MultiPageModal.jsx";
import {
    Button,
    Typography,
} from "@mui/material";
import SearchBar from "../../utils/searchBar/SearchBar.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import leftButtonIcon from "../../assets/images/left-button-icon.png";
import CreateCustomProduct from "../createCustomProduct/CreateCustomProduct.jsx";
import ConfigureProduct from "../configureProduct/ConfigureProduct.jsx";


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
    const [isDisabled, setIsDisabled] = useState(false);

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

    const handleAddCurrentProduct = (e) => {
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
                custom_unit: currentProduct.custom_unit,
            };

            onSendData(data);
            resetModal();
        }
    };

    const handleCurrentProductFormValues = (targetName, targetValue) => {
        handleAddErrors(targetName, "");
        setCurrentProduct((oldValues) => (
            {
                ...oldValues,
                [targetName]: targetValue
            }));

        if (targetName === "unit") {
            handleCurrentProductFormValues("custom_unit", null);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSearchSubmit = async (searchTerm) => {
        if (isDisabled) {
            return
        }

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
                                    disabled={isDisabled}
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
                                            handleCurrentProductFormValues("product", product)
                                            handleTabChange(null, 1);
                                        }}
                                        sx={{padding: 0.5}}
                                        disabled={isDisabled}
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
                            handleSelectProduct={handleCurrentProductFormValues}
                            redirectFromCreateProductMode={redirectFromCreateProductMode}
                        />
                    </div>}

                <div className={styles.finalizeProductPageContainer}>
                    <ConfigureProduct
                        currentProduct={currentProduct}
                        handleCurrentProduct={handleCurrentProductFormValues}
                        currentProductErrors={currentProductErrors}
                        units={units}
                        onSubmitMethod={handleAddCurrentProduct}
                        configureButtonName="Add"
                        isDisabled={isDisabled}
                        setIsDisabled={setIsDisabled}
                    >
                        {currentProduct.product ?
                            <ProductCard product={currentProduct.product}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        handleCurrentProductFormValues("product", null);
                                        handleCurrentProductFormValues("unit", null);
                                        handleTabChange(null, 0);
                                    }}
                                    sx={{padding: 0.5}}
                                    disabled={isDisabled}
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
                    </ConfigureProduct>
                </div>
            </MultiPageModal>
        </div>);
};