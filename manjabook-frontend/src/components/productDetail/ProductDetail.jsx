import deleteButtonIcon from '../../assets/images/delete-button-icon.png';
import editButtonIcon from '../../assets/images/edit-button-icon.png';
import {useState} from "react";
import {Box, IconButton} from "@mui/material";
import CustomModal from "../../utils/customModal/CustomModal.jsx";
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
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: "1em",
                border: "1px solid #e0e0e0",
                borderRadius: "0.5em",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    gap: 3,
                    flexDirection: "column",
                }}
            >
                <span>{currentProduct.product.name}</span>
                <Box
                    sx={{
                        display: "flex",
                        gap: "0.4em",
                        fontWeight: "bold",
                        "& span": {
                            padding: "0.2em",
                            backgroundColor: "#eaf4fc",
                            borderRadius:" 0.25em",
                            color: "#007bff",
                        }
                    }}
                >
                    <span>{currentProduct.quantity}</span>
                    <span>{currentProduct.unit.abbreviation}</span>
                </Box>
            </Box>
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
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
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
                    </Box>
                </CustomModal>
            </Box>
        </Box>
    );
};