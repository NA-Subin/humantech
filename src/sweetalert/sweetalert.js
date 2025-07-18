import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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

export function ShowConfirm(title, text, onConfirm, onCancel) {
    MySwal.fire({
        icon: "question",
        title: title,
        html: <div style={{ marginBottom: 2 }}>{text}</div>,
        showCancelButton: true,
        confirmButtonColor: "#43a047", // เขียว
        cancelButtonColor: "#e53935", // แดง
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
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