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
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { database } from "../../../server/firebase";
import ThaiAddressSelector from "../../../theme/ThaiAddressSelector";
import ThaiDateSelector from "../../../theme/ThaiDateSelector";

const TrainingDetail = (props) => {
    const { menu, data } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];
    const [check, setCheck] = useState(false);

    const [edit, setEdit] = useState("");
    const [openDetail, setOpenDetail] = useState("");
    const [thailand, setThailand] = useState([]);
    const [hoveredEmpCode, setHoveredEmpCode] = useState(null);
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

    const trainingRows = [];

    // const language = employees.map(emp => ({
    //     employname: emp.employname,
    //     position: emp.position.split("-")[1],
    //     languageList: emp.languageList || '',
    // }));

    employees.forEach(emp => {
        const position = emp.position.split("-")[1];
        const trains = emp.trainingList || [];

        trains.forEach((train, trainIdx) => {
            trainingRows.push({
                ID: emp.ID,
                employeecode: emp.employeecode,
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                course: train.course || "",
                dateStart: train.dateStart || '',
                dateEnd: train.dateEnd || '',
                dateS: formatToGregorian(train.dateStart || ''),
                dateE: formatToGregorian(train.dateEnd || ''),
                file: train.file || null,
                fileType: train.fileType || "",
                institution: train.institution || "",
                isFirst: trainIdx === 0,
                rowSpan: trains.length,
            });
        });

        // ถ้าไม่มีภาษาเลยก็ใส่แถวว่างไว้
        if (trains.length === 0) {
            trainingRows.push({
                ID: emp.ID,
                employeecode: emp.employeecode,
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                course: "-",
                dateEnd: "-",
                dateStart: "-",
                dateE: "",
                dateS: "",
                file: null,
                fileType: "",
                institution: "-",
                isFirst: true,
                rowSpan: 1,
            });
        }
    });

    const trainingColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true, width: 200, sticky: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true, width: 150 },
        { label: "วันที่เริ่มต้น", key: "dateS", type: "date", width: 80 },
        { label: "จนถึงวันที่", key: "dateE", type: "date", width: 80 },
        { label: "สถาบัน", key: "institution", type: "text", width: 150 },
        { label: "หลักสูตร", key: "course", type: "text", width: 150 },
        {
            label: "ประเภทไฟล์",
            key: "fileType",
            type: "select",
            width: 150,
            options: [
                { value: "pdf", label: "เอกสาร (PDF)" },
                { value: "image", label: "รูปภาพ (Image)" },
            ],
        },
        { label: "ไฟล์", key: "file", type: "file", width: 150 },
    ];

    const handleTraningChange = (updatedList) => {
        const empTrainingMap = {};

        console.log("updatedList : ", updatedList);

        updatedList.forEach((row, idx) => {
            // แยกชื่อและชื่อเล่นจาก row.employname
            const match = row.employname.match(/^(.*) \((.*)\)$/); // แยก "ชื่อ (ชื่อเล่น)"
            if (!match) return;

            const fullName = match[1].trim();     // เช่น "นราวิชญ์ สุบินนาม"
            const nickname = match[2].trim();     // เช่น "อาร์ม"

            const matchedEmp = employees.find(emp => {
                return emp.employname.trim() === fullName && emp.nickname.trim() === nickname;
            });

            if (!matchedEmp) return; // ไม่เจอข้ามไปเลย

            const key = `${matchedEmp.ID}`;

            console.log("1.key : ", key);
            console.log("dateStart : ", row.dateStart);

            if (!empTrainingMap[key]) {
                empTrainingMap[key] = [];
            }

            if (row.employname && row.employname !== '-') {
                empTrainingMap[key].push({
                    course: row.course,
                    dateStart: updatedList[idx].dateS ? parseFromGregorian(updatedList[idx].dateS) : null,
                    dateEnd: updatedList[idx].dateE ? parseFromGregorian(updatedList[idx].dateE) : null,
                    file: row.file || null,
                    fileType: row.fileType,
                    institution: row.institution,
                });
            }
        });

        const merged = employees.map(emp => {
            const key = `${emp.ID}`;
            console.log("2.key : ", key);
            return {
                ...emp,
                trainingList: empTrainingMap[key] || [],
            };
        });

        console.log("empTrainingMap : ", empTrainingMap);

        setEmployees(merged);
    };


    console.log("trainingRows : ", trainingRows);

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
            trainingColumns.forEach((col) => {
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
            trainingList: (emp.trainingList || []).map(train => ({
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

    const handleDetailChange = (index, field, value) => {
        setOpenDetail(prev => {
            const updatedList = prev.trainingList.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            );

            return {
                ...prev,
                trainingList: updatedList
            };
        });
    };

    const handleAdd = () => {
        setOpenDetail(prev => ({
            ...prev,
            trainingList: [
                ...prev.trainingList,
                {
                    course: "",
                    dateEnd: null,
                    dateStart: null,
                    dateE: "",
                    dateS: "",
                    fileType: "",
                    institution: ""
                }
            ]
        }));
    };

    const handleRemove = (index) => {
        setOpenDetail(prev => ({
            ...prev,
            trainingList: prev.trainingList.filter((_, idx) => idx !== index)
        }));
    };

    const handleCancel = () => {
        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val() || [{ ID: 0, name: '', employeenumber: '' }];
            setEmployees(employeeData);
            setEdit(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    const handleUpdate = () => {
        if (openDetail?.ID === undefined || openDetail?.ID === null) {
            return ShowError("ไม่พบข้อมูลพนักงาน");
        }

        // ✅ Process trainingList ก่อน save
        const cleanTraining = openDetail.trainingList?.map(item => {
            return {
                ...item,

                // ถ้ามี dateStart ใช้เลย ถ้าไม่มีให้แปลงจาก dateS
                dateStart: item.dateStart !== null ? item.dateStart : parseFromGregorian(item.dateS),

                // ถ้ามี dateEnd ใช้เลย ถ้าไม่มีให้แปลงจาก dateE
                dateEnd: item.dateEnd !== null ? item.dateEnd : parseFromGregorian(item.dateE)
            };
        }).map(({ dateS, dateE, ...rest }) => rest);
        // 👆 ลบ dateS, dateE ออกจาก object

        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${openDetail.ID}`);

        update(companiesRef, {
            trainingList: cleanTraining
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

    console.log("trainingRows : ", trainingRows);
    console.log("openDetal : ", openDetail);

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
                                    types="list"
                                    columns={trainingColumns}
                                    initialData={trainingRows}
                                    onDataChange={handleTraningChange}
                                />
                            </Paper>
                            :
                            <React.Fragment>
                                <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.error.dark} >*กรณีต้องการดูข้อมูลการฝึกอบรมรายคนให้กดชื่อในตารางได้เลย</Typography>
                                <TableContainer component={Paper} textAlign="center" sx={{ height: "60vh" }}>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                        <TableHead
                                            sx={{
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 3,
                                            }}
                                        >
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader rowSpan={2} sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                                <TablecellHeader rowSpan={2} sx={{ width: 200, position: "sticky", left: 0, zIndex: 2, backgroundColor: theme.palette.primary.dark }}>ชื่อ</TablecellHeader>
                                                <TablecellHeader rowSpan={2} sx={{ width: 150 }}>ตำแหน่ง</TablecellHeader>
                                                <TablecellHeader rowSpan={2} sx={{ width: 80 }}>วันที่เริ่มต้น</TablecellHeader>
                                                <TablecellHeader rowSpan={2} sx={{ width: 80 }}>จนถึงวันที่</TablecellHeader>
                                                <TablecellHeader rowSpan={2} sx={{ width: 150 }}>สถานบัน</TablecellHeader>
                                                <TablecellHeader rowSpan={2} sx={{ width: 150 }}>หลักสูตร</TablecellHeader>
                                                <TablecellHeader colSpan={2} sx={{ width: 300 }}>file</TablecellHeader>
                                            </TableRow>
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader>เอกสาร</TablecellHeader>
                                                <TablecellHeader>รูปภาพ</TablecellHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                trainingRows.length === 0 ?
                                                    <TableRow>
                                                        <TablecellNoData colSpan={9}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                    </TableRow>
                                                    :
                                                    trainingRows.map((row, index) => (
                                                        <TableRow
                                                            onClick={() => {
                                                                const rows = trainingRows.filter(r => r.ID === row.ID);

                                                                const detail = {
                                                                    ID: rows[0].ID,
                                                                    employeecode: rows[0].employeecode,
                                                                    employname: rows[0].employname,
                                                                    position: rows[0].position,
                                                                    trainingList: rows.map(r => ({
                                                                        course: r.course,
                                                                        dateEnd: r.dateEnd,
                                                                        dateStart: r.dateStart,
                                                                        dateE: r.dateE,
                                                                        dateS: r.dateS,
                                                                        fileType: r.fileType,
                                                                        institution: r.institution
                                                                    }))
                                                                };

                                                                setOpenDetail(detail);
                                                            }}
                                                            onMouseEnter={() => setHoveredEmpCode(row.ID)}
                                                            onMouseLeave={() => setHoveredEmpCode(null)}
                                                            sx={{
                                                                cursor: hoveredEmpCode === row.ID ? 'pointer' : 'default',
                                                                backgroundColor: hoveredEmpCode === row.ID ? theme.palette.primary.light : 'inherit',
                                                            }}
                                                        >
                                                            {row.isFirst && (
                                                                <>
                                                                    <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.ID ? 'bold' : 'normal' }}>{index + 1}</TableCell>
                                                                    <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "left" }}>
                                                                        <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: hoveredEmpCode === row.ID ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>
                                                                            {row.employname}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "left" }}>
                                                                        <Typography variant="subtitle2" sx={{ marginLeft: 2, fontWeight: hoveredEmpCode === row.ID ? 'bold' : 'normal', whiteSpace: "nowrap" }} gutterBottom>
                                                                            {row.position}
                                                                        </Typography>
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.ID ? 'bold' : 'normal' }}>{row.dateS}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.ID ? 'bold' : 'normal' }}>{row.dateE}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.ID ? 'bold' : 'normal' }}>{row.institution}</TableCell>
                                                            <TableCell sx={{ textAlign: "center", fontWeight: hoveredEmpCode === row.ID ? 'bold' : 'normal' }}>{row.course}</TableCell>
                                                            {
                                                                row.fileType === "pdf" ?
                                                                    (
                                                                        <React.Fragment>
                                                                            <TableCell sx={{ textAlign: "center" }}>{row.file}</TableCell>
                                                                            <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                                        </React.Fragment>
                                                                    )
                                                                    :
                                                                    row.fileType === "image" ?
                                                                        (
                                                                            <React.Fragment>
                                                                                <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                                                <TableCell sx={{ textAlign: "center" }}>{row.file}</TableCell>
                                                                            </React.Fragment>
                                                                        )
                                                                        :
                                                                        (
                                                                            <React.Fragment>
                                                                                <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                                                <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                                            </React.Fragment>
                                                                        )
                                                            }
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
                                แก้ไขข้อมูลการฝึกอบรม
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

            {openDetail && Object.keys(openDetail).length > 0 && (
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
                            {openDetail?.trainingList
                                .map((row, idx) => (
                                    <React.Fragment key={idx}>
                                        <Grid item size={10}>
                                            <Typography variant="subtitle1" color="warning.main" fontWeight="bold">
                                                ลำดับที่ {idx + 1}
                                            </Typography>
                                        </Grid>
                                        <Grid item size={2} textAlign="right">
                                            {trainingRows.length > 1 && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    disabled={!check}
                                                    onClick={() => handleRemove(idx)}
                                                >
                                                    ลบ
                                                </Button>
                                            )}
                                        </Grid>

                                        <Grid item size={12}>
                                            <ThaiDateSelector
                                                label="เริ่มตั้งแต่วันที่"
                                                value={row.dateStart}
                                                disabled={!check}
                                                onChange={(val) => handleDetailChange(idx, "dateStart", val)}
                                            // onChange={(val) =>
                                            //     handleTrainingChange(index, "dateStart", val)
                                            // }
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <ThaiDateSelector
                                                label="จนถึง"
                                                value={row.dateEnd}
                                                disabled={!check}
                                                onChange={(val) => handleDetailChange(idx, "dateEnd", val)}
                                            // onChange={(val) =>
                                            //     handleTrainingChange(index, "dateEnd", val)
                                            // }
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >สถาบัน</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={row.institution}
                                                disabled={!check}
                                                onChange={(e) => handleDetailChange(idx, "institution", e.target.value)}
                                                // onChange={(e) =>
                                                //     handleTrainingChange(index, "institution", e.target.value)
                                                // }
                                                placeholder="กรุณากรอกชื่อสถาบัน"
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" >หลักสูตร</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={row.course}
                                                disabled={!check}
                                                onChange={(e) => handleDetailChange(idx, "course", e.target.value)}
                                                // onChange={(e) =>
                                                //     handleTrainingChange(index, "course", e.target.value)
                                                // }
                                                placeholder="กรุณากรอกหลักสูตร"
                                            />
                                        </Grid>
                                        <Grid item size={12}>
                                            <Divider sx={{ marginTop: 1 }} />
                                        </Grid>
                                    </React.Fragment>
                                ))}
                            {
                                check &&
                                <React.Fragment>
                                    <Grid item size={12}>
                                        <Divider />
                                    </Grid>
                                    <Grid item size={12} textAlign="center">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="info"
                                            onClick={handleAdd}
                                        >
                                            เพิ่มข้อมูลการฝึกอบรม
                                        </Button>
                                    </Grid>
                                </React.Fragment>
                            }
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
            )}
        </Box>
    )
}

export default TrainingDetail