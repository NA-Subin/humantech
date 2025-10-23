import React, { useState, useEffect, use } from "react";
import '../../../../App.css'
import { getDatabase, ref, push, onValue, set, update, get } from "firebase/database";
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
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import theme from "../../../../theme/theme";
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Item, TablecellHeader, TablecellBody, ItemButton, TablecellNoData, BorderLinearProgressCompany } from "../../../../theme/style"

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Checkbox, FormControlLabel, FormGroup, InputAdornment, Tooltip } from "@mui/material";
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import TableExcel from "../../../../theme/TableExcel";
import { ShowConfirm, ShowError, ShowSuccess, ShowWarning } from "../../../../sweetalert/sweetalert";
import { useFirebase } from "../../../../server/ProjectFirebaseContext";
import SelectEmployeeGroup from "../../../../theme/SearchEmployee";
import dayjs from "dayjs";
import { formatThaiShort } from "../../../../theme/DateTH";
dayjs.locale("en"); // ใส่ตรงนี้ก่อนใช้ dayjs.format("dddd")

const LeaveDetail = (props) => {
    const { dateArray, month } = props;
    const { firebaseDB, domainKey } = useFirebase();
    const [searchParams] = useSearchParams();
    const companyName = searchParams.get("company");
    //const { companyName } = useParams();
    const [editIncomepleteTime, setIncompleteTime] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [leave, setLeave] = useState([{ ID: 0, name: '' }]);
    const [docLeave, setDocLeave] = useState([]);
    const columns = [
        { label: "ประเภทการลา", key: "name", type: "text" },
        { label: "จำนวนวัน", key: "max", type: "text" }
    ];

    const year = month.year();   // จาก dayjs, เช่น 2025
    const m = month.month();     // จาก dayjs, 0-11

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

        const docLeaveRef = ref(firebaseDB, `workgroup/company/${companyId}/documentleave/${year}/${m + 1}`);

        const unsubscribe = onValue(docLeaveRef, (snapshot) => {
            const docLeaveData = snapshot.val() || {};

            // เอา dateArray มารวมกับข้อมูลลา
            const merged = dateArray.map((emp) => {
                // หา leave records ของพนักงานจาก deptid
                const empLeave = Object.values(docLeaveData).filter(
                    (leave) => leave.empid === emp.ID
                );

                return {
                    ...emp,
                    documentLeave: empLeave.length > 0 ? empLeave : []  // เก็บ documentLeave ลงไป
                };
            });

            const hasLeave = merged.some(emp => emp.documentLeave.length > 0);

            setDocLeave(hasLeave ? merged : []);
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, year, m, dateArray]);

    const handleApprove = (newID, employ) => {
        console.log("employee name : ", employ.ID);
        ShowConfirm(
            "อนุมัติเอกสาร",
            "คุณต้องการอนุมัติเอกสารนี้หรือไม่?",
            async () => {
                try {
                    const leaveRef = ref(
                        firebaseDB,
                        `workgroup/company/${companyId}/documentleave/${year}/${m + 1}/${newID}`
                    );

                    // ✅ ดึงข้อมูลทั้งหมดจาก documentleave
                    const snapshot = await get(leaveRef);
                    if (snapshot.exists()) {
                        const leaveData = snapshot.val();

                        // ✅ เพิ่มข้อมูลอนุมัติ
                        const updatedData = {
                            ...leaveData,
                            status: "อนุมัติ",
                            approveBy: "HR",
                            approveDate: dayjs().format("DD/MM/YYYY"),
                            approveTime: dayjs().format("HH:mm:ss"),
                        };

                        // ✅ อัปเดตสถานะใน documentleave เดิม
                        await update(leaveRef, {
                            status: "อนุมัติ",
                            approveBy: "HR",
                            approveDate: updatedData.approveDate,
                            approveTime: updatedData.approveTime,
                        });

                        // ✅ บันทึกไปที่ emploeaveapprove ของพนักงาน
                        const approveRef = ref(
                            firebaseDB,
                            `workgroup/company/${companyId}/employee/${employ?.ID}/empleaveapprove/${year}/${m + 1}/${newID}`
                        );

                        await set(approveRef, updatedData);

                        console.log("✅ อนุมัติและบันทึกข้อมูลเรียบร้อย");
                    } else {
                        console.error("❌ ไม่พบข้อมูลเอกสารที่ต้องการอนุมัติ");
                    }
                } catch (error) {
                    console.error("❌ เกิดข้อผิดพลาด:", error);
                }
            },
            () => {
                console.log("❌ ยกเลิกการอนุมัติ");
            }
        );
    };

    const handleCancel = (newID) => {
        ShowConfirm(
            "ไม่อนุมัติเอกสาร",
            "คุณต้องการปฏิเสธเอกสารนี้หรือไม่?",
            () => {
                const leaveRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/documentleave/${year}/${m + 1}/${newID}`
                );
                update(leaveRef, {
                    status: "ไม่อนุมัติ",
                    approveBy: "HR",
                    approveDate: dayjs().format("DD/MM/YYYY"),
                    approveTime: dayjs().format("HH:mm:ss")
                });
            },
            () => {
                console.log("ยกเลิกการปฏิเสธ");
            }
        );
    };

    return (
        <React.Fragment>
            <Grid item size={12}>
                <TableContainer component={Paper} textAlign="center" sx={{ height: "70vh", width: "100%" }}>
                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1050px" }}>
                        <TableHead
                            sx={{
                                position: "sticky",
                                top: 0,
                                zIndex: 2,
                                backgroundColor: theme.palette.primary.dark,
                            }}
                        >
                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                <TablecellHeader sx={{ width: 60 }}>ลำดับ</TablecellHeader>
                                <TablecellHeader sx={{ width: 500 }}>วันที่และเวลา</TablecellHeader>
                                <TablecellHeader sx={{ width: 130 }}>จำนวน</TablecellHeader>
                                <TablecellHeader sx={{ width: 140 }}>ประเภท</TablecellHeader>
                                <TablecellHeader sx={{ width: 230 }}>สถานะ</TablecellHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                docLeave.length === 0 ?
                                    <TableRow sx={{ height: "60vh" }}>
                                        <TablecellNoData colSpan={6}><FolderOffRoundedIcon /><br />ไม่มีข้อมูล</TablecellNoData>
                                    </TableRow>
                                    :
                                    docLeave.map((emp, index) => (
                                        <React.Fragment>
                                            {
                                                emp.documentLeave.length !== 0 &&
                                                <TableRow>
                                                    <TableCell sx={{ textAlign: "left", height: "50px", backgroundColor: theme.palette.primary.light }} colSpan={6}>
                                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", paddingLeft: 2 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 2 }} gutterBottom>รหัสพนักงาน : {emp.employeecode}</Typography>
                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>{emp.employname}</Typography>
                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>({emp.nickname})</Typography>
                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>
                                                                ฝ่ายงาน {emp.department.split("-")[1].startsWith("ฝ่าย")
                                                                    ? emp.department.split("-")[1].replace("ฝ่าย", "").trim()
                                                                    : emp.department.split("-")[1]}
                                                            </Typography>
                                                            {
                                                                emp.section.split("-")[1] !== "ไม่มี" &&
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }} gutterBottom>ส่วนงาน {emp.section.split("-")[1]}</Typography>
                                                            }
                                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>ตำแหน่ง {emp.position.split("-")[1]}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            }
                                            {
                                                emp.documentLeave.map((date, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                        <TableCell sx={{ textAlign: "left" }}>
                                                            <Box sx={{ marginLeft: 2, marginRight: 2 }}>
                                                                <Typography variant="subtitle2" gutterBottom>ขอลางาน: ตั้งแต่วันที่ {formatThaiShort(dayjs(date.datestart, "DD/MM/YYYY"))} เวลา {date.timestart} ถึงวันที่ {formatThaiShort(dayjs(date.dateend, "DD/MM/YYYY"))} เวลา {date.timeend}</Typography>
                                                                <Typography variant="subtitle2" sx={{ marginTop: -0.5 }} gutterBottom>หมายเหตุ: {date.note}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {date.day} วัน
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center" }}>
                                                            {date.leave}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "left" }}>
                                                            <Box sx={{ marginLeft: 2, marginRight: 2, marginTop: date.status === "รออนุมัติ" && 1.5 }}>
                                                                <Box display="flex" justifyContent="left" alignItems="center">
                                                                    <Typography variant="subtitle2" gutterBottom>สถานะ : </Typography>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        sx={{
                                                                            fontWeight: "bold",
                                                                            marginLeft: 1,
                                                                            color: date.status === "รออนุมัติ" ? theme.palette.warning.main
                                                                                : date.status === "อนุมัติ" ? theme.palette.success.main
                                                                                    : theme.palette.error.main
                                                                        }}
                                                                        gutterBottom
                                                                    >
                                                                        {date.status}
                                                                    </Typography>
                                                                </Box>
                                                                {
                                                                    date.status === "รออนุมัติ" ?
                                                                        <Box sx={{ display: "flex", justifyContent: "right", alignItems: "center ", marginTop: -4.5 }}>
                                                                            <Tooltip title="ไม่อนุมัติ" placement="top">
                                                                                <IconButton size="small" onClick={() => handleCancel(date.ID)} >
                                                                                    <InsertDriveFileIcon sx={{ color: theme.palette.error.main, fontSize: "28px" }} />
                                                                                    <CloseIcon sx={{ color: "white", fontSize: "16px", fontWeight: "bold", marginLeft: -3, marginTop: 1 }} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title="อนุมัติ" placement="top">
                                                                                <IconButton size="small" onClick={() => handleApprove(date.ID, emp)} >
                                                                                    <InsertDriveFileIcon sx={{ color: theme.palette.primary.main, fontSize: "28px" }} />
                                                                                    <DoneIcon sx={{ color: "white", fontSize: "16px", fontWeight: "bold", marginLeft: -3, marginTop: 1 }} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                        :
                                                                        <Typography variant="subtitle2" sx={{ marginTop: -0.5 }} gutterBottom>อนุมัติโดย : {date.approveBy}</Typography>
                                                                }
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </React.Fragment>
                                    ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </React.Fragment>
    )
}

export default LeaveDetail