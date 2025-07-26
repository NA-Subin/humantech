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
    Checkbox,
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import theme from "../theme/theme";
import { TablecellHeader } from "../theme/style";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function TableExcel({
    styles = {},
    stylesTable = {},
    columns = [], // [{ label, key }]
    initialData = [], // [{...}, {...}]
    onDataChange = () => { },
}) {
    const [data, setData] = useState(initialData);
    const [history, setHistory] = useState([]); // 👉 เพิ่มอันนี้
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

    const hidden = columns.some(col => col.disabled === true);

    // เปลี่ยนค่าใน cell
    // const handleCellChange = (val, rowIdx, colKey) => {
    //     setData((prevData) => {
    //         const newData = [...prevData];
    //         if (!newData[rowIdx]) newData[rowIdx] = {};
    //         newData[rowIdx] = { ...newData[rowIdx], [colKey]: val };
    //         onDataChange(newData);
    //         return newData;
    //     });
    // };
    const handleCellChange = (val, rowIdx, colKey) => {
        const column = columns.find((col) => col.key === colKey);
        if (column?.disabled) return;

        setData((prevData) => {
            pushToHistory(prevData); // ✅ ก่อนเปลี่ยน
            const newData = [...prevData];
            if (!newData[rowIdx]) newData[rowIdx] = {};
            newData[rowIdx] = { ...newData[rowIdx], [colKey]: val };
            onDataChange(newData);
            return newData;
        });
    };


    // คัดลอกข้อมูลเซลล์ที่เลือกเป็น text แบบ tab-delimited
    // const handleCopy = async () => {
    //     const rows = [...new Set(selectedCells.map(([r]) => r))].sort();
    //     const cols = [...new Set(selectedCells.map(([, c]) => c))].sort();

    //     const text = rows
    //         .map((r) => cols.map((c) => data[r]?.[columns[c].key] ?? "").join("\t"))
    //         .join("\n");

    //     await navigator.clipboard.writeText(text);
    // };
    const handleCopy = async () => {
        const rows = [...new Set(selectedCells.map(([r]) => r))].sort();

        // กรองเฉพาะ column ที่ไม่ disabled และเรียงตาม columns จริง
        const activeColumns = columns.filter(col => !col.disabled);

        const text = rows
            .map(r =>
                activeColumns
                    .map(col => data[r]?.[col.key] ?? "")
                    .join("\t")
            )
            .join("\n");

        await navigator.clipboard.writeText(text);
    };


    // วางข้อมูลจาก clipboard ลงในตาราง
    // const handlePaste = async () => {
    //     const clipboard = await navigator.clipboard.readText();

    //     const rowsFromClipboard = clipboard
    //         .split(/\r?\n/)
    //         .filter(line => line.trim() !== "")
    //         .map((line) => line.split("\t"));

    //     const newData = [...data];
    //     const [startRow, startCol] = selectedCells[0] || [0, 0];

    //     rowsFromClipboard.forEach((row, i) => {
    //         const targetRow = startRow + i;

    //         if (!newData[targetRow]) {
    //             newData[targetRow] = columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
    //         }

    //         row.forEach((val, j) => {
    //             const targetCol = startCol + j;
    //             const colDef = columns[targetCol];
    //             if (colDef) {
    //                 let parsedVal = val.trim();
    //                 if (colDef.type === "select" && Array.isArray(colDef.options)) {
    //                     const matched = colDef.options.find(
    //                         opt => opt.value === parsedVal || opt.label === parsedVal
    //                     );
    //                     parsedVal = matched?.value || ""; // ถ้าไม่ match → ให้ค่าว่างเพื่อไม่ขึ้น error
    //                 }
    //                 newData[targetRow] = {
    //                     ...newData[targetRow],
    //                     [colDef.key]: parsedVal,
    //                 };
    //             }
    //         });
    //     });

    //     // อัปเดต ID ใหม่ให้ทุกแถว
    //     const updatedData = newData.map((row, idx) => ({
    //         ...row,
    //         ID: idx,
    //     }));

    //     setData(updatedData);
    //     onDataChange(updatedData);
    // };
    const handlePaste = async () => {
        const clipboard = await navigator.clipboard.readText();

        const rowsFromClipboard = clipboard
            .split(/\r?\n/)
            .filter(line => line.trim() !== "")
            .map(line => line.split("\t"));

        const newData = [...data];

        const columnOrder = columns.filter(col => !col.disabled).map(col => col.key); // ✅ column ที่ใช้จริง

        const startRow = selectedCells.length > 0
            ? Math.min(...selectedCells.map(([r]) => r))
            : 0;

        rowsFromClipboard.forEach((clipboardRow, rowIndex) => {
            const targetRow = startRow + rowIndex;

            // สร้างแถวใหม่ถ้าเกิน data เดิม
            if (targetRow >= newData.length) {
                if (hidden) return; // ถ้า hidden ห้ามเพิ่ม
                newData[targetRow] = columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
            }

            clipboardRow.forEach((val, colIndex) => {
                const colKey = columnOrder[colIndex];
                const colDef = columns.find(col => col.key === colKey);

                if (!colDef || colDef.disabled) return;

                let parsedVal = val.trim();

                if (colDef.type === "select" && Array.isArray(colDef.options)) {
                    const matched = colDef.options.find(
                        opt => opt.value === parsedVal || opt.label === parsedVal
                    );
                    parsedVal = matched?.value || "";
                }

                newData[targetRow] = {
                    ...newData[targetRow],
                    [colKey]: parsedVal,
                };
            });
        });

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
    // const openContextMenu = (event, row, col) => {
    //     event.preventDefault();
    //     setAnchorEl(event.currentTarget);
    //     setSelectedCells([[row, col]]);
    // };
    const openContextMenu = (event, row, col) => {
        const colDef = columns[col];
        if (colDef?.disabled) return; // ❌ ไม่เปิด context menu ถ้าห้ามแก้

        event.preventDefault();
        setAnchorEl(event.currentTarget);
        setSelectedCells([[row, col]]);
    };

    const handleUndo = () => {
        setHistory(prevHistory => {
            if (prevHistory.length === 0) return prevHistory;
            const prevData = prevHistory[prevHistory.length - 1];
            setData(prevData);
            onDataChange(prevData);
            return prevHistory.slice(0, -1);
        });
    };


    // ปิด context menu
    const handleCloseContextMenu = () => {
        setAnchorEl(null);
    };

    const moveSelection = (direction) => {
        setSelectedCells((prevSelected) => {
            if (!prevSelected || prevSelected.length === 0) return prevSelected;
            const [rowIdx, colIdx] = prevSelected[0];

            let newRow = rowIdx;
            let newCol = colIdx;

            if (direction === "down") newRow++;
            if (direction === "up") newRow--;
            if (direction === "left") newCol--;
            if (direction === "right") newCol++;

            // ตรวจสอบว่า index ใหม่อยู่ในขอบเขตของตาราง
            if (newRow < 0 || newCol < 0 || newRow >= data.length || newCol >= columns.length) {
                return prevSelected;
            }

            return [[newRow, newCol]];
        });
    };

    const clearSelectedCells = () => {
        pushToHistory(data); // ✅ ก่อนเปลี่ยน
        const newData = [...data];

        selectedCells.forEach(([rowIdx, colIdx]) => {
            const col = columns[colIdx];
            if (!col || col.disabled) return;

            if (!newData[rowIdx]) {
                newData[rowIdx] = columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
            }

            newData[rowIdx][col.key] = "";
        });

        setData(newData);
        onDataChange(newData);
    };


    const pushToHistory = (prevData) => {
        setHistory(prev => [...prev, JSON.parse(JSON.stringify(prevData))]);
    };

    // ดักจับ Ctrl+C, Ctrl+V
    const handleKeyDown = (e) => {
        const key = e.key.toLowerCase();

        const isCopy = e.ctrlKey && (key === "c" || key === "แ");
        const isPaste = e.ctrlKey && (key === "v" || key === "อ");
        const isUndo = e.ctrlKey && (key === "z" || key === "ผ");

        if (isCopy) {
            e.preventDefault();
            handleCopy();
        } else if (isPaste) {
            e.preventDefault();
            handlePaste();
        } else if (isUndo) {
            e.preventDefault();
            handleUndo(); // ✅ เรียก Undo
        } else if (key === "arrowdown") {
            e.preventDefault();
            moveSelection("down");
        } else if (key === "arrowup") {
            e.preventDefault();
            moveSelection("up");
        } else if (key === "arrowleft") {
            e.preventDefault();
            moveSelection("left");
        } else if (key === "arrowright") {
            e.preventDefault();
            moveSelection("right");
        } else if (key === "delete" || key === "backspace") {
            e.preventDefault();
            clearSelectedCells();
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
                <TableContainer component={Paper} ref={tableRef} sx={styles}>
                    <Table size="small" sx={stylesTable} >
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                {columns.map((col, idx) => (
                                    <TablecellHeader key={idx} sx={{ width: col.width ?? "auto" }} >{col.label}</TablecellHeader>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    <TableCell sx={{ textAlign: "center", backgroundColor: theme.palette.primary.dark, color: "white" }}>{rowIdx + 1}</TableCell>
                                    {columns.map((col, colIdx) => (
                                        <TableCell
                                            key={colIdx}
                                            onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                                            onMouseOver={() => handleMouseOver(rowIdx, colIdx)}
                                            onContextMenu={(e) => openContextMenu(e, rowIdx, colIdx)}
                                            style={{
                                                backgroundColor: col.disabled === true ?
                                                    "#e9e9e9ff"
                                                    :
                                                    (isCellSelected(rowIdx, colIdx)
                                                        ? theme.palette.primary.light
                                                        : getCellBackgroundColor(data[rowIdx]?.[col.key], col))
                                                ,
                                                textAlign: "center"
                                            }}
                                        >
                                            {(col.type === "select" || col.type === "dependent-select") ? (
                                                <>
                                                    <select
                                                        disabled={col.disabled}
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
                                                                        : <option value="0-ไม่มี">ไม่มี</option> // 👈 กรณีไม่พบ option ที่สัมพันธ์
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
                                                :

                                                col.type === "checkbox" ? (
                                                    <Checkbox
                                                        disabled={col.disabled}
                                                        checked={row[col.key] === 1}
                                                        onChange={(e) => handleCellChange(e.target.checked ? 1 : 0, rowIdx, col.key)}
                                                        color="primary" // ใช้สีตาม theme.palette.primary.main
                                                        sx={{ p: 0 }} // optional: ลด padding ถ้าต้องการให้พอดี cell
                                                    />
                                                )
                                                    : col.type === "date" ? (
                                                        <Box sx={{ py: 0, my: "-4px", mt: -2, mb: -3 }}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker
                                                                    value={row[col.key] ? dayjs(row[col.key], "DD/MM/YYYY") : null}
                                                                    onChange={(newValue) => {
                                                                        const newDate = newValue ? newValue.format("DD/MM/YYYY") : "";
                                                                        handleCellChange(newDate, rowIdx, col.key);
                                                                    }}
                                                                    format="DD/MM/YYYY"
                                                                    slotProps={{
                                                                        textField: {
                                                                            size: "small",
                                                                            variant: "standard",
                                                                            disabled: col.disabled,
                                                                            inputProps: {
                                                                                style: {
                                                                                    padding: 0,
                                                                                    height: "24px",
                                                                                    fontSize: "9px",
                                                                                    lineHeight: 1,
                                                                                    textAlign: "center",
                                                                                    boxSizing: "border-box",
                                                                                }
                                                                            },
                                                                            sx: {
                                                                                width: "100%",
                                                                                height: "24px",
                                                                                padding: 0,
                                                                                margin: 0,
                                                                                border: "none",
                                                                                outline: isCellSelected(rowIdx, colIdx)
                                                                                    ? `1px solid ${theme.palette.primary.dark}`
                                                                                    : "none",
                                                                                backgroundColor: getCellBackgroundColor(row[col.key], col),
                                                                                textAlign: "center",
                                                                                fontSize: "9px",
                                                                                lineHeight: 1,
                                                                                // input base
                                                                                "& .MuiInputBase-input": {
                                                                                    height: "24px !important",
                                                                                    padding: 0,
                                                                                    fontSize: "9px !important",
                                                                                    lineHeight: 1,
                                                                                    textAlign: "center",
                                                                                    boxSizing: "border-box",
                                                                                },
                                                                                // calendar icon
                                                                                "& .MuiSvgIcon-root": {
                                                                                    fontSize: "14px",
                                                                                    margin: 0,
                                                                                    padding: 0,
                                                                                },
                                                                                // input adornment (icon wrapper)
                                                                                "& .MuiInputAdornment-root": {
                                                                                    margin: 0,
                                                                                    padding: 0,
                                                                                },
                                                                            },
                                                                        },
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                        </Box>
                                                    )
                                                        : col.type === "time" ? (
                                                            <input
                                                                disabled={col.disabled}
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
                                                                    contentEditable={!col.disabled}
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
                {
                    !hidden &&
                    (
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
                    )
                }

            </Stack>
        </>
    );
}
