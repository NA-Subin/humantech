import * as React from 'react';
import { ref, get, set, child, onValue, update } from "firebase/database";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import { Box, CardActionArea, CardContent, Checkbox, Divider, FormControlLabel, FormGroup, Grid, IconButton, InputAdornment, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { useFirebase } from '../../../server/ProjectFirebaseContext';
import { IconButtonError, TablecellHeader } from '../../../theme/style';
import theme from '../../../theme/theme';
import ThaiDateSelector from '../../../theme/ThaiDateSelector';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { format } from 'crypto-js';
import { formatThaiSlash } from '../../../theme/DateTH';
import { ShowConfirm } from '../../../sweetalert/sweetalert';

export default function InsertLoan() {
    const { firebaseDB, domainKey } = useFirebase();
    const companyName = localStorage.getItem("company");
    // const [searchParams] = useSearchParams();
    // const companyName = searchParams.get("company");
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState("");
    const [text, setText] = React.useState("");
    const [picture, setPicture] = React.useState(null); // เก็บไฟล์
    const [previewUrl, setPreviewUrl] = React.useState(""); // ใช้แสดงตัวอย่างรูป
    const [recievedate, setRecievedate] = React.useState(null);
    const [total, setTotal] = React.useState("");
    const [overdue, setOverdue] = React.useState("");
    const [monthduration, setMonthduration] = React.useState("");
    const [interestpermonth, setInterestpermonth] = React.useState("");
    const [employee, setEmployee] = React.useState("");
    const [employeesList, setEmployeesList] = React.useState([]);
    const [check, setCheck] = React.useState(null);

    console.log("Check : ", check);

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

    const handleSelectEmployee = (data) => {
        setEmployee(data);
        const totalPendingAmount = data?.loan
            ?.filter(row => row.status === "active") // เอาเฉพาะ loan ที่ active
            ?.reduce((sum, row) => {
                const pendingSum = row.billing
                    ?.filter(bill => bill.status === "pending") // เอาเฉพาะ pending
                    ?.reduce((billSum, bill) => billSum + (bill.amount || 0), 0); // รวม amount
                return sum + (pendingSum || 0);
            }, 0);
        setOverdue(totalPendingAmount);
    }

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

    const handleApprove = (loanID, newID) => {
        ShowConfirm(
            "อนุมัติการชำระเงินกู้",
            "คุณต้องการอนุมัติเอกสารการชำระเงินกู้นี้หรือไม่?",
            async () => {
                // const loanID = employee.loan.some(loan => loan.status === "active")?.ID
                const billingRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${employee?.ID}/loan/${loanID}/billing/${newID}`
                );
                update(billingRef, {
                    status: "paid",
                    approveBy: "HR",
                    approveDate: dayjs().format("DD/MM/YYYY"),
                    approveTime: dayjs().format("HH:mm:ss")
                });

                const loanRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${employee?.ID}/loan/${loanID}/billing`
                );

                // ✅ ดึงข้อมูล billing ทั้งหมดมาดูว่า paid ครบไหม
                const snapshot = await get(loanRef);
                if (snapshot.exists()) {
                    const allBilling = Object.values(snapshot.val());
                    const allPaid = allBilling.every(bill => bill.status === "paid");

                    if (allPaid) {
                        const loanStatusRef = ref(
                            firebaseDB,
                            `workgroup/company/${companyId}/employee/${employee?.ID}/loan/${loanID}`
                        );

                        // ✅ ถ้า paid ครบทุกงวดแล้วให้เปลี่ยน loan เป็น success
                        await update(loanStatusRef, { status: "success" });
                    }

                    const employeeRef = ref(
                        firebaseDB,
                        `workgroup/company/${companyId}/employee/${employee?.ID}`
                    );

                    const snapshotemploy = await get(employeeRef);
                    if (snapshotemploy.exists()) {
                        const total = snapshotemploy.val();
                        setEmployee(total);
                        const totalPendingAmount = total?.loan
                            ?.filter(row => row.status === "active") // เอาเฉพาะ loan ที่ active
                            ?.reduce((sum, row) => {
                                const pendingSum = row.billing
                                    ?.filter(bill => bill.status === "pending") // เอาเฉพาะ pending
                                    ?.reduce((billSum, bill) => billSum + (bill.amount || 0), 0); // รวม amount
                                return sum + (pendingSum || 0);
                            }, 0);
                        setOverdue(totalPendingAmount);
                    } else {
                        setEmployee(null);
                    }
                }
            },
            () => {
                console.log("ยกเลิกการอนุมัติ");
            }
        );
    };

    const handleSave = async () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/employee/${employee?.ID}/loan`);

        try {
            const snapshot = await get(companiesRef);
            const companiesData = snapshot.exists() ? snapshot.val() : {};
            const nextIndex = Object.keys(companiesData).length;

            console.log("companiesData : ", companiesData);
            console.log("nextIndex : ", nextIndex);

            // แปลงปีพุทธศักราช (BE) เป็นคริสต์ศักราช (AD)
            const yearAD = parseInt(recievedate.year, 10) - 543;

            // เติมเลข 0 หน้า day และ month ให้เป็นสองหลัก
            const dayStr = recievedate.day.toString().padStart(2, "0");
            const monthStr = recievedate.month.toString().padStart(2, "0");

            const formattedDate = `${dayStr}/${monthStr}/${yearAD}`;

            // สร้าง array ของ billing ใหม่
            const billingData = [];
            const totalWithOverdue = check === "รวมยอดค้างชำระ" ? Number(total) + Number(overdue) : Number(total);

            for (let i = 0; i < monthduration; i++) {
                billingData.push({
                    ID: i,
                    amount: totalWithOverdue / monthduration,
                    interest: (monthduration / 100) * (totalWithOverdue / monthduration),
                    mustpaydate: dayjs(formattedDate, "DD/MM/YYYY")
                        .add((i + 1) * interestpermonth, "month")
                        .format("DD/MM/YYYY"),
                    approveBy: "",
                    approveDate: "",
                    approveTime: "",
                    status: "pending"
                });
            }

            // ✅ ถ้าเลือก "รวมยอดค้างชำระ" ให้เปลี่ยน pending เก่าเป็น inactive
            if (check === "รวมยอดค้างชำระ") {
                const updates = {};

                Object.entries(companiesData).forEach(([key, row]) => {
                    if (row.status === "active" && Array.isArray(row.billing)) {
                        const updatedBilling = row.billing.map((bill) => ({
                            ...bill,
                            status: bill.status === "pending" ? "inactive" : bill.status,
                        }));
                        updates[key] = {
                            ...row,
                            billing: updatedBilling,
                            status: "success" // ✅ เปลี่ยน status ของ row ด้วย
                        };
                    } else {
                        updates[key] = row;
                    }
                });

                // ✅ update เฉพาะส่วน ไม่ทับข้อมูลทั้งหมด
                await update(companiesRef, updates);
            }

            // ✅ เพิ่ม loan ใหม่
            await set(child(companiesRef, String(nextIndex)), {
                ID: nextIndex,
                interestpermonth,
                billing: billingData,
                monthduration,
                recievedate: formattedDate,
                status: "active",
                total: totalWithOverdue
            });

            // ✅ Reset ฟอร์ม
            setInterestpermonth("");
            setMonthduration("");
            setRecievedate(null);
            setTotal("");
            setEmployee("");
            setOpen(false);

        } catch (error) {
            console.error("Error adding company:", error);
        }
    };

    console.log("employee : ", employee?.loan);
    console.log("date : ", recievedate);

    return (
        <React.Fragment>
            <Button variant="contained" onClick={() => setOpen(true)} >เพิ่มเอกสารขอกู้เงิน</Button>
            <Dialog
                open={open}
                onClose={handleClose}
                keepMounted
                maxWidth="md"
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
                            <Typography variant="h6" fontWeight="bold" gutterBottom>เพิ่มเอกสารขอกู้เงิน</Typography>
                        </Grid>
                        <Grid item size={2} sx={{ textAlign: "right" }}>
                            <IconButtonError sx={{ marginTop: -2 }} onClick={handleClose}>
                                <CloseIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                    <Divider sx={{ marginTop: 2, marginBottom: -2, border: `1px solid ${theme.palette.primary.dark}` }} />
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
                                onChange={(e) => {
                                    const data = e.target.value;
                                    handleSelectEmployee(data);
                                }}
                            >
                                {
                                    employee &&
                                    <MenuItem value={employee}>
                                        {`${employee?.employname} (${employee?.nickname})`}
                                    </MenuItem>
                                }
                                {
                                    employeesList.map((emp, index) => (
                                        employee.ID !== emp.ID &&
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
                            employee?.loan && employee.loan.some(loan => loan.status === "active") ? (
                                <Grid item size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" >รายการงวดของการกู้เงินที่ค้างชำระอยู่</Typography>
                                    <TableContainer component={Paper} textAlign="center" sx={{ height: "30vh" }}>
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "5px" } }}>
                                            <TableHead sx={{
                                                position: "sticky",
                                                zIndex: 1,
                                                top: 0
                                            }}>
                                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                    <TablecellHeader sx={{ width: 80 }}>ลำดับงวด</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 100 }}>รอบจ่าย</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 100 }}>จำนวนเงิน</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 80 }}>ดอกเบี้ย</TablecellHeader>
                                                    <TablecellHeader>สถานะ</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 50 }} />
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    employee?.loan.map((row, index) => (
                                                        row.status === "active" &&
                                                        row?.billing.map((bill, index) => (
                                                            <TableRow key={bill.ID}>
                                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                <TableCell
                                                                    sx={{
                                                                        textAlign: "center"
                                                                    }}>
                                                                    {formatThaiSlash(dayjs(bill.mustpaydate, "DD/MM/YYYY"))}
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    {new Intl.NumberFormat("en-US", {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2
                                                                    }).format(bill.amount)}
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    {new Intl.NumberFormat("en-US", {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2
                                                                    }).format(bill.interest)}
                                                                </TableCell>
                                                                <TableCell
                                                                    sx={{
                                                                        textAlign: "center",
                                                                        color: bill.status === "paid" ? theme.palette.success.dark : theme.palette.error.dark,
                                                                        fontWeight: "bold"
                                                                    }}
                                                                >
                                                                    {bill.status === "paid" ? "ชำระเงินแล้ว" : "ค้างชำระ"}
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    {
                                                                        bill.status === "pending" ?
                                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center " }}>
                                                                                {/* <Tooltip title="ไม่อนุมัติ" placement="left">
                                                                                    <IconButton size="small"
                                                                                        sx={{ mt: -1, mb: -1 }}
                                                                                    //onClick={() => handleCancel(emp.ID, l.ID, bill.ID)} 
                                                                                    >
                                                                                        <InsertDriveFileIcon sx={{ color: theme.palette.error.main, fontSize: "24px" }} />
                                                                                        <CloseIcon sx={{ color: "white", fontSize: "14px", fontWeight: "bold", marginLeft: -2.5, marginTop: 1 }} />
                                                                                    </IconButton>
                                                                                </Tooltip> */}
                                                                                <Tooltip title="ชำระเงิน" placement="right">
                                                                                    <IconButton size="small"
                                                                                        sx={{ mt: -1, mb: -1 }}
                                                                                        onClick={() => handleApprove(row.ID, bill.ID)}
                                                                                    >
                                                                                        <InsertDriveFileIcon sx={{ color: theme.palette.primary.main, fontSize: "24px" }} />
                                                                                        <DoneIcon sx={{ color: "white", fontSize: "14px", fontWeight: "bold", marginLeft: -2.5, marginTop: 1 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Box>
                                                                            :
                                                                            ""
                                                                        // <Tooltip title="ยกเลิก" placement="top">
                                                                        //     <IconButton size="small"
                                                                        //         sx={{ mt: -1, mb: -1 }}
                                                                        //     //onClick={() => handleCancel(emp.ID, l.ID, bill.ID)} 
                                                                        //     >
                                                                        //         <InsertDriveFileIcon sx={{ color: theme.palette.error.main, fontSize: "28px" }} />
                                                                        //         <CloseIcon sx={{ color: "white", fontSize: "16px", fontWeight: "bold", marginLeft: -3, marginTop: 1 }} />
                                                                        //     </IconButton>
                                                                        // </Tooltip>
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <FormGroup row>
                                            <Typography variant="subtitle1" fontSize="14px" fontWeight="bold" sx={{ marginTop: 1, mr: 2 }} gutterBottom>ต้องการกู้เงินเพิ่มเติม</Typography>
                                            <FormControlLabel
                                                control={<Checkbox checked={check === "รวมยอดค้างชำระ"} onChange={() => setCheck("รวมยอดค้างชำระ")} />}
                                                label="รวมยอดค้างชำระ"
                                                sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
                                            />
                                            <FormControlLabel
                                                control={<Checkbox checked={check === "แยกบิลกู้เงิน"} onChange={() => setCheck("แยกบิลกู้เงิน")} />}
                                                label="แยกบิลกู้เงิน"
                                                sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
                                            />

                                        </FormGroup>
                                    </Box>
                                    {
                                        check === "รวมยอดค้างชำระ" &&
                                        <Grid container spacing={2}>
                                            <Grid size={12}>
                                                <ThaiDateSelector
                                                    label="วันที่เริ่มกู้เงิน"
                                                    value={recievedate}
                                                    onChange={(val) => setRecievedate(val)}
                                                />
                                            </Grid>
                                            <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold" >รวมค้างชำระ</Typography>
                                                <TextField
                                                    fullWidth
                                                    type="text" // 👈 เปลี่ยนจาก number เป็น text
                                                    size="small"
                                                    value={
                                                        new Intl.NumberFormat("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }).format(overdue ?? 0)
                                                    }
                                                    placeholder="กรุณากรอกจำนวนงวด"
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold" >จำนวนเงิน</Typography>
                                                <TextField
                                                    fullWidth
                                                    type="number"
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
                                                    type="number"
                                                    size="small"
                                                    value={monthduration}
                                                    onChange={(e) => setMonthduration(e.target.value)}
                                                    placeholder="กรุณากรอกจำนวนงวด"
                                                />
                                            </Grid>
                                            <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold" >ระยะเวลาระหว่างงวด / เดือน</Typography>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    size="small"
                                                    value={interestpermonth}
                                                    onChange={(e) => setInterestpermonth(e.target.value)}
                                                    placeholder="กรุณากรอกระยะเวลาระหว่างงวด"
                                                />
                                            </Grid>
                                        </Grid>
                                    }
                                </Grid>
                            )
                                : ""
                        }
                        {
                            employee?.loan ?

                                (employee?.loan?.[employee.loan.length - 1] === "active") &&
                                <React.Fragment>
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
                                            type="number"
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
                                            type="number"
                                            size="small"
                                            value={monthduration}
                                            onChange={(e) => setMonthduration(e.target.value)}
                                            placeholder="กรุณากรอกจำนวนงวด"
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" >ระยะเวลาระหว่างงวด / เดือน</Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            value={interestpermonth}
                                            onChange={(e) => setInterestpermonth(e.target.value)}
                                            placeholder="กรุณากรอกระยะเวลาระหว่างงวด"
                                        />
                                    </Grid>
                                </React.Fragment>

                                :
                                <React.Fragment>
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
                                            type="number"
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
                                            type="number"
                                            size="small"
                                            value={monthduration}
                                            onChange={(e) => setMonthduration(e.target.value)}
                                            placeholder="กรุณากรอกจำนวนงวด"
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <Typography variant="subtitle2" fontWeight="bold" >ระยะเวลาระหว่างงวด / เดือน</Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            value={interestpermonth}
                                            onChange={(e) => setInterestpermonth(e.target.value)}
                                            placeholder="กรุณากรอกระยะเวลาระหว่างงวด"
                                        />
                                    </Grid>
                                </React.Fragment>
                        }
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ borderTop: `2px solid ${theme.palette.primary.dark}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" onClick={handleSave} autoFocus>
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
