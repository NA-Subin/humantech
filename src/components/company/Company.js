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
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../../server/ProjectFirebaseContext";
import { Item } from "../../theme/style";
import theme from "../../theme/theme";
import InsertCompany from "./InsertCompany";

const Company = ({ companyName }) => {
    const { firebaseDB, domainKey } = useFirebase();
    const navigate = useNavigate();
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

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5 }}>
                <Grid container spacing={2}>
                    <Grid item size={12} textAlign="center">
                        <Typography variant="h3" fontWeight="bold" gutterBottom>จัดการบริษัท</Typography>
                    </Grid>
                    <Grid item size={12} textAlign="right" sx={{ marginTop: -12 }}>
                        <InsertCompany />
                    </Grid>
                    <Grid item size={12} textAlign="center">
                        <Divider />
                    </Grid>
                    <Grid item size={12} textAlign="right">
                        <Box p={2}>
                            <Grid container spacing={2} marginBottom={2}>
                                {
                                    companies.map((row) => (
                                        <Grid item size={4}>
                                            <Item sx={{ textAlign: "center", height: showMenu === 2 ? 350 : 300, alignItems: "center", justifyContent: "center", display: "flex" }}>
                                                <Box width={280}>
                                                    <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.dark} gutterBottom>{row.companyserial}</Typography>
                                                    <Typography variant="h6" fontWeight="bold" color={theme.palette.primary.main} gutterBottom>{row.companyname}</Typography>
                                                    <Grid container spacing={3} marginTop={1}>
                                                        <Grid item size={6}>
                                                            <Button variant="outlined" fullWidth
                                                                onClick={() => navigate(`/company/manage/${encodeURIComponent(`${row.companyid}:${row.companyserial}`)}`)}
                                                            >จัดการบริษัท</Button>
                                                        </Grid>
                                                        <Grid item size={6}>
                                                            <Button variant="outlined" fullWidth>เข้าสู่ระบบบริษัท</Button>
                                                        </Grid>
                                                    </Grid>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ marginTop: 3 }} color={theme.palette.primary.main} gutterBottom>{row.companyaddress}</Typography>
                                                </Box>
                                            </Item>
                                        </Grid>
                                    ))
                                }
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    )
}

export default Company