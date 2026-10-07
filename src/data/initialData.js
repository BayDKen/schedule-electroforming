// Master Data & Production Pipeline for UBS Gold Electroforming
// Synchronized with Meeting Notes (06 Okt 2026 11:16 WIB) & Production Capacity Sheet
// 1. Jalur Lilin (10 Sub Proses)
// 2. Jalur Timah (14 Sub Proses)
// 3. 4 Mesin Bath EF (3 Lilin, 1 Timah, dengan EF-03 sebagai Mesin Floating)
// 4. Shared Machinery: BOR, HL1, ANN, TKD, BJD

// ==========================================
// 1. JALUR LILIN (11 SUB PROSES)
// ==========================================
export const LILIN_PROCESSES = [
  {
    code: 'CEL',
    number: 1,
    pipeline: 'Lilin',
    name: 'Cetak Lilin',
    shortName: 'CEL',
    jmlMachine: 1,
    kapasitasMan: '-',
    leadtimeSec: 30,
    leadtimeDisplay: '30 dtk / bj (0.5 mnt/bj)',
    defaultLeadTimeMinutes: 245, // 490 bj * 0.5 mnt = 245 Menit (4.1 Jam)
    defaultLeadTimeHours: 4.1,
    capacityUnit: '1 bj / siklus',
    capacityBatchBiji: 1,
    secPerBiji: 30.0,
    minPerBiji: 0.5,
    speedBpm: 0.5,
    manPower: 1,
    colorTheme: 'amber',
    machines: [
      { id: 'ML-01', code: 'ML-01', name: 'Mesin Lilin 01', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 600, speedBpm: 0.5 },
      { id: 'ML-02', code: 'ML-02', name: 'Mesin Lilin 02', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 600, speedBpm: 0.5 },
      { id: 'ML-03', code: 'ML-03', name: 'Mesin Lilin 03', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 600, speedBpm: 0.5 }
    ]
  },
  {
    code: 'WBN',
    number: 2,
    pipeline: 'Lilin',
    name: 'Wash Bensin (WBN)',
    shortName: 'WBN',
    jmlMachine: '-',
    kapasitasMan: 3,
    leadtimeSec: 135,
    leadtimeDisplay: '135 dtk / bj (2.3 mnt/bj)',
    defaultLeadTimeMinutes: 368, // (490 bj * 135s) / (3 man * 60) ≈ 368 Menit (6.1 Jam)
    defaultLeadTimeHours: 6.1,
    capacityUnit: '1 bj / cuci (3 man)',
    capacityBatchBiji: 1,
    secPerBiji: 135.0,
    minPerBiji: 2.3,
    speedBpm: 2.3,
    manPower: 3,
    colorTheme: 'teal',
    machines: [
      { id: 'WB-01', code: 'WB 1', name: 'Bak Wash Bensin 01', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 500 },
      { id: 'WB-02', code: 'WB 2', name: 'Bak Wash Bensin 02', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 500 },
      { id: 'WB-03', code: 'WB 3', name: 'Bak Wash Bensin 03', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 500 }
    ]
  },
  {
    code: 'SOL',
    number: 3,
    pipeline: 'Lilin',
    name: 'Silver Oil',
    shortName: 'SOL',
    jmlMachine: '-',
    kapasitasMan: 2,
    leadtimeSec: 30, // 30s per 2 bj
    leadtimeDisplay: '30 dtk / 2 bj (0.3 mnt/bj)',
    defaultLeadTimeMinutes: 61, // (490 bj / 2 * 30s) / (2 man * 60) ≈ 61 Menit (1.0 Jam)
    defaultLeadTimeHours: 1.0,
    capacityUnit: '2 bj / spray (2 man)',
    capacityBatchBiji: 2,
    secPerBiji: 15.0,
    minPerBiji: 0.3,
    speedBpm: 0.3,
    manPower: 2,
    colorTheme: 'slate',
    machines: [
      { id: 'SOL-01', code: 'SO 1', name: 'Spray Chamber SO 1', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 600 },
      { id: 'SOL-02', code: 'SO 2', name: 'Spray Chamber SO 2', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 600 }
    ]
  },
  {
    code: 'STI',
    number: 4,
    pipeline: 'Lilin',
    name: 'Jig (Jigging STI)',
    shortName: 'JIG',
    jmlMachine: '-',
    kapasitasMan: 1,
    leadtimeSec: 10,
    leadtimeDisplay: '10 dtk / bj (0.2 mnt/bj)',
    defaultLeadTimeMinutes: 82, // (490 bj * 10s) / 60 ≈ 82 Menit (1.4 Jam)
    defaultLeadTimeHours: 1.4,
    capacityUnit: '1 bj / rakit (1 man)',
    capacityBatchBiji: 1,
    secPerBiji: 10.0,
    minPerBiji: 0.2,
    speedBpm: 0.2,
    manPower: 1,
    colorTheme: 'indigo',
    machines: [
      { id: 'JIG-01', code: 'JIG-01', name: 'Meja Jig Lilin A', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 500 },
      { id: 'JIG-02', code: 'JIG-02', name: 'Meja Jig Lilin B', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 500 }
    ]
  },
  {
    code: 'TBA',
    number: 5,
    pipeline: 'Lilin',
    name: 'Tembaga Asam 1',
    shortName: 'TBA',
    jmlMachine: 1,
    kapasitasMan: '-',
    isBath: true,
    leadtimeSec: 6600,
    leadtimeDisplay: '110 Menit (6.600s / batch 490 bj)',
    defaultLeadTimeMinutes: 110, // 110 Menit = 1.8 Jam
    defaultLeadTimeHours: 1.8,
    capacityUnit: '490 bj / batch',
    capacityBatchBiji: 490,
    secPerBiji: 13.5,
    minPerBiji: 0.2,
    speedBpm: 0.2,
    manPower: 1,
    colorTheme: 'amber',
    machines: [
      { id: 'TA-01', code: 'TA-01', name: 'Bak Tembaga Asam 01', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 490 }
    ]
  },
  {
    code: 'EFL',
    number: 6,
    pipeline: 'Lilin',
    name: 'Elektroforming Lilin (EF Bath)',
    shortName: 'EFL',
    jmlMachine: 4,
    kapasitasMan: '-',
    isEFBath: true,
    isFeatured: true,
    leadtimeSec: 126000,
    leadtimeDisplay: '2.100 Menit (35 Jam / 126.000s)',
    defaultLeadTimeMinutes: 2100, // 35 Jam = 2100 Menit
    defaultLeadTimeHours: 35.0,
    capacityUnit: '490 bj / batch',
    capacityBatchBiji: 490,
    secPerBiji: 257.1,
    minPerBiji: 4.3,
    speedBpm: 4.3,
    manPower: 4,
    colorTheme: 'blue',
    machines: [
      {
        id: 'EF-01',
        code: 'EF-01',
        name: 'Bath Electroforming 01',
        type: 'Lilin',
        isFloating: false,
        status: 'Running',
        maxDailyHours: 24,
        capacityBiji: 490,
        volumeMl: 350,
        batchHours: 35,
        setupTimeMin: 5,
        notes: 'Dedicated Lilin 24K'
      },
      {
        id: 'EF-02',
        code: 'EF-02',
        name: 'Bath Electroforming 02',
        type: 'Lilin',
        isFloating: false,
        status: 'Running',
        maxDailyHours: 24,
        capacityBiji: 490,
        volumeMl: 350,
        batchHours: 35,
        setupTimeMin: 5,
        notes: 'Dedicated Lilin 24K'
      },
      {
        id: 'EF-03',
        code: 'EF-03',
        name: 'Bath Electroforming 03',
        type: 'Lilin',
        isFloating: true,
        currentAssignment: 'Lilin',
        status: 'Running',
        maxDailyHours: 24,
        capacityBiji: 490,
        volumeMl: 300,
        batchHours: 35,
        setupTimeMin: 5,
        notes: 'Mesin Floating: Fleksibel Lilin / Timah'
      }
    ]
  },
  {
    code: 'BOR',
    number: 7,
    pipeline: 'Shared',
    name: 'BOR (Pelubangan)',
    shortName: 'BOR',
    jmlMachine: '-',
    kapasitasMan: 3,
    isShared: true,
    leadtimeSec: 15,
    leadtimeDisplay: '15 dtk / bj (0.3 mnt/bj)',
    defaultLeadTimeMinutes: 41, // (490 bj * 15s) / (3 man * 60) ≈ 41 Menit (0.7 Jam)
    defaultLeadTimeHours: 0.7,
    capacityUnit: '1 bj / bor (3 man)',
    capacityBatchBiji: 1,
    secPerBiji: 15.0,
    minPerBiji: 0.3,
    speedBpm: 0.3,
    manPower: 3,
    colorTheme: 'teal',
    machines: [
      { id: 'BOR-01', code: 'BOR-01', name: 'Mesin Bor Presisi A', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 800 },
      { id: 'BOR-02', code: 'BOR-02', name: 'Mesin Bor Presisi B', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 800 }
    ]
  },
  {
    code: 'HL1',
    number: 8,
    pipeline: 'Shared',
    name: 'Hollowing 1 (HL 1)',
    shortName: 'HL1',
    jmlMachine: 1,
    kapasitasMan: '-',
    isShared: true,
    leadtimeSec: 46800,
    leadtimeDisplay: '780 Menit (13 Jam / 46.800s)',
    defaultLeadTimeMinutes: 780, // 13 Jam = 780 Menit
    defaultLeadTimeHours: 13.0,
    capacityUnit: '50 bj / batch',
    capacityBatchBiji: 50,
    secPerBiji: 936.0,
    minPerBiji: 15.6,
    speedBpm: 15.6,
    manPower: 1,
    colorTheme: 'violet',
    machines: [
      { id: 'HL1-01', code: 'HL1-01', name: 'Bak Hollowing 01', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 50 },
      { id: 'HL1-02', code: 'HL1-02', name: 'Bak Hollowing 02', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 50 }
    ]
  },
  {
    code: 'ANN',
    number: 9,
    pipeline: 'Shared',
    name: 'Annealing (ANN)',
    shortName: 'ANN',
    jmlMachine: 1,
    kapasitasMan: '-',
    isShared: true,
    leadtimeSec: 3600,
    leadtimeDisplay: '60 Menit (1 Jam / 3.600s)',
    defaultLeadTimeMinutes: 60, // 1 Jam = 60 Menit
    defaultLeadTimeHours: 1.0,
    capacityUnit: '150 bj / batch',
    capacityBatchBiji: 150,
    secPerBiji: 24.0,
    minPerBiji: 0.4,
    speedBpm: 0.4,
    manPower: 1,
    colorTheme: 'rose',
    machines: [
      { id: 'ANN-01', code: 'ANN-01', name: 'Tungku Annealing 01', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 240 },
      { id: 'ANN-02', code: 'ANN-02', name: 'Tungku Annealing 02', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 240 }
    ]
  },
  {
    code: 'HL2',
    number: 10,
    pipeline: 'Lilin',
    name: 'Hollowing 2 (HL 2)',
    shortName: 'HL2',
    jmlMachine: 1,
    kapasitasMan: '-',
    leadtimeSec: 46800,
    leadtimeDisplay: '780 Menit (13 Jam / 46.800s)',
    defaultLeadTimeMinutes: 780, // 13 Jam = 780 Menit
    defaultLeadTimeHours: 13.0,
    capacityUnit: '50 bj / batch',
    capacityBatchBiji: 50,
    secPerBiji: 936.0,
    minPerBiji: 15.6,
    speedBpm: 15.6,
    manPower: 1,
    colorTheme: 'purple',
    machines: [
      { id: 'HL2-01', code: 'HL2-01', name: 'Bak Hollowing 2 A', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 50 },
      { id: 'HL2-02', code: 'HL2-02', name: 'Bak Hollowing 2 B', type: 'Lilin', status: 'Running', maxDailyHours: 24, capacityBiji: 50 }
    ]
  },
  {
    code: 'TKD',
    number: 11,
    pipeline: 'Shared',
    name: 'Test Kadar (TKD)',
    shortName: 'TKD',
    isShared: true,
    leadtimeSec: 1200,
    leadtimeDisplay: '20 Menit',
    defaultLeadTimeMinutes: 20,
    defaultLeadTimeHours: 0.3,
    capacityUnit: '30 bj / batch',
    manPower: 1,
    colorTheme: 'emerald',
    machines: [
      { id: 'TKD-01', code: 'TKD-01', name: 'Station XRF Test Gold', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 200 }
    ]
  },
  {
    code: 'BJD',
    number: 12,
    pipeline: 'Shared',
    name: 'Buang Jig & Finishing (BJD)',
    shortName: 'BJD',
    isShared: true,
    leadtimeSec: 900,
    leadtimeDisplay: '15 Menit',
    defaultLeadTimeMinutes: 15,
    defaultLeadTimeHours: 0.3,
    capacityUnit: 'Per batch uji',
    manPower: 1,
    colorTheme: 'cyan',
    machines: [
      { id: 'BJD-01', code: 'BJD-01', name: 'Timbangan Presisi Bjd', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 500 }
    ]
  }
];

// ==========================================
// 2. JALUR TIMAH (14 SUB PROSES)
// ==========================================
export const TIMAH_PROCESSES = [
  {
    code: 'CET',
    number: 1,
    pipeline: 'Timah',
    name: 'Cetak Timah (CET)',
    shortName: 'CET',
    leadtimeSec: 45,
    leadtimeDisplay: '45 dtk / bj',
    defaultLeadTimeHours: 2.0,
    capacityUnit: '1 bj / injeksi',
    manPower: 1,
    colorTheme: 'slate',
    machines: [
      { id: 'MT-01', code: 'MT-01', name: 'Mesin Cor Timah 01', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 500 },
      { id: 'MT-02', code: 'MT-02', name: 'Mesin Cor Timah 02', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 500 }
    ]
  },
  {
    code: 'AMP',
    number: 2,
    pipeline: 'Timah',
    name: 'Amplas (AMP)',
    shortName: 'AMP',
    leadtimeSec: 60,
    leadtimeDisplay: '60 dtk / bj',
    defaultLeadTimeHours: 1.5,
    capacityUnit: '1 bj / amplas',
    manPower: 2,
    colorTheme: 'zinc',
    machines: [
      { id: 'AMP-01', code: 'AMP-01', name: 'Meja Amplas Timah A', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 400 },
      { id: 'AMP-02', code: 'AMP-02', name: 'Meja Amplas Timah B', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 400 }
    ]
  },
  {
    code: 'GLD',
    number: 3,
    pipeline: 'Timah',
    name: 'Glondong (GLD)',
    shortName: 'GLD',
    leadtimeSec: 1800,
    leadtimeDisplay: '30 Mnt / batch',
    defaultLeadTimeHours: 1.0,
    capacityUnit: '200 bj / batch',
    manPower: 1,
    colorTheme: 'stone',
    machines: [
      { id: 'GLD-01', code: 'GLD-01', name: 'Tromol Tumbler 01', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 600 },
      { id: 'GLD-02', code: 'GLD-02', name: 'Tromol Tumbler 02', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 600 }
    ]
  },
  {
    code: 'ULR',
    number: 4,
    pipeline: 'Timah',
    name: 'Ulur (ULR)',
    shortName: 'ULR',
    leadtimeSec: 90,
    leadtimeDisplay: '90 dtk / bj',
    defaultLeadTimeHours: 1.5,
    capacityUnit: '1 bj / ulur',
    manPower: 1,
    colorTheme: 'orange',
    machines: [
      { id: 'ULR-01', code: 'ULR-01', name: 'Mesin Ulur Timah', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 400 }
    ]
  },
  {
    code: 'STB',
    number: 5,
    pipeline: 'Timah',
    name: 'Setor Bersih / Bensin (STB)',
    shortName: 'STB',
    leadtimeSec: 180,
    leadtimeDisplay: '3 Mnt / batch',
    defaultLeadTimeHours: 1.0,
    capacityUnit: '1 batch cuci',
    manPower: 2,
    colorTheme: 'amber',
    machines: [
      { id: 'STB-01', code: 'STB-01', name: 'Bak Ultrasonic Timah', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 600 }
    ]
  },
  {
    code: 'ST1',
    number: 6,
    pipeline: 'Timah',
    name: 'ST 1 (Jigging Timah)',
    shortName: 'ST1',
    leadtimeSec: 15,
    leadtimeDisplay: '15 dtk / bj',
    defaultLeadTimeHours: 1.5,
    capacityUnit: '1 bj / rakit',
    manPower: 1,
    colorTheme: 'indigo',
    machines: [
      { id: 'JIG-T01', code: 'JIG-T01', name: 'Meja Jigging Timah', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 500 }
    ]
  },
  {
    code: 'EFT',
    number: 7,
    pipeline: 'Timah',
    name: 'Electroforming Timah (EFT)',
    shortName: 'EFT',
    isEFBath: true,
    isFeatured: true,
    leadtimeSec: 126000,
    leadtimeDisplay: '35 Jam (126.000s)',
    defaultLeadTimeHours: 35.0,
    capacityUnit: '490 bj / batch',
    capacityBatchBiji: 490,
    manPower: 4,
    colorTheme: 'blue',
    machines: [
      {
        id: 'EF-04',
        code: 'EF-04',
        name: 'Bath Electroforming 04',
        type: 'Timah',
        isFloating: false,
        status: 'Running',
        maxDailyHours: 24,
        capacityBiji: 490,
        volumeMl: 350,
        batchHours: 35,
        setupTimeMin: 5,
        notes: 'Dedicated Core Timah'
      }
    ]
  },
  {
    code: 'ST2',
    number: 8,
    pipeline: 'Timah',
    name: 'ST 2 (Pelepasan Jig)',
    shortName: 'ST2',
    leadtimeSec: 20,
    leadtimeDisplay: '20 dtk / bj',
    defaultLeadTimeHours: 1.0,
    capacityUnit: '1 bj / bongkar',
    manPower: 1,
    colorTheme: 'sky',
    machines: [
      { id: 'ST2-01', code: 'ST2-01', name: 'Meja Bongkar ST2 Timah', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 500 }
    ]
  },
  {
    code: 'BOR',
    number: 9,
    pipeline: 'Shared',
    name: 'BOR (Pelubangan)',
    shortName: 'BOR',
    isShared: true,
    leadtimeSec: 15,
    leadtimeDisplay: '15 dtk / bj',
    defaultLeadTimeHours: 1.0,
    capacityUnit: '1 bj / bor',
    manPower: 3,
    colorTheme: 'teal',
    machines: [
      { id: 'BOR-01', code: 'BOR-01', name: 'Mesin Bor Presisi A', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 800 }
    ]
  },
  {
    code: 'OVN',
    number: 10,
    pipeline: 'Timah',
    name: 'Oven Melting Timah (OVN)',
    shortName: 'OVN',
    leadtimeSec: 7200,
    leadtimeDisplay: '2 Jam',
    defaultLeadTimeHours: 2.0,
    capacityUnit: '300 bj / batch',
    capacityBatchBiji: 300,
    manPower: 1,
    colorTheme: 'red',
    machines: [
      { id: 'OVN-01', code: 'OVN-01', name: 'Oven Pelelehan Timah 01', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 300 },
      { id: 'OVN-02', code: 'OVN-02', name: 'Oven Pelelehan Timah 02', type: 'Timah', status: 'Running', maxDailyHours: 24, capacityBiji: 300 }
    ]
  },
  {
    code: 'HL1',
    number: 11,
    pipeline: 'Shared',
    name: 'Hollowing 1 (HL 1)',
    shortName: 'HL1',
    isShared: true,
    leadtimeSec: 46800,
    leadtimeDisplay: '13 Jam (46.800s)',
    defaultLeadTimeHours: 13.0,
    capacityUnit: '50 bj / batch',
    capacityBatchBiji: 50,
    manPower: 1,
    colorTheme: 'violet',
    machines: [
      { id: 'HL1-01', code: 'HL1-01', name: 'Bak Hollowing 01', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 50 }
    ]
  },
  {
    code: 'ANN',
    number: 12,
    pipeline: 'Shared',
    name: 'Annealing (ANN)',
    shortName: 'ANN',
    isShared: true,
    leadtimeSec: 3600,
    leadtimeDisplay: '1 Jam (3.600s)',
    defaultLeadTimeHours: 1.0,
    capacityUnit: '240 bj / batch',
    capacityBatchBiji: 240,
    manPower: 1,
    colorTheme: 'rose',
    machines: [
      { id: 'ANN-01', code: 'ANN-01', name: 'Tungku Annealing 01', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 240 }
    ]
  },
  {
    code: 'TKD',
    number: 13,
    pipeline: 'Shared',
    name: 'Test Kadar (TKD)',
    shortName: 'TKD',
    isShared: true,
    leadtimeSec: 1200,
    leadtimeDisplay: '20 Menit',
    defaultLeadTimeHours: 0.5,
    capacityUnit: 'Per batch uji',
    manPower: 1,
    colorTheme: 'emerald',
    machines: [
      { id: 'TKD-01', code: 'TKD-01', name: 'Station XRF Test Gold', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 200 }
    ]
  },
  {
    code: 'BJD',
    number: 14,
    pipeline: 'Shared',
    name: 'Berat Jenis (BJD)',
    shortName: 'BJD',
    isShared: true,
    leadtimeSec: 900,
    leadtimeDisplay: '15 Menit',
    defaultLeadTimeHours: 0.5,
    capacityUnit: 'Per batch uji',
    manPower: 1,
    colorTheme: 'cyan',
    machines: [
      { id: 'BJD-01', code: 'BJD-01', name: 'Timbangan Presisi Bjd', type: 'Shared', status: 'Running', maxDailyHours: 24, capacityBiji: 500 }
    ]
  }
];

// Unified list for backward-compatibility or full view
export const PROCESS_GROUPS = [
  ...LILIN_PROCESSES.map(p => ({ ...p, code: `LILIN-${p.code}` })),
  ...TIMAH_PROCESSES.map(p => ({ ...p, code: `TIMAH-${p.code}` }))
];

// 4 EF Machines Master (3 Lilin, 1 Timah, with EF-03 floating)
export const INITIAL_MACHINES = [
  {
    id: 'EF-01',
    code: 'EF-01',
    name: 'Mesin Electroforming 01',
    type: 'Lilin',
    isFloating: false,
    status: 'Running',
    capacityBiji: 490,
    batchHours: 35,
    volumeMl: 350,
    speedBjPerMin: 0.85,
    setupTimeMin: 5,
    notes: 'Dedicated Lilin 24K'
  },
  {
    id: 'EF-02',
    code: 'EF-02',
    name: 'Mesin Electroforming 02',
    type: 'Lilin',
    isFloating: false,
    status: 'Running',
    capacityBiji: 490,
    batchHours: 35,
    volumeMl: 350,
    speedBjPerMin: 0.88,
    setupTimeMin: 5,
    notes: 'Dedicated Lilin 24K'
  },
  {
    id: 'EF-03',
    code: 'EF-03',
    name: 'Mesin Electroforming 03',
    type: 'Lilin',
    isFloating: true,
    currentAssignment: 'Lilin',
    status: 'Running',
    capacityBiji: 490,
    batchHours: 35,
    volumeMl: 300,
    speedBjPerMin: 0.92,
    setupTimeMin: 5,
    notes: 'Mesin Floating: Fleksibel Lilin / Timah'
  },
  {
    id: 'EF-04',
    code: 'EF-04',
    name: 'Mesin Electroforming 04',
    type: 'Timah',
    isFloating: false,
    status: 'Running',
    capacityBiji: 490,
    batchHours: 35,
    volumeMl: 350,
    speedBjPerMin: 1.15,
    setupTimeMin: 5,
    notes: 'Dedicated Core Timah'
  },
  {
    id: 'TA-01',
    code: 'TA-01',
    name: 'Bak Tembaga Asam 01',
    type: 'Lilin',
    isFloating: false,
    status: 'Running',
    capacityBiji: 490,
    batchHours: 1.8,
    setupTimeMin: 5,
    notes: 'Coating Tembaga Asam Lilin (110 Menit)'
  }
];

export const SUBPROSES_LIST = LILIN_PROCESSES;

export const INITIAL_OPERATORS = [
  { id: '019393', name: 'Rafael Abiyyu Budiarto', role: 'Operator Finishing', assignedProcess: 'HL2', shift: 1, phone: '081234567890' },
  { id: '019284', name: 'Joshua Yordana', role: 'ICT & Supervisor Schedule', assignedProcess: 'EF', shift: 1, phone: '081234567891' },
  { id: '018742', name: 'Bagus Prasetyo', role: 'Teknisi Electroforming', assignedProcess: 'EF', shift: 2, phone: '081234567892' },
  { id: '017651', name: 'Andi Saputra', role: 'Operator Cetak Lilin', assignedProcess: 'CEL', shift: 1, phone: '081234567893' },
  { id: '016599', name: 'Dwi Cahyono', role: 'Operator Wash & Silver', assignedProcess: 'SOL', shift: 1, phone: '081234567894' },
  { id: '018902', name: 'Eko Purnomo', role: 'Operator Jigging STI', assignedProcess: 'STI', shift: 1, phone: '081234567895' },
  { id: '019011', name: 'Fajar Nugroho', role: 'Operator Annealing', assignedProcess: 'ANN', shift: 3, phone: '081234567896' },
  { id: '017823', name: 'Gilang Ramadhan', role: 'Operator Bor', assignedProcess: 'BOR', shift: 2, phone: '081234567897' },
  { id: '016441', name: 'Hadi Wijaya', role: 'Quality Control Kadar', assignedProcess: 'TKD', shift: 1, phone: '081234567898' }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-01',
    soNumber: 'SO 1',
    voucherNo: 'VZF2A40039',
    modelCode: 'MDL-KL34-01',
    soNumber: 'SO 1',
    name: 'Kalung Hollow 24K Classic',
    biji: 42,
    volumeMl: 180,
    materialType: 'Lilin',
    currentSubproses: 'EFL',
    difficultyFactor: 1.0,
    status: 'In EF Bath',
    machineId: 'EF-01'
  },
  {
    id: 'ORD-02',
    soNumber: 'SO 2',
    voucherNo: 'VZF2A40040',
    modelCode: 'MDL-GL34-02',
    soNumber: 'SO 2',
    name: 'Gelang Hollow Rantai Sisik',
    biji: 60,
    volumeMl: 210,
    materialType: 'Lilin',
    currentSubproses: 'CEL',
    difficultyFactor: 1.5, // Rumit
    status: 'In Progress',
    machineId: 'ML-01'
  },
  {
    id: 'ORD-03',
    soNumber: 'SO 1',
    voucherNo: 'VZF2A40041',
    modelCode: 'MDL-CN34-03',
    soNumber: 'SO 1',
    name: 'Cincin Timah Cor Pria 24K',
    biji: 55,
    volumeMl: 150,
    materialType: 'Timah',
    currentSubproses: 'EFT',
    difficultyFactor: 1.0,
    status: 'In EF Bath',
    machineId: 'EF-04'
  },
  {
    id: 'ORD-04',
    soNumber: 'SO 2',
    voucherNo: 'VZF2A40042',
    modelCode: 'MDL-LT34-04',
    soNumber: 'SO 2',
    name: 'Liontin Charm Flora Hollow',
    biji: 48,
    volumeMl: 120,
    materialType: 'Lilin',
    currentSubproses: 'EFL',
    difficultyFactor: 1.5,
    status: 'In EF Bath',
    machineId: 'EF-02'
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'TX-01',
    voucherNo: 'VZF2A40039',
    modelCode: 'MDL-KL34-01',
    soNumber: 'SO 1',
    subproses: 'EFL',
    tukang: 'Bagus Prasetyo',
    beratAwalGr: 124.5,
    beratAkhirGr: 158.2,
    susutGr: 0.15,
    status: 'Approved',
    jamSetor: '08:30 WIB'
  }
];

// Complete end-to-end multi-step initial schedule blocks
// Order 1 (VZF2A40039 - Lilin): Tahap 1 s/d 11 Terjadwal Berurutan (termasuk Wash Bensin)
// Order 2 (VZF2A40041 - Timah): Tahap 1 s/d 14 Terjadwal Berurutan
// Order 3 (VZF2A40040 - Lilin Floating EF-03): Tahap 1 s/d 11 Terjadwal Berurutan
// Order 4 (VZF2A40042 - Lilin Rumit 1.5x): Tahap 1 s/d 11 Terjadwal Berurutan

function buildInitialOrderPipeline({
  voucherNo,
  modelCode,
  soNumber,
  materialType = 'Lilin',
  biji = 490,
  difficultyFactor = 1.0,
  startHour = 7.0,
  assignedStartMachine = null,
  assignedEFMachine = null,
  operatorName = 'Bagus Prasetyo',
  notes = ''
}) {
  const isLilin = materialType === 'Lilin';
  const processList = isLilin ? LILIN_PROCESSES : TIMAH_PROCESSES;
  const blocks = [];
  let currentStart = Number(startHour);

  processList.forEach((proc, index) => {
    let chosenMachineId = proc.machines[0]?.id;
    if ((proc.code === 'CEL' || proc.code === 'CET') && assignedStartMachine) {
      chosenMachineId = assignedStartMachine;
    } else if (proc.isEFBath && assignedEFMachine) {
      chosenMachineId = assignedEFMachine;
    } else if (proc.machines.length > 1) {
      if (assignedStartMachine === 'ML-02' && proc.machines.length >= 2) {
        chosenMachineId = proc.machines[1].id;
      } else if (assignedStartMachine === 'ML-03' && proc.machines.length >= 3) {
        chosenMachineId = proc.machines[2].id;
      } else {
        chosenMachineId = proc.machines[0].id;
      }
    }

    const baseMinutes = proc.defaultLeadTimeMinutes || Math.round((proc.defaultLeadTimeHours || 1.5) * 60);
    const durationMinutes = Math.round(baseMinutes * Number(difficultyFactor));
    const durationHours = Math.round((durationMinutes / 60) * 10) / 10;

    blocks.push({
      id: `BLK-${voucherNo}-${proc.code}`,
      pipeline: materialType,
      soNumber: soNumber || voucherNo,
      voucherNo: voucherNo.trim(),
      modelCode: modelCode.trim(),
      materialType,
      biji: Number(biji),
      stepNumber: index + 1,
      totalSteps: processList.length,
      processCode: proc.code,
      processName: proc.name,
      machineId: chosenMachineId,
      startHour: Math.round(currentStart * 10) / 10,
      durationMinutes,
      durationHours,
      difficultyFactor: Number(difficultyFactor),
      isLocked: false,
      operatorName: proc.isEFBath ? operatorName : 'Operator Tim Produksi',
      tesAirTime: proc.code === 'STI' || proc.code === 'ST1' ? '07:15 WIB' : null,
      notes: notes || `Rencana Order ${voucherNo} [Tahap ${index + 1}/${processList.length} - ${proc.name}]`
    });

    currentStart = Math.round((currentStart + durationHours + 0.1) * 10) / 10;
  });

  return blocks;
}

export const INITIAL_SCHEDULE_BLOCKS = [
  ...buildInitialOrderPipeline({
    voucherNo: 'VZF2A40039',
    modelCode: 'MDL-KL34-01',
    soNumber: 'SO 1',
    materialType: 'Lilin',
    biji: 490,
    difficultyFactor: 1.0,
    startHour: 7.0,
    assignedStartMachine: 'ML-01',
    assignedEFMachine: 'EF-01',
    operatorName: 'Bagus Prasetyo',
    notes: 'Kalung Hollow 24K Classic'
  }),
  ...buildInitialOrderPipeline({
    voucherNo: 'VZF2A40041',
    modelCode: 'MDL-CN34-03',
    soNumber: 'SO 1',
    materialType: 'Timah',
    biji: 490,
    difficultyFactor: 1.0,
    startHour: 7.0,
    assignedStartMachine: 'MT-01',
    assignedEFMachine: 'EF-04',
    operatorName: 'Bagus Prasetyo',
    notes: 'Cincin Timah Cor Pria 24K'
  }),
  ...buildInitialOrderPipeline({
    voucherNo: 'VZF2A40040',
    modelCode: 'MDL-GL34-02',
    soNumber: 'SO 2',
    materialType: 'Lilin',
    biji: 450,
    difficultyFactor: 1.0,
    startHour: 7.0,
    assignedStartMachine: 'ML-02',
    assignedEFMachine: 'EF-03',
    operatorName: 'Andi Saputra',
    notes: 'Gelang Rantai Sisik (Floating EF-03)'
  }),
  ...buildInitialOrderPipeline({
    voucherNo: 'VZF2A40042',
    modelCode: 'MDL-LT34-04',
    soNumber: 'SO 2',
    materialType: 'Lilin',
    biji: 480,
    difficultyFactor: 1.5,
    startHour: 7.0,
    assignedStartMachine: 'ML-03',
    assignedEFMachine: 'EF-02',
    operatorName: 'Joshua Yordana',
    notes: 'Liontin Charm Flora Hollow (Rumit 1.5x)'
  })
];
