import {Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography} from "@mui/material";
import API_ENDPOINTS from "../../apiConfig.js";
import {useState} from "react";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";

export default function ConfigureProduct({
                                             currentProduct, handleCurrentProduct,
                                             currentProductErrors,
                                             units, onSubmitMethod,
                                             configureButtonName,
                                             isDisabled, setIsDisabled,
                                             children
                                         }) {
    const {setError} = useError();
    const [createCustomUnit, setCreateCustomUnit] = useState(() => {
        return currentProduct?.custom_unit || {
            unit: null,
            custom_convert_to_base_rate: 0,
            id: null,
        };
    });
    const [createCustomUnitErrors,
        setCreateCustomUnitErrors] = useState({unit: "", custom_convert_to_base_rate: ""});
    const [createCustomUnitState, setCreateCustomUnitState] = useState(false);

    const handleCreateCustomUnitFormValues = (targetName, targetValue) => {
        setCreateCustomUnit(oldValues => ({...oldValues, [targetName]: targetValue}));
    };
    const handleCreateCustomUnitState = () => {
        setCreateCustomUnitState((prevState) => {
            const newState = !prevState;
            if (newState) {
                setIsDisabled(true);
                handleCreateCustomUnitFormValues("unit", currentProduct.unit.id);
            } else {
                setIsDisabled(false);
            }
            return newState;
        });
    };
    const handleCreateCustomUnitSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const handleSubmit = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.customUnits, {
                    method: "POST",
                    body: JSON.stringify(createCustomUnit),
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    handleCreateCustomUnitFormValues("id", data.id);
                    setIsDisabled(false);
                    setCreateCustomUnitState(false);

                    // Could be improved, the best choice for now
                    const updatedCustomUnit = { ...createCustomUnit, id: data.id };
                    handleCurrentProduct("custom_unit", updatedCustomUnit);
                } else {
                    const data = await response.json();
                    setCreateCustomUnitErrors(data);
                }
            } catch (error) {
                setError(error.message);
            }
        };

        handleSubmit();
    };

    const resetCustomUnit = () => {
        setCreateCustomUnit({unit: null, custom_convert_to_base_rate: 0, id: null});
        handleCurrentProduct("custom_unit", null);
    };


    return (<Box
        sx={{
            display: "flex",
            gap: "1em",
            alignItems: "flex-start",
        }}
    >
        <Box
            sx={{
                display: "flex",
                gap: "0.5em",
                flexDirection: "column",
            }}
        >
            {children}
        </Box>
        <Box
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
            onSubmit={onSubmitMethod}
        >
            <TextField
                label="Quantity"
                variant="outlined"
                type="number"
                onChange={(e) => handleCurrentProduct("quantity", e.target.value)}
                required
                error={!!currentProductErrors.quantity}
                name="quantity"
                helperText={currentProductErrors.quantity}
                value={currentProduct.quantity !== 0 ? currentProduct.quantity : ""}
                disabled={isDisabled || !currentProduct.product}
            />
            <FormControl small="true" required>
                <InputLabel id="unit-label">Unit</InputLabel>
                <Select
                    labelId="unit-label"
                    value={currentProduct.unit || ""}
                    onChange={(e) => handleCurrentProduct('unit', e.target.value)}
                    variant="outlined"
                    required
                    label="Unit"
                    error={!!currentProductErrors.unit}
                    name="unit"
                    disabled={isDisabled || !currentProduct.product}
                >
                    {
                        units.map((unit) => (
                            <MenuItem key={unit.id} value={unit}>
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
            {currentProduct.unit && currentProduct.unit.is_customizable &&
                <>
                    {currentProduct.custom_unit ? <>
                        <Typography variant="body1">
                            <span style={{fontWeight: 'bold'}}>{currentProduct.unit.name}</span> are {' '}
                            <span
                                style={{fontWeight: 'bold'}}>{createCustomUnit.custom_convert_to_base_rate} {currentProduct.unit.base_unit}</span>.
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
                                <span style={{fontWeight: 'bold'}}>{currentProduct.unit.name}</span> are
                                usually {' '}
                                <span
                                    style={{fontWeight: 'bold'}}>{currentProduct.unit.convert_to_base_rate} {currentProduct.unit.base_unit}</span>.
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
                                        handleCreateCustomUnitFormValues(e.target.name, e.target.value)
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
                                    onClick={handleCreateCustomUnitSubmit}>
                                    Create custom unit
                                </Button>
                            </Box>
                        }
                    </>}
                </>
            }
        </Box>
    </Box>);
}