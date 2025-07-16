import { createTheme } from "@mui/material";
import '@fontsource/noto-sans-thai';

const theme = createTheme({
    typography: {
        fontFamily: '"Sarabun", sans-serif',
        fontWeight: 900,
        fontStyle: "normal",
    },
    palette: {
        primary: {
            main: '#26a69a',
            light: '#e0f2f1',
            dark: '#004d40',
            contrastText: '#fff',
        },
        secondary: {
            main: '#fff',
            light: '#e0f2f1',
            dark: '#26a69a',
            contrastText: '#004d40',
        },
    },
});

export default theme;