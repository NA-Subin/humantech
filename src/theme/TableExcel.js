import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Stack,
    Menu,
    MenuItem,
    Box,
    IconButton,
    Tooltip,
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import theme from "../theme/theme";
import { TablecellHeader } from "../theme/style";
import dayjs from "dayjs";

export default function TableExcel({
    columns = [], // [{ label, key }]
    initialData = [], // [{...}, {...}]
    onDataChange = () => { },
}) {
    const [data, setData] = useState(initialData);
    const [selectedCells, setSelectedCells] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const tableRef = useRef(null);

    const isSelecting = useRef(false);
    const startCell = useRef(null);

    // เริ่มลากเลือกเซลล์
    const handleMouseDown = (row, col) => {
        isSelecting.current = true;
        startCell.current = { row, col };
        setSelectedCells([[row, col]]);
    };

    const getCellBackgroundColor = (val, col) => {
        if (col?.type === "number") {
            if (val === "") return "#fff3cd"; // เหลือง
            if (isNaN(Number(val))) return "#f8d7da"; // แดง
        }
        if (col?.type === "select") {
            if (val === "") return "#fff3cd"; // ยังไม่เลือก
            const validOptions = col.options?.map(opt => opt.value);
            if (!validOptions.includes(val)) return "#f8d7da"; // ค่าผิด
        }
        return undefined;
    };

    // ลากเลือกเซลล์
    const handleMouseOver = (row, col) => {
        if (!isSelecting.current) return;
        const start = startCell.current;
        const newSelected = [];

        const minRow = Math.min(start.row, row);
        const maxRow = Math.max(start.row, row);
        const minCol = Math.min(start.col, col);
        const maxCol = Math.max(start.col, col);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                newSelected.push([r, c]);
            }
        }
        setSelectedCells(newSelected);
    };

    // ปล่อยเมาส์ เลิกเลือก
    const handleMouseUp = () => {
        isSelecting.current = false;
    };

    const getSelectWarningText = (val, col) => {
        if (col?.type === "select" && val === "") {
            return `กรุณาเลือก${col.label}`;
        }
        return "";
    };

    // เช็คเซลล์ที่เลือก
    const isCellSelected = (r, c) =>
        selectedCells.some(([row, col]) => row === r && col === c);

    // เปลี่ยนค่าใน cell
    const handleCellChange = (val, rowIdx, colKey) => {
        setData((prevData) => {
            const newData = [...prevData];
            if (!newData[rowIdx]) newData[rowIdx] = {};
            newData[rowIdx] = { ...newData[rowIdx], [colKey]: val };
            onDataChange(newData);
            return newData;
        });
    };
    // คัดลอกข้อมูลเซลล์ที่เลือกเป็น text แบบ tab-delimited
    const handleCopy = async () => {
        const rows = [...new Set(selectedCells.map(([r]) => r))].sort();
        const cols = [...new Set(selectedCells.map(([, c]) => c))].sort();

        const text = rows
            .map((r) => cols.map((c) => data[r]?.[columns[c].key] ?? "").join("\t"))
            .join("\n");

        await navigator.clipboard.writeText(text);
    };

    // วางข้อมูลจาก clipboard ลงในตาราง
    const handlePaste = async () => {
        const clipboard = await navigator.clipboard.readText();

        const rowsFromClipboard = clipboard
            .split(/\r?\n/)
            .filter(line => line.trim() !== "")
            .map((line) => line.split("\t"));

        const newData = [...data];
        const [startRow, startCol] = selectedCells[0] || [0, 0];

        rowsFromClipboard.forEach((row, i) => {
            const targetRow = startRow + i;

            if (!newData[targetRow]) {
                newData[targetRow] = columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
            }

            row.forEach((val, j) => {
                const targetCol = startCol + j;
                const colDef = columns[targetCol];
                if (colDef) {
                    let parsedVal = val.trim();
                    if (colDef.type === "select" && Array.isArray(colDef.options)) {
                        const matched = colDef.options.find(
                            opt => opt.value === parsedVal || opt.label === parsedVal
                        );
                        parsedVal = matched?.value || ""; // ถ้าไม่ match → ให้ค่าว่างเพื่อไม่ขึ้น error
                    }
                    newData[targetRow] = {
                        ...newData[targetRow],
                        [colDef.key]: parsedVal,
                    };
                }
            });
        });

        // อัปเดต ID ใหม่ให้ทุกแถว
        const updatedData = newData.map((row, idx) => ({
            ...row,
            ID: idx,
        }));

        setData(updatedData);
        onDataChange(updatedData);
    };


    // เพิ่มแถวใหม่ (object ว่างตาม columns)
    const addRow = () => {
        const newRow = columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
        newRow.ID = data.length; // ID = ลำดับแถวใหม่
        setData([...data, newRow]);
    };

    // ลบแถวที่เลือก
    const deleteRow = () => {
        if (selectedCells.length === 0) return;

        const rowsToDelete = [...new Set(selectedCells.map(([r]) => r))];
        let newData = data.filter((_, idx) => !rowsToDelete.includes(idx));

        // รีเซ็ต ID ให้ตรงตามลำดับใหม่
        newData = newData.map((row, idx) => ({
            ...row,
            ID: idx,
        }));

        setData(
            newData.length > 0
                ? newData
                : [{
                    ...columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {}),
                    ID: 0
                }]
        );
        setSelectedCells([]);
        onDataChange(newData);
    };


    // เปิด context menu คลิกขวา
    const openContextMenu = (event, row, col) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget);
        setSelectedCells([[row, col]]);
    };

    // ปิด context menu
    const handleCloseContextMenu = () => {
        setAnchorEl(null);
    };

    // ดักจับ Ctrl+C, Ctrl+V
    const handleKeyDown = (e) => {
        const key = e.key.toLowerCase();

        // รองรับทั้งภาษาอังกฤษและแป้นพิมพ์ไทย (C = คัดลอก, V = วาง)
        const isCopy = e.ctrlKey && (key === "c" || key === "แ");
        const isPaste = e.ctrlKey && (key === "v" || key === "อ");

        if (isCopy) {
            e.preventDefault();
            handleCopy();
        } else if (isPaste) {
            e.preventDefault();
            handlePaste();
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [selectedCells, data]);

    return (
        <>
            <Stack direction="row" spacing={2}>
                <TableContainer component={Paper} ref={tableRef}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                <TablecellHeader sx={{ width: 80 }}>ลำดับ</TablecellHeader>
                                {columns.map((col, idx) => (
                                    <TablecellHeader key={idx} sx={{ width: col.width ?? "auto" }} >{col.label}</TablecellHeader>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    <TableCell sx={{ textAlign: "center" }}>{rowIdx + 1}</TableCell>
                                    {columns.map((col, colIdx) => (
                                        <TableCell
                                            key={colIdx}
                                            onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                                            onMouseOver={() => handleMouseOver(rowIdx, colIdx)}
                                            onContextMenu={(e) => openContextMenu(e, rowIdx, colIdx)}
                                            style={{
                                                backgroundColor:
                                                    isCellSelected(rowIdx, colIdx)
                                                        ? theme.palette.primary.light
                                                        : getCellBackgroundColor(data[rowIdx]?.[col.key], col),
                                                textAlign: "center"
                                            }}
                                        >
                                            {(col.type === "select" || col.type === "dependent-select") ? (
                                                <>
                                                    <select
                                                        value={
                                                            // ตรวจสอบว่า row[col.key] ตรงกับ options.value หรือ label
                                                            col.options.find(opt => opt.value === row[col.key])?.value ??
                                                            col.options.find(opt => opt.label === row[col.key])?.value ??
                                                            ""
                                                        }
                                                        onChange={(e) => handleCellChange(e.target.value, rowIdx, col.key)}
                                                        style={{
                                                            width: "100%",
                                                            backgroundColor: getCellBackgroundColor(row[col.key], col),
                                                            outline: isCellSelected(rowIdx, colIdx)
                                                                ? `1px solid ${theme.palette.primary.dark}`
                                                                : "none",
                                                            border: "none",
                                                            height: "100%",
                                                            padding: 4,
                                                            textAlign: "center",
                                                            /** ✅ เพิ่มฟอนต์ที่ใช้ใน theme */
                                                            fontFamily: theme.typography.fontFamily
                                                        }}
                                                    >
                                                        <option value="">-- กรุณาเลือก{col.label} --</option>
                                                        {(() => {
                                                            // ✅ ตรวจว่าเป็น dependent-select หรือไม่
                                                            if (col.type === "dependent-select") {
                                                                const parentKey = col.dependsOn; // เช่น "department"
                                                                const parentValue = row[parentKey]; // เช่น "2"
                                                                const filteredOptions = col.options.filter(opt =>
                                                                    Array.isArray(opt.parent)
                                                                        ? opt.parent.includes(parentValue)
                                                                        : opt.parent === parentValue
                                                                );

                                                                return (
                                                                    filteredOptions.length > 0
                                                                        ? filteredOptions.map((opt, i) => (
                                                                            <option key={i} value={opt.value}>
                                                                                {opt.label}
                                                                            </option>
                                                                        ))
                                                                        : <option value="">ไม่มี</option> // 👈 กรณีไม่พบ option ที่สัมพันธ์
                                                                );
                                                            }

                                                            // ถ้าเป็น select ปกติ
                                                            return col.options.map((opt, i) => (
                                                                <option key={i} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ));
                                                        })()}
                                                    </select>
                                                    {/* {getSelectWarningText(row[col.key], col) && (
                                                    <div style={{ color: "orange", fontSize: "0.75rem" }}>
                                                        {getSelectWarningText(row[col.key], col)}
                                                    </div>
                                                )} */}
                                                </>
                                            )
                                                : col.type === "date" ? (
                                                    <input
                                                        type="date"
                                                        value={
                                                            row[col.key]
                                                                ? dayjs(row[col.key], "DD/MM/YYYY").format("YYYY-MM-DD")
                                                                : ""
                                                        }
                                                        onChange={(e) => {
                                                            const newDate = dayjs(e.target.value).format("DD/MM/YYYY"); // 👈 แปลงกลับ
                                                            handleCellChange(newDate, rowIdx, col.key);
                                                        }}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            padding: "4px",
                                                            border: "none",
                                                            outline: isCellSelected(rowIdx, colIdx)
                                                                ? `1px solid ${theme.palette.primary.dark}`
                                                                : "none",
                                                            backgroundColor: getCellBackgroundColor(row[col.key], col),
                                                            textAlign: "center",
                                                            fontFamily: theme.typography.fontFamily,
                                                        }}
                                                    />
                                                )
                                                    : col.type === "time" ? (
                                                        <input
                                                            type="time"
                                                            value={row[col.key] || ""}
                                                            onChange={(e) => handleCellChange(e.target.value, rowIdx, col.key)}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                padding: "4px",
                                                                border: "none",
                                                                outline: isCellSelected(rowIdx, colIdx)
                                                                    ? `1px solid ${theme.palette.primary.dark}`
                                                                    : "none",
                                                                backgroundColor: getCellBackgroundColor(row[col.key], col),
                                                                textAlign: "center",
                                                                fontFamily: theme.typography.fontFamily,
                                                            }}
                                                        />
                                                    )
                                                        : (
                                                            <div
                                                                contentEditable
                                                                suppressContentEditableWarning
                                                                dir="ltr"
                                                                onBlur={(e) => {
                                                                    let newValue = e.currentTarget.innerText;
                                                                    if (col?.type === "number") {
                                                                        const filtered = newValue.replace(/[^\d.-]/g, "");
                                                                        if (filtered !== newValue) {
                                                                            e.currentTarget.innerText = filtered;
                                                                            newValue = filtered;
                                                                        }
                                                                    }
                                                                    handleCellChange(newValue, rowIdx, col.key);
                                                                }}
                                                                style={{
                                                                    outline: isCellSelected(rowIdx, colIdx)
                                                                        ? `1px solid ${theme.palette.primary.dark}`
                                                                        : "none",
                                                                    backgroundColor: getCellBackgroundColor(row[col.key], col),
                                                                    direction: "ltr",
                                                                    unicodeBidi: "normal",
                                                                    whiteSpace: "pre-wrap",
                                                                    fontFamily: theme.typography.fontFamily
                                                                }}
                                                            >
                                                                {row[col.key] ?? ""}
                                                            </div>

                                                        )}
                                        </TableCell>

                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleCloseContextMenu}>
                    <MenuItem
                        onClick={() => {
                            handleCopy();
                            handleCloseContextMenu();
                        }}
                    >
                        📋 คัดลอก
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handlePaste();
                            handleCloseContextMenu();
                        }}
                    >
                        📥 วาง
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            addRow();
                            handleCloseContextMenu();
                        }}
                    >
                        ➕ เพิ่มแถว
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            deleteRow();
                            handleCloseContextMenu();
                        }}
                    >
                        🗑 ลบแถว
                    </MenuItem>
                </Menu>
                <Box>
                    <Tooltip title="เพิ่มแถว" placement="right">
                        <IconButton variant="contained" color="info" onClick={addRow}>
                            <AddCircleOutlineIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="ลบแถวที่เลือก" placement="right">
                        <IconButton variant="contained" color="error" onClick={deleteRow}>
                            <RemoveCircleOutlineIcon />
                        </IconButton>
                    </Tooltip>
                    {/* <Button onClick={addRow} variant="contained">
                        ➕ เพิ่มแถว
                    </Button>
                    <Button onClick={deleteRow} variant="outlined" color="error">
                        🗑 ลบแถวที่เลือก
                    </Button> */}
                </Box>
            </Stack>
        </>
    );
}
