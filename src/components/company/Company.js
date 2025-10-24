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
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useFirebase } from "../../server/ProjectFirebaseContext";
import { Item } from "../../theme/style";
import theme from "../../theme/theme";
import InsertCompany from "./InsertCompany";
import { Card, CardActionArea, CardContent } from "@mui/material";
import LogoGreen from '../../img/HumantechGreen.png';
import { logout } from "../../server/logoutAuth";
import { ShowConfirm } from "../../sweetalert/sweetalert";
import FullBlogEditor from "../attendant/TestBlogs";

const Company = () => {
    const { firebaseDB, domainKey } = useFirebase();
    //const { domain } = useParams();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const navigate = useNavigate();

    const handleLogout = () => {
        ShowConfirm(
            "ออกจากระบบ",
            "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?",
            () => {
                logout(navigate);
            },
            () => {
                console.log("ยกเลิกการออกจากระบบ");
            }
        );
    };
    
    const [show, setShow] = useState(1);
    const [showMenu, setshowMenu] = useState(1);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const [companies, setCompanies] = useState([]);
    const [workgroup, setWorkgroup] = useState([]);

    console.log("workgroup : ", workgroup);

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

    useEffect(() => {
        if (!firebaseDB) return;

        const workgroupRef = ref(firebaseDB, "workgroup");
        const unsubscribe = onValue(workgroupRef, (snapshot) => {
            const data = snapshot.exists() ? snapshot.val() : {};
            setWorkgroup(data.payment.name);
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
                <Grid container spacing={2} marginTop={-10}>
                    <Grid item size={12} textAlign="center">
                        <img src={LogoGreen} width={500} />
                        <Typography variant="h3" fontSize={30} marginTop={-2} fontWeight="bold" gutterBottom>
                            ( ระบบจัดการบริษัท )
                        </Typography>
                    </Grid>
                    <Grid item size={12} textAlign="right" marginTop={-12}>
                        <Button onClick={handleLogout} variant="contained" size="large" color="error" endIcon={<MeetingRoomIcon />}>
                            ออกจากระบบ
                        </Button>
                    </Grid>
                    <Grid item size={12} textAlign="center">
                        <Divider sx={{ border: `1px solid ${theme.palette.primary.dark}` }} />
                    </Grid>
                    <Grid item size={12} textAlign="right">
                        <Box p={2}>
                            <Grid container spacing={5} marginBottom={2}>
                                <Grid item size={{  xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ p: 5 }} >
                                    <Typography variant="subtitle2" color="error" sx={{ textAlign: "center", marginBottom: -0.5, marginTop: 3 }} fontWeight="bold" gutterBottom>*เพิ่มบริษัทกดตรงนี้*</Typography>
                                    <Card sx={{ height: '25vh', borderRadius: 5 }} elevation={6}>
                                        <InsertCompany />
                                    </Card>
                                </Grid>
                                {
                                    companies.map((row) => (
                                        <Grid item size={{  xs: 12, sm: 6, md: 4, lg: 3 }} key={row.id}>
                                            <Box sx={{ position: "relative", display: "inline-block", width: "100%", textAlign: "left" }}>
                                                {/* Icon เป็น background */}
                                                <BusinessIcon
                                                    sx={{
                                                        fontSize: 300,
                                                        color: theme.palette.primary.main,
                                                        marginTop: -2,
                                                        zIndex: 0,
                                                    }}
                                                />

                                                {/* CardContent อยู่ด้านหน้า */}
                                                <CardContent
                                                    sx={{
                                                        border: `5px solid ${theme.palette.primary.main}`,
                                                        backgroundColor: "rgba(255, 255, 255, 0.9)", // โปร่งใสหน่อย เห็น icon ทะลุ
                                                        zIndex: 1,
                                                        position: "relative",
                                                        textAlign: "center",
                                                        marginTop: -20,
                                                        borderRadius: 5
                                                    }}
                                                >
                                                    <Typography
                                                        variant="h4"
                                                        fontWeight="bold"
                                                        color={theme.palette.primary.dark}
                                                        gutterBottom
                                                    >
                                                        {row.companyserial}
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        color={theme.palette.primary.dark}
                                                        gutterBottom
                                                    >
                                                        {row.companyname}
                                                    </Typography>
                                                </CardContent>
                                                <Box sx={{ textAlign: "right", marginTop: -23, marginRight: 2 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="warning"
                                                        sx={{
                                                            borderRadius: 2,
                                                        }}
                                                        size="large"
                                                        onClick={
                                                            () =>
                                                                //navigate(`/${domain}/${encodeURIComponent(`${row.companyid}:${row.companyserial}`)}`)
                                                                workgroup === "attendant" ?
                                                                    navigate(`/?domain=${domain}&company=${encodeURIComponent(`${row.companyid}:${row.companyserial}`)}&page=attendant`)
                                                                    :
                                                                    navigate(`/?domain=${domain}&company=${encodeURIComponent(`${row.companyid}:${row.companyserial}`)}&page=`)
                                                        }
                                                    >จัดการบริษัท</Button>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        // <Grid item size={4}>
                                        //     <Card sx={{ height: '35vh', borderRadius: 5 }} elevation={6}>
                                        //         <CardActionArea
                                        //             //onClick={() => handleSelectedPlan('pro', 3900, 100)}
                                        //             sx={{
                                        //                 height: '100%',
                                        //                 display: 'flex',
                                        //                 flexDirection: 'column',
                                        //                 alignItems: 'flex-start',
                                        //                 justifyContent: 'flex-start',
                                        //                 //border: selectedPlan?.name === 'pro' ? `2px solid ${theme.palette.primary.main}` : 'none',
                                        //                 //backgroundColor: selectedPlan?.name === 'pro' ? theme.palette.action.hover : 'transparent',
                                        //             }}
                                        //         >
                                        //             <CardContent sx={{ backgroundColor: theme.palette.primary.main, width: '100%', textAlign: "center" }}>
                                        //                 <Typography variant="h4" fontWeight="bold" color={"white"} sx={{ marginTop: -0.5 }} gutterBottom>{row.companyserial}</Typography>
                                        //                 <Typography variant="h6" fontWeight="bold" color={"white"} sx={{ marginTop: -1, marginBottom: -1 }} gutterBottom>{row.companyname}</Typography>
                                        //             </CardContent>
                                        //             <CardContent sx={{ width: "100%", p: 4, marginTop: 1 }}>
                                        //                 <Grid container spacing={3} marginRight={8} >
                                        //                     <Grid item size={6}>
                                        //                         <Button variant="outlined" fullWidth size="large"
                                        //                             onClick={
                                        //                                 () =>
                                        //                                     //navigate(`/${domain}/${encodeURIComponent(`${row.companyid}:${row.companyserial}`)}`)
                                        //                                     navigate(`/?domain=${domain}&company=${encodeURIComponent(`${row.companyid}:${row.companyserial}`)}&page=`)
                                        //                             }
                                        //                         >จัดการบริษัท</Button>
                                        //                     </Grid>
                                        //                     <Grid item size={6}>
                                        //                         <Button variant="outlined" size="large" fullWidth>เข้าสู่ระบบบริษัท</Button>
                                        //                     </Grid>
                                        //                 </Grid>
                                        //             </CardContent>
                                        //             <CardContent sx={{ backgroundColor: theme.palette.primary.dark, width: '100%', textAlign: "center" }}>
                                        //                 <Typography variant="subtitle2" fontWeight="bold" color={"white"} gutterBottom>{row.companyaddress}</Typography>
                                        //             </CardContent>
                                        //         </CardActionArea>
                                        //     </Card>
                                        // </Grid>
                                    ))
                                }
                            </Grid>
                        </Box>
                    </Grid>
                </Grid >
            </Box >
            {/* <FullBlogEditor /> */}
        </Container >
    )
}

export default Company