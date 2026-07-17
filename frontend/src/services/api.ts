import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const reportFire = async (formData: FormData) => {
  const response = await axios.post(`${API_BASE_URL}/incidents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getIncidents = async () => {
  const response = await axios.get(`${API_BASE_URL}/incidents`);
  return response.data;
};

export const getWeatherRisk = async (weatherData: any) => {
  const response = await axios.post(`${API_BASE_URL}/weather/risk`, weatherData);
  return response.data;
};
