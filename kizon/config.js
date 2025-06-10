// config.js
import moment from 'moment-timezone';

export const ownerNumber = ['6285847430185'];
export const ownerName = 'Ukiratmaja Gzz';
export const botName = 'ZyrooBot';
export const region = 'Indonesia';
export const timezone = 'Asia/Makassar';
export const prefix = '.';
export const mode = 'Public';

export const getTime = () => moment().tz(timezone).format('HH:mm:ss');
export const getDate = () => moment().tz(timezone).format('dddd, DD MMMM YYYY');