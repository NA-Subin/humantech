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
import dayjs from "dayjs";

const DeductionDetail = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editDeduction, setEditDeduction] = useState(false);
    const [employees, setEmployees] = useState([]); // จะถูกกรองจาก allEmployees
    const [deduction, setDeduction] = useState([{ ID: 0, name: '' }]);
    const [document, setDocument] = useState([])
    const [documents, setDocuments] = useState([])

    console.log("DOCUMENT : ", document);
    console.log("DOCUMENTs : ", documents);

    const deductionActive = deduction.filter(row => row.status === 1);

    let deductionRows = [];

    if (!document || document.length === 0) {
        // กรณี document ว่าง
        employees.forEach((emp, index) => {
            const position = emp.position.split("-")[1];

            const row = {
                employid: emp.ID,
                employname: `${emp.employname} (${emp.nickname})`,
                position
            };

            deductionActive.forEach(inc => {
                row[`deduction${inc.ID}`] = 0;
            });

            deductionRows.push(row);
        });
    } else {
        // กรณี document มีข้อมูล
        deductionRows = document.map(emp => {
            const row = {
                employid: emp.employid,
                employname: emp.employname,
                position: emp.position
            };

            deductionActive.forEach(inc => {
                const found = Array.isArray(emp.deduction)
                    ? emp.deduction.find(i => i.deductionID === inc.ID)
                    : null;
                row[`deduction${inc.ID}`] = found ? Number(found.deduction) : 0;
            });

            return row;
        });
    }

    // const deductionRows = [];

    // employees.forEach(emp => {
    //     const position = emp.position.split("-")[1];
    //     const deductions = deduction.filter((row) => row.status === 1)

    //     // สร้าง object สำหรับแถวนี้
    //     const row = {
    //         employid: emp.ID,
    //         employname: `${emp.employname} (${emp.nickname})`,
    //         position
    //     };

    //     // ถ้ามี deductionsList
    //     if (deductions.length > 0) {
    //         deductions.forEach((inc, index) => {
    //             row[`deduction${inc.ID}`] = 0;
    //         });
    //     }

    //     deductionRows.push(row);
    // });

    // const deductionActive = deduction.filter(row => row.status === 1); // หรือส่งจากภายนอก

    // const deductionRowss = document.map(emp => {
    //     const row = {
    //         employid: emp.employid,
    //         employname: `${emp.employname} (${emp.nickname})`,
    //         position: emp.position
    //     };

    //     deductionActive.forEach(inc => {
    //         // deduction[inc.ID] อาจไม่มีอยู่ (ไม่ได้เลือก)
    //         row[`deduction${inc.ID}`] = Number(emp.deduction?.[inc.ID]?.deduction) ?? 0;
    //     });

    //     return row;
    // });


    console.log("deductionRows : ", deductionRows);
    //console.log("deductionRowss : ", deductionRowss);

    // สร้าง columns จาก deductionActive
    const DeductionColumns = [
        { label: "ชื่อ", key: "employname", type: "text", disabled: true },
        { label: "ตำแหน่ง", key: "position", type: "text", disabled: true },
        ...deductionActive.map(inc => ({
            label: inc.name,
            key: `income${inc.ID}`,
            type: "text"
        }))
    ];

    console.log("Column : ", DeductionColumns);

    const handleDeductionChange = (updatedList) => {
        const newDeduction = updatedList.map(row => {
            const { employid, employname, position, ...deductions } = row;

            const deductionArr = [];

            // สร้าง array ตามลำดับ index
            deductionActive.forEach((inc, idx) => {
                const key = `deduction${inc.ID}`;
                const value = deductions[key] ?? 0;

                deductionArr.push({
                    ID: idx,           // กำหนด ID ใหม่ เรียง 0,1,2,...
                    deductionID: inc.ID,  // เก็บ ID เดิมไว้
                    name: inc.name,
                    deduction: Number(value)
                });
            });

            return {
                employid,
                employname,
                position,
                deduction: deductionArr
            };
        });

        setDocuments(newDeduction);
    };

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const deductionRef = ref(firebaseDB, `workgroup/company/${companyId}/deductions`);

        const unsubscribe = onValue(deductionRef, (snapshot) => {
            const deductionData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!deductionData) {
                setDeduction([{ ID: 0, name: '' }]);
            } else {
                setDeduction(deductionData);
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
                setEmployees([]);
            } else {
                const employeeArray = Object.values(employeeData);
                setEmployees(employeeArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const documentRef = ref(firebaseDB, `workgroup/company/${companyId}/documentdeductions/${dayjs(new Date).format("YYYY/MM")}`);

        const unsubscribe = onValue(documentRef, (snapshot) => {
            const documentData = snapshot.val();

            if (!documentData) {
                setDocument([]);
            } else {
                const documentArray = Object.values(documentData);
                setDocument(documentArray); // default: แสดงทั้งหมด
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/documentdeductions/${dayjs(new Date).format("YYYY/MM")}`);

        const invalidMessages = [];

        // ตรวจสอบ deductionRows (ที่กรอกจากตาราง)
        deductionRows.forEach((row, rowIndex) => {
            DeductionColumns.forEach((col) => {
                const value = row[col.key];

                if (col.disabled) return; // ข้าม column ที่ disabled เช่น ชื่อ, ตำแหน่ง

                if (value === "" || value === undefined) {
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

        // ตรวจสอบซ้ำเฉพาะ field ที่ต้องการ เช่น employname หรือ deptname
        const names = deductionRows.map(row => row.employname?.trim()).filter(Boolean);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
            invalidMessages.push(`มีชื่อ: ${[...new Set(duplicates)].join(", ")} ซ้ำกัน`);
        }

        if (invalidMessages.length > 0) {
            ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
            return;
        }

        // ✅ บันทึกเข้า Firebase
        set(companiesRef, documents)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEditDeduction(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const incomeRef = ref(firebaseDB, `workgroup/company/${companyId}/documentdeductions/${dayjs(new Date).format("YYYY/MM")}`);

        onValue(incomeRef, (snapshot) => {
            const incomeData = snapshot.val() || [];
            setDocument(incomeData);
            setEditDeduction(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    return (
        <React.Fragment>
            <Grid container spacing={2}>
                <Grid item size={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>รายได้</Typography>
                </Grid>
                <Grid item size={12}>
                    <Divider sx={{ marginTop: -1 }} />
                </Grid>
                <Grid item size={editDeduction ? 12 : 11}>
                    {
                        editDeduction ?
                            <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                <TableExcel
                                    styles={{ height: "50vh" }} // ✅ ส่งเป็น object
                                    stylesTable={{ width: "1080px" }} // ✅ ส่งเป็น object
                                    columns={DeductionColumns}
                                    initialData={deductionRows}
                                    onDataChange={handleDeductionChange}
                                />
                            </Paper>
                            :
                            <TableContainer component={Paper} textAlign="center">
                                <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                            <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                            <TablecellHeader>ชื่อ</TablecellHeader>
                                            <TablecellHeader>ตำแหน่ง</TablecellHeader>
                                            {
                                                deduction.map((row, index) => (
                                                    row.status === 1 &&
                                                    <TablecellHeader>{row.name}</TablecellHeader>
                                                ))
                                            }
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {deductionRows.map((row, index) => (
                                            <TableRow key={row.employid}>
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.employname}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{row.position}</TableCell>
                                                {deduction
                                                    .filter(inc => inc.status === 1)
                                                    .map(inc => (
                                                        <TableCell key={inc.ID} sx={{ textAlign: "center" }}>
                                                            {row[`deduction${inc.ID}`] ?? 0}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                    }
                </Grid>
                {
                    !editDeduction &&
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
                                    textTransform: "none",
                                }}
                                onClick={() => setEditDeduction(true)}
                            >
                                <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                แก้ไข
                            </Button>
                        </Box>
                    </Grid>
                }
            </Grid>
            {
                editDeduction &&
                <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                    <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                    <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                </Box>
            }
        </React.Fragment>
    )
}

export default DeductionDetail