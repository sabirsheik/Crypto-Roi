import moment from "moment-timezone";

export const toUKTime = (date) => {
  if (!date) return "";
  return moment(date)
    .tz("Europe/London")   // UK timezone conversion (DST ke sath)
    .format("YYYY-MM-DD HH:mm:ss");
};
