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
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany, IconButtonError } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const EducationDetail = (props) => {
    const { menu, data } = props;
    let count = 0;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];

    const [edit, setEdit] = useState("");

    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    const [openDetail, setOpenDetail] = useState({});
    const [hoveredEmpCode, setHoveredEmpCode] = useState(null);
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
                employeecode: emp.employeecode,
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
                employeecode: emp.employeecode,
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

        console.log("updatedList : ", updatedList);
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
                educationList: empLangMap[`${emp.employname} (${emp.nickname})`] || [],
            };
        });

        console.log("merged", merged);
        console.log("empLangMap keys", Object.keys(empLangMap));
        console.log("employees map", employees.map(e => e.employname));

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
                                    stylesTable={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}
                                    types="list"
                                    columns={educationColumns}
                                    initialData={educationRows}
                                    onDataChange={handleEducationChange}
                                />
                            </Paper>
                            :
                            <React.Fragment>
                                <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.error.dark} >*กรณีต้องการดูข้อมูลการศึกษารายคนให้กดชื่อในตารางได้เลย</Typography>
                                <TableContainer component={Paper} textAlign="center" sx={{ height: "50vh" }}>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                        <TableHead
                                            sx={{
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 3,
                                            }}
                                        >
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 200, position: "sticky", left: 0, zIndex: 2, backgroundColor: theme.palette.primary.dark }}>ชื่อ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>ตำแหน่ง</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>สถานภาพการศึกษา</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ระดับการศึกษา</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>สถานศึกษา</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>หมวดการศึกษา</TablecellHeader>
                                                <TablecellHeader sx={{ width: 130 }}>คณะ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 130 }}>สาขา</TablecellHeader>
                                                <TablecellHeader sx={{ width: 130 }}>ชื่อปริญญา</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ปีที่สำเร็จการศึกษา</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>เกรดเฉลี่ย</TablecellHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                educationRows.length === 0 ?
                                                    <TableRow>
                                                        <TablecellNoData colSpan={12}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                    </TableRow>
                                                    :
                                                    educationRows.map((row, index) => (
                                                        <TableRow
                                                            key={index}
                                                            onClick={() => row.isFirst && setOpenDetail(row)}
                                                            onMouseEnter={() => setHoveredEmpCode(row.employeecode)}
                                                            onMouseLeave={() => setHoveredEmpCode(null)}
                                                            sx={{
                                                                cursor: hoveredEmpCode === row.employeecode ? 'pointer' : 'default',
                                                                backgroundColor: hoveredEmpCode === row.employeecode ? theme.palette.primary.light : 'inherit',
                                                            }}
                                                        >
                                                            {row.isFirst && (
                                                                <>
                                                                    <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{count = count + 1}</TableCell>
                                                                    <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "left", position: "sticky", left: 0, zIndex: 2, backgroundColor: "#f5f5f5" }}>
                                                                        <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{row.employname}</Typography>
                                                                    </TableCell>
                                                                    <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "left" }}>
                                                                        <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }} gutterBottom>{row.position}</Typography>
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            {/* ถ้าไม่ใช่ isFirst ไม่ต้องแสดง 2 คอลัมน์แรก */}
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.education}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.educationLevel}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.institution}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.educationCategory}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.faculty}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.branch}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.degree}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.graduateYear}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.gpa}</TableCell>
                                                        </TableRow>
                                                    ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </React.Fragment>
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

            {openDetail?.employname && openDetail?.isFirst && (
                <Dialog
                    open={true}
                    onClose={() => setOpenDetail({})}
                    PaperProps={{
                        sx: {
                            borderRadius: 4,
                            width: "600px",
                            height: "90vh",
                            position: "absolute",
                        },
                    }}
                >
                    <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
                        <Grid container spacing={2}>
                            <Grid item size={10}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>จัดการข้อมูลการศึกษา</Typography>
                            </Grid>
                            <Grid item size={2} sx={{ textAlign: "right" }}>
                                <IconButtonError sx={{ marginTop: -2 }} onClick={() => setOpenDetail({})}>
                                    <CloseIcon />
                                </IconButtonError>
                            </Grid>
                        </Grid>
                        <Divider sx={{ marginTop: 2, marginBottom: -2, border: `1px solid ${theme.palette.primary.dark}` }} />
                    </DialogTitle>

                    <DialogContent
                        sx={{
                            position: "relative",
                            overflow: "hidden",
                            overflowY: 'auto',
                            height: "300px",
                        }}
                    >
                        <Grid container spacing={2} marginTop={2}>
                            <Grid item size={3}>
                                <Typography variant="subtitle2" fontWeight="bold">ชื่อเล่น</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={
                                        openDetail?.employname?.includes("(")
                                            ? openDetail.employname.split(" (")[1].replace(")", "")
                                            : ""
                                    }
                                    disabled
                                />
                            </Grid>

                            <Grid item size={4.5}>
                                <Typography variant="subtitle2" fontWeight="bold">ชื่อ</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={
                                        openDetail?.employname?.split(" (")[0] || ""
                                    }
                                    disabled
                                />
                            </Grid>

                            <Grid item size={4.5}>
                                <Typography variant="subtitle2" fontWeight="bold">ตำแหน่ง</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={openDetail?.position}
                                    disabled
                                />
                            </Grid>

                            <Grid item size={12}>
                                <Divider sx={{ marginTop: 1 }} />
                            </Grid>

                            {/* ดึงเฉพาะ row education ของคนนี้ทั้งหมด */}
                            {educationRows
                                .filter((row) => row.employname === openDetail.employname)
                                .map((row, idx) => (
                                    <React.Fragment key={idx}>
                                        <Grid item size={10}>
                                            <Typography variant="subtitle1" color="warning.main" fontWeight="bold">
                                                ลำดับที่ {idx + 1}
                                            </Typography>
                                        </Grid>
                                        <Grid item size={2} textAlign="right">
                                            {educationRows.length > 1 && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                //onClick={() => handleRemove(index)}
                                                >
                                                    ลบ
                                                </Button>
                                            )}
                                        </Grid>

                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                สถานภาพการศึกษา
                                            </Typography>
                                            <Grid container spacing={2} marginLeft={2} marginRight={2} marginTop={1}>
                                                <Grid item size={6}
                                                    sx={{
                                                        height: "70px",
                                                        backgroundColor: row.education === "จบการศึกษา" ? "#66bb6a" : "#eeeeee",
                                                        borderRadius: 2,
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center"
                                                    }}
                                                //onClick={() => (handleChange(index, "education", "จบการศึกษา"), setEducation(true))}
                                                //onClick={() => setEducation(true)}
                                                >
                                                    <Typography variant="h6" fontWeight="bold" color={row.education === "จบการศึกษา" ? "white" : "textDisabled"} gutterBottom>จบการศึกษา</Typography>
                                                    <MilitaryTechIcon
                                                        sx={{ fontSize: 70, color: row.education === "จบการศึกษา" ? "white" : "lightgray", marginLeft: 2 }} // กำหนดขนาดไอคอนเป็น 60px
                                                    />
                                                </Grid>
                                                <Grid item size={6}
                                                    sx={{
                                                        height: "70px",
                                                        backgroundColor: row.education === "จบการศึกษา" ? "#eeeeee" : "#81d4fa",
                                                        borderRadius: 2,
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center"
                                                    }}
                                                //onClick={() => (handleChange(index, "education", "กำลังศึกษาอยู่"), setEducation(false))}
                                                >
                                                    <Typography variant="h6" fontWeight="bold" color={row.education === "จบการศึกษา" ? "textDisabled" : "white"} gutterBottom>กำลังศึกษาอยู่</Typography>
                                                    <MenuBookIcon
                                                        color="disabled"
                                                        sx={{ fontSize: 70, color: row.education === "จบการศึกษา" ? "lightgray" : "white", marginLeft: 2 }} // กำหนดขนาดไอคอนเป็น 60px
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                ระดับการศึกษา
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={row.educationLevel}
                                                disabled
                                            // onChange={(e) =>
                                            //     handleChange(index, "institution", e.target.value)
                                            // }
                                            />
                                            {/* <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={row.educationLevel}
                                                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
                                                onChange={(e) =>
                                                    handleChange(index, "educationLevel", e.target.value)
                                                }
                                            >
                                                {educationLevels.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField> */}
                                        </Grid>

                                        {
                                            (row.educationLevel === "ประถมศึกษา" || row.educationLevel === "มัธยมศึกษา" || row.educationLevel === "") ?
                                                <React.Fragment>
                                                    <Grid item size={12}>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            สถานศึกษา
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={row.institution}
                                                            placeholder="กรุณากรอกสถานศึกษา"
                                                            disabled
                                                        // onChange={(e) =>
                                                        //     handleChange(index, "institution", e.target.value)
                                                        // }
                                                        />
                                                    </Grid>
                                                </React.Fragment>
                                                :
                                                <React.Fragment>
                                                    <Grid item size={12}>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            สถานศึกษา
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            placeholder="กรุณากรอกสถานศึกษา"
                                                            value={row.institution}
                                                            disabled
                                                        // onChange={(e) =>
                                                        //     handleChange(index, "institution", e.target.value)
                                                        // }
                                                        />
                                                    </Grid>
                                                    <Grid item size={12}>
                                                        <Typography variant="subtitle2" fontWeight="bold" >หมวดการศึกษา</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={row.educationCategory}
                                                            disabled
                                                        // onChange={(e) =>
                                                        //     handleChange(index, "institution", e.target.value)
                                                        // }
                                                        />
                                                        {/* <TextField
                                                            select
                                                            fullWidth
                                                            size="small"
                                                            placeholder="เช่น 2568"
                                                            value={item.educationCategory}
                                                            SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
                                                            onChange={(e) =>
                                                                handleChange(index, "educationCategory", e.target.value)
                                                            }
                                                        >
                                                            {bachelorCategories.map((option) => (
                                                                <MenuItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField> */}
                                                    </Grid>
                                                    <Grid item size={12}>
                                                        <Typography variant="subtitle2" fontWeight="bold" >คณะ</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={row.faculty}
                                                            disabled
                                                            // onChange={(e) =>
                                                            //     handleChange(index, "faculty", e.target.value)
                                                            // }
                                                            placeholder="กรุณากรอกคณะ"
                                                        />
                                                    </Grid>
                                                    <Grid item size={12}>
                                                        <Typography variant="subtitle2" fontWeight="bold" >สาขา</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={row.branch}
                                                            disabled
                                                            // onChange={(e) =>
                                                            //     handleChange(index, "branch", e.target.value)
                                                            // }
                                                            placeholder="กรุณากรอกสาขา"
                                                        />
                                                    </Grid>
                                                    <Grid item size={12}>
                                                        <Typography variant="subtitle2" fontWeight="bold" >ชื่อปริญญา</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={row.degree}
                                                            disabled
                                                            // onChange={(e) =>
                                                            //     handleChange(index, "degree", e.target.value)
                                                            // }
                                                            placeholder="กรุณากรอกชื่อปริญญา"
                                                        />
                                                    </Grid>
                                                </React.Fragment>
                                        }
                                        <Grid item size={6}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                ปีที่สำเร็จการศึกษา
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={row.graduateYear}
                                                placeholder="กรุณากรอกปีที่สำเร็จการศึกษา"
                                                disabled
                                            // onChange={(e) =>
                                            //     handleChange(index, "graduateYear", e.target.value)
                                            // }
                                            />
                                        </Grid>

                                        <Grid item size={6}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                เกรดเฉลี่ย
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={row.gpa}
                                                placeholder="กรุณากรอกเกรดเฉลี่ย"
                                                disabled
                                            // onChange={(e) =>
                                            //     handleChange(index, "gpa", e.target.value)
                                            // }
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <Divider sx={{ marginTop: 1 }} />
                                        </Grid>
                                    </React.Fragment>
                                ))}
                        </Grid>
                    </DialogContent>
                </Dialog>
            )}

        </Box>
    )
}

export default EducationDetail