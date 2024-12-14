import { useState } from "react";
import {TextField, IconButton, Box} from "@mui/material";
import searchButtonIcon from "../../assets/images/search-button-icon.png";
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch }) {
    const [searchError, setSearchError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        if (searchTerm === "") {
            setSearchError("Search name cannot be blank!");
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
        setSearchError("");
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
                error={!!searchError}
                helperText={searchError}
            />

            <div className={styles.buttonIconContainer}>
                <IconButton onClick={handleSearch}>
                    <img src={searchButtonIcon} alt="search" />
                </IconButton>
            </div>
        </Box>
    );
}