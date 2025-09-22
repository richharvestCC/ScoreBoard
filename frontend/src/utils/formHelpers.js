/**
 * Remove empty string fields from an object
 * @param {Object} data - The object to clean
 * @returns {Object} - Object with empty string fields removed
 */
export const removeEmptyFields = (data) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
};