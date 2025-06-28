import React, { useState } from 'react'
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import GridViewIcon from '@mui/icons-material/GridView';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];



export default function Companylist() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ p: 15 }} >

        <div style={{ display: 'flex', gap: '16px', marginTop: '50px' }}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            sx={{ width: 150 }}
            renderInput={(params) => <TextField {...params} label="ชื่อย่อบริษัท" />}
          />
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            sx={{ width: 350 }}
            renderInput={(params) => <TextField {...params} label="ชื่อบริษัท" />}
          />

          <Autocomplete
            disablePortal
            id="combo-box-demo"
            sx={{ width: 200 }}
            renderInput={(params) => <TextField {...params} label="ประเภทธุรกิจ" />}
          />

          <Button variant="contained" endIcon={<SearchIcon />} style={{ backgroundColor: 'ButtonShadow' }}>
            ค้นหา
          </Button>
          <Button variant="contained" endIcon={<RefreshIcon />} style={{ backgroundColor: 'ButtonShadow' }}>
            รีเฟรช
          </Button>
        </div>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', marginBottom: '30px' }}>
          <Button variant="contained" startIcon={<DomainAddIcon />} style={{ backgroundColor: 'palegreen', height: '100%' }}>
            เพิ่มบริษัท
          </Button>
        </Box>


        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: '#AFC8AD' }}>
              <TableRow>
                <TableCell>ลำดับ</TableCell>
                <TableCell align="right">ชื่อบริษัท</TableCell>
                <TableCell align="right">ชื่อย่อบริษัท</TableCell>
                <TableCell align="right">ประเภทธุรกิจ</TableCell>
                <TableCell align='center'><GridViewIcon/></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.calories}</TableCell>
                  <TableCell align="right">{row.fat}</TableCell>
                  <TableCell align="right">{row.carbs}</TableCell>
                  
                  <TableCell align='center'>
                    <ButtonGroup variant="text" aria-label="Basic button group" >
                      <Button style={{ color: 'green' }}><BorderColorOutlinedIcon /></Button>
                      <Button style={{ color: 'blue' }} ><RemoveRedEyeOutlinedIcon /></Button>
                      <Button style={{ color: 'red' }}><DeleteOutlineOutlinedIcon /></Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Container>
    </>
  )
}

