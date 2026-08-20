// Рабочие пространства: у каждого свой акцент, под который перекрашивается
// всё приложение. Палитра задаётся токенами в styles/companies.css по
// data-company на <html> — так тема применяется и к тем экранам, которые
// про компанию ничего не знают.
export const companies = [
  {
    id: 'erg',
    name: 'ERG',
    full: 'Eurasian Resources Group',
    domain: 'erg.qollab.kz',
    accent: '#ef7f1a',
  },
  {
    id: 'integra',
    name: 'Integra',
    full: 'Integra Construction KZ',
    domain: 'integra.qollab.kz',
    accent: '#140f4d',
  },
  {
    id: 'bts',
    name: 'BTS Digital',
    full: 'Business & Technology Solutions',
    domain: 'bts.qollab.kz',
    accent: '#0b6b53',
  },
];

export const defaultCompany = companies[0];

export const companyById = Object.fromEntries(companies.map((c) => [c.id, c]));
