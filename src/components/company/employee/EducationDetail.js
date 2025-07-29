import React, { useState, useEffect, use } from "react";
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
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";

const EducationDetail = (props) => {
    const { menu, data } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];

    const [edit, setEdit] = useState("");

    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    //const [personal, setPersonal] = useState([]); // จะถูกกรองจาก allEmployees

    const educationRows = [];

    // const language = employees.map(emp => ({
    //     employname: emp.employname,
    //     position: emp.position.split("-")[1],
    //     languageList: emp.languageList || '',
    // }));

    employees.forEach(emp => {
        const position = emp.position.split("-")[1];
        const educations = emp.educationList || [];

        educations.forEach((education, educationIdx) => {
            educationRows.push({
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                education: education.education || "",
                educationLevel: education.educationLevel || "",
                institution: education.institution || "",
                educationCategory: education.educationCategory || "",
                faculty: education.faculty || "",
                branch: education.branch || "",
                degree: education.degree || "",
                graduateYear: education.graduateYear || "",
                gpa: education.gpa || "",
                isFirst: educationIdx === 0,
                rowSpan: educations.length,
            });
        });

        // ถ้าไม่มีภาษาเลยก็ใส่แถวว่างไว้
        if (educations.length === 0) {
            educationRows.push({
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                education: "",
                educationLevel: "",
                institution: "",
                educationCategory: "",
                faculty: "",
                branch: "",
                degree: "",
                graduateYear: "",
                gpa: "",
                isFirst: true,
                rowSpan: 1,
            });
        }
    });

    const educationColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },
        {
            label: "สถานภาพการศึกษา",
            key: "education",
            type: "select",
            options: [
                { value: "จบการศึกษา", label: "จบการศึกษา" },
                { value: "กำลังศึกษา", label: "กำลังศึกษา" }
            ],
        },
        {
            label: "ระดับการศึกษา",
            key: "educationLevel",
            type: "select",
            options: [
                { value: "ประถมศึกษา", label: "ประถมศึกษา" },
                { value: "มัธยมศึกษา", label: "มัธยมศึกษา" },
                { value: "ปวส.", label: "ปวส." },
                { value: "ปวช.", label: "ปวช." },
                { value: "ปริญญาตรี", label: "ปริญญาตรี" },
                { value: "ปริญญาโท", label: "ปริญญาโท" },
                { value: "ปริญญาเอก", label: "ปริญญาเอก" },
            ],
        },
        { label: "สถานศึกษา", key: "institution", type: "text" },
        { label: "หมวดการศึกษา", key: "educationCategory", type: "text" },
        { label: "คณะ", key: "faculty", type: "text" },
        { label: "สาขา", key: "branch", type: "text" },
        { label: "ชื่อปริญญา", key: "degree", type: "text" },
        { label: "ปีที่สำเร็จการศึกษา", key: "graduateYear", type: "text" },
        { label: "เกรดเฉลี่ย", key: "gpa", type: "text" },
    ];

    const handleEducationChange = (updatedList) => {
        // สร้าง map ของ employee ชื่อ => ภาษา list ใหม่
        const empLangMap = {};

        updatedList.forEach(row => {
            const name = row.employname;
            if (!empLangMap[name]) {
                empLangMap[name] = [];
            }
            // ถ้า language เป็น '-' หรือข้อมูลว่าง ให้ข้าม
            if (row.education && row.education !== '-') {
                empLangMap[name].push({
                    education: row.education,
                    educationLevel: row.educationLevel,
                    institution: row.institution,
                    educationCategory: row.educationCategory,
                    faculty: row.faculty,
                    branch: row.branch,
                    degree: row.degree,
                    graduateYear: row.graduateYear,
                    gpa: row.gpa,
                });
            }
        });

        // สร้าง employees ใหม่ โดยแทนที่ languageList ด้วยข้อมูลใหม่จาก empLangMap
        const merged = employees.map(emp => {
            return {
                ...emp,
                educationList: empLangMap[emp.employname] || [],
            };
        });

        setEmployees(merged);
    };

    console.log("educationRows : ", educationRows);

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

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const invalidMessages = [];

        employees.forEach((row, rowIndex) => {
            educationColumns.forEach((col) => {
                const value = row[col.key];

                if (value === "") {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: กรุณากรอก "${col.label}"`);
                    return;
                }

                if (col.type === "number" && isNaN(Number(value))) {
                    invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ต้องเป็นตัวเลข`);
                    return;
                }
            });
        });

        // แก้เป็น employname แทน name
        const names = employees.map(row => row.employname?.trim()).filter(Boolean);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
            invalidMessages.push(`มีชื่อ: ${[...new Set(duplicates)].join(", ")} ซ้ำกัน`);
        }

        if (invalidMessages.length > 0) {
            ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
            return;
        }

        // แปลงข้อมูลก่อนบันทึก
        const employeesToSave = employees.map(emp => ({
            ...emp,
            educationList: (emp.educationList || []).map(train => ({
                ...train,
                file: typeof train.file === "object" && train.file !== null ? train.file.name || null : train.file || null,
            })),
        }));

        set(companiesRef, employeesToSave)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEdit(false);
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
            setEmployees(employeeData);
            setEdit(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };


    return (
        <Box sx={{ marginTop: 5, width: "1080px" }}>
            <Grid container spacing={2} sx={{ marginBottom: 1 }}>
                <Grid item size={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูล{data}</Typography>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
            <Grid container spacing={2}>
                <Grid item size={edit ? 12 : 11}>
                    {
                        edit ?
                            <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                <TableExcel
                                    styles={{ height: "50vh" }} // ✅ ส่งเป็น object
                                    stylesTable={{ width: "2000px" }} // ✅ ส่งเป็น object
                                    types="list"
                                    columns={educationColumns}
                                    initialData={educationRows}
                                    onDataChange={handleEducationChange}
                                />
                            </Paper>
                            :
                            <TableContainer component={Paper} textAlign="center" sx={{ height: "50vh" }}>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader>ชื่อ</TablecellHeader>
                                            <TablecellHeader>ตำแหน่ง</TablecellHeader>
                                            <TablecellHeader>สถานภาพการศึกษา</TablecellHeader>
                                            <TablecellHeader>ระดับการศึกษา</TablecellHeader>
                                            <TablecellHeader>สถานศึกษา</TablecellHeader>
                                            <TablecellHeader>หมวดการศึกษา</TablecellHeader>
                                            <TablecellHeader>คณะ</TablecellHeader>
                                            <TablecellHeader>สาขา</TablecellHeader>
                                            <TablecellHeader>ชื่อปริญญา</TablecellHeader>
                                            <TablecellHeader>ปีที่สำเร็จการศึกษา</TablecellHeader>
                                            <TablecellHeader>เกรดเฉลี่ย</TablecellHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            educationRows.length === 0 ?
                                                <TableRow>
                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                educationRows.map((row, index) => (
                                                    <TableRow>
                                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.employname}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.position}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.education}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.educationLevel}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.institution}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.educationCategory}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.faculty}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.branch}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.degree}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.graduateYear}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.gpa}</TableCell>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                    }
                </Grid>
                {
                    !edit &&
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
                                onClick={() => setEdit(true)}
                            >
                                <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                แก้ไข
                            </Button>
                        </Box>
                    </Grid>
                }
            </Grid>
            {
                edit &&
                <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                    <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                    <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                </Box>
            }
        </Box>
    )
}

export default EducationDetail