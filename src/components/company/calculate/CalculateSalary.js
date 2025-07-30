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
import SalaryDetail from "./Salary";
import EditTimeDetail from "./EditTime";
import DocumentDetail from "./Document";
import IncomeDetail from "./IncomeDetail";
import AccountDetail from "./AccountClose";
import DeductionDetails from "./DeductionDetail";

const CalculateSalary = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
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
    const [menu, setMenu] = useState('0-แก้ไขเวลา');

    console.log("Menu : ", menu);

    // ทุกครั้งที่ department, section หรือ position เปลี่ยน จะ reset employee

    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employees, setEmployees] = useState([]);

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

    const renderComponentByMenu = (menu, data) => {
        const key = menu.split("-")[1];

        switch (key) {
            case 'แก้ไขเวลา':
                return <EditTimeDetail data={key} department={department} section={section} position={position} employee={employee} />;
            case 'ยื่นเอกสาร':
                return <DocumentDetail data={key} department={department} section={section} position={position} employee={employee} />;
            case 'รายได้':
                return <IncomeDetail data={key} department={department} section={section} position={position} employee={employee} />;
            case 'รายจ่าย':
                return <DeductionDetails data={key} department={department} section={section} position={position} employee={employee} />;
            case 'ตรวจสอบเงินเดือน':
                return <SalaryDetail data={key} department={department} section={section} position={position} employee={employee} />;
            case 'ปิดงบบัญชี':
                return <AccountDetail data={key} department={department} section={section} position={position} employee={employee} />;
            default:
                return null;
        }
    };

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

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>คำนวณเงินเดือน (Calculate Salary)</Typography>
                    </Grid>
                    <Grid item size={12}>
                        <Divider />
                    </Grid>
                </Grid>
            </Box>
            <Grid container spacing={2}>
                <Grid item size={1} sx={{ position: "sticky", top: 100, alignSelf: "flex-start" }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ whiteSpace: "nowrap", marginLeft: -2.5 }} gutterBottom>เลือกเมนู</Typography>
                    <Divider />
                    <Box sx={{ marginLeft: -13 }}>
                        {/* <Paper > */}
                        {[
                            'แก้ไขเวลา',
                            'ยื่นเอกสาร',
                            'รายได้',
                            'รายจ่าย',
                            'ตรวจสอบเงินเดือน',
                            'ปิดงบบัญชี',
                        ].map((text, index) => {
                            const value = `${index}-${text}`;
                            const isSelected = menu === value;

                            return (
                                <Button
                                    key={index}
                                    variant="contained"
                                    color={isSelected ? "primary" : "secondary"}
                                    sx={{
                                        m: 1,
                                        width: "200px",
                                        textAlign: "right",
                                        justifyContent: "flex-end",
                                        fontSize: "13px",
                                        marginLeft: isSelected && 1
                                    }}
                                    onClick={() => setMenu(value)}
                                >
                                    {text}
                                </Button>
                            );
                        })}
                        {/* </Paper> */}
                    </Box>

                </Grid>
                <Grid item size={11}>
                    <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{menu.split("-")[1]}</Typography>
                        <Divider sx={{ marginTop: 1, marginBottom: 2 }} />
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
                            <Box sx={{ marginTop: 2 }}>
                                {renderComponentByMenu(menu)}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}

export default CalculateSalary