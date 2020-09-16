import { format } from 'winston';

export const timeStamp = format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });
