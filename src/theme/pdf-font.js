import { createTheme } from "@mui/material";
import '@fontsource/sarabun';

const pdfFont = createTheme({
    typography: {
        fontFamily: 'Sarabun, sans-serif',
        fontWeight: 'Bold',
        fontStyle: 'normal',
    },
});

export default pdfFont;