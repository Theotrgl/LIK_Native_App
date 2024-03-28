import { AsyncStorage } from 'react-native';

const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem('authToken', token);
        console.log('Token stored successfully');
    } catch (error) {
        console.error('Error storing token:', error);
    }
};

export const retrieveToken = async () => {
try {
    const token = await AsyncStorage.getItem('authToken');
    if (token !== null) {
    // Token found, use it for authentication
    return token;
    } else {
    // Token not found, handle accordingly
    return null;
    }
} catch (error) {
    console.error('Error retrieving token:', error);
    return null;
}
};

const removeToken = async () => {
try {
    await AsyncStorage.removeItem('authToken');
    console.log('Token removed successfully');
} catch (error) {
    console.error('Error removing token:', error);
}
};
  