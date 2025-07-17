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
import CloseIcon from '@mui/icons-material/Close';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import theme from "../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany, IconButtonError } from "../../../theme/style"
import { HTTP } from "../../../server/axios";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import MuiExcelLikeTable from "../test";
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AddEmployee = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    //const { companyName } = useParams();
    const [editEmployee, setEditEmployee] = useState(false);
    const [editDepartment, setEditDepartment] = useState(false);
    const [editPosition, setEditPosition] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [employee, setEmployee] = useState([{ ID: 0, name: '', employeenumber: '' }]);
    const [department, setDepartment] = useState([{ DepartmentName: '', Section: '' }]);
    const [position, setPosition] = useState([{ PositionName: '', DepartmentName: '', employee: '' }]);
    const employeeOptions = Array.from({ length: 10 }, (_, i) => ({
        value: `${i + 1}`,
        label: `${i + 1}`,
    }));
    const columns = [
        { label: "ชื่อ", key: "name", type: "text", width: "60%" },
        {
            label: "ระดับ",
            key: "employeenumber",
            type: "select",
            options: employeeOptions,
        },
    ];

    console.log("employee : ", employee);

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

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

        const employeeRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(employeeRef, (snapshot) => {
            const employeeData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!employeeData) {
                setEmployee([{ ID: 0, name: '', employeenumber: '' }]);
            } else {
                setEmployee(employeeData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);



    // const handleChange = (setFn) => (changes, source) => {
    //     if (source === 'loadData' || !changes) return;

    //     setFn((prev) => {
    //         const newData = [...prev];
    //         let hasChange = false;

    //         changes.forEach(([row, prop, oldVal, newVal]) => {
    //             if (oldVal !== newVal) {
    //                 newData[row][prop] = newVal;
    //                 hasChange = true;
    //             }
    //         });

    //         return hasChange ? newData : prev;
    //     });
    // };


    // const handleAddRow = (type) => {
    //     if (type === 'employee') {
    //         const newRow = { Name: '', employee: '' };
    //         setEmployee((prev) => [...prev, newRow]);
    //     } else if (type === 'department') {
    //         const newRow = { DepartmentName: '', Section: '' };
    //         setDepartment((prev) => [...prev, newRow]);
    //     } else if (type === 'position') {
    //         const newRow = { PositionName: '', DepartmentName: '', employee: '' };
    //         setPosition((prev) => [...prev, newRow]);
    //     }
    // };

    // const handleRemoveRow = (type) => {
    //     if (type === 'employee') {
    //         setEmployee((prev) => prev.slice(0, -1));
    //     } else if (type === 'department') {
    //         setDepartment((prev) => prev.slice(0, -1));
    //     } else if (type === 'position') {
    //         setPosition((prev) => prev.slice(0, -1));
    //     }
    // };

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const invalidMessages = [];

        employee.forEach((row, rowIndex) => {
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
        const names = employee.map(row => row.name?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
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
        set(companiesRef, employee)
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
        <React.Fragment>
            <Button variant="contained" onClick={handleClickOpen}>
                เพิ่มพนักงาน
            </Button>
            <Dialog
                open={open}
                slots={{
                    transition: Transition,
                }}
                keepMounted
                onClose={handleClose}
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 4, // ค่าตรงนี้คือความมน ยิ่งมากยิ่งมน (ค่า default คือ 1 หรือ 4px)
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: theme.palette.primary.dark,
                        color: "white",
                        height: "50px",
                        paddingTop: -1
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item size={10}>
                            เพิ่มรายชื่อพนักงาน
                        </Grid>
                        <Grid item size={2} sx={{ textAlign: "right" }}>
                            <IconButtonError sx={{ marginTop: -2 }}>
                                <CloseIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent sx={{ p: 5 }}>
                    <Grid container spacing={2} marginTop={3} sx={{ width: "600px" }}>
                        <Grid item size={12}>
                            <Typography variant="subtitle1" textAlign="center" fontWeight="bold" >ข้อมูลส่วนบุคคล</Typography>
                            <Divider />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ชื่อ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >นามสกุล</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >เพศ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >สถานภาพทางการทหาร</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >วันเกิด</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >เดือน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={4}>
                            <Typography variant="subtitle2" fontWeight="bold" >ปี</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >สัญชาติ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ศาสนา</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2"><b>น้ำหนัก</b>(กิโลกรัม)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2"><b>ส่วนสูง</b>(เซนติเมตร)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >สถานภาพ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >เบอร์โทรศัพท์</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >โทรศัพท์บ้าน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >LINE ID</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ประเทศ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >ที่อยู่ปัจจุบัน</Typography>
                            <TextField
                                type="text"
                                size="small"
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >จังหวัด</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >เขต/อำเภอ</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >แขวง/ตำบล</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >รหัสไปรณีย์</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="subtitle2" fontWeight="bold" >พาหนะส่วนตัว</Typography>
                            <TextField
                                fullWidth
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ display: "flex", justifyContent: "center", alignItems: "center", borderTop: `1px solid ${theme.palette.primary.main}` }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" onClick={handleClose}>บันทึก</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

export default AddEmployee