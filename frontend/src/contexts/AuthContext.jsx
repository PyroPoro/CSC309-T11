import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// In Vite, environment variables are accessed via import.meta.env
// Make sure your .env file has VITE_BACKEND_URL=http://localhost:3000
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Initialize user state. null means no user is logged in.
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Retrieve token from localStorage and fetch the user profile
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setUser(null);
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/user/me`, {
                    method: "GET",
                    headers: {
                        // 👇 Add 'Bearer ' before the token
                        "authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    // Token is invalid or expired
                    localStorage.removeItem("token");
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile".
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string|undefined} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Return the error message from the backend (e.g., "Invalid credentials")
                return data.message || "Login failed";
            }

            // Save the token to local storage
            localStorage.setItem("token", data.token);

            // Fetch the user's profile immediately so state is updated
            const profileRes = await fetch(`${BACKEND_URL}/user/me`, {
                method: "GET",
                headers: {
                    // 👇 Add 'Bearer ' before the token here too
                    "authorization": `Bearer ${data.token}`
                }
            });

            // if (profileRes.ok) {
            //     const profileData = await profileRes.json();
            //     setUser(profileData.user);
            //     navigate("/profile");
            // } else {
            //     return "Failed to retrieve user profile after login";
            // }
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setUser(profileData.user);
                navigate("/profile");
            } else {
                // 👇 ADD THESE LINES TO DEBUG 👇
                const errorData = await profileRes.json();
                console.error("Backend rejected the token! Status:", profileRes.status);
                console.error("Error message from backend:", errorData);

                return `Backend Error: ${errorData.message || 'Unknown error'}`;
            }

        } catch (error) {
            console.log("VITE_BACKEND_URL: " + BACKEND_URL);
            console.error("Login error:", error);
            return "A network error occurred during login";
        }
    };

    /**
     * Registers a new user.
     * * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string|undefined} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Return the error message from the backend (e.g., "User Name already exists")
                return data.message || "Registration failed";
            }

            // Registration successful, navigate to login/home
            navigate("/");

        } catch (error) {
            console.error("Registration error:", error);
            return "A network error occurred during registration";
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};