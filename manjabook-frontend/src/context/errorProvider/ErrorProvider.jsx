import { createContext, useContext, useState } from 'react';

const ErrorContext = createContext(null);

export default function ErrorProvider({ children }) {
    const [error, setError] = useState("");

    const clearError = () => setError("");

    return (
        <ErrorContext.Provider value={{ error, setError, clearError }}>
            {children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    return useContext(ErrorContext);
}