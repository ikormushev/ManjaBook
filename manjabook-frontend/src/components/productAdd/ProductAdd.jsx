import CustomModal from "../../utils/modal/CustomModal.jsx";
import {useState} from "react";
import styles from './ProductAdd.module.css';
import ProductCard from "../productCard/ProductCard.jsx";
import MultiPageModal from "../multiPageModal/MultiPageModal.jsx";
import {FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";

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


export default function ProductAdd({products, units, onSendData, handleModalMode, showProductModal, children}) {
    const [currentProduct, setCurrentProduct] = useState(productToAddTemplate);

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

    return (<div>
        {children}
        <MultiPageModal isOpen={showProductModal} onClose={handleModalMode}
                        pagesLabels={["Select Product", "Finalize Product"]}>
            <div className={styles.allProducts}>
                {products.map((product) => (
                    <ProductCard product={product} key={`${product.id}-${product.name}`}>
                        <button type="button" onClick={() => handleSelectProduct("product", product)}>Select</button>
                    </ProductCard>
                ))}
            </div>

            <div className={styles.finalizeProductPage}>
                <div className={styles.selectedProduct}>
                    {currentProduct.product
                        ? <>
                            <ProductCard product={currentProduct.product}>
                                <button type="button" onClick={() => handleSelectProduct("product", null)}>Remove</button>
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
                    <FormControl small>
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