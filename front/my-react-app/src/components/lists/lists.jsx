import {
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  IconButton,
  ListItemText,
} from "@mui/material";

export const GenericList = ({ itemsArray }) => {
  return (
    <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      {itemsArray.map((item) => (
        <ListItem
          key={item.key}
          disableGutters
          secondaryAction={
            <Typography variant="body2"> {item.value.toString()} </Typography>
          }
        >
          <ListItemText
            primary={item.key}
            primaryTypographyProps={{ variant: "body1" }}
          />
        </ListItem>
      ))}
    </List>
  );
};
