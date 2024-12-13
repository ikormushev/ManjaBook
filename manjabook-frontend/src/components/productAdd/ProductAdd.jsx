import {useEffect, useState} from "react";
import styles from './ProductAdd.module.css';
import ProductCard from "../productCard/ProductCard.jsx";
import MultiPageModal from "../multiPageModal/MultiPageModal.jsx";
import {FormControl, MenuItem, Select, TextField} from "@mui/material";
import SearchBar from "../../utils/searchBar/SearchBar.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";

const productToAddTemplate = {
    product: null,
    unit: null,
    quantity: 0,
};

const productTemplate = {
    name: "No product",
    calories: 0,
    carbohydrates: 0,
    protein: 0,
    fats: 0,
    shopped_from: null,
};


export default function ProductAdd({units, onSendData,
                                       handleModalMode, showProductModal,
                                       children
}) {
    const {setError} = useError();
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(productToAddTemplate);
    const [activeTab, setActiveTab] = useState(0);

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
                setFetchErrors(error);
            }
        };
        fetchProducts();
    }, []);

    const handleAdd = () => {
        if (currentProduct.product && currentProduct.unit && currentProduct.quantity) {
            const data = {
                product: currentProduct.product,
                unit: currentProduct.unit,
                quantity: Number(currentProduct.quantity)
            };
            onSendData(data);
            setCurrentProduct(productToAddTemplate);
            handleModalMode();
        }
    };

    const handleSelectProduct = (fieldName, fieldValue) => {
        setCurrentProduct((oldValues) => ({...oldValues, [fieldName]: fieldValue}));
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
            } else {
                console.log(response);
            }
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div>
            {children}
            <MultiPageModal isOpen={showProductModal} onClose={handleModalMode}
                            pagesLabels={["Select Product", "Finalize Product"]}
                            activeTab={activeTab} handleTabChange={handleTabChange}>
                <div className={styles.productsContainer}>
                    <div className={styles.searchContainer}>
                        <SearchBar onSearch={handleSearch} />

                        <div className={styles.productCreateContainer}>
                            <span>Product not found?</span>
                            <button type="button">Create it</button>
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

                <div className={styles.finalizeProductPage}>
                    <div className={styles.selectedProduct}>
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
                            : <ProductCard product={productTemplate}/>}
                    </div>
                    <div className={styles.selectedProductInfo}>
                        <TextField
                            label="Quantity"
                            variant="outlined"
                            type="number"
                            onChange={(e) => handleSelectProduct("quantity", e.target.value)}
                        />
                        <FormControl small="true">
                            <Select
                                value={currentProduct.unit || ""}
                                onChange={(e) => handleSelectProduct('unit', e.target.value)}
                                displayEmpty
                                variant="outlined"
                            >
                                <MenuItem disabled value="">
                                    <em>Unit</em>
                                </MenuItem>
                                {
                                    units.map((unit) => (
                                        <MenuItem key={unit.id} value={unit}>
                                            {unit.name}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        <button type="button" onClick={handleAdd}>Add</button>
                    </div>
                </div>
            </MultiPageModal>
        </div>);
};