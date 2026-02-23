"use client";

import React, { createContext, useContext, useState } from "react";
import { Category, Difficulty } from "@/lib/mock-data";

interface BrowseContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: Category | "All";
    setSelectedCategory: (cat: Category | "All") => void;
    selectedDifficulty: Difficulty | "All";
    setSelectedDifficulty: (diff: Difficulty | "All") => void;
}

const BrowseContext = createContext<BrowseContextType | undefined>(undefined);

export function BrowseProvider({ children }: { children: React.ReactNode }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");

    return (
        <BrowseContext.Provider value={{
            searchQuery, setSearchQuery,
            selectedCategory, setSelectedCategory,
            selectedDifficulty, setSelectedDifficulty
        }}>
            {children}
        </BrowseContext.Provider>
    );
}

export const useBrowse = () => {
    const context = useContext(BrowseContext);
    if (context === undefined) {
        throw new Error("useBrowse must be used within a BrowseProvider");
    }
    return context;
};
