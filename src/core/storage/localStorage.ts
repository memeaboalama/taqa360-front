// Local Storage Service
// A wrapper around browser's localStorage for easy access.

export const storage = {
  get: (key: string) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  },
  remove: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  },
};
