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
import dayjs from "dayjs";

const TrainingDetail = (props) => {
    const { menu, data } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const companyId = companyName?.split(":")[0];

    const [edit, setEdit] = useState("");

    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    //const [personal, setPersonal] = useState([]); // จะถูกกรองจาก allEmployees

    const toDateString = (dateObj) => {
        if (!dateObj || !dateObj.day || !dateObj.month || !dateObj.year) return '';

        const { day, month, year } = dateObj;
        const gregorianYear = Number(year) - 543;
        const date = dayjs(`${gregorianYear}-${month}-${day}`, "YYYY-M-D");
        return date.format("DD/MM/YYYY"); // 👉 "01/03/2025"
    };

    const toDateObject = (dateStr) => {
        if (!dateStr) return { day: '', month: '', year: '' };

        const date = dayjs(dateStr, "DD/MM/YYYY");
        return {
            day: date.date(),
            month: date.month() + 1,
            year: String(date.year() + 543),
        };
    };

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
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                course: train.course || "",
                dateEnd: toDateString(train.dateEnd) || "",
                dateStart: toDateString(train.dateStart) || "",
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
                employname: `${emp.employname} (${emp.nickname})`,
                position,
                course: "-",
                dateEnd: "-",
                dateStart: "-",
                file: null,
                fileType: "",
                institution: "-",
                isFirst: true,
                rowSpan: 1,
            });
        }
    });

    const trainingColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },
        { label: "วันที่", key: "dateStart", type: "date" },
        { label: "จนถึง", key: "dateEnd", type: "date" },
        { label: "สถาบัน", key: "institution", type: "text" },
        { label: "หลักสูตร", key: "course", type: "text" },
        {
            label: "ประเภทไฟล์",
            key: "fileType",
            type: "select",
            options: [
                { value: "pdf", label: "pdf" },
                { value: "image", label: "image" }
            ],
        },
        { label: "ไฟล์", key: "file", type: "file" },
    ];

    const handleTraningChange = (updatedList) => {
        const empTrainingMap = {};

        updatedList.forEach(row => {
            const name = row.employname;
            if (!empTrainingMap[name]) {
                empTrainingMap[name] = [];
            }

            const institution = (row.institution || '').trim();
            if (institution && institution !== '-') {
                empTrainingMap[name].push({
                    course: (row.course || '').trim(),
                    dateStart: row.dateStart ? toDateObject(row.dateStart) : { day: '', month: '', year: '' },
                    dateEnd: row.dateEnd ? toDateObject(row.dateEnd) : { day: '', month: '', year: '' },
                    file: row.file || null,
                    fileType: row.fileType, // ทำให้แน่ใจว่าเป็น boolean
                    institution,
                });
            }
        });

        const merged = employees.map(emp => ({
            ...emp,
            trainingList: empTrainingMap[emp.employname] || [],
        }));

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
                                    columns={trainingColumns}
                                    initialData={trainingRows}
                                    onDataChange={handleTraningChange}
                                />
                            </Paper>
                            :
                            <TableContainer component={Paper} textAlign="center" sx={{ height: "50vh" }}>
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "2000px" }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader rowSpan={2} sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader rowSpan={2}>ชื่อ</TablecellHeader>
                                            <TablecellHeader rowSpan={2}>ตำแหน่ง</TablecellHeader>
                                            <TablecellHeader rowSpan={2}>วันที่เริ่มต้น</TablecellHeader>
                                            <TablecellHeader rowSpan={2}>จนถึงวันที่</TablecellHeader>
                                            <TablecellHeader rowSpan={2}>สถานบัน</TablecellHeader>
                                            <TablecellHeader rowSpan={2}>หลักสูตร</TablecellHeader>
                                            <TablecellHeader colSpan={2}>file</TablecellHeader>
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
                                                    <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                </TableRow>
                                                :
                                                trainingRows.map((row, index) => (
                                                    <TableRow>
                                                        {row.isFirst && (
                                                            <>
                                                                <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "center" }}>{row.employname}</TableCell>
                                                                <TableCell rowSpan={row.rowSpan} sx={{ textAlign: "center" }}>{row.position}</TableCell>
                                                            </>
                                                        )}
                                                        <TableCell sx={{ textAlign: "center" }}>{row.dateStart}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.dateEnd}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.institution}</TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>{row.course}</TableCell>
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

export default TrainingDetail