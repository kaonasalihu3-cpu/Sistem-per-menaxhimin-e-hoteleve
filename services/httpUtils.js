export function cleanQueryParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
}

export function extractData(response, fallback = null) {
  return response?.data?.data ?? fallback;
}
