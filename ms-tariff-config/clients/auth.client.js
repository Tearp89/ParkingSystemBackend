const axios = require('axios'); 
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://ms-user-auth:3002/api/v1/auth';

exports.verifyToken = async (token) => {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/verify`, { token });
        return response.data.payload;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error de comunicación con MS-AUTH.');
    }
};