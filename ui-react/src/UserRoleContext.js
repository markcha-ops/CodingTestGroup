import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const UserRoleContext = createContext();

// Helper function to get a cookie by name
const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return null;
};

export const UserRoleProvider = ({ children }) => {
    const [isManager, setIsManager] = useState(false);
    
    useEffect(() => {
        console.log("UserRoleProvider mounted - checking manager status");
        
        const checkUserRole = () => {
            try {
                // Get token from cookie instead of localStorage
                const token = getCookie('accessToken');
                if (token) {
                    console.log("🔑 Token found in cookies");
                    const decoded = jwtDecode(token);
                    console.log("🔍 JWT decoded contents:", decoded);
                    console.log("👤 relationType value:", decoded.relationType);
                    
                    // Make the check more robust
                    let relationTypeValue = decoded.relationType;
                    
                    // Check if it's in type field instead (for legacy compatibility)
                    if (!relationTypeValue && decoded.type) {
                        relationTypeValue = decoded.type;
                        console.log("Using 'type' field instead:", relationTypeValue);
                    }
                    
                    // If it's an object with a value property, extract it
                    if (relationTypeValue && typeof relationTypeValue === 'object' && relationTypeValue.value) {
                        relationTypeValue = relationTypeValue.value;
                        console.log("Extracted value from object:", relationTypeValue);
                    }
                    
                    // Check variations of MANAGES_TYPE
                    const managesTypeVariations = ['MANAGES_TYPE', 'manages_type', 'MANAGES', 'manages'];
                    const hasManagerRole = managesTypeVariations.some(variation => 
                        relationTypeValue === variation || 
                        (typeof relationTypeValue === 'string' && 
                        relationTypeValue.toUpperCase() === variation.toUpperCase())
                    );
                    
                    console.log("✅ Is manager role:", hasManagerRole);
                    console.log("Previous isManager state:", isManager);
                    
                    // Force set the state to ensure it updates
                    setIsManager(!!hasManagerRole);
                } else {
                    // Also try localStorage as fallback
                    const localToken = localStorage.getItem('token');
                    if (localToken) {
                        console.log("🔑 Token found in localStorage (fallback)");
                        const decoded = jwtDecode(localToken);
                        // Same logic as above
                        let relationTypeValue = decoded.relationType;
                        
                        if (!relationTypeValue && decoded.type) {
                            relationTypeValue = decoded.type;
                        }
                        
                        if (relationTypeValue && typeof relationTypeValue === 'object' && relationTypeValue.value) {
                            relationTypeValue = relationTypeValue.value;
                        }
                        
                        const managesTypeVariations = ['MANAGES_TYPE', 'manages_type', 'MANAGES', 'manages'];
                        const hasManagerRole = managesTypeVariations.some(variation => 
                            relationTypeValue === variation || 
                            (typeof relationTypeValue === 'string' && 
                            relationTypeValue.toUpperCase() === variation.toUpperCase())
                        );
                        
                        setIsManager(!!hasManagerRole);
                    } else {
                        console.log("❌ No token found in cookies or localStorage");
                        setIsManager(false);
                    }
                }
            } catch (error) {
                console.error('❌ JWT 디코딩 오류:', error);
                setIsManager(false);
            }
        };
        
        // Check on mount
        checkUserRole();
        
        // Setup event listener for token changes
        const tokenCheckInterval = setInterval(() => {
            console.log("Periodic token check");
            checkUserRole();
        }, 2000); // Check every 2 seconds for testing
        
        // Cleanup interval on unmount
        return () => {
            console.log("UserRoleProvider unmounting");
            clearInterval(tokenCheckInterval);
        };
    }, []);
    
    console.log("UserRoleProvider rendering with isManager =", isManager);
    
    return (
        <UserRoleContext.Provider value={{ isManager }}>
            {children}
        </UserRoleContext.Provider>
    );
};

export const useUserRole = () => {
    const context = useContext(UserRoleContext);
    if (!context) {
        throw new Error("useUserRole must be used within a UserRoleProvider");
    }
    return context;
}; 