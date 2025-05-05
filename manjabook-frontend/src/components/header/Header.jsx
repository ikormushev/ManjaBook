import {NavLink} from 'react-router-dom';
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import logoIcon from "../../assets/images/manja-logo.avif";
import profilePhoto from "../../assets/images/photo-icon.png";
import hamburgerPhoto from "../../assets/images/hambuger-button-icon.png";
import Logout from "../../utils/logout/Logout.jsx";
import {useState} from "react";
import {Box, Button, IconButton, Menu, MenuItem} from "@mui/material";


export default function Header() {
    const {authState} = useAuth();

    const isAuthenticated = authState.isAuthenticated;
    const userID = authState.userID;

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                padding: {
                    xs: "0.5em",
                    sm: "1em 2.5em"
                },
                backgroundColor: "#002737",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Button sx={{width: 4}}>
                    <NavLink to="/">
                        <img src={logoIcon} alt="manjaLogo"/>
                    </NavLink>
                </Button>

                <Box
                    sx={{
                        display: "flex",
                        fontSize: "1.4em",
                        gap: 2.5,
                        "& a": {
                            color: "white",
                            "&:hover": {
                                color: "#00BFFF",
                            },
                        },
                    }}
                >
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/recipes">Recipes</NavLink>
                    <NavLink to="/profiles">Profiles</NavLink>
                </Box>
            </Box>

            <Box sx={{
                display: "flex",
                gap: 1
            }}>
                <IconButton
                    onClick={handleMenuOpen}
                    color="inherit"
                    sx={{
                        display: {xs: "flex", md: "none"},
                        width: "2.25em"
                    }}
                >
                    <img src={hamburgerPhoto} alt="hamburgerPhoto"/>
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    {isAuthenticated ? (
                        <Box>
                            <NavLink to="/create-recipe">
                                <MenuItem onClick={handleMenuClose}>
                                    Create a Recipe
                                </MenuItem>
                            </NavLink>
                            <NavLink to={`/profiles/${userID}`}>
                                <MenuItem onClick={handleMenuClose}>
                                    Profile
                                </MenuItem>
                            </NavLink>
                            <MenuItem onClick={handleMenuClose}>
                                <Logout/>
                            </MenuItem>
                        </Box>
                    ) : (
                        <MenuItem onClick={handleMenuClose}>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{padding: 0.75}}
                            >
                                <NavLink to='/login'>
                                    Login
                                </NavLink>
                            </Button>
                        </MenuItem>
                    )}
                </Menu>

                <Box
                    sx={{
                        gap: 2,
                        alignItems: "center",
                        display: {xs: "none", md: "flex"}
                    }}
                >
                    {isAuthenticated ?
                        (<>
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{padding: 0.75}}
                            >
                                <NavLink to="/create-recipe">
                                    Create a Recipe
                                </NavLink>
                            </Button>

                            <Button sx={{width: 2.5}}>
                                <NavLink to={`/profiles/${userID}`}>
                                    <img src={profilePhoto} alt="profilePhoto"/>
                                </NavLink>
                            </Button>

                            <Logout/>
                        </>) :
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{padding: 0.75}}
                        >
                            <NavLink to='/login'>
                                Login
                            </NavLink>
                        </Button>
                    }
                </Box>
            </Box>
        </Box>
    );
};