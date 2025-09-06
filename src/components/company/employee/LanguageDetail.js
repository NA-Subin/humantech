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
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany, IconButtonError } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { database } from "../../../server/firebase";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const LanguageDetail = (props) => {
    const { menu, data } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];

    const [edit, setEdit] = useState("");

    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    const [thailand, setThailand] = useState([]);
    const [openDetail, setOpenDetail] = useState({});
    const [hoveredEmpCode, setHoveredEmpCode] = useState(null);
    //const [personal, setPersonal] = useState([]); // จะถูกกรองจาก allEmployees

    useEffect(() => {
        if (!database) return;

        const thailandRef = ref(database, `thailand`);

        const unsubscribe = onValue(thailandRef, (snapshot) => {
            const thailandData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!thailandData) {
                setThailand([{ ID: 0, name: '', employeenumber: '' }]);
            } else {
                setThailand(thailandData);
            }
        });

        return () => unsubscribe();
    }, [database]);

    const languageRows = [];

    // const language = employees.map(emp => ({
    //     employname: emp.employname,
    //     position: emp.position.split("-")[1],
    //     languageList: emp.languageList || '',
    // }));

    employees.forEach(emp => {
        const position = emp.position.split("-")[1];
        const langs = emp.languageList || [];

        langs.forEach((lang, langIdx) => {
            languageRows.push({
                employeecode: emp.employeecode,
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                language: lang.language || "",
                speak: lang.speaking || "",
                read: lang.reading || "",
                write: lang.writing || "",
                isFirst: langIdx === 0,
                rowSpan: langs.length,
            });
        });

        // ถ้าไม่มีภาษาเลยก็ใส่แถวว่างไว้
        if (langs.length === 0) {
            languageRows.push({
                employeecode: emp.employeecode,
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                language: "-",
                speak: "-",
                read: "-",
                write: "-",
                isFirst: true,
                rowSpan: 1,
            });
        }
    });


    const languageColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },
        { label: "ภาษา", key: "language", type: "text" },
        { label: "พูด", key: "speak", type: "text" },
        { label: "อ่าน", key: "read", type: "text" },
        { label: "เขียน", key: "write", type: "text" },
    ];

    const handleLanguageChange = (updatedList) => {
        // สร้าง map ของ employee ชื่อ => ภาษา list ใหม่
        const empLangMap = {};

        updatedList.forEach(row => {
            const name = row.employname;
            if (!empLangMap[name]) {
                empLangMap[name] = [];
            }
            // ถ้า language เป็น '-' หรือข้อมูลว่าง ให้ข้าม
            if (row.language && row.language !== '-') {
                empLangMap[name].push({
                    language: row.language,
                    speaking: row.speak,
                    reading: row.read,
                    writing: row.write,
                });
            }
        });

        // สร้าง employees ใหม่ โดยแทนที่ languageList ด้วยข้อมูลใหม่จาก empLangMap
        const merged = employees.map(emp => {
            return {
                ...emp,
                languageList: empLangMap[`${emp.employname} (${emp.nickname})`] || [],
            };
        });

        console.log("merged", merged);
        console.log("empLangMap keys", Object.keys(empLangMap));
        console.log("employees map", employees.map(e => e.employname));

        setEmployees(merged);
    };


    console.log("languageRows : ", languageRows);

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
            languageColumns.forEach((col) => {
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
                                    stylesTable={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1000px" }}
                                    types="list"
                                    columns={languageColumns}
                                    initialData={languageRows}
                                    onDataChange={handleLanguageChange}
                                />
                            </Paper>
                            :
                            <React.Fragment>
                                <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.error.dark} >*กรณีต้องการดูข้อมูลภาษารายคนให้กดชื่อในตารางได้เลย</Typography>
                                <TableContainer component={Paper} textAlign="center" sx={{ height: "50vh" }}>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1000px" }}>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader rowSpan={2} sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                                <TablecellHeader rowSpan={2}>ชื่อ</TablecellHeader>
                                                <TablecellHeader rowSpan={2}>ตำแหน่ง</TablecellHeader>
                                                <TablecellHeader colSpan={4}>ภาษาที่ใช้</TablecellHeader>
                                            </TableRow>
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader>ภาษา</TablecellHeader>
                                                <TablecellHeader>พูด</TablecellHeader>
                                                <TablecellHeader>อ่าน</TablecellHeader>
                                                <TablecellHeader>เขียน</TablecellHeader>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {
                                                languageRows.length === 0 ?
                                                    <TableRow>
                                                        <TablecellNoData colSpan={7}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                    </TableRow>
                                                    :
                                                    (
                                                        languageRows.map((row, index) => (
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
                                                                        <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{index + 1}</TableCell>
                                                                        <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.employname}</TableCell>
                                                                        <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.position}</TableCell>
                                                                    </>
                                                                )}
                                                                <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.language}</TableCell>
                                                                <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.speak}</TableCell>
                                                                <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.read}</TableCell>
                                                                <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal', }}>{row.write}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )
                                            }
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
                                <Typography variant="h6" fontWeight="bold" gutterBottom>จัดการข้อมูลการฝึกอบรม</Typography>
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
                            {languageRows
                                .filter((row) => row.employname === openDetail.employname)
                                .map((row, idx) => (
                                    <React.Fragment key={idx}>
                                        <Grid item size={10}>
                                            <Typography variant="subtitle1" color="warning.main" fontWeight="bold">
                                                ลำดับที่ {idx + 1}
                                            </Typography>
                                        </Grid>
                                        <Grid item size={2} textAlign="right">
                                            {languageRows.length > 1 && (
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
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={row.language}
                                                disabled
                                            // onChange={(e) =>
                                            //     handleLanguageChange(index, "language", e.target.value)
                                            // }
                                            // placeholder="กรุณากรอกชื่อภาษา"
                                            />
                                            {/* <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                value={lang.language}
                                                onChange={(e) =>
                                                    handleLanguageChange(index, "language", e.target.value)
                                                }
                                            >
                                                <MenuItem value="ไทย">ภาษาไทย</MenuItem>
                                                <MenuItem value="อังกฤษ">ภาษาอังกฤษ</MenuItem>
                                                <MenuItem value="ญี่ปุ่น">ภาษาญี่ปุ่น</MenuItem>
                                                <MenuItem value="เกาหลี">ภาษาเกาหลี</MenuItem>
                                            </TextField> */}
                                        </Grid>
                                        <Grid item size={0.5} />
                                        <Grid item size={3.5}>
                                            <Box sx={{ borderRadius: 40, backgroundColor: "#80cbc4", width: "150px", height: "150px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }} gutterBottom>{row.language}</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item size={7.5}>
                                            <Grid container spacing={2}>
                                                <Grid item size={2}>
                                                    <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold">พูด</Typography>
                                                </Grid>
                                                <Grid item size={10}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={row.speak}
                                                        disabled
                                                    // onChange={(e) => handleLanguageChange(index, "speaking", e.target.value)}
                                                    // placeholder="กรุณากรอกความสามารถในการพูด"
                                                    />
                                                </Grid>
                                                <Grid item size={2}>
                                                    <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold">อ่าน</Typography>
                                                </Grid>
                                                <Grid item size={10}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={row.read}
                                                        disabled
                                                    // onChange={(e) => handleLanguageChange(index, "reading", e.target.value)}
                                                    // placeholder="กรุณากรอกความสามารถในการอ่าน"
                                                    />
                                                </Grid>

                                                <Grid item size={2}>
                                                    <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold">เขียน</Typography>
                                                </Grid>
                                                <Grid item size={10}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={row.write}
                                                        disabled
                                                    // onChange={(e) => handleLanguageChange(index, "writing", e.target.value)}
                                                    // placeholder="กรุณากรอกความสามารถในการเขียน"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item size={0.5} />
                                        <Grid item size={12}><Divider sx={{ mt: 1 }} /></Grid>
                                    </React.Fragment>
                                ))}
                        </Grid>
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    )
}

export default LanguageDetail