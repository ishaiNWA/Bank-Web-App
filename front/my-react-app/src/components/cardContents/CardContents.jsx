import {
  CardContent,
  CardMedia,
  Typography,
  Box,
  List,
  ListItem,
  IconButton,
  ListItemText,
} from "@mui/material";

import { GenericList } from "../lists/lists";

import CommentIcon from "@mui/icons-material/Comment";
import {
  personalDetailsArray,
  creditCardDataArray,
  currentBalanceObj,
  personalIMG,
} from "../../dataPool/DataPool";

const GenericContent = ({ title, children }) => {
  return (
    <CardContent
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        className="title section"
        sx={{
          flex: "1 0 33%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography> {title} </Typography>
      </Box>

      <Box
        className="content section"
        sx={{
          flex: "2 0 66%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
    </CardContent>
  );
};

export const UserDetailsContent = () => {
  return (
    <GenericContent title="personal details">
      <Box
        className=" personal-details-section"
        sx={{
          flex: "50%",
          justifyContent: "left",
          alignItems: "center",
          padding: 2,
        }}
      >
        <GenericList itemsArray={personalDetailsArray} />
      </Box>

      <Box
        className="image-section"
        sx={{
          flex: "50%",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Box sx={{ padding: 2, bgcolor: "background.paper", borderRadius: 2 }}>
          <CardMedia
            component="img"
            image={personalIMG}
            alt={personalIMG.alt || "Profile image "}
            sx={{
              width: "100%",
              maxWidth: 300,
              height: "auto",
              borderRadius: 1,
            }}
          />
        </Box>
      </Box>
    </GenericContent>
  );
};

export const BalanceContent = () => {
  return (
    <GenericContent title=" current balanc">
      <Box
        className="current-balance-section"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <Typography
          variant="h2"
          component="div"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
          }}
        >
          {`$${currentBalanceObj}`}
        </Typography>
      </Box>
    </GenericContent>
  );
};

export const CreditCardContent = () => {
  return (
    <GenericContent title="credit card details">
      <Box
        className="current-balance-section"
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <GenericList itemsArray={creditCardDataArray} />
      </Box>
    </GenericContent>
  );
};

export const LoremIpsumContent = () => {
  return (
    <GenericContent title="LoremIpsum">
      <Box
        className="current-balance-section"
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          height: "100%",
          width: "100%",
          padding: 2,
        }}
      >
        <Typography variant="body1" gutterBottom>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui
          mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor
          neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.
        </Typography>
        <Typography variant="body1">
          Phasellus molestie magna non est bibendum non venenatis nisl tempor.
          Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor
          posuere. Praesent id metus massa, ut blandit odio. Proin quis tortor
          orci.
        </Typography>
      </Box>
    </GenericContent>
  );
};
