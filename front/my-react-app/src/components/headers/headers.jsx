import { Typography, Toolbar, AppBar } from "@mui/material";

/*****************************************************************************/

export function PageHeader({ title }) {
  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#1976d2", marginBottom: 2 }}
    >
      <Toolbar sx={{ justifyContent: "center" }}>
        <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

/*****************************************************************************/
