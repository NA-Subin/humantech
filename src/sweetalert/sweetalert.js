import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Logo from '../img/LogoShort.png';
import '../App.css';
import theme from '../theme/theme';

const MySwal = withReactContent(Swal);

export function ShowError(title, text) {
    MySwal.fire({
        icon: "error",
        title: title,
        html: <div style={{ marginBottom: 2 }}>{text}</div>,
        confirmButtonColor: '#FF9843',
        confirmButtonText: "ตกลง"
    });
}

export function ShowWarning(title, text) {
    MySwal.fire({
        icon: "warning",
        title: title,
        html: <div style={{ marginBottom: 2 }}>{text}</div>,
        confirmButtonColor: '#ffc400',
        confirmButtonText: "ตกลง"
    });
}

export function ShowSuccess(title, text) {
    MySwal.fire({
        icon: "success",
        title: title,
        html: <div style={{ marginBottom: 2 }}>{text}</div>,
        confirmButtonColor: '#ffc400',
        confirmButtonText: "ตกลง"
    });
}

export function ShowAccessLogin(title, text, duration = 2000) {
    MySwal.fire({
        imageUrl: Logo,                  // ✅ ใช้รูปแทน icon
        imageHeight: 130,
        title: `<span style="color: ${theme.palette.primary.main}; margin-top: -15px; display: block;">${title}</span>`,
        html: `
            <br/>
            <div style="margin-bottom: 10px; font-size: 16px; color: #333;">
                ${text}
            </div>
            <br/>
        `,
        showConfirmButton: false,
        timer: duration,
        timerProgressBar: true,
        allowOutsideClick: false,
        customClass: {
            popup: "custom-swal-popup",
            image: "custom-swal-image",   // 👈 สำหรับจัดตำแหน่งโลโก้
            title: "custom-swal-title",   // 👈 สำหรับจัดระยะห่าง title
        },
    });
}


export function ShowConfirm(title, text, onConfirm, onCancel) {
    const isLogout = title === "ออกจากระบบ";

    MySwal.fire({
        imageUrl: Logo,
        imageHeight: 130,
        title: title,
        html: `
            <div style="margin-bottom: 10px; font-size: 16px; color: #333;">
                ${text}
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;" />
        `,
        showCancelButton: true,
        confirmButtonColor: theme.palette.success.main,
        cancelButtonColor: theme.palette.error.main,
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true, // 👈 เพิ่มบรรทัดนี้
        customClass: {
            popup: "custom-swal-popup",
            image: "custom-swal-image",
            title: "custom-swal-title",
            confirmButton: "custom-confirm-button",
            cancelButton: "custom-cancel-button",
        },
        backdrop: true,
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            if (onConfirm) onConfirm();
        } else if (result.dismiss === MySwal.DismissReason.cancel) {
            if (onCancel) onCancel();
        }
    });
}

// export function ShowSuccess(title, item) {
//     MySwal.fire({
//         icon: "success",
//         title: title,
//         showConfirmButton: false,
//         timer: 1500
//     }).then(() => {
//         item
//     });
// }