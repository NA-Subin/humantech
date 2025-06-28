import axios from 'axios';

export const HTTP = axios.create({
  baseURL: 'http://localhost:8000/',
});

// export const HTTP = axios.create({
//   baseURL: 'https://script.google.com/macros/s/AKfycbxUyBu0Zr3IuD-tj39A1Bafgq6hHeB1Aaey6G9LSdEVILHrgz5FvCEkW_WuPzf7AwE5',
// });