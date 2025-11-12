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
import dayjs from "dayjs";
import { database } from "../../../server/firebase";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import ThaiDateSelector from "../../../theme/ThaiDateSelector";
import ThaiAddressSelector from "../../../theme/ThaiAddressSelector";

const InternshipDetail = (props) => {
    const { menu, data } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [thailand, setThailand] = useState([]);
    const [openDetail, setOpenDetail] = useState({});
    const [hoveredEmpCode, setHoveredEmpCode] = useState(null);
    const [check, setCheck] = useState(false);

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

    const [edit, setEdit] = useState("");

    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    //const [personal, setPersonal] = useState([]); // จะถูกกรองจาก allEmployees

    function formatToGregorian(birthDate) {
        if (!birthDate || !birthDate.day || !birthDate.month || !birthDate.year) {
            return ""; // ถ้าไม่มีข้อมูล ให้คืนค่าว่าง
        }

        const day = String(birthDate.day).padStart(2, "0");
        const month = String(birthDate.month).padStart(2, "0");
        const year = parseInt(birthDate.year, 10) - 543; // พ.ศ. → ค.ศ.

        return `${day}/${month}/${year}`;
    }

    // ฟังก์ชันแปลงกลับจาก DD/MM/YYYY → birthDate Object (พ.ศ.)
    function parseFromGregorian(dateStr) {
        if (!dateStr) return null;

        const [day, month, year] = dateStr.split("/");

        if (!day || !month || !year) return null;

        return {
            day: Number(day),
            month: Number(month),
            year: (Number(year) + 543).toString() // ค.ศ. → พ.ศ.
        };
    }

    const internship = employees.map(emp => ({
        ID: emp.ID,
        employeecode: emp.employeecode,
        employname: `${emp.employname} (${emp.nickname})` || '',
        position: emp.position ? emp.position.split("-")[1] ?? emp.position : '',
        dateStart: emp.internship?.dateStart || '',
        dateEnd: emp.internship?.dateEnd || '',
        dateS: formatToGregorian(emp.internship?.dateStart || ''),
        dateE: formatToGregorian(emp.internship?.dateEnd || ''),
        address: emp.personal?.address || '',
        company: emp.internship?.company || '',
        province: emp.internship?.address?.province || '',
        amphure: emp.internship?.address?.amphure || '',
        tambon: emp.internship?.address?.tambon || '',
        zipCode: emp.internship?.address?.zipCode || '',
        positionIntern: emp.internship?.position || '',
        positionType: emp.internship?.positionType || '',
        level: emp.internship?.level || '',
        salary: emp.internship?.salary || '',
        note: emp.internship?.note || '',
    }));

    const internshipColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true, width: 300 },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true, width: 200 },
        { label: "วันที่เริ่มต้น", key: "dateS", type: "date", width: 180 },
        { label: "จนถึงวันที่", key: "dateE", type: "date", width: 180 },
        { label: "ชื่อบริษัท", key: "company", type: "text", width: 250 },

        {
            label: "ตำบล",
            key: "tambon",
            type: "dependent-select",
            dependsOn: "amphure",
            width: 150,
            options: thailand.flatMap((p) =>
                (p.amphure || []).flatMap((a) =>
                    (a.tambon || []).map((t) => ({
                        label: t.name_th,
                        value: `${t.id}-${t.name_th}`,
                        parent: `${a.id}-${a.name_th}`,
                    }))
                )
            ),
        },

        {
            label: "อำเภอ",
            key: "amphure",
            type: "dependent-select",
            dependsOn: "province",
            width: 150,
            options: thailand.flatMap((p) =>
                (p.amphure || []).map((a) => ({
                    label: a.name_th,
                    value: `${a.id}-${a.name_th}`,
                    parent: `${p.id}-${p.name_th}`,
                }))
            ),
        },

        {
            label: "จังหวัด",
            key: "province",
            type: "select",
            width: 150,
            options: thailand.map((p) => ({
                label: p.name_th,
                value: `${p.id}-${p.name_th}`,
            })),
        },

        { label: "รหัสไปรณีย์", key: "zipCode", type: "text", disabled: true, width: 150 },
        { label: "ตำแหน่งงาน", key: "positionIntern", type: "text", width: 150 },
        { label: "ประเภทงาน", key: "positionType", type: "text", width: 150 },
        { label: "ระดับ", key: "level", type: "text", width: 100 },
        { label: "เงินเดือน", key: "salary", type: "text", width: 150 },
        { label: "รายละเอียดเพิ่มเติม", key: "note", type: "text", width: 200 },
    ];


    const handleInternshipChange = (updatedList) => {
        const merged = employees.map((emp, idx) => {
            const provinceKey = updatedList[idx].province;
            const amphureKey = updatedList[idx].amphure;
            const tambonKey = updatedList[idx].tambon;

            const [pId] = (provinceKey || "").split("-");
            const [aId] = (amphureKey || "").split("-");
            const [tId] = (tambonKey || "").split("-");

            // ค้นหา zipCode จาก thailand
            const province = thailand.find(p => `${p.id}` === pId);
            const amphure = province?.amphure.find(a => `${a.id}` === aId);
            const tambon = amphure?.tambon.find(t => `${t.id}` === tId);

            return {
                ...emp,
                internship: {
                    ...emp.internship,
                    dateStart: updatedList[idx].dateS ? parseFromGregorian(updatedList[idx].dateS) : null,
                    dateEnd: updatedList[idx].dateE ? parseFromGregorian(updatedList[idx].dateE) : null,
                    company: updatedList[idx].company,
                    address: {
                        province: provinceKey || '',
                        amphure: amphureKey || '',
                        tambon: tambonKey || '',
                        zipCode: tambon?.zip_code || '',
                    },
                    position: updatedList[idx].positionIntern,
                    positionType: updatedList[idx].positionType,
                    level: updatedList[idx].level,
                    salary: updatedList[idx].salary,
                    note: updatedList[idx].note
                },
            };
        });
        setEmployees(merged);  // หรือ setPersonal หากแยก state
    };

    console.log("internships : ", internship);

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
            internshipColumns.forEach((col) => {
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

    const handleDetailChange = (field, value) => {
        setOpenDetail(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    console.log("openDetail : ", openDetail);

    const handleUpdate = () => {
        if (openDetail?.ID === undefined || openDetail?.ID === null) {
            return ShowError("ไม่พบข้อมูลพนักงาน");
        }

        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${openDetail.ID}`);

        const data = {
            address: openDetail?.address || {
                amphure: openDetail?.amphure || "",
                province: openDetail?.province || "",
                tambon: openDetail?.tambon || "",
                zipCode: openDetail?.zipCode || ""
            },
            company: openDetail?.company,
            dateEnd: openDetail?.dateEnd || parseFromGregorian(openDetail?.dateE) || "",
            dateStart: openDetail?.dateStart || parseFromGregorian(openDetail?.dateS) || "",
            level: openDetail?.level,
            note: openDetail?.note,
            position: openDetail?.positionIntern,
            positionType: openDetail?.positionType,
            salary: openDetail?.salary
        };

        update(companiesRef, {
            internship: data  // ✅ แก้พิมพ์ผิด
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
                                    columns={internshipColumns}
                                    initialData={internship}
                                    onDataChange={handleInternshipChange}
                                />
                            </Paper>
                            :
                            <React.Fragment>
                                <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.error.dark} >*กรณีต้องการดูข้อมูลการทำงาน/ฝึกงานรายคนให้กดชื่อในตารางได้เลย</Typography>
                                <TableContainer component={Paper} textAlign="center" sx={{ height: "60vh" }}>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 300 }}>ชื่อ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 200 }}>ตำแหน่ง</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>วันที่เริ่มต้น</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>จนถึงวันที่</TablecellHeader>
                                                <TablecellHeader sx={{ width: 250 }}>ชื่อบริษัท</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>ตำบล</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>อำเภอ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>จังหวัด</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>รหัสไปรณีย์</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>ตำแหน่งงาน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>ประเภทงาน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>ระดับ</TablecellHeader>
                                                <TablecellHeader sx={{ width: 150 }}>เงินเดือน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 200 }}>รายละเอียดเพิ่มเติม</TablecellHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                internship.length === 0 ?
                                                    <TableRow>
                                                        <TablecellNoData colSpan={15}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                    </TableRow>
                                                    :
                                                    internship.map((row, index) => (
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
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.dateS}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.dateE}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.company}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.tambon.split("-")[1]}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.amphure.split("-")[1]}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.province.split("-")[1]}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.zipCode}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.positionIntern}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.positionType}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.level}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.salary}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.employeecode ? 'bold' : 'normal' }}>{row.note}</TableCell>
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
                                แก้ไขข้อมูลการทำงาน/ฝึกงาน
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
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>จัดการข้อมูลการทำงาน/ฝึกงาน</Typography>
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
                                    <ThaiDateSelector
                                        label="เริ่มตั้งแต่วันที่"
                                        value={openDetail?.dateStart}
                                        disabled={!check}
                                        onChange={(val) => handleDetailChange("dateStart", val)}
                                    //onChange={(val) => setDateStart(val)}
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <ThaiDateSelector
                                        label="จนถึงวันที่"
                                        value={openDetail?.dateEnd}
                                        disabled={!check}
                                        onChange={(val) => handleDetailChange("dateEnd", val)}
                                    //onChange={(val) => setDateEnd(val)}
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ชื่อบริษัท</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.company}
                                        disabled={!check}
                                        onChange={(e) => handleDetailChange("company", e.target.value)}
                                    // onChange={(e) => setInternshipCompany(e.target.value)}
                                    // placeholder="กรุณากรอกชื่อบริษัท"
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ที่อยู่</Typography>
                                    <TextField
                                        type="text"
                                        size="small"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        placeholder="กรุณากรอกที่อยู่"
                                        disabled={!check}
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <ThaiAddressSelector
                                        label="ที่อยู่ปัจจุบัน"
                                        thailand={thailand}
                                        value={openDetail?.address}
                                        disabled={!check}
                                        onChange={(val) => handleDetailChange("address", val)}
                                    // placeholder="กรุณากรอกที่อยู่ปัจจุบัน"
                                    // onChange={(val) => setInternshipAddress(val)}
                                    />
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ตำแหน่งงาน</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.positionIntern}
                                        disabled={!check}
                                        onChange={(e) => handleDetailChange("positionIntern", e.target.value)}
                                    // onChange={(e) => setInternshipPosition(e.target.value)}
                                    // placeholder="กรุณากรอกตำแหน่งงาน"
                                    />
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ประเภทงาน</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.positionType}
                                        disabled={!check}
                                        onChange={(e) => handleDetailChange("positionType", e.target.value)}
                                    // onChange={(e) => setInternshipTypeP(e.target.value)}
                                    // placeholder="กรุณากรอกประเภทงาน"
                                    />
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2" fontWeight="bold" >ระดับ</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.level}
                                        disabled={!check}
                                        onChange={(e) => handleDetailChange("level", e.target.value)}
                                    // onChange={(e) => setInternshipLevel(e.target.value)}
                                    // placeholder="กรุณากรอกระดับ"
                                    />
                                </Grid>
                                <Grid item size={6}>
                                    <Typography variant="subtitle2" fontWeight="bold" >เงินเดือน</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={openDetail?.salary}
                                        disabled={!check}
                                        onChange={(e) => handleDetailChange("salary", e.target.value)}
                                    // onChange={(e) => setInternshipSalary(e.target.value)}
                                    // placeholder="กรุณากรอกเงินเดือน"
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >รายละเอียด</Typography>
                                    <TextField
                                        type="text"
                                        size="small"
                                        value={openDetail?.note}
                                        // onChange={(e) => setInternshipNote(e.target.value)}
                                        multiline
                                        rows={3}
                                        fullWidth
                                        placeholder="กรุณากรอกรายละเอียด"
                                        disabled={!check}
                                        onChange={(e) => handleDetailChange("note", e.target.value)}
                                    />
                                </Grid>
                                <Grid item size={12}>
                                    <Divider />
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
                                        <Button variant="contained" color="success" size="small" onClick={handleUpdate} >
                                            บันทึก
                                        </Button>
                                    </React.Fragment>
                            }
                        </DialogActions>
                    </Dialog>
                )
            }
        </Box >
    )
}

export default InternshipDetail