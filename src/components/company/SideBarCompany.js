import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { getDatabase, ref, push, onValue, update } from "firebase/database";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MoreIcon from '@mui/icons-material/MoreVert';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import CloseIcon from '@mui/icons-material/Close';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import HailIcon from '@mui/icons-material/Hail';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardReturnRoundedIcon from '@mui/icons-material/KeyboardReturnRounded';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Logo from '../../img/Humantech.png';
import LogoGreen from '../../img/HumantechGreen.png';
import { Button, ButtonGroup, Chip, Collapse, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth, database } from '../../server/firebase';
import { useFirebase } from '../../server/ProjectFirebaseContext';
import { IconButtonError, TablecellHeader, TablecellNoData } from '../../theme/style';
import { ShowError, ShowSuccess } from '../../sweetalert/sweetalert';
import ThaiAddressSelector from '../../theme/ThaiAddressSelector';


const drawerWidth = 260;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.primary.main,
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&::before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
        {...props}
        expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
    />
))(({ theme }) => ({
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    height: 50,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        width: 20,
        height: 20,
        borderRadius: '50%',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

function createCompany(NO, Company, CompanyName) {
    return {
        NO,
        Company,
        CompanyName,
    };
}

const company = [
    createCompany(1, 'NTP1', 'ห้างหุ้นส่วนจำกัด สุขสันต์บริการ2008'),
    createCompany(2, 'NTP2', 'บริษัท ณัฐพล ทรัคส์ แอนด์ ออยล์ จำกัด'),
    createCompany(3, 'NTP3', 'บริษัท เอ็นทีพี.โฮลดิ้ง จำกัด'),
    createCompany(4, 'NTP4', 'บริษัท เอ็นทีพี.พาวเวอร์ เนทเวิร์ค จำกัด'),
    createCompany(5, 'NTP5', 'บริษัท แฮปปี้ ซอฟต์ (ประเทศไทย) จำกัด'),
    createCompany(6, 'NTP6', 'บริษัท พีซีวาย อินเตอร์เทรด แอนด์ ซัพพาย จำกัด'),
    createCompany(7, 'NTP7', 'บริษัท พรสง่า เอ็นเนอร์จี จำกัด'),
];

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function SideBarCompany() {
    const navigate = useNavigate();
    const { firebaseDB, domainKey } = useFirebase();
    //const { domain, companyName } = useParams();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get("domain");
    const companyName = searchParams.get("company");
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const companyId = companyName?.split(":")[0];
    const [openData, setOpenData] = useState(false);
    const [openEmployee, setOpenEmployee] = useState(false);
    const [openAddress, setOpenAddress] = useState({});

    useEffect(() => {
        if (!firebaseDB) return;

        const companiesRef = ref(firebaseDB, "workgroup/company");
        const unsubscribe = onValue(companiesRef, (snapshot) => {
            const data = snapshot.exists() ? snapshot.val() : {};
            const list = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value,
            }));
            setCompanies(list);

            // ค้นหา company ตาม companyId
            const found = list.find((item, index) => String(index) === companyId);
            if (found) {
                setSelectedCompany(found);
            }
        });

        return () => unsubscribe();
    }, [firebaseDB, companyId]);

    console.log("company : ", selectedCompany?.address);
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);
    const [openLogo, setOpenLogo] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const [selectedOrganization, setSelectedOrganization] = React.useState("");
    const [selectedSalary, setSelectedSalary] = React.useState("");
    const [anchorElMenu, setAnchorElMenu] = React.useState(null);
    const openMenu = Boolean(anchorElMenu);
    const [anchorElSetting, setAnchorElSetting] = React.useState(null);
    const openSetting = Boolean(anchorElSetting);
    const [selectedMenu, setSelectedMenu] = useState('');
    const [companyid, setCompanyid] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [googlemap, setGooglemap] = useState("");
    const [address, setAddress] = useState({});
    const [thailand, setThailand] = React.useState([]);
    React.useEffect(() => {
        if (!database) return;

        const thailandRef = ref(database, `thailand`);

        const unsubscribe = onValue(thailandRef, (snapshot) => {
            const thailandData = snapshot.val();

            // ถ้าไม่มีข้อมูล ให้ใช้ค่า default
            if (!thailandData) {
                setThailand([{ ID: 0, name: '', employeenumber: '' }]);
            } else {
                setThailand(thailandData);
            }
        });

        return () => unsubscribe();
    }, [database]);

    const handleAddress = (newaddress) => {
        setCompanyid(newaddress.ID);
        setLat(newaddress.lat);
        setLng(newaddress.lng);
        setAddress({
            amphure: newaddress.amphure,
            province: newaddress.province,
            tambon: newaddress.tambon,
            zipCode: newaddress.zipCode
        })
    }

    const handleClickMenu = (event) => {
        setAnchorElMenu(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorElMenu(null);
    };

    const handleClickSetting = (event) => {
        setAnchorElSetting(event.currentTarget);
    };

    const handleCloseSetting = () => {
        setAnchorElSetting(null);
    };

    const handleListOrganization = (event, index) => {
        setSelectedOrganization(index);
    };

    const handleListSalary = (event, index) => {
        setSelectedSalary(index);
    };

    const [expanded, setExpanded] = React.useState('panel1');

    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };


    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const [openEmail, setOpenEmail] = React.useState(false);
    const [openPassword, setOpenPassword] = React.useState(false);
    const [openPhone, setOpenPhone] = React.useState(false);
    const [openCoordinates, setOpenCoordinates] = React.useState(false);

    const handleClickOpenEmail = () => {
        setOpenEmail(true);
    };

    const handleCloseEmail = () => {
        setOpenEmail(false);
    };

    const handleClickOpenPassword = () => {
        setOpenPassword(true);
    };

    const handleClosePassword = () => {
        setOpenPassword(false);
    };

    const handleClickOpenPhone = () => {
        setOpenPhone(true);
    };

    const handleClickOpenCoordinates = () => {
        setOpenCoordinates(true);
    };

    const handleClosePhone = () => {
        setOpenPhone(false);
    };

    const handleCloseCoordinates = () => {
        setOpenCoordinates(false);
    };

    function formatAddress(data) {
        // ตัดเอาส่วนหลัง '-' ออกมา ถ้าไม่มี '-' จะใช้ทั้งสตริงเลย
        const getName = (str) => {
            if (!str) return "";
            const parts = str.split("-");
            return parts.length > 1 ? parts[1] : str;
        };

        const tambon = getName(data.tambon);
        const amphure = getName(data.amphure);
        const province = getName(data.province);
        const zipCode = data.zipCode || "";

        return `ตำบล ${tambon}, อำเภอ ${amphure}, จังหวัด ${province}, รหัสไปรษณีย์ ${zipCode}`;
    }


    const handleMapLinkChange = (e) => {
        const value = e.target.value;
        setGooglemap(value);

        // รวม regex สำหรับหลายรูปแบบ
        const regexList = [
            /@(-?\d+\.\d+),(-?\d+\.\d+)/,              // แบบ @lat,lng,...
            /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/,      // แบบ /place/lat,lng
            /q=(-?\d+\.\d+),(-?\d+\.\d+)/,             // แบบ ?q=lat,lng
            /\/maps\/(-?\d+\.\d+),(-?\d+\.\d+)/,       // แบบ /maps/lat,lng
            /\/\?ll=(-?\d+\.\d+),(-?\d+\.\d+)/,        // แบบ ?ll=lat,lng
        ];

        let found = false;

        for (const regex of regexList) {
            const match = value.match(regex);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                setLat(lat);
                setLng(lng);
                found = true;
                break;
            }
        }

        if (!found) {
            console.warn("ไม่พบพิกัดในลิงก์");
        }
    };


    const handleSaveCoordinates = () => {
        const companyRef = ref(firebaseDB, `workgroup/company/${companyId}`);

        const updates = {
            lat: lat,
            lng: lng,
        };

        update(companyRef, updates)
            .then(() => {
                ShowSuccess("บันทึกพิกัดสำเร็จ");
                console.log("บันทึก lat/lng สำเร็จ");
                setOpenCoordinates(false);
            })
            .catch((error) => {
                ShowError("เกิดข้อผิดพลาดในการบันทึกพิกัด");
                console.error("เกิดข้อผิดพลาด:", error);
            });
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);                      // ✅ ออกจากระบบ Firebase Auth
            localStorage.removeItem("domainData");    // ✅ ล้าง domain config (ถ้าต้องการ)
            navigate("/");                            // ✅ กลับไปหน้า login
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const menuId = 'primary-search-account-menu';

    const mobileMenuId = 'primary-search-account-menu-mobile';

    return (
        <>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ color: theme.palette.primary.contrastText }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="ค้นหา…"
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>

                    <Box sx={{ flexGrow: 1 }} />
                    <ButtonGroup variant="text" color='inherit' aria-label="Basic button group">
                        <Button
                            id="demo-customized-button"
                            aria-controls={openSetting ? 'demo-customized-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={openSetting ? 'true' : undefined}
                            variant="contained"
                            color='primary'
                            disableElevation
                            onClick={handleClickSetting}
                            endIcon={openSetting ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        >
                            <Typography variant='subtitle1' sx={{ marginTop: 1 }} gutterBottom>{selectedCompany?.companyname}</Typography>
                        </Button>
                        <Menu
                            id="demo-positioned-menu"
                            aria-labelledby="demo-positioned-button"
                            anchorEl={anchorElSetting}
                            open={openEmail || openPassword || openPhone ? !openSetting : openSetting}
                            onClose={handleCloseSetting}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    width: 240,
                                    borderStyle: 'solid',
                                    borderWidth: 3,
                                    borderColor: theme.palette.primary.light,
                                    borderRadius: 3,
                                    textAlign: "center",
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    '& .MuiAvatar-root': {
                                        width: 50,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 120,
                                        width: 10,
                                        height: 10,
                                        backgroundColor: theme.palette.primary.light,
                                        transform: 'translateY(-50%) rotate(50deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                        >
                            {/* <MenuItem onClick={handleClickOpenEmail}><MailOutlineRoundedIcon sx={{ marginRight: 2 }} /> เปลี่ยนอีเมล</MenuItem><Divider />
                            <MenuItem onClick={handleClickOpenPassword}><PasswordRoundedIcon sx={{ marginRight: 2 }} /> เปลี่ยนรหัสผ่าน</MenuItem><Divider /> */}
                            <MenuItem onClick={handleClickOpenPhone}><PhoneIphoneRoundedIcon sx={{ marginRight: 2 }} /> เปลี่ยนเบอร์โทรศัพท์</MenuItem><Divider />
                            <MenuItem onClick={handleClickOpenCoordinates}><BusinessIcon sx={{ marginRight: 2 }} /> เพิ่มพิกัดของบริษัท</MenuItem><Divider />
                        </Menu>
                        {/* <Button size="large" color="inherit">
                            <IconButton size="large" aria-label="เลือกภาษา" color="inherit">
                                <FlagRoundedIcon />
                            </IconButton>
                        </Button> */}
                        <Button size="large" color="inherit">
                            <IconButton
                                size="small"
                                aria-label="กลับสู่ระบบหลัก"
                                color={openLogo ? "primary" : "inherit"}
                                onMouseEnter={() => setOpenLogo(true)}
                                onMouseLeave={() => setOpenLogo(false)}
                                sx={{ '&:hover': { backgroundColor: theme.palette.primary.light }, marginTop: openLogo ? -1 : 0, marginBottom: openLogo ? -1 : 0 }}
                                component={Link}
                                //to={`/${domain}/dashboard`}
                                to={`/?domain=${domain}&page=dashboard`}
                            >
                                {openLogo ?
                                    <Box>
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Box sx={{ marginBottom: -1.5 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ opacity: 0.7, color: theme.palette.primary.main, marginBottom: -2, marginLeft: -1.5 }}
                                                    fontWeight="bold"
                                                    fontSize={10}
                                                    gutterBottom
                                                >
                                                    ระบบจัดการบริษัท
                                                </Typography>
                                                <img src={LogoGreen} width={140} />
                                            </Box>
                                            <KeyboardReturnRoundedIcon />
                                        </Box>
                                        <Typography variant='subtitle1' fontWeight="bold" fontSize={12} sx={{ marginTop: -1 }} gutterBottom>กลับสู่หน้าเลือกบริษัท</Typography>
                                    </Box>
                                    :
                                    <Box display="flex" justifyContent="center" alignItems="center">
                                        <Box sx={{ marginBottom: -1.5 }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{ opacity: 0.7, color: "white", marginBottom: -2, marginLeft: -1.5 }}
                                                fontWeight="bold"
                                                fontSize={10}
                                                gutterBottom
                                            >
                                                ระบบจัดการบริษัท
                                            </Typography>
                                            <img src={Logo} width={140} />
                                        </Box>
                                        <KeyboardReturnRoundedIcon />
                                    </Box>
                                }
                            </IconButton>
                        </Button>
                    </ButtonGroup>
                    {/* <Dialog
                        maxWidth="md"
                        open={openEmail}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleCloseEmail}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{"เปลี่ยนอีเมล"}</DialogTitle>
                        <Divider />
                        <DialogContent>
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="อีเมลเดิม" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailRoundedIcon />
                                    </InputAdornment>
                                ),
                            }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="อีเมลใหม่" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MarkEmailUnreadRoundedIcon />
                                    </InputAdornment>
                                ),
                            }} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEmail}>ยกเลิก</Button>
                            <Button onClick={handleCloseEmail}>เปลี่ยนอีเมล</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        maxWidth="md"
                        open={openPassword}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClosePassword}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{"เปลี่ยนรหัสผ่าน"}</DialogTitle>
                        <Divider />
                        <DialogContent>
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="รหัสผ่านเดิม" type="password" margin="normal" InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PasswordRoundedIcon />
                                    </InputAdornment>
                                ),
                            }} />
                            <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="รหัสผ่านใหม่" type="password" margin="normal" InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PasswordRoundedIcon />
                                    </InputAdornment>
                                ),
                            }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="ยืนยันรหัสผ่านใหม่อีกครั้ง" type="password" margin="normal" InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PasswordRoundedIcon />
                                    </InputAdornment>
                                ),
                            }} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePassword}>ยกเลิก</Button>
                            <Button onClick={handleClosePassword}>เปลี่ยนรหัสผ่าน</Button>
                        </DialogActions>
                    </Dialog> */}
                    <Dialog
                        open={openPhone}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClosePhone}
                        PaperProps={{
                            sx: {
                                borderRadius: 4, // ค่าตรงนี้คือความมน ยิ่งมากยิ่งมน (ค่า default คือ 1 หรือ 4px)
                                width: "600px",
                                position: "absolute",
                            },
                        }}
                    >
                        <DialogTitle
                            sx={{
                                textAlign: "center",
                                fontWeight: "bold"
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item size={10}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>เปลี่ยนเบอร์โทรศัพท์</Typography>
                                </Grid>
                                <Grid item size={2} sx={{ textAlign: "right" }}>
                                    <IconButtonError sx={{ marginTop: -2 }} onClick={handleClosePhone}>
                                        <CloseIcon />
                                    </IconButtonError>
                                </Grid>
                            </Grid>
                            <Divider sx={{ marginTop: 2, marginBottom: -2, border: `1px solid ${theme.palette.primary.dark}` }} />
                        </DialogTitle>
                        <DialogContent>
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="เบอร์โทรเดิม" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIphoneRoundedIcon />
                                    </InputAdornment>
                                ),
                            }} />
                            <TextField sx={{ marginBottom: 1 }} fullWidth label="เบอร์โทรใหม่" type="text" margin="normal" InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <InstallMobileRoundedIcon />
                                    </InputAdornment>
                                ),
                            }} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePhone}>ยกเลิก</Button>
                            <Button onClick={handleClosePhone}>เปลี่ยนเบอร์โทร</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={openCoordinates}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleCloseCoordinates}
                        PaperProps={{
                            sx: {
                                borderRadius: 4, // ค่าตรงนี้คือความมน ยิ่งมากยิ่งมน (ค่า default คือ 1 หรือ 4px)
                                width: "800px",
                                position: "absolute",
                            },
                        }}
                        maxWidth="lg"
                    >
                        <DialogTitle
                            sx={{
                                textAlign: "center",
                                fontWeight: "bold"
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item size={10}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>กำหนดพิกัดของบริษัท</Typography>
                                </Grid>
                                <Grid item size={2} sx={{ textAlign: "right" }}>
                                    <IconButtonError sx={{ marginTop: -2 }} onClick={handleCloseCoordinates}>
                                        <CloseIcon />
                                    </IconButtonError>
                                </Grid>
                            </Grid>
                            <Divider sx={{ marginTop: 2, marginBottom: -2, border: `1px solid ${theme.palette.primary.dark}` }} />
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} marginTop={2} marginBottom={2}>
                                <Grid item size={12}>
                                    <TableContainer component={Paper} textAlign="center">
                                        <Table size="small" sx={{ tableLayout: "fixed", "& .MuiTableCell-root": { padding: "4px" }, width: "750px" }}>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: theme.palette.primary.dark }}>
                                                    <TablecellHeader sx={{ width: 50 }}>ลำดับ</TablecellHeader>
                                                    <TablecellHeader>ชื่อ</TablecellHeader>
                                                    <TablecellHeader sx={{ width: 500 }}>ที่อยู่</TablecellHeader>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {Array.isArray(selectedCompany?.address) && selectedCompany.address.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center">
                                                            <FolderOffRoundedIcon />
                                                            <br />
                                                            ไม่มีข้อมูล
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    selectedCompany?.address?.map((row, index) => (
                                                        <TableRow
                                                            key={index}
                                                            hover
                                                            sx={{ cursor: "pointer" }}
                                                            onClick={() => handleAddress(row)}
                                                        >
                                                            <TableCell align="center">{index + 1}</TableCell>
                                                            <TableCell align="center">{row.name}</TableCell>
                                                            <TableCell align="center">{formatAddress(row)}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}

                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                {
                                    selectedCompany?.address?.map((row, index) => (
                                        companyid === row.ID &&
                                        <React.Fragment>
                                            <Grid item size={12} marginTop={2}>
                                                <Divider ><Chip label="พิกัดละติจูดและลองจิจูด" size="small" /></Divider>
                                            </Grid>
                                            <Grid item size={12}>
                                                <ThaiAddressSelector
                                                    label="ที่อยู่ปัจจุบัน"
                                                    thailand={thailand}
                                                    value={address}
                                                    placeholder="กรุณากรอกที่อยู่ปัจจุบัน"
                                                    onChange={(val) => setAddress(val)}
                                                />
                                            </Grid>
                                            <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold" >พิกัด latitude</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={lat}
                                                    onChange={(e) => setLat(e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item size={6}>
                                                <Typography variant="subtitle2" fontWeight="bold" >พิกัด longitude</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={lng}
                                                    onChange={(e) => setLng(e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item size={12}>
                                                <Divider ><Chip label="หรือ" size="small" /></Divider>
                                            </Grid>
                                            <Grid item size={12}>
                                                <Typography variant="subtitle2" fontWeight="bold" >url จาก google map</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={googlemap}
                                                    onChange={handleMapLinkChange}
                                                />
                                            </Grid>
                                        </React.Fragment>
                                    ))
                                }
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: "space-between", px: 3, borderTop: `1px solid ${theme.palette.primary.dark}` }}>
                            <Button variant="contained" color="error" onClick={handleCloseCoordinates}>ยกเลิก</Button>
                            {

                                selectedCompany?.address?.map((row, index) => (
                                    companyid === row.ID &&
                                    <Button variant="contained" color="success" onClick={handleSaveCoordinates}>บันทึก</Button>
                                ))
                            }
                        </DialogActions>
                    </Dialog>
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <DrawerHeader sx={{ backgroundColor: theme.palette.primary.light, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <IconButton color="primary" sx={{ display: "block", marginBottom: -1, marginTop: -1, marginRight: -2.5 }} onClick={() => navigate(`/${domain}/${companyName}`)}>
                        <Box
                            sx={{
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                fontSize="12px"
                                sx={{ opacity: 0.7, color: theme.palette.primary.dark, marginBottom: -3, marginLeft: -1.5 }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                ระบบจัดการบริษัท
                            </Typography>
                            <img src={LogoGreen} width={220} />
                            <Typography
                                variant="subtitle2"
                                fontSize="10px"
                                sx={{
                                    opacity: 0.7,
                                    color: theme.palette.primary.dark,
                                    marginTop: -1,
                                }}
                                fontWeight="bold"
                                gutterBottom
                            >
                                ( {selectedCompany?.companyname ?? "ชื่อบริษัท"} )
                            </Typography>
                        </Box>
                        {/* <img src={LogoGreen} width={200} />
                        <Typography variant="subtitle2" fontSize={12} marginTop={-2} fontWeight="bold" gutterBottom>
                            ( {selectedCompany?.companyname} )
                        </Typography> */}
                    </IconButton>
                    <IconButton color="primary" onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon fontSize="large" /> : <ChevronLeftIcon fontSize="large" />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                {/* {
                    open ?
                        <Stack direction="column" spacing={2} height={150} justifyContent="center" alignItems="center" textAlign="center" p={3}>
                            <StyledBadge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                            >
                                <Avatar src="/broken-image.jpg" sx={{ width: 80, height: 80 }} />
                            </StyledBadge>
                            <ButtonGroup variant="text" aria-label="Basic button group">
                                <Typography variant='subtitle2' marginLeft={1} marginRight={1} marginTop={1} fontWeight="bold" gutterBottom>{selectedCompany?.companyname}</Typography>
                            </ButtonGroup>
                        </Stack>
                        :
                        ""
                } */}
                <Divider />
                <List sx={{ marginBottom: 2, py: 0 }}>
                    {['หน้าแรก'].map((text, index) => {
                        const isSelected = selectedMenu === text;

                        return (
                            <ListItem
                                key={text}
                                disablePadding
                                sx={{
                                    display: open ? 'block' : 'flex',
                                    height: 30,
                                    py: 0.3,
                                }}
                            >
                                <ListItemButton
                                    component={Link}
                                    //to={`/${domain}/${companyName}`}
                                    to={`/?domain=${domain}&company=${companyName}&page=dashboard`}
                                    onClick={() => setSelectedMenu(text)}
                                    sx={{
                                        minHeight: 32,
                                        px: open ? 2 : 1,
                                        py: 0.5,
                                        paddingLeft: isSelected ? 4 : 2,
                                        backgroundColor: isSelected ? 'primary.main' : 'transparent',
                                        color: isSelected ? 'white' : 'inherit',
                                        '&:hover': {
                                            backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 28,
                                            mr: open ? 0.5 : 'auto',
                                            ml: open ? 0.5 : 'auto',
                                            justifyContent: 'center',
                                            color: isSelected ? 'white' : '#616161',
                                        }}
                                    >
                                        <HomeRoundedIcon sx={{ fontSize: 20 }} />
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={text}
                                        sx={{
                                            opacity: open ? 1 : 0,
                                            '& .MuiTypography-root': {
                                                fontSize: '15px',
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
                {!openData && <Divider />}
                <ListItem
                    key={"โครงสร้างองค์กร"}
                    disablePadding
                    sx={{
                        height: 30, // กำหนดความสูงให้ ListItem
                        paddingY: 1,
                    }}
                >
                    <ListItemButton
                        onClick={() => setOpenData(!openData)}
                        sx={{
                            height: 30, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                            px: 2,      // padding แนวนอน
                            fontWeight: !openData && 'bold'
                        }}
                    >
                        {/* ไอคอนซ้าย */}
                        <ListItemIcon sx={{
                            minWidth: 28,
                            mr: open ? 0.5 : 'auto',
                            ml: open ? 0.5 : 'auto',
                            justifyContent: 'center',
                            color: !openData ? "black" : '#616161',
                        }}>
                            <ApartmentIcon />
                        </ListItemIcon>

                        {/* ข้อความ */}
                        <ListItemText
                            primary="โครงสร้างองค์กร"
                            primaryTypographyProps={{
                                fontSize: "16px",
                                fontWeight: !openData && "bold"
                            }}
                            sx={{
                                opacity: open ? 1 : 0,
                                '& .MuiTypography-root': {
                                    fontSize: '15px',
                                }
                            }}
                        />

                        {/* ไอคอนขวา */}
                        <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.dark }}>
                            {!openData ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                        </ListItemIcon>
                    </ListItemButton>

                </ListItem>
                {openData && <Divider />}
                <List sx={{ mb: 2, py: 0, marginLeft: open ? 2 : 0 }}>
                    {!openData && (
                        <React.Fragment>
                            {open &&
                                <Typography marginLeft={2} variant="subtitle2" gutterBottom sx={{ fontSize: "14px", fontWeight: "bold", marginTop: 1, marginBottom: -0.5 }}>
                                    โครงสร้างบริษัท
                                </Typography>
                            }
                            {[
                                'ระดับตำแหน่งงาน',
                                'แผนก/ฝ่ายงาน',
                                'ส่วนงาน',
                                'ตำแหน่งงาน',
                                'ประเภทการจ้าง'
                            ].map((text, index) => {
                                const isSelected = selectedMenu === text;

                                return (
                                    <ListItem
                                        key={text}
                                        disablePadding
                                        sx={{
                                            display: open ? 'block' : 'flex',
                                            height: 34,
                                            py: 0.3,
                                        }}
                                    >
                                        <ListItemButton
                                            component={Link}
                                            onClick={() => setSelectedMenu(text)}
                                            // to={
                                            //     index === 0
                                            //         ? `/${domain}/${companyName}/level`
                                            //         : index === 1
                                            //             ? `/${domain}/${companyName}/department`
                                            //             : index === 2
                                            //                 ? `/${domain}/${companyName}/section`
                                            //                 : `/${domain}/${companyName}/position`

                                            // }
                                            to={
                                                index === 0
                                                    ? `/?domain=${domain}&company=${companyName}&operation=level`
                                                    : index === 1
                                                        ? `/?domain=${domain}&company=${companyName}&operation=department`
                                                        : index === 2
                                                            ? `/?domain=${domain}&company=${companyName}&operation=section`
                                                            : index === 3
                                                                ? `/?domain=${domain}&company=${companyName}&operation=position`
                                                                : `/?domain=${domain}&company=${companyName}&operation=employee-type`

                                            }
                                            sx={{
                                                height: 30,
                                                px: open ? 2 : 1,
                                                py: 0.5,
                                                paddingLeft: isSelected ? 4 : 2,
                                                backgroundColor: isSelected ? 'primary.main' : 'transparent',
                                                color: isSelected ? 'white' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 28,
                                                    mr: open ? 0.5 : 'auto',
                                                    ml: open ? 0.5 : 'auto',
                                                    justifyContent: 'center',
                                                    color: isSelected ? 'white' : '#616161',
                                                }}
                                            >
                                                <LocationCityIcon sx={{ fontSize: 18 }} />
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={text}
                                                sx={{
                                                    opacity: open ? 1 : 0,
                                                    '& .MuiTypography-root': {
                                                        fontSize: '13px',
                                                    },
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            }
                            )}
                            {!openData && <Divider />}
                            {open && <Typography marginLeft={2} variant="subtitle2" gutterBottom sx={{ fontSize: "14px", fontWeight: "bold", marginTop: 1, marginBottom: -0.5 }}>
                                โครงสร้างเงินเดือน
                            </Typography>}

                            {['ประกันสังคม', 'ภาษี',
                                //'ค่าลดหย่อนภาษี',
                                'รายได้เพิ่มเติม', 'รายหักเพิ่มเติม'].map((text, index) => {
                                    const isSelected = selectedMenu === text;

                                    return (
                                        <ListItem
                                            key={text}
                                            disablePadding
                                            sx={{
                                                display: open ? 'block' : 'flex',
                                                height: 34, // ลดความสูง
                                                paddingY: 0.3,
                                            }}
                                        >
                                            <ListItemButton
                                                component={Link}
                                                // to={
                                                //     index === 0
                                                //         ? `/${domain}/${companyName}/social-security`
                                                //         : index === 1
                                                //             ? `/${domain}/${companyName}/tax`
                                                //             : `/${domain}/${companyName}/deduction`
                                                // }
                                                to={
                                                    index === 0
                                                        ? `/?domain=${domain}&company=${companyName}&salary=social-security`
                                                        : index === 1
                                                            ? `/?domain=${domain}&company=${companyName}&salary=tax`
                                                            // : index === 2
                                                            //     ? `/?domain=${domain}&company=${companyName}&salary=deduction`
                                                            : index === 2
                                                                ? `/?domain=${domain}&company=${companyName}&salary=income`
                                                                : `/?domain=${domain}&company=${companyName}&salary=deductions`
                                                }
                                                onClick={() => setSelectedMenu(text)}
                                                sx={{
                                                    height: 30,
                                                    paddingY: 0.5,
                                                    paddingX: open ? 2 : 1,
                                                    paddingLeft: isSelected ? 4 : 2,
                                                    backgroundColor: isSelected ? 'primary.main' : 'transparent',
                                                    color: isSelected ? 'white' : 'inherit',
                                                    '&:hover': {
                                                        backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                                    },
                                                }}
                                            >
                                                <ListItemIcon
                                                    sx={{
                                                        minWidth: 28,
                                                        mr: open ? 0.5 : 'auto',
                                                        justifyContent: 'center',
                                                        marginLeft: open ? 1 : 'auto',
                                                        color: isSelected ? 'white' : '#616161',
                                                    }}
                                                >
                                                    <AttachMoneyIcon sx={{ fontSize: 18 }} />
                                                </ListItemIcon>

                                                <ListItemText
                                                    primary={text}
                                                    sx={{
                                                        opacity: open ? 1 : 0,
                                                        '& .MuiTypography-root': {
                                                            fontSize: '13px', // ลดขนาดตัวอักษร
                                                        },
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    )
                                })}
                            {!openData && <Divider />}
                            {open && <Typography marginLeft={2} variant="subtitle2" gutterBottom sx={{ fontSize: "14px", fontWeight: "bold", marginTop: 1, marginBottom: -0.5 }}>
                                โครงสร้างเวลา
                            </Typography>}

                            {['ประเภทการลา', 'โอที', 'กะการทำงาน', 'วันหยุดบริษัท'].map((text, index) => {
                                const isSelected = selectedMenu === text;

                                return (
                                    <ListItem
                                        key={text}
                                        disablePadding
                                        sx={{
                                            display: open ? 'block' : 'flex',
                                            height: 34, // ลดความสูง
                                            paddingY: 0.3,
                                        }}
                                    >
                                        <ListItemButton
                                            component={Link}
                                            // to={
                                            //     index === 0
                                            //         ? `/${domain}/${companyName}/leave`
                                            //         : index === 1
                                            //             ? `/${domain}/${companyName}/workshift`
                                            //             : `/${domain}/${companyName}/dayoff`
                                            // }
                                            to={
                                                index === 0
                                                    ? `/?domain=${domain}&company=${companyName}&time=leave`
                                                    : index === 1
                                                        ? `/?domain=${domain}&company=${companyName}&time=ot`
                                                        : index === 2
                                                            ? `/?domain=${domain}&company=${companyName}&time=workshift`
                                                            : `/?domain=${domain}&company=${companyName}&time=dayoff`
                                            }
                                            onClick={() => setSelectedMenu(text)}
                                            sx={{
                                                height: 30,
                                                paddingY: 0.5,
                                                paddingX: open ? 2 : 1,
                                                paddingLeft: isSelected ? 4 : 2,
                                                backgroundColor: isSelected ? 'primary.main' : 'transparent',
                                                color: isSelected ? 'white' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 28,
                                                    mr: open ? 0.5 : 'auto',
                                                    justifyContent: 'center',
                                                    marginLeft: open ? 1 : 'auto',
                                                    color: isSelected ? 'white' : '#616161',
                                                }}
                                            >
                                                <AccessTimeFilledIcon sx={{ fontSize: 18 }} />
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={text}
                                                sx={{
                                                    opacity: open ? 1 : 0,
                                                    '& .MuiTypography-root': {
                                                        fontSize: '13px', // ลดขนาดตัวอักษร
                                                    },
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })}
                        </React.Fragment>
                    )}
                </List>
                <ListItem
                    key={"โครงสร้างพนักงาน"}
                    disablePadding
                    sx={{
                        height: 30, // กำหนดความสูงให้ ListItem
                        paddingY: 1,
                    }}
                >
                    <ListItemButton
                        onClick={() => setOpenEmployee(!openEmployee)}
                        sx={{
                            height: 30, // ปรับขึ้นนิดนึงให้ไม่แน่นเกินไป
                            px: 2,      // padding แนวนอน
                        }}
                    >
                        {/* ไอคอนซ้าย */}
                        <ListItemIcon sx={{
                            minWidth: 28,
                            mr: open ? 0.5 : 'auto',
                            ml: open ? 0.5 : 'auto',
                            justifyContent: 'center',
                            color: !openEmployee ? "black" : '#616161',
                        }}>
                            <ApartmentIcon />
                        </ListItemIcon>

                        {/* ข้อความ */}
                        <ListItemText
                            primary="โครงสร้างพนักงาน"
                            primaryTypographyProps={{
                                fontSize: "16px",
                                fontWeight: !openEmployee && "bold"
                            }}
                            sx={{
                                opacity: open ? 1 : 0,
                                '& .MuiTypography-root': {
                                    fontSize: '15px',
                                },
                            }}
                        />

                        {/* ไอคอนขวา */}
                        <ListItemIcon sx={{ minWidth: 30, justifyContent: 'flex-end', color: theme.palette.dark }}>
                            {!openEmployee ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                        </ListItemIcon>
                    </ListItemButton>

                </ListItem>
                <Divider />
                <List sx={{ mb: 2, py: 0, marginLeft: open ? 2 : 0 }}>
                    {!openEmployee &&
                        <React.Fragment>
                            {open && (
                                <Typography marginLeft={2} variant="subtitle2" gutterBottom sx={{ fontSize: "14px", fontWeight: "bold", marginTop: 1, marginBottom: -0.5 }}>
                                    โครงสร้างพนักงาน
                                </Typography>
                            )}
                            {[
                                'พนักงาน',
                                'คำนวณเงินเดือน'
                            ].map((text, index) => {
                                const isSelected = selectedMenu === text;

                                return (
                                    <ListItem
                                        key={text}
                                        disablePadding
                                        sx={{
                                            display: open ? 'block' : 'flex',
                                            height: 34,
                                            py: 0.3,
                                        }}
                                    >
                                        <ListItemButton
                                            component={Link}
                                            onClick={() => setSelectedMenu(text)}
                                            // to={
                                            //     index === 0
                                            //         ? `/${domain}/${companyName}/employee`
                                            //         : `/${domain}/${companyName}/employee`
                                            // }
                                            to={
                                                index === 0
                                                    ? `/?domain=${domain}&company=${companyName}&employee=employee`
                                                    : `/?domain=${domain}&company=${companyName}&employee=calculate`
                                            }
                                            sx={{
                                                minHeight: 32,
                                                px: open ? 2 : 1,
                                                py: 0.5,
                                                paddingLeft: isSelected ? 4 : 2,
                                                backgroundColor: isSelected ? 'primary.main' : 'transparent',
                                                color: isSelected ? 'white' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 28,
                                                    mr: open ? 0.5 : 'auto',
                                                    ml: open ? 0.5 : 'auto',
                                                    justifyContent: 'center',
                                                    color: isSelected ? 'white' : '#616161',
                                                }}
                                            >
                                                <HailIcon sx={{ fontSize: 18 }} />
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={text}
                                                sx={{
                                                    opacity: open ? 1 : 0,
                                                    '& .MuiTypography-root': {
                                                        fontSize: '13px',
                                                    },
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })}
                            {!openData && <Divider />}
                            {open && (
                                <Typography marginLeft={2} variant="subtitle2" gutterBottom sx={{ fontSize: "14px", fontWeight: "bold", marginTop: 1, marginBottom: -0.5 }}>
                                    เอกสารและการอนุมัติ
                                </Typography>
                            )}

                            {[
                                'ขอลา',
                                'ขอโอที',
                                'ขอแก้ไขเวลา',
                                'ขอทำงานนอกสถานที่'
                            ].map((text, index) => {
                                const isSelected = selectedMenu === text;

                                return (
                                    <ListItem
                                        key={text}
                                        disablePadding
                                        sx={{
                                            display: open ? 'block' : 'flex',
                                            height: 34,
                                            py: 0.3,
                                        }}
                                    >
                                        <ListItemButton
                                            component={Link}
                                            onClick={() => setSelectedMenu(text)}
                                            // to={
                                            //     index === 0
                                            //         ? `/${domain}/${companyName}/employee`
                                            //         : `/${domain}/${companyName}/employee`
                                            // }
                                            to={
                                                index === 0 ? `/?domain=${domain}&company=${companyName}&report=leave`
                                                    : index === 1 ? `/?domain=${domain}&company=${companyName}&report=ot`
                                                        : index === 2 ? `/?domain=${domain}&company=${companyName}&report=time`
                                                            : index === 3 ? `/?domain=${domain}&company=${companyName}&report=working-outside`
                                                                : index === 4 ? `/?domain=${domain}&company=${companyName}&report=work-certificate`
                                                                    : `/?domain=${domain}&company=${companyName}&report=salary-certificate`
                                            }
                                            sx={{
                                                minHeight: 32,
                                                px: open ? 2 : 1,
                                                py: 0.5,
                                                paddingLeft: isSelected ? 4 : 2,
                                                backgroundColor: isSelected ? 'primary.main' : 'transparent',
                                                color: isSelected ? 'white' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 28,
                                                    mr: open ? 0.5 : 'auto',
                                                    ml: open ? 0.5 : 'auto',
                                                    justifyContent: 'center',
                                                    color: isSelected ? 'white' : '#616161',
                                                }}
                                            >
                                                <HailIcon sx={{ fontSize: 18 }} />
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={text}
                                                sx={{
                                                    opacity: open ? 1 : 0,
                                                    '& .MuiTypography-root': {
                                                        fontSize: '13px',
                                                    },
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })}
                        </React.Fragment>
                    }
                </List>
            </Drawer>
        </>
    );
}
