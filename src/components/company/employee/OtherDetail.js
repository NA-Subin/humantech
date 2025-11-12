import React, { useState, useEffect, use } from "react";
import { getDatabase, ref, push, onValue, set, update } from "firebase/database";
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
import CloseIcon from '@mui/icons-material/Close';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany, IconButtonError } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const OtherDetail = (props) => {
    const { menu, data } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [check, setCheck] = useState(false);

    const [edit, setEdit] = useState("");

    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    const [openDetail, setOpenDetail] = useState({});
    const [hoveredEmpCode, setHoveredEmpCode] = useState(null);
    //const [other, setother] = useState([]); // จะถูกกรองจาก allEmployees

    const other = employees.map(emp => ({
        ID: emp.ID,
        employeecode: emp.employeecode,
        employname: `${emp.employname} (${emp.nickname})`,
        position: emp.position.split("-")[1],
        specialAbilities1: emp.specialAbilities?.specialAbilities1 || '',
        specialAbilities2: emp.specialAbilities?.specialAbilities2 || '',
        specialAbilities3: emp.specialAbilities?.specialAbilities3 || '',
        printingSpeedTH: emp.specialAbilities?.printingSpeedTH || '',
        printingSpeedENG: emp.specialAbilities?.printingSpeedENG || '',
        otherProjects: emp.specialAbilities?.otherProjects || '',
        referencePerson: emp.specialAbilities?.referencePerson || '',
    }));

    const otherColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },
        { label: "ความสามารถพิเศษที่ 1", key: "specialAbilities1", type: "text" },
        { label: "ความสามารถพิเศษที่ 2", key: "specialAbilities2", type: "text" },
        { label: "ความสามารถพิเศษที่ 3", key: "specialAbilities3", type: "text" },
        { label: "ความเร็วในการพิมพ์ภาษาไทย", key: "printingSpeedTH", type: "text" },
        { label: "ความเร็วในการพิมพ์ภาษาอังกฤษ", key: "printingSpeedENG", type: "text" },
        { label: "ประสบการณ์อื่นๆ", key: "otherProjects", type: "text" },
        { label: "บุคคลอ้างอิง", key: "referencePerson", type: "text" },
    ];

    const handleOtherChange = (updatedList) => {
        const merged = employees.map((emp, idx) => ({
            ...emp,
            specialAbilities: {
                ...emp.personal,
                specialAbilities1: updatedList[idx].specialAbilities1,
                specialAbilities2: updatedList[idx].specialAbilities2,
                specialAbilities3: updatedList[idx].specialAbilities3,
                printingSpeedTH: updatedList[idx].printingSpeedTH,
                printingSpeedENG: updatedList[idx].printingSpeedENG,
                otherProjects: updatedList[idx].otherProjects,
                referencePerson: updatedList[idx].referencePerson,
            },
        }));
        setEmployees(merged);  // หรือ setPersonal หากแยก state
    };

    console.log("other : ", other);

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
            otherColumns.forEach((col) => {
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

    console.log("openDetail : ", openDetail?.ID);

    const handleDetailChange = (field, value) => {
        setOpenDetail(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleUpdate = () => {
        if (openDetail?.ID === undefined || openDetail?.ID === null) {
            return ShowError("ไม่พบข้อมูลพนักงาน");
        }

        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${openDetail.ID}`);

        const data = {
            specialAbilities1: openDetail?.specialAbilities1,
            specialAbilities2: openDetail?.specialAbilities2,
            specialAbilities3: openDetail?.specialAbilities3,
            printingSpeedTH: openDetail?.printingSpeedTH,
            printingSpeedENG: openDetail?.printingSpeedENG,
            otherProjects: openDetail?.otherProjects,
            referencePerson: openDetail?.referencePerson
        };

        update(companiesRef, {
            specialAbilities: data  // ✅ แก้พิมพ์ผิด
        })
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                setEdit(false);
                setCheck(false);
                setOpenDetail({});
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error(error);
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
        <Box sx={{ marginTop: 5, width: "100%" }}>
            <Grid container spacing={2} sx={{ marginBottom: 1 }}>
                <Grid item size={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูล{data}</Typography>
                </Grid>
            </Grid>
            <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
            <Grid container spacing={2}>
                <Grid item size={12}>
                    {
                        edit ?
                            <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                <TableExcel
                                    styles={{ height: "60vh" }} // ✅ ส่งเป็น object
                                    stylesTable={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}
                                    columns={otherColumns}
                                    initialData={other}
                                    onDataChange={handleOtherChange}
                                />
                            </Paper>
                            :
                            <React.Fragment>
                                <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.error.dark} >*กรณีต้องการดูข้อมูลอื่นๆรายคนให้กดชื่อในตารางได้เลย</Typography>
                                <TableContainer component={Paper} textAlign="center" sx={{ height: "60vh" }}>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                                <TablecellHeader>ชื่อ</TablecellHeader>
                                                <TablecellHeader>ตำแหน่ง</TablecellHeader>
                                                <TablecellHeader>ความสามารถพิเศษที่ 1</TablecellHeader>
                                                <TablecellHeader>ความสามารถพิเศษที่ 2</TablecellHeader>
                                                <TablecellHeader>ความสามารถพิเศษที่ 3</TablecellHeader>
                                                <TablecellHeader>ความเร็วในการพิมพ์ภาษาไทย</TablecellHeader>
                                                <TablecellHeader>ความเร็วในการพิมพ์ภาษาอังกฤษ</TablecellHeader>
                                                <TablecellHeader>ประสบการณ์อื่นๆ</TablecellHeader>
                                                <TablecellHeader>บุคคลอ้างอิง</TablecellHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                other.length === 0 ?
                                                    <TableRow>
                                                        <TablecellNoData colSpan={10}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                    </TableRow>
                                                    :
                                                    other.map((row, index) => (
                                                        <TableRow
                                                            key={index}
                                                            onClick={() => setOpenDetail(row)}
                                                            onMouseEnter={() => setHoveredEmpCode(row.employeecode)}
                                                            onMouseLeave={() => setHoveredEmpCode(null)}
                                                            sx={{
                                                                cursor: hoveredEmpCode === row.employeecode ? 'pointer' : 'default',
                                                                backgroundColor: hoveredEmpCode === row.employeecode ? theme.palette.primary.light : 'inherit',
                                                            }}
                                                        >
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{index + 1}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.employname}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.position}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.specialAbilities1}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.specialAbilities2}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.specialAbilities3}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.printingSpeedTH}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.printingSpeedENG}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.otherProjects}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.referencePerson}</TableCell>
                                                        </TableRow>
                                                    ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </React.Fragment>
                    }
                </Grid>
                <Grid item size={12}>
                    {
                        edit ?
                            <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                                <Button variant="contained" fullWidth color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                                <Button variant="contained" fullWidth color="success" onClick={handleSave} >บันทึก</Button>
                            </Box>
                            :
                            <Button
                                variant="contained"
                                color="warning"
                                fullWidth
                                sx={{
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textTransform: "none", // ป้องกันตัวอักษรเป็นตัวใหญ่ทั้งหมด
                                }}
                                onClick={() => setEdit(true)}
                                endIcon={<ManageAccountsIcon fontSize="large" />}
                            >
                                แก้ไขข้อมูลภาษา
                            </Button>
                    }
                </Grid>
                {/* {
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
                } */}
            </Grid>
            {/* {
                edit &&
                <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                    <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                    <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                </Box>
            } */}

            {
                openDetail && Object.keys(openDetail).length > 0 && (
                    <Dialog
                        open
                        onClose={() => setOpenDetail({})}
                        PaperProps={{
                            sx: {
                                borderRadius: 4, // ค่าตรงนี้คือความมน ยิ่งมากยิ่งมน (ค่า default คือ 1 หรือ 4px)
                                width: "600px",
                                height: "90vh", // <<< เท่ากับ Dialog หลัก
                                position: "absolute",
                            },
                        }}
                    >
                        <DialogTitle
                            sx={{
                                textAlign: "center",
                                fontWeight: "bold"
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item size={10}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>จัดการข้อมูลอื่นๆ</Typography>
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
                                height: "300px", // หรือความสูง fixed ที่คุณใช้
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
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ความสามารถพิเศษ</Typography>
                                    <Grid container spacing={1}>
                                        <Grid item size={1}>
                                            <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold" >1.</Typography>
                                        </Grid>
                                        <Grid item size={11}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={openDetail?.specialAbilities1}
                                                disabled={!check}
                                                onChange={(e) => handleDetailChange("specialAbilities1", e.target.value)}
                                            // onChange={(e) => setSpecialAbilities1(e.target.value)}
                                            // placeholder="กรุณากรอกความสามารถเฉพาะทาง"
                                            />
                                        </Grid>
                                        <Grid item size={1}>
                                            <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold" >2.</Typography>
                                        </Grid>
                                        <Grid item size={11}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={openDetail?.specialAbilities2}
                                                disabled={!check}
                                                onChange={(e) => handleDetailChange("specialAbilities2", e.target.value)}
                                            // onChange={(e) => setSpecialAbilities2(e.target.value)}
                                            // placeholder="กรุณากรอกความสามารถเฉพาะทาง"
                                            />
                                        </Grid>
                                        <Grid item size={1}>
                                            <Typography variant="subtitle2" sx={{ marginTop: 1, textAlign: "right" }} fontWeight="bold" >3.</Typography>
                                        </Grid>
                                        <Grid item size={11}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={openDetail?.specialAbilities3}
                                                disabled={!check}
                                                onChange={(e) => handleDetailChange("specialAbilities3", e.target.value)}
                                            // onChange={(e) => setSpecialAbilities3(e.target.value)}
                                            // placeholder="กรุณากรอกความสามารถเฉพาะทาง"
                                            />
                                        </Grid>
                                        {/* <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ความสามารถในการขับขี่</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="กรุณากรอกความสามารถในการขับขี่"
                                    />
                                </Grid> */}
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >ความเร็วในการพิมพ์</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item size={6}>
                                                    <Typography variant="subtitle2" fontWeight="bold" >ไทย</Typography>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={openDetail?.printingSpeedTH}
                                                        disabled={!check}
                                                        onChange={(e) => handleDetailChange("printingSpeedTH", e.target.value)}
                                                    // onChange={(e) => setPrintingSpeedTH(e.target.value)}
                                                    // placeholder="กรุณากรอกความเร็วในการพิมพ์ภาษาไทย"
                                                    />
                                                </Grid>
                                                <Grid item size={6}>
                                                    <Typography variant="subtitle2" fontWeight="bold" >อังกฤษ</Typography>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={openDetail?.printingSpeedENG}
                                                        disabled={!check}
                                                        onChange={(e) => handleDetailChange("printingSpeedENG", e.target.value)}
                                                    // onChange={(e) => setPrintingSpeedENG(e.target.value)}
                                                    // placeholder="กรุณากรอกความเร็วในการพิมพ์ภาษาอังกฤษ"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >โครงการ ผลงาน และประสบการณ์อื่นๆ</Typography>
                                            <TextField
                                                type="text"
                                                size="small"
                                                value={openDetail?.otherProjects}
                                                onChange={(e) => handleDetailChange("otherProjects", e.target.value)}
                                                // onChange={(e) => setOtherProject(e.target.value)}
                                                multiline
                                                rows={3}
                                                fullWidth
                                                disabled={!check}
                                            // placeholder="กรุณากรอกโครงการ ผลงาน และประสบการณ์อื่นๆ"
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >บุคคลอ้างอิง</Typography>
                                            <TextField
                                                type="text"
                                                size="small"
                                                value={openDetail?.referencePerson}
                                                onChange={(e) => handleDetailChange("referencePerson", e.target.value)}
                                                // onChange={(e) => setReferencePerson(e.target.value)}
                                                multiline
                                                rows={3}
                                                fullWidth
                                                disabled={!check}
                                            // placeholder="กรุณากรอกชื่อบุคคลอ้างอิง"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item size={12}>
                                    <Divider sx={{ marginTop: 1 }} />
                                </Grid>
                                {/* <Grid item size={12} textAlign="center">
                                    {
                                        !check ?
                                            <Button variant="outlined" color="warning" size="small" onClick={() => setCheck(true)}>
                                                แก้ไขข้อมูล
                                            </Button>
                                            :
                                            <React.Fragment>
                                                <Button variant="contained" color="error" size="small" sx={{ mr: 2 }} onClick={() => setCheck(false)}>
                                                    ยกเลิก
                                                </Button>
                                                <Button variant="contained" color="success" size="small" onClick={() => setCheck(false)}>
                                                    บันทึก
                                                </Button>
                                            </React.Fragment>
                                    }
                                </Grid> */}
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ borderTop: `1px solid ${theme.palette.primary.dark}`, display: "flex", alignItems: "center", justifyContent: "center", height: "55px" }}>
                            {
                                !check ?
                                    <Button variant="contained" color="warning" size="small" onClick={() => setCheck(true)}>
                                        แก้ไขข้อมูล
                                    </Button>
                                    :
                                    <React.Fragment>
                                        <Button variant="contained" color="error" size="small" sx={{ mr: 2 }} onClick={() => setCheck(false)}>
                                            ยกเลิก
                                        </Button>
                                        <Button variant="contained" color="success" size="small" onClick={handleUpdate}>
                                            บันทึก
                                        </Button>
                                    </React.Fragment>
                            }
                        </DialogActions>
                    </Dialog>
                )
            }
        </Box>
    )
}

export default OtherDetail