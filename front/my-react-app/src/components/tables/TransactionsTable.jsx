
import { useState } from "react";
import { makeStyles } from '@mui/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  }
});

const DEAFULT_ROWS_PER_PAGE=5;

export function TransactionsTable({transactionsArray}){

  const classes = useStyles();
    const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(DEAFULT_ROWS_PER_PAGE);
  
    // // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactionsArray.length) : 0;
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  

    return  (
      <TableContainer component={Paper}>
        <Table className={classes.table}  aria-label="simple table">
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
              .slice(page * rowsPerPage, page * rowsPerPage
                 + rowsPerPage)
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
        <TablePagination
         rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactionsArray.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
         onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TableContainer>
    );

}