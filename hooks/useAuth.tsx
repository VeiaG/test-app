import { User } from '@/types';
import * as SecureStore from 'expo-secure-store';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { AUTH_TOKEN_KEY, PAYLOAD_API_URL } from '../config/api';
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string,
        fullName: string,
        phone: string,
    ) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps {
    children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const fetchCurrentUser = useCallback(async (currentToken: string) => {
        console.log('Fetching current user with token...');
        try {
            const response = await fetch(`${PAYLOAD_API_URL}/users/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('/me returned 401, likely invalid token or cookie.');
                     await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
                     setToken(null);
                     setUser(null);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Error fetching /me:', response.status, errorData);
                    throw new Error(`Failed to fetch user data: ${response.status}`);
                }
                 return;
            }
            const userData: { user: User } = await response.json();
             if (userData.user) {
                console.log('User data received:', userData.user);
                 setUser(userData.user);
                 setToken(currentToken);
             } else {
                 console.warn('/me response did not contain user object');
                 await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
                 setToken(null);
                 setUser(null);
             }
        } catch (error) {
            console.error('Error in fetchCurrentUser:', error);
             await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
             setToken(null);
             setUser(null);
        }
    }, []);
    useEffect(() => {
        const bootstrapAsync = async () => {
            setIsLoading(true);
            let userToken: string | null = null;
            try {
                userToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
                if (userToken) {
                    console.log('Token found in storage:', userToken);
                    await fetchCurrentUser(userToken);
                } else {
                    console.log('No token found in storage.');
                    setUser(null);
                    setToken(null);
                }
            } catch (e) {
                console.error('Error restoring token:', e);
                setUser(null);
                setToken(null);
            } finally {
                 setIsLoading(false);
                 console.log('Auth bootstrap finished. Loading:', false, 'User:', user, 'Token:', token);
            }
        };
        bootstrapAsync();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchCurrentUser]);
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            console.log('Attempting login...');
            const response = await fetch(`${PAYLOAD_API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('Login failed:', response.status, data);
                const errorMessage = data?.errors?.[0]?.message || data?.message || `Login failed (${response.status})`;
                throw new Error(errorMessage);
            }
            console.log('Login successful:', data);
            const receivedToken = data.token;
            const currentUser = data.user as User;
            if (!currentUser) {
                 throw new Error('User data not found in login response.');
            }
            setUser(currentUser);
            const tokenToStore = receivedToken || 'session_active';
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, tokenToStore);
            setToken(tokenToStore);
        } catch (error: any) {
            console.error('Error during login:', error);
            setUser(null);
            setToken(null);
             await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    const register = async (email: string, password: string,fullName:string,phone:string) => {
        setIsLoading(true);
        try {
            console.log('Attempting registration...');
            const response = await fetch(`${PAYLOAD_API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    fullName,
                    phone,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('Registration failed:', response.status, data);
                const errorMessage = data?.errors?.[0]?.message || data?.message || `Registration failed (${response.status})`;
                throw new Error(errorMessage);
            }
            console.log('Registration successful:', data);
        } catch (error: any) {
            console.error('Error during registration:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    const logout = async () => {
        setIsLoading(true);
        try {
            console.log('Attempting logout...');
            const response = await fetch(`${PAYLOAD_API_URL}/users/logout`, {
                method: 'POST',
                headers: {
                     'Content-Type': 'application/json',
                },
            });
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 console.warn('Logout request failed:', response.status, errorData);
             } else {
                 console.log('Logout request successful');
             }
        } catch (error) {
            console.error('Error during logout request (ignored):', error);
        } finally {
            setUser(null);
            setToken(null);
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
            setIsLoading(false);
            console.log('Local state cleared for logout.');
        }
    };
    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        register,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
