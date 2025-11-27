import React, { useState, useEffect, use } from "react";
import '../../../App.css'
import { getDatabase, ref, push, onValue, set, update, get } from "firebase/database";
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../theme/style"
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InputAdornment, MenuItem, Tooltip } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../theme/TableExcel";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import SelectEmployeeGroup from "../../../theme/SearchEmployee";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { formatThaiFull, formatThaiShort } from "../../../theme/DateTH";
import InsertLoan from "./InsertLoan";

function ReportLoan({ tabState, setTabState, tabId }) {
    const { domain, company } = tabState;
    const { firebaseDB, domainKey } = useFirebase();
    // const companyName = localStorage.getItem("company");
    // const [searchParams] = useSearchParams();
    // const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editIncomepleteTime, setIncompleteTime] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [leave, setLeave] = useState([{ ID: 0, name: '' }]);
    const [docOT, setDocOT] = useState([]);
    const columns = [
        { label: "ประเภทการลา", key: "name", type: "text" },
        { label: "จำนวนวัน", key: "max", type: "text" }
    ];

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
        };

        window.addEventListener('resize', handleResize); // เพิ่ม event listener

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [dateArray, setDateArray] = useState([]);
    const [department, setDepartment] = useState("all-ทั้งหมด");
    const [section, setSection] = useState("all-ทั้งหมด");
    const [position, setPosition] = useState("all-ทั้งหมด");
    const [employee, setEmployee] = useState("all-ทั้งหมด");
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [month, setMonth] = useState(dayjs()); // ✅ เป็น dayjs object
    const handleDateChangeDate = (newValue) => {
        if (newValue) {
            setMonth(newValue); // ✅ newValue เป็น dayjs อยู่แล้ว
        }
    };

    const calculateDueDate = (dateString) => {
        if (!dateString) return "ไม่พบข้อมูลวันที่";

        const [day, month, year] = dateString.split("/").map(Number);
        const date = new Date(year, month - 1, day);

        date.setDate(date.getDate());

        const thaiMonths = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];

        const dueDay = date.getDate();
        const dueMonth = thaiMonths[date.getMonth()];
        const dueYear = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

        return `วันที่ ${dueDay} เดือน${dueMonth} พ.ศ.${dueYear}`;
    };

    const calculateRemaining = (billing, currentIndex) => {
        const total = billing.reduce((sum, b) => sum + b.amount, 0);

        // รวมเฉพาะยอดที่ชำระแล้ว (paid) และอยู่ก่อนหรืองวดปัจจุบัน
        const paidUpTo = billing
            .slice(0, currentIndex + 1)
            .filter(b => b.status === "paid")
            .reduce((sum, b) => sum + b.amount, 0);

        return total - paidUpTo;
    };

    function diffTimeString(timestart, timeend) {
        if (!timestart || !timeend) return "0 ชั่วโมง 0 นาที";

        // แยกชั่วโมงและนาที
        const [h1, m1] = timestart.split(":").map(Number);
        const [h2, m2] = timeend.split(":").map(Number);

        if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return "0 ชั่วโมง 0 นาที";

        let startMinutes = h1 * 60 + m1;
        let endMinutes = h2 * 60 + m2;

        // ถ้า end < start (ข้ามวัน)
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60;
        }

        let diffMinutes = endMinutes - startMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        return `${hours} ชั่วโมง ${minutes} นาที`;
    }

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = company?.split(":")[0];

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const departmentRef = ref(firebaseDB, `workgroup/company/${companyId}/department`);

        const unsubscribe = onValue(departmentRef, (snapshot) => {
            const departmentData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!departmentData) {
                setDepartments([{ ID: 0, name: '' }]);
            } else {
                setDepartments(departmentData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const sectionRef = ref(firebaseDB, `workgroup/company/${companyId}/section`);

        const unsubscribe = onValue(sectionRef, (snapshot) => {
            const sectionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!sectionData) {
                setSections([{ ID: 0, name: '' }]);
            } else {
                setSections(sectionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const positionRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        const unsubscribe = onValue(positionRef, (snapshot) => {
            const positionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!positionData) {
                setPositions([{ ID: 0, name: '' }]);
            } else {
                setPositions(positionData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!employeeData) {
                setEmployees([{ ID: 0, name: '' }]);
            } else {
                setEmployees(employeeData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!employees || employees.length === 0 || !month) return;

        let filteredEmployees = employees;

        // 🔹 กรองตามแผนก
        if (department && department !== "all-ทั้งหมด") {
            filteredEmployees = filteredEmployees.filter(e => e.department === department);
        }

        // 🔹 กรองตามส่วนงาน
        if (section && section !== "all-ทั้งหมด") {
            filteredEmployees = filteredEmployees.filter(e => e.section === section);
        }

        // 🔹 กรองตามตำแหน่ง
        if (position && position !== "all-ทั้งหมด") {
            filteredEmployees = filteredEmployees.filter(e => e.position === position);
        }

        // 🔹 กรองพนักงานเฉพาะราย
        if (employee && employee !== "all-ทั้งหมด") {
            const empId = Number(employee.split("-")[0]);
            filteredEmployees = filteredEmployees.filter(e => e.ID === empId);
        }

        // 🔹 กรอง loan ตามเดือนที่เลือก (จาก DatePicker)
        const selectedMonth = month.month() + 1; // month() เริ่มจาก 0
        const selectedYear = month.year();

        filteredEmployees = filteredEmployees
            .map(emp => ({
                ...emp,
                loan: (emp.loan || []).filter(ln => {
                    if (!ln.recievedate) return false;
                    const [d, m, y] = ln.recievedate.split("/").map(Number);
                    // ตรวจสอบเดือนและปี
                    return m === selectedMonth && y === selectedYear;
                }),
            }))
            .filter(emp => emp.loan.length > 0); // เอาเฉพาะคนที่มี loan ในเดือนนั้น

        console.log("Filtered Employees:", filteredEmployees);
        setDateArray(filteredEmployees);
    }, [employees, department, section, position, employee, month]);

    const year = month.year();   // จาก dayjs, เช่น 2025
    const m = month.month();     // จาก dayjs, 0-11

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

            // ค้นหา company ตาม companyId
            const found = list.find((item, index) => String(index) === companyId);
            if (found) {
                setSelectedCompany(found);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    console.log("dateArray:", dateArray);

    const handleApprove = (empID, loanID, newID) => {
        ShowConfirm(
            "อนุมัติการชำระเงินกู้",
            "คุณต้องการอนุมัติเอกสารการชำระเงินกู้นี้หรือไม่?",
            async () => {
                const billingRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${empID}/loan/${loanID}/billing/${newID}`
                );
                update(billingRef, {
                    status: "paid",
                    approveBy: "HR",
                    approveDate: dayjs().format("DD/MM/YYYY"),
                    approveTime: dayjs().format("HH:mm:ss")
                });

                const loanRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${empID}/loan/${loanID}/billing`
                );

                // ✅ ดึงข้อมูล billing ทั้งหมดมาดูว่า paid ครบไหม
                const snapshot = await get(loanRef);
                if (snapshot.exists()) {
                    const allBilling = Object.values(snapshot.val());
                    const allPaid = allBilling.every(bill => bill.status === "paid");

                    if (allPaid) {
                        const loanStatusRef = ref(
                            firebaseDB,
                            `workgroup/company/${companyId}/employee/${empID}/loan/${loanID}`
                        );

                        // ✅ ถ้า paid ครบทุกงวดแล้วให้เปลี่ยน loan เป็น success
                        await update(loanStatusRef, { status: "success" });
                    }
                }
            },
            () => {
                console.log("ยกเลิกการอนุมัติ");
            }
        );
    };

    const handleCancel = (empID, loanID, newID) => {
        ShowConfirm(
            "ไม่อนุมัติการชำระเงินกู้",
            "คุณต้องการปฏิเสธเอกสารการชำระเงินกู้นี้หรือไม่?",
            () => {
                const leaveRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${empID}/loan/${loanID}/billing/${newID}`
                );
                update(leaveRef, {
                    status: "ไม่อนุมัติ",
                    approveBy: "HR",
                    approveDate: dayjs().format("DD/MM/YYYY"),
                    approveTime: dayjs().format("HH:mm:ss")
                });
            },
            () => {
                console.log("ยกเลิกการปฏิเสธ");
            }
        );
    };

    return (
        <Container maxWidth="xl" sx={{ p: 5, width: windowWidth - 290 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>เอกสารขอกู้เงิน (Loan request documents)</Typography>
                    </Grid>
                    <Grid item size={12} sx={{ display: "flex", alignItems: "center", justifyContent: "right" }}>
                        <Box sx={{ marginTop: -10, marginRight: 2 }}>
                            <InsertLoan companyName={company} />
                        </Box>
                        <Paper sx={{ width: "20%", marginTop: -10 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                <DatePicker
                                    openTo="month"
                                    views={["year", "month"]}
                                    value={month}
                                    format="MMMM"
                                    onChange={handleDateChangeDate}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            fullWidth: true,
                                            inputProps: {
                                                value: month ? month.format("MMMM") : "",
                                                readOnly: true,
                                            },
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <b>เลือกเดือน :</b>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: "16px",
                                                    height: "40px",
                                                    padding: "10px",
                                                    fontWeight: "bold",
                                                },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4, height: "75vh" }}>
                <Box>
                    <SelectEmployeeGroup
                        department={department}
                        setDepartment={setDepartment}
                        departments={departments}
                        section={section}
                        setSection={setSection}
                        sections={sections}
                        position={position}
                        setPosition={setPosition}
                        positions={positions}
                        employee={employee}
                        setEmployee={setEmployee}
                        employees={employees}
                    />
                    {/* <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลเอกสารขอลา</Typography>
                    <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} /> */}
                    <Grid container spacing={2}>
                        <Grid item size={12}>
                            <TableContainer component={Paper} textAlign="center" sx={{ height: "55vh" }}>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "5px" }, width: "1174px" }}>
                                    <TableHead
                                        sx={{
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 2,
                                            backgroundColor: theme.palette.primary.dark,
                                        }}
                                    >
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader sx={{ width: 100 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader>วันที่และเวลา</TablecellHeader>
                                            <TablecellHeader sx={{ width: 100 }}>เงินต้น</TablecellHeader>
                                            <TablecellHeader sx={{ width: 100 }}>ดอกเบี้ย</TablecellHeader>
                                            <TablecellHeader sx={{ width: 100 }}>ยอดชำระ</TablecellHeader>
                                            <TablecellHeader sx={{ width: 100 }}>ยอดคงเหลือ</TablecellHeader>
                                            <TablecellHeader sx={{ width: 300 }}>สถานะ</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            dateArray.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={7}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                dateArray.map((emp, index) => (
                                                    <React.Fragment>
                                                        {
                                                            emp.loan !== undefined &&
                                                            <TableRow>
                                                                <TableCell sx={{ textAlign: "left", height: "50px", backgroundColor: theme.palette.primary.light }} colSpan={7}>
                                                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", paddingLeft: 2 }}>
                                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 2 }} gutterBottom>รหัสพนักงาน : {emp.employeecode}</Typography>
                                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>{emp.employname}</Typography>
                                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>({emp.nickname})</Typography>
                                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>
                                                                            ฝ่ายงาน {emp.department.split("-")[1].startsWith("ฝ่าย")
                                                                                ? emp.department.split("-")[1].replace("ฝ่าย", "").trim()
                                                                                : emp.department.split("-")[1]}
                                                                        </Typography>
                                                                        {
                                                                            emp.section.split("-")[1] !== "ไม่มี" &&
                                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>ส่วนงาน {emp.section.split("-")[1]}</Typography>
                                                                        }
                                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ตำแหน่ง {emp.position.split("-")[1]}</Typography>
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        }
                                                        {
                                                            emp.loan === undefined ? "" :
                                                                emp.loan.map((l, index) => (
                                                                    <React.Fragment>
                                                                        <TableRow key={index}>
                                                                            <TableCell sx={{ textAlign: "left", backgroundColor: theme.palette.primary.light }} colSpan={7}>
                                                                                <Box sx={{ marginLeft: 2, marginRight: 2 }}>
                                                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ขอกู้เงิน ณ {calculateDueDate(l.recievedate)}</Typography>
                                                                                </Box>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        {l.billing === undefined ? "" :
                                                                            l.billing.map((bill, index) => (
                                                                                <TableRow key={index}>
                                                                                    <TableCell sx={{ textAlign: "center" }}>งวดที่ {index + 1}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "left" }}>
                                                                                        <Box sx={{ ml: 2 }}>{calculateDueDate(bill.mustpaydate)}</Box>
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                                        {new Intl.NumberFormat("en-US", {
                                                                                            minimumFractionDigits: 2,
                                                                                            maximumFractionDigits: 2
                                                                                        }).format(bill.amount)}
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                                        {new Intl.NumberFormat("en-US", {
                                                                                            minimumFractionDigits: 2,
                                                                                            maximumFractionDigits: 2
                                                                                        }).format(bill.interest)}
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                                        {new Intl.NumberFormat("en-US", {
                                                                                            minimumFractionDigits: 2,
                                                                                            maximumFractionDigits: 2
                                                                                        }).format(bill.amount + bill.interest)}
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                                        {new Intl.NumberFormat("en-US", {
                                                                                            minimumFractionDigits: 2,
                                                                                            maximumFractionDigits: 2
                                                                                        }).format(
                                                                                            calculateRemaining(l.billing, index)
                                                                                        )}
                                                                                    </TableCell>
                                                                                    <TableCell sx={{ textAlign: "left" }}>
                                                                                        <Box sx={{ marginLeft: 2, marginRight: 2, marginTop: l.status === "pending" && 1.5 }}>
                                                                                            <Box display="flex" justifyContent="left" alignItems="center" sx={{ mt: bill.status === "paid" ? 0 : 0.5 }}>
                                                                                                <Typography variant="subtitle2" gutterBottom>สถานะ : </Typography>
                                                                                                <Typography
                                                                                                    variant="subtitle2"
                                                                                                    sx={{
                                                                                                        fontWeight: "bold",
                                                                                                        marginLeft: 1,
                                                                                                        color: bill.status === "pending" ? theme.palette.error.main
                                                                                                            : bill.status === "paid" ? theme.palette.success.main
                                                                                                                : theme.palette.warning.main
                                                                                                    }}
                                                                                                    gutterBottom
                                                                                                >
                                                                                                    {bill.status === "paid" ? "ชำระเรียบร้อยแล้ว" : bill.status === "pending" ? "ยังไม่ได้ชำระ" : "ยอดค้างชำระถูกโอนไปงวดถัดไป"}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                            {
                                                                                                bill.status === "pending" ?
                                                                                                    <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center ", marginTop: -4.5 }}>
                                                                                                        <Tooltip title="ไม่อนุมัติ" placement="top">
                                                                                                            <IconButton size="small" onClick={() => handleCancel(emp.ID, l.ID, bill.ID)} sx={{ mb: -0.5 }} >
                                                                                                                <InsertDriveFileIcon sx={{ color: theme.palette.error.main, fontSize: "28px" }} />
                                                                                                                <CloseIcon sx={{ color: "white", fontSize: "16px", fontWeight: "bold", marginLeft: -3, marginTop: 1 }} />
                                                                                                            </IconButton>
                                                                                                        </Tooltip>
                                                                                                        <Tooltip title="อนุมัติ" placement="top">
                                                                                                            <IconButton size="small" onClick={() => handleApprove(emp.ID, l.ID, bill.ID)} sx={{ mb: -0.5 }} >
                                                                                                                <InsertDriveFileIcon sx={{ color: theme.palette.primary.main, fontSize: "28px" }} />
                                                                                                                <DoneIcon sx={{ color: "white", fontSize: "16px", fontWeight: "bold", marginLeft: -3, marginTop: 1 }} />
                                                                                                            </IconButton>
                                                                                                        </Tooltip>
                                                                                                    </Box>
                                                                                                    :
                                                                                                    <Typography variant="subtitle2" sx={{ marginTop: -0.5 }} gutterBottom>อนุมัติโดย : {bill.approveBy}</Typography>
                                                                                            }
                                                                                        </Box>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                    </React.Fragment>
                                                                ))
                                                        }
                                                    </React.Fragment>
                                                ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    )
}

export default ReportLoan