import React, { useState, useEffect, use } from "react";
import '../../../App.css'
import { getDatabase, ref, push, onValue, set, update, get, serverTimestamp } from "firebase/database";
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
import { formatThaiShort } from "../../../theme/DateTH";

const ReportTime = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editIncomepleteTime, setIncompleteTime] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [leave, setLeave] = useState([{ ID: 0, name: '' }]);
    const [docTime, setDocTime] = useState([]);
    const columns = [
        { label: "ประเภทการลา", key: "name", type: "text" },
        { label: "จำนวนวัน", key: "max", type: "text" }
    ];

    const [dateArray, setDateArray] = useState([]);
    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");
    const [position, setPosition] = useState("");
    const [employee, setEmployee] = useState("");
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
    const companyId = companyName?.split(":")[0];

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

        if (department && department !== "all-ทั้งหมด") {
            filteredEmployees = filteredEmployees.filter(e => e.department === department);
        }

        if (section && section !== "all-ทั้งหมด") {
            filteredEmployees = filteredEmployees.filter(e => e.section === section);
        }

        if (position && position !== "all-ทั้งหมด") {
            filteredEmployees = filteredEmployees.filter(e => e.position === position);
        }

        if (employee && employee !== "all-ทั้งหมด") {
            const empId = Number(employee.split("-")[0]);
            filteredEmployees = filteredEmployees.filter(e => e.ID === empId);
        }

        console.log("Filtered Employees:", filteredEmployees);
        setDateArray(filteredEmployees);
    }, [employees, department, section, position, employee]);

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

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const docTimeRef = ref(firebaseDB, `workgroup/company/${companyId}/documenttime/${year}/${m + 1}`);

        const unsubscribe = onValue(docTimeRef, (snapshot) => {
            const docTimeData = snapshot.val() || {};

            // เอา dateArray มารวมกับข้อมูลลา
            const merged = dateArray.map((emp) => {
                // หา time records ของพนักงานจาก deptid
                const empTime = Object.values(docTimeData).filter(
                    (time) => time.empid === emp.ID
                );

                return {
                    ...emp,
                    documentTime: empTime.length > 0 ? empTime : []  // เก็บ documentTime ลงไป
                };
            });

            const hasTime = merged.some(emp => emp.documentTime.length > 0);

            setDocTime(hasTime ? merged : []);
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, year, m, dateArray]);

    console.log("Doc Time : ", docTime);

    const handleApprove = (newID, date, type, checkin, checkout, empid, attendantID, workshift) => {
        ShowConfirm(
            "อนุมัติเอกสาร",
            "คุณต้องการอนุมัติเอกสารนี้หรือไม่?",
            async () => {
                const attendant = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${empid}/attendant/${year}/${m + 1}`
                );

                // ✅ ใช้ get แทน onValue
                const snapshot = await get(attendant);
                const data = snapshot.val() || {};
                const length = Object.keys(data).length;

                // อัปเดต documenttime
                const addTimeRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/documenttime/${year}/${m + 1}/${newID}`
                );

                await update(addTimeRef, {
                    status: "อนุมัติ",
                    approveBy: "HR",
                    approveDate: dayjs().format("DD/MM/YYYY"),
                    approveTime: dayjs().format("HH:mm:ss")
                });

                // อัปเดต attendant (ใช้ attendantID ถ้ามี, ถ้าไม่มีก็ใช้ length+1)
                const newIDValue = attendantID ? attendantID : length;

                const timeDetail = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${empid}/attendant/${year}/${m + 1}/${newIDValue}`
                );

                if (type === "ขอแก้ไขเวลาเข้างาน") {
                    await update(timeDetail, {
                        ID: newIDValue,
                        DDI: dayjs(date, "DD/MM/YYYY").format("DD"),
                        MMI: dayjs(date, "DD/MM/YYYY").format("MM"),
                        YYYYI: dayjs(date, "DD/MM/YYYY").format("YYYY"),
                        checkin: checkin,
                        datecodeI: dayjs(date, "DD/MM/YYYY").format("YYYY.MMDD"),
                        datein: dayjs(date, "DD/MM/YYYY").format("DD/MM/YYYY"),
                        shift: workshift,
                        status: attendantID ? 2 : 1,
                        unixin: serverTimestamp(),
                    });
                } else {
                    await update(timeDetail, {
                        ID: newIDValue,
                        DDO: dayjs(date, "DD/MM/YYYY").format("DD"),
                        MMO: dayjs(date, "DD/MM/YYYY").format("MM"),
                        YYYYO: dayjs(date, "DD/MM/YYYY").format("YYYY"),
                        checkout: checkout,
                        datecodeO: dayjs(date, "DD/MM/YYYY").format("YYYY.MMDD"),
                        dateout: dayjs(date, "DD/MM/YYYY").format("DD/MM/YYYY"),
                        shift: workshift,
                        status: attendantID ? 2 : 1,
                        unuxout: serverTimestamp(),
                    });
                }

                const attendants = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/documenttime/${year}/${m + 1}`
                );

                // ✅ ใช้ get แทน onValue
                const snapshots = await get(attendants);
                const datas = snapshots.val() || {};
                const datadetail = Object.entries(datas); // [ [key, value], ... ]

                // ✅ loop หา documenttime ที่ตรง datein แล้วอัปเดต attendantID
                for (const [key, value] of datadetail) {
                    if (value.datein === date) {
                        const updateRef = ref(
                            firebaseDB,
                            `workgroup/company/${companyId}/documenttime/${year}/${m + 1}/${key}`
                        );

                        await update(updateRef, {
                            attendantID: newIDValue,
                        });
                    }
                }
            },
            () => {
                console.log("ยกเลิกการอนุมัติ");
            }
        );
    };

    const handleCancel = (newID, date, type, checkin, checkout, empid, attendantID, workshift) => {
        ShowConfirm(
            "ไม่อนุมัติเอกสาร",
            "คุณต้องการปฏิเสธเอกสารนี้หรือไม่?",
            () => {
                const leaveRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/documenttime/${year}/${m + 1}/${newID}`
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
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>เอกสารขอเพิ่มเวลา (Document requesting time)</Typography>
                    </Grid>
                    <Grid item size={12} sx={{ display: "flex", alignItems: "center", justifyContent: "right" }}>
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
            <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4 }}>
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
                            <TableContainer component={Paper} textAlign="center">
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "100%" }}>
                                    <TableHead
                                        sx={{
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 2,
                                            backgroundColor: theme.palette.primary.dark,
                                        }}
                                    >
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader sx={{ width: 60 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader sx={{ width: 150 }}>วันที่</TablecellHeader>
                                            <TablecellHeader sx={{ width: 120 }}>เวลา</TablecellHeader>
                                            <TablecellHeader sx={{ width: 200 }}>รายละเอียด</TablecellHeader>
                                            <TablecellHeader sx={{ width: 230 }}>สถานะ</TablecellHeader>
                                            <TablecellHeader sx={{ width: 260 }}>หมายเหตุ</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            docTime.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={6}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                docTime.map((emp, index) => (
                                                    <React.Fragment>
                                                        {
                                                            emp.documentTime.length !== 0 &&
                                                            <TableRow>
                                                                <TableCell sx={{ textAlign: "left", height: "50px", backgroundColor: theme.palette.primary.light }} colSpan={6}>
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
                                                            emp.documentTime.map((date, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>วันที่ {formatThaiShort(dayjs(date.datein, "DD/MM/YYYY"))}</TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {date.timerequesttype === "ขอแก้ไขเวลาเข้างาน" ? date.checkin : date.timerequesttype === "ขอแก้ไขเวลาเลิกงาน" ? date.checkout : ""} น.
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {date.timerequesttype}
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "left" }}>
                                                                        <Box sx={{ marginLeft: 2, marginRight: 2, marginTop: date.status === "รออนุมัติ" && 1.5 }}>
                                                                            <Box display="flex" justifyContent="left" alignItems="center">
                                                                                <Typography variant="subtitle2" gutterBottom>สถานะ : </Typography>
                                                                                <Typography
                                                                                    variant="subtitle2"
                                                                                    sx={{
                                                                                        fontWeight: "bold",
                                                                                        marginLeft: 1,
                                                                                        color: date.status === "รออนุมัติ" ? theme.palette.warning.main
                                                                                            : date.status === "อนุมัติ" ? theme.palette.success.main
                                                                                                : theme.palette.error.main
                                                                                    }}
                                                                                    gutterBottom
                                                                                >
                                                                                    {date.status}
                                                                                </Typography>
                                                                            </Box>
                                                                            {
                                                                                date.status === "รออนุมัติ" ?
                                                                                    <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center ", marginTop: -4.5 }}>
                                                                                        <Tooltip title="ไม่อนุมัติ" placement="top">
                                                                                            <IconButton size="small" onClick={() => handleCancel(date.ID, date.datein, date.timerequesttype, date.checkin, date.checkout, emp.ID, date.attendantID, emp.workshift)} >
                                                                                                <InsertDriveFileIcon sx={{ color: theme.palette.error.main, fontSize: "28px" }} />
                                                                                                <CloseIcon sx={{ color: "white", fontSize: "16px", fontWeight: "bold", marginLeft: -3, marginTop: 1 }} />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                        <Tooltip title="อนุมัติ" placement="top">
                                                                                            <IconButton size="small" onClick={() => handleApprove(date.ID, date.datein, date.timerequesttype, date.checkin, date.checkout, emp.ID, date.attendantID, emp.workshift)} >
                                                                                                <InsertDriveFileIcon sx={{ color: theme.palette.primary.main, fontSize: "28px" }} />
                                                                                                <DoneIcon sx={{ color: "white", fontSize: "16px", fontWeight: "bold", marginLeft: -3, marginTop: 1 }} />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                    </Box>
                                                                                    :
                                                                                    <Typography variant="subtitle2" sx={{ marginTop: -0.5 }} gutterBottom>อนุมัติโดย : {date.approveBy}</Typography>
                                                                            }
                                                                        </Box>
                                                                    </TableCell>
                                                                    <TableCell sx={{ textAlign: "center" }}>
                                                                        {date.note}
                                                                    </TableCell>
                                                                </TableRow>
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

export default ReportTime