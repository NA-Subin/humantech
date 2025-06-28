import React, { useState } from "react";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import ButtonGroup from '@mui/material/ButtonGroup';
import Slider from '@mui/material/Slider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item,SearchData,TablecellHeader,TablecellBody,ItemButton,TablecellNoData } from "../../../theme/style"

function createData(EmployeeID, FingerprintID, Prefix, Name, Surname, Nickname, Sex, Nationality , Department, Departments, Agency, Position, Status_id, BirthDay, Phone, Email, ID) {
  return {
      EmployeeID,
      FingerprintID,
      Prefix,
      Name,
      Surname,
      Nickname,
      Sex,
      Nationality,
      Department,
      Departments,
      Agency,
      Position,
      Status_id,
      BirthDay,
      Phone,
      Email,
      ID,
  };
}

const data = [ ];

function Employee() {
  const [showMenu, setshowMenu] = useState(1);
  const [showEmp, setshowEmp] = useState('651138');
  const [open, setOpen] = React.useState(true);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handletapshowMenu = (e) => {
    setshowMenu(e);
  }

  const handletapshowEmp = (e) => {
    setshowEmp(e);
  }

  return (
    <Container maxWidth="xl" sx={{ p: 5}}>
        <Box sx={{ flexGrow: 1, p:5}}>
          <Grid container spacing={2}>
            <Grid item size={4}>
                <Typography variant="subtitle2" gutterBottom>ตั้งค่า / จัดการผู้ใช้</Typography>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>รายชื่อผู้ใช้งานระบบ</Typography>
            </Grid>
            <Grid item size={4} textAlign="center">
                <SearchData sx={{ display: 'flex', alignItems: 'center' }}>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="ค้นหา..."
                        inputProps={{ 'aria-label': 'ค้นหา...' }}
                    />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </SearchData>
            </Grid>
            <Grid item size={4} marginTop={2} textAlign="right">

            </Grid>
          </Grid>
        </Box>
        <Item>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>รายชื่อผู้ใช้งานระบบ CCS</Typography>
            <Divider />
            <Box marginTop={2}>
                <TableContainer component={Paper} textAlign="center">
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                <TablecellHeader>ชื่อ</TablecellHeader>
                                <TablecellHeader>นามสกุล</TablecellHeader>
                                <TablecellHeader>Email</TablecellHeader>
                                <TablecellHeader>Role</TablecellHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { 
                            data == "" ?
                              <TableRow>
                                <TablecellNoData colSpan={7}><FolderOffRoundedIcon/><br/>ไม่มีข้อมูล</TablecellNoData>
                              </TableRow>
                            :
                            data.map((row) => (
                              <TableRow>
                                <TablecellBody> </TablecellBody>
                              </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Item>
        <Item sx={{ marginTop: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ประวัติการแก้ไข</Typography>
            <Divider />
            <Box marginTop={2}>
                <TableContainer component={Paper} textAlign="center">
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                <TablecellHeader>แก้ไขของ</TablecellHeader>
                                <TablecellHeader>แก้ไขโดย</TablecellHeader>
                                <TablecellHeader>วันที่แก้ไข</TablecellHeader>
                                <TablecellHeader>หมายเหตุ</TablecellHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { 
                              data == "" ?
                                <TableRow>
                                  <TablecellNoData colSpan={7}><FolderOffRoundedIcon/><br/>ไม่มีข้อมูล</TablecellNoData>
                                </TableRow>
                              :
                              data.map((row) => (
                                <TableRow>
                                  <TablecellBody> </TablecellBody>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Item>
    </Container>
  )
}

export default Employee