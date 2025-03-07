// more robust if you add counter +1 +1 ...
import { parseDate,  } from '@internationalized/date';
const formatterDateYYYYMMDD = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const formatterDateEn = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const generateUniqueId = function (counter = 0) {
  return Date.now().toString(36) + Math.random().toString(36).substring(2) + counter;
}

export const GetDateTimestamp = (date) => {
  if (!date) return null;

  if (typeof date === 'string') {
    date = parseDate(date).toDate().getTime()
  } else {
    date = date.seconds *1000
  }

  return Math.floor(date);
}


export const customParseDate = (date) =>{
  if (typeof date === 'string') {
    return new Date(date)
  }
}

export const formatDateYYYYMMDD = (date) => {
  return formatterDateYYYYMMDD.format(date)
}

export const formatDateEn = (date) => {
  return formatterDateEn.format(date)
}

export const FromSecondsToEn = (seconds) => {
  return formatterDateEn.format(new Date(seconds * 1000))
}


export const FromDateStringToEn = (str)=>{
  return formatDateEn(new Date(str))
}
export const DownloadJSON = (data, filename = "data.json") => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};