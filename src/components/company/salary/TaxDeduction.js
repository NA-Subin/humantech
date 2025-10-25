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

const TaxDeductionDetail = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [editTaxDeduction, setEditTaxDeduction] = useState(false);
    const [taxDeduction, setTaxDeduction] = useState(
        [
            { title: "ค่าลดหย่อนส่วนตัว", amount: 60000, unit: "บาท", detail: "สำหรับผู้มีเงินได้ทุกคน" },
            { title: "คู่สมรสไม่มีเงินได้", amount: 60000, unit: "บาท", detail: "หากสมรสและคู่สมรสไม่มีรายได้" },
            { title: "บุตร (คนที่ 1-2)", amount: 30000, unit: "บาท/คน", detail: "ลดหย่อนได้สำหรับบุตรชอบด้วยกฎหมาย" },
            { title: "บุตรคนที่ 3 ขึ้นไป (เกิดปี 2561 เป็นต้นไป)", amount: 60000, unit: "บาท/คน", detail: "สำหรับบุตรชอบด้วยกฎหมาย คนที่ 3 ขึ้นไป" },
            { title: "ค่าอุปการะบิดามารดา", amount: 30000, unit: "บาท/คน", detail: "อายุเกิน 60 ปี และไม่มีรายได้เกิน 30,000 บาทต่อปี" },
            { title: "ค่าอุปการะคนพิการ/ทุพพลภาพ", amount: 60000, unit: "บาท/คน", detail: "สำหรับผู้ดูแลบุคคลพิการ" },
            { title: "เบี้ยประกันชีวิต", amount: 100000, unit: "บาท", detail: "ตามที่จ่ายจริง สูงสุดไม่เกิน 100,000 บาท" },
            { title: "เบี้ยประกันสุขภาพบิดามารดา", amount: 15000, unit: "บาท", detail: "สูงสุดไม่เกิน 15,000 บาท (รวมทุกกรมธรรม์)" },
            { title: "กองทุนสำรองเลี้ยงชีพ / กบข. / กองทุนครูเอกชน / RMF", amount: 500000, unit: "บาท", detail: "รวมกันไม่เกิน 500,000 บาท และไม่เกิน 15% ของรายได้" },
            { title: "กองทุน SSF", amount: 200000, unit: "บาท", detail: "ไม่เกิน 30% ของเงินได้ที่ต้องเสียภาษี และไม่เกิน 200,000 บาท" },
            { title: "ดอกเบี้ยเงินกู้ยืมเพื่อซื้อที่อยู่อาศัย", amount: 100000, unit: "บาท", detail: "เฉพาะดอกเบี้ย ไม่รวมเงินต้น" },
            { title: "เงินบริจาคเพื่อการศึกษา กีฬา สาธารณประโยชน์", amount: 0, unit: "บาท", detail: "หักได้ไม่เกิน 10% ของเงินได้หลังหักค่าใช้จ่ายและค่าลดหย่อน" },
            { title: "เงินบริจาคให้พรรคการเมือง", amount: 10000, unit: "บาท", detail: "สูงสุดไม่เกิน 10,000 บาท" },
            { title: "ค่าฝึกอบรม/พัฒนาฝีมือ", amount: 20000, unit: "บาท", detail: "ลดหย่อนได้ตามจ่ายจริง ไม่เกิน 20,000 บาท" }
        ]
    );

    const columns = [
        { label: "ค่าลดหย่อน", key: "title", type: "text" },
        { label: "จำนวนเงิน", key: "amount", type: "number" },
        { label: "หน่วย", key: "unit", type: "text" },
        { label: "หมายเหตุ", key: "detail", type: "text" }
    ];

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth); // อัพเดตค่าขนาดหน้าจอ
        };

        window.addEventListener('resize', handleResize); // เพิ่ม event listener

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    // useEffect(() => {
    //     if (!firebaseDB || !companyId) return;

    //     const taxRef = ref(firebaseDB, `workgroup/company/${companyId}/deduction`);

    //     const unsubscribe = onValue(taxRef, (snapshot) => {
    //         const taxData = snapshot.val();

    //         // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
    //         if (!taxData) {
    //             setTaxDeduction([{ ID: 0, title: "", detail: "", amount: "", unit: "" }]);
    //         } else {
    //             setTaxDeduction(taxData);
    //         }
    //     });

    //     return () => unsubscribe();
    // }, [firebaseDB, companyId]);

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/deduction`);

        const invalidMessages = [];

        taxDeduction.forEach((row, rowIndex) => {
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
        const names = taxDeduction.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
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
        set(companiesRef, taxDeduction)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEditTaxDeduction(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const taxRef = ref(firebaseDB, `workgroup/company/${companyId}/deduction`);

        onValue(taxRef, (snapshot) => {
            const taxData = snapshot.val() || [{ ID: 0, title: "", detail: "", amount: "", unit: "" }];
            setTaxDeduction(taxData);
            setEditTaxDeduction(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    console.log("taxDeduction : ", taxDeduction);

    return (
        <Container maxWidth="xl" sx={{ p: 5, width: windowWidth - 290 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>ค่าลดหย่อนภาษี (Deduction)</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4, height: "75vh" }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลค่าลดหย่อนภาษี</Typography>
                    <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                    <Grid container spacing={2}>
                        <Grid item size={12}>
                            {
                                editTaxDeduction ?
                                    <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                        <TableExcel
                                            columns={columns}
                                            styles={{ height: "55vh", width: "100%" }}
                                            initialData={taxDeduction}
                                            onDataChange={setTaxDeduction}
                                        />
                                    </Paper>

                                    :
                                    <TableContainer component={Paper} textAlign="center" sx={{ height: "55vh" }}>
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "5px" }, width: "100%" }}>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                    <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                                    <TablecellHeader sx={{ width: "40%" }}>ค่าลดหย่อน</TablecellHeader>
                                                    <TablecellHeader sx={{ width: "20%" }}>จำนวนเงิน</TablecellHeader>
                                                    <TablecellHeader>หมายเหตุ</TablecellHeader>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    taxDeduction.length === 0 ?
                                                        <TableRow>
                                                            <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                        </TableRow>
                                                        :
                                                        taxDeduction.map((row, index) => (
                                                            <TableRow>
                                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.title}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.amount)}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.detail}</TableCell>
                                                            </TableRow>
                                                        ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                            }
                        </Grid>
                        <Grid item size={12}>
                            {
                                editTaxDeduction ?
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
                                        onClick={() => setEditTaxDeduction(true)}
                                        endIcon={<ManageAccountsIcon fontSize="large" />}
                                    >
                                        แก้ไขข้อมูลรายหักเพิ่มเติม
                                    </Button>
                            }
                        </Grid>
                        {/* {
                            !editTaxDeduction &&
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
                                        onClick={() => setEditTaxDeduction(true)}
                                    >
                                        <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                        แก้ไข
                                    </Button>
                                </Box>
                            </Grid>
                        } */}
                    </Grid>
                    {/* {
                        editTaxDeduction &&
                        <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                            <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                            <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                        </Box>
                    } */}
                </Box>
            </Paper>
        </Container >
    )
}

export default TaxDeductionDetail