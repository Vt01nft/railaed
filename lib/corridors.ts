/**
 * Countries supported as remittance destinations.
 *
 * Eight corridors are "featured" — they get their own tile in the picker
 * and richer metadata. The rest are accessible via the typeahead.
 *
 * `usdToLocalRate` is an approximate static mid-market rate, used only for
 * the recipient-local-currency display. The honesty-score uses live AED/USD
 * via lib/fx.ts.
 */

export interface Country {
  code: string;
  country: string;
  flag: string;
  localCurrency: string;
  usdToLocalRate: number;
  featured?: boolean;
  notes?: string;
  expatPopulationInUae?: string;
}

export const COUNTRIES: Record<string, Country> = {
  // ── Featured (rendered as tiles) ──────────────────────────────────────
  US: { code: 'US', country: 'United States',  flag: '🇺🇸', localCurrency: 'USD', usdToLocalRate: 1.00,  featured: true, notes: 'USD-denominated · ACH / wire off-ramp' },
  UK: { code: 'UK', country: 'United Kingdom', flag: '🇬🇧', localCurrency: 'GBP', usdToLocalRate: 0.79,  featured: true, notes: 'Faster Payments via open-banking off-ramp' },
  CA: { code: 'CA', country: 'Canada',         flag: '🇨🇦', localCurrency: 'CAD', usdToLocalRate: 1.36,  featured: true, notes: 'Interac e-Transfer via partner' },
  IN: { code: 'IN', country: 'India',          flag: '🇮🇳', localCurrency: 'INR', usdToLocalRate: 83.2,  featured: true, expatPopulationInUae: '~3.5M', notes: 'UPI / IMPS off-ramps via partner' },
  NG: { code: 'NG', country: 'Nigeria',        flag: '🇳🇬', localCurrency: 'NGN', usdToLocalRate: 1620,  featured: true, notes: 'Bank transfer or licensed P2P off-ramp' },
  SG: { code: 'SG', country: 'Singapore',      flag: '🇸🇬', localCurrency: 'SGD', usdToLocalRate: 1.34,  featured: true, notes: 'PayNow via partner off-ramp' },
  ES: { code: 'ES', country: 'Spain',          flag: '🇪🇸', localCurrency: 'EUR', usdToLocalRate: 0.92,  featured: true, notes: 'SEPA Instant via EUR off-ramp' },
  DE: { code: 'DE', country: 'Germany',        flag: '🇩🇪', localCurrency: 'EUR', usdToLocalRate: 0.92,  featured: true, notes: 'SEPA Instant via EUR off-ramp' },

  // ── Other supported countries (typeahead) ─────────────────────────────
  AE: { code: 'AE', country: 'United Arab Emirates', flag: '🇦🇪', localCurrency: 'AED', usdToLocalRate: 3.67 },
  AR: { code: 'AR', country: 'Argentina',      flag: '🇦🇷', localCurrency: 'ARS', usdToLocalRate: 880 },
  AT: { code: 'AT', country: 'Austria',        flag: '🇦🇹', localCurrency: 'EUR', usdToLocalRate: 0.92 },
  AU: { code: 'AU', country: 'Australia',      flag: '🇦🇺', localCurrency: 'AUD', usdToLocalRate: 1.52 },
  BD: { code: 'BD', country: 'Bangladesh',     flag: '🇧🇩', localCurrency: 'BDT', usdToLocalRate: 110 },
  BE: { code: 'BE', country: 'Belgium',        flag: '🇧🇪', localCurrency: 'EUR', usdToLocalRate: 0.92 },
  BH: { code: 'BH', country: 'Bahrain',        flag: '🇧🇭', localCurrency: 'BHD', usdToLocalRate: 0.38 },
  BR: { code: 'BR', country: 'Brazil',         flag: '🇧🇷', localCurrency: 'BRL', usdToLocalRate: 5.05 },
  CH: { code: 'CH', country: 'Switzerland',    flag: '🇨🇭', localCurrency: 'CHF', usdToLocalRate: 0.88 },
  CL: { code: 'CL', country: 'Chile',          flag: '🇨🇱', localCurrency: 'CLP', usdToLocalRate: 950 },
  CN: { code: 'CN', country: 'China',          flag: '🇨🇳', localCurrency: 'CNY', usdToLocalRate: 7.25 },
  CO: { code: 'CO', country: 'Colombia',       flag: '🇨🇴', localCurrency: 'COP', usdToLocalRate: 3900 },
  DK: { code: 'DK', country: 'Denmark',        flag: '🇩🇰', localCurrency: 'DKK', usdToLocalRate: 6.85 },
  EG: { code: 'EG', country: 'Egypt',          flag: '🇪🇬', localCurrency: 'EGP', usdToLocalRate: 48 },
  FR: { code: 'FR', country: 'France',         flag: '🇫🇷', localCurrency: 'EUR', usdToLocalRate: 0.92 },
  GH: { code: 'GH', country: 'Ghana',          flag: '🇬🇭', localCurrency: 'GHS', usdToLocalRate: 14 },
  GR: { code: 'GR', country: 'Greece',         flag: '🇬🇷', localCurrency: 'EUR', usdToLocalRate: 0.92 },
  HK: { code: 'HK', country: 'Hong Kong',      flag: '🇭🇰', localCurrency: 'HKD', usdToLocalRate: 7.82 },
  ID: { code: 'ID', country: 'Indonesia',      flag: '🇮🇩', localCurrency: 'IDR', usdToLocalRate: 16100 },
  IE: { code: 'IE', country: 'Ireland',        flag: '🇮🇪', localCurrency: 'EUR', usdToLocalRate: 0.92 },
  IL: { code: 'IL', country: 'Israel',         flag: '🇮🇱', localCurrency: 'ILS', usdToLocalRate: 3.60 },
  IT: { code: 'IT', country: 'Italy',          flag: '🇮🇹', localCurrency: 'EUR', usdToLocalRate: 0.92 },
  JO: { code: 'JO', country: 'Jordan',         flag: '🇯🇴', localCurrency: 'JOD', usdToLocalRate: 0.71 },
  JP: { code: 'JP', country: 'Japan',          flag: '🇯🇵', localCurrency: 'JPY', usdToLocalRate: 152 },
  KE: { code: 'KE', country: 'Kenya',          flag: '🇰🇪', localCurrency: 'KES', usdToLocalRate: 130 },
  KR: { code: 'KR', country: 'South Korea',    flag: '🇰🇷', localCurrency: 'KRW', usdToLocalRate: 1370 },
  KW: { code: 'KW', country: 'Kuwait',         flag: '🇰🇼', localCurrency: 'KWD', usdToLocalRate: 0.31 },
  LK: { code: 'LK', country: 'Sri Lanka',      flag: '🇱🇰', localCurrency: 'LKR', usdToLocalRate: 305 },
  MA: { code: 'MA', country: 'Morocco',        flag: '🇲🇦', localCurrency: 'MAD', usdToLocalRate: 9.9 },
  MX: { code: 'MX', country: 'Mexico',         flag: '🇲🇽', localCurrency: 'MXN', usdToLocalRate: 17.0 },
  MY: { code: 'MY', country: 'Malaysia',       flag: '🇲🇾', localCurrency: 'MYR', usdToLocalRate: 4.65 },
  NL: { code: 'NL', country: 'Netherlands',    flag: '🇳🇱', localCurrency: 'EUR', usdToLocalRate: 0.92 },
  NO: { code: 'NO', country: 'Norway',         flag: '🇳🇴', localCurrency: 'NOK', usdToLocalRate: 10.6 },
  NP: { code: 'NP', country: 'Nepal',          flag: '🇳🇵', localCurrency: 'NPR', usdToLocalRate: 133 },
  NZ: { code: 'NZ', country: 'New Zealand',    flag: '🇳🇿', localCurrency: 'NZD', usdToLocalRate: 1.65 },
  OM: { code: 'OM', country: 'Oman',           flag: '🇴🇲', localCurrency: 'OMR', usdToLocalRate: 0.385 },
  PE: { code: 'PE', country: 'Peru',           flag: '🇵🇪', localCurrency: 'PEN', usdToLocalRate: 3.75 },
  PH: { code: 'PH', country: 'Philippines',    flag: '🇵🇭', localCurrency: 'PHP', usdToLocalRate: 56 },
  PK: { code: 'PK', country: 'Pakistan',       flag: '🇵🇰', localCurrency: 'PKR', usdToLocalRate: 278 },
  PL: { code: 'PL', country: 'Poland',         flag: '🇵🇱', localCurrency: 'PLN', usdToLocalRate: 4.0 },
  PT: { code: 'PT', country: 'Portugal',       flag: '🇵🇹', localCurrency: 'EUR', usdToLocalRate: 0.92 },
  QA: { code: 'QA', country: 'Qatar',          flag: '🇶🇦', localCurrency: 'QAR', usdToLocalRate: 3.64 },
  SA: { code: 'SA', country: 'Saudi Arabia',   flag: '🇸🇦', localCurrency: 'SAR', usdToLocalRate: 3.75 },
  SE: { code: 'SE', country: 'Sweden',         flag: '🇸🇪', localCurrency: 'SEK', usdToLocalRate: 10.5 },
  TH: { code: 'TH', country: 'Thailand',       flag: '🇹🇭', localCurrency: 'THB', usdToLocalRate: 36 },
  TR: { code: 'TR', country: 'Turkey',         flag: '🇹🇷', localCurrency: 'TRY', usdToLocalRate: 32 },
  TW: { code: 'TW', country: 'Taiwan',         flag: '🇹🇼', localCurrency: 'TWD', usdToLocalRate: 32 },
  VN: { code: 'VN', country: 'Vietnam',        flag: '🇻🇳', localCurrency: 'VND', usdToLocalRate: 25000 },
  ZA: { code: 'ZA', country: 'South Africa',   flag: '🇿🇦', localCurrency: 'ZAR', usdToLocalRate: 18.5 },
};

export type CorridorCode = keyof typeof COUNTRIES;

/** ITU-T E.164 dial codes for every supported country. */
export const DIAL_CODES: Record<string, string> = {
  US: '+1',   UK: '+44',  CA: '+1',   IN: '+91',  NG: '+234', SG: '+65',  ES: '+34',  DE: '+49',
  AE: '+971', AR: '+54',  AT: '+43',  AU: '+61',  BD: '+880', BE: '+32',  BH: '+973', BR: '+55',
  CH: '+41',  CL: '+56',  CN: '+86',  CO: '+57',  DK: '+45',  EG: '+20',  FR: '+33',  GH: '+233',
  GR: '+30',  HK: '+852', ID: '+62',  IE: '+353', IL: '+972', IT: '+39',  JO: '+962', JP: '+81',
  KE: '+254', KR: '+82',  KW: '+965', LK: '+94',  MA: '+212', MX: '+52',  MY: '+60',  NL: '+31',
  NO: '+47',  NP: '+977', NZ: '+64',  OM: '+968', PE: '+51',  PH: '+63',  PK: '+92',  PL: '+48',
  PT: '+351', QA: '+974', SA: '+966', SE: '+46',  TH: '+66',  TR: '+90',  TW: '+886', VN: '+84',
  ZA: '+27',
};

/** Returns the dial code for a country code (defaults to '+' if unknown). */
export function dialCodeFor(code: string): string {
  return DIAL_CODES[code] ?? '+';
}

/** Featured corridors only — rendered as picker tiles in this exact order. */
export const CORRIDOR_LIST: Country[] = ['US', 'UK', 'CA', 'IN', 'NG', 'SG', 'ES', 'DE'].map(
  (k) => COUNTRIES[k]!
);

/** Map form of featured corridors (legacy compatibility with older imports). */
export const CORRIDORS: Record<string, Country> = Object.fromEntries(
  CORRIDOR_LIST.map((c) => [c.code, c])
);

/** Every supported country, sorted alphabetically — for the typeahead. */
export const ALL_COUNTRIES: Country[] = Object.values(COUNTRIES).sort((a, b) =>
  a.country.localeCompare(b.country)
);

export const DEFAULT_CORRIDOR: CorridorCode = 'IN';

/** Type-guard for API boundary validation. */
export function isCorridorCode(s: string): s is CorridorCode {
  return s in COUNTRIES;
}
