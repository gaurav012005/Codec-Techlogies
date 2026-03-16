import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock user data for development
const MOCK_USERS = {
    admin: {
        id: '1',
        name: 'Dr. Rajesh Kumar',
        email: 'admin@examplatform.com',
        role: 'ADMIN',
        avatar: null,
        createdAt: '2026-01-15',
    },
    examiner: {
        id: '2',
        name: 'Prof. Priya Sharma',
        email: 'examiner@examplatform.com',
        role: 'EXAMINER',
        avatar: null,
        createdAt: '2026-01-20',
    },
    student: {
        id: '3',
        name: 'Amit Verma',
        email: 'student@examplatform.com',
        role: 'STUDENT',
        avatar: null,
        createdAt: '2026-02-01',
    },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('exam_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Mock login for development
        await new Promise(resolve => setTimeout(resolve, 800));

        let mockUser = null;
        if (email.includes('admin')) mockUser = MOCK_USERS.admin;
        else if (email.includes('examiner')) mockUser = MOCK_USERS.examiner;
        else mockUser = MOCK_USERS.student;

        setUser(mockUser);
        localStorage.setItem('exam_user', JSON.stringify(mockUser));
        return mockUser;
    };

    const register = async (name, email, password) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            role: 'STUDENT',
            avatar: null,
            createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        localStorage.setItem('exam_user', JSON.stringify(newUser));
        return newUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('exam_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
