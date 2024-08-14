import React from "react";
import { Toolbar, TextField, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export function TestPage() {
  return (
    <Toolbar>
      <TextField
        placeholder="Search..."
        variant="outlined"
        size="small"
        sx={{ flexGrow: 1, mr: 2 }}
      />
      <IconButton>
        <SearchIcon />
      </IconButton>
    </Toolbar>
  );
}
