import React, { useEffect, useState } from "react";
import { Typography, Button, Grid, TableHead, TableCell, TableRow, Table, Paper, TableContainer, TableBody, Box } from "@mui/material";
import html2canvas from 'html2canvas';
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import theme from "../../../theme/theme";

const PrintDocument = () => {

    useEffect(() => {
        const data = JSON.parse(sessionStorage.getItem("invoiceData"));

        // หน่วงให้ DOM render ก่อน
        // const timer = setTimeout(() => {
        //     const element = document.querySelector("#invoiceContent");

        //     const opt = {
        //         margin: 0, // ไม่ต้องเว้น margin นอก page ถ้าใน element มี padding แล้ว
        //         filename: `T-${data.Code}.pdf`,
        //         image: { type: 'jpeg', quality: 0.98 },
        //         html2canvas: {
        //             scale: 2,           // เพิ่มความคมชัด
        //             useCORS: true       // รองรับภาพจาก URL ต่างโดเมน (ถ้ามี)
        //         },
        //         jsPDF: {
        //             unit: 'cm',         // ใช้หน่วยเดียวกับ CSS
        //             format: 'a4',
        //             orientation: 'portrait'
        //         }
        //     };

        //     html2pdf().set(opt).from(element).save();
        // }, 500);


        // return () => clearTimeout(timer);
    }, []);

    const invoiceData = JSON.parse(sessionStorage.getItem("invoiceData"));
    if (!invoiceData) return <div>กำลังโหลด...</div>;

    console.log("employee : ", invoiceData?.Employee);
    console.log("company : ", invoiceData?.Company);

    return (
        <Box display="flex" justifyContent="center" alignItems="center" marginTop={12}>
            <Box>
                <Box id="invoiceContent">
                    {
                        invoiceData?.Employee.map((row, index) => (
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
                                            <Typography variant="subtitle2" gutterBottom sx={{ marginRight: 2 }}>วันที่จ่าย {dayjs(new Date).format("DD/MM/YYYY")}</Typography>
                                            <Typography variant="subtitle2" gutterBottom>ประจำเดือน {dayjs(new Date).format("MMMM/YYYY")}</Typography>
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
                                                    <TableCell sx={{ width: 80, textAlign: "center" }} rowSpan={3}>เงินได้</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>เงินเดือน</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ width: 80, textAlign: "center" }}>รวมรายรับ</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ width: 80, textAlign: "center", backgroundColor: "#e4e4e4ff" }} rowSpan={2}>-</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                </TableRow>

                                                <TableRow sx={{ backgroundColor: "#e4e4e4ff" }}>
                                                    <TableCell sx={{ width: 80, textAlign: "center" }} rowSpan={3}>เงินหัก</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}></TableCell>
                                                    <TableCell sx={{ width: 80, textAlign: "center" }}>รวมรายจ่าย</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ width: 80, textAlign: "center", backgroundColor: "#e4e4e4ff" }} rowSpan={2}>-</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                </TableRow>
                                                <TableRow sx={{ textAlign: "center", backgroundColor: "#e4e4e4ff" }}>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={3}>รายได้สะสม</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={2}>ภาษีสะสม</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={2}>ประกันสังคมสะสม</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>เงินได้สุทธิ</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={3}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={2}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }} colSpan={2}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>-</TableCell>
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
