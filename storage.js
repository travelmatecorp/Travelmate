import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key, value) => {
  try {
    if (value == null) {  // Verifica si el valor es null o undefined
      console.error("Cannot store null or undefined values.");
      return false;
    }

    // Si el valor no es un string, lo convertimos en JSON stringificado
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (e) {
    console.error('Error storing data:', e);
    return false;
  }
};

export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      try {
        return JSON.parse(value);
      } catch {
        return value; // Return as string if not JSON
      }
    }
    return null;
  } catch (e) {
    console.error('Error retrieving data:', e);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error('Error removing data:', e);
    return false;
  }
};
