import * as React from 'react';
import { ref, get, set, child, onValue } from "firebase/database";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import { Box, CardActionArea, CardContent, Grid, InputAdornment, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useFirebase } from '../../../server/ProjectFirebaseContext';
import { IconButtonError, TablecellHeader } from '../../../theme/style';
import theme from '../../../theme/theme';
import ThaiDateSelector from '../../../theme/ThaiDateSelector';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { format } from 'crypto-js';
import { formatThaiSlash } from '../../../theme/DateTH';

export default function InsertLoan() {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState("");
    const [text, setText] = React.useState("");
    const [picture, setPicture] = React.useState(null); // เก็บไฟล์
    const [previewUrl, setPreviewUrl] = React.useState(""); // ใช้แสดงตัวอย่างรูป
    const [recievedate, setRecievedate] = React.useState(null);
    const [total, setTotal] = React.useState("");
    const [monthduration, setMonthduration] = React.useState("");
    const [interestpermonth, setInterestpermonth] = React.useState("");
    const [employee, setEmployee] = React.useState("");
    const [employeesList, setEmployeesList] = React.useState([]);

    const companyId = companyName?.split(":")[0];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPicture(file);
            setPreviewUrl(URL.createObjectURL(file)); // สร้าง preview url
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    React.useEffect(() => {
        if (!firebaseDB || !companyId) return;

        const positionRef = ref(firebaseDB, `workgroup/company/${companyId}/employee`);

        const unsubscribe = onValue(positionRef, (snapshot) => {
            const employeeData = snapshot.val();
            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!employeeData) {
                setEmployeesList([]);
            } else {
                setEmployeesList(employeeData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleNews = async () => {
        const companiesRef = ref(firebaseDB, "workgroup/information");

        try {
            const snapshot = await get(companiesRef);
            const companiesData = snapshot.exists() ? snapshot.val() : {};
            const nextIndex = Object.keys(companiesData).length;

            await set(child(companiesRef, String(nextIndex)), {
                title: title,
                text: text,
                date: new Date().toISOString(),
            });

            setTitle("");
            setText("");
            setOpen(false);
        } catch (error) {
            console.error("Error adding company:", error);
        }
    };

    console.log("employee : ", employee);


    return (
        <React.Fragment>
            <Button variant="contained" onClick={() => setOpen(true)} >เพิ่มเอกสารขอกู้เงิน</Button>
            <Dialog
                open={open}
                onClose={handleClose}
                keepMounted
                maxWidth="sm"
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.primary.dark }}>
                    <Grid container spacing={2}>
                        <Grid size={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >เพิ่มเอกสารขอกู้เงิน</Typography>
                        </Grid>
                        <Grid size={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} marginTop={2}>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >เลือกพนักงาน</Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={employee}
                                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
                                onChange={(e) => setEmployee(e.target.value)}
                            >
                                {
                                    employeesList.map((emp, index) => (
                                        <MenuItem key={index} value={emp}>
                                            {`${emp.employname} (${emp.nickname})`}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ตำแหน่ง</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={employee.length !== 0 ? employee?.position.split("-")[1] || "" : ""}
                                disabled
                            />
                        </Grid>
                        {
                            employee.length !== 0 &&
                            <Grid item size={12}>
                                <Typography variant="subtitle2" fontWeight="bold" >รายการงวดของการกู้เงินที่ค้างชำระอยู่</Typography>
                                <TableContainer component={Paper} textAlign="center" sx={{ height: "20vh" }}>
                                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "5px" } }}>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                <TablecellHeader sx={{ width: 80 }}>ลำดับงวด</TablecellHeader>
                                                <TablecellHeader sx={{ width: 100 }}>วันที่</TablecellHeader>
                                                <TablecellHeader sx={{ width: 80 }}>จำนวนเงิน</TablecellHeader>
                                                <TablecellHeader sx={{ width: 80 }}>ดอกเบี้ย</TablecellHeader>
                                                <TablecellHeader>สถานะ</TablecellHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                employee?.loan && employee?.loan.map((row, index) => (
                                                    row.status === "active" &&
                                                    row?.billing.map((bill, index) => (
                                                        <TableRow key={bill.ID}>
                                                            <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: "center"
                                                                }}>
                                                                {formatThaiSlash(dayjs(bill.mustpaydate).format("DD/MM/YYYY"))}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {new Intl.NumberFormat("en-US").format(bill.amount)}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: "center" }}>
                                                                {new Intl.NumberFormat("en-US").format(bill.interest)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: "center"
                                                                }}
                                                            >
                                                                {bill.status === "paid" ? "ชำระเงินแล้ว" : "ค้างชำระ"}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        }
                        <Grid size={12}>
                            <ThaiDateSelector
                                label="วันที่เริ่มกู้เงิน"
                                value={recievedate}
                                onChange={(val) => setRecievedate(val)}
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >จำนวนเงิน</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={total}
                                onChange={(e) => setTotal(e.target.value)}
                                placeholder="กรุณากรอกจำนวนเงิน"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >จำนวนงวด</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={monthduration}
                                onChange={(e) => setMonthduration(e.target.value)}
                                placeholder="กรุณากรอกจำนวนงวด"
                            />
                        </Grid>
                        <Grid item size={6}>
                            <Typography variant="subtitle2" fontWeight="bold" >ระยะเวลาระหว่างงวด</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={interestpermonth}
                                onChange={(e) => setInterestpermonth(e.target.value)}
                                placeholder="กรุณากรอกระยะเวลาระหว่างงวด"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ borderTop: `2px solid ${theme.palette.primary.dark}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" onClick={handleNews} autoFocus>
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
