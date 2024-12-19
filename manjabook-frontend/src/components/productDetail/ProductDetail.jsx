import styles from './ProductDetail.module.css';
import deleteButtonIcon from '../../assets/images/delete-button-icon.png';
import editButtonIcon from '../../assets/images/edit-button-icon.png';
import {useState} from "react";
import {Box, IconButton} from "@mui/material";
import CustomModal from "../../utils/modal/CustomModal.jsx";
import ProductCard from "../productCard/ProductCard.jsx";
import ConfigureProduct from "../configureProduct/ConfigureProduct.jsx";

export default function ProductDetail({productInfo, units, onDeleteProduct, onEditProduct}) {
    const [currentProduct, setCurrentProduct] = useState(productInfo);
    const [showProductEditModal, setShowProductEditModal] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const handleProductEdit = (targetName, targetValue) => {
        setCurrentProduct(oldValues => ({...oldValues, [targetName]: targetValue}));
    };

    const handleModalMode = () => {
        setShowProductEditModal(!showProductEditModal);
    };

    const handleDelete = () => {
        onDeleteProduct(currentProduct);
    };

    const handleEdit = (quantityValue, unitValue, customUnitValue) => {
        if (currentProduct.product && unitValue && quantityValue > 0) {
            onEditProduct(currentProduct, quantityValue, unitValue, customUnitValue);
            handleModalMode();
        }
    };

    return (
        <div className={styles.productDetailCard}>
            <div className={styles.productInfo}>
                <p>{currentProduct.product.name}</p>
                <div className={styles.unitQuantity}>
                    <span className={styles.quantityStyle}>{currentProduct.quantity}</span>
                    <span className={styles.unitStyle}>{currentProduct.unit.abbreviation}</span>
                </div>
            </div>
            <Box
                sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5em',
                '& button': {
                    width: '2em',
                },
            }}>
                <IconButton onClick={handleModalMode}>
                    <img src={editButtonIcon} alt="editButtonIcon"/>
                </IconButton>

                <IconButton onClick={handleDelete}>
                    <img src={deleteButtonIcon} alt="deleteButtonIcon"/>
                </IconButton>

                <CustomModal isOpen={showProductEditModal} onClose={handleModalMode}>
                    <h3>Edit Product</h3>
                    <ConfigureProduct
                        currentProduct={currentProduct}
                        handleCurrentProduct={handleProductEdit}
                        units={units}
                        onSubmitMethod={handleEdit}
                        configureButtonName="Edit"
                        isDisabled={isDisabled}
                        setIsDisabled={setIsDisabled}
                    >
                        <ProductCard product={currentProduct.product}/>
                    </ConfigureProduct>
                </CustomModal>
            </Box>
        </div>
    );
};