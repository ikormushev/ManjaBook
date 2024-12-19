const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const API_ENDPOINTS = {
    login: import.meta.env.VITE_LOGIN_BACKEND_URL,
    logout: import.meta.env.VITE_LOGOUT_BACKEND_URL,
    register: import.meta.env.VITE_REGISTER_BACKEND_URL,
    verifyStatus: import.meta.env.VITE_VERIFY_BACKEND_URL,
    products: `${API_BASE_URL}/products/`,
    profiles: `${API_BASE_URL}/profiles/`,
    recipes: `${API_BASE_URL}/recipes/`,
    units: `${API_BASE_URL}/units/`,
    shops: `${API_BASE_URL}/shops/`,
    customUnits: `${API_BASE_URL}/custom-units/`,
    recipesCollections: `${API_BASE_URL}/recipes-collections/`,
    recipesProducts: `${API_BASE_URL}/recipes-products/`,
};

export default API_ENDPOINTS;
