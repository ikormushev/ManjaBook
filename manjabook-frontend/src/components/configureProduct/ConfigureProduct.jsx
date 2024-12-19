import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import API_ENDPOINTS from "../../apiConfig.js";
import {useEffect, useState} from "react";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";

export default function ConfigureProduct({
                                             currentProduct, handleCurrentProduct,
                                             units, onSubmitMethod,
                                             configureButtonName,
                                             isDisabled, setIsDisabled,
                                             children
                                         }) {
    const {setError} = useError();
    const [quantityValue, setQuantityValue] = useState(currentProduct ? currentProduct.quantity : "");
    const [unitValue, setUnitValue] = useState(currentProduct ? currentProduct.unit : "");
    const [currentProductErrors, setCurrentProductErrors] = useState({product: "", unit: "", quantity: ""});
    const [createCustomUnit, setCreateCustomUnit] = useState(() => {
        return currentProduct.custom_unit || null;
    });

    const [createCustomUnitLoading, setCreateCustomUnitLoading] = useState(false);
    const [createCustomUnitBaseRate, setCreateCustomUnitRate] = useState("");
    const [createCustomUnitErrors,
        setCreateCustomUnitErrors] = useState({unit: "", custom_convert_to_base_rate: ""});
    const [createCustomUnitState, setCreateCustomUnitState] = useState(false);


    const handleCreateCustomUnitState = () => {
        setCreateCustomUnitState((prevState) => {
            const newState = !prevState;
            setIsDisabled(newState)
            return newState;
        });
    };

    const handleCreateCustomUnitSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setCreateCustomUnitLoading(true);
        const customUnitBody = {
            unit: unitValue.id,
            custom_convert_to_base_rate: createCustomUnitBaseRate,
        };

        const handleSubmit = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.customUnits, {
                    method: "POST",
                    body: JSON.stringify(customUnitBody),
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsDisabled(false);
                    setCreateCustomUnitState(false);

                    const updatedCustomUnit = { ...customUnitBody, id: data.id };
                    setCreateCustomUnit(updatedCustomUnit);
                } else {
                    const data = await response.json();
                    setCreateCustomUnitErrors(data);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setCreateCustomUnitLoading(false);
            }
        };

        handleSubmit();
    };

    useEffect(() => {
        if (currentProduct.unit) {
            const matchedUnit = units.find((unit) => unit.id === currentProduct.unit.id);
            if (matchedUnit) {
                setUnitValue(matchedUnit);
            }
        }
    }, []);

    const resetCustomUnit = () => {
        setCreateCustomUnit(null);
        handleCurrentProduct("custom_unit", null);
    };

    const handleCurrentProductErrors = (field, message) => {
        setCurrentProductErrors(oldValues => ({...oldValues, [field]: message}));
    };

    const handleButtonSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        let isInvalid = false;
        if (quantityValue <= 0) {
            handleCurrentProductErrors("quantity", "Quantity must be a positive integer!");
            isInvalid = true;
        }

        if (!currentProduct.product) {
            handleCurrentProductErrors("product", "Choose a product before adding!");
            isInvalid = true;
        }
        if (!unitValue) {
            handleCurrentProductErrors("unit", "Choose a unit before adding!");
            isInvalid = true;
        }

        if (isInvalid) return

        onSubmitMethod(quantityValue, unitValue, createCustomUnit);
    };

    const handleQuantityValue = (e) => {
        handleCurrentProductErrors(e.target.name, "");
        setQuantityValue(e.target.value);
    };

    const handleUnitValue = (e) => {
        handleCurrentProductErrors(e.target.name, "");
        setUnitValue(e.target.value);
        setCreateCustomUnit(null);
    };

    return (<Box
        sx={{
            display: "flex",
            gap: "1em",
            alignItems: "flex-start",
            flexWrap: "wrap",
        }}
    >
        <Box
            sx={{
                display: "flex",
                gap: "0.5em",
                flexDirection: "column",
                flexWrap: "wrap",
            }}
        >
            {children}
            {currentProductErrors.product && <Typography variant="caption" color="error">
                {currentProductErrors.product}
            </Typography>}
        </Box>
        <Box
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
            onSubmit={handleButtonSubmit}
        >
            <TextField
                label="Quantity"
                variant="outlined"
                type="number"
                onChange={handleQuantityValue}
                required
                error={!!currentProductErrors.quantity}
                name="quantity"
                helperText={currentProductErrors.quantity}
                value={quantityValue}
                disabled={isDisabled || !currentProduct.product}
            />
            <FormControl small="true" required>
                <InputLabel id="unit-label">Unit</InputLabel>
                <Select
                    labelId="unit-label"
                    value={unitValue || ""}
                    onChange={handleUnitValue}
                    variant="outlined"
                    required
                    label="Unit"
                    error={!!currentProductErrors.unit}
                    name="unit"
                    disabled={isDisabled || !currentProduct.product}
                >
                    {
                        units.map((unit) => (
                            <MenuItem key={`unit-${unit.id}`} value={unit}>
                                {unit.name}
                            </MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{padding: 0.5}}
                disabled={isDisabled || !currentProduct.product}
            >
                {configureButtonName}
            </Button>
        </Box>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
            }}
        >
            {unitValue && unitValue.is_customizable &&
                <>
                    {createCustomUnit ? <>
                        <Typography variant="body1">
                            <span style={{fontWeight: 'bold'}}>{unitValue.name}</span> are {' '}
                            <span
                                style={{fontWeight: 'bold'}}>{createCustomUnit.custom_convert_to_base_rate} {unitValue.base_unit}</span>.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{padding: 1}}
                            onClick={resetCustomUnit}
                        >
                            Remove custom unit
                        </Button>
                    </> : <>
                        {!createCustomUnitState &&
                            <Typography variant="body1">
                                <span style={{fontWeight: 'bold'}}>{unitValue.name}</span> are
                                usually {' '}
                                <span
                                    style={{fontWeight: 'bold'}}>{unitValue.convert_to_base_rate} {unitValue.base_unit}</span>.
                            </Typography>}
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{padding: 1}}
                            onClick={handleCreateCustomUnitState}
                        >
                            {!createCustomUnitState ? "YOU CAN MODIFY IT" : "Close modification"}
                        </Button>
                        {createCustomUnitState &&
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                }}
                            >
                                <TextField
                                    label="Custom Unit Rate"
                                    variant="outlined"
                                    type="text"
                                    onChange={(e) => {
                                        setCreateCustomUnitRate(e.target.value)
                                    }}
                                    required
                                    name="custom_convert_to_base_rate"
                                    error={!!createCustomUnitErrors.custom_convert_to_base_rate}
                                    helperText={createCustomUnitErrors.custom_convert_to_base_rate}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{padding: 1}}
                                    onClick={handleCreateCustomUnitSubmit}
                                >
                                    {createCustomUnitLoading ? <CircularProgress size={24} /> : "Create custom unit"}
                                </Button>
                            </Box>
                        }
                    </>}
                </>
            }
        </Box>
    </Box>);
}