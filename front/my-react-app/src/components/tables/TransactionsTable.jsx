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
import { Box } from "@mui/material";
import "../../styles.css";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const DEFAULT_ROWS_PER_PAGE = 5;

/*****************************************************************************/

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
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead className="tableHead">
          <TableRow>
            <TableCell className="tableHeadCell">Transactions </TableCell>
            <TableCell className="tableHeadCell" align="right">
              From
            </TableCell>
            <TableCell className="tableHeadCell" align="right">
              To
            </TableCell>
            <TableCell className="tableHeadCell" align="right">
              Amount
            </TableCell>
            <TableCell className="tableHeadCell" align="right">
              Date
            </TableCell>
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
                <TableCell align="right">
                  {new Date(row.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
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
      </Box>
    </TableContainer>
  );
}
