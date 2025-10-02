import React from "react";
import { Box, Typography, Button, Card, CardMedia, CardContent, Link } from "@mui/material";

export default function RenderComponent({ item }) {
  const { type, props } = item;

  switch (type) {
    case "Typography":
      return <Typography {...props}>{props.children}</Typography>;

    case "Box":
      return (
        <Box {...props}>
          {props.children?.map((child, idx) => (
            <RenderComponent key={idx} item={child} />
          ))}
        </Box>
      );

    case "Image":
      return <Box component="img" {...props} />;

    case "CardArticle":
      return (
        <Card sx={props.sx}>
          <CardMedia
            component="img"
            height={props.height}
            image={props.image}
            alt={props.title}
            sx={props.imageSx}
          />
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {props.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {props.desc.length > 100 ? props.desc.slice(0, 100) + "..." : props.desc}
            </Typography>
          </CardContent>
          <Box textAlign="center" pb={2}>
            <Button
              component={Link}
              href={props.link}
              target="_blank"
              variant="outlined"
              size="small"
            >
              อ่านเพิ่มเติม
            </Button>
          </Box>
        </Card>
      );

    default:
      return null;
  }
}
