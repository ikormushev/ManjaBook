import {useState} from "react";
import {TextField, IconButton, Box, Button} from "@mui/material";
import searchButtonIcon from "../../assets/images/search-button-icon.png";

export default function SearchBar({onSearch, removeSearch}) {
    const [searchError, setSearchError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        if (searchTerm.trim() === "") {
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
    };

    const handleRemoveSearch = () => {
        setSearchTerm("");
        removeSearch();
    };
    return (
        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <TextField
                variant="outlined"
                placeholder="Search..."
                value={searchTerm}
                onChange={changeHandler}
                onKeyDown={handleKeyDown}
                sx={{width: "100%"}}
                error={!!searchError}
                helperText={searchError}
            />
            <IconButton onClick={handleSearch} sx={{
                width: "3em"
            }}>
                <img src={searchButtonIcon} alt="search"/>
            </IconButton>
            {searchTerm &&
                <Button
                    variant="contained"
                    color="info"
                    onClick={handleRemoveSearch}
                    sx={{padding: 0.5}}
                >
                    Remove search
                </Button>}
        </Box>
    );
}