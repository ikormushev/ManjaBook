import {Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import API_ENDPOINTS from "../../apiConfig.js";
import {useEffect, useState} from "react";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";

export default function CreateCustomProduct({createProductErrors, setCreateProductErrors,
                                                createProductFormValues, setCreateProductFormValues,
                                                handleSelectProduct, redirectFromCreateProductMode}) {
    const {setError} = useError();
    const choices = [{name: "Grams", abbreviation: "g"}, {name: "Milliliters", abbreviation: "ml"}];
    const [createProductLoading, setCreateProductLoading] = useState(false);
    const [shops, setShops] = useState([]);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.shops);

                if (response.ok) {
                    const data = await response.json();
                    setShops(data);
                }
            } catch (e) {
                setError(e.message);
            }
        };

        fetchShops();
    }, []);

    const handleCreateProduct = (e) => {
        setCreateProductLoading(true);
        e.preventDefault();
        e.stopPropagation();

        const handleSubmit = async () => {
            const shopIDs = createProductFormValues.shopped_from.map((shop) => shop.id);
            const formData = {...createProductFormValues, shopped_from: shopIDs};

            try {
                const response = await fetch(API_ENDPOINTS.products, {
                    method: "POST",
                    body: JSON.stringify(formData),
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const productData = {
                        ...data,
                        shopped_from: createProductFormValues.shopped_from
                    };
                    handleSelectProduct('product', productData);
                    redirectFromCreateProductMode();
                } else {
                    const data = await response.json();
                    setCreateProductErrors(oldValues => ({...oldValues, ...data}));
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setCreateProductLoading(false);
            }
        };

        handleSubmit();
    };

    const shoppedFromChangeHandler = (e) => {
        const targetName = e.target.name;
        const targetValue = e.target.value;

        if (targetName === 'shopped_from' && createProductFormValues.shopped_from.includes(targetValue)) {
            return
        }

        setCreateProductFormValues(oldValues => ({
            ...oldValues,
            [targetName]: name === "shopped_from"
                ? [...oldValues.shopped_from, targetValue]
                : targetValue,
        }))
    };
    return (<>
        <Box
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
            onSubmit={handleCreateProduct}
        >
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                }}
            >
                <TextField
                    label="Name"
                    type="text"
                    value={createProductFormValues.name}
                    name="name"
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.name?.length}
                    helperText={createProductErrors.name}
                    required
                    fullWidth
                />
                <TextField
                    label="Brand"
                    type="text"
                    value={createProductFormValues.brand}
                    name="brand"
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.brand?.length}
                    helperText={createProductErrors.brand}
                    required
                    fullWidth
                />
            </Box>
            <Box sx={{
                display: 'flex',
                gap: 2,
            }}>
                <FormControl small="true" sx={{flex: 2}} required>
                    <InputLabel id="shopped-from-label">Shops</InputLabel>
                    <Select
                        labelId="shopped-from-label"
                        value={createProductFormValues.shopped_from || []}
                        onChange={shoppedFromChangeHandler}
                        name="shopped_from"
                        multiple
                        variant="outlined"
                        label="Shops"
                        error={!!createProductErrors.shopped_from?.length}
                    >
                        {
                            shops.map((shop) => (
                                <MenuItem key={shop.id} value={shop}>
                                    {shop.name}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <FormControl small="true" required sx={{flex: 2}}>
                    <InputLabel id="nutrition-per-label">Nutrition per</InputLabel>
                    <Select
                        labelId="nutrition-per-label"
                        value={createProductFormValues.nutrition_per || ""}
                        onChange={shoppedFromChangeHandler}
                        name="nutrition_per"
                        variant="outlined"
                        label="Nutrition per"
                        error={!!createProductErrors.nutrition_per?.length}
                    >
                        {
                            choices.map((nutrition_per) => (
                                <MenuItem key={nutrition_per.name} value={nutrition_per.abbreviation}>
                                    {nutrition_per.name}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
            }}>
                <TextField
                    name="calories"
                    type="number"
                    value={createProductFormValues.calories || ""}
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.calories?.length}
                    helperText={createProductErrors.calories}
                    variant="outlined"
                    label="Calories"
                    required
                />
                <TextField
                    name="protein"
                    type="number"
                    value={createProductFormValues.protein || ""}
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.protein?.length}
                    helperText={createProductErrors.protein[0]}
                    variant="outlined"
                    label="Protein"
                    required
                />
                <TextField
                    name="carbohydrates"
                    type="number"
                    value={createProductFormValues.carbohydrates || ""}
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.carbohydrates?.length}
                    helperText={createProductErrors.carbohydrates}
                    variant="outlined"
                    label="Carbohydrates"
                    required
                />
                <TextField
                    name="sugars"
                    type="number"
                    value={createProductFormValues.sugars || ""}
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.sugars?.length}
                    helperText={createProductErrors.sugars}
                    variant="outlined"
                    label="Sugars"
                    required
                />
                <TextField
                    name="fats"
                    type="number"
                    value={createProductFormValues.fats || ""}
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.fats?.length}
                    helperText={createProductErrors.fats}
                    variant="outlined"
                    label="Fats"
                    required
                />
                <TextField
                    name="saturated_fats"
                    type="number"
                    value={createProductFormValues.saturated_fats || ""}
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.saturated_fats?.length}
                    helperText={createProductErrors.saturated_fats}
                    variant="outlined"
                    label="Saturated Fats"
                    required
                />
                <TextField
                    name="salt"
                    type="number"
                    value={createProductFormValues.salt || ""}
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.salt?.length}
                    helperText={createProductErrors.salt}
                    variant="outlined"
                    label="Salt"
                    required
                />
                <TextField
                    name="fibre"
                    type="number"
                    value={createProductFormValues.fibre || ""}
                    onChange={shoppedFromChangeHandler}
                    error={!!createProductErrors.fibre?.length}
                    helperText={createProductErrors.fibre}
                    variant="outlined"
                    label="Fibre"
                    required
                />
            </Box>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{padding: 1.5}}
                disabled={createProductLoading}
            >
                {createProductLoading ? <CircularProgress size={24}/> : "Create"}
            </Button>

        </Box>
    </>);
}