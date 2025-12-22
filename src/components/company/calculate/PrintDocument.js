import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody, Box } from "@mui/material";
import html2canvas from 'html2canvas';
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import theme from "../../../theme/theme";
import { useFirebase } from "../../../server/ProjectFirebaseContext";
import { onValue, ref } from "firebase/database";

function PrintDocument({ tabState, setTabState, tabId }) {
    const { domain, company, group, page } = tabState;
    const { firebaseDB, domainKey } = useFirebase();

    // --- Hooks ต้องอยู่ด้านบนสุด ---
    const invoiceData = JSON.parse(sessionStorage.getItem("invoiceData"));

    const companyId = company?.split(":")[0];
    const [income, setIncome] = useState([{ ID: 0, name: "" }]);
    const [deduction, setDeduction] = useState([]);

    // ==== ไม่มีเงื่อนไข return ก่อน hooks ====

    useEffect(() => {
        // ใช้เพื่อรอ render DOM ก่อน
    }, []);

    function formatDateFromFields({ DD, MM, YYYY }) {
        const dd = String(DD).padStart(2, "0");
        const mm = String(MM).padStart(2, "0");
        const yyyy = String(YYYY);
        return `${dd}/${mm}/${yyyy}`;
    }

    const dateObjF = { DD: invoiceData?.Salary.DDF, MM: invoiceData?.Salary.MMF, YYYY: invoiceData?.Salary.YYYYF };
    const dateObjT = { DD: invoiceData?.Salary.DDT, MM: invoiceData?.Salary.MMT, YYYY: invoiceData?.Salary.YYYYT };
    const formattedDateF = formatDateFromFields(dateObjF);
    const formattedDateT = formatDateFromFields(dateObjT);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const incomeRef = ref(firebaseDB, `workgroup/company/${companyId}/income`);

        const unsubscribe = onValue(incomeRef, (snapshot) => {
            const incomeData = snapshot.val();
            setIncome(incomeData || [{ ID: 0, name: '' }]);
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const deductionRef = ref(firebaseDB, `workgroup/company/${companyId}/deductions`);

        const unsubscribe = onValue(deductionRef, (snapshot) => {
            const deductionData = snapshot.val();
            setDeduction(deductionData || [{ ID: 0, name: '' }]);
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    // --- ตอนนี้ค่อย return ตามเงื่อนไข ได้! ---
    if (!invoiceData) {
        return <div>กำลังโหลด...</div>;
    }

    if (!companyId) {
        return <div>ไม่มี Company ID</div>;
    }

    // จำนวนช่องที่ต้องการก่อน "รวมรายรับ"
    const FIXED_INCOME_COLS = 3;

    const incomeActive = income.filter(row => row.status === 1);
    const deductionActive = deduction.filter(row => row.status === 1);

    const visibleIncome = incomeActive.filter(inc =>
        invoiceData?.Salary.salarylist.some(row => (row[`income${inc.ID}`] ?? 0) !== 0)
    );

    // ทำให้เป็นจำนวนช่องคงที่เสมอ
    const paddedIncome = [
        ...visibleIncome.slice(0, FIXED_INCOME_COLS),
        ...Array(Math.max(0, FIXED_INCOME_COLS - visibleIncome.length))
            .fill({ ID: null, name: "" })
    ];

    const visibleDeduction = deductionActive.filter(ded =>
        invoiceData?.Salary.salarylist.some(row => (row[`deduction${ded.ID}`] ?? 0) !== 0)
    );

    // ทำให้เป็นจำนวนช่องคงที่เสมอ
    const paddedDeduction = [
        ...visibleDeduction.slice(0, FIXED_INCOME_COLS),
        ...Array(Math.max(0, FIXED_INCOME_COLS - visibleIncome.length))
            .fill({ ID: null, name: "" })
    ];

    console.log("Visible Income : ", visibleIncome);
    console.log("Visible Deduction : ", visibleDeduction);
    console.log("Invoice Data : ", invoiceData);

    return (
        <Box display="flex" justifyContent="center" alignItems="center" marginTop={12}>
            <Box>
                <Box id="invoiceContent">
                    {
                        invoiceData?.Salary.salarylist.map((row, index) => (
                            <Box
                                sx={{
                                    width: "21cm",          // กว้าง
                                    height: "14.8cm",    // สูง
                                    backgroundColor: "#fff",
                                    paddingTop: "1cm",
                                    paddingBottom: "1cm",
                                    paddingLeft: "0.9cm",
                                    paddingRight: "0.5cm",
                                    boxSizing: "border-box",
                                    border: "1px solid lightgray",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // ✅ เพิ่มเงา
                                    mt: 1
                                }}
                            >
                                <Box sx={{ textAlign: "right", mt: -3 }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ marginRight: 2, fontSize: "12px" }}>{` ${(index + 1)}/${invoiceData?.Employee.length} `}</Typography>
                                </Box>
                                <Grid container sx={{ mr: 2, mt: -0.5 }}>
                                    <Grid item size={1.5}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ marginRight: 2 }}>โลโก้</Typography>
                                    </Grid>
                                    <Grid item size={7.5}>
                                        <Typography variant="h6" gutterBottom sx={{ mb: -0.5 }} >{`${invoiceData?.Companyserial}:${invoiceData?.Companyname}`}</Typography>
                                        <Typography variant="subtitle1" gutterBottom>{invoiceData?.Address}</Typography>
                                    </Grid>
                                    <Grid item size={3} textAlign="right">
                                        <Typography variant="h6" gutterBottom>ใบแจ้งเงินเดือน</Typography>
                                    </Grid>
                                </Grid>
                                <Paper sx={{ mr: 2, border: "1px solid lightgray" }}>
                                    <Grid container spacing={2} sx={{ borderRadius: 1 }}>
                                        <Grid item size={8.5}>
                                            <Grid container p={1}>
                                                <Grid item size={12}>
                                                    <Typography variant="subtitle2" gutterBottom>รหัสพนักงาน : {row.employeecode}</Typography>
                                                </Grid>
                                                <Grid item size={6}>
                                                    <Typography variant="subtitle2" gutterBottom sx={{ marginRight: 2 }}>ชื่อ : {row.employname}</Typography>
                                                    <Typography variant="subtitle2" gutterBottom>ฝ่ายงาน : {row.department ? row.department.split("-")[1] : row.department}</Typography>
                                                </Grid>
                                                <Grid item size={6}>
                                                    <Typography variant="subtitle2" gutterBottom sx={{ marginRight: 2 }}>ส่วนงาน : {row.section ? row.section.split("-")[1] : row.section}</Typography>
                                                    <Typography variant="subtitle2" gutterBottom>ตำแหน่ง : {row.position ? row.position.split("-")[1] : row.position}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item size={3.5} p={1} sx={{ borderLeft: "1px solid lightgray" }}>
                                            <Typography variant="subtitle2" gutterBottom sx={{ marginRight: 2 }}>วันที่จ่าย {formattedDateT}</Typography>
                                            <Typography variant="subtitle2" gutterBottom>ประจำเดือน {dayjs(invoiceData.Month, "MM").format("MMMM/YYYY")}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                                <Box sx={{ mr: 2, mt: 1.5 }} >
                                    <TableContainer component={Paper} textAlign="center" sx={{ border: "1px solid lightgray" }}>
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                            <TableBody
                                                sx={{
                                                    position: "sticky",
                                                    top: 0,
                                                    zIndex: 2,
                                                }}
                                            >
                                                <TableRow sx={{ backgroundColor: "#e4e4e4ff" }}>
                                                    <TableCell sx={{ width: 80, textAlign: "center" }} rowSpan={3}>
                                                        เงินได้
                                                    </TableCell>

                                                    {/* 1 ช่อง: เงินเดือน */}
                                                    <TableCell sx={{ textAlign: "center" }}>เงินเดือน</TableCell>

                                                    {/* 7 ช่องว่าง */}
                                                    {paddedIncome.map((inc, idx) => (
                                                        <TableCell key={idx} sx={{ textAlign: "center" }}>
                                                            {inc.ID !== null && row[`income${inc.ID}`]
                                                                ? inc.name
                                                                : ""
                                                            }
                                                        </TableCell>
                                                    ))}

                                                    <TableCell sx={{ width: 80, textAlign: "center" }}>
                                                        รวมรายรับ
                                                    </TableCell>
                                                </TableRow>

                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>{new Intl.NumberFormat("en-US").format(row.salary)}</TableCell>
                                                    {paddedIncome.map((inc, idx) => (
                                                        <TableCell key={idx} sx={{ textAlign: "center" }}>
                                                            {inc.ID !== null && row[`income${inc.ID}`]
                                                                ? new Intl.NumberFormat("en-US").format(row[`income${inc.ID}`])
                                                                : "-"
                                                            }
                                                        </TableCell>
                                                    ))}
                                                    <TableCell sx={{ width: 80, textAlign: "center", backgroundColor: "#e4e4e4ff" }} rowSpan={2}>{new Intl.NumberFormat("en-US").format(row.salary + row.totalIncome)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                </TableRow>

                                                <TableRow sx={{ backgroundColor: "#e4e4e4ff" }}>
                                                    <TableCell sx={{ width: 80, textAlign: "center" }} rowSpan={3}>เงินหัก</TableCell>
                                                    {paddedDeduction.map((inc, idx) => (
                                                        <TableCell key={idx} sx={{ textAlign: "center" }}>
                                                            {inc.ID !== null && row[`deduction${inc.ID}`]
                                                                ? inc.name
                                                                : ""
                                                            }
                                                        </TableCell>
                                                    ))}
                                                    <TableCell sx={{ width: 80, textAlign: "center" }}>รวมรายจ่าย</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    {paddedDeduction.map((inc, idx) => (
                                                        <TableCell key={idx} sx={{ textAlign: "center" }}>
                                                            {inc.ID !== null && row[`deduction${inc.ID}`]
                                                                ? new Intl.NumberFormat("en-US").format(row[`deduction${inc.ID}`])
                                                                : "-"
                                                            }
                                                        </TableCell>
                                                    ))}
                                                    <TableCell sx={{ width: 80, textAlign: "center", backgroundColor: "#e4e4e4ff" }} rowSpan={2}>{new Intl.NumberFormat("en-US").format(row.totalDeduction)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                </TableRow>
                                                <TableRow sx={{ textAlign: "center" }}>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: "#e4e4e4ff" }} colSpan={2}>รายได้สะสม</TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: "#e4e4e4ff" }} colSpan={1}>ภาษีสะสม</TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: "#e4e4e4ff" }} colSpan={1}>ประกันสังคมสะสม</TableCell>
                                                    <TableCell sx={{ textAlign: "center", backgroundColor: "#e4e4e4ff" }} rowSpan={2}>เงินได้สุทธิ</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }} rowSpan={2}>{new Intl.NumberFormat("en-US").format(row.total)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={2}>{new Intl.NumberFormat("en-US").format(row.total)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={1}>{new Intl.NumberFormat("en-US").format(row.taxPerMonth)}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={1}>{new Intl.NumberFormat("en-US").format(row.totalsso + row.sso)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                        <Grid item size={8}>
                                            <Typography variant="subtitle2" sx={{ fontSize: "13px" }} gutterBottom>หมายเหตุ : สลิปเงินเดือนถือเป็นความลับไม่ควรเผยแพร่หรือเผยแพร่ให้พนักงานท่านอื่นทราบและการกระทำดังกล่าวหากส่งผลกระทบต่อบริษัท มีบทลงโทษโดยให้ออกจากการเป็นพนักงานบริษัท ทันที</Typography>
                                        </Grid>
                                        <Grid item size={4}>
                                            <Typography variant="subtitle2" sx={{ mt: 2, textAlign: "center" }} gutterBottom>ลงชื่อ _____________________________</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontSize: "12px" }} gutterBottom>
                                        พิมพ์โดย
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontSize: "12px" }} gutterBottom>
                                        วันที่
                                    </Typography>
                                </Box>
                            </Box>
                        ))
                    }
                </Box>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Button variant="contained">
                        บันทึกรูปภาพ
                    </Button>
                </div>
            </Box>
        </Box>
    );
};

export default PrintDocument;
