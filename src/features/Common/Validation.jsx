const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
const descriptionRegex = /^(?!\s*$).+/;
const emailRegex = /^[a-zA-Z0-9._-]{2,}@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
const mobileRegex = /^[0-9]+$/;
const domainRegex =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:[a-zA-Z]{2,})$/;
const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?$/i;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

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

export const mobileValidator = (mobile) => {
  let error = "";

  if (!mobile || mobile.length <= 0) error = " is required";
  else if (
    !mobileRegex.test(mobile) ||
    mobile.length < 10 ||
    mobile.length > 10
  )
    error = " is not valid";
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

export const parseTimeToDecimal = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours + minutes / 60 + seconds / 3600;
};

export const formatToBackendIST = (date) => {
  const istDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
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
    "seconds"
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

export const priceValidator = (price, totalprice) => {
  let error = "";

  if (!price || price.length <= 0) error = " is required";
  else if (price > totalprice) error = " must be below or equal to amount";

  return error;
};

export const discountValidator = (discount) => {
  let error = "";

  if (discount > 99) error = " must be less than 100";

  return error;
};

export const calculateAmount = (price, discount = 0, gst = 0) => {
  if (typeof price !== "number" || price < 0) {
    throw new Error("Price must be a positive number");
  }

  let finalPrice = price;

  // Apply discount if given (percentage)
  if (discount > 0) {
    finalPrice -= (finalPrice * discount) / 100;
  }

  // Apply GST if given
  if (gst > 0) {
    finalPrice += (finalPrice * gst) / 100;
  }

  return parseFloat(finalPrice.toFixed(2)); // round to 2 decimals
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
