import React, { useState, useEffect, use } from "react";
import '../../../../App.css'
import { getDatabase, ref, push, onValue, set } from "firebase/database";
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
import theme from "../../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../../theme/style"

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Checkbox, FormControlLabel, FormGroup, InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../../sweetalert/sweetalert";
import { useFirebase } from "../../../../server/ProjectFirebaseContext";
import SelectEmployeeGroup from "../../../../theme/SearchEmployee";
import dayjs from "dayjs";
import { formatThaiShort } from "../../../../theme/DateTH";
dayjs.locale("en"); // ใส่ตรงนี้ก่อนใช้ dayjs.format("dddd")

const DayOffDetail = (props) => {
    const { department, section, position, employee, dateArray } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editIncomepleteTime, setIncompleteTime] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [leave, setLeave] = useState([{ ID: 0, name: '' }]);
    const [workshift, setWorkshift] = useState([]);
    const columns = [
        { label: "ประเภทการลา", key: "name", type: "text" },
        { label: "จำนวนวัน", key: "max", type: "text" }
    ];

    const dayColors = {
        "จันทร์": "#FFFDE7",   // เหลืองพาสเทลอ่อนมาก
        "อังคาร": "#FCE4EC",  // ชมพูพาสเทลอ่อนมาก
        "พุธ": "#E8F5E9",      // เขียวพาสเทลอ่อนมาก
        "พฤหัสบดี": "#FFF3E0", // ส้มพาสเทลอ่อนมาก
        "ศุกร์": "#E1F5FE",    // ฟ้าพาสเทลอ่อนมาก
        "เสาร์": "#F3E5F5",    // ม่วงพาสเทลอ่อนมาก
        "อาทิตย์": "#FFEBEE"   // แดงพาสเทลอ่อนมาก
    };

    console.log("workshift : ", workshift);
    const [employees, setEmployees] = useState([]);

    const attendantRows = [];

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

    const DayOffDetail = dateArray.map((emp) => ({
        ...emp,
        dateHistory: emp.dateHistory.filter((d) => d.holidayType !== "work")
    }));

    console.log("DayOffDetail : ", DayOffDetail);

    console.log("attendantRows : ", attendantRows);

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

        const workshiftRef = ref(firebaseDB, `workgroup/company/${companyId}/workshift`);

        const unsubscribe = onValue(workshiftRef, (snapshot) => {
            const workshiftData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!workshiftData) {
                setWorkshift([{ ID: 0, name: '' }]);
            } else {
                setWorkshift(workshiftData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        const invalidMessages = [];

        leave.forEach((row, rowIndex) => {
            columns.forEach((col) => {
                const value = row[col.key];

                if (value === "") {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: กรุณากรอก "${col.label}"`);
                    return;
                }

                if (col.type === "number" && isNaN(Number(value))) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ต้องเป็นตัวเลข`);
                    return;
                }

                if (
                    col.type === "select" &&
                    !col.options?.some(opt => opt.value === value)
                ) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ไม่ตรงกับตัวเลือกที่กำหนด`);
                    return;
                }
            });
        });

        // ✅ ตรวจสอบว่า level.name ซ้ำหรือไม่
        const names = leave.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
            invalidMessages.push(`มีชื่อ: ${[...new Set(duplicates)].join(", ")} ซ้ำกัน`);
        }

        // ❌ แสดงคำเตือนถ้ามีข้อผิดพลาด
        if (invalidMessages.length > 0) {
            ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
            return;
        }

        // ✅ บันทึกเมื่อผ่านเงื่อนไข
        set(companiesRef, leave)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setIncompleteTime(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val() || [{ ID: 0, name: '' }];
            setLeave(leaveData);
            setIncompleteTime(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    return (
        <React.Fragment>
            <Grid item size={12}>
                <TableContainer component={Paper} textAlign="center">
                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1080px" }}>
                        <TableHead
                            sx={{
                                position: "sticky",
                                top: 0,
                                zIndex: 2,
                                backgroundColor: theme.palette.primary.dark,
                            }}
                        >
                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                <TablecellHeader sx={{ width: 280 }}>วันที่</TablecellHeader>
                                <TablecellHeader sx={{ width: 180 }}>ชื่อวันหยุด</TablecellHeader>
                                <TablecellHeader sx={{ width: 220 }}>สถานะ</TablecellHeader>
                                <TablecellHeader sx={{ width: 320 }}>หมายเหตุ</TablecellHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                DayOffDetail.length === 0 ?
                                    <TableRow>
                                        <TablecellNoData colSpan={6}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                    </TableRow>
                                    :
                                    DayOffDetail.map((emp, index) => (
                                        <React.Fragment>
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
                                            {
                                                emp.dateHistory.map((date, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {formatThaiShort(dayjs(date.date, "DD/MM/YYYY"))}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                backgroundColor: dayColors[date.dayName] || "transparent" // default ถ้าไม่เจอวัน
                                                            }}
                                                        >
                                                            {date.dayName}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {date.holidayType === "shift" ? "หยุดตามกะการทำงาน" : "วันหยุดตามปฏิทินบริษัท"}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>

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
        </React.Fragment>
    )
}

export default DayOffDetail