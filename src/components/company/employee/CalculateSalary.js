import React, { useState, useEffect, use } from "react";
import '../../../App.css'
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
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../theme/style"

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import SelectEmployeeGroup from "../../../theme/SearchEmployee";

const CalculateSalary = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editLeave, setEditLeave] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [leave, setLeave] = useState([{ ID: 0, name: '' }]);
    const columns = [
        { label: "ประเภทการลา", key: "name", type: "text" },
        { label: "จำนวนวัน", key: "max", type: "text" }
    ];

    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");
    const [position, setPosition] = useState("");
    const [employee, setEmployee] = useState("");

    // ทุกครั้งที่ department, section หรือ position เปลี่ยน จะ reset employee

    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employees, setEmployees] = useState([]);

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

        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        const unsubscribe = onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!leaveData) {
                setLeave([{ ID: 0, name: '' }]);
            } else {
                setLeave(leaveData);
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
                setEditLeave(false);
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
            setEditLeave(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>คำนวณเงินเดือน (Calculate Salary)</Typography>
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
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลการคำนวณเงินเดือน</Typography>
                    <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                    <Grid container spacing={2}>
                        <Grid item size={12}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {(() => {
                                    if (position !== "") return "รายชื่อพนักงานจากการเลือกตำแหน่ง";
                                    if (section !== "") return "รายชื่อพนักงานจากการเลือกส่วนงาน";
                                    if (department !== "") return "รายชื่อพนักงานจากการเลือกฝ่ายงาน";
                                    return ""; // หรือข้อความอื่นถ้าไม่มีการเลือก
                                })()}
                            </Typography>
                        </Grid>


                        {
                            (department !== "" && section !== "" && position !== "" && employee !== "") ?
                                <React.Fragment>
                                    <Grid item size={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" >ชื่อพนักงาน</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="ชื่อพนักงาน"
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" >ตำแหน่ง</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="ตำแหน่งพนักงาน"
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" >ภาษี</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="ภาษีของพนักงาน"
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" >ประกันสังคม</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="ประกันสังคมของพนักงาน"
                                        />
                                    </Grid>
                                    <Grid item size={12}>
                                        <Typography variant="subtitle2" fontWeight="bold" >รายการรายหัก</Typography>
                                        <TextField
                                            type="text"
                                            size="small"
                                            placeholder="รายการรายหักของพนักงาน"
                                            multiline
                                            rows={3}
                                            fullWidth
                                        />
                                    </Grid>
                                </React.Fragment>
                                :
                                <React.Fragment>
                                    <Grid item size={editLeave ? 12 : 11}>
                                        {
                                            editLeave ?
                                                <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                                    <TableExcel
                                                        columns={columns}
                                                        initialData={department}
                                                        onDataChange={setDepartment}
                                                    />
                                                </Paper>
                                                :
                                                <TableContainer component={Paper} textAlign="center">
                                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                                        <TableHead>
                                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                                <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                                                <TablecellHeader>ชื่อ</TablecellHeader>
                                                                <TablecellHeader>ตำแหน่ง</TablecellHeader>
                                                                <TablecellHeader>ฐานเงินเดือน</TablecellHeader>
                                                                <TablecellHeader>รายได้รายหัก</TablecellHeader>
                                                                <TablecellHeader>ภาษี</TablecellHeader>
                                                                <TablecellHeader>ประกันสังคม</TablecellHeader>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {employees
                                                                .filter(emp => {
                                                                    if (!department) return false;
                                                                    if (section === "" && position === "" && employee === "") {
                                                                        return emp.department === department;
                                                                    }
                                                                    if (section !== "" && position === "" && employee === "") {
                                                                        return emp.department === department && emp.section === section;
                                                                    }
                                                                    if (section !== "" && position !== "" && employee === "") {
                                                                        return emp.department === department && emp.section === section && emp.position === position;
                                                                    }
                                                                    return false;
                                                                })
                                                                .map((emp, index) => (
                                                                    <TableRow key={emp.ID ?? index}>
                                                                        <TableCell align="center">{index + 1}</TableCell>
                                                                        <TableCell align="center">{emp.name}</TableCell>
                                                                        <TableCell align="center">{emp.position}</TableCell>
                                                                        <TableCell align="center">{emp.salary}</TableCell>
                                                                        <TableCell align="center">{emp.earningsDeductions}</TableCell>
                                                                        <TableCell align="center">{emp.tax}</TableCell>
                                                                        <TableCell align="center">{emp.socialSecurity}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>

                                                    </Table>
                                                </TableContainer>
                                        }
                                    </Grid>
                                    {
                                        !editLeave &&
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
                                                    onClick={() => setEditLeave(true)}
                                                >
                                                    <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                                    แก้ไข
                                                </Button>
                                            </Box>
                                        </Grid>
                                    }
                                </React.Fragment>
                        }
                    </Grid>
                    {
                        editLeave &&
                        <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                            <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                            <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                        </Box>
                    }
                </Box>
            </Paper>
        </Container>
    )
}

export default CalculateSalary