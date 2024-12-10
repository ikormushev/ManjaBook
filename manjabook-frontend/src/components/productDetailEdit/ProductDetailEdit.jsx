import CustomModal from "../../utils/modal/CustomModal.jsx";
import {useState} from "react";


export default function ProductDetailEdit({productInfo, units, onEditProduct, modalState, handleModalMode, children}) {
    const [currentProductInfo, setCurrentProductInfo] = useState({
        product: productInfo.product,
        unitID: productInfo.unit.id,
        quantity: productInfo.quantity
    });

    const handleEdit = () => {
        if (currentProductInfo.product.id && currentProductInfo.unitID && currentProductInfo.quantity) {
                const wantedUnit = units.find((unit) => unit.id === Number(currentProductInfo.unitID));
            const data = {product: productInfo.product,
                unit: wantedUnit,
                quantity: Number(currentProductInfo.quantity)};
            onEditProduct(data);
            handleModalMode();
        }
    };

    const handleProductSelect = (e) => {
        setCurrentProductInfo(oldValues => ({...oldValues, [e.target.name]: e.target.value}));
    };


    return (
        <div>
            {children}

            <CustomModal isOpen={modalState} onClose={handleModalMode}>
                <h3>Edit Product</h3>
                <input
                    type="text"
                    value={currentProductInfo.product.name}
                    disabled
                />

                <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={currentProductInfo.quantity}
                    onChange={handleProductSelect}
                />

                <select
                    name="unitID"
                    onChange={handleProductSelect}
                    value={currentProductInfo.unitID}
                >
                    <option value="" disabled>Select a unit</option>
                    {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {unit.name}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={handleEdit}>Edit</button>
            </CustomModal>
        </div>
    );
};