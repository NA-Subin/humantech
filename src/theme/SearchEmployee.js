import React, { useEffect } from "react";
import { Grid, Typography, TextField, MenuItem } from "@mui/material";

// Reusable Select Field
function SelectField({
  label,
  value,
  onChange,
  options = [],
  filterFn = () => true,
  getOptionValue = (row) => row.ID,
  getOptionLabel = (row) => row.name,
  emptyOptionLabel = "ไม่มีข้อมูล",
  showEmptyWhenNoMatch = false,
  maxHeight = 150,
  gridSize = 3,
}) {
  const filtered = options.filter(filterFn);

  return (
    <Grid item size={3} sm={gridSize}>
      <Typography variant="subtitle2" fontWeight="bold">
        {label}
      </Typography>
      <TextField
        select
        fullWidth
        size="small"
        value={value}
        onChange={onChange}
        SelectProps={{
          MenuProps: { PaperProps: { style: { maxHeight } } },
        }}
      >
        {filtered.length === 0 && showEmptyWhenNoMatch && (
          <MenuItem key="0" value="0:ไม่มี">
            {emptyOptionLabel}
          </MenuItem>
        )}

        {filtered.map((row) => (
          <MenuItem key={getOptionValue(row)} value={getOptionValue(row)}>
            {getOptionLabel(row)}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  );
}

export default function SelectEmployeeGroup({
  department,
  setDepartment,
  departments,
  section,
  setSection,
  sections,
  position,
  setPosition,
  positions,
  employee,
  setEmployee,
  employees,
}) {
  // 👉 Logic Reset
  useEffect(() => {
    if (section !== "") setSection("");
    if (position !== "") setPosition("");
    if (employee !== "") setEmployee("");
  }, [department]);

  useEffect(() => {
    if (position !== "") setPosition("");
    if (employee !== "") setEmployee("");
  }, [section]);

  useEffect(() => {
    if (employee !== "") setEmployee("");
  }, [position]);

  return (
    <Grid container spacing={2} sx={{ marginBottom: 2 }}>
      {/* ฝ่ายงาน */}
      <SelectField
        label="เลือกฝ่ายงาน"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        options={departments}
        getOptionValue={(row) => `${row.ID}-${row.deptname}`}
        getOptionLabel={(row) => row.deptname}
      />

      {/* ส่วนงาน */}
      <SelectField
        label="เลือกส่วนงาน"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        options={sections}
        filterFn={(row) => row.keyposition === department}
        getOptionValue={(row) => `${row.ID}-${row.sectionname}`}
        getOptionLabel={(row) => row.sectionname}
        showEmptyWhenNoMatch={department !== ""}
        emptyOptionLabel="ไม่มีส่วนงาน"
      />

      {/* ตำแหน่ง */}
      <SelectField
        label="เลือกตำแหน่ง"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        options={positions}
        filterFn={(row) =>
          row.deptid === department &&
          (row.sectionid === section || row.sectionid === "0-ไม่มี")
        }
        getOptionValue={(row) => `${row.ID}-${row.positionname}`}
        getOptionLabel={(row) => row.positionname}
      />

      {/* พนักงาน */}
      <SelectField
        label="เลือกพนักงาน"
        value={employee}
        onChange={(e) => setEmployee(e.target.value)}
        options={employees}
        filterFn={(row) =>
          row.position === position &&
          row.department === department &&
          (row.section === section || row.section === "0-ไม่มี")
        }
        getOptionValue={(row) => `${row.employeeid}-${row.employname}`}
        getOptionLabel={(row) => row.employname}
      />
    </Grid>
  );
}
