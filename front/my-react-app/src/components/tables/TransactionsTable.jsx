import { useState } from "react";
import { makeStyles } from "@mui/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import { GenericSubmitButton } from "../../components/buttons/buttons";
import {
  Box,
  Select,
  MenuItem,
  Typography,
  TextField,
  Button,
} from "@mui/material";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const DEFAULT_ROWS_PER_PAGE = 5;

export function TransactionsTable({ transactionsArray }) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - transactionsArray.length)
      : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    console.log("handleChangeRowsPerPage!!!!!!!!");
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Transactions </TableCell>
            <TableCell align="right">from</TableCell>
            <TableCell align="right">to</TableCell>
            <TableCell align="right">amount</TableCell>
            <TableCell align="right">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactionsArray
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => (
              <TableRow key={row._id}>
                <TableCell component="th" scope="row">
                  {/* {row._id} */}
                </TableCell>
                <TableCell align="right">{row.senderEmail}</TableCell>
                <TableCell align="right">{row.recipientEmail}</TableCell>
                <TableCell align="right">{row.amount}</TableCell>
                <TableCell align="right">{row.date}</TableCell>
              </TableRow>
            ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Box
        id="transaction-display-controls"
        display="flex"
        flexDirection="column"
        alignItems="end"
      >
        <Box
          id="pagination-controls"
          display="flex"
          className={classes.paginationContainer}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={transactionsArray.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>

        {/* <Box id="transaction-skip-control" display="flex">
          <Typography variant="body1" mr={1}>
            Number of transactions to skip:
          </Typography>
          <TextField
            type="number"
            value={5}
            onChange={5}
            size="small"
            inputProps={{ min: 1 }}
            sx={{ width: "80px" }}
          />
          <Button variant="contained" onClick={5} size="small">
            Set
          </Button>
        </Box> */}
      </Box>
    </TableContainer>
  );
}

{
  /* <Box
id="transaction-limit-control"
display="flex"
width="200px" // Adjust this width as needed
mt={2} // Add some top margin
>
<FormControl fullWidth size="small">
  <InputLabel id="transaction-limit-label">
    transactions limit to
  </InputLabel>
  <Select
    labelId="transaction-limit-label"
    value={5}
    onChange={5}
    label="limit transactions displayed to"
  >
    <MenuItem value={10}>10</MenuItem>
    <MenuItem value={50}>50</MenuItem>
    <MenuItem value={100}>100</MenuItem>
    <MenuItem value={500}>500</MenuItem>
  </Select>
</FormControl>
</Box> */
}
