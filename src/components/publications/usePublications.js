import { createContext, useContext } from 'react';
export const PublicationContext = createContext(null);
export const usePublications = () => useContext(PublicationContext);
