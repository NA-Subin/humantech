import * as React from 'react';
import { getDatabase, ref, push, onValue } from "firebase/database";
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

export default function Caluculate({ attendant }) {
    const { firebaseDB, domainKey } = useFirebase();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const companyId = companyName?.split(":")[0];
    const [openNews, setOpenNews] = useState(true);
    const [openNotify, setOpenNotify] = useState(false);
    const [openEmployee, setOpenEmployee] = useState(false);
    const [dateApprove, setDateApprove] = useState(dayjs(new Date))
    const [employees, setEmployees] = useState([]);
    const [position, setPosition] = useState([]);
    const [document, setDocument] = useState([]);
    const [openNavbar, setopenNamevar] = useState(false)

    console.log("document : ", document);

    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            setDateApprove(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    const formatMinutesToHHMM = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    };

    const handleOpenNews = () => {
        setOpenNews(true);
        setOpenNotify(false);
        setOpenEmployee(false);
    }

    const handleOpenNotify = () => {
        setOpenNews(false);
        setOpenNotify(true);
        setOpenEmployee(false);
    }

    const handleOpenEmployee = () => {
        setOpenNews(false);
        setOpenNotify(false);
        setOpenEmployee(true);
    }

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

    React.useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const positionData = snapshot.val();

            if (!positionData) {
                setPosition([]);
            } else {
                const positionArray = Object.values(positionData);
                setPosition(positionArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    React.useEffect(() => {
        if (!firebaseDB) return;

        const companiesRef = ref(firebaseDB, "workgroup/company");
        const unsubscribe = onValue(companiesRef, (snapshot) => {
            const data = snapshot.exists() ? snapshot.val() : {};
            const list = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value,
            }));
            setCompanies(list);

            // ค้นหา company ตาม companyId
            const found = list.find((item, index) => String(index) === companyId);
            if (found) {
                setSelectedCompany(found);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);


    console.log("employeee : ", employees);

    return (
        <React.Fragment>
            <Grid container spacing={2} marginTop={1} marginBottom={1}>
                <Grid item size={12} textAlign="right">
                    <Typography variant='h1' sx={{ marginTop: -4.5, marginBottom: -10, color: theme.palette.primary.dark, marginRight: 41.2 }} fontWeight="bold" gutterBottom>||</Typography>
                </Grid>
                <Grid item size={12}>
                    <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                        <Grid container spacing={2}>
                            <Grid item size={6}>
                                <Typography variant='h6' fontWeight="bold" gutterBottom>รายการคำนวณเงินเดือน</Typography>
                            </Grid>
                            <Grid item size={6} textAlign="right" marginTop={0.5}>
                                <Box display="flex" alignItems="center" justifyContent="right">
                                    {/* <Button variant="contained" color="error" size="small" sx={{ marginRight: 2 }}>Import Excel</Button> */}
                                    <Button variant="contained" color="success" size="small">Export Excel</Button>
                                </Box>
                            </Grid>
                            <Grid item size={12}>
                                <TableContainer component={Paper} textAlign="center">
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1200px" }}>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader sx={{ width: 100 }}>รหัสพนักงาน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 400 }}>ชื่อ-สกุล</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120 }}>ทำงาน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>ขาดงาน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 180 }}>เวลาเข้าไม่ครบ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120 }}>เวลาออกไม่ครบ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120 }}>สาย</TablecellHeader>
                                                <TablecellHeader sx={{ width: 120 }}>กลับก่อน</TablecellHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {attendant.map((emp, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell sx={{ textAlign: "center" }}>{emp.employeeId}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{emp.name}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{emp.summary.work}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{emp.summary.absent}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{emp.summary.noTimeIn}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{emp.summary.noTimeOut}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {emp.summary.lateMinutes > 0
                                                            ? formatMinutesToHHMM(emp.summary.lateMinutes)
                                                            : "00:00"}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {emp.summary.earlyLeaveMinutes > 0
                                                            ? formatMinutesToHHMM(emp.summary.earlyLeaveMinutes)
                                                            : "00:00"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                        <Divider />
                    </Item>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}