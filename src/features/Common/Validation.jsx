import { defaultCountries, parseCountry } from "react-international-phone";

const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
const descriptionRegex = /^(?!\s*$).+/;
const emailRegex =
  /^(?=[a-zA-Z0-9._-]{6,30}@)(?=[a-zA-Z0-9._-]*[a-zA-Z])[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const mobileRegex = /^[0-9]+$/;
const domainRegex =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:[a-zA-Z]{2,})$/;
const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?$/i;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
import dayjs from "dayjs";
import moment from "moment";

export const nameValidator = (name) => {
  let error = "";

  if (!name || name.length <= 0) error = " is required";
  else if (!nameRegex.test(name) || name.length < 3) error = " is not valid";

  return error;
};

export const lastNameValidator = (name) => {
  let error = "";

  if (!name || name.length <= 0) error = " is required";
  else if (!nameRegex.test(name)) error = " is not valid";

  return error;
};

export const descriptionValidator = (name) => {
  let error = "";
  const trimmedName = name.trim();

  if (!trimmedName || trimmedName.length <= 0) error = " is required";
  else if (!descriptionRegex.test(trimmedName) || trimmedName.length < 2)
    error = " must be 2 characters";

  return error;
};

export const emailValidator = (email) => {
  let error = "";

  if (!email || email.length <= 0) error = " is required";
  else if (!emailRegex.test(email)) error = " is not valid";

  return error;
};

export const userIdValidator = (userid) => {
  let error = "";

  if (!userid || userid.length <= 0) error = " is required";
  else if (!mobileRegex.test(userid) || userid.length < 4)
    error = " is not valid";
  return error;
};

export const passwordValidator = (password) => {
  const isTooShort = password.length < 8;
  const isMissingLowercase = !/[a-z]/.test(password);
  const isMissingUppercase = !/[A-Z]/.test(password);
  const isMissingNumber = !/\d/.test(password);
  const isMissingSpecialChar = !/[\W_]/.test(password);

  let error = "";

  const newErrors = {
    lengthError: isTooShort ? " must be at least 8 characters long." : "",
    lowercaseError: isMissingLowercase
      ? " must contain at least one lowercase letter."
      : "",
    uppercaseError: isMissingUppercase
      ? " must contain at least one uppercase letter."
      : "",
    numberError: isMissingNumber ? " must contain at least one numeric." : "",
    specialCharacterError: isMissingSpecialChar
      ? " must contain at least one special character (!@#$%^&* etc.)."
      : "",
  };

  if (newErrors.lengthError) {
    error = newErrors.lengthError;
  } else if (newErrors.lowercaseError) {
    error = newErrors.lowercaseError;
  } else if (newErrors.uppercaseError) {
    error = newErrors.uppercaseError;
  } else if (newErrors.numberError) {
    error = newErrors.numberError;
  } else if (newErrors.specialCharacterError) {
    error = newErrors.specialCharacterError;
  }
  return error;
};

export const selectValidator = (name) => {
  let error = "";

  if (!name || name.length <= 0) error = " is required";

  return error;
};

const countryLengthFallback = {
  ac: 5, // Ascension Island
  ad: [6, 9], // Andorra
  ae: 9, // United Arab Emirates
  af: 9, // Afghanistan
  ag: 10, // Antigua & Barbuda
  ai: 10, // Anguilla
  al: 9, // Albania
  am: 8, // Armenia
  ao: 9, // Angola
  ar: [10, 11], // Argentina
  as: 10, // American Samoa
  at: [7, 8, 9, 10, 11, 12, 13], // Austria
  au: 9, // Australia
  aw: 7, // Aruba
  ax: [6, 7, 8, 9, 10], // Åland Islands
  az: 9, // Azerbaijan
  ba: [8, 9], // Bosnia & Herzegovina
  bb: 10, // Barbados
  bd: 10, // Bangladesh
  be: 9, // Belgium
  bf: 8, // Burkina Faso
  bg: [8, 9], // Bulgaria
  bh: 8, // Bahrain
  bi: 8, // Burundi
  bj: 10, // Benin
  bl: 9, // St. Barthélemy
  bm: 10, // Bermuda
  bn: 7, // Brunei
  bo: 8, // Bolivia
  bq: 7, // Caribbean Netherlands
  br: [10, 11], // Brazil
  bs: 10, // Bahamas
  bt: 8, // Bhutan
  bw: 8, // Botswana
  by: 9, // Belarus
  bz: 7, // Belize
  ca: 10, // Canada
  cc: 9, // Cocos (Keeling) Islands
  cd: [7, 9], // Congo - Kinshasa
  cf: 8, // Central African Republic
  cg: 9, // Congo - Brazzaville
  ch: 9, // Switzerland
  ci: 10, // Côte d'Ivoire
  ck: 5, // Cook Islands
  cl: 9, // Chile
  cm: 9, // Cameroon
  cn: 11, // China
  co: 10, // Colombia
  cr: 8, // Costa Rica
  cu: 8, // Cuba
  cv: 7, // Cape Verde
  cw: [7, 8], // Curaçao
  cx: 9, // Christmas Island
  cy: 8, // Cyprus
  cz: 9, // Czechia
  de: [10, 11, 12, 13], // Germany
  dj: 8, // Djibouti
  dk: 8, // Denmark
  dm: 10, // Dominica
  do: 10, // Dominican Republic
  dz: 9, // Algeria
  ec: 9, // Ecuador
  ee: [7, 8], // Estonia
  eg: 10, // Egypt
  eh: 9, // Western Sahara
  er: 7, // Eritrea
  es: 9, // Spain
  et: 9, // Ethiopia
  fi: [6, 7, 8, 9, 10], // Finland
  fj: 7, // Fiji
  fk: 5, // Falkland Islands
  fm: 7, // Micronesia
  fo: 6, // Faroe Islands
  fr: 9, // France
  ga: [7, 8], // Gabon
  gb: 10, // United Kingdom
  gd: 10, // Grenada
  ge: 9, // Georgia
  gf: 9, // French Guiana
  gg: 10, // Guernsey
  gh: 9, // Ghana
  gi: 8, // Gibraltar
  gl: 6, // Greenland
  gm: 7, // Gambia
  gn: 9, // Guinea
  gp: 9, // Guadeloupe
  gq: 9, // Equatorial Guinea
  gr: 10, // Greece
  gt: 8, // Guatemala
  gu: 10, // Guam
  gw: 9, // Guinea-Bissau
  gy: 7, // Guyana
  hk: 8, // Hong Kong SAR China
  hn: 8, // Honduras
  hr: [8, 9], // Croatia
  ht: 8, // Haiti
  hu: 9, // Hungary
  id: [9, 10, 11, 12], // Indonesia
  ie: 9, // Ireland
  il: 9, // Israel
  im: 10, // Isle of Man
  in: 10, // India
  io: 7, // British Indian Ocean Territory
  iq: 10, // Iraq
  ir: 10, // Iran
  is: [7, 9], // Iceland
  it: [9, 10], // Italy
  je: 10, // Jersey
  jm: 10, // Jamaica
  jo: 9, // Jordan
  jp: 10, // Japan
  ke: 9, // Kenya
  kg: 9, // Kyrgyzstan
  kh: [8, 9], // Cambodia
  ki: 8, // Kiribati
  km: 7, // Comoros
  kn: 10, // St. Kitts & Nevis
  kp: 10, // North Korea
  kr: [9, 10], // South Korea
  kw: 8, // Kuwait
  ky: 10, // Cayman Islands
  kz: 10, // Kazakhstan
  la: [9, 10], // Laos
  lb: [7, 8], // Lebanon
  lc: 10, // St. Lucia
  li: [7, 9], // Liechtenstein
  lk: 9, // Sri Lanka
  lr: [7, 9], // Liberia
  ls: 8, // Lesotho
  lt: 8, // Lithuania
  lu: 9, // Luxembourg
  lv: 8, // Latvia
  ly: 9, // Libya
  ma: 9, // Morocco
  mc: [8, 9], // Monaco
  md: 8, // Moldova
  me: 8, // Montenegro
  mf: 9, // St. Martin
  mg: 9, // Madagascar
  mh: 7, // Marshall Islands
  mk: 8, // North Macedonia
  ml: 8, // Mali
  mm: [7, 8, 9, 10], // Myanmar (Burma)
  mn: 8, // Mongolia
  mo: 8, // Macao SAR China
  mp: 10, // Northern Mariana Islands
  mq: 9, // Martinique
  mr: 8, // Mauritania
  ms: 10, // Montserrat
  mt: 8, // Malta
  mu: 8, // Mauritius
  mv: 7, // Maldives
  mw: 9, // Malawi
  mx: 10, // Mexico
  my: [9, 10], // Malaysia
  mz: 9, // Mozambique
  na: 9, // Namibia
  nc: 6, // New Caledonia
  ne: 8, // Niger
  nf: 6, // Norfolk Island
  ng: 10, // Nigeria
  ni: 8, // Nicaragua
  nl: [9, 11], // Netherlands
  no: 8, // Norway
  np: 10, // Nepal
  nr: 7, // Nauru
  nu: [4, 7], // Niue
  nz: [8, 9, 10], // New Zealand
  om: 8, // Oman
  pa: [7, 8], // Panama
  pe: 9, // Peru
  pf: 8, // French Polynesia
  pg: 8, // Papua New Guinea
  ph: 10, // Philippines
  pk: 10, // Pakistan
  pl: 9, // Poland
  pm: [6, 9], // St. Pierre & Miquelon
  pr: 10, // Puerto Rico
  ps: 9, // Palestinian Territories
  pt: 9, // Portugal
  pw: 7, // Palau
  py: 9, // Paraguay
  qa: 8, // Qatar
  re: 9, // Réunion
  ro: 9, // Romania
  rs: [8, 9, 10], // Serbia
  ru: 10, // Russia
  rw: 9, // Rwanda
  sa: 9, // Saudi Arabia
  sb: [5, 7], // Solomon Islands
  sc: 7, // Seychelles
  sd: 9, // Sudan
  se: 9, // Sweden
  sg: 8, // Singapore
  sh: 5, // St. Helena
  si: 8, // Slovenia
  sj: 8, // Svalbard & Jan Mayen
  sk: 9, // Slovakia
  sl: 8, // Sierra Leone
  sm: 8, // San Marino
  sn: 9, // Senegal
  so: [7, 8, 9], // Somalia
  sr: 7, // Suriname
  ss: 9, // South Sudan
  st: 7, // São Tomé & Príncipe
  sv: 8, // El Salvador
  sx: 10, // Sint Maarten
  sy: 9, // Syria
  sz: 8, // Eswatini
  ta: 4, // Tristan da Cunha
  tc: 10, // Turks & Caicos Islands
  td: 8, // Chad
  tg: 8, // Togo
  th: 9, // Thailand
  tj: 9, // Tajikistan
  tk: [4, 5, 6, 7], // Tokelau
  tl: 8, // Timor-Leste
  tm: 8, // Turkmenistan
  tn: 8, // Tunisia
  to: 7, // Tonga
  tr: 10, // Türkiye
  tt: 10, // Trinidad & Tobago
  tv: [6, 7], // Tuvalu
  tw: 9, // Taiwan
  tz: 9, // Tanzania
  ua: 9, // Ukraine
  ug: 9, // Uganda
  us: 10, // United States
  uy: 8, // Uruguay
  uz: 9, // Uzbekistan
  va: [9, 10], // Vatican City
  vc: 10, // St. Vincent & Grenadines
  ve: 10, // Venezuela
  vg: 10, // British Virgin Islands
  vi: 10, // U.S. Virgin Islands
  vn: 9, // Vietnam
  vu: 7, // Vanuatu
  wf: 6, // Wallis & Futuna
  ws: [7, 10], // Samoa
  xk: 8, // Kosovo
  ye: 9, // Yemen
  yt: 9, // Mayotte
  za: [9], // South Africa
  zm: 9, // Zambia
  zw: 9, // Zimbabwe
};

export const getExpectedPhoneLength = (countryCode, mobileNumber = "") => {
  console.log("countryCode", countryCode);

  if (!countryCode) return null;
  const iso = countryCode.toLowerCase();
  const countryObj = defaultCountries.find((c) => parseCountry(c).iso2 === iso);
  if (!countryObj) return null;

  const parsed = parseCountry(countryObj);
  if (parsed.format) {
    let formatStr = "";
    if (typeof parsed.format === "string") {
      formatStr = parsed.format;
    } else if (typeof parsed.format === "object") {
      const keys = Object.keys(parsed.format).filter((k) => k !== "default");
      let matchedKey = null;
      for (const key of keys) {
        try {
          const pattern = key.replace(/^\/|\/$/g, "");
          const regex = new RegExp(pattern);
          if (regex.test(mobileNumber)) {
            matchedKey = key;
            break;
          }
        } catch (e) {
          // ignore invalid regex
        }
      }
      formatStr = matchedKey
        ? parsed.format[matchedKey]
        : parsed.format.default;
    }

    if (typeof formatStr === "string") {
      return (formatStr.match(/\./g) || []).length;
    }
  }

  // Fallback to our compiled map if format is undefined
  if (countryLengthFallback[iso]) {
    return countryLengthFallback[iso];
  }

  return null;
};

export const mobileValidator = (mobile, countryCode) => {
  let error = "";

  if (!mobile || mobile.length <= 0) error = " is required";
  else if (!mobileRegex.test(mobile)) error = " is not valid";
  else if (countryCode) {
    const iso = countryCode.toLowerCase();
    const expectedLength = getExpectedPhoneLength(countryCode, mobile);
    const fallback = countryLengthFallback[iso];

    let validLengths = null;
    if (fallback !== undefined) {
      validLengths = Array.isArray(fallback) ? fallback : [fallback];
    } else if (expectedLength !== null) {
      validLengths = Array.isArray(expectedLength)
        ? expectedLength
        : [expectedLength];
    }

    if (validLengths) {
      if (!validLengths.includes(mobile.length)) {
        error = ` must be ${validLengths.join(" or ")} digits`;
      }
    } else if (mobile.length < 8) {
      error = " is not valid";
    }
  } else if (mobile.length < 8) {
    error = " is not valid";
  }
  return error;
};

export const urlValidator = (url) => {
  let error = "";

  if (!url || url.length <= 0) error = " is required";
  else if (!urlRegex.test(url) || url.length < 3) error = " is not valid";
  return error;
};

export const breakTimeValidator = (min) => {
  let error = "";

  if (!min || min.length <= 0) error = " is required";
  else if (!mobileRegex.test(min)) error = " is not valid";
  return error;
};

export const addressValidator = (address) => {
  let error = "";

  if (!address || address.length <= 0) error = " is required";
  else if (address.length <= 2) error = " is not valid";

  return error;
};

export const endTimeValidator = (endtime, starttime) => {
  let error = "";

  if (!endtime || endtime.length <= 0) error = " is required";
  // Validation: End time should not be less than start time
  else if (starttime && endtime < starttime)
    error = " must be after start time";

  return error;
};

export const confirmPasswordValidator = (password, confirmPassword) => {
  let error = "";

  if (!confirmPassword || confirmPassword.length <= 0) error = " is required";
  // Validation: End time should not be less than start time
  else if (password != confirmPassword) error = " does not match";

  return error;
};

export const addAppandUrlTime = (time1, time2) => {
  // Split the time values into hours and minutes
  const [hours1, minutes1] = time1.split(":");
  const [hours2, minutes2] = time2.split(":");

  // Convert the time values to minutes
  const totalMinutes1 = parseInt(hours1) * 60 + parseInt(minutes1);
  const totalMinutes2 = parseInt(hours2) * 60 + parseInt(minutes2);

  // Add the total minutes
  const totalMinutes = totalMinutes1 + totalMinutes2;

  // Convert the total minutes back to hours and minutes
  const resultHours = Math.floor(totalMinutes / 60);
  const resultMinutes = totalMinutes % 60;

  // Format the result
  return `${resultHours}h:${resultMinutes.toString().padStart(2, "0")}m`;
};

export const checkMatchingwithCurrentDate = (date) => {
  const today = new Date();
  const givenDate = new Date(date);

  if (
    givenDate.getFullYear() === today.getFullYear() &&
    givenDate.getMonth() === today.getMonth() &&
    givenDate.getDate() === today.getDate()
  ) {
    return true;
  } else {
    return false;
  }
};

const formatDate = (date) => {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  // Ensure month and day are two digits
  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }

  return `${year}-${month}-${day}`;
};

export const getCurrentandPreviousweekDate = () => {
  const currentDate = new Date();

  // Calculate previous week date (subtract 7 days)
  const previousWeekDate = new Date(currentDate);
  previousWeekDate.setDate(previousWeekDate.getDate() - 6);

  // Format dates
  const formattedCurrentDate = formatDate(currentDate);
  const formattedPreviousWeekDate = formatDate(previousWeekDate);

  let dates = [];
  dates.push(formattedPreviousWeekDate, formattedCurrentDate);
  return dates;
};

export const getCurrentandLast90Date = () => {
  const currentDate = new Date();

  // Calculate previous week date (subtract 7 days)
  const previousWeekDate = new Date(currentDate);
  previousWeekDate.setDate(previousWeekDate.getDate() - 89);

  // Format dates
  const formattedCurrentDate = formatDate(currentDate);
  const formattedPreviousWeekDate = formatDate(previousWeekDate);

  let dates = [];
  dates.push(formattedPreviousWeekDate, formattedCurrentDate);
  return dates;
};

export const parseTimeToDecimal = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours + minutes / 60 + seconds / 3600;
};

export const formatToBackendIST = (date) => {
  const istDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );

  const pad = (n) => String(n).padStart(2, "0");

  const year = istDate.getFullYear();
  const month = pad(istDate.getMonth() + 1);
  const day = pad(istDate.getDate());
  const hours = pad(istDate.getHours());
  const minutes = pad(istDate.getMinutes());
  const seconds = pad(istDate.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const priceCategory = (fees) => {
  if (fees <= 18999) {
    return "Bronze";
  } else if (fees <= 28999) {
    return "Silver";
  } else if (fees <= 38999) {
    return "Gold";
  } else {
    return "Diamond";
  }
};

export const shortRelativeTime = (date) => {
  const diffSeconds = moment().diff(
    moment(date, "YYYY-MM-DD HH:mm:ss"),
    "seconds",
  );

  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
};

export const priceValidator = (price, totalprice, isCommecial = false) => {
  let error = "";

  if (!price || price.length <= 0) error = " is required";
  else if (price > totalprice)
    error = ` is > ${isCommecial == true ? "Commercial" : "total amount"}`;

  return error;
};

export const discountValidator = (discount) => {
  let error = "";

  if (discount > 99) error = " must be less than 100";

  return error;
};

export const getBalanceAmount = (totalAmount, paidAmount) => {
  let result = totalAmount - paidAmount;
  return parseFloat(result.toFixed(2)); // keeps 2 decimals
};

export const calculateAmount = (price, gst = 0) => {
  if (typeof price !== "number" || price < 0) {
    throw new Error("Price must be a positive number");
  }

  let finalPrice = price;

  // Apply GST if given
  if (gst > 0) {
    finalPrice += (finalPrice * gst) / 100;
  }

  return parseFloat(finalPrice.toFixed(2)); // keep 2 decimals
};

export const getConvenienceFees = (totalAmount) => {
  console.log(typeof totalAmount, totalAmount);
  const value = parseFloat(totalAmount);
  // Calculate 3% of the amount
  const fees = (value * 3) / 100;

  // Round to 2 decimals
  return parseFloat(fees.toFixed(2));
};

export const accountNumberValidator = (accountnumber) => {
  let error = "";

  if (!accountnumber || accountnumber.length <= 0) error = " is required";
  else if (
    !mobileRegex.test(accountnumber) ||
    accountnumber.length < 9 ||
    accountnumber.length > 18
  )
    error = " is not valid";
  return error;
};

export const ifscValidator = (ifsc) => {
  let error = "";

  if (!ifsc || ifsc.length <= 0) error = " is required";
  else if (!ifscRegex.test(ifsc)) error = " is not valid";
  return error;
};

export const percentageValidator = (percent) => {
  let error = "";

  if (percent === "" || percent === null || isNaN(percent))
    error = " is required";
  else if (percent > 100) error = " must be 100 or less";
  return error;
};

// Reusable debounce function
export const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

export const capitalizeWords = (text) => {
  return text
    .split(" ")
    .map((word) =>
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : "",
    )
    .join(" ");
};

export const getCountryFromDialCode = (dialCode) => {
  if (!dialCode) return "in"; // default to India if empty

  // Remove '+' if present
  const code = dialCode.startsWith("+") ? dialCode.slice(1) : dialCode;

  // Find all countries matching this dial code
  const countries = defaultCountries.filter(
    (c) => parseCountry(c).dialCode === code,
  );

  // Return first ISO code if found, otherwise default "in"
  return countries.length > 0 ? parseCountry(countries[0]).iso2 : "in";
};

export const getRangeLabel = (startDate, endDate) => {
  const today = dayjs();
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // Helper to check if two dates are the same day
  const isSame = (d1, d2) => d1.isSame(d2, "day");

  // Compare with predefined ranges
  if (isSame(start, today) && isSame(end, today)) return "Today";
  if (
    isSame(start, today.subtract(1, "day")) &&
    isSame(end, today.subtract(1, "day"))
  )
    return "Yesterday";

  if (isSame(start, today.subtract(6, "day")) && isSame(end, today))
    return "7 Days";
  if (isSame(start, today.subtract(14, "day")) && isSame(end, today))
    return "15 Days";
  if (isSame(start, today.subtract(29, "day")) && isSame(end, today))
    return "30 Days";
  if (isSame(start, today.subtract(59, "day")) && isSame(end, today))
    return "60 Days";
  if (isSame(start, today.subtract(89, "day")) && isSame(end, today))
    return "90 Days";

  return null;
};

export const isWithin30Days = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // difference in milliseconds
  const diffMs = end - start;

  // convert ms → days
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= 30;
};

export const getDatesFromRangeLabel = (label) => {
  const today = dayjs();
  let start_date, end_date;

  switch (label.toLowerCase()) {
    case "today":
      start_date = today;
      end_date = today;
      break;

    case "yesterday":
      start_date = today.subtract(1, "day");
      end_date = today.subtract(1, "day");
      break;

    case "one month": {
      const todayDate = today.date();

      if (todayDate <= 25) {
        start_date = today.subtract(1, "month").date(26);
        end_date = today.date(25);
      } else {
        start_date = today.date(26);
        end_date = today.add(1, "month").date(25);
      }
      break;
    }

    case "7 days":
    case "last7days":
      start_date = today.subtract(6, "day");
      end_date = today;
      break;

    case "15 days":
    case "last15days":
      start_date = today.subtract(14, "day");
      end_date = today;
      break;

    case "30 days":
    case "last30days":
      start_date = today.subtract(29, "day");
      end_date = today;
      break;

    case "60 days":
    case "last60days":
      start_date = today.subtract(59, "day");
      end_date = today;
      break;

    case "90 days":
    case "last90days":
      start_date = today.subtract(89, "day");
      end_date = today;
      break;

    default:
      return null; // for "Custom" or unsupported labels
  }

  return {
    card_settings: {
      start_date: start_date.format("YYYY-MM-DD"),
      end_date: end_date.format("YYYY-MM-DD"),
    },
  };
};

/** Billing month range (26th → 25th), same as CommonMuiCustomDatePicker "This Month". */
export const getThisMonthDateRange = () => {
  const range = getDatesFromRangeLabel("One Month");
  if (!range?.card_settings) {
    return getCurrentandPreviousweekDate();
  }
  return [range.card_settings.start_date, range.card_settings.end_date];
};

export const getLast3Months = () => {
  const end = dayjs(); // current month
  const start = end.subtract(2, "month"); // last 3 months range

  return [start.format("YYYY-MM"), end.format("YYYY-MM")];
};

export const customizeStartDateAndEndDate = (months) => {
  const start = dayjs(months[0]);
  const end = dayjs(months[1]);

  const startDate = start.subtract(1, "month").date(26).format("YYYY-MM-DD");

  const endDate = end.date(25).format("YYYY-MM-DD");

  return [startDate, endDate];
};

export const getActiveTargetMonthRange = () => {
  const today = dayjs();

  const currentMonth = today.startOf("month");
  const nextMonth = today.add(1, "month").startOf("month");

  // After 26th select next month
  const activeMonth = today.date() >= 26 ? nextMonth : currentMonth;

  const month = activeMonth.format("MMMM - YYYY");

  const [monthName, year] = month.split(" - ");
  const selectedMonth = moment(`${monthName} ${year}`, "MMMM YYYY");

  const startDate = selectedMonth
    .clone()
    .subtract(1, "month")
    .date(26)
    .format("YYYY-MM-DD");

  const endDate = selectedMonth.clone().date(25).format("YYYY-MM-DD");

  return {
    month,
    startDate,
    endDate,
  };
};

export const validateConvenienceFee = (payAmount, convenienceFees) => {
  let error = "";

  const threePercent = (payAmount * 3) / 100;

  if (convenienceFees == threePercent) {
    error = "";
  } else {
    error = " is mismatch";
  }
  return error;
};

export const calculateThreePercentAmount = (payAmount) => {
  let error = "";

  const threePercent = (payAmount * 3) / 100;
  return threePercent;
};

export const formatAddress = (value) => {
  if (!value) return value;

  return value
    .split(",")
    .map((part) =>
      part
        .split(" ")
        .map((word) => {
          if (!word) return "";

          word = word.replace(
            /(\d+)([a-zA-Z])/g,
            (_, num, char) => num + char.toUpperCase(),
          );

          if (/^\d+$/.test(word)) return word;

          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" "),
    )
    .join(", ");
};

export const customersStatusDisplay = (record) => {
  if (record.is_second_due === 1) {
    return "Payment Verify";
  }

  if (record.is_last_pay_rejected === 1) {
    return "Payment Rejected";
  }

  if (record.status === "Awaiting Finance") {
    return "Payment Verify";
  }

  return record.status || "";
};
