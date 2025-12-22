// ThaiAddressSelector.js
import { Grid, TextField, MenuItem, Typography, Paper } from "@mui/material";
import { useMemo, useState, useEffect, useRef } from "react";

export default function ThaiAddressSelector({
  thailand = [],
  value = {},
  onChange,
  disabled
}) {
  const [province, setProvince] = useState("");
  const [amphure, setAmphure] = useState("");
  const [tambon, setTambon] = useState("");

  const isSyncingRef = useRef(false);

  // 🔹 sync จาก parent → child
  useEffect(() => {
    if (!value) return;

    isSyncingRef.current = true;

    setProvince(value.province || "");
    setAmphure(value.amphure || "");
    setTambon(value.tambon || "");

    // ปล่อย flag หลัง render รอบนี้
    Promise.resolve().then(() => {
      isSyncingRef.current = false;
    });
  }, [value]);

  const provinceId = Number(province.split("-")[0]);
  const amphureId = Number(amphure.split("-")[0]);
  const tambonId = Number(tambon.split("-")[0]);

  const amphureList = useMemo(() => {
    const prov = thailand.find(p => p.id === provinceId);
    return prov?.amphure || [];
  }, [provinceId, thailand]);

  const tambonList = useMemo(() => {
    const amp = amphureList.find(a => a.id === amphureId);
    return amp?.tambon || [];
  }, [amphureId, amphureList]);

  const zipCode = useMemo(() => {
    const tb = tambonList.find(t => t.id === tambonId);
    return tb?.zip_code || "";
  }, [tambonId, tambonList]);

  // 🔹 ส่งค่าออก เฉพาะตอน user เปลี่ยน
  useEffect(() => {
    if (isSyncingRef.current) return;

    onChange?.({ province, amphure, tambon, zipCode });
  }, [province, amphure, tambon, zipCode]);

  return (
    <Grid container spacing={2}>
      {/* {label && (
        <Grid item size={12}>
          <Typography variant="subtitle2" fontWeight="bold">
            {label}
          </Typography>
        </Grid>
      )} */}
      <Grid item size={6}>
        <Typography variant="subtitle2" fontWeight="bold">จังหวัด</Typography>
        <Paper sx={{ width: "100%" }}>
          <TextField
            select fullWidth size="small"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setAmphure(""); // reset
              setTambon("");
            }}
            SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
            disabled={disabled}
          >
            {thailand
              .sort((a, b) => a.name_th.localeCompare(b.name_th, 'th')) // เรียงตามภาษาไทย
              .map(row => (
                <MenuItem key={row.id} value={`${row.id}-${row.name_th}`}>
                  {row.name_th}
                </MenuItem>
              ))}
          </TextField>
        </Paper>
      </Grid>

      <Grid item size={6}>
        <Typography variant="subtitle2" fontWeight="bold">อำเภอ</Typography>
        <Paper sx={{ width: "100%" }}>
          <TextField
            select fullWidth size="small"
            value={amphure}
            onChange={(e) => {
              setAmphure(e.target.value);
              setTambon("");
            }}
            SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
            disabled={disabled}
          >
            {amphureList
              .sort((a, b) => a.name_th.localeCompare(b.name_th, 'th')) // เรียงตามภาษาไทย
              .map(amp => (
                <MenuItem key={amp.id} value={`${amp.id}-${amp.name_th}`}>
                  {amp.name_th}
                </MenuItem>
              ))}
          </TextField>
        </Paper>
      </Grid>

      <Grid item size={6}>
        <Typography variant="subtitle2" fontWeight="bold">ตำบล</Typography>
        <Paper sx={{ width: "100%" }}>
          <TextField
            select fullWidth size="small"
            value={tambon}
            onChange={(e) => setTambon(e.target.value)}
            SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
            disabled={disabled}
          >
            {tambonList
              .sort((a, b) => a.name_th.localeCompare(b.name_th, 'th')) // เรียงตามภาษาไทย
              .map(tb => (
                <MenuItem key={tb.id} value={`${tb.id}-${tb.name_th}`}>
                  {tb.name_th}
                </MenuItem>
              ))}
          </TextField>
        </Paper>
      </Grid>

      <Grid item size={6}>
        <Typography variant="subtitle2" fontWeight="bold">รหัสไปรษณีย์</Typography>
        <Paper sx={{ width: "100%" }}>
          <TextField fullWidth size="small" value={zipCode} disabled />
        </Paper>
      </Grid>
    </Grid>
  );
}

