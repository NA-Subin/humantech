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

import { useNavigate, useParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { useFirebase } from "../../../server/ProjectFirebaseContext";

const TaxDetail = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const { companyName } = useParams();
    const [editTax, setEditTax] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [tax, setTax] = useState([
        {
            "id": 1,
            "summaryStart": 0,
            "summaryEnd": 150000,
            "tax": "0%",
            "note": "ได้รับการยกเว้นภาษี"
        },
        {
            "id": 2,
            "summaryStart": 150001,
            "summaryEnd": 300000,
            "tax": "5%",
            "note": "(เงินได้สุทธิ – 150,000) x 5%"
        },
        {
            "id": 3,
            "summaryStart": 300001,
            "summaryEnd": 500000,
            "tax": "10%",
            "note": "(เงินได้สุทธิ – 300,000) x 10% + 7,500"
        },
        {
            "id": 4,
            "summaryStart": 500001,
            "summaryEnd": 750000,
            "tax": "15%",
            "note": "(เงินได้สุทธิ – 500,000) x 15% + 27,500"
        },
        {
            "id": 5,
            "summaryStart": 750001,
            "summaryEnd": 1000000,
            "tax": "20%",
            "note": "(เงินได้สุทธิ – 750,000) x 20% + 65,000"
        },
        {
            "id": 6,
            "summaryStart": 1000001,
            "summaryEnd": 2000000,
            "tax": "25%",
            "note": "(เงินได้สุทธิ – 1,000,000) x 25% + 115,000"
        },
        {
            "id": 7,
            "summaryStart": 2000001,
            "summaryEnd": 5000000,
            "tax": "30%",
            "note": "(เงินได้สุทธิ – 2,000,000) x 30% + 365,000"
        },
        {
            "id": 8,
            "summaryStart": 5000001,
            "summaryEnd": null,
            "tax": "35%",
            "note": "(เงินได้สุทธิ – 5,000,000) x 35% + 1,265,000"
        }
    ]
    );

    const columns = [
        { label: "เริ่มต้น", key: "summaryStart", type: "text" },
        { label: "สิ้นสุด", key: "summaryEnd", type: "text" },
        { label: "อัตราภาษี", key: "tax", type: "text" },
        { label: "หมายเหตุ", key: "note", type: "text" }
    ];

    console.log("tax : ", tax);
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

        const taxRef = ref(firebaseDB, `workgroup/company/${companyId}/tax`);

        const unsubscribe = onValue(taxRef, (snapshot) => {
            const taxData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!taxData) {
                setTax([{ ID: 0, summaryStart: '', summaryEnd: '', tax: '', note: '' }]);
            } else {
                setTax(taxData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/tax`);

        const invalidMessages = [];

        tax.forEach((row, rowIndex) => {
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

        // ✅ ตรวจสอบว่า level.name ซ้ำหรือไม่
        const names = tax.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
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
        set(companiesRef, tax)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEditTax(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const taxRef = ref(firebaseDB, `workgroup/company/${companyId}/tax`);

        onValue(taxRef, (snapshot) => {
            const taxData = snapshot.val() || [{ ID: 0, summaryStart: '', summaryEnd: '', tax: '', note: '' }];
            setTax(taxData);
            setEditTax(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>ภาษี (Tax)</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลภาษี</Typography>
                    <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                    <Grid container spacing={2}>
                        <Grid item size={editTax ? 12 : 11}>
                            {
                                editTax ?
                                    <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                        <TableExcel
                                            columns={columns}
                                            initialData={tax}
                                            onDataChange={setTax}
                                        />
                                    </Paper>

                                    :
                                    <TableContainer component={Paper} textAlign="center">
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                    <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                                    <TablecellHeader sx={{ width: "40%" }}>เงินได้สุทธิ (บาท)</TablecellHeader>
                                                    <TablecellHeader sx={{ width: "20%" }}>อัตราภาษี</TablecellHeader>
                                                    <TablecellHeader>หมายเหตุ</TablecellHeader>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    tax.length === 0 ?
                                                        <TableRow>
                                                            <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                        </TableRow>
                                                        :
                                                        tax.map((row, index) => (
                                                            <TableRow>
                                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    <Grid container sx={{ marginLeft: -5 }}>
                                                                        <Grid item size={5.5} sx={{ textAlign: "right" }}>
                                                                            {
                                                                                new Intl.NumberFormat("en-US").format(row.summaryStart)
                                                                            }
                                                                        </Grid>
                                                                        <Grid item size={1} sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                                            {row.summaryEnd === "-" ? "" : "-"}
                                                                        </Grid>
                                                                        <Grid item size={5.5} sx={{ textAlign: "left" }}>
                                                                            {
                                                                                row.summaryEnd === "-" ? "ขึ้นไป" :
                                                                                    new Intl.NumberFormat("en-US").format(row.summaryEnd)
                                                                            }
                                                                        </Grid>
                                                                    </Grid>
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.tax}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.note}</TableCell>
                                                            </TableRow>
                                                        ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                            }
                        </Grid>
                        {
                            !editTax &&
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
                                        onClick={() => setEditTax(true)}
                                    >
                                        <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                        แก้ไข
                                    </Button>
                                </Box>
                            </Grid>
                        }
                    </Grid>
                    {
                        editTax &&
                        <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                            <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                            <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                        </Box>
                    }
                </Box>
            </Paper>
        </Container >
    )
}

export default TaxDetail