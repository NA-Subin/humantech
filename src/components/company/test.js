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
} from "@mui/material";
import theme from "../../theme/theme";
import { TablecellHeader } from "../../theme/style";

export default function MuiExcelLikeTable({
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

    // เช็คเซลล์ที่เลือก
    const isCellSelected = (r, c) =>
        selectedCells.some(([row, col]) => row === r && col === c);

    // เปลี่ยนค่าใน cell
    const handleCellChange = (val, rowIdx, colKey) => {
        const newData = [...data];
        if (!newData[rowIdx]) newData[rowIdx] = {};
        newData[rowIdx] = { ...newData[rowIdx], [colKey]: val };
        setData(newData);
        onDataChange(newData);
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
        const rowsFromClipboard = clipboard.split(/\r?\n/).map((line) => line.split("\t"));

        const newData = [...data];
        const [startRow, startCol] = selectedCells[0] || [0, 0];

        rowsFromClipboard.forEach((row, i) => {
            const targetRow = startRow + i;
            if (!newData[targetRow]) {
                newData[targetRow] = columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
            }
            row.forEach((val, j) => {
                const targetCol = startCol + j;
                if (targetCol < columns.length) {
                    newData[targetRow] = { ...newData[targetRow], [columns[targetCol].key]: val };
                }
            });
        });

        setData(newData);
        onDataChange(newData);
    };

    // เพิ่มแถวใหม่ (object ว่างตาม columns)
    const addRow = () => {
        const newRow = columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
        setData([...data, newRow]);
    };

    // ลบแถวที่เลือก
    const deleteRow = () => {
        if (selectedCells.length === 0) return;
        const rowsToDelete = [...new Set(selectedCells.map(([r]) => r))];
        const newData = data.filter((_, idx) => !rowsToDelete.includes(idx));
        setData(newData.length > 0 ? newData : [columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {})]);
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
        if (e.ctrlKey && e.key === "c") {
            e.preventDefault();
            handleCopy();
        } else if (e.ctrlKey && e.key === "v") {
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
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button onClick={addRow} variant="contained">
                    ➕ เพิ่มแถว
                </Button>
                <Button onClick={deleteRow} variant="outlined" color="error">
                    🗑 ลบแถวที่เลือก
                </Button>
            </Stack>

            <TableContainer component={Paper} ref={tableRef}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                            <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                            {columns.map((col, idx) => (
                                <TablecellHeader key={idx}>{col.label}</TablecellHeader>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((row, rowIdx) => (
                            <TableRow key={rowIdx}>
                                <TableCell>{rowIdx + 1}</TableCell>
                                {columns.map((col, colIdx) => (
                                    <TableCell
                                        key={colIdx}
                                        onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                                        onMouseOver={() => handleMouseOver(rowIdx, colIdx)}
                                        onContextMenu={(e) => openContextMenu(e, rowIdx, colIdx)}
                                        style={{
                                            backgroundColor: isCellSelected(rowIdx, colIdx)
                                                ? theme.palette.primary.light
                                                : undefined,
                                        }}
                                    >
                                        <div
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={(e) =>
                                                handleCellChange(e.currentTarget.textContent, rowIdx, col.key)
                                            }
                                            style={{
                                                outline: isCellSelected(rowIdx, colIdx) ? `1px solid ${theme.palette.primary.dark}`  : "none",
                                                direction: "ltr",           // ตั้งทิศทางซ้ายไปขวา
                                                unicodeBidi: "plaintext",   // ทำให้แสดงผลข้อความตามลำดับที่พิมพ์
                                            }}
                                        >
                                            {row[col.key] ?? ""}
                                        </div>
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
        </>
    );
}
