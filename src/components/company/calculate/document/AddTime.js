import React, { useState, useEffect, use } from "react";
import '../../../../App.css'
import { getDatabase, ref, push, onValue, set, update, serverTimestamp, get } from "firebase/database";
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

const AddTimeDetail = (props) => {
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

        const docLeaveRef = ref(firebaseDB, `workgroup/company/${companyId}/documenttime/${year}/${m + 1}`);

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

            setDocLeave(merged);
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId, year, m, dateArray]);

    const handleApprove = (newID, date, type, checkin, checkout, empid, attendantID, workshift) => {
        //console.log("show : ",`workgroup/company/${companyId}/employee/${empid}/attendant/${year}/${m + 1}/${newID}`)
        // const timeEmployee = ref(
        //     firebaseDB,
        //     `workgroup/company/${companyId}/employee/${empid}/attendant/${year}/${m + 1}`
        // );

        // onValue(timeEmployee, (snapshot) => {
        //     const docLeaveData = snapshot.val() || {};

        //     const show = {
        //         ID: attendantID ? attendantID : docLeaveData.length,
        //         DDI: type === "ขอแก้ไขเวลาเข้างาน" ? dayjs(date, "DD/MM/YYYY").format("DD") : "",
        //         DDO: type === "ขอแก้ไขเวลาเข้างาน" ? "" : dayjs(date, "DD/MM/YYYY").format("DD"),
        //         MMI: type === "ขอแก้ไขเวลาเข้างาน" ? dayjs(date, "DD/MM/YYYY").format("MM") : "",
        //         MMO: type === "ขอแก้ไขเวลาเข้างาน" ? "" : dayjs(date, "DD/MM/YYYY").format("MM"),
        //         YYYYI: type === "ขอแก้ไขเวลาเข้างาน" ? dayjs(date, "DD/MM/YYYY").format("YYYY") : "",
        //         YYYYO: type === "ขอแก้ไขเวลาเข้างาน" ? "" : dayjs(date, "DD/MM/YYYY").format("YYYY"),
        //         checkin: type === "ขอแก้ไขเวลาเข้างาน" ? checkin : "",
        //         checkout: type === "ขอแก้ไขเวลาเข้างาน" ? "" : checkout,
        //         datecodeI: type === "ขอแก้ไขเวลาเข้างาน" ? dayjs(date, "DD/MM/YYYY").format("YYYY.MMDD") : "",
        //         datecodeO: type === "ขอแก้ไขเวลาเข้างาน" ? "" : dayjs(date, "DD/MM/YYYY").format("YYYY.MMDD"),
        //         datein: type === "ขอแก้ไขเวลาเข้างาน" ? dayjs(date, "DD/MM/YYYY").format("DD/MM/YYYY") : "",
        //         dateout: type === "ขอแก้ไขเวลาเข้างาน" ? "" : dayjs(date, "DD/MM/YYYY").format("DD/MM/YYYY"),
        //         shift: workshift,
        //         status: attendantID ? 2 : 1,
        //         unixin: type === "ขอแก้ไขเวลาเข้างาน" ? serverTimestamp() : "",
        //         unuxout: type === "ขอแก้ไขเวลาเข้างาน" ? "" : serverTimestamp(),
        //     };

        //     console.log("SHOW ===>", show);
        // });

        ShowConfirm(
            "อนุมัติเอกสาร",
            "คุณต้องการอนุมัติเอกสารนี้หรือไม่?",
            async () => {
                const attendant = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${empid}/attendant/${year}/${m + 1}`
                );

                // ✅ ใช้ get แทน onValue
                const snapshot = await get(attendant);
                const data = snapshot.val() || {};
                const length = Object.keys(data).length;

                // อัปเดต documenttime
                const addTimeRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/documenttime/${year}/${m + 1}/${newID}`
                );

                await update(addTimeRef, {
                    status: "อนุมัติ",
                    approveBy: "HR",
                    approveDate: dayjs().format("DD/MM/YYYY"),
                    approveTime: dayjs().format("HH:mm:ss")
                });

                // อัปเดต attendant (ใช้ attendantID ถ้ามี, ถ้าไม่มีก็ใช้ length+1)
                const newIDValue = attendantID ? attendantID : length;

                const timeDetail = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/employee/${empid}/attendant/${year}/${m + 1}/${newIDValue}`
                );

                if (type === "ขอแก้ไขเวลาเข้างาน") {
                    await update(timeDetail, {
                        ID: newIDValue,
                        DDI: dayjs(date, "DD/MM/YYYY").format("DD"),
                        MMI: dayjs(date, "DD/MM/YYYY").format("MM"),
                        YYYYI: dayjs(date, "DD/MM/YYYY").format("YYYY"),
                        checkin: checkin,
                        datecodeI: dayjs(date, "DD/MM/YYYY").format("YYYY.MMDD"),
                        datein: dayjs(date, "DD/MM/YYYY").format("DD/MM/YYYY"),
                        shift: workshift,
                        status: attendantID ? 2 : 1,
                        unixin: serverTimestamp(),
                    });
                } else {
                    await update(timeDetail, {
                        ID: newIDValue,
                        DDO: dayjs(date, "DD/MM/YYYY").format("DD"),
                        MMO: dayjs(date, "DD/MM/YYYY").format("MM"),
                        YYYYO: dayjs(date, "DD/MM/YYYY").format("YYYY"),
                        checkout: checkout,
                        datecodeO: dayjs(date, "DD/MM/YYYY").format("YYYY.MMDD"),
                        dateout: dayjs(date, "DD/MM/YYYY").format("DD/MM/YYYY"),
                        shift: workshift,
                        status: attendantID ? 2 : 1,
                        unuxout: serverTimestamp(),
                    });
                }

                const attendants = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/documenttime/${year}/${m + 1}`
                );

                // ✅ ใช้ get แทน onValue
                const snapshots = await get(attendants);
                const datas = snapshots.val() || {};
                const datadetail = Object.entries(datas); // [ [key, value], ... ]

                // ✅ loop หา documenttime ที่ตรง datein แล้วอัปเดต attendantID
                for (const [key, value] of datadetail) {
                    if (value.datein === date) {
                        const updateRef = ref(
                            firebaseDB,
                            `workgroup/company/${companyId}/documenttime/${year}/${m + 1}/${key}`
                        );

                        await update(updateRef, {
                            attendantID: newIDValue,
                        });
                    }
                }
            },
            () => {
                console.log("ยกเลิกการอนุมัติ");
            }
        );
    };

    const handleCancel = (newID, date, type, checkin, checkout, empid, attendantID, workshift) => {
        ShowConfirm(
            "ไม่อนุมัติเอกสาร",
            "คุณต้องการปฏิเสธเอกสารนี้หรือไม่?",
            () => {
                const leaveRef = ref(
                    firebaseDB,
                    `workgroup/company/${companyId}/documenttime/${year}/${m + 1}/${newID}`
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
                <TableContainer component={Paper} textAlign="center">
                    <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "1080px" }}>
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
                                <TablecellHeader sx={{ width: 150 }}>วันที่</TablecellHeader>
                                <TablecellHeader sx={{ width: 120 }}>เวลา</TablecellHeader>
                                <TablecellHeader sx={{ width: 200 }}>รายละเอียด</TablecellHeader>
                                <TablecellHeader sx={{ width: 230 }}>สถานะ</TablecellHeader>
                                <TablecellHeader sx={{ width: 260 }}>หมายเหตุ</TablecellHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                docLeave.map((emp, index) => (
                                    <React.Fragment>
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
                                        {
                                            emp.documentLeave.map((date, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>วันที่ {formatThaiShort(dayjs(date.datein, "DD/MM/YYYY"))}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {date.timerequesttype === "ขอแก้ไขเวลาเข้างาน" ? date.checkin : date.timerequesttype === "ขอแก้ไขเวลาเลิกงาน" ? date.checkout : ""} น.
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {date.timerequesttype}
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
                                                                            <IconButton size="small" onClick={() => handleCancel(date.ID, date.datein, date.timerequesttype, date.checkin, date.checkout, emp.ID, date.attendantID, emp.workshift)} >
                                                                                <InsertDriveFileIcon sx={{ color: theme.palette.error.main, fontSize: "28px" }} />
                                                                                <CloseIcon sx={{ color: "white", fontSize: "16px", fontWeight: "bold", marginLeft: -3, marginTop: 1 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="อนุมัติ" placement="top">
                                                                            <IconButton size="small" onClick={() => handleApprove(date.ID, date.datein, date.timerequesttype, date.checkin, date.checkout, emp.ID, date.attendantID, emp.workshift)} >
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
                                                    <TableCell sx={{ textAlign: "center" }}>
                                                        {date.note}
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

export default AddTimeDetail