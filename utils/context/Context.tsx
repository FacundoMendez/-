'use client'
import React, { createContext, useState, ReactNode } from "react";

interface ContextProps {
  activeMusic: boolean;
  setActiveMusic: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultValue: ContextProps = {
  activeMusic: false,
  setActiveMusic: () => {},
};

export const Context = createContext<ContextProps>(defaultValue);

interface ContextProviderProps {
  children: ReactNode; 
}

export const ContextProvider: React.FC<ContextProviderProps> = ({ children }) => {
  const [activeMusic, setActiveMusic] = useState<boolean>(false);

  return (
    <Context.Provider value={{ activeMusic, setActiveMusic }}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;