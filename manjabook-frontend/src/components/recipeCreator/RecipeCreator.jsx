import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import styles from "./RecipeCreator.module.css";
import ProductAdd from "../productAdd/ProductAdd.jsx";
import ProductDetail from "../productDetail/ProductDetail.jsx";
import addButtonIcon from "../../assets/images/add-button-icon.png";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const apiRecipeCreate = `${backendURL}/recipes/`;
const apiProducts = `${backendURL}/products/`;
const apiUnits = `${backendURL}/units/`;

const recipeTemplate = {
    name: "",
    quick_description: "",
    products: [],
    preparation: "",
    portions: 0,
    time_to_prepare: 0,
    time_to_cook: 0,
    image: null
};


export default function RecipeCreator() {
    const navigate = useNavigate();
    const [showProductModal, setShowProductModal] = useState(false);

    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [fetchErrors, setFetchErrors] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const [formValues, setFormValues] = useState(recipeTemplate);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const validateForms = (values) => {
        const errors = {};
        if (!values.name.trim()) {
            errors.name = "Name is required!";
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForms(formValues);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return null;
        }

        const formData = new FormData();

        for (const key in formValues) {
            formData.append(key, formValues[key]);
        }

        formData.append('products', JSON.stringify(selectedProducts.map((itemInfo) => {
            return {
                product_id: itemInfo.product.id,
                unit_id: itemInfo.unit.id,
                quantity: Number(itemInfo.quantity)
            };
        })));

        try {
            const response = await fetch(apiRecipeCreate, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                navigate("/recipes");
                alert('Recipe created!');
            } else {
                setFetchErrors(response.error.message);
            }
        } catch (error) {
            setFetchErrors(error.message);
        }
    };

    const changeHandler = (e) => {
        const targetType = e.target.type;
        const targetValue = e.target.value;

        setFormValues(oldValues => ({
            ...oldValues,
            [e.target.name]: targetType === 'file' ? e.target.files[0] : targetValue,
        }))
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(apiProducts, {
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

        const fetchUnits = async () => {
            try {
                const response = await fetch(apiUnits, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setUnits(data);
                }
            } catch (error) {
                setFetchErrors(error);
            }
        };

        fetchProducts();
        fetchUnits()
    }, []);

    const handleSelectedProducts = (data) => {
        setSelectedProducts(oldValues => [...oldValues, data]);
    };

    const handleDeleteProduct = (itemID) => {
        setSelectedProducts(oldValues =>
            oldValues.filter((itemInfo) => itemInfo.product.id !== itemID));
    };

    const handleEditProduct = (data) => {
        setSelectedProducts(oldValues =>
            oldValues.map((itemInfo) =>
                itemInfo.product.id !== data.product.id
                    ? itemInfo
                    : data)
        );
    };

    const handleModalMode = () => {
        setShowProductModal(!showProductModal);
    };

    return (<>
            <div>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className={styles.labelField}>Recipe Name:</label>
                        <input
                            className={styles.inputField}
                            name="name"
                            type="text"
                            value={formValues.name}
                            onChange={changeHandler}
                            placeholder="Recipe Name"
                        />
                        {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="quick_description" className={styles.labelField}>Description:</label>
                        <input
                            className={styles.textareaField}
                            name="quick_description"
                            type="textarea"
                            value={formValues.quick_description}
                            onChange={changeHandler}
                            placeholder="Description"
                        />
                        {formErrors.quick_description && <p className={styles.error}>{formErrors.quick_description}</p>}
                    </div>

                    <div>
                        <label htmlFor="preparation" className={styles.labelField}>Preparation:</label>
                        <input
                            className={styles.textareaField}
                            name="preparation"
                            type="textarea"
                            value={formValues.preparation}
                            onChange={changeHandler}
                            placeholder="Preparation"
                        />
                        {formErrors.preparation && <p className={styles.error}>{formErrors.preparation}</p>}
                    </div>

                    <label htmlFor="portions" className={styles.labelField}>Portions:</label>
                    <input
                        className={styles.inputField}
                        name="portions"
                        type="number"
                        value={formValues.portions}
                        onChange={changeHandler}
                        placeholder="0"
                    />

                    <label htmlFor="time_to_prepare" className={styles.labelField}>Time to prepare:</label>
                    <input
                        className={styles.inputField}
                        name="time_to_prepare"
                        type="number"
                        value={formValues.time_to_prepare}
                        onChange={changeHandler}
                        placeholder="0"
                    />

                    <label htmlFor="time_to_cook" className={styles.labelField}>Time to cook:</label>
                    <input
                        className={styles.inputField}
                        name="time_to_cook"
                        type="number"
                        value={formValues.time_to_cook}
                        onChange={changeHandler}
                        placeholder="0"
                    />

                    <label htmlFor="image" className={styles.labelField}>Upload Image:</label>
                    <input
                        className={styles.fileInput}
                        name="image"
                        type="file"
                        onChange={changeHandler}
                    />

                    <div className={styles.selectedProducts}>
                        <div className={styles.selectedProductsHeader}>
                            <h3>Selected Products:</h3>
                            <ProductAdd
                                products={products}
                                units={units}
                                onSendData={handleSelectedProducts}
                                handleModalMode={handleModalMode}
                                showProductModal={showProductModal}
                            >
                                <button className={styles.addButton} type="button" onClick={handleModalMode}>
                                    <img src={addButtonIcon} alt="Add Product"/>
                                </button>
                            </ProductAdd>
                        </div>
                        <div className={styles.selectedProductsBody}>
                            {selectedProducts.map((productInfo) => (
                                <div key={`${productInfo.product.id}-${productInfo.unit.id}-${productInfo.quantity}`}>
                                    <ProductDetail productInfo={productInfo}
                                                   onDeleteProduct={handleDeleteProduct}
                                                   onEditProduct={handleEditProduct}
                                                   units={units}
                                    />
                                </div>

                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`${styles.submitButton} ${styles.submitButtonHover}`}
                    >
                        Submit Recipe
                    </button>

                </form>
            </div>
        </>
    );
};

