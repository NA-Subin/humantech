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
dayjs.locale("en"); // ใส่ตรงนี้ก่อนใช้ dayjs.format("dddd")

const LeaveEarly = (props) => {
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

    console.log("workshift : ", workshift);
    const [employees, setEmployees] = useState([]);

    const attendantRows = [];

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

    employees.forEach(emp => {
        const position = emp.position.split("-")[1];
        const department = emp.department.split("-")[1];
        const section = emp.section.split("-")[1];
        const year = dayjs().format("YYYY");
        const month = dayjs().month() + 1; // ใช้เลขเดือนตรงกับ key

        const attendantList = emp.attendant?.[year]?.[month] || [];

        attendantList.forEach((entry, idx) => {
            attendantRows.push({
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                department,
                section,
                checkin: entry.checkin,
                checkout: entry.checkout,
                datein: entry.datein,
                dateout: entry.dateout,
                workshift: entry.shift,
                isFirst: idx === 0,
                rowSpan: attendantList.length,
            });
        });

        // ถ้าไม่มีข้อมูลการเข้างาน
        if (attendantList.length === 0) {
            attendantRows.push({
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                department,
                section,
                checkin: "",
                checkout: "",
                datein: "",
                dateout: "",
                workshift: "",
                isFirst: true,
                rowSpan: 1,
            });
        }
    });

    console.log("dateArray : ", dateArray);

    console.log("attendantRows : ", attendantRows);
    console.log("employees : ", employees);

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
            <Grid item size={editIncomepleteTime ? 12 : 11}>
                {
                    editIncomepleteTime ?
                        <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                            {/* <TableExcel
                                columns={columns}
                                initialData={department}
                                onDataChange={setDepartment}
                            /> */}
                        </Paper>
                        :
                        <TableContainer component={Paper} textAlign="center">
                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                        <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                        <TablecellHeader>ชื่อ</TablecellHeader>
                                        <TablecellHeader>ตำแหน่ง</TablecellHeader>
                                        <TablecellHeader>วันที่</TablecellHeader>
                                        <TablecellHeader>กะการทำงาน</TablecellHeader>
                                        <TablecellHeader>เวลาทำงาน</TablecellHeader>
                                        <TablecellHeader>มาเช้า/สาย/พักไว/พักเกิน/กลับก่อน/กลับช้า</TablecellHeader>
                                        <TablecellHeader>โอที</TablecellHeader>
                                        <TablecellHeader>ลา</TablecellHeader>
                                        <TablecellHeader>หมายเหตุ</TablecellHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendantRows
                                        .map((emp, index) => (
                                            <TableRow key={emp.ID ?? index}>
                                                <TableCell align="center">{index + 1}</TableCell>
                                                <TableCell align="center">{emp.employname}</TableCell>
                                                <TableCell align="center">{emp.position}</TableCell>
                                                <TableCell align="center">{`${emp.datein} - ${emp.dateout}`}</TableCell>
                                                <TableCell align="center">{emp.workshift}</TableCell>
                                                <TableCell align="center">{`${emp.checkin} - ${emp.checkout}`}</TableCell>
                                                <TableCell align="center">{emp.socialSecurity}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>

                            </Table>
                        </TableContainer>
                }
            </Grid>
            {
                !editIncomepleteTime &&
                <Grid item size={1} textAlign="right">
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <Button
                            variant="contained"
                            size="small"
                            color="warning"
                            fullWidth
                            sx={{
                                height: "60px",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textTransform: "none",
                            }}
                            onClick={() => setIncompleteTime(true)}
                        >
                            <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                            แก้ไข
                        </Button>
                    </Box>
                </Grid>
            }
        </React.Fragment>
    )
}

export default LeaveEarly