import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <UIContext.Provider value={{ cartOpen, setCartOpen, bookOpen, setBookOpen }}>{children}</UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
