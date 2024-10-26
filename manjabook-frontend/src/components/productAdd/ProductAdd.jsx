import Modal from "../../utils/modal/Modal.jsx";
import {useState} from "react";


const productToAddTemplate = {
    productID: '',
    unitID: '',
    quantity: 0,
};

export default function ProductAdd({products, units, onSendData, handleModalMode, showProductModal, children}) {
    const [currentProduct, setCurrentProduct] = useState(productToAddTemplate);

    const handleAdd = () => {
        if (currentProduct.productID && currentProduct.unitID && currentProduct.quantity) {
            const wantedProduct = products.find((product) => `${product.id}` === currentProduct.productID);
            const wantedUnit = units.find((unit) => `${unit.id}` === currentProduct.unitID);
            const data = {
                product: wantedProduct,
                unit: wantedUnit,
                quantity: Number(currentProduct.quantity)
            };
            onSendData(data);
            setCurrentProduct(productToAddTemplate);
            handleModalMode();
        }
    };

    const handleProductSelect = (e) => {
        setCurrentProduct(oldValues => ({...oldValues, [e.target.name]: e.target.value}));
    };


    return (
        <div>
            {children}
            <Modal isOpen={showProductModal} onClose={handleModalMode}>
                <h3>Select Product</h3>
                <select
                    name="productID"
                    onChange={handleProductSelect}
                    value={currentProduct.productID}
                >
                    <option value="" disabled>Select a product</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={currentProduct.quantity}
                    onChange={handleProductSelect}
                />
                <select
                    name="unitID"
                    onChange={handleProductSelect}
                    value={currentProduct.unitID}
                >
                    <option value="" disabled>Select a unit</option>
                    {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {unit.name}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={handleAdd}>Add</button>
            </Modal>
        </div>
    );
};