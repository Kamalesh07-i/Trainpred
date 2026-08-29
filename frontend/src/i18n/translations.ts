export type Language = 'en' | 'ta' | 'hi';

export const translations = {
  appSubtitle: {
    en: 'Next-Gen Dynamic Railway ETA & Operational Disruption Intelligence',
    ta: 'அடுத்த தலைமுறை மாறும் ரயில் வருகை நேரம் & செயல்பாட்டு இடையூறு நுண்ணறிவு',
    hi: 'अगली पीढ़ी की डायनामिक रेलवे ईटीए और परिचालन व्यवधान इंटेलिजेंस',
  },
  navPassengerEta: {
    en: 'Passenger ETA',
    ta: 'பயணி வருகை நேரம்',
    hi: 'यात्री ईटीए',
  },
  navControlDispatch: {
    en: 'Control Dispatch',
    ta: 'கட்டுப்பாட்டு அனுப்புகை',
    hi: 'नियंत्रण डिस्पैच',
  },
  navWhatIfSandbox: {
    en: 'What-If Sandbox',
    ta: 'என்ன-என்றால் சோதனை தளம்',
    hi: 'व्हाट-इफ सैंडबॉक्स',
  },
  navMlMetrics: {
    en: 'ML & XAI Metrics',
    ta: 'எம்எல் & எக்ஸ்ஏஐ அளவீடுகள்',
    hi: 'एमएल और एक्सएआई मेट्रिक्स',
  },
  liveWs: {
    en: 'LIVE WS',
    ta: 'நேரடி WS',
    hi: 'लाइव WS',
  },
  liveSync: {
    en: 'LIVE SYNC (3s)',
    ta: 'நேரடி ஒத்திசைவு (3s)',
    hi: 'लाइव सिंक (3s)',
  },
  syncing: {
    en: 'SYNCING',
    ta: 'ஒத்திசைக்கிறது',
    hi: 'सिंक हो रहा है',
  },
  themeDark: {
    en: 'Dark',
    ta: 'இருள்',
    hi: 'अंधेरा',
  },
  themeLight: {
    en: 'Light',
    ta: 'வெளிச்சம்',
    hi: 'उजाला',
  },
} as const;

export type TranslationKey = keyof typeof translations;
