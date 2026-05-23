export interface VariantDimensions {
  width: string
  length: string
}

export interface CarData {
  [make: string]: {
    [model: string]: {
      [variant: string]: VariantDimensions
    }
  }
}

export const carData: CarData = {
  Maruti: {
    Swift: {
      LXi: { width: '1.74', length: '3.85' },
      VXi: { width: '1.74', length: '3.85' },
      ZXi: { width: '1.74', length: '3.85' },
      'ZXi+': { width: '1.74', length: '3.85' },
    },
    Baleno: {
      Sigma: { width: '1.75', length: '3.99' },
      Delta: { width: '1.75', length: '3.99' },
      Zeta: { width: '1.75', length: '3.99' },
      Alpha: { width: '1.75', length: '3.99' },
    },
    Alto: {
      Std: { width: '1.49', length: '3.45' },
      LXi: { width: '1.49', length: '3.45' },
      VXi: { width: '1.49', length: '3.45' },
      'VXi+': { width: '1.49', length: '3.45' },
    },
    'Wagon R': {
      LXi: { width: '1.62', length: '3.66' },
      VXi: { width: '1.62', length: '3.66' },
      ZXi: { width: '1.62', length: '3.66' },
      'ZXi+': { width: '1.62', length: '3.66' },
    },
    Dzire: {
      LXi: { width: '1.74', length: '3.99' },
      VXi: { width: '1.74', length: '3.99' },
      ZXi: { width: '1.74', length: '3.99' },
      'ZXi+': { width: '1.74', length: '3.99' },
    },
    Brezza: {
      LXi: { width: '1.79', length: '3.99' },
      VXi: { width: '1.79', length: '3.99' },
      ZXi: { width: '1.79', length: '3.99' },
      'ZXi+': { width: '1.79', length: '3.99' },
    },
    Ertiga: {
      LXi: { width: '1.74', length: '4.40' },
      VXi: { width: '1.74', length: '4.40' },
      ZXi: { width: '1.74', length: '4.40' },
      'ZXi+': { width: '1.74', length: '4.40' },
    },
    Celerio: {
      LXi: { width: '1.60', length: '3.70' },
      VXi: { width: '1.60', length: '3.70' },
      ZXi: { width: '1.60', length: '3.70' },
      'ZXi+': { width: '1.60', length: '3.70' },
    },
    Fronx: {
      Sigma: { width: '1.77', length: '3.99' },
      Delta: { width: '1.77', length: '3.99' },
      'Delta+': { width: '1.77', length: '3.99' },
      Zeta: { width: '1.77', length: '3.99' },
      Alpha: { width: '1.77', length: '3.99' },
    },
    Jimny: {
      Zeta: { width: '1.65', length: '3.99' },
      Alpha: { width: '1.65', length: '3.99' },
    },
    Ciaz: {
      Sigma: { width: '1.73', length: '4.49' },
      Delta: { width: '1.73', length: '4.49' },
      Zeta: { width: '1.73', length: '4.49' },
      Alpha: { width: '1.73', length: '4.49' },
    },
    XL6: {
      Zeta: { width: '1.78', length: '4.45' },
      Alpha: { width: '1.78', length: '4.45' },
      'Alpha+': { width: '1.78', length: '4.45' },
    },
    'Grand Vitara': {
      Sigma: { width: '1.78', length: '4.35' },
      Delta: { width: '1.78', length: '4.35' },
      Zeta: { width: '1.78', length: '4.35' },
      'Zeta+': { width: '1.78', length: '4.35' },
      Alpha: { width: '1.78', length: '4.35' },
      'Alpha+': { width: '1.78', length: '4.35' },
    },
    Invicto: {
      Zeta: { width: '1.78', length: '4.76' },
      'Zeta+': { width: '1.78', length: '4.76' },
      Alpha: { width: '1.78', length: '4.76' },
      'Alpha+': { width: '1.78', length: '4.76' },
    },
    Ignis: {
      Sigma: { width: '1.69', length: '3.70' },
      Delta: { width: '1.69', length: '3.70' },
      Zeta: { width: '1.69', length: '3.70' },
      Alpha: { width: '1.69', length: '3.70' },
    },
  },
  Hyundai: {
    i20: {
      Magna: { width: '1.78', length: '3.99' },
      Sportz: { width: '1.78', length: '3.99' },
      Asta: { width: '1.78', length: '3.99' },
      'Asta(O)': { width: '1.78', length: '3.99' },
    },
    Creta: {
      E: { width: '1.79', length: '4.30' },
      EX: { width: '1.79', length: '4.30' },
      S: { width: '1.79', length: '4.30' },
      'S+': { width: '1.79', length: '4.30' },
      SX: { width: '1.79', length: '4.30' },
      'SX(O)': { width: '1.79', length: '4.30' },
    },
    Venue: {
      E: { width: '1.77', length: '3.99' },
      S: { width: '1.77', length: '3.99' },
      'S+': { width: '1.77', length: '3.99' },
      SX: { width: '1.77', length: '3.99' },
      'SX(O)': { width: '1.77', length: '3.99' },
    },
    Verna: {
      EX: { width: '1.73', length: '4.44' },
      S: { width: '1.73', length: '4.44' },
      SX: { width: '1.73', length: '4.44' },
      'SX(O)': { width: '1.73', length: '4.44' },
    },
    i10: {
      Era: { width: '1.68', length: '3.68' },
      Magna: { width: '1.68', length: '3.68' },
      Sportz: { width: '1.68', length: '3.68' },
      Asta: { width: '1.68', length: '3.68' },
    },
    Tucson: {
      GL: { width: '1.87', length: '4.63' },
      'GL(O)': { width: '1.87', length: '4.63' },
      GLS: { width: '1.87', length: '4.63' },
      Signature: { width: '1.87', length: '4.63' },
    },
    Alcazar: {
      Prestige: { width: '1.79', length: '4.50' },
      Platinum: { width: '1.79', length: '4.50' },
      Signature: { width: '1.79', length: '4.50' },
    },
    Exter: {
      EX: { width: '1.68', length: '3.82' },
      S: { width: '1.68', length: '3.82' },
      SX: { width: '1.68', length: '3.82' },
      'SX(O)': { width: '1.68', length: '3.82' },
    },
    Aura: {
      E: { width: '1.68', length: '3.99' },
      S: { width: '1.68', length: '3.99' },
      SX: { width: '1.68', length: '3.99' },
      'SX+': { width: '1.68', length: '3.99' },
    },
  },
  Tata: {
    Nexon: {
      Smart: { width: '1.81', length: '3.99' },
      'Smart+': { width: '1.81', length: '3.99' },
      Pure: { width: '1.81', length: '3.99' },
      'Pure+': { width: '1.81', length: '3.99' },
      Creative: { width: '1.81', length: '3.99' },
      'Creative+': { width: '1.81', length: '3.99' },
      Fearless: { width: '1.81', length: '3.99' },
      'Fearless+': { width: '1.81', length: '3.99' },
    },
    Punch: {
      Pure: { width: '1.74', length: '3.83' },
      Adventure: { width: '1.74', length: '3.83' },
      Accomplished: { width: '1.74', length: '3.83' },
      Creative: { width: '1.74', length: '3.83' },
    },
    Harrier: {
      Smart: { width: '1.89', length: '4.60' },
      Pure: { width: '1.89', length: '4.60' },
      'Pure+': { width: '1.89', length: '4.60' },
      Adventure: { width: '1.89', length: '4.60' },
      'Adventure+': { width: '1.89', length: '4.60' },
      Fearless: { width: '1.89', length: '4.60' },
      'Fearless+': { width: '1.89', length: '4.60' },
    },
    Safari: {
      Smart: { width: '1.89', length: '4.66' },
      Pure: { width: '1.89', length: '4.66' },
      'Pure+': { width: '1.89', length: '4.66' },
      Adventure: { width: '1.89', length: '4.66' },
      'Adventure+': { width: '1.89', length: '4.66' },
      Accomplished: { width: '1.89', length: '4.66' },
      'Accomplished+': { width: '1.89', length: '4.66' },
    },
    Altroz: {
      XE: { width: '1.77', length: '3.99' },
      XM: { width: '1.77', length: '3.99' },
      'XM+': { width: '1.77', length: '3.99' },
      XZ: { width: '1.77', length: '3.99' },
      'XZ+': { width: '1.77', length: '3.99' },
    },
    Tiago: {
      XE: { width: '1.65', length: '3.77' },
      XM: { width: '1.65', length: '3.77' },
      XT: { width: '1.65', length: '3.77' },
      XZ: { width: '1.65', length: '3.77' },
      'XZ+': { width: '1.65', length: '3.77' },
    },
    Tigor: {
      XE: { width: '1.68', length: '3.99' },
      XM: { width: '1.68', length: '3.99' },
      XZ: { width: '1.68', length: '3.99' },
      'XZ+': { width: '1.68', length: '3.99' },
    },
    Curvv: {
      Smart: { width: '1.86', length: '4.31' },
      Pure: { width: '1.86', length: '4.31' },
      Creative: { width: '1.86', length: '4.31' },
      'Creative+': { width: '1.86', length: '4.31' },
      Accomplished: { width: '1.86', length: '4.31' },
      'Accomplished+': { width: '1.86', length: '4.31' },
    },
  },
  Mahindra: {
    Thar: {
      AX: { width: '1.82', length: '4.08' },
      'AX Opt': { width: '1.82', length: '4.08' },
      LX: { width: '1.82', length: '4.08' },
    },
    XUV700: {
      MX: { width: '1.89', length: '4.70' },
      AX3: { width: '1.89', length: '4.70' },
      AX5: { width: '1.89', length: '4.70' },
      AX7: { width: '1.89', length: '4.70' },
      'AX7 L': { width: '1.89', length: '4.70' },
    },
    XUV300: {
      W4: { width: '1.82', length: '3.99' },
      W6: { width: '1.82', length: '3.99' },
      W8: { width: '1.82', length: '3.99' },
      'W8(O)': { width: '1.82', length: '3.99' },
    },
    'Scorpio N': {
      Z4: { width: '1.86', length: '4.66' },
      Z6: { width: '1.86', length: '4.66' },
      Z8: { width: '1.86', length: '4.66' },
      Z8L: { width: '1.86', length: '4.66' },
    },
    Bolero: {
      B4: { width: '1.75', length: '4.18' },
      B6: { width: '1.75', length: '4.18' },
      'B6(O)': { width: '1.75', length: '4.18' },
    },
    XUV400: {
      EC: { width: '1.82', length: '4.20' },
      EL: { width: '1.82', length: '4.20' },
      'EL Pro': { width: '1.82', length: '4.20' },
    },
    XUV3XO: {
      MX1: { width: '1.79', length: '3.99' },
      MX2: { width: '1.79', length: '3.99' },
      MX3: { width: '1.79', length: '3.99' },
      AX5: { width: '1.79', length: '3.99' },
      AX7: { width: '1.79', length: '3.99' },
      'AX7 L': { width: '1.79', length: '3.99' },
    },
  },
  Toyota: {
    'Innova Crysta': {
      GX: { width: '1.83', length: '4.74' },
      VX: { width: '1.83', length: '4.74' },
      ZX: { width: '1.83', length: '4.74' },
    },
    'Innova Hycross': {
      G: { width: '1.78', length: '4.76' },
      GX: { width: '1.78', length: '4.76' },
      VX: { width: '1.78', length: '4.76' },
      ZX: { width: '1.78', length: '4.76' },
      'ZX(O)': { width: '1.78', length: '4.76' },
    },
    Fortuner: {
      '4x2 AT': { width: '1.86', length: '4.80' },
      '4x4 AT': { width: '1.86', length: '4.80' },
      Legender: { width: '1.86', length: '4.80' },
    },
    Glanza: {
      E: { width: '1.75', length: '3.99' },
      S: { width: '1.75', length: '3.99' },
      G: { width: '1.75', length: '3.99' },
      V: { width: '1.75', length: '3.99' },
    },
    'Urban Cruiser Hyryder': {
      E: { width: '1.78', length: '4.37' },
      S: { width: '1.78', length: '4.37' },
      G: { width: '1.78', length: '4.37' },
      V: { width: '1.78', length: '4.37' },
    },
    Camry: {
      Hybrid: { width: '1.84', length: '4.89' },
    },
    Rumion: {
      S: { width: '1.74', length: '4.40' },
      G: { width: '1.74', length: '4.40' },
    },
  },
  Honda: {
    City: {
      V: { width: '1.75', length: '4.55' },
      VX: { width: '1.75', length: '4.55' },
      ZX: { width: '1.75', length: '4.55' },
    },
    Amaze: {
      E: { width: '1.70', length: '3.99' },
      S: { width: '1.70', length: '3.99' },
      VX: { width: '1.70', length: '3.99' },
    },
    Elevate: {
      SV: { width: '1.79', length: '4.31' },
      V: { width: '1.79', length: '4.31' },
      VX: { width: '1.79', length: '4.31' },
      ZX: { width: '1.79', length: '4.31' },
    },
  },
  Kia: {
    Seltos: {
      HTE: { width: '1.80', length: '4.37' },
      HTK: { width: '1.80', length: '4.37' },
      'HTK+': { width: '1.80', length: '4.37' },
      HTX: { width: '1.80', length: '4.37' },
      'HTX+': { width: '1.80', length: '4.37' },
      GTX: { width: '1.80', length: '4.37' },
      'GTX+': { width: '1.80', length: '4.37' },
      'X-Line': { width: '1.80', length: '4.37' },
    },
    Sonet: {
      HTE: { width: '1.79', length: '3.99' },
      HTK: { width: '1.79', length: '3.99' },
      'HTK+': { width: '1.79', length: '3.99' },
      HTX: { width: '1.79', length: '3.99' },
      'HTX+': { width: '1.79', length: '3.99' },
      GTX: { width: '1.79', length: '3.99' },
      'GTX+': { width: '1.79', length: '3.99' },
    },
    Carens: {
      Premium: { width: '1.80', length: '4.54' },
      Prestige: { width: '1.80', length: '4.54' },
      'Prestige+': { width: '1.80', length: '4.54' },
      Luxury: { width: '1.80', length: '4.54' },
      'Luxury+': { width: '1.80', length: '4.54' },
    },
    EV6: {
      'GT Line': { width: '1.89', length: '4.68' },
      'GT Line AWD': { width: '1.89', length: '4.68' },
    },
  },
  MG: {
    Hector: {
      Style: { width: '1.84', length: '4.66' },
      Super: { width: '1.84', length: '4.66' },
      Smart: { width: '1.84', length: '4.66' },
      Sharp: { width: '1.84', length: '4.66' },
      'Sharp Pro': { width: '1.84', length: '4.66' },
      Savvy: { width: '1.84', length: '4.66' },
    },
    Astor: {
      Style: { width: '1.81', length: '4.32' },
      Super: { width: '1.81', length: '4.32' },
      Smart: { width: '1.81', length: '4.32' },
      Sharp: { width: '1.81', length: '4.32' },
    },
    'ZS EV': {
      Excite: { width: '1.81', length: '4.32' },
      'Excite Pro': { width: '1.81', length: '4.32' },
      Exclusive: { width: '1.81', length: '4.32' },
      'Exclusive Pro': { width: '1.81', length: '4.32' },
    },
    Comet: {
      Standard: { width: '1.51', length: '2.97' },
    },
    Gloster: {
      Super: { width: '1.93', length: '4.99' },
      Sharp: { width: '1.93', length: '4.99' },
      Savvy: { width: '1.93', length: '4.99' },
    },
  },
  Volkswagen: {
    Taigun: {
      Comfortline: { width: '1.76', length: '4.22' },
      Highline: { width: '1.76', length: '4.22' },
      Topline: { width: '1.76', length: '4.22' },
      'GT Line': { width: '1.76', length: '4.22' },
      'GT Plus': { width: '1.76', length: '4.22' },
    },
    Virtus: {
      Comfortline: { width: '1.76', length: '4.56' },
      Highline: { width: '1.76', length: '4.56' },
      Topline: { width: '1.76', length: '4.56' },
      'GT Line': { width: '1.76', length: '4.56' },
      'GT Plus': { width: '1.76', length: '4.56' },
    },
  },
  Skoda: {
    Kushaq: {
      Active: { width: '1.76', length: '4.22' },
      Ambition: { width: '1.76', length: '4.22' },
      Style: { width: '1.76', length: '4.22' },
      'Monte Carlo': { width: '1.76', length: '4.22' },
    },
    Slavia: {
      Active: { width: '1.76', length: '4.54' },
      Ambition: { width: '1.76', length: '4.54' },
      Style: { width: '1.76', length: '4.54' },
      'Monte Carlo': { width: '1.76', length: '4.54' },
    },
    Superb: {
      Sportline: { width: '1.86', length: '4.87' },
      'L&K': { width: '1.86', length: '4.87' },
    },
  },
  BMW: {
    '3 Series': {
      '320d Sport': { width: '1.83', length: '4.71' },
      '320d Luxury': { width: '1.83', length: '4.71' },
      '320d M Sport': { width: '1.83', length: '4.71' },
      '330i Sport': { width: '1.83', length: '4.71' },
      '330i M Sport': { width: '1.83', length: '4.71' },
    },
    '5 Series': {
      '520d Luxury': { width: '1.87', length: '5.06' },
      '520d M Sport': { width: '1.87', length: '5.06' },
      '530d M Sport': { width: '1.87', length: '5.06' },
    },
    X1: {
      sDrive18i: { width: '1.85', length: '4.50' },
      sDrive20d: { width: '1.85', length: '4.50' },
      'xDrive20d M Sport': { width: '1.85', length: '4.50' },
    },
    X3: {
      xDrive20d: { width: '1.89', length: '4.71' },
      'xDrive20d M Sport': { width: '1.89', length: '4.71' },
      'xDrive30d M Sport': { width: '1.89', length: '4.71' },
    },
    X5: {
      xDrive30d: { width: '2.00', length: '4.92' },
      'xDrive30d M Sport': { width: '2.00', length: '4.92' },
      xDrive40i: { width: '2.00', length: '4.92' },
    },
  },
  'Mercedes-Benz': {
    'C-Class': {
      C200: { width: '1.82', length: '4.75' },
      C220d: { width: '1.82', length: '4.75' },
      C300d: { width: '1.82', length: '4.75' },
      'AMG C43': { width: '1.82', length: '4.75' },
    },
    'E-Class': {
      E200: { width: '1.86', length: '4.95' },
      E220d: { width: '1.86', length: '4.95' },
      E350d: { width: '1.86', length: '4.95' },
      'AMG E53': { width: '1.86', length: '4.95' },
    },
    'A-Class Limousine': {
      A200: { width: '1.80', length: '4.55' },
      A200d: { width: '1.80', length: '4.55' },
      'AMG A35': { width: '1.80', length: '4.55' },
    },
    GLA: {
      '200': { width: '1.83', length: '4.41' },
      '200d': { width: '1.83', length: '4.41' },
      '220d': { width: '1.83', length: '4.41' },
      'AMG GLA35': { width: '1.83', length: '4.41' },
    },
    GLC: {
      '220d': { width: '1.89', length: '4.72' },
      '300': { width: '1.89', length: '4.72' },
      'AMG GLC43': { width: '1.89', length: '4.72' },
    },
  },
  Audi: {
    A4: {
      'Premium': { width: '1.85', length: '4.76' },
      'Premium Plus': { width: '1.85', length: '4.76' },
      'Technology': { width: '1.85', length: '4.76' },
    },
    A6: {
      'Premium Plus': { width: '1.89', length: '4.94' },
      'Technology': { width: '1.89', length: '4.94' },
    },
    Q3: {
      'Premium Plus': { width: '1.85', length: '4.48' },
      'Technology': { width: '1.85', length: '4.48' },
    },
    Q5: {
      'Premium Plus': { width: '1.89', length: '4.68' },
      'Technology': { width: '1.89', length: '4.68' },
    },
    Q7: {
      'Premium Plus': { width: '1.97', length: '5.06' },
      'Technology': { width: '1.97', length: '5.06' },
    },
  },
  Renault: {
    Kiger: {
      RXE: { width: '1.74', length: '3.99' },
      RXL: { width: '1.74', length: '3.99' },
      RXT: { width: '1.74', length: '3.99' },
      'RXT(O)': { width: '1.74', length: '3.99' },
      RXZ: { width: '1.74', length: '3.99' },
    },
    Triber: {
      RXE: { width: '1.74', length: '3.99' },
      RXL: { width: '1.74', length: '3.99' },
      RXT: { width: '1.74', length: '3.99' },
      RXZ: { width: '1.74', length: '3.99' },
    },
    Kwid: {
      RXE: { width: '1.58', length: '3.73' },
      RXL: { width: '1.58', length: '3.73' },
      RXT: { width: '1.58', length: '3.73' },
      Climber: { width: '1.58', length: '3.73' },
    },
  },
  Nissan: {
    Magnite: {
      XE: { width: '1.74', length: '3.99' },
      XL: { width: '1.74', length: '3.99' },
      XV: { width: '1.74', length: '3.99' },
      'XV Premium': { width: '1.74', length: '3.99' },
      'XV Premium(O)': { width: '1.74', length: '3.99' },
    },
  },
  Citroen: {
    C3: {
      Live: { width: '1.73', length: '3.98' },
      Feel: { width: '1.73', length: '3.98' },
      'Feel Turbo': { width: '1.73', length: '3.98' },
      Shine: { width: '1.73', length: '3.98' },
    },
    'C3 Aircross': {
      Plus: { width: '1.79', length: '4.32' },
      Max: { width: '1.79', length: '4.32' },
    },
  },
}
