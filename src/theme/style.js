import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import "./theme";
import '@fontsource/sarabun';
import { IconButton } from '@mui/material';

const IconButtons = styled(Button)(({ theme }) => ({
  ...theme.typography.body2,
  borderRadius: 30,
  opacity: 0.8,
  boxShadow: '2px 2px 4px 4px rgba(0, 0, 0, 0.1)'
}));

const SearchData = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#fcbf8d' : '#fff',
  ...theme.typography.body2,
  borderRadius: 15,
  boxShadow: '2px 2px 4px 4px rgba(0, 0, 0, 0.1)'
}));

const TextBox = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#fcbf8d' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  borderRadius: 15,
  boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)',
  justifyContent: "center",
  textAlign: "center",
  display: "flex"
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#fcbf8d' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(4),
  textAlign: 'left',
  borderRadius: 10,
  boxShadow: '4px 4px 6px 6px rgba(0, 0, 0, 0.1)'
}));

const TablecellHeader = styled(TableCell)(({ theme }) => ({
    textAlign: "center",
    height: "45px",
    color: theme.palette.primary.contrastText,
    borderRight : "1px solid "+theme.palette.primary.contrastText+"",
  }));

const TablecellBody = styled(TableCell)(({ theme }) => ({
    border : "1px solid "+theme.palette.primary.main+"",
}));

const ItemButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#f5852a' : '#fff',
    ...theme.typography.body2,
    textAlign: 'left',
    margin: 2,
    width: 170,
    color: theme.palette.text.secondary,
  }));

const TablecellNoData = styled(TableCell)(({ theme }) => ({
  height: 200,
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: theme.palette.primary.dark,
  backgroundColor: theme.palette.primary.light,
  opacity: 0.6
}));

const Boxs = styled(Box)(({ theme }) => ({
  width: 190, 
  paddingLeft: 7 , 
  paddingBottom: 20,
  background: 'conic-gradient(from 180deg at 15%,'+theme.palette.primary.light+' 90deg, '+theme.palette.primary.light+' 180deg, '+theme.palette.primary.contrastText+' 180deg, '+theme.palette.primary.contrastText+' 270deg)'
}));

const SwitchApprove = styled(Switch)(({ theme }) => ({
  width: 200,
  height: 50,
  padding: 0,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 70,
    },
    '&::before': {
      content: '"ยินยอม"',
      left: 12,
    },
    '&::after': {
      content: '"ไม่ยินยอม"',
      color: theme.palette.primary.main,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 25,
    height: 25,
    margin: 2,
  },
  "& .MuiSwitch-switchBase": {
      "&.Mui-checked": {
        transform: "translateX(150px)",
      },
    },
}));

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 15,
  borderRadius: 10,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.secondary.main : theme.palette.secondary.light,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 10,
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
  },
}));

const BorderLinearProgressCompany = styled(LinearProgress)(({ theme }) => ({
  height: 15,
  borderRadius: 10,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.main,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 10,
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
  },
}));

const ItemReport = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  height: 200,
  color: theme.palette.text.secondary,
}));

const IconButtonError = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.primary.contrastText,
  },
}));

const IconButtonWarning = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.primary.contrastText,
  },
}));

const IconButtonSuccess = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.primary.contrastText,
  },
}));

export {Item,IconButtons,Boxs,SearchData,TextBox,TablecellHeader,TablecellBody,ItemButton,TablecellNoData,SwitchApprove,BorderLinearProgress,BorderLinearProgressCompany,ItemReport,IconButtonError,IconButtonWarning,IconButtonSuccess }