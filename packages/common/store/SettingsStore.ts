export const INIT_DATA_KEY = "INIT_DATA";

export const get = (key: string) => {
  return localStorage.getItem(key);
};

export const getJSON = (key: string) => {
  const res = localStorage.getItem(key);
  if (!res) {
    return;
  }
  try {
    return JSON.parse(res);
  } catch (e) {
    console.warn(`error parsing json: ${e.mesage} | ${key} | ${res}`);
    return null;
  }
};

export const set = (key: string, value: string) => {
  return localStorage.setItem(key, value);
};

export const setJSON = (key: string, value: any) => {
  return set(key, JSON.stringify(value));
};

export const clear = () => {
  localStorage.clear();
};
