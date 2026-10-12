import { createContext, useContext } from 'react';

export const LikeSoundContext = createContext(() => {});
export function useLikeSound() { return useContext(LikeSoundContext); }
