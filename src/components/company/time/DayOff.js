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
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany, IconButtonError } from "../../../theme/style"
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate, useParams } from "react-router-dom";
import { Backdrop, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { useFirebase } from "../../../server/ProjectFirebaseContext";

import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import "dayjs/locale/th";
import { formatThaiFull, formatThaiMonth, formatThaiSlash } from "../../../theme/DateTH";
import TableExcel from "../../../theme/TableExcel";

const CustomBackdrop = styled(Backdrop)(({ theme }) => ({
    backgroundColor: "rgba(0, 0, 0, 0.09)", // ✅ โปร่งแสงชัดเจน
}));

const DayOffDetail = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const { companyName } = useParams();
    const [editLeave, setEditLeave] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [holidayList, setHolidayList] = useState([{ ID: 0, date: '', holiday: '' }]);
    const columns = [
        { label: "วันที่", key: "date", type: "text", width: "50%" },
        { label: "ชื่อวันหยุด", key: "holiday", type: "text", width: "50%" }
    ];

    const [openPopup, setOpenPopup] = useState(false);

    const handleClickOpen = () => {
        setOpenPopup(true);
    };

    const handleClose = () => {
        setOpenPopup(false);
    };
    console.log("Open : ", openPopup);

    const today = dayjs().locale("th");
    const months = Array.from({ length: 12 }, (_, i) => today.startOf("year").add(i, "month"));

    // แปลง holidayList เป็น array ของวันที่ที่ใช้เปรียบเทียบ
    const holidayDates = holidayList.map(h => dayjs(h.date, "DD/MM/YYYY").format("YYYY-MM-DD"));

    // ฟังก์ชันหาชื่อวันหยุดจากวันที่
    const getHolidayName = (dateStr) => {
        const match = holidayList.find(h => dayjs(h.date, "DD/MM/YYYY").format("YYYY-MM-DD") === dateStr);
        return match ? match.holiday : "";
    };

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

        const dayOffRef = ref(firebaseDB, `workgroup/company/${companyId}/dayoff`);

        const unsubscribe = onValue(dayOffRef, (snapshot) => {
            const dayOffData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!dayOffData) {
                setHolidayList([{ ID: 0, date: '', holiday: '' }]);
            } else {
                setHolidayList(dayOffData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);


    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/dayoff`);

        // const invalidMessages = [];

        // leave.forEach((row, rowIndex) => {
        //     columns.forEach((col) => {
        //         const value = row[col.key];

        //         if (value === "") {
        //             invalidMessages.push(`แถวที่ ${rowIndex + 1}: กรุณากรอก "${col.label}"`);
        //             return;
        //         }

        //         if (col.type === "number" && isNaN(Number(value))) {
        //             invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ต้องเป็นตัวเลข`);
        //             return;
        //         }

        //         if (
        //             col.type === "select" &&
        //             !col.options?.some(opt => opt.value === value)
        //         ) {
        //             invalidMessages.push(`แถวที่ ${rowIndex + 1}: "${col.label}" ไม่ตรงกับตัวเลือกที่กำหนด`);
        //             return;
        //         }
        //     });
        // });

        // // ✅ ตรวจสอบว่า level.name ซ้ำหรือไม่
        // const names = leave.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
        // const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        // if (duplicates.length > 0) {
        //     invalidMessages.push(`มีชื่อ: ${[...new Set(duplicates)].join(", ")} ซ้ำกัน`);
        // }

        // // ❌ แสดงคำเตือนถ้ามีข้อผิดพลาด
        // if (invalidMessages.length > 0) {
        //     ShowWarning("กรุณากรอกข้อมูลให้เรียบร้อย", invalidMessages.join("\n"));
        //     return;
        // }

        // ✅ บันทึกเมื่อผ่านเงื่อนไข
        set(companiesRef, holidayList)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const dayoffRef = ref(firebaseDB, `workgroup/company/${companyId}/dayoff`);

        onValue(dayoffRef, (snapshot) => {
            const dayoffData = snapshot.val() || [{ ID: 0, name: '' }];
            setHolidayList(dayoffData);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    const [newMonth, setNewMonth] = useState("");

    const UpdateDayOff = (newMonth) => {
        setOpenPopup(true)
        setNewMonth(newMonth);
    }

    console.log("new month ", newMonth);
    console.log("holiday : ", holidayList);

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>วันหยุดบริษัท (Holiday)</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลวันหยุดบริษัท</Typography>
                    <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)", // ปรับเป็น 4 ได้ตามขนาดหน้าจอ
                                gap: "20px",
                            }}
                        >
                            {months.map((month, index) => (
                                <div key={index}>
                                    <h3 style={{ textAlign: "center", marginBottom: "8px" }}>
                                        {formatThaiMonth(month)}
                                    </h3>
                                    <Box onClick={() => UpdateDayOff(formatThaiMonth(month))}>
                                        <DateCalendar
                                            defaultValue={month}
                                            referenceDate={month}
                                            disableHighlightToday
                                            readOnly
                                            showDaysOutsideCurrentMonth
                                            sx={{
                                                borderRadius: 2,
                                                boxShadow: "2px 6px 12px rgba(0,0,0,0.15)",
                                                backgroundColor: theme.palette.primary.light,
                                            }}
                                            slots={{
                                                day: (props) => {
                                                    const date = dayjs(props.day);
                                                    const dateStr = date.format("YYYY-MM-DD");
                                                    const isToday = date.isSame(dayjs(), "day");
                                                    const isHoliday = holidayDates.includes(dateStr);
                                                    const isSunday = date.day() === 0;
                                                    const isOtherMonth = !date.isSame(month, "month");

                                                    // ใช้ชื่อวันหยุดถ้ามี
                                                    const holidayName = getHolidayName(dateStr);

                                                    return (
                                                        <PickersDay
                                                            {...props}
                                                            title={isHoliday ? holidayName : undefined} // Tooltip ที่แสดงชื่อวันหยุด
                                                            sx={{
                                                                bgcolor: isHoliday ? "#ffebee" : "transparent",
                                                                color: isHoliday
                                                                    ? "red"
                                                                    : isOtherMonth
                                                                        ? "#ccc"
                                                                        : isSunday
                                                                            ? "red"
                                                                            : "inherit",
                                                                fontWeight: "normal",
                                                                border: isToday ? "none" : undefined,
                                                                "&.Mui-selected": {
                                                                    backgroundColor: "transparent !important",
                                                                    color: isHoliday
                                                                        ? "red"
                                                                        : isOtherMonth
                                                                            ? "#ccc"
                                                                            : isSunday
                                                                                ? "red"
                                                                                : "inherit",
                                                                    fontWeight: "normal",
                                                                },
                                                                "&.MuiPickersDay-today": {
                                                                    border: "none",
                                                                },
                                                            }}
                                                        />
                                                    );
                                                },
                                            }}
                                        />
                                    </Box>
                                </div>
                            ))}
                        </div>
                    </LocalizationProvider>
                </Box>
            </Paper>
            <Dialog
                open={openPopup}
                keepMounted
                maxWidth="md"
                onClose={handleCancel}
            >
                <DialogTitle sx={{ backgroundColor: theme.palette.primary.dark }}>
                    <Grid container spacing={2}>
                        <Grid size={10}>
                            <Typography variant="h6" fontWeight="bold" color="white" >จัดการวันหยุดบริษัทเดือน</Typography>
                        </Grid>
                        <Grid size={2} textAlign="right">
                            <IconButtonError onClick={handleClose}>
                                <CancelIcon />
                            </IconButtonError>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} marginTop={2} width="100%">
                        <Grid item size={5}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)", // ปรับเป็น 4 ได้ตามขนาดหน้าจอ
                                        gap: "20px",
                                    }}
                                >
                                    {months.map((month, index) => (
                                        newMonth === formatThaiMonth(month) &&
                                        < div key={index} >
                                            <DateCalendar
                                                defaultValue={month}
                                                referenceDate={month}
                                                disableHighlightToday
                                                readOnly
                                                showDaysOutsideCurrentMonth
                                                sx={{
                                                    borderRadius: 2,
                                                    boxShadow: "2px 6px 12px rgba(0,0,0,0.15)",
                                                    backgroundColor: theme.palette.primary.light,
                                                }}
                                                slots={{
                                                    day: (props) => {
                                                        const date = dayjs(props.day);
                                                        const dateStr = date.format("YYYY-MM-DD");
                                                        const isToday = date.isSame(dayjs(), "day");
                                                        const isHoliday = holidayDates.includes(dateStr);
                                                        const isSunday = date.day() === 0;
                                                        const isOtherMonth = !date.isSame(month, "month");

                                                        // ใช้ชื่อวันหยุดถ้ามี
                                                        const holidayName = getHolidayName(dateStr);

                                                        return (
                                                            <PickersDay
                                                                {...props}
                                                                title={isHoliday ? holidayName : undefined} // Tooltip ที่แสดงชื่อวันหยุด
                                                                sx={{
                                                                    bgcolor: isHoliday ? "#ffebee" : "transparent",
                                                                    color: isHoliday
                                                                        ? "red"
                                                                        : isOtherMonth
                                                                            ? "#ccc"
                                                                            : isSunday
                                                                                ? "red"
                                                                                : "inherit",
                                                                    fontWeight: "normal",
                                                                    border: isToday ? "none" : undefined,
                                                                    "&.Mui-selected": {
                                                                        backgroundColor: "transparent !important",
                                                                        color: isHoliday
                                                                            ? "red"
                                                                            : isOtherMonth
                                                                                ? "#ccc"
                                                                                : isSunday
                                                                                    ? "red"
                                                                                    : "inherit",
                                                                        fontWeight: "normal",
                                                                    },
                                                                    "&.MuiPickersDay-today": {
                                                                        border: "none",
                                                                    },
                                                                }}
                                                            />
                                                        );
                                                    },
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </LocalizationProvider>
                        </Grid>
                        <Grid item size={7}>
                            <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                <TableExcel
                                    key={newMonth} // 👈 บังคับให้ component re-mount เมื่อ newMonth เปลี่ยน
                                    columns={columns}
                                    initialData={holidayList.filter(h =>
                                        formatThaiMonth(dayjs(h.date, 'DD/MM/YYYY')) === newMonth
                                    )}
                                    onDataChange={setHolidayList}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ borderTop: `2px solid ${theme.palette.primary.dark}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button variant="contained" color="error" onClick={handleClose}>ยกเลิก</Button>
                    <Button variant="contained" color="success" >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    )
}

export default DayOffDetail