import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// ✅ ติดตั้ง plugin
dayjs.extend(buddhistEra);
dayjs.locale("th");

export class AdapterDayjsBuddhist extends AdapterDayjs {
  formatTokenMap = {
    ...super.formatTokenMap,
    BBBB: 'BBBB', // Buddhist year
  };

  formatByString(date, formatString) {
    return dayjs(date).locale("th").format(formatString);
  }

  getYear(date) {
    return Number(dayjs(date).locale("th").format("BBBB")); // พ.ศ.
  }

  setYear(date, year) {
    return dayjs(date).year(year - 543); // แปลง พ.ศ. → ค.ศ.
  }
}

function parseThaiDate(dateInput) {
  if (!dateInput) return null;

  // ✅ ถ้าเป็น dayjs object
  if (dayjs.isDayjs(dateInput)) return dateInput.isValid() ? dateInput : null;

  // ✅ ถ้าเป็น object เช่น { day: 1, month: 9, year: "2568" }
  if (typeof dateInput === "object" && dateInput.day && dateInput.month && dateInput.year) {
    const yearAD = parseInt(dateInput.year, 10) - 543;
    const day = String(dateInput.day).padStart(2, "0");
    const month = String(dateInput.month).padStart(2, "0");
    return dayjs(`${day}/${month}/${yearAD}`, "DD/MM/YYYY");
  }

  // ✅ ถ้าเป็น string (ลองหลาย format)
  const formats = ["DD/MM/YYYY", "D/M/YYYY", "YYYY-MM-DD", "DD-MM-YYYY", "YYYY/MM/DD"];
  const parsed = dayjs(dateInput, formats, true);
  return parsed.isValid() ? parsed : null;
}

// ✅ รูปแบบเต็ม เช่น: 8 กรกฎาคม พ.ศ.2568
export function formatThaiFull(dateInput) {
  const date = parseThaiDate(dateInput);
  return date ? date.locale("th").format("D MMMM BBBB") : "";
}

// ✅ รูปแบบย่อ เช่น: 8 ก.ค. พ.ศ.2568
export function formatThaiShort(dateInput) {
  const date = parseThaiDate(dateInput);
  return date ? date.locale("th").format("D MMM BBBB") : "";
}

// ✅ แสดงเฉพาะเดือนและปี เช่น: กรกฎาคม พ.ศ.2568
export function formatThaiMonth(dateInput) {
  const date = parseThaiDate(dateInput);
  return date ? date.locale("th").format("MMMM BBBB") : "";
}

export function formatThaiSlash(dateInput) {
  const date = parseThaiDate(dateInput);
  return date ? date.locale("th").format("DD/MM/BBBB") : "";
}

// ✅ รูปแบบตัวเลข เช่น: 08/07/2568
// export function formatThaiSlash(dateInput) {
//   if (!dateInput) return "";

//   // 🔹 กรณีเป็น dayjs object
//   if (dayjs.isDayjs(dateInput)) {
//     return dateInput.isValid()
//       ? dateInput.locale("th").format("DD/MM/BBBB")
//       : "";
//   }

//   // 🔹 กรณีเป็น object เช่น { day: 1, month: 9, year: "2568" }
//   if (typeof dateInput === "object" && dateInput.day && dateInput.month && dateInput.year) {
//     const yearAD = parseInt(dateInput.year, 10) - 543; // แปลง พ.ศ. → ค.ศ.
//     const day = String(dateInput.day).padStart(2, "0");
//     const month = String(dateInput.month).padStart(2, "0");
//     const dateStr = `${day}/${month}/${yearAD}`;
//     return dayjs(dateStr, "DD/MM/YYYY").locale("th").format("DD/MM/BBBB");
//   }

//   // 🔹 กรณีเป็น string (รองรับหลาย format)
//   const formats = ["DD/MM/YYYY", "D/M/YYYY", "YYYY-MM-DD", "DD-MM-YYYY", "YYYY/MM/DD"];
//   const parsed = dayjs(dateInput, formats, true);

//   return parsed.isValid()
//     ? parsed.locale("th").format("DD/MM/BBBB")
//     : "";
// }
