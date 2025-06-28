import React, { useState, useEffect } from "react";
import { getDatabase, ref, push, onValue } from "firebase/database";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import TablePagination from '@mui/material/TablePagination';
import Slide from '@mui/material/Slide';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import InsertCompany from "./InsertCompany";
import { useFirebase } from "../../../server/ProjectFirebaseContext";

function createPackages(No, Name, Numbers, FullNumbers) {
  return {
    No,
    Name,
    Numbers,
    FullNumbers,
  }
}

const packages = [
  createPackages(1, 'Free-Try', 0, 0),
  createPackages(2, 'Free-Forever', 0, 0),
  createPackages(3, 'PaySlip', 0, 0),
  createPackages(4, 'Lite', 0, 0),
  createPackages(5, 'Basic', 0, 0),
  createPackages(6, 'Standard', 0, 0),
  createPackages(7, 'Advanced', 0, 0),
  createPackages(8, 'Professional', 100, 100),
];

function createExtension(No, Name, Numbers, FullNumbers) {
  return {
    No,
    Name,
    Numbers,
    FullNumbers,
  }
}

const extension = [
  createExtension(1, 'E-library', 6, 210),
  createExtension(2, 'Recruitment', 0, 0),
];

function createMenu(Menu_no, Menu_name) {
  return {
    Menu_no,
    Menu_name
  };
}
const menu = [
  createMenu(1, 'Pakages'),
  createMenu(2, 'Extension'),
];

function Package(props) {
  const { row } = props;

  return (
    <React.Fragment>
      <Typography variant="subtitle1" gutterBottom>Package</Typography>
      <Divider />
      {
        packages.map((row) => (
          <Grid container spacing={1} marginBottom={2}>
            <Grid item size={9}>
              <Typography textAlign="right" fontWeight="bold" variant="subtitle2" gutterBottom>{row.Name} : </Typography>
              <BorderLinearProgressCompany variant="determinate" value={(row.Numbers * 100) / (row.FullNumbers === 0 ? row.FullNumbers + 1 : row.FullNumbers)} />
            </Grid>
            <Grid item size={3}>
              <Box sx={{ display: 'flex' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom> {row.Numbers} </Typography>
                <Typography sx={{ marginTop: 2 }} variant="subtitle2" fontWeight="bold" gutterBottom> / </Typography>
                <Typography sx={{ marginTop: 3, marginRight: 1 }} variant="subtitle2" fontWeight="bold" gutterBottom> {row.FullNumbers} </Typography>
              </Box>
            </Grid>
            <Grid item size={12}>
              <Divider />
            </Grid>
          </Grid>
        ))
      }
    </React.Fragment>
  );
}

function Extension(props) {
  const { row } = props;

  return (
    <React.Fragment>
      <Typography variant="subtitle1" gutterBottom>Extension</Typography>
      <Divider />
      {
        extension.map((row) => (
          <Grid container spacing={1} marginBottom={2}>
            <Grid item size={9}>
              <Typography textAlign="right" fontWeight="bold" variant="subtitle2" gutterBottom>{row.Name} : </Typography>
              <BorderLinearProgressCompany variant="determinate" value={(row.Numbers * 100) / (row.FullNumbers === 0 ? row.FullNumbers + 1 : row.FullNumbers)} />
            </Grid>
            <Grid item size={3}>
              <Box sx={{ display: 'flex' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom> {row.Numbers} </Typography>
                <Typography sx={{ marginTop: 2 }} variant="subtitle2" fontWeight="bold" gutterBottom> / </Typography>
                <Typography sx={{ marginTop: 3, marginRight: 1 }} variant="subtitle2" fontWeight="bold" gutterBottom> {row.FullNumbers} </Typography>
              </Box>
            </Grid>
            <Grid item size={12}>
              <Divider />
            </Grid>
          </Grid>
        ))
      }
    </React.Fragment>
  );
}

function Manage() {
  const { firebaseDB, domainKey } = useFirebase();
  const [show, setShow] = useState(1);
  const [showMenu, setshowMenu] = useState(1);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    if (!firebaseDB) return;

    const companiesRef = ref(firebaseDB, "workgroup/company");
    const unsubscribe = onValue(companiesRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : {};
      const list = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      setCompanies(list);
    });

    return () => unsubscribe();
  }, [firebaseDB]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [company, setCompany] = useState([]);
  const getCompany = async () => {
    await HTTP.get("/company")
      .then(res => {
        if (res.data.length <= 0) {
          setCompany("ไม่มีข้อมูล")
        } else {
          setCompany(res.data)
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  useEffect(() => {
    getCompany();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ p: 5 }}>
      <Box sx={{ flexGrow: 1, p: 5 }}>
        <Grid container spacing={2}>
          <Grid item size={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>จัดการบริษัท</Typography>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>รายการบริษัทที่ดูแลอยู่</Typography>
          </Grid>
          <Grid item size={8} textAlign="right">
            <Typography variant="h5" fontWeight="bold" gutterBottom>บริษัท เอ็นทีพี.พาวเวอร์ เนทเวิร์ค จำกัด</Typography>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เลขประจำตัวผู้เสียภาษี: 0-4055-62004-81-6</Typography>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เลขที่ ุ69 หมู่ 18 ตำบลหนองโก อำเภอกระนวน จังหวัดขอนแก่น 40170</Typography>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>เบอร์โทรศัพท์ : 063-482-0766</Typography>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>แฟ็กซ์ :</Typography>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Grid container spacing={2}>
          <Grid item size={4}>
            <ButtonGroup variant="contained" aria-label="Basic button group" >
              {menu.map((row) => (
                <Button onClick={() => { setshowMenu(row.Menu_no) }} color={showMenu === row.Menu_no ? "primary" : "secondary"}>{row.Menu_name}</Button>
              ))}
            </ButtonGroup>
            <Item sx={{ p: 2 }}>
              {
                showMenu === 1 ? <Package />
                  : <Extension />
              }
            </Item>
          </Grid>
          <Grid item size={8}>
            <Box textAlign="right">
              {/* <Button variant="contained" >เพิ่มบริษัท</Button> */}
              <InsertCompany />
            </Box>
            <Grid container spacing={2} marginBottom={2}>
              {
                companies.map((row) => (
                  <Grid item size={6}>
                    <Item sx={{ textAlign: "center", height: showMenu === 2 ? 350 : 300, alignItems: "center", justifyContent: "center", display: "flex" }}>
                      <Box width={280}>
                        <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.dark} gutterBottom>{row.companyserial}</Typography>
                        <Typography variant="h6" fontWeight="bold" color={theme.palette.primary.main} gutterBottom>{row.companyname}</Typography>
                        <Grid container spacing={1} marginTop={2} alignItems="center" justifyContent="center" display="flex">
                          <Grid item size={10}>
                            <Typography textAlign="right" fontWeight="bold" variant="subtitle2" gutterBottom>Professional : </Typography>
                            <BorderLinearProgressCompany variant="determinate" value={(row.professional * 100) / row.fullProfessional} />
                          </Grid>
                          <Grid item size={2}>
                            <Box sx={{ display: 'flex' }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom> {row.professional} </Typography>
                              <Typography sx={{ marginTop: 2 }} variant="subtitle2" fontWeight="bold" gutterBottom> / </Typography>
                              <Typography sx={{ marginTop: 3, marginRight: 1 }} variant="subtitle2" fontWeight="bold" gutterBottom> {row.fullProfessional} </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        {
                          showMenu === 2 ?
                            <Grid container spacing={1} marginTop={1} alignItems="center" justifyContent="center" display="flex">
                              <Grid item size={10}>
                                <Typography textAlign="right" fontWeight="bold" variant="subtitle2" gutterBottom>E-library : </Typography>
                                <BorderLinearProgressCompany variant="determinate" value={(row.elibrary * 100) / row.fullElibrary} />
                              </Grid>
                              <Grid item size={2}>
                                <Box sx={{ display: 'flex' }}>
                                  <Typography variant="h6" fontWeight="bold" gutterBottom> {row.elibrary} </Typography>
                                  <Typography sx={{ marginTop: 2 }} variant="subtitle2" fontWeight="bold" gutterBottom> / </Typography>
                                  <Typography sx={{ marginTop: 3, marginRight: 1 }} variant="subtitle2" fontWeight="bold" gutterBottom> {row.fullElibrary} </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                            : ""
                        }
                        <Grid container spacing={3} marginTop={1}>
                          <Grid item size={6}>
                            <Button variant="outlined" fullWidth>จัดการบริษัท</Button>
                          </Grid>
                          <Grid item size={6}>
                            <Button variant="outlined" fullWidth>เข้าสู่ระบบบริษัท</Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </Item>
                  </Grid>
                ))
              }
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Manage