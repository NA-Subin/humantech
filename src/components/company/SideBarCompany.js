import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { getDatabase, ref, push, onValue } from "firebase/database";
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import HailIcon from '@mui/icons-material/Hail';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardReturnRoundedIcon from '@mui/icons-material/KeyboardReturnRounded';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Logo from '../../img/Humantech.png';
import LogoGreen from '../../img/HumantechGreen.png';
import { Button, ButtonGroup, Grid } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../../server/firebase';
import { useFirebase } from '../../server/ProjectFirebaseContext';


const drawerWidth = 300;

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
    const { domain, companyName } = useParams();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const companyId = companyName?.split(":")[0];

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

    console.log("company : ", selectedCompany);
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

    const handleClosePhone = () => {
        setOpenPhone(false);
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
                            <MenuItem onClick={handleClickOpenEmail}><MailOutlineRoundedIcon sx={{ marginRight: 2 }} /> เปลี่ยนอีเมล</MenuItem><Divider />
                            <MenuItem onClick={handleClickOpenPassword}><PasswordRoundedIcon sx={{ marginRight: 2 }} /> เปลี่ยนรหัสผ่าน</MenuItem><Divider />
                            <MenuItem onClick={handleClickOpenPhone}><PhoneIphoneRoundedIcon sx={{ marginRight: 2 }} /> เปลี่ยนเบอร์โทรศัพท์</MenuItem><Divider />
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
                                to={`/${domain}/dashboard`}>
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
                    <Dialog
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
                    </Dialog>
                    <Dialog
                        maxWidth="md"
                        open={openPhone}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClosePhone}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>{"เปลี่ยนเบอร์โทร"}</DialogTitle>
                        <Divider />
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
                    <IconButton color="primary" sx={{ display: "block", marginBottom: -1, marginTop: -1 }} onClick={() => navigate(`/${domain}/${companyName}`)}>
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
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
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
                <List sx={{ marginBottom: 1, py: 0 }}>
                    {['หน้าแรก'].map((text, index) => {
                        const isSelected = selectedMenu === text;

                        return (
                            <ListItem
                                key={text}
                                disablePadding
                                sx={{
                                    display: open ? 'block' : 'flex',
                                    height: 36,
                                    py: 0.3,
                                }}
                            >
                                <ListItemButton
                                    component={Link}
                                    to={`/${domain}/${companyName}`}
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
                                            mr: open ? 2 : 'auto',
                                            ml: open ? 1 : 'auto',
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
                <Divider />
                <List sx={{ mb: 2, py: 0 }}>
                    {open && (
                        <Typography marginLeft={2} variant="subtitle2" gutterBottom sx={{ fontSize: "14px", fontWeight: "bold", marginTop: 1 }}>
                            โครงสร้างบริษัท
                        </Typography>
                    )}

                    {[
                        'ระดับตำแหน่งงาน',
                        'แผนก/ฝ่ายงาน',
                        'ส่วนงาน',
                        'ตำแหน่งงาน'
                    ].map((text, index) => {
                        const isSelected = selectedMenu === text;

                        return (
                            <ListItem
                                key={text}
                                disablePadding
                                sx={{
                                    display: open ? 'block' : 'flex',
                                    height: 36,
                                    py: 0.3,
                                }}
                            >
                                <ListItemButton
                                    component={Link}
                                    onClick={() => setSelectedMenu(text)}
                                    to={
                                        index === 0
                                            ? `/${domain}/${companyName}/level`
                                            : index === 1
                                                ? `/${domain}/${companyName}/department`
                                                : index === 2
                                                    ? `/${domain}/${companyName}/section`
                                                    : `/${domain}/${companyName}/position`
                                                            
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
                                            mr: open ? 2 : 'auto',
                                            ml: open ? 1 : 'auto',
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
                                                fontSize: '15px',
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
                <Divider />
                <List sx={{ marginBottom: 2, paddingY: 0 }}>
                    {open ? (
                        <Typography marginLeft={2} variant="subtitle2" gutterBottom sx={{ fontSize: "14px", fontWeight: "bold", marginTop: 1 }}>
                            โครงสร้างภาษี
                        </Typography>
                    ) : null}

                    {['ประกันสังคม', 'ภาษี', 'ค่าลดหย่อนภาษี'].map((text, index) => {
                        const isSelected = selectedMenu === text;

                        return (
                            <ListItem
                                key={text}
                                disablePadding
                                sx={{
                                    display: open ? 'block' : 'flex',
                                    height: 36, // ลดความสูง
                                    paddingY: 0.3,
                                }}
                            >
                                <ListItemButton
                                    component={Link}
                                    to={
                                        index === 0
                                            ? `/${domain}/${companyName}/social-security`
                                            : index === 1
                                                ? `/${domain}/${companyName}/tax`
                                                            : `/${domain}/${companyName}/deduction`
                                    }
                                    onClick={() => setSelectedMenu(text)}
                                    sx={{
                                        minHeight: 32,
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
                                            mr: open ? 2 : 'auto',
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
                                                fontSize: '15px', // ลดขนาดตัวอักษร
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
                <Divider />
                <List sx={{ marginBottom: 2, paddingY: 0 }}>
                    {open ? (
                        <Typography marginLeft={2} variant="subtitle2" gutterBottom sx={{ fontSize: "14px", fontWeight: "bold", marginTop: 1 }}>
                            โครงสร้างเวลา
                        </Typography>
                    ) : null}

                    {['ประเภทการลา', 'กะการทำงาน', 'วันหยุดบริษัท'].map((text, index) => {
                        const isSelected = selectedMenu === text;

                        return (
                            <ListItem
                                key={text}
                                disablePadding
                                sx={{
                                    display: open ? 'block' : 'flex',
                                    height: 36, // ลดความสูง
                                    paddingY: 0.3,
                                }}
                            >
                                <ListItemButton
                                    component={Link}
                                    to={
                                        index === 0
                                            ? `/${domain}/${companyName}/leave`
                                            : index === 1
                                                ? `/${domain}/${companyName}/workshift`
                                                : `/${domain}/${companyName}/dayoff`
                                    }
                                    onClick={() => setSelectedMenu(text)}
                                    sx={{
                                        minHeight: 32,
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
                                            mr: open ? 2 : 'auto',
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
                                                fontSize: '15px', // ลดขนาดตัวอักษร
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
            </Drawer>
        </>
    );
}
