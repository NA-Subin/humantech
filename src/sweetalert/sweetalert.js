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