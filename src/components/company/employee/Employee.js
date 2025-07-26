import React, { useState, useEffect, use, useRef } from "react";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import '../../../App.css'
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
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InputAdornment, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import MuiExcelLikeTable from "../test";
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import AddEmployee from "./AddEmployee";
import SelectEmployeeGroup from "../../../theme/SearchEmployee";
import PersonalDetail from "./PersonalDetail";
import EducationDetail from "./EducationDetail";
import InternshipDetail from "./InternshipDetail";
import TrainingDetail from "./TrainingDetail";
import LanguageDetail from "./LanguageDetail";
import OtherDetail from "./OtherDetail";

const Employee = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState([]);
    const [checkEmployee, setCheckEmployee] = useState({});
    const [departmentDetail, setDepartmentDetail] = useState([]);
    const [sectionDetail, setSectionDetail] = useState([]);
    const [positionDetail, setPositionDetail] = useState([]);
    const [menu, setMenu] = useState("");
    const paperRef = useRef(null);
    console.log("checkEmployee : ", checkEmployee);

    useEffect(() => {
        if (paperRef.current) {
            paperRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [menu]);

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/department`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // แปลง object เป็น array ของ { value, label }
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.deptname}`, // ค่าเวลาบันทึก
                    label: item.deptname,                 // แสดงผล
                }));
                setDepartmentDetail(opts); // <-- ใช้ใน columns
            }
        });
    }, [firebaseDB, companyId]);

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/section`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.sectionname}`,
                    label: item.sectionname,
                    keyposition: item.keyposition
                }));

                // เพิ่มตัวเลือก "ไม่มี" เข้าไปที่ด้านบน
                opts.unshift({ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" });

                setSectionDetail(opts);
            } else {
                // ถ้าไม่มีข้อมูล section เลย ให้มีตัวเลือก "ไม่มี" อย่างน้อย
                setSectionDetail([{ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" }]);
            }
        });
    }, [firebaseDB, companyId]);

    useEffect(() => {
        const optionRef = ref(firebaseDB, `workgroup/company/${companyId}/position`);

        onValue(optionRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const opts = Object.values(data).map((item) => ({
                    value: `${item.ID}-${item.positionname}`,
                    label: item.positionname,
                    keyposition: item.deptid
                }));

                // เพิ่มตัวเลือก "ไม่มี" เข้าไปที่ด้านบน
                opts.unshift({ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" });

                setPositionDetail(opts);
            } else {
                // ถ้าไม่มีข้อมูล position เลย ให้มีตัวเลือก "ไม่มี" อย่างน้อย
                setPositionDetail([{ value: '0-ไม่มี', label: 'ไม่มี', keyposition: "ไม่มี" }]);
            }
        });
    }, [firebaseDB, companyId]);

    const columns = [
        { label: "ชื่อ", key: "employname", type: "text" },
        {
            label: "ฝ่ายงาน",
            key: "department",
            type: "select",
            width: "20%",
            options: departmentDetail,
        },
        {
            label: "ส่วนงาน",
            key: "section",
            type: "dependent-select",
            dependsOn: "department",
            options: sectionDetail.map((item) => ({
                label: item.label,
                value: item.value,
                parent: item.keyposition, // 👈 ใช้เฉพาะ ID ฝ่ายงาน
            })),
        },
        {
            label: "ตำแหน่ง",
            key: "position",
            type: "dependent-select",
            dependsOn: "department",
            options: positionDetail.map((item) => ({
                label: item.label,
                value: item.value,
                parent: item.keyposition, // 👈 ใช้เฉพาะ ID ฝ่ายงาน
            })),
        }
    ];

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

    const [editEmployee, setEditEmployee] = useState("");
    const [editPersonal, setEditPersonal] = useState("");

    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");
    const [position, setPosition] = useState("");
    const [employee, setEmployee] = useState("");
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [positions, setPositions] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    //const [personal, setPersonal] = useState([]); // จะถูกกรองจาก allEmployees

    const personal = employees.map(emp => ({
        employname: emp.employname,
        position: emp.position.split("-")[1],
        country: emp.personal?.country || '',
        homephone: emp.personal?.homephone || '',
        lineID: emp.personal?.lineID || '',
        nationality: emp.personal?.nationality || '',
        phone: emp.personal?.phone || '',
        religion: emp.personal?.religion || '',
        sex: emp.personal?.sex || '',
        statusEmployee: emp.personal?.statusEmployee || '',
        militaryStatus: emp.personal?.militaryStatus || '',
        height: emp.personal?.height || '',
        weight: emp.personal?.weight || '',
    }));

    const personalColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },
        {
            label: "เพศ",
            key: "sex",
            type: "select",
            options: [
                { value: "ชาย", label: "ชาย" },
                { value: "หญิง", label: "หญิง" }
            ],
        },
        {
            label: "สถานภาพทางทหาร",
            key: "militaryStatus",
            type: "select",
            options: [
                { value: "ผ่านเกณฑ์แล้ว", label: "ผ่านเกณฑ์แล้ว" },
                { value: "ได้รับการยกเว้น", label: "ได้รับการยกเว้น" },
                { value: "ยังไม่ได้เกณฑ์ทหาร", label: "ยังไม่ได้เกณฑ์ทหาร" }
            ],
        },
        { label: "สัญชาติ", key: "nationality", type: "text" },
        { label: "ศาสนา", key: "religion", type: "text" },
        { label: "ส่วนสูง", key: "height", type: "text" },
        { label: "น้ำหนัก", key: "weight", type: "text" },
        {
            label: "สถานภาพ",
            key: "statusEmployee",
            type: "select",
            options: [
                { value: "โสด", label: "โสด" },
                { value: "สมรส", label: "สมรส" },
                { value: "หย่า", label: "หย่า" },
                { value: "หม้าย", label: "หม้าย" }
            ],
        },
        { label: "เบอร์โทรศัพท์", key: "phone", type: "text" },
        { label: "โทรศัพท์บ้าน", key: "homephone", type: "text" },
        { label: "LINE ID", key: "lineID", type: "text" },
        { label: "ประเทศ", key: "country", type: "text" },
    ];

    const handlePersonalChange = (updatedList) => {
        const merged = employees.map((emp, idx) => ({
            ...emp,
            personal: {
                ...emp.personal,
                sex: updatedList[idx].sex,
                militaryStatus: updatedList[idx].militaryStatus,
                nationality: updatedList[idx].nationality,
                religion: updatedList[idx].religion,
                height: updatedList[idx].height,
                weight: updatedList[idx].weight,
                statusEmployee: updatedList[idx].statusEmployee,
                phone: updatedList[idx].phone,
                homephone: updatedList[idx].homephone,
                lineID: updatedList[idx].lineID,
                country: updatedList[idx].country,
            },
        }));
        setEmployees(merged);  // หรือ setPersonal หากแยก state
    };

    console.log("department : ", department);
    console.log("personals : ", personal);

    const renderComponentByMenu = (menu, data) => {
        const key = menu.split("-")[1];

        switch (key) {
            case 'ข้อมูลทั่วไป':
                return <PersonalDetail data={key} />;
            case 'ประวัติการศึกษา':
                return <EducationDetail data={key} />;
            case 'ประวัติการทำงาน/ฝึกงาน':
                return <InternshipDetail data={key} />;
            case 'ประวัติการฝึกอบรม':
                return <TrainingDetail data={key} />;
            case 'ความสามารถทางภาษา':
                return <LanguageDetail data={key} />;
            case 'อื่นๆ':
                return <OtherDetail data={key} />;
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

            if (!employeeData) {
                setAllEmployees([]);
                setEmployees([]);
            } else {
                const employeeArray = Object.values(employeeData);
                setAllEmployees(employeeArray);
                setEmployees(employeeArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    console.log("employees : ", employees);

    useEffect(() => {
        const filtered = allEmployees.filter((emp) => {
            if (department && emp.department !== department) return false;
            if (section && emp.section !== section) return false;
            if (position && emp.position !== position) return false;
            return true;
        });

        setEmployees(filtered);
    }, [department, section, position, allEmployees]);

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const invalidMessages = [];

        employees.forEach((row, rowIndex) => {
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

        // ✅ ตรวจสอบว่า employee.name ซ้ำหรือไม่
        const names = employees.map(row => row.name?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
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
        set(companiesRef, employees)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEditEmployee(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val() || [{ ID: 0, name: '', employeenumber: '' }];
            setEmployee(employeeData);
            setEditEmployee(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };


    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Grid container spacing={2}>
                <Grid item size={1} sx={{ position: "sticky", top: 15, alignSelf: "flex-start" }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 8, whiteSpace: "nowrap", marginLeft: -2.5 }} gutterBottom>เลือกเมนูพนักงาน</Typography>
                    <Divider />
                    <Box sx={{ marginLeft: -10 }}>
                        {[
                            'ข้อมูลทั่วไป',
                            'ประวัติการศึกษา',
                            'ประวัติการทำงาน/ฝึกงาน',
                            'ประวัติการฝึกอบรม',
                            'ความสามารถทางภาษา',
                            'อื่นๆ',
                        ].map((text, index) => {
                            return (
                                <Button
                                    key={index}
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        m: 1,
                                        width: "200px",
                                        textAlign: "right",
                                        justifyContent: "flex-end",
                                        fontSize: "13px"
                                    }}
                                    onClick={() => setMenu(`${index}-${text}`)}
                                >
                                    {text}
                                </Button>
                            );
                        })}
                    </Box>

                </Grid>
                <Grid item size={11}>
                    <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item size={12}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>พนักงาน (employee)</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4, height: "70vh" }}>
                        <Box>
                            {/* <SelectEmployeeGroup
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
                            /> */}
                            <Grid container spacing={2} sx={{ marginBottom: 1 }}>
                                <Grid item size={10}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการตำแหน่งพนักงาน</Typography>
                                </Grid>
                                <Grid item size={2} sx={{ textAlign: "right" }}>
                                    <AddEmployee />
                                </Grid>
                            </Grid>
                            <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                            <Grid container spacing={2}>
                                <Grid item size={editEmployee ? 12 : 11}>
                                    {
                                        editEmployee ?
                                            <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                                <TableExcel
                                                    styles={{ height: "50vh" }} // ✅ ส่งเป็น object
                                                    columns={columns}
                                                    initialData={employees}
                                                    onDataChange={setEmployees}
                                                />
                                            </Paper>
                                            :
                                            <TableContainer component={Paper} textAlign="center">
                                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                            <TablecellHeader sx={{ width: "5%" }}>ลำดับ</TablecellHeader>
                                                            <TablecellHeader sx={{ width: "35%" }}>ชื่อ</TablecellHeader>
                                                            <TablecellHeader sx={{ width: "20%" }}>ฝ่ายงาน</TablecellHeader>
                                                            <TablecellHeader sx={{ width: "20%" }}>ส่วนงาน</TablecellHeader>
                                                            <TablecellHeader sx={{ width: "20%" }}>ตำแหน่ง</TablecellHeader>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {
                                                            employees.length === 0 ?
                                                                <TableRow>
                                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                                </TableRow>
                                                                :
                                                                employees.map((row, index) => (
                                                                    <TableRow>
                                                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                        <TableCell sx={{ textAlign: "center" }}>{row.employname}</TableCell>
                                                                        <TableCell sx={{ textAlign: "center" }}>{row.department.split("-")[1]}</TableCell>
                                                                        <TableCell sx={{ textAlign: "center" }}>{row.section.split("-")[1]}</TableCell>
                                                                        <TableCell sx={{ textAlign: "center" }}>{row.position.split("-")[1]}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                    }
                                </Grid>
                                {
                                    !editEmployee &&
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
                                                    textTransform: "none", // ป้องกันตัวอักษรเป็นตัวใหญ่ทั้งหมด
                                                }}
                                                onClick={() => setEditEmployee(true)}
                                            >
                                                <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                                แก้ไข
                                            </Button>
                                        </Box>
                                    </Grid>
                                }
                            </Grid>
                            {
                                editEmployee &&
                                <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                                    <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                    <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                                </Box>
                            }
                            {/* <TableContainer component={Paper} textAlign="center" sx={{ height: "300px" }}>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader sx={{ width: "5%" }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader sx={{ width: "35%" }}>ชื่อ</TablecellHeader>
                                            <TablecellHeader sx={{ width: "20%" }}>ฝ่ายงาน</TablecellHeader>
                                            <TablecellHeader sx={{ width: "20%" }}>ส่วนงาน</TablecellHeader>
                                            <TablecellHeader sx={{ width: "20%" }}>ตำแหน่ง</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            employees.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                employees.map((row, index) => (
                                                    <TableRow
                                                        onClick={() => setCheckEmployee(row)}
                                                        sx={{
                                                            backgroundColor: row.employeeid === checkEmployee.employeeid && "#e0f2f1"
                                                        }}
                                                    >
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {row.employname}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {row.department.split("-")[1]}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {row.section.split("-")[1]}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                textAlign: "center",
                                                                // color: row.employeeid === checkEmployee.employeeid && "white",
                                                                fontWeight: row.employeeid === checkEmployee.employeeid && "bold",
                                                            }}
                                                        >
                                                            {row.position.split("-")[1]}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {
                                employees.map((row, index) => (
                                    row.employeeid === checkEmployee.employeeid &&
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ marginTop: 2, }} gutterBottom>ข้อมูลของ {checkEmployee?.employname}</Typography>
                                        <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                                        <Grid container spacing={2}>
                                            <Grid item size={editEmployee ? 12 : 11}>
                                                {
                                                    editEmployee ?
                                                        <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                                            <TableExcel
                                                                columns={columns}
                                                                initialData={employee}
                                                                onDataChange={setEmployee}
                                                            />
                                                        </Paper>
                                                        :
                                                        <TableContainer component={Paper} textAlign="center">
                                                            <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                                                <TableHead>
                                                                    <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                                        <TablecellHeader sx={{ width: "5%" }}>ลำดับ</TablecellHeader>
                                                                        <TablecellHeader sx={{ width: "35%" }}>ชื่อ</TablecellHeader>
                                                                        <TablecellHeader sx={{ width: "20%" }}>ฝ่ายงาน</TablecellHeader>
                                                                        <TablecellHeader sx={{ width: "20%" }}>ส่วนงาน</TablecellHeader>
                                                                        <TablecellHeader sx={{ width: "20%" }}>ตำแหน่ง</TablecellHeader>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {
                                                                        employees.length === 0 ?
                                                                            <TableRow>
                                                                                <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                                            </TableRow>
                                                                            :
                                                                            employees.map((row, index) => (
                                                                                <TableRow>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{row.employname}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{row.department.split("-")[1]}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{row.section.split("-")[1]}</TableCell>
                                                                                    <TableCell sx={{ textAlign: "center" }}>{row.position.split("-")[1]}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                }
                                            </Grid>
                                            {
                                                !editEmployee &&
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
                                                                textTransform: "none", // ป้องกันตัวอักษรเป็นตัวใหญ่ทั้งหมด
                                                            }}
                                                            onClick={() => setEditEmployee(true)}
                                                        >
                                                            <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                                            แก้ไข
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            }
                                        </Grid>
                                        {
                                            editEmployee &&
                                            <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                                                <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                                <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                                            </Box>
                                        }
                                    </Box>
                                ))
                            }
                        </Box> */}
                        </Box>
                    </Paper>
                    <Paper ref={paperRef} sx={{ p: 5, width: "100%", marginTop: 5, borderRadius: 4 }}>
                        <Box sx={{ marginTop: -5 }}>
                            {renderComponentByMenu(menu)}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container >
    )
}

export default Employee