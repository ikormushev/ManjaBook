import styles from './ProductDetail.module.css';
import deleteButtonIcon from '../../assets/images/delete-button-icon.png';
import editButtonIcon from '../../assets/images/edit-button-icon.png';
import {useState} from "react";
import {Box, IconButton, TextField} from "@mui/material";
import CustomModal from "../../utils/modal/CustomModal.jsx";
import ProductCard from "../productCard/ProductCard.jsx";

export default function ProductDetail({productInfo, units, onDeleteProduct, onEditProduct}) {
    const {product, quantity, unit} = productInfo;
    const [showProductEditModal, setShowProductEditModal] = useState(false);

    const handleModalMode = () => {
        setShowProductEditModal(!showProductEditModal);
    };

    const handleDelete = () => {
        onDeleteProduct(product.id, unit.id)
    };

    const [currentProductInfo, setCurrentProductInfo] = useState({
        product: productInfo.product,
        unitID: productInfo.unit.id,
        quantity: productInfo.quantity
    });

    const handleEdit = () => {
        if (currentProductInfo.product.id && currentProductInfo.unitID && currentProductInfo.quantity) {
            const wantedUnit = units.find((unit) => unit.id === Number(currentProductInfo.unitID));
            const data = {
                product: productInfo.product,
                unit: wantedUnit,
                quantity: Number(currentProductInfo.quantity)
            };
            onEditProduct(data);
            handleModalMode();
        }
    };

    const handleProductSelect = (e) => {
        setCurrentProductInfo(oldValues => ({...oldValues, [e.target.name]: e.target.value}));
    };

    return (
        <div className={styles.productDetailCard}>
            <div className={styles.productInfo}>
                <p>{product.name}</p>
                <div className={styles.unitQuantity}>
                    <span className={styles.quantityStyle}>{quantity}</span>
                    <span className={styles.unitStyle}>{unit.abbreviation}</span>
                </div>
            </div>
            <div className={styles.productButtons}>
                <IconButton onClick={handleModalMode}>
                    <img src={editButtonIcon} alt="editButtonIcon"/>
                </IconButton>

                <button type="button" onClick={handleDelete}>
                    <img src={deleteButtonIcon} alt="deleteButtonIcon"/>
                </button>

                <CustomModal isOpen={showProductEditModal} onClose={handleModalMode}>
                    <h3>Edit Product</h3>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <ProductCard product={productInfo.product}/>
                        <TextField
                            label="Quantity"
                            variant="outlined"
                            name="quantity"
                            type="number"
                            onChange={handleProductSelect}
                            required
                            value={currentProductInfo.quantity}
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
                    </Box>
                </CustomModal>
            </div>
        </div>
    );
};