import {useEffect, useState} from "react";
import ProductCard from "../productCard/ProductCard.jsx";
import MultiPageModal from "../multiPageModal/MultiPageModal.jsx";
import {Box, Button} from "@mui/material";
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
    const [searchedProducts, setSearchedProducts] = useState(null);
    const [currentProduct, setCurrentProduct] = useState({
        product: null,
        unit: null,
        quantity: "",
        custom_unit: null,
    });

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

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddCurrentProduct = (quantity, unitValue, customUnitValue) => {
        if (currentProduct.product && unitValue && quantity > 0) {
            const data = {
                product: currentProduct.product,
                unit: unitValue,
                quantity: quantity,
                custom_unit: customUnitValue,
            };

            onSendData(data);
            resetModal();
        }
    };

    const handleCurrentProductFormValues = (targetName, targetValue) => {
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
        setIsDisabled(false);
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
                setSearchedProducts(data);
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
        fetchProducts();
        handleTabChange(null, 1);
        closeCreateProductMode();
    }

    const resetModal = () => {
        closeCreateProductMode();
        handleTabChange(null, 0);
        setCurrentProduct({
            product: null,
            unit: null,
            quantity: "",
            custom_unit: null,
        });
        setSearchedProducts(null);
        handleModalMode();
    };

    const showProduct = (product) => {
        return (
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
        );
    };

    return (
        <Box>
            {children}
            <MultiPageModal isOpen={showProductModal} onClose={resetModal}
                            pagesLabels={["Select Product", "Finalize Product"]}
                            activeTab={activeTab} handleTabChange={handleTabChange}>
                {!createProductState ?
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 3
                            }}
                        >
                            <SearchBar onSearch={handleSearchSubmit} removeSearch={() => setSearchedProducts(null)}/>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    border: "1px solid #DDDD",
                                    backgroundColor: "white",
                                    boxShadow: "0 0.5em 1em rgba(0, 0, 0, 0.1)",
                                    padding: "0.75em",
                                    "& span": {
                                        fontWeight: "bold",
                                    }
                                }}
                            >
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
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 3,
                            }}
                        >
                            {searchedProducts ?
                                searchedProducts.map((product) => showProduct(product)) :
                                products.map((product) => showProduct(product))}
                        </Box>
                    </Box>
                    : <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            flexDirection: "column",
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                "& button": {
                                    backgroundColor: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    width: "3em",
                                    borderRadius: "0.5em"
                                }
                            }}
                        >
                            <button onClick={closeCreateProductMode}>
                                <img src={leftButtonIcon} alt="return"/>
                            </button>
                        </Box>
                        <CreateCustomProduct
                            createProductFormValues={createProductFormValues}
                            setCreateProductFormValues={setCreateProductFormValues}
                            createProductErrors={createProductErrors}
                            setCreateProductErrors={setCreateProductErrors}
                            handleSelectProduct={handleCurrentProductFormValues}
                            redirectFromCreateProductMode={redirectFromCreateProductMode}
                        />
                    </Box>}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ConfigureProduct
                        currentProduct={currentProduct}
                        handleCurrentProduct={handleCurrentProductFormValues}
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
                    </ConfigureProduct>
                </Box>
            </MultiPageModal>
        </Box>);
};