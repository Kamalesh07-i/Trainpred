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
    searchPlaceholder: {
    en: 'Search train (e.g. 12628, Rajdhani, SBC)...',
    ta: 'ரயிலைத் தேடு (எ.கா. 12628, ராஜதானி, SBC)...',
    hi: 'ट्रेन खोजें (जैसे 12628, राजधानी, SBC)...',
  },
  triggerDisruption: {
    en: 'Trigger Live Disruption',
    ta: 'நேரடி இடையூறை இயக்கு',
    hi: 'लाइव व्यवधान चालू करें',
  },
  clearDisruption: {
    en: 'Clear Disruption',
    ta: 'இடையூறை அழி',
    hi: 'व्यवधान साफ़ करें',
  },
  totalDistance: {
    en: 'Total Distance',
    ta: 'மொத்த தூரம்',
    hi: 'कुल दूरी',
  },
  currentSpeed: {
    en: 'CURRENT SPEED',
    ta: 'தற்போதைய வேகம்',
    hi: 'वर्तमान गति',
  },
  gpsTelemetryActive: {
    en: 'GPS Telemetry Active',
    ta: 'GPS தொலைத்தகவல் செயலில்',
    hi: 'GPS टेलीमेट्री सक्रिय',
  },
  delayStatus: {
    en: 'DELAY STATUS',
    ta: 'தாமத நிலை',
    hi: 'देरी की स्थिति',
  },
  min: {
    en: 'min',
    ta: 'நிமி',
    hi: 'मिनट',
  },
  criticalDelay: {
    en: 'Critical Delay',
    ta: 'கடுமையான தாமதம்',
    hi: 'गंभीर देरी',
  },
  moderateDelay: {
    en: 'Moderate Delay',
    ta: 'மிதமான தாமதம்',
    hi: 'मध्यम देरी',
  },
  onTimeSchedule: {
    en: 'On-Time Schedule',
    ta: 'சரியான நேரம்',
    hi: 'समय पर',
  },
  aiNaturalRecovery: {
    en: 'AI NATURAL RECOVERY',
    ta: 'AI இயற்கை மீட்பு',
    hi: 'AI प्राकृतिक रिकवरी',
  },
  slackBufferAbsorption: {
    en: 'Slack Buffer Absorption',
    ta: 'மிகை இடைவெளி உறிஞ்சுதல்',
    hi: 'स्लैक बफर अवशोषण',
  },
  destinationEta: {
    en: 'DESTINATION ETA',
    ta: 'இலக்கு வருகை நேரம்',
    hi: 'गंतव्य ईटीए',
  },
  scheduledVsDynamic: {
    en: 'Scheduled vs Dynamic AI Prediction',
    ta: 'திட்டமிடப்பட்ட Vs டைனமிக் AI கணிப்பு',
    hi: 'निर्धारित बनाम डायनामिक AI भविष्यवाणी',
  },
  currentSection: {
    en: 'Current Section:',
    ta: 'தற்போதைய பிரிவு:',
    hi: 'वर्तमान खंड:',
  },
  enRouteTo: {
    en: 'En route to',
    ta: 'செல்லும் வழியில்',
    hi: 'की ओर मार्ग में',
  },
  inTransit: {
    en: 'In Transit',
    ta: 'பயணத்தில்',
    hi: 'यात्रा में',
  },
  complete: {
    en: 'Complete',
    ta: 'நிறைவு',
    hi: 'पूर्ण',
  },
  calibratedConfidence: {
    en: 'Calibrated Confidence',
    ta: 'அளவீடு செய்யப்பட்ட நம்பகத்தன்மை',
    hi: 'कैलिब्रेटेड विश्वास',
  },
  p10p90Window: {
    en: 'P10-P90 Window:',
    ta: 'P10-P90 சாளரம்:',
    hi: 'P10-P90 विंडो:',
  },
  eceIsotonic: {
    en: 'ECE < 0.05 Isotonic Regression',
    ta: 'ECE < 0.05 ஐசோடோனிக் ரிகிரஷன்',
    hi: 'ECE < 0.05 आइसोटोनिक रिग्रेशन',
  },
  liveCorridorSchematic: {
    en: 'Live Corridor Track & Telemetry Schematic',
    ta: 'நேரடி பாதை & தொலைத்தகவல் வரைபடம்',
    hi: 'लाइव कॉरिडोर ट्रैक और टेलीमेट्री स्कीमैटिक',
  },
  realtimeSpatialProgression: {
    en: 'Real-time spatial progression across block sections & signal nodes',
    ta: 'தொகுதி பிரிவுகள் & சிக்னல் முனைகள் முழுவதும் நிகழ்நேர இட முன்னேற்றம்',
    hi: 'ब्लॉक सेक्शन और सिग्नल नोड्स में रीयल-टाइम स्थानिक प्रगति',
  },
    networkPunctualityRate: {
    en: 'Network Punctuality Rate',
    ta: 'நெட்வொர்க் சரியான நேர விகிதம்',
    hi: 'नेटवर्क समयपालन दर',
  },
  activeFleetDensity: {
    en: 'Active Fleet Density',
    ta: 'செயலில் உள்ள வாகன அடர்த்தி',
    hi: 'सक्रिय बेड़ा घनत्व',
  },
  activeDisruptionAlerts: {
    en: 'Active Disruption Alerts',
    ta: 'செயலில் உள்ள இடையூறு எச்சரிக்கைகள்',
    hi: 'सक्रिय व्यवधान अलर्ट',
  },
  fleetVelocityAverage: {
    en: 'Fleet Velocity Average',
    ta: 'சராசரி வாகன வேகம்',
    hi: 'बेड़ा औसत गति',
  },
  trainsUnit: {
    en: 'Trains',
    ta: 'ரயில்கள்',
    hi: 'ट्रेनें',
  },
  eventsUnit: {
    en: 'Events',
    ta: 'நிகழ்வுகள்',
    hi: 'घटनाएं',
  },
    activeFleetRiskMatrix: {
    en: 'Active Corridor Fleet Risk & Delay Matrix',
    ta: 'செயலில் உள்ள பாதை வாகன இடர் & தாமத அணி',
    hi: 'सक्रिय कॉरिडोर बेड़ा जोखिम और देरी मैट्रिक्स',
  },
  telemetryPriorityDesc: {
    en: 'Real-time telemetry and AI priority classification across active routes',
    ta: 'செயலில் உள்ள வழிகளில் நிகழ்நேர தொலைத்தகவல் & AI முன்னுரிமை வகைப்பாடு',
    hi: 'सक्रिय मार्गों में रीयल-टाइम टेलीमेट्री और AI प्राथमिकता वर्गीकरण',
  },
  activeTrainsLabel: {
    en: 'ACTIVE TRAINS',
    ta: 'செயலில் உள்ள ரயில்கள்',
    hi: 'सक्रिय ट्रेनें',
  },
  colTrainType: {
    en: 'Train / Type',
    ta: 'ரயில் / வகை',
    hi: 'ट्रेन / प्रकार',
  },
  colPriority: {
    en: 'Priority',
    ta: 'முன்னுரிமை',
    hi: 'प्राथमिकता',
  },
  colOriginDestination: {
    en: 'Origin & Destination',
    ta: 'தொடக்கம் & இலக்கு',
    hi: 'मूल और गंतव्य',
  },
  colLiveVelocity: {
    en: 'Live Velocity',
    ta: 'நேரடி வேகம்',
    hi: 'लाइव गति',
  },
  colDelayStatus: {
    en: 'Delay Status',
    ta: 'தாமத நிலை',
    hi: 'देरी की स्थिति',
  },
  colNextWaypoint: {
    en: 'Next Waypoint',
    ta: 'அடுத்த வழிப்புள்ளி',
    hi: 'अगला पड़ाव',
  },
  colRiskAssessment: {
    en: 'Risk Assessment',
    ta: 'இடர் மதிப்பீடு',
    hi: 'जोखिम आकलन',
  },
  colDispatchActions: {
    en: 'Dispatch Actions',
    ta: 'அனுப்புகை நடவடிக்கைகள்',
    hi: 'डिस्पैच कार्रवाई',
  },
  classLabel: {
    en: 'Class',
    ta: 'வகுப்பு',
    hi: 'श्रेणी',
  },
  riskCritical: {
    en: 'CRITICAL RISK',
    ta: 'கடுமையான இடர்',
    hi: 'गंभीर जोखिम',
  },
  riskHigh: {
    en: 'HIGH RISK',
    ta: 'உயர் இடர்',
    hi: 'उच्च जोखिम',
  },
  riskModerate: {
    en: 'MODERATE',
    ta: 'மிதமான',
    hi: 'मध्यम',
  },
  riskOnSchedule: {
    en: 'ON SCHEDULE',
    ta: 'திட்டப்படி',
    hi: 'समय पर',
  },
  etaLabel: {
    en: 'ETA:',
    ta: 'வருகை நேரம்:',
    hi: 'ईटीए:',
  },
  inspectXaiEta: {
    en: 'Inspect XAI & ETA',
    ta: 'XAI & ETA ஐ ஆய்வு செய்',
    hi: 'XAI और ईटीए जांचें',
  },
    anomalyDispatchFeed: {
    en: 'Real-Time AI Anomaly & Disruption Dispatch Feed',
    ta: 'நிகழ்நேர AI முரண்பாடு & இடையூறு அனுப்புகை ஊட்டம்',
    hi: 'रीयल-टाइम AI विसंगति और व्यवधान डिस्पैच फ़ीड',
  },
  isolationForestDesc: {
    en: 'Isolation Forest + Z-score ensemble detections across the national network',
    ta: 'தேசிய நெட்வொர்க் முழுவதும் Isolation Forest + Z-score கண்டறிதல்கள்',
    hi: 'राष्ट्रीय नेटवर्क में Isolation Forest + Z-score पहचान',
  },
  activeDisruptionsLabel: {
    en: 'ACTIVE DISRUPTIONS',
    ta: 'செயலில் உள்ள இடையூறுகள்',
    hi: 'सक्रिय व्यवधान',
  },
  allCorridorsNormal: {
    en: 'All corridors operating within normal statistical telemetry bounds. No active disruptions.',
    ta: 'அனைத்து பாதைகளும் இயல்பான தொலைத்தகவல் வரம்பிற்குள் இயங்குகின்றன. செயலில் இடையூறு இல்லை.',
    hi: 'सभी कॉरिडोर सामान्य सांख्यिकीय टेलीमेट्री सीमा के भीतर काम कर रहे हैं। कोई सक्रिय व्यवधान नहीं।',
  },
  trainAlertPrefix: {
    en: 'Train',
    ta: 'ரயில்',
    hi: 'ट्रेन',
  },
  sectionAlertLabel: {
    en: 'Section Alert',
    ta: 'பிரிவு எச்சரிக்கை',
    hi: 'सेक्शन अलर्ट',
  },
  aiDispatchAdvisory: {
    en: 'AI Dispatch Advisory:',
    ta: 'AI அனுப்புகை ஆலோசனை:',
    hi: 'AI डिस्पैच सलाह:',
  },
  authorizeDispatchResolution: {
    en: 'Authorize Dispatch Resolution',
    ta: 'அனுப்புகை தீர்வை அங்கீகரி',
    hi: 'डिस्पैच समाधान अधिकृत करें',
  },
    corridorCongestionHeatmap: {
    en: 'Corridor Section Congestion & Bottleneck Heatmap',
    ta: 'பாதை பிரிவு நெரிசல் & குறுக்கு வெப்ப வரைபடம்',
    hi: 'कॉरिडोर सेक्शन भीड़भाड़ और बॉटलनेक हीटमैप',
  },
  liveCapacityDesc: {
    en: 'Live capacity utilization, headway density, and sectional delay absorption',
    ta: 'நேரடி கொள்ளளவு பயன்பாடு, இடைவெளி அடர்த்தி மற்றும் பிரிவு தாமத உறிஞ்சுதல்',
    hi: 'लाइव क्षमता उपयोग, हेडवे घनत्व और सेक्शनल देरी अवशोषण',
  },
  legendOptimal: {
    en: 'Optimal (<40%)',
    ta: 'உகந்தது (<40%)',
    hi: 'इष्टतम (<40%)',
  },
  legendElevated: {
    en: 'Elevated (<70%)',
    ta: 'உயர்ந்தது (<70%)',
    hi: 'बढ़ा हुआ (<70%)',
  },
  legendBottleneck: {
    en: 'Bottleneck (≥70%)',
    ta: 'நெரிசல் (≥70%)',
    hi: 'बॉटलनेक (≥70%)',
  },
  trackDensityLoad: {
    en: 'Track Density Load:',
    ta: 'தட வாகன அடர்த்தி சுமை:',
    hi: 'ट्रैक घनत्व लोड:',
  },
  activeTrainsColon: {
    en: 'Active Trains:',
    ta: 'செயலில் உள்ள ரயில்கள்:',
    hi: 'सक्रिय ट्रेनें:',
  },
} as const;

export type TranslationKey = keyof typeof translations;
