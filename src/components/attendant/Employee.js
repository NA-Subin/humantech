import * as React from 'react';
import * as XLSX from "xlsx";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Logo from '../../img/HumantechGreen.png';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';
import AlarmIcon from '@mui/icons-material/Alarm';
import BadgeIcon from '@mui/icons-material/Badge';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import theme from '../../theme/theme';
import { Item, ItemReport, TablecellHeader } from '../../theme/style';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { useState } from 'react';
import { Button, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts';
import { useRef } from 'react';
import AddEmployee from './AddEmployee';

export default function EmployeeDetail() {
    const { firebaseDB, domainKey } = useFirebase();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [employees, setEmployees] = useState([]);

    React.useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val();

            if (!employeeData) {
                setEmployees([]);
            } else {
                const employeeArray = Object.values(employeeData);
                setEmployees(employeeArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    return (
        <React.Fragment>
            <Grid container spacing={2} marginTop={1} marginBottom={1}>
                <Grid item size={12} textAlign="center">
                    <Typography variant='h1' sx={{ marginTop: -4.5, marginBottom: -10, color: theme.palette.primary.dark, marginLeft: -30 }} fontWeight="bold" gutterBottom>||</Typography>
                </Grid>
                <Grid item size={3}>
                    <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                        <Grid container>
                            <Grid item size={12} textAlign="center">
                                <Typography variant='h6' fontWeight="bold" gutterBottom>เพศ</Typography>
                            </Grid>
                            <Grid item size={12} >
                                <Divider />
                            </Grid>
                            <Grid item size={12} >
                                <Grid container>
                                    <Grid item size={6}>
                                        <ManIcon sx={{ fontSize: 200, color: "#81d4fa", marginLeft: -5 }} />
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: -2 }}>
                                            <Typography variant='h3' fontWeight="bold" textAlign="center" sx={{ marginRight: 1, color: theme.palette.primary.dark }} gutterBottom>{employees.filter((item) => item.sex === "ชาย").length}</Typography>
                                            <Typography variant='h6' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom> คน</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item size={6}>
                                        <WomanIcon sx={{ fontSize: 200, color: "#f48fb1", marginLeft: -5 }} />
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: -2 }}>
                                            <Typography variant='h3' fontWeight="bold" textAlign="center" sx={{ marginRight: 1, color: theme.palette.primary.dark }} gutterBottom>{employees.filter((item) => item.sex === "หญิง").length}</Typography>
                                            <Typography variant='h6' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom> คน</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item size={12}>
                                        <Typography variant='h6' fontWeight="bold" textAlign="center" color="error" gutterBottom>ไม่กำหนดเพศ {employees.filter((item) => item.sex === "").length} คน</Typography>
                                    </Grid>
                                    <Grid item size={12}>
                                        <Typography variant='h5' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom>รวมทั้งหมด</Typography>
                                        <Typography variant='h3' fontWeight="bold" textAlign="center" sx={{ marginTop: -2, color: theme.palette.primary.dark }} gutterBottom>{employees.length} คน</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item size={9}>
                    <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                        <Grid container>
                            <Grid item size={12} textAlign="center">
                                <Typography variant='h6' fontWeight="bold" gutterBottom>พนักงานทั้งหมด</Typography>
                            </Grid>
                            <Grid item size={12} textAlign="right" sx={{ marginTop: -5 }}>
                                <AddEmployee />
                            </Grid>
                            <Grid item size={12}>
                                <Divider />
                            </Grid>
                            <Grid item size={12}>
                                <TableContainer component={Paper} textAlign="center" sx={{ height: "55vh", marginTop: 2 }}>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1200px" }}>
                                        <TableHead
                                            sx={{
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 2,
                                                backgroundColor: theme.palette.primary.dark,
                                            }}
                                        >
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "1px solid white" }}>รหัสพนักงาน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 300, position: "sticky", left: 0, backgroundColor: theme.palette.primary.dark, borderRight: "1px solid white" }}>ชื่อ-สกุล</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>เพศ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 180 }}>ขาดงาน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ลากิจ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ลาป่วย</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ลาพักร้อน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ลาฝึกอบรม</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ลาคลอด</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ลาเพื่อทำหมัน</TablecellHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                employees.map((item, index) => (
                                                    <TableRow key={item.ID} >
                                                        <TableCell sx={{ width: 50, textAlign: "center" }}>{index + 1}</TableCell>
                                                        <TableCell sx={{ width: 100, textAlign: "center" }}>{item.employeecode}</TableCell>
                                                        <TableCell sx={{ width: 300, textAlign: "center", position: "sticky", left: 0, backgroundColor: "white" }}>{item.employname}</TableCell>
                                                        <TableCell sx={{ width: 150, textAlign: "center" }}>{item.sex}</TableCell>
                                                        <TableCell sx={{ width: 150, textAlign: "center" }}> </TableCell>
                                                        {
                                                            item.leave.map((leaveType, idx) => (
                                                                <TableCell key={idx} sx={{ width: 100, textAlign: "center" }}>{`0/${leaveType.max}`}</TableCell>
                                                            ))
                                                        }
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            <Grid item size={12} textAlign="right" sx={{ marginTop: 1 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    sx={{ marginRight: 2 }}
                                >
                                    Import Excel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                >
                                    Export Excel
                                </Button>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}