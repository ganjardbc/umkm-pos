import dayjs from 'dayjs';

const FORMAT_TIME = 'HH:mm';
const FORMAT_DATE = 'DD/MM/YYYY';
const FORMAT_DATE_TIME = 'DD/MM/YYYY HH:mm';

export const isDateValid = (date: string) => {
  return dayjs(date).isValid();
}

export const formatTime = (time: string) => {
  return isDateValid(time) ? dayjs(time).format(FORMAT_TIME) : '-';
}

export const formatRangeTime = (startTime: string, endTime: string) => {
  const start = isDateValid(startTime) ? dayjs(startTime).format(FORMAT_TIME) : '-';
  const end = isDateValid(endTime) ? dayjs(endTime).format(FORMAT_TIME) : '-';
  return `${start} - ${end}`;
}

export const formatDate = (date: string) => {
  return isDateValid(date) ? dayjs(date).format(FORMAT_DATE) : '-';
}

export const formatRangeDate = (startDate: string, endDate: string) => {
  const start = isDateValid(startDate) ? dayjs(startDate).format(FORMAT_DATE) : '-';
  const end = isDateValid(endDate) ? dayjs(endDate).format(FORMAT_DATE) : '-';
  return `${start} - ${end}`;
}

export const formatDateTime = (date: string) => {
  return isDateValid(date) ? dayjs(date).format(FORMAT_DATE_TIME) : '-';
}

export const formatRangeDateTime = (startDate: string, endDate: string) => {
  const start = isDateValid(startDate) ? dayjs(startDate).format(FORMAT_DATE_TIME) : '-';
  const end = isDateValid(endDate) ? dayjs(endDate).format(FORMAT_DATE_TIME) : '-';
  return `${start} - ${end}`;
}

export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes < 0) {
    return '0 minutes';
  }

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (mins > 0) {
    parts.push(`${mins}m`);
  }

  return parts.length > 0 ? parts.join(' ') : '0m';
};

export const getDuration = (startDate: string, endDate: string) => {
  if (!isDateValid(startDate) || !isDateValid(endDate)) {
    return '0 minutes';
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  const diffInMinutes = end.diff(start, 'minute');
  const diffInHours = end.diff(start, 'hour');
  const diffInDays = end.diff(start, 'day');

  // If duration is less than 60 minutes, show in minutes
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  // If duration is less than 24 hours, show in hours
  if (diffInHours < 24) {
    const remainingMinutes = diffInMinutes % 60;
    if (remainingMinutes === 0) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'}`;
    }
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  // If duration is 24 hours or more, show in days
  const remainingHours = diffInHours % 24;
  if (remainingHours === 0) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}`;
  }
  return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
}

export const getCurrency = (value: any) => {
  if (typeof value !== 'number') {
    value = Number(value);
  }
  return `Rp ${value.toLocaleString('id-ID')},00`;
};

export const getErrorMessage = (error: any) => {
  if (error.response) {
    if (error.response.data) {
      if (error.response.data.message) {
        return Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message
      } else if (error.response.data.error) {
        return Array.isArray(error.response.data.error)
          ? error.response.data.error.join(', ')
          : error.response.data.error
      }
    }
    return error.response.statusText
  } else {
    return error.message
  }
}

export const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numPrice);
};

export const randomString = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const getNoTable = (index: number, page: number, rows: number) => {
  return index + 1 + (page - 1) * rows;
};

export const getSummaryPage = (pagination: any) => {
  return `Page ${pagination?.page || '0'} - ${pagination?.pageCount || '0'} (${pagination?.totalRecords || '0'} data)`;
}

export const useDebounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
};
