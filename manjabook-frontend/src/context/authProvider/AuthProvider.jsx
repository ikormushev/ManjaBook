import {createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext(null);

const apiCheckStatus = import.meta.env.VITE_VERIFY_BACKEND_URL;


export default function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        username: "",
        userID: "",
        loading: true
    });

    useEffect(() => {
        const checkAuthStatus = async () => {
          try {
              const response = await fetch(apiCheckStatus, {
                  method: "GET",
                  credentials: "include", // later - same-origin
              });

              if (response.ok) {
                  const data = await response.json();

                  setAuthState({
                      isAuthenticated: data["Authenticated"],
                      username: data.username,
                      userID: data.user_id,
                      loading: false
                  });
              } else {
                  setAuthState({
                      isAuthenticated: false,
                      username: "",
                      userID: "",
                      loading: false
                  });
              }
          }  catch (e) {
              setAuthState({
                  isAuthenticated: false,
                  username: "",
                  userID: "",
                  loading: false
              });
          }
        };

        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ authState, setAuthState}}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}