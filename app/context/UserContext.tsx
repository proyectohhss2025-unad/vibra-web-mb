import React, { createContext, ReactNode, useContext, useState } from 'react';

interface User {
    [key: string]: any;
}

interface UserContextType {
    user: User;
    setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>({});
    const value = React.useMemo(() => ({ user, setUser }), [user, setUser]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default useUser;