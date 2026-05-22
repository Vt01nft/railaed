// Destination corridor metadata — the top UAE-expat outbound corridors per RESEARCH.md.
// USD→local rates are reasonable static fallbacks for the testnet demo.

export type CorridorCode = 'IN' | 'PH' | 'PK' | 'EG' | 'BD' | 'LK' | 'NP';

export interface CorridorMeta {
  code: CorridorCode;
  country: string;
  flag: string;
  localCurrency: string;
  usdToLocalRate: number; // 1 USD = N local units (approx)
  expatPopulationInUae?: string;
  notes?: string;
}

export const CORRIDORS: Record<CorridorCode, CorridorMeta> = {
  IN: {
    code: 'IN',
    country: 'India',
    flag: '🇮🇳',
    localCurrency: 'INR',
    usdToLocalRate: 83.2,
    expatPopulationInUae: '~3.5M',
    notes: 'Largest UAE expat group; UPI/IMPS off-ramps via partners',
  },
  PH: {
    code: 'PH',
    country: 'Philippines',
    flag: '🇵🇭',
    localCurrency: 'PHP',
    usdToLocalRate: 56.4,
    expatPopulationInUae: '~700K',
    notes: 'PDAX / Coins.ph for USDC off-ramp',
  },
  PK: {
    code: 'PK',
    country: 'Pakistan',
    flag: '🇵🇰',
    localCurrency: 'PKR',
    usdToLocalRate: 278.0,
    expatPopulationInUae: '~1.7M',
    notes: 'Off-ramp via local exchanges; SBP regulated',
  },
  EG: {
    code: 'EG',
    country: 'Egypt',
    flag: '🇪🇬',
    localCurrency: 'EGP',
    usdToLocalRate: 48.5,
    expatPopulationInUae: '~900K',
    notes: 'P2P off-ramp common; CBE-licensed partners growing',
  },
  BD: {
    code: 'BD',
    country: 'Bangladesh',
    flag: '🇧🇩',
    localCurrency: 'BDT',
    usdToLocalRate: 119.0,
    expatPopulationInUae: '~700K',
    notes: 'bKash interop via partner banks; regulatory friction',
  },
  LK: {
    code: 'LK',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    localCurrency: 'LKR',
    usdToLocalRate: 305.0,
    expatPopulationInUae: '~300K',
    notes: 'CBSL allows USDC inflow through licensed partners',
  },
  NP: {
    code: 'NP',
    country: 'Nepal',
    flag: '🇳🇵',
    localCurrency: 'NPR',
    usdToLocalRate: 133.0,
    expatPopulationInUae: '~225K',
    notes: 'eSewa / IME off-ramp via partners',
  },
};

export const DEFAULT_CORRIDOR: CorridorCode = 'IN';

export const CORRIDOR_LIST: CorridorMeta[] = Object.values(CORRIDORS);
