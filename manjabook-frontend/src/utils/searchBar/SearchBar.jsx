import { useState } from "react";
import {TextField, IconButton, Box} from "@mui/material";
import defaultRecipeImage from "../../assets/images/search-button-icon.png";
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch }) {
    const [errors, setErrors] = useState({general: ""});
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        if (searchTerm === "") {
            setErrors({general: "Search name cannot be blank!"});
            return
        }

        onSearch(searchTerm);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const changeHandler = (e) => {
        setErrors({general: ""});
        setSearchTerm(e.target.value);
    }
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
                variant="outlined"
                placeholder="Search..."
                value={searchTerm}
                onChange={changeHandler}
                onKeyDown={handleKeyDown}
                sx={{ width: "100%" }}
                error={!!errors.general}
                helperText={errors.general}
            />

            <div className={styles.buttonIconContainer}>
                <IconButton onClick={handleSearch}>
                    <img src={defaultRecipeImage} alt="search" />
                </IconButton>
            </div>
        </Box>
    );
}