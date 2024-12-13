import styles from './ProductDetail.module.css';
import deleteButtonIcon from '../../assets/images/delete-button-icon.png';
import editButtonIcon from '../../assets/images/edit-button-icon.png';
import ProductDetailEdit from "../productDetailEdit/ProductDetailEdit.jsx";
import {useState} from "react";

export default function ProductDetail({productInfo, units, onDeleteProduct, onEditProduct}) {
    const {product, quantity, unit} = productInfo;
    const [showProductEditModal, setShowProductEditModal] = useState(false);

    const handleModalMode = () => {
        setShowProductEditModal(!showProductEditModal);
    };

    const handleDelete = () => {
        onDeleteProduct(product.id)
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
                <ProductDetailEdit
                    productInfo={productInfo}
                    units={units}
                    onEditProduct={onEditProduct}
                    handleModalMode={handleModalMode}
                    modalState={showProductEditModal}
                >
                    <button type="button" onClick={handleModalMode}>
                        <img src={editButtonIcon} alt="editButtonIcon"/>
                    </button>
                </ProductDetailEdit>

                <button type="button" onClick={handleDelete}>
                    <img src={deleteButtonIcon} alt="deleteButtonIcon"/>
                </button>
            </div>
        </div>
    );
};