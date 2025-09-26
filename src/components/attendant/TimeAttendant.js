import * as React from 'react';
import * as XLSX from "xlsx";
import { getDatabase, ref, push, onValue, set, get, update, child } from "firebase/database";
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import theme from '../../theme/theme';
import { Item, ItemReport, TablecellHeader } from '../../theme/style';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { useState } from 'react';
import { Button, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts';
import { useRef } from 'react';
import EmployeeDetail from './Employee';
import Caluculate from './Calculate';
import { useTranslation } from 'react-i18next';
import { ShowConfirm, ShowError, ShowSuccess } from '../../sweetalert/sweetalert';

export default function TimeAttendant({ date }) {
    const { firebaseDB, domainKey } = useFirebase();
    const { t } = useTranslation();
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
                    return itemDate.isSame(date, "month") && item.status !== "ยกเลิก"; // เทียบเดือนเดียวกัน
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
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                const columnMap = {
                    employeeId: ["รหัสพนักงาน", "Employee ID"],
                    name: ["ชื่อ-สกุล", "Name"],
                    date: ["วันที่", "Date"],
                    schedule: ["ตารางเวลา", "Schedule"],
                    timeIn: ["เวลาเข้า", "Time In"],
                    timeOut: ["เวลาออก", "Time Out"],
                    late: ["มาสาย", "Late"],
                    earlyLeave: ["ออกก่อน", "Early Leave"],
                    absent: ["ขาดงาน", "Absent"],
                    overtime: ["ล่วงเวลา", "Overtime"],
                    workHours: ["เวลาทำงาน", "Work Hours"],
                    exception: ["ข้อยกเว้น", "Exception"],
                    normalDay: ["วันทำงานปกติ", "Normal Day"],
                    weekend: ["วันหยุดประจำสัปดาห์", "Weekend"],
                    totalWorkOvertime: ["ชั่วโมงทำงาน+ล่วงเวลา", "Total Hours"],
                    otNormal: ["ล่วงเวลา ปกติ", "OT Normal"],
                    otWeekend: ["ล่วงเวลา วันหยุดสุดสัปดาห์", "OT Weekend"]
                };

                const getValue = (row, keys) => {
                    for (let key of keys) {
                        if (row[key] !== undefined) return row[key];
                    }
                    return "";
                };

                const formatTime = (value) => {
                    if (!value || value === "" || value === null) return "00:00";
                    if (typeof value === "number") {
                        const totalMinutes = Math.round(value * 24 * 60);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
                    }
                    if (typeof value === "string" && /^\d{1,2}:\d{2}$/.test(value)) return value;
                    return "00:00";
                };

                // อ่านข้อมูลเดิมจาก Firebase เพื่อหาค่า ID สูงสุด
                const refPath = ref(firebaseDB, `workgroup/company/${companyId}/attendant`);
                const snapshot = await get(refPath);
                const existingData = snapshot.exists() ? snapshot.val() : {};
                const existingIDs = Object.keys(existingData).map(Number);
                const maxID = existingIDs.length ? Math.max(...existingIDs) : -1; // -1 ถ้าไม่มีข้อมูลเดิม

                // map ข้อมูลและสร้าง ID ต่อเนื่อง
                const formattedData = jsonData.map((row, index) => {
                    const newID = maxID + 1 + index;
                    return {
                        id: newID,
                        employeeId: getValue(row, columnMap.employeeId),
                        name: getValue(row, columnMap.name),
                        date: getValue(row, columnMap.date),
                        schedule: getValue(row, columnMap.schedule),
                        timeIn: getValue(row, columnMap.timeIn),
                        timeOut: getValue(row, columnMap.timeOut),
                        late: formatTime(getValue(row, columnMap.late)),
                        earlyLeave: formatTime(getValue(row, columnMap.earlyLeave)),
                        absent: ["True", true, "TRUE", "1"].includes(getValue(row, columnMap.absent)),
                        overtime: getValue(row, columnMap.overtime),
                        workHours: getValue(row, columnMap.workHours),
                        exception: getValue(row, columnMap.exception),
                        normalDay: getValue(row, columnMap.normalDay),
                        weekend: getValue(row, columnMap.weekend),
                        totalWorkOvertime: getValue(row, columnMap.totalWorkOvertime),
                        otNormal: getValue(row, columnMap.otNormal),
                        otWeekend: getValue(row, columnMap.otWeekend)
                    };
                });

                // เตรียม object สำหรับ update
                const updates = {};
                formattedData.forEach(item => {
                    updates[String(item.id)] = item;
                });

                // update Firebase
                await update(refPath, updates);

                alert("นำเข้าข้อมูลสำเร็จ! ข้อมูลใหม่จะต่อจาก ID ปัจจุบัน");
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการนำเข้า:", error);
                alert("ไม่สามารถนำเข้าข้อมูลได้");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleExport = async () => {
        try {
            const refPath = ref(firebaseDB, `workgroup/company/${companyId}/attendant`);
            const snapshot = await get(refPath);

            if (!snapshot.exists()) {
                alert(t("noDataFound")); // ใช้ข้อความแปลได้ด้วย
                return;
            }

            const attendants = snapshot.val();

            // ✅ ใช้ t() สำหรับ header แต่ละคอลัมน์
            const exportData = attendants.map((item) => ({
                [t("employeeId")]: item.employeeId,
                [t("name")]: item.name,
                [t("date")]: item.date,
                [t("schedule")]: item.schedule,
                [t("timeIn")]: item.timeIn,
                [t("timeOut")]: item.timeOut,
                [t("late")]: item.late,
                [t("earlyLeave")]: item.earlyLeave,
                [t("absent")]: item.absent ? t("true") : t("false"),
                [t("overtime")]: item.overtime,
                [t("workHours")]: item.workHours,
                [t("exception")]: item.exception,
                [t("normalDay")]: item.normalDay,
                [t("weekend")]: item.weekend,
                [t("totalWorkOvertime")]: item.totalWorkOvertime,
                [t("otNormal")]: item.otNormal,
                [t("otWeekend")]: item.otWeekend,
            }));

            // ✅ สร้าง Sheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // ✅ สร้าง Workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendant");

            // ✅ ดาวน์โหลดเป็น Excel
            XLSX.writeFile(workbook, "attendant_export.xlsx");

        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการ Export:", error);
            alert(t("exportError"));
        }
    };

    const handleDelete = (id) => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/attendant`);

        ShowConfirm(
            t("deleteScanData"),
            t("confirmDelete"),
            () => {
                update(child(companiesRef, String(id)), {
                    status: "ยกเลิก",
                })
                    .then(() => {
                        ShowSuccess(t("success"), t("ok"));
                    })
                    .catch((error) => {
                        ShowError(t("error"), t("ok"));
                    });
            },
            (error) => {
                console.log("เกิดข้อผิดพลาดในการบันทึก:", error);
            },
            t("ok"),
            t("cancel")
        );
    }

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
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>{t("scanInfo")}</Typography>
                                <AlarmIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{attendants.length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>{t("times")}</Typography>
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
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>{t("allEmployees")}</Typography>
                                <BadgeIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{employees.length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>{t("people")}</Typography>
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
                                <Typography variant="subtitle1" sx={{ color: "white", marginTop: -1 }} fontWeight="bold" gutterBottom>{t("calculateSalary")}</Typography>
                                <CurrencyExchangeIcon sx={{ color: "white", fontSize: "65px", marginTop: -1, marginBottom: -2 }} />
                            </Grid>
                            <Grid item size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="h3" sx={{ marginTop: 1, marginRight: 1 }} fontWeight="bold" gutterBottom>{Object.values(grouped).length}</Typography>
                                <Typography variant="h6" sx={{ marginTop: 3 }} fontWeight="bold" gutterBottom>{t("record")}</Typography>
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
                                    <Typography variant='h6' fontWeight="bold" gutterBottom>{t("scanInfo")}</Typography>
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
                                            {t("importExcel")}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={handleExport}
                                        >
                                            {t("exportExcel")}
                                        </Button>
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
                                                    <TablecellHeader sx={{ width: 100 }}>{t("employeeId")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 300, position: "sticky", left: 0, backgroundColor: theme.palette.primary.dark, borderRight: "2px solid white" }}>{t("name")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 150 }}>{t("date")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>{t("schedule")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>{t("timeIn")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>{t("timeOut")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>{t("late")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>{t("earlyLeave")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>{t("absent")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 120 }}>{t("overtime")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 100 }}>{t("workHours")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 150 }}>{t("exception")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 150 }}>{t("normalDay")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>{t("weekend")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>{t("totalWorkOvertime")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>{t("otNormal")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 180 }}>{t("otWeekend")}</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 80, position: "sticky", right: 0, backgroundColor: theme.palette.primary.dark, borderLeft: "2px solid white" }} />
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
                                                        <TableCell sx={{ textAlign: "center", position: "sticky", right: 0, backgroundColor: "white", borderLeft: "2px solid white" }}>
                                                            <Tooltip title={t("deleteScanData")} placement="left">
                                                                <Button
                                                                    variant="contained"
                                                                    sx={{ height: 25 }}
                                                                    color="error"
                                                                    size="small"
                                                                    endIcon={<DeleteOutlineIcon />}
                                                                    onClick={() => handleDelete(row.ID)}
                                                                >
                                                                    {t("delete")}
                                                                </Button>
                                                            </Tooltip>
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