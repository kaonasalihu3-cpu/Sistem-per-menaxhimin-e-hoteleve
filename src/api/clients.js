import axios from 'axios';

const apiClient =axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
         error?.response?.data?.message ||
         error?.response?.data?.errors?.[0] ||
         error?.message ||
         'An error occurred while processing your request.';

        return Promise.reject(new Error(message));
    }
);

export default apiClient;