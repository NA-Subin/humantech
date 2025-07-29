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
import { Checkbox, InputAdornment } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../theme/TableExcel";
import { ShowError, ShowSuccess, ShowWarning } from "../../../sweetalert/sweetalert";
import { useFirebase } from "../../../server/ProjectFirebaseContext";

const WorkShiftDetail = () => {
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editWorkshift, setEditWorkshift] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [workshift, setWorkshift] = useState([{ ID: 0, name: '' }]);

    const daysMap = {
        monday: "จันทร์",
        tuesday: "อังคาร",
        wednesday: "พุธ",
        thursday: "พฤหัสบดี",
        friday: "ศุกร์",
        saturday: "เสาร์",
        sunday: "อาทิตย์",
    };

    const columns = [
        { label: "กะการทำงาน", key: "name", type: "text" },
        { label: "เข้า", key: "start", type: "time" },
        { label: "ออก", key: "stop", type: "time" },
        { label: "จำนวนชั่วโมง", key: "totalWorkHours", type: "number" },
        ...Object.entries(daysMap).map(([key, label]) => ({
            label,
            key,
            type: "checkbox",
        })),
    ];

    const reverseWorkshift = (list) => {
        // สร้าง reverse map จากภาษาไทย -> key
        const reverseDaysMap = Object.fromEntries(
            Object.entries(daysMap).map(([key, value]) => [value, key])
        );

        return list.map(shift => {
            const newShift = {
                ID: shift.ID,
                name: shift.name,
                start: shift.start,
                stop: shift.stop,
                status: shift.status,
                totalWorkHours: shift.totalWorkHours,
            };

            // กำหนดค่าเริ่มต้นเป็น 0 สำหรับทุกวัน
            Object.keys(daysMap).forEach(dayKey => {
                newShift[dayKey] = 0;
            });

            // แปลง holiday -> ใส่ค่ากลับไปที่ key
            shift.holiday?.forEach(h => {
                const dayKey = reverseDaysMap[h.name];
                if (dayKey) {
                    newShift[dayKey] = 1;
                }
            });

            return newShift;
        });
    };

    const restored = reverseWorkshift(workshift);
    console.log("✅ แปลงกลับ:", restored);

    const handleWorkshiftChange = (updatedList) => {
        const updated = updatedList.map(shift => {
            const holidays = Object.keys(daysMap)
                .filter(dayKey => shift[dayKey] === 1)
                .map((dayKey, index) => ({
                    ID: index,
                    name: daysMap[dayKey],
                    zeller: 1,
                }));

            return {
                ID: shift.ID,
                name: shift.name,
                start: shift.start,
                stop: shift.stop,
                status: shift.status,
                totalWorkHours: shift.totalWorkHours,
                holiday: holidays,
            };
        });

        setWorkshift(updated);
    };


    console.log("workshift : ", workshift);
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

        const workshiftRef = ref(firebaseDB, `workgroup/company/${companyId}/workshift`);

        const unsubscribe = onValue(workshiftRef, (snapshot) => {
            const workshiftData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!workshiftData) {
                setWorkshift([{ ID: 0, name: '' }]);
            } else {
                setWorkshift(workshiftData);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    const handleSave = () => {
        const companiesRef = ref(firebaseDB, `workgroup/company/${companyId}/workshift`);

        const invalidMessages = [];

        workshift.forEach((row, rowIndex) => {
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
        const names = workshift.map(row => row.deptname?.trim()).filter(Boolean); // ตัดช่องว่างด้วย
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
        set(companiesRef, workshift)
            .then(() => {
                ShowSuccess("บันทึกข้อมูลสำเร็จ");
                console.log("บันทึกสำเร็จ");
                setEditWorkshift(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึก");
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            });
    };

    const handleCancel = () => {
        const workshiftRef = ref(firebaseDB, `workgroup/company/${companyId}/workshift`);

        onValue(workshiftRef, (snapshot) => {
            const workshiftData = snapshot.val() || [{ ID: 0, name: '' }];
            setWorkshift(workshiftData);
            setEditWorkshift(false);
        }, { onlyOnce: true }); // เพิ่มเพื่อไม่ให้ subscribe ถาวร
    };

    return (
        <Container maxWidth="xl" sx={{ p: 5 }}>
            <Box sx={{ flexGrow: 1, p: 5, marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item size={12}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>กะการทำงาน (Work Shift)</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Paper sx={{ p: 5, width: "1250px", marginTop: -3, borderRadius: 4 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>จัดการข้อมูลกะการทำงาน</Typography>
                    <Divider sx={{ marginBottom: 2, border: `1px solid ${theme.palette.primary.dark}`, opacity: 0.5 }} />
                    <Grid container spacing={2}>
                        <Grid item size={editWorkshift ? 12 : 11}>
                            {
                                editWorkshift ?
                                    <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden" }}>
                                        {/* <HotTable
                                            data={workshift}
                                            afterChange={handleChange(setWorkshift)}
                                            licenseKey="non-commercial-and-evaluation"
                                            colHeaders={['ชื่อแผนก', 'ส่วนงาน']}
                                            rowHeaders={true}
                                            width="100%"
                                            height="auto"
                                            stretchH="all"
                                            manualColumnResize={true}
                                            manualRowResize={true}
                                            rowHeights={28}               // ความสูงของ td
                                            columnHeaderHeight={45}       // ความสูงของ th (หัวตาราง)
                                            contextMenu={true}
                                            copyPaste={true}
                                            className="mui-hot-table"
                                            columns={[
                                                { data: 'deptname', className: 'htCenter htMiddle' },
                                                { data: 'section', className: 'htCenter htMiddle' },
                                            ]}
                                        /> */}
                                        <TableExcel
                                            styles={{ height: "50vh" }} // ✅ ส่งเป็น object
                                            stylesTable={{ width: "1300px" }} // ✅ ส่งเป็น object
                                            columns={columns}
                                            initialData={restored}
                                            onDataChange={handleWorkshiftChange}
                                        />
                                    </Paper>

                                    :
                                    <TableContainer component={Paper} textAlign="center">
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" } }}>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                    <TablecellHeader rowSpan={2} sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                                    <TablecellHeader rowSpan={2}>กะการทำงาน</TablecellHeader>
                                                    <TablecellHeader colSpan={2}>ช่วงเวลา</TablecellHeader>
                                                    <TablecellHeader rowSpan={2}>จำนวนชั่วโมง</TablecellHeader>
                                                    <TablecellHeader colSpan={7}>กำหนดวันหยุด</TablecellHeader>
                                                </TableRow>
                                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                    <TablecellHeader>เข้า</TablecellHeader>
                                                    <TablecellHeader>ออก</TablecellHeader>
                                                    <TablecellHeader>จันทร์</TablecellHeader>
                                                    <TablecellHeader>อังคาร</TablecellHeader>
                                                    <TablecellHeader>พุธ</TablecellHeader>
                                                    <TablecellHeader>พฤหัสบดี</TablecellHeader>
                                                    <TablecellHeader>ศุกร์</TablecellHeader>
                                                    <TablecellHeader>เสาร์</TablecellHeader>
                                                    <TablecellHeader>อาทิตย์</TablecellHeader>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    restored.length === 0 ?
                                                        <TableRow>
                                                            <TablecellNoData colSpan={3}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                                        </TableRow>
                                                        :
                                                        restored.map((row, index) => (
                                                            <TableRow key={row.ID ?? index}>
                                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.name}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.start}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.stop}</TableCell>
                                                                <TableCell sx={{ textAlign: "center" }}>{row.breakMinutes}</TableCell>

                                                                {Object.keys(daysMap).map((dayKey) => (
                                                                    <TableCell key={dayKey} sx={{ textAlign: "center" }}>
                                                                        <Checkbox
                                                                            sx={{ marginTop: -1, marginBottom: -1 }}
                                                                            checked={row[dayKey] === 1}
                                                                            disabled
                                                                            color="primary"
                                                                        />
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))
                                                }
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                            }
                        </Grid>
                        {
                            !editWorkshift &&
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
                                        onClick={() => setEditWorkshift(true)}
                                    >
                                        <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                        แก้ไข
                                    </Button>
                                    {/* {
                                    editWorkshift ?
                                        <Box textAlign="right">
                                            <IconButton variant="contained" color="info" onClick={() => handleAddRow("workshift")}>
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                            <IconButton variant="contained" color="error" onClick={() => handleRemoveRow("workshift")}>
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        </Box>
                                        :
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
                                            onClick={() => setEditWorkshift(true)}
                                        >
                                            <ManageAccountsIcon sx={{ fontSize: 28, mb: 0.5, marginBottom: -0.5 }} />
                                            แก้ไข
                                        </Button>
                                } */}
                                </Box>
                            </Grid>
                        }
                    </Grid>
                    {
                        editWorkshift &&
                        <Box display="flex" justifyContent="center" alignItems="center" marginTop={1}>
                            <Button variant="contained" size="small" color="error" onClick={handleCancel} sx={{ marginRight: 1 }}>ยกเลิก</Button>
                            <Button variant="contained" size="small" color="success" onClick={handleSave} >บันทึก</Button>
                        </Box>
                    }
                </Box>
            </Paper>
        </Container>
    )
}

export default WorkShiftDetail