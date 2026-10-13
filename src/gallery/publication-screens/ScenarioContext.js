import { createContext, useContext } from 'react';
// Only the isolated handoff route supplies a value; normal flows use null.
export const PublicationScenarioContext = createContext(null);
export const usePublicationScenario = () => useContext(PublicationScenarioContext);
