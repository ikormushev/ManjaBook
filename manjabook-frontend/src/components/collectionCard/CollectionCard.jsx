import {Card, CardContent, CardMedia, Typography} from "@mui/material";

export default function CollectionCard({collection}) {
    return (
        <Card
            sx={{
                borderRadius: "1.5em",
                boxShadow: "0 0 0.5em rgba(0,0,0,0.5)",
            }}
        >
            <CardMedia
                component="img"
                image={collection.image}
                alt={collection.name}
                sx={{
                    maxHeight: 350,
                    borderRadius: "1.5em 1.5em 0 0",
                }}
            />

            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5em",
                }}
            >
                <Typography variant="h6" textAlign="center">
                    {collection.name}
                </Typography>
            </CardContent>
        </Card>
    );
}