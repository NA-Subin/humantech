import * as React from 'react';
import * as XLSX from "xlsx";
import { getDatabase, ref, push, onValue, set, update, get } from "firebase/database";
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
import { useTranslation } from 'react-i18next';
import UpdateEmployee from './UpdateEmployee';
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import AddLeave from './AddLeave';

export default function EmployeeDetail({ date }) {
    const { firebaseDB, domainKey } = useFirebase();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [employees, setEmployees] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [leave, setLeave] = useState([]);
    const fileInputRef = useRef(null);

    console.log("show employee : ", employee);

    const handleButtonClick = () => {
        fileInputRef.current.click(); // กดปุ่ม → เปิด file dialog
    };

    const translateLeaveName = (name, t) => {
        const mapping = {
            "ลาป่วย": t("leave.sickLeave"),
            "ลากิจได้รับค่าจ้าง": t("leave.personalLeavePaid"),
            "ลากิจไม่ได้รับค่าจ้าง": t("leave.personalLeaveUnpaid"),
            "ลาหยุดพักผ่อน": t("leave.annualLeave"),
            "ลาคลอดบุตร": t("leave.maternityLeave"),
            "ลาไปช่วยเหลือภรรยาที่คลอดบุตร": t("leave.paternitySupportLeave"),
            "ลาเพื่อเข้ารับการคัดเลือกทหาร": t("leave.militarySelectionLeave"),
            "ลาอุปสมบท": t("leave.ordinationLeave"),
            "ลาเพื่อทำหมัน": t("leave.sterilizationLeave"),
            "ลาฝึกอบรม": t("leave.trainingLeave"),
            "ลาเพื่อจัดการศพ": t("leave.funeralLeave"),
        };

        return mapping[name] || name;
    };

    React.useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        const unsubscribe = onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val();

            if (!leaveData) {
                setLeave([]);
            } else {
                const leaveArray = Object.values(leaveData);
                setLeave(leaveArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

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

    const importEmployeesFromExcel = async (file) => {
        try {
            // 1️⃣ โหลดไฟล์
            const workbook = new ExcelJS.Workbook();
            const buffer = await file.arrayBuffer();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.worksheets[0];
            const rows = worksheet.getSheetValues(); // ExcelJS row index เริ่มจาก 1

            if (!rows || rows.length < 3) {
                alert("ไฟล์ Excel ไม่มีข้อมูลเพียงพอ");
                return;
            }

            // 2️⃣ อ่าน header row
            const headerRow = rows[2]; // แถว header อยู่ที่ row 2 (row 1 = title)

            // 3️⃣ สร้าง mapping header -> key
            const columnMap = {
                employeeCode: [t("employeeDetail.employeeCode"), "Employee Code"],
                fullName: [t("employeeDetail.name"), "Name"],
                gender: [t("employeeDetail.gender"), "Gender"],
                department: [t("employeeDetail.department"), "Department"],
                section: [t("employeeDetail.section"), "Section"],
                absent: [t("employeeDetail.absent"), "Absent"],
                leavePersonal: [t("employeeDetail.leave.personal"), "Leave Personal"],
                leaveSick: [t("employeeDetail.leave.sick"), "Leave Sick"],
                leaveVacation: [t("employeeDetail.leave.vacation"), "Leave Vacation"],
                leaveTraining: [t("employeeDetail.leave.training"), "Leave Training"],
                leaveMaternity: [t("employeeDetail.leave.maternity"), "Leave Maternity"],
                leaveSterilization: [t("employeeDetail.leave.sterilization"), "Leave Sterilization"],
            };

            const columnIndex = {};
            headerRow.forEach((cell, idx) => {
                for (let key in columnMap) {
                    if (columnMap[key].includes(cell)) {
                        columnIndex[key] = idx; // idx เริ่มจาก 0
                    }
                }
            });

            // 4️⃣ อ่านข้อมูล rows ตั้งแต่ row 3 เป็นต้นไป
            const dataRows = rows.slice(3); // row index 3 = แถว data
            const leaveTypes = [
                { key: "leavePersonal", name: "ลากิจ", id: 0 },
                { key: "leaveSick", name: "ลาป่วย", id: 1 },
                { key: "leaveVacation", name: "ลาพักร้อน", id: 2 },
                { key: "leaveTraining", name: "ลาฝึกอบรม", id: 3 },
                { key: "leaveMaternity", name: "ลาคลอด", id: 4 },
                { key: "leaveSterilization", name: "ลาเพื่อทำหมัน", id: 5 },
            ];

            const formattedData = dataRows
                .filter(row => row) // skip empty row
                .map((row, idx) => ({
                    ID: idx, // จะ append ID ต่อ Firebase ต่อไป
                    employeecode: row[columnIndex.employeeCode] || "",
                    employname: row[columnIndex.fullName] || "",
                    department: row[columnIndex.department] || "",
                    section: row[columnIndex.section] || "",
                    sex: (() => {
                        const g = row[columnIndex.gender];
                        if (!g) return "";
                        if (["M", "ชาย", "Male"].includes(g)) return "ชาย";
                        if (["F", "หญิง", "Female"].includes(g)) return "หญิง";
                        return "";
                    })(),
                    absent: ["ใช่", "Yes", "TRUE", true].includes(row[columnIndex.absent]),
                    leave: leaveTypes.map(type => {
                        const value = row[columnIndex[type.key]] || "0/0";
                        const [num, max] = value.split("/").map(Number);
                        return {
                            id: type.id,
                            name: type.name,
                            number: num ?? 0,
                            max: max ?? 0,
                        };
                    }),
                }));

            // 5️⃣ โหลดข้อมูลเดิมจาก Firebase
            const refPath = ref(firebaseDB, `workgroup/company/${companyId}/employee`);
            const snapshot = await get(refPath);
            const existingData = snapshot.exists() ? snapshot.val() : {};
            const existingIDs = Object.keys(existingData).map(Number);
            const maxID = existingIDs.length ? Math.max(...existingIDs) : -1;

            // 6️⃣ append ID ต่อ Firebase
            const updates = {};
            formattedData.forEach((emp, idx) => {
                const newID = maxID + 1 + idx;
                updates[newID] = { ...emp, ID: newID };
            });

            setEmployee(prev => [...prev, ...formattedData.map((emp, idx) => ({ ...emp, id: maxID + 1 + idx }))]);

            await update(refPath, updates);

            alert(`นำเข้าข้อมูลพนักงานสำเร็จ! เพิ่มพนักงานใหม่ ${formattedData.length} คน`);
        } catch (err) {
            console.error("Import error:", err);
            alert("ไม่สามารถนำเข้าข้อมูลพนักงานได้");
        }
    };

    const exportEmployeesToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(t("employeeDetail.employees"));

        // 1️⃣ Columns ตาม Table
        worksheet.columns = [
            { header: t("employeeDetail.index"), key: "no", width: 8 },
            { header: t("employeeDetail.employeeCode"), key: "employeeCode", width: 15 },
            { header: t("employeeDetail.name"), key: "fullName", width: 30 },
            { header: t("employeeDetail.department"), key: "department", width: 30 },
            { header: t("employeeDetail.section"), key: "section", width: 30 },
            { header: t("employeeDetail.gender"), key: "gender", width: 10 },
            { header: t("employeeDetail.absent"), key: "absent", width: 15 },
            { header: t("employeeDetail.leave.personal"), key: "leavePersonal", width: 15 },
            { header: t("employeeDetail.leave.sick"), key: "leaveSick", width: 15 },
            { header: t("employeeDetail.leave.vacation"), key: "leaveVacation", width: 15 },
            { header: t("employeeDetail.leave.training"), key: "leaveTraining", width: 15 },
            { header: t("employeeDetail.leave.maternity"), key: "leaveMaternity", width: 15 },
            { header: t("employeeDetail.leave.sterilization"), key: "leaveSterilization", width: 15 },
        ];

        // 2️⃣ Title row
        worksheet.mergeCells(1, 1, 1, worksheet.columns.length);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = t("employeeDetail.employees");
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.font = { size: 16, bold: true };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDEBF7" } };
        worksheet.getRow(1).height = 30;

        // 3️⃣ Header row
        const headerRow = worksheet.addRow(worksheet.columns.map(c => c.header));
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // 4️⃣ Data rows
        employees.forEach((emp, index) => {
            const dataRow = {
                no: index + 1,
                employeeCode: emp.employeecode,
                fullName: `${emp.employname}`,
                gender: emp.gender === "M" ? "ชาย" : "หญิง",
                absent: emp.absent ?? 0,
                department: emp.department,
                section: emp.section,
                leavePersonal: `${emp.leave[0].number ?? 0}/${emp.leave[0].max ?? 0}`,
                leaveSick: `${emp.leave[1].number ?? 0}/${emp.leave[1].max ?? 0}`,
                leaveVacation: `${emp.leave[2].number ?? 0}/${emp.leave[2].max ?? 0}`,
                leaveTraining: `${emp.leave[3].number ?? 0}/${emp.leave[3].max ?? 0}`,
                leaveMaternity: `${emp.leave[4].number ?? 0}/${emp.leave[4].max ?? 0}`,
                leaveSterilization: `${emp.leave[5].number ?? 0}/${emp.leave[5].max ?? 0}`,
            };
            const newRow = worksheet.addRow(dataRow);
            newRow.height = 20;
            newRow.alignment = { horizontal: "center", vertical: "middle" };
            newRow.eachCell((cell) => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
        });

        // ✅ 5️⃣ Save file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${t("employeeDetail.employees")}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
    };


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
                                <Typography variant='h6' fontWeight="bold" gutterBottom>{t("employeeDetail.gender")}</Typography>
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
                                            <Typography variant='h6' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom> {t("employeeDetail.people")}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item size={6}>
                                        <WomanIcon sx={{ fontSize: 200, color: "#f48fb1", marginLeft: -5 }} />
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: -2 }}>
                                            <Typography variant='h3' fontWeight="bold" textAlign="center" sx={{ marginRight: 1, color: theme.palette.primary.dark }} gutterBottom>{employees.filter((item) => item.sex === "หญิง").length}</Typography>
                                            <Typography variant='h6' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom> {t("employeeDetail.people")}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item size={12}>
                                        <Typography variant='h6' fontWeight="bold" textAlign="center" color="error" gutterBottom>{t("employeeDetail.genderNotSet", { count: employees.filter((item) => item.sex === "").length })}</Typography>
                                    </Grid>
                                    <Grid item size={12}>
                                        <Typography variant='h5' fontWeight="bold" textAlign="center" sx={{ color: theme.palette.primary.dark }} gutterBottom>{t("employeeDetail.total")}</Typography>
                                        <Typography variant='h3' fontWeight="bold" textAlign="center" sx={{ marginTop: -2, color: theme.palette.primary.dark }} gutterBottom>{employees.length} {t("employeeDetail.people")}</Typography>
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
                                <Typography variant='h6' fontWeight="bold" gutterBottom>{t("employeeDetail.employees")}</Typography>
                            </Grid>
                            <Grid item size={12} textAlign="right" sx={{ marginTop: -5 }}>
                                <AddLeave />
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
                                                <TablecellHeader sx={{ width: 50 }}>{t("employeeDetail.index")}</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100, borderRight: "1px solid white" }}>{t("employeeDetail.employeeCode")}</TablecellHeader>
                                                <TablecellHeader sx={{ width: 300, position: "sticky", left: 0, backgroundColor: theme.palette.primary.dark, borderRight: "1px solid white" }}>{t("employeeDetail.name")}</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>{t("employeeDetail.gender")}</TablecellHeader>
                                                <TablecellHeader sx={{ width: 180 }}>{t("employeeDetail.absent")}</TablecellHeader>
                                                {leave.map((item, index) => (
                                                    <TablecellHeader key={index} sx={{ width: 200 }}>
                                                        {translateLeaveName(item.name, t)}
                                                    </TablecellHeader>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                employees.map((item, index) => (
                                                    <UpdateEmployee key={item.employeeId} item={item} index={index} leave={leave} date={date} />
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            <Grid item size={12} textAlign="right" sx={{ marginTop: 1 }}>
                                {/* <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    sx={{ marginRight: 2 }}
                                >
                                    {t("employeeDetail.importExcel")}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={exportEmployeesToExcel}
                                >
                                    {t("employeeDetail.exportExcel")}
                                </Button> */}
                                <Box display="flex" alignItems="center" justifyContent="right">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) importEmployeesFromExcel(file);
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        sx={{ marginRight: 2 }}
                                        onClick={handleButtonClick}
                                    >
                                        {t("employeeDetail.importExcel")}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={exportEmployeesToExcel}
                                    >
                                        {t("employeeDetail.exportExcel")}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}