// ThaiDateSelector.js
import React, { useState, useEffect, useMemo } from "react";
import { Grid, TextField, MenuItem, Typography } from "@mui/material";
import dayjs from "dayjs";

const monthNames = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export default function ThaiDateSelector({ label = "", value, onChange, disabled }) {
  const [selectedDay, setSelectedDay] = useState(value?.day || "");
  const [selectedMonth, setSelectedMonth] = useState(value?.month || "");
  const [selectedYear, setSelectedYear] = useState(value?.year || "2568");

  const getDaysInMonth = (month, year) => {
    if (!month || !year) return 31;
    const engYear = parseInt(year) - 543;
    return dayjs(`${engYear}-${month}-01`).daysInMonth();
  };

  const daysInMonth = useMemo(
    () => getDaysInMonth(selectedMonth, selectedYear),
    [selectedMonth, selectedYear]
  );

  // ส่งค่ากลับทุกครั้งที่เปลี่ยน
  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      onChange?.({ day: selectedDay, month: selectedMonth, year: selectedYear });
    } else {
      onChange?.(null);
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    if (selectedDay > getDaysInMonth(newMonth, selectedYear)) {
      setSelectedDay("");
    }
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    if (selectedDay > getDaysInMonth(selectedMonth, newYear)) {
      setSelectedDay("");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item size={4}>
        <Typography variant="subtitle2" fontWeight="bold">{label}</Typography>
        <TextField
          select
          fullWidth
          size="small"
          placeholder="เลือกวันที่"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
          disabled={disabled}
        >
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item size={4}>
        <Typography variant="subtitle2" fontWeight="bold">เดือน</Typography>
        <TextField
          select
          fullWidth
          size="small"
          placeholder="เลือกเดือน"
          value={selectedMonth}
          onChange={handleMonthChange}
          SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 150 } } } }}
          disabled={disabled}
        >
          {monthNames.map((month, index) => (
            <MenuItem key={index + 1} value={index + 1}>
              {month}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item size={4}>
        <Typography variant="subtitle2" fontWeight="bold">ปี (พ.ศ.)</Typography>
        <TextField
          fullWidth
          type="number"
          size="small"
          value={selectedYear}
          onChange={handleYearChange}
          placeholder="เช่น 2568"
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
}
