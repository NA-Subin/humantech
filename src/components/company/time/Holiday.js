import React, { useState, useEffect, use } from "react";
import '../../../App.css'
import { getDatabase, ref, push, onValue, set, get } from "firebase/database";
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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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

const HolidayDetail = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const companyName = localStorage.getItem("company");
    // const [searchParams] = useSearchParams();
    // const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editLeave, setEditLeave] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [holidays, setHolidays] = useState(true);
    const [holidayList, setHolidayList] = useState([{ ID: 0, date: '', holiday: '' }]);
    const [holiday, setHoliday] = useState([{ ID: 0, date: '', holiday: '' }]);
    const columns = [
        { label: "วันที่", key: "date", type: "date", width: "50%" },
        { label: "ชื่อวันหยุด", key: "holiday", type: "text", width: "50%" }
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

    console.log("holiday : ", holiday);
    console.log("holidays : ", holidays);

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

    console.log("holiday : ", holidayList);

    // แยก companyId จาก companyName (เช่น "0:HPS-0000")
    const companyId = companyName?.split(":")[0];

    const handleHolidayChange = (updatedList) => {
        const updated = updatedList.map(shift => {
            const rawDate = (shift.date || "").trim();
            const parsed = dayjs(rawDate, "DD/MM/YYYY", true); // ใช้ strict parsing

            // ตรวจสอบว่า valid จริงหรือไม่
            if (!parsed.isValid()) {
                console.warn("❌ Invalid date format for:", rawDate);
                return {
                    ...shift,
                    DD: "",
                    MM: "",
                    YYYY: "",
                };
            }

            return {
                ...shift,
                DD: parsed.format("DD"),
                MM: parsed.format("MM"),
                YYYY: parsed.format("YYYY"),
            };
        });

        setHoliday(updated);
    };

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

        const dayOffRef = ref(firebaseDB, `workgroup/company/${companyId}/holiday`);

        const unsubscribe = onValue(dayOffRef, (snapshot) => {
            const dayOffData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!dayOffData) {
                setHolidayList([{ ID: 0, date: '', holiday: '' }]);
                setHoliday([{ ID: 0, date: '', holiday: '' }]);
            } else {
                setHolidayList(dayOffData);
                setHoliday(dayOffData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);


    const handleSave = (monthHolidays, allHolidayList) => {
        console.log("monthHolidays : ", monthHolidays);
        let maxId = allHolidayList.reduce((max, item) => Math.max(max, item.ID), 0);
        const updatedHolidayList = [...allHolidayList];

        const assignedHolidays = monthHolidays.map(h => {
            // ✅ ใช้ date เทียบแทน ID
            const found = allHolidayList.find(item => item.date === h.date);
            if (found) {
                return { ...found, ...h, ID: found.ID }; // ใช้ ID เดิม
            } else {
                maxId += 1;
                return { ...h, ID: maxId }; // เพิ่มใหม่พร้อม ID ใหม่
            }
        });

        console.log("assignedHolidays : ", assignedHolidays);

        // ✅ รวมข้อมูลใหม่เข้า updatedHolidayList
        assignedHolidays.forEach(h => {
            const index = updatedHolidayList.findIndex(item => item.date === h.date);
            if (index !== -1) {
                updatedHolidayList[index] = h; // อัปเดต
            } else {
                updatedHolidayList.push(h); // เพิ่มใหม่
            }
        });

        console.log("📌 Final updatedHolidayList:", updatedHolidayList);

        // 🔄 บันทึกลง Firebase (uncomment เมื่อใช้งานจริง)
        const holidayRef = ref(firebaseDB, `workgroup/company/${companyId}/holiday`);
        set(holidayRef, updatedHolidayList)
            .then(() => {
                console.log("✅ บันทึกวันหยุดสำเร็จ");
            })
            .catch((err) => console.error("❌ เกิดข้อผิดพลาด:", err));

    };


    const handleCancel = () => {
        const dayoffRef = ref(firebaseDB, `workgroup/company/${companyId}/holiday`);

        onValue(dayoffRef, (snapshot) => {
            const dayoffData = snapshot.val() || [{ ID: 0, name: '' }];
            setHolidayList(dayoffData);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    const handleSaveHolidays = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/holiday`);

        const invalidMessages = [];

        holiday.forEach((row, rowIndex) => {
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
        const names = holiday.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
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
        set(companiesRef, holiday)
            .then(() => {
                console.log("บันทึกสำเร็จ");
                setHolidays(true);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancelHolidays = () => {
        const dayoffRef = ref(firebaseDB, `workgroup/company/${companyId}/holiday`);

        onValue(dayoffRef, (snapshot) => {
            const dayoffData = snapshot.val() || [];
            setHoliday(dayoffData);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
        setHolidays(true);
    }

    const [newMonth, setNewMonth] = useState("");

    const UpdateDayOff = (newMonth) => {
        setOpenPopup(true)
        setNewMonth(newMonth);
    }

    return (
        <Container maxWidth="xl" sx={{ p: 5, width: windowWidth - 290 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={10}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>วันหยุดบริษัท (Holiday)</Typography>
                    </Grid>
                    <Grid item size={2} textAlign="right">
                        {
                            holidays ?
                                <Button variant="contained" onClick={() => setHolidays(false)} >เพิ่มวันหยุดบริษัท</Button>
                                :
                                <Button variant="contained" color="error" onClick={() => setHolidays(true)} >ยกเลิก</Button>
                        }
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5, width: "100%", marginTop: -3, borderRadius: 4 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลวันหยุดบริษัท</Typography>
                    <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                    {
                        holidays ?
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                <Grid container spacing={2}>
                                    {months.map((month, index) => (
                                        <Grid key={index} item size={{ xs: 12, md: 6, lg: 4 }}>
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
                                        </Grid>
                                    ))}
                                </Grid>
                            </LocalizationProvider>
                            :
                            <TableExcel
                                columns={columns}
                                initialData={holiday}
                                onDataChange={handleHolidayChange}
                            />
                    }
                </Box>
                {
                    !holidays &&
                    <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                        <Button variant="contained" size="small" color="error" onClick={handleCancelHolidays} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                        <Button variant="contained" size="small" color="success" onClick={handleSaveHolidays} >บันทึก</Button>
                    </Box>
                }
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
                    <Button variant="contained" color="success"
                        onClick={() => {
                            const currentMonthHolidays = holidayList.filter(h =>
                                formatThaiMonth(dayjs(h.date, "DD/MM/YYYY")) === newMonth
                            );
                            handleSave(currentMonthHolidays, holiday); // 👈 ส่ง holidayList ด้วย
                        }}
                    >
                        บันทึกวันหยุดเดือนนี้
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    )
}

export default HolidayDetail