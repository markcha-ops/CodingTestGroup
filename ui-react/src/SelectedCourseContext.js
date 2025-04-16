import React, { createContext, useContext, useState } from "react";

const SelectedCourseContext = createContext();

export const SelectedCourseProvider = ({ children }) => {
    const [selectedCourse, setSelectedCourse] = useState("");
    return (
        <SelectedCourseContext.Provider value={{ selectedCourse, setSelectedCourse }}>
            {children}
        </SelectedCourseContext.Provider>
    );
};

export const useSelectedCourse = () => {
    const context = useContext(SelectedCourseContext);
    if (!context) {
        throw new Error("useSelectedCourse must be used within a SelectedCourseProvider");
    }
    return context;
};