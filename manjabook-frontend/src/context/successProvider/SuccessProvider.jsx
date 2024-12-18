import { createContext, useContext, useState } from 'react';

const SuccessContext = createContext(null);

export default function SuccessProvider({ children }) {
    const [success, setSuccess] = useState("");

    const clearSuccess = () => setSuccess("");

    return (
        <SuccessContext.Provider value={{ success, setSuccess, clearSuccess }}>
            {children}
        </SuccessContext.Provider>
    );
}

export function useSuccess() {
    return useContext(SuccessContext);
}