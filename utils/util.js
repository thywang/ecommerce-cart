/**
 * Build response to return.
 *
 */
function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

/**
 * Generate epoch timestamp for number days in future.
 *
 * @returns {Number}
 */
function generateTTL(days = 1) {
  return Math.floor(addDays(days) / 1000);
}

/**
 * Returns a date instance with added `days`.
 *
 * @param {Number} days - the number of days to add
 * @param {Date} date - the date adding the given `days`
 *
 * @returns {Date}
 */
function addDays(days, date = new Date()) {
  date.setDate(date.getDate() + days);

  return date;
}

// https://stackoverflow.com/a/37826698/3221253
function chunks(inputArray, perChunk) {
  return inputArray.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk);
    all[ch] = [].concat(all[ch] || [], one);
    return all;
  }, []);
}

module.exports = { buildResponse, generateTTL, chunks };
