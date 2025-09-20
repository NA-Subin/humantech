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
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
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
import EmployeeDetail from './Employee';
import Caluculate from './Calculate';

export default function TimeAttendant({ date }) {
    const { firebaseDB, domainKey } = useFirebase();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const companyId = companyName?.split(":")[0];
    const [openTime, setOpenTime] = useState(true);
    const [openSalary, setOpenSalary] = useState(false);
    const [openEmployee, setOpenEmployee] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [position, setPosition] = useState([]);
    const [document, setDocument] = useState([]);
    const [openNavbar, setopenNamevar] = useState(false)
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click(); // กดปุ่ม → เปิด file dialog
    };

    console.log("document : ", document);

    const handleOpenTime = () => {
        setOpenTime(true);
        setOpenSalary(false);
        setOpenEmployee(false);
    }

    const handleOpenSalary = () => {
        setOpenTime(false);
        setOpenSalary(true);
        setOpenEmployee(false);
    }

    const handleOpenEmployee = () => {
        setOpenTime(false);
        setOpenSalary(false);
        setOpenEmployee(true);
    }

    const [attendants, setAttendants] = useState([]);

    React.useEffect(() => {
        if (!companyId || !date) return;

        const refPath = ref(firebaseDB, `workgroup/company/${companyId}/attendant`);

        const unsubscribe = onValue(refPath, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                // แปลง object จาก Firebase เป็น array
                const attendantsArray = Object.values(data);

                // กรองตามวันที่ (สมมติ field ใน attendant ชื่อว่า `date` เก็บเป็น "DD/MM/YYYY")
                const filtered = attendantsArray.filter((item) => {
                    const itemDate = dayjs(item.date, "DD/MM/YYYY");
                    return itemDate.isSame(date, "month"); // เทียบเดือนเดียวกัน
                });

                setAttendants(filtered);
            } else {
                setAttendants([]);
            }
        });

        return () => unsubscribe();
    }, [companyId, date]);

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

        const paths = ["documentleave", "documenttime", "documentot"];
        const unsubscribes = [];

        paths.forEach((path) => {
            const refPath = ref(firebaseDB, `workgroup/company/${companyId}/${path}`);
            const unsubscribe = onValue(refPath, (snapshot) => {
                const data = snapshot.val();

                // flatten ข้อมูลจากปี → เดือน → เอกสาร
                let allDocs = [];
                if (data) {
                    Object.values(data).forEach((months) => {
                        Object.values(months).forEach((docs) => {
                            allDocs = [...allDocs, ...Object.values(docs)];
                        });
                    });
                }

                setDocument((prev) => {
                    // ลบของเก่าที่เป็น path เดียวกันก่อน
                    const filtered = prev.filter((doc) => doc._type !== path);
                    return [...filtered, ...allDocs.map((item) => ({ ...item, _type: path }))];
                });
            });

            unsubscribes.push(unsubscribe);
        });

        return () => unsubscribes.forEach((unsub) => unsub());
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

    const grouped = attendants.reduce((acc, row) => {
        if (!acc[row.name]) {
            acc[row.name] = {
                employeeId: row.employeeId,
                name: row.name,
                records: [],
                summary: {
                    work: 0,
                    absent: 0,
                    noTimeIn: 0,
                    noTimeOut: 0,
                    late: 0,
                    earlyLeave: 0,
                    lateMinutes: 0,
                    earlyLeaveMinutes: 0,
                }
            };
        }
        acc[row.name].records.push(row);
        return acc;
    }, {});

    Object.values(grouped).forEach((emp) => {
        emp.records.forEach((rec) => {
            const timeIn = rec.timeIn ? dayjs(rec.timeIn, "HH:mm") : null;
            const timeOut = rec.timeOut ? dayjs(rec.timeOut, "HH:mm") : null;

            // ขาดงาน / ไม่มีเวลาเข้า / ไม่มีเวลาออก
            if (!rec.timeIn && !rec.timeOut) {
                // ถ้าไม่มีทั้งเวลาเข้าและเวลาออก → ขาดงาน
                emp.summary.absent++;
            } else {
                // กรณีอื่น ๆ นับแยก
                if (!rec.timeIn) emp.summary.noTimeIn++;
                if (!rec.timeOut) emp.summary.noTimeOut++;
                if (rec.timeIn && rec.timeOut) emp.summary.work++;
            }

            // คำนวณสาย
            if (timeIn && timeIn.isValid() && timeIn.isAfter(dayjs("08:30", "HH:mm"))) {
                const diffMinutes = timeIn.diff(dayjs("08:30", "HH:mm"), "minute");
                emp.summary.lateMinutes += diffMinutes;
            }

            if (timeOut && timeOut.isValid()) {
                const schedule = rec.schedule?.toLowerCase().trim();
                let end = schedule === "working time" ? dayjs("17:30", "HH:mm") :
                    schedule === "half day" ? dayjs("12:00", "HH:mm") :
                        null;

                if (end && timeOut.isBefore(end)) {
                    const diffMinutes = end.diff(timeOut, "minute"); // diffMinutes จะเป็นบวกถ้าออกก่อน
                    emp.summary.earlyLeaveMinutes += diffMinutes; // ✅ ต้องเป็น number
                }
            }

            console.log("timeOut:", rec.timeOut, "parsed:", timeOut?.format("HH:mm"), "schedule:", rec.schedule);

        });
    });

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            const formattedData = jsonData.map((row, index) => {
                // ฟังก์ชันช่วย format เวลา
                const formatTime = (value) => {
                    if (!value || value === "" || value === null) return "00:00";
                    // เผื่อมี format แบบตัวเลข เช่น 8.5 = 8:30
                    if (typeof value === "number") {
                        const hours = Math.floor(value);
                        const minutes = Math.round((value - hours) * 60);
                        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
                    }
                    return value;
                };

                return {
                    id: index + 1,
                    employeeId: row["รหัสพนักงาน"],
                    name: row["ชื่อ-สกุล"],
                    date: row["วันที่"],
                    schedule: row["ตารางเวลา"],
                    timeIn: row["เวลาเข้า"],
                    timeOut: row["เวลาออก"],
                    late: formatTime(row["มาสาย"]),
                    earlyLeave: formatTime(row["ออกก่อน"]),
                    absent: row["ขาดงาน"] === "True" || row["ขาดงาน"] === true,
                    overtime: row["ล่วงเวลา"],
                    workHours: row["เวลาทำงาน"],
                    exception: row["ข้อยกเว้น"],
                    normalDay: row["วันทำงานปกติ"],
                    weekend: row["วันหยุดประจำสัปดาห์"],
                    totalWorkOvertime: row["ชั่วโมงทำงาน+ล่วงเวลา"],
                    otNormal: row["ล่วงเวลา ปกติ"],
                    otWeekend: row["ล่วงเวลา วันหยุดสุดสัปดาห์"],
                };
            });

            console.log("Formatted Data:", formattedData);

            const refPath = ref(firebaseDB, `workgroup/company/${companyId}/attendant`);
            await set(refPath, formattedData);

            alert("นำเข้าข้อมูลสำเร็จ!");
        };

        reader.readAsArrayBuffer(file);
    };

    console.log("employeee : ", employees);

    return (
        <React.Fragment>
            <Grid container spacing={2} marginTop={1} marginBottom={1}>
                <Grid item size={4}>
                    <Paper sx={{ borderRadius: 3, boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)', cursor: "pointer", }} onClick={handleOpenTime}>
                        <Grid container spacing={2}>
                            <Grid
                                item
                                size={6}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    padding: theme.spacing(2),
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                    textAlign: "center",
                                    borderBottom: openTime && `5px solid ${theme.palette.primary.dark}`
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>ข้อมูลแสกนเวลา</Typography>
                                <AlarmIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{attendants.length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>ครั้ง</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                {/* <Grid item size={3}>
                    <Item>
                        <EmailIcon fontSize="large" />
                    </Item>
                </Grid> */}
                <Grid item size={4}>
                    <Paper sx={{ borderRadius: 3, boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)', cursor: "pointer" }} onClick={handleOpenEmployee}>
                        <Grid container spacing={2}>
                            <Grid
                                item
                                size={6}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    padding: theme.spacing(2),
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                    textAlign: "center",
                                    borderBottom: openEmployee && `5px solid ${theme.palette.primary.dark}`
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>พนักงานทั้งหมด</Typography>
                                <BadgeIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{employees.length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>คน</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item size={4}>
                    <Paper sx={{ borderRadius: 3, boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)', cursor: "pointer" }} onClick={handleOpenSalary}>
                        <Grid container spacing={2}>
                            <Grid
                                item
                                size={6}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    padding: theme.spacing(2),
                                    borderTopLeftRadius: 10,
                                    borderBottomLeftRadius: 10,
                                    textAlign: "center",
                                    borderBottom: openSalary && `5px solid ${theme.palette.primary.dark}`
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>คำนวณเงินเดือน</Typography>
                                <CurrencyExchangeIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{Object.values(grouped).length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>ใบ</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            {
                openTime &&
                <Grid container spacing={2} marginTop={1} marginBottom={1}>
                    <Grid item size={12}>
                        <Typography variant='h1' sx={{ marginTop: -4.5, marginBottom: -10, color: theme.palette.primary.dark, marginLeft: 11 }} fontWeight="bold" gutterBottom>||</Typography>
                    </Grid>
                    <Grid item size={12}>
                        <Item sx={{ height: 500, borderTop: `5px solid ${theme.palette.primary.dark}` }}>
                            <Grid container spacing={2}>
                                <Grid item size={6}>
                                    <Typography variant='h6' fontWeight="bold" gutterBottom>รายการแสกนเวลา</Typography>
                                </Grid>
                                <Grid item size={6} textAlign="right" marginTop={0.5}>
                                    <Box display="flex" alignItems="center" justifyContent="right">
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            ref={fileInputRef}
                                            style={{ display: "none" }}
                                            onChange={handleFileUpload}
                                        />
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            sx={{ marginRight: 2 }}
                                            onClick={handleButtonClick}
                                        >
                                            Import Excel
                                        </Button>
                                        <Button variant="contained" color="success" size="small">Export Excel</Button>
                                    </Box>
                                </Grid>
                                <Grid item size={12}>
                                    <TableContainer component={Paper} textAlign="center" sx={{ height: "55vh" }}>
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
                                                    <TablecellHeader sx={{ width: 100 }}>รหัสพนักงาน</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 300, position: "sticky", left: 0, backgroundColor: theme.palette.primary.dark, borderRight: "2px solid white" }}>ชื่อ-สกุล</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 150 }}>วันที่</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>ตารางเวลา</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>เวลาเข้า</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>เวลาออก</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>มาสาย</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>ออกก่อน</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>ขาดงาน</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>ล่วงเวลา</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 100 }}>เวลาทำงาน</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 150 }}>ข้อยกเว้น</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 150 }}>วันทำงานปกติ</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>วันหยุดประจำสัปดาห์</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>ชั่วโมงทำงาน+ล่วงเวลา</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>ล่วงเวลา ปกติ</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>ล่วงเวลา วันหยุดสุดสัปดาห์</TablecellHeader>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {attendants.map((row, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.employeeId}</TableCell>
                                                        <TableCell sx={{ textAlign: "center", position: "sticky", left: 0, backgroundColor: "white" }}>{row.name}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.date}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.schedule}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.timeIn ? row.timeIn : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.timeOut ? row.timeOut : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.late === "00:00" ? "-" : row.late}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.earlyLeave === "00:00" ? "-" : row.earlyLeave}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.absent ? "✔" : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.overtime ? row.overtime : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.workHours ? row.workHours : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.exception ? row.exception : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.normalDay ? row.normalDay : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.weekend ? row.weekend : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.totalWorkOvertime ? row.totalWorkOvertime : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.otNormal ? row.otNormal : "-"}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.otWeekend ? row.otWeekend : "-"}</TableCell>
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
            }

            {
                openSalary &&
                <Caluculate attendant={Object.values(grouped)} />
            }

            {
                openEmployee &&
                <EmployeeDetail />
            }
        </React.Fragment>
    );
}