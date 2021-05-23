export function localStorageGet(key) {
    return localStorage.getItem(key);
}

export function localStorageDelete(key) {
    localStorage.removeItem(key);
}

export function localStoragePut(key, value) {
    localStorage.setItem(key, value);
}

export const USER_ID = 'USER_ID';
export const USER_NAME = 'USER_NAME';