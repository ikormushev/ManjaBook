import defaultRecipeImage from "../../assets/images/default-recipe-image.png";
import defaultUserPicture from "../../assets/images/default-user-picture.png";
import {Avatar, Box, Card, CardContent, CardMedia, Typography} from "@mui/material";

const anonymousUser = {
    profile_picture: defaultUserPicture,
    username: "AnonymousUser",
};

export default function RecipeCard({recipe, withCreator = true}) {
    const totalTime = recipe.time_to_prepare + recipe.time_to_cook;
    const totalCalories = recipe.total_nutrients.calories;
    const creatorInfo = recipe.created_by;

    return (
        <Card
            sx={{
                borderRadius: "1.5em",
                boxShadow: "0 0 0.5em rgba(0,0,0,0.5)",
                position: "relative",
                overflow: "visible",
            }}
        >
            <CardMedia
                component="img"
                image={recipe.image ? recipe.image : defaultRecipeImage}
                alt={recipe.name}
                sx={{
                    maxHeight: 350,
                    borderRadius: "1.5em 1.5em 0 0",
                }}
            />

            {withCreator && <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    display: "flex",
                    alignItems: "center",
                    background: "white",
                    borderRadius: "10em",
                    padding: "0.5em 1em",
                    gap: 1,
                    boxShadow: 1,
                    opacity: 0.9
                }}
            >
                <Avatar
                    src={
                        creatorInfo?.is_active
                            ? creatorInfo.profile_picture
                            : anonymousUser.profile_picture
                    }
                    alt={creatorInfo?.username}
                    sx={{width: 40, height: 40}}
                />
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: "bold",
                        maxWidth: "15em",
                    }}
                    noWrap
                >
                    {creatorInfo?.is_active
                        ? creatorInfo.username
                        : anonymousUser.username}
                </Typography>
            </Box>}

            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5em",
                }}
            >
                <Typography variant="h6" textAlign="center">
                    {recipe.name}
                </Typography>

                <Box sx={{display: "flex", justifyContent: "space-around"}}>
                    <Typography variant="body1">🕒 {totalTime} minutes</Typography>
                    <Typography variant="body1">🔥 {totalCalories} calories</Typography>
                </Box>
            </CardContent>
        </Card>
    );
};