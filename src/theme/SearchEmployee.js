import React, { useEffect, useMemo } from "react";
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
  disabled = false, // ✅ เพิ่ม prop disabled
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
        disabled={disabled} // ✅ เชื่อมกับ TextField
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
  // Reset cascading selects
  useEffect(() => {
    if (section !== "all-ทั้งหมด") setSection("all-ทั้งหมด");
    if (position !== "all-ทั้งหมด") setPosition("all-ทั้งหมด");
    if (employee !== "all-ทั้งหมด") setEmployee("all-ทั้งหมด");
  }, [department]);

  useEffect(() => {
    if (position !== "all-ทั้งหมด") setPosition("all-ทั้งหมด");
    if (employee !== "all-ทั้งหมด") setEmployee("all-ทั้งหมด");
  }, [section]);

  useEffect(() => {
    if (employee !== "all-ทั้งหมด") setEmployee("all-ทั้งหมด");
  }, [position]);

  const departmentsWithAll = useMemo(() => {
    return [{ ID: "all", deptname: "ทั้งหมด" }, ...departments];
  }, [departments]);

  // Add "ทั้งหมด" dynamically
  const sectionsWithAll = useMemo(() => {
    if (!department) return sections;
    return [{ ID: "all", sectionname: "ทั้งหมด", keyposition: department }, ...sections];
  }, [sections, department]);

  const positionsWithAll = useMemo(() => {
    if (!section) return positions;
    return [{ ID: "all", positionname: "ทั้งหมด", deptid: department, sectionid: section }, ...positions];
  }, [positions, department, section]);

  const employeesWithAll = useMemo(() => {
    if (!position) return employees;
    return [
      {
        employeeid: "all",
        employname: "ทั้งหมด",
        position,
        department,
        section,
      },
      ...employees,
    ];
  }, [employees, position, department, section]);

  return (
    <Grid container spacing={2} sx={{ marginBottom: 2 }}>
      {/* ฝ่ายงาน */}
      <SelectField
        label="เลือกฝ่ายงาน"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        options={departmentsWithAll}
        getOptionValue={(row) => `${row.ID}-${row.deptname}`}
        getOptionLabel={(row) => row.deptname}
      />

      {/* ส่วนงาน: ซ่อนถ้าเลือก "ทั้งหมด" ในฝ่ายงาน */}
      <SelectField
        label="เลือกส่วนงาน"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        options={sectionsWithAll}
        filterFn={(row) => row.deptid === department || row.ID === "all"}
        getOptionValue={(row) => `${row.ID}-${row.sectionname}`}
        getOptionLabel={(row) => row.sectionname}
        showEmptyWhenNoMatch={department !== ""}
        emptyOptionLabel="ไม่มีส่วนงาน"
        disabled={department === "all-ทั้งหมด"} // ✅ disable ถ้าเลือกทั้งหมดในฝ่ายงาน
      />

      {/* ตำแหน่ง: ซ่อนถ้าเลือก "ทั้งหมด" ในฝ่ายงาน หรือเลือก "ทั้งหมด" ในส่วนงาน */}
      <SelectField
        label="เลือกตำแหน่ง"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        options={positionsWithAll}
        filterFn={(row) =>
          row.ID === "all" ||
          (row.deptid === department &&
            (row.sectionid === section || row.sectionid === "0-ไม่มี"))
        }
        getOptionValue={(row) => `${row.ID}-${row.positionname}`}
        getOptionLabel={(row) => row.positionname}
        disabled={section === "all-ทั้งหมด"} // ✅ disable ถ้าเลือกทั้งหมดในฝ่ายงาน
      />

      {/* พนักงาน: ซ่อนถ้าเลือก "ทั้งหมด" ในฝ่ายงาน หรือ "ทั้งหมด" ในส่วนงาน หรือ "ทั้งหมด" ในตำแหน่ง */}
      <SelectField
        label="เลือกพนักงาน"
        value={employee}
        onChange={(e) => setEmployee(e.target.value)}
        options={employeesWithAll}
        filterFn={(row) =>
          row.employeeid === "all" ||
          (row.position === position &&
            row.department === department &&
            (row.section === section || row.section === "0-ไม่มี"))
        }
        getOptionValue={(row) => `${row.employeeid}-${row.employname}`}
        getOptionLabel={(row) => row.employname}
        disabled={position === "all-ทั้งหมด"} // ✅ disable ถ้าเลือกทั้งหมดในฝ่ายงาน
      />
    </Grid>
  );
}
