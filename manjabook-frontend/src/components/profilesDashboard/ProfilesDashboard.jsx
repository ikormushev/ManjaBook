import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import {useEffect, useState} from "react";
import API_ENDPOINTS from "../../apiConfig.js";
import Loading from "../../utils/loading/Loading.jsx";
import {Box, Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import {useNavigate} from "react-router-dom";
import SearchBar from "../../utils/searchBar/SearchBar.jsx";

export default function ProfilesDashboard() {
    const {authState} = useAuth();
    const navigate = useNavigate();
    const {setError} = useError();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchedProfiles, setSearchedProfiles] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipesResponse = await fetch(API_ENDPOINTS.profiles, {
                    method: "GET",
                    credentials: "include",
                });
                if (recipesResponse.ok) {
                    const data = await recipesResponse.json();
                    setProfiles(data);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loading/>;

    const handleSearch = async (searchTerm) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.profiles}?search=${searchTerm}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setSearchedProfiles(data);
            }
        } catch (e) {
            setError(e.message);
        }
    };

    const showProfile = (profile) => {
        return (<Box
            key={`${profile.id}-${profile.username}`}
            sx={{
                maxWidth: "200px"
            }}
        >
            <Card>
                <CardMedia
                    component="img"
                    image={profile.profile_picture}
                    alt={profile.username}
                />
                <CardContent>
                    <Typography variant="h6">{profile.username}</Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/profiles/${profile.user_id}`)}
                        sx={{marginTop: 1}}
                    >
                        View Profile
                    </Button>
                </CardContent>
            </Card>
        </Box>);
    };

    return (
        <Box
            sx={{
                padding: 3,
                display: "flex",
                flexDirection: "column",
                gap: 4
            }}
        >
            {!authState.isAuthenticated &&
                <Box
                    sx={{
                        backgroundColor: '#e0f7fa',
                        padding: 4,
                        borderRadius: 2,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h5" gutterBottom>
                        Want to be A Part Of This Amazing Community?
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={() => navigate('/register')}
                    >
                        JOIN NOW
                    </Button>
                </Box>
            }

            {loading ? <Loading/> : <Box sx={{display: "flex", gap: 3, flexDirection: "column"}}>
                <Box>
                    <Typography variant="h4" gutterBottom
                                sx={{
                                    color: "#105D5E",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    textTransform: "uppercase",
                                    padding: 1
                                }}>
                        Profiles
                    </Typography>
                    <SearchBar onSearch={handleSearch} removeSearch={() => setSearchedProfiles(null)}/>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: {
                            xs: "center",
                            sm: "flex-start"
                        },
                    }}
                >
                    {searchedProfiles ?
                        searchedProfiles.map((profile) => showProfile(profile)) :
                        profiles.map((profile) => showProfile(profile))}
                </Box>
            </Box>}
        </Box>);
}