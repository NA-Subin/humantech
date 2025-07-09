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

import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import "dayjs/locale/th";
import { formatThaiFull, formatThaiMonth } from "../../../theme/DateTH";

const DayOffDetail = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const { companyName } = useParams();
    const [editLeave, setEditLeave] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [leave, setLeave] = useState([{ ID: 0, name: '' }]);
    const columns = [
        { label: "ประเภทการลา", key: "name", type: "text" }
    ];

    const holidayList = [
        {
            ID: 1,
            holiday: "วันปีใหม่",
            date: "01/01/2025",
        },
        {
            ID: 2,
            holiday: "วันมาฆบูชา",
            date: "11/02/2025",
        },
        {
            ID: 3,
            holiday: "วันจักรี",
            date: "06/04/2025",
        },
        {
            ID: 4,
            holiday: "วันสงกรานต์",
            date: "13/04/2025",
        },
        {
            ID: 5,
            holiday: "วันสงกรานต์",
            date: "14/04/2025",
        },
        {
            ID: 6,
            holiday: "วันสงกรานต์",
            date: "15/04/2025",
        },
        {
            ID: 7,
            holiday: "วันแรงงานแห่งชาติ",
            date: "01/05/2025",
        },
        {
            ID: 8,
            holiday: "วันฉัตรมงคล",
            date: "05/05/2025",
        },
        {
            ID: 9,
            holiday: "วันพืชมงคล",
            date: "09/05/2025",
        },
        {
            ID: 10,
            holiday: "วันวิสาขบูชา",
            date: "12/05/2025",
        },
        {
            ID: 11,
            holiday: "วันเฉลิมพระชนมพรรษา ร.10",
            date: "28/07/2025",
        },
        {
            ID: 12,
            holiday: "วันแม่แห่งชาติ",
            date: "12/08/2025",
        },
        {
            ID: 13,
            holiday: "วันปิยมหาราช",
            date: "23/10/2025",
        },
        {
            ID: 14,
            holiday: "วันพ่อแห่งชาติ",
            date: "05/12/2025",
        },
        {
            ID: 15,
            holiday: "วันรัฐธรรมนูญ",
            date: "10/12/2025",
        },
        {
            ID: 16,
            holiday: "วันสิ้นปี",
            date: "31/12/2025",
        },
    ];


    const today = dayjs().locale("th");
    const months = Array.from({ length: 12 }, (_, i) => today.startOf("year").add(i, "month"));

    const holidayDates = holidayList.map(h => dayjs(h.date, "DD/MM/YYYY").format("YYYY-MM-DD"));

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

        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        const unsubscribe = onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!leaveData) {
                setLeave([{ ID: 0, name: '' }]);
            } else {
                setLeave(leaveData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        const invalidMessages = [];

        leave.forEach((row, rowIndex) => {
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
        const names = leave.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
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
        set(companiesRef, leave)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEditLeave(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const leaveRef = ref(firebaseDB, `workgroup/company/${companyId}/leave`);

        onValue(leaveRef, (snapshot) => {
            const leaveData = snapshot.val() || [{ ID: 0, name: '' }];
            setLeave(leaveData);
            setEditLeave(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>วันหยุดบริษัท (Leave)</Typography>
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
                                    <DateCalendar
                                        defaultValue={month}
                                        referenceDate={month}
                                        disableHighlightToday
                                        readOnly
                                        showDaysOutsideCurrentMonth
                                        sx={{
                                            //border: `2px solid ${theme.palette.primary.dark}`,
                                            borderRadius: 2,
                                            boxShadow: "2px 6px 12px rgba(0,0,0,0.15)", // เงานูนขึ้น
                                            backgroundColor: theme.palette.primary.light, // เพื่อให้เงาเห็นชัดเจน
                                        }}
                                        slots={{
                                            day: (props) => {
                                                const date = dayjs(props.day);
                                                const isToday = date.isSame(dayjs(), "day");
                                                const isHoliday = holidayDates.includes(date.format("YYYY-MM-DD"));
                                                const isSunday = date.day() === 0;
                                                const isOtherMonth = !date.isSame(month, "month");

                                                return (
                                                    <PickersDay
                                                        {...props}
                                                        sx={{
                                                            bgcolor: isHoliday ? "#ffebee" : "transparent", // วันหยุดพิเศษ
                                                            color: isHoliday
                                                                ? "red"
                                                                : isOtherMonth
                                                                    ? "#ccc"
                                                                    : isSunday
                                                                        ? "red"  // ✅ วันอาทิตย์ปกติ
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
                </Box>
            </Paper>
        </Container>
    )
}

export default DayOffDetail