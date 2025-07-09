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

// ✅ รูปแบบเต็ม เช่น: 8 กรกฎาคม พ.ศ.2568
export function formatThaiFull(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("D MMMM BBBB")
    : "";
}

// ✅ รูปแบบย่อ เช่น: 8 ก.ค. พ.ศ.2568
export function formatThaiShort(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("D MMM BBBB")
    : "";
}

// ✅ รูปแบบตัวเลข เช่น: 08/07/2568
export function formatThaiSlash(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("DD/MM/BBBB")
    : "";
}

export function formatThaiMonth(date) {
  return date && dayjs(date).isValid()
    ? dayjs(date).locale("th").format("MMMM BBBB")
    : "";
}
