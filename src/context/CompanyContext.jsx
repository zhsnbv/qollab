import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { companies, companyById, defaultCompany } from '../data/companies';
import { startBrandSwap } from '../utils/brand';

// Выбранное рабочее пространство. Кроме самого объекта компании контекст
// делает одну вещь: ставит data-company на <html>. Дальше цвета подхватывает
// styles/companies.css, поэтому перекрашивать экраны поодиночке не нужно.
const KEY = 'qollab.company';
const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [companyId, setCompanyId] = useState(() => {
    const saved = localStorage.getItem(KEY);
    return companyById[saved] ? saved : defaultCompany.id;
  });

  useEffect(() => {
    document.documentElement.dataset.company = companyId;
    try { localStorage.setItem(KEY, companyId); } catch { /* ignore */ }
  }, [companyId]);

  // В чужом пространстве упоминания ERG заменяются на его бренд. Для самого
  // ERG подмена не нужна — тексты уже написаны под него.
  useEffect(() => {
    if (companyId === 'erg') return undefined;
    const brand = (companyById[companyId] || defaultCompany).name;
    return startBrandSwap(brand);
  }, [companyId]);

  const value = useMemo(() => ({
    company: companyById[companyId] || defaultCompany,
    companyId,
    setCompanyId,
    companies,
  }), [companyId]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
