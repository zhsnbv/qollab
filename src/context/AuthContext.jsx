import { createContext, useContext, useState } from 'react';

// Вход в прототипе не притворяется настоящим: держим флаг в sessionStorage,
// чтобы перезагрузка страницы во время демо не выкидывала обратно на
// авторизацию, но новая вкладка снова показывала весь флоу с начала.
const KEY = 'qollab-authed';

const AuthContext = createContext({ authed: false, signIn: () => {}, signOut: () => {} });

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(KEY) === '1');

  const signIn = () => {
    sessionStorage.setItem(KEY, '1');
    setAuthed(true);
  };
  const signOut = () => {
    sessionStorage.removeItem(KEY);
    setAuthed(false);
  };

  return (
    <AuthContext.Provider value={{ authed, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
