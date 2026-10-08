// Plan vs Real Calculation and Data Management Utility
// Synchronized with UBS Gold Visual Board & Production Schedule System

import { LILIN_PROCESSES, TIMAH_PROCESSES } from '../data/initialData';

// Columns for Lilin visual board (matching Gambar 1)
export const LILIN_VISUAL_COLUMNS = [
  { code: 'CEL', label: 'CEL', subLabel: 'Cetak Lilin', name: 'Cetak Lilin', color: 'amber' },
  { code: 'SOL', label: 'SOL', subLabel: 'Silver Oil', name: 'Silver Oil', color: 'slate' },
  { code: 'ST1', label: 'ST1', subLabel: 'Tembaga Asam', name: 'Tembaga Asam 1', color: 'orange' },
  { code: 'EFL', label: 'EFL', subLabel: 'Electroforming', name: 'Elektroforming Lilin', color: 'blue' },
  { code: 'BOR', label: 'BOR', subLabel: 'Bor', name: 'Bor Pelubangan', color: 'teal' },
  { code: 'HL1', label: 'HL1', subLabel: 'Hollowing 1', name: 'Hollowing 1', color: 'violet' },
  { code: 'ANN', label: 'ANN', subLabel: 'Annealing', name: 'Annealing', color: 'rose' },
  { code: 'HL2', label: 'HL2', subLabel: 'Hollowing 2', name: 'Hollowing 2', color: 'purple' },
  { code: 'TKD', label: 'TKD', subLabel: 'Test Kadar', name: 'Test Kadar Gold', color: 'emerald' },
  { code: 'BJD', label: 'BJD', subLabel: 'Barang Jadi', name: 'Barang Jadi & Finishing', color: 'cyan' }
];

// Columns for Timah visual board
export const TIMAH_VISUAL_COLUMNS = [
  { code: 'CET', label: 'CET', subLabel: 'Cetak Timah', name: 'Cetak Timah', color: 'slate' },
  { code: 'AMP', label: 'AMP', subLabel: 'Amplas', name: 'Amplas Permukaan', color: 'zinc' },
  { code: 'GLD', label: 'GLD', subLabel: 'Glondong', name: 'Glondong Tumbler', color: 'stone' },
  { code: 'ULR', label: 'ULR', subLabel: 'Ulur', name: 'Ulur Kawat', color: 'orange' },
  { code: 'STB', label: 'STB', subLabel: 'Setor Bersih', name: 'Setor Bersih Bensin', color: 'amber' },
  { code: 'ST1', label: 'ST1', subLabel: 'Jigging', name: 'Jigging Timah ST1', color: 'indigo' },
  { code: 'EFT', label: 'EFT', subLabel: 'Electroforming', name: 'Elektroforming Timah', color: 'blue' },
  { code: 'ST2', label: 'ST2', subLabel: 'Bongkar Jig', name: 'Pelepasan Jig ST2', color: 'sky' },
  { code: 'BOR', label: 'BOR', subLabel: 'Bor', name: 'Bor Pelubangan', color: 'teal' },
  { code: 'OVN', label: 'OVN', subLabel: 'Oven Timah', name: 'Oven Melting Timah', color: 'red' },
  { code: 'HL1', label: 'HL1', subLabel: 'Hollowing 1', name: 'Hollowing 1', color: 'violet' },
  { code: 'ANN', label: 'ANN', subLabel: 'Annealing', name: 'Annealing', color: 'rose' },
  { code: 'TKD', label: 'TKD', subLabel: 'Test Kadar', name: 'Test Kadar Gold', color: 'emerald' },
  { code: 'BJD', label: 'BJD', subLabel: 'Barang Jadi', name: 'Barang Jadi & Finishing', color: 'cyan' }
];

// Master list of realistic factory vouchers matching Gambar 1
export const REALISTIC_FACTORY_VOUCHERS = [
  // CEL Vouchers (dari Gambar 1 baris 57-67 dan seterusnya)
  {
    voucherNo: 'VZF2A30026',
    modelCode: 'MDL-KL34-01',
    modelName: 'Kalung Hollow 24K Classic',
    materialType: 'Lilin',
    biji: 40,
    beratTotalGr: 18.5,
    entryDate: '03-10 11:39',
    actualStage: 'CEL',
    plannedStage: 'ST1',
    plannedFinishHours: '04-10 15:00',
    condition: 'OVERDUE',
    delayHours: 68.5,
    delayText: 'Terlambat 68.5 Jam',
    reason: 'Antrean mesin lilin padat & revisi model',
    operator: 'Andi Saputra',
    machine: 'ML-01',
    planBiji: 40,
    realBiji: 40,
    planBeratGr: 18.5,
    realBeratGr: 18.2
  },
  {
    voucherNo: 'VZF2A20169',
    modelCode: 'MDL-GL34-02',
    modelName: 'Gelang Hollow Sisik Naga',
    materialType: 'Lilin',
    biji: 150,
    beratTotalGr: 62.0,
    entryDate: '05-10 12:39',
    actualStage: 'CEL',
    plannedStage: 'SOL',
    plannedFinishHours: '06-10 10:00',
    condition: 'OVERDUE',
    delayHours: 24.0,
    delayText: 'Terlambat 24.0 Jam',
    reason: 'Menunggu pendinginan lilin cetak',
    operator: 'Andi Saputra',
    machine: 'ML-02',
    planBiji: 150,
    realBiji: 150,
    planBeratGr: 62.0,
    realBeratGr: 61.8
  },
  {
    voucherNo: 'VZF2A30071',
    modelCode: 'MDL-LT34-05',
    modelName: 'Liontin Bulat Ukir Daun',
    materialType: 'Lilin',
    biji: 70,
    beratTotalGr: 24.5,
    entryDate: '05-10 12:40',
    actualStage: 'CEL',
    plannedStage: 'SOL',
    plannedFinishHours: '06-10 11:30',
    condition: 'OVERDUE',
    delayHours: 23.0,
    delayText: 'Terlambat 23.0 Jam',
    reason: 'Koreksi cetakan runner',
    operator: 'Andi Saputra',
    machine: 'ML-01',
    planBiji: 70,
    realBiji: 70,
    planBeratGr: 24.5,
    realBeratGr: 24.5
  },
  {
    voucherNo: 'VZF2A30070',
    modelCode: 'MDL-CN34-08',
    modelName: 'Cincin Kawin Polos Gold',
    materialType: 'Lilin',
    biji: 140,
    beratTotalGr: 49.0,
    entryDate: '05-10 12:40',
    actualStage: 'CEL',
    plannedStage: 'SOL',
    plannedFinishHours: '06-10 12:00',
    condition: 'OVERDUE',
    delayHours: 22.5,
    delayText: 'Terlambat 22.5 Jam',
    reason: 'Kapasitas injektor lilin maksimal',
    operator: 'Andi Saputra',
    machine: 'ML-02',
    planBiji: 140,
    realBiji: 140,
    planBeratGr: 49.0,
    realBeratGr: 48.9
  },
  {
    voucherNo: 'VZF2A40048',
    modelCode: 'MDL-GL34-11',
    modelName: 'Gelang Paperclip Chunky 24K',
    materialType: 'Lilin',
    biji: 70,
    beratTotalGr: 31.5,
    entryDate: '05-10 12:40',
    actualStage: 'CEL',
    plannedStage: 'CEL',
    plannedFinishHours: '06-10 14:00',
    condition: 'OVERDUE',
    delayHours: 20.5,
    delayText: 'Terlambat 20.5 Jam',
    reason: 'Pembersihan nozzle lilin',
    operator: 'Andi Saputra',
    machine: 'ML-03',
    planBiji: 70,
    realBiji: 70,
    planBeratGr: 31.5,
    realBeratGr: 31.4
  },
  {
    voucherNo: 'VZF2A40003',
    modelCode: 'MDL-KL34-14',
    modelName: 'Kalung Rantai Milano Hollow',
    materialType: 'Lilin',
    biji: 70,
    beratTotalGr: 28.0,
    entryDate: '05-10 12:40',
    actualStage: 'CEL',
    plannedStage: 'SOL',
    plannedFinishHours: '06-10 15:30',
    condition: 'OVERDUE',
    delayHours: 19.0,
    delayText: 'Terlambat 19.0 Jam',
    reason: 'Antrean tukang perak',
    operator: 'Andi Saputra',
    machine: 'ML-01',
    planBiji: 70,
    realBiji: 70,
    planBeratGr: 28.0,
    realBeratGr: 28.0
  },
  {
    voucherNo: 'VZF2A40047',
    modelCode: 'MDL-CN34-16',
    modelName: 'Cincin Solitaire Mahkota',
    materialType: 'Lilin',
    biji: 140,
    beratTotalGr: 42.0,
    entryDate: '05-10 12:40',
    actualStage: 'CEL',
    plannedStage: 'SOL',
    plannedFinishHours: '06-10 16:00',
    condition: 'OVERDUE',
    delayHours: 18.5,
    delayText: 'Terlambat 18.5 Jam',
    reason: 'Penyesuaian suhu injeksi lilin',
    operator: 'Andi Saputra',
    machine: 'ML-02',
    planBiji: 140,
    realBiji: 140,
    planBeratGr: 42.0,
    realBeratGr: 41.9
  },
  {
    voucherNo: 'VZF2A40046',
    modelCode: 'MDL-LT34-18',
    modelName: 'Liontin Hati Hollow Filigree',
    materialType: 'Lilin',
    biji: 140,
    beratTotalGr: 38.5,
    entryDate: '05-10 12:40',
    actualStage: 'CEL',
    plannedStage: 'CEL',
    plannedFinishHours: '06-10 17:00',
    condition: 'OVERDUE',
    delayHours: 17.5,
    delayText: 'Terlambat 17.5 Jam',
    reason: 'Pemeriksaan cetakan karet master',
    operator: 'Andi Saputra',
    machine: 'ML-03',
    planBiji: 140,
    realBiji: 140,
    planBeratGr: 38.5,
    realBeratGr: 38.5
  },
  {
    voucherNo: 'VZF2A40049',
    modelCode: 'MDL-KL34-20',
    modelName: 'Kalung Choker Cubano Hollow',
    materialType: 'Lilin',
    biji: 70,
    beratTotalGr: 35.0,
    entryDate: '05-10 16:58',
    actualStage: 'CEL',
    plannedStage: 'CEL',
    plannedFinishHours: '06-10 20:00',
    condition: 'OVERDUE',
    delayHours: 14.5,
    delayText: 'Terlambat 14.5 Jam',
    reason: 'Proses batch lilin berikutnya',
    operator: 'Andi Saputra',
    machine: 'ML-01',
    planBiji: 70,
    realBiji: 70,
    planBeratGr: 35.0,
    realBeratGr: 34.8
  },
  {
    voucherNo: 'VZF2A40056',
    modelCode: 'MDL-GL34-22',
    modelName: 'Gelang Bangle Hollow Oval',
    materialType: 'Lilin',
    biji: 70,
    beratTotalGr: 33.2,
    entryDate: '05-10 16:58',
    actualStage: 'CEL',
    plannedStage: 'CEL',
    plannedFinishHours: '06-10 21:00',
    condition: 'OVERDUE',
    delayHours: 13.5,
    delayText: 'Terlambat 13.5 Jam',
    reason: 'Inspeksi kerapatan lilin',
    operator: 'Andi Saputra',
    machine: 'ML-02',
    planBiji: 70,
    realBiji: 70,
    planBeratGr: 33.2,
    realBeratGr: 33.0
  },
  {
    voucherNo: 'VZF2A60072',
    modelCode: 'MDL-KL34-25',
    modelName: 'Kalung Nuri Hollow Gold',
    materialType: 'Lilin',
    biji: 70,
    beratTotalGr: 29.5,
    entryDate: '06-10 17:26',
    actualStage: 'CEL',
    plannedStage: 'CEL',
    plannedFinishHours: '07-10 11:30',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Sesuai jadwal shift cetak',
    operator: 'Andi Saputra',
    machine: 'ML-01',
    planBiji: 70,
    realBiji: 70,
    planBeratGr: 29.5,
    realBeratGr: 29.5
  },
  {
    voucherNo: 'VZF2A60069',
    modelCode: 'MDL-CN34-27',
    modelName: 'Cincin Elegan Wave Hollow',
    materialType: 'Lilin',
    biji: 70,
    beratTotalGr: 22.0,
    entryDate: '06-10 17:26',
    actualStage: 'CEL',
    plannedStage: 'CEL',
    plannedFinishHours: '07-10 12:00',
    condition: 'ON TRACK',
    delayHours: 0.0,
    delayText: 'On Track (Aman)',
    reason: 'Sedang berlangsung di mesin lilin 02',
    operator: 'Andi Saputra',
    machine: 'ML-02',
    planBiji: 70,
    realBiji: 70,
    planBeratGr: 22.0,
    realBeratGr: 22.0
  },
  {
    voucherNo: 'VZF2A60088',
    modelCode: 'MDL-GL34-29',
    modelName: 'Gelang Plat Ukir Batik 24K',
    materialType: 'Lilin',
    biji: 80,
    beratTotalGr: 45.0,
    entryDate: '07-10 07:30',
    actualStage: 'CEL',
    plannedStage: 'CEL',
    plannedFinishHours: '07-10 14:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Batch pagi shift 1',
    operator: 'Andi Saputra',
    machine: 'ML-03',
    planBiji: 80,
    realBiji: 80,
    planBeratGr: 45.0,
    realBeratGr: 45.0
  },

  // SOL Vouchers (Silver Oil - 41 vouchers representative batch)
  {
    voucherNo: 'VZF2A40051',
    modelCode: 'MDL-KL34-31',
    modelName: 'Kalung Rantai Figaro Hollow',
    materialType: 'Lilin',
    biji: 65,
    beratTotalGr: 26.0,
    entryDate: '06-10 09:15',
    actualStage: 'SOL',
    plannedStage: 'SOL',
    plannedFinishHours: '07-10 11:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Proses semprot cat perak lapisan 1',
    operator: 'Dwi Cahyono',
    machine: 'SOL-01',
    planBiji: 65,
    realBiji: 65,
    planBeratGr: 26.0,
    realBeratGr: 26.2
  },
  {
    voucherNo: 'VZF2A40052',
    modelCode: 'MDL-GL34-33',
    modelName: 'Gelang Tennis Hollow 24K',
    materialType: 'Lilin',
    biji: 90,
    beratTotalGr: 36.5,
    entryDate: '06-10 10:20',
    actualStage: 'SOL',
    plannedStage: 'ST1',
    plannedFinishHours: '06-10 22:00',
    condition: 'OVERDUE',
    delayHours: 12.5,
    delayText: 'Terlambat 12.5 Jam',
    reason: 'Penyemprotan ulang karena cat tipis',
    operator: 'Dwi Cahyono',
    machine: 'SOL-02',
    planBiji: 90,
    realBiji: 90,
    planBeratGr: 36.5,
    realBeratGr: 36.8
  },
  {
    voucherNo: 'VZF2A40053',
    modelCode: 'MDL-LT34-35',
    modelName: 'Liontin Huruf Monogram Gold',
    materialType: 'Lilin',
    biji: 120,
    beratTotalGr: 48.0,
    entryDate: '06-10 14:00',
    actualStage: 'SOL',
    plannedStage: 'SOL',
    plannedFinishHours: '07-10 13:30',
    condition: 'ON TRACK',
    delayHours: 0.0,
    delayText: 'On Track (Aman)',
    reason: 'Pengeringan perak di rak sirkulasi',
    operator: 'Dwi Cahyono',
    machine: 'SOL-01',
    planBiji: 120,
    realBiji: 120,
    planBeratGr: 48.0,
    realBeratGr: 48.3
  },
  {
    voucherNo: 'VZF2A40054',
    modelCode: 'MDL-CN34-37',
    modelName: 'Cincin Etnik Anyaman Lilin',
    materialType: 'Lilin',
    biji: 85,
    beratTotalGr: 32.0,
    entryDate: '06-10 15:45',
    actualStage: 'SOL',
    plannedStage: 'SOL',
    plannedFinishHours: '07-10 14:00',
    condition: 'ON TRACK',
    delayHours: 0.0,
    delayText: 'On Track (Aman)',
    reason: 'Silver oil tahap finishing konduktif',
    operator: 'Dwi Cahyono',
    machine: 'SOL-02',
    planBiji: 85,
    realBiji: 85,
    planBeratGr: 32.0,
    realBeratGr: 32.1
  },
  {
    voucherNo: 'VZF2A40055',
    modelCode: 'MDL-KL34-39',
    modelName: 'Kalung Rosary Beads Hollow',
    materialType: 'Lilin',
    biji: 110,
    beratTotalGr: 52.0,
    entryDate: '06-10 18:30',
    actualStage: 'SOL',
    plannedStage: 'SOL',
    plannedFinishHours: '07-10 15:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Menunggu tes kontinuitas listrik',
    operator: 'Dwi Cahyono',
    machine: 'SOL-01',
    planBiji: 110,
    realBiji: 110,
    planBeratGr: 52.0,
    realBeratGr: 52.2
  },

  // ST1 Vouchers (Tembaga Asam 1 - 4 vouchers sesuai gambar)
  {
    voucherNo: 'VZF2A40061',
    modelCode: 'MDL-KL34-42',
    modelName: 'Kalung Snake Chain 24K',
    materialType: 'Lilin',
    biji: 95,
    beratTotalGr: 44.0,
    entryDate: '07-10 08:00',
    actualStage: 'ST1',
    plannedStage: 'ST1',
    plannedFinishHours: '07-10 10:45',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Sedang pelapisan tembaga asam (110 mnt)',
    operator: 'Eko Purnomo',
    machine: 'TA-01',
    planBiji: 95,
    realBiji: 95,
    planBeratGr: 44.0,
    realBeratGr: 45.1
  },
  {
    voucherNo: 'VZF2A40062',
    modelCode: 'MDL-GL34-44',
    modelName: 'Gelang Cuff Floral Hollow',
    materialType: 'Lilin',
    biji: 60,
    beratTotalGr: 38.0,
    entryDate: '07-10 08:30',
    actualStage: 'ST1',
    plannedStage: 'ST1',
    plannedFinishHours: '07-10 11:15',
    condition: 'ON TRACK',
    delayHours: 0.0,
    delayText: 'On Track (Aman)',
    reason: 'Arus listrik stabil 12 Ampere',
    operator: 'Eko Purnomo',
    machine: 'TA-01',
    planBiji: 60,
    realBiji: 60,
    planBeratGr: 38.0,
    realBeratGr: 38.9
  },
  {
    voucherNo: 'VZF2A40063',
    modelCode: 'MDL-CN34-46',
    modelName: 'Cincin Signet Kubus Hollow',
    materialType: 'Lilin',
    biji: 80,
    beratTotalGr: 29.0,
    entryDate: '06-10 21:00',
    actualStage: 'ST1',
    plannedStage: 'EFL',
    plannedFinishHours: '07-10 06:00',
    condition: 'OVERDUE',
    delayHours: 4.8,
    delayText: 'Terlambat 4.8 Jam',
    reason: 'Menunggu bath EFL kosong',
    operator: 'Eko Purnomo',
    machine: 'TA-01',
    planBiji: 80,
    realBiji: 80,
    planBeratGr: 29.0,
    realBeratGr: 29.8
  },
  {
    voucherNo: 'VZF2A40064',
    modelCode: 'MDL-LT34-48',
    modelName: 'Liontin Bintang Kejora Hollow',
    materialType: 'Lilin',
    biji: 100,
    beratTotalGr: 35.0,
    entryDate: '07-10 09:10',
    actualStage: 'ST1',
    plannedStage: 'ST1',
    plannedFinishHours: '07-10 12:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Jigging dan cek kontak pin kawat',
    operator: 'Eko Purnomo',
    machine: 'TA-01',
    planBiji: 100,
    realBiji: 100,
    planBeratGr: 35.0,
    realBeratGr: 35.5
  },

  // EFL Vouchers (Elektroforming Lilin - mesin EF-01, EF-02, EF-03)
  {
    voucherNo: 'VZF2A40039',
    modelCode: 'MDL-KL34-01',
    modelName: 'Kalung Hollow 24K Classic',
    materialType: 'Lilin',
    biji: 42,
    beratTotalGr: 158.2,
    entryDate: '06-10 07:00',
    actualStage: 'EFL',
    plannedStage: 'EFL',
    plannedFinishHours: '07-10 18:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Proses sepuh emas 24K dalam bath (siklus 35 jam)',
    operator: 'Bagus Prasetyo',
    machine: 'EF-01',
    planBiji: 42,
    realBiji: 42,
    planBeratGr: 158.0,
    realBeratGr: 158.2
  },
  {
    voucherNo: 'VZF2A40040',
    modelCode: 'MDL-GL34-02',
    modelName: 'Gelang Hollow Rantai Sisik',
    materialType: 'Lilin',
    biji: 60,
    beratTotalGr: 185.0,
    entryDate: '06-10 12:00',
    actualStage: 'EFL',
    plannedStage: 'EFL',
    plannedFinishHours: '07-10 23:00',
    condition: 'ON TRACK',
    delayHours: 0.0,
    delayText: 'On Track (Aman)',
    reason: 'Sedang plating di Mesin Floating EF-03',
    operator: 'Joshua Yordana',
    machine: 'EF-03',
    planBiji: 60,
    realBiji: 60,
    planBeratGr: 185.0,
    realBeratGr: 184.8
  },
  {
    voucherNo: 'VZF2A40042',
    modelCode: 'MDL-LT34-04',
    modelName: 'Liontin Charm Flora Hollow',
    materialType: 'Lilin',
    biji: 48,
    beratTotalGr: 140.0,
    entryDate: '06-10 08:30',
    actualStage: 'EFL',
    plannedStage: 'EFL',
    plannedFinishHours: '07-10 19:30',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Plating bath EF-02 bobot rumit 1.5x',
    operator: 'Bagus Prasetyo',
    machine: 'EF-02',
    planBiji: 48,
    realBiji: 48,
    planBeratGr: 140.0,
    realBeratGr: 140.5
  },

  // BOR Vouchers (Shared Machinery)
  {
    voucherNo: 'VZF2A40035',
    modelCode: 'MDL-KL34-52',
    modelName: 'Kalung Tali Tambang Hollow',
    materialType: 'Lilin',
    biji: 55,
    beratTotalGr: 145.0,
    entryDate: '07-10 09:30',
    actualStage: 'BOR',
    plannedStage: 'BOR',
    plannedFinishHours: '07-10 11:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Pelubangan lubang kuras lilin presisi',
    operator: 'Gilang Ramadhan',
    machine: 'BOR-01',
    planBiji: 55,
    realBiji: 55,
    planBeratGr: 145.0,
    realBeratGr: 144.6
  },

  // HL1 Vouchers (Hollowing 1)
  {
    voucherNo: 'VZF2A40036',
    modelCode: 'MDL-GL34-54',
    modelName: 'Gelang Kerang Mutiara Hollow',
    materialType: 'Lilin',
    biji: 50,
    beratTotalGr: 160.0,
    entryDate: '07-10 06:00',
    actualStage: 'HL1',
    plannedStage: 'HL1',
    plannedFinishHours: '07-10 19:00',
    condition: 'ON TRACK',
    delayHours: 0.0,
    delayText: 'On Track (Aman)',
    reason: 'Peleburan lilin tahap 1 dalam air panas bertekanan',
    operator: 'Rafael Abiyyu',
    machine: 'HL1-01',
    planBiji: 50,
    realBiji: 50,
    planBeratGr: 160.0,
    realBeratGr: 159.2
  },

  // ANN Vouchers (Annealing)
  {
    voucherNo: 'VZF2A40037',
    modelCode: 'MDL-CN34-56',
    modelName: 'Cincin Mahkota Ratu 24K',
    materialType: 'Lilin',
    biji: 120,
    beratTotalGr: 130.0,
    entryDate: '07-10 09:00',
    actualStage: 'ANN',
    plannedStage: 'ANN',
    plannedFinishHours: '07-10 10:30',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Annealing tungku 650°C penghilang tegangan emas',
    operator: 'Fajar Nugroho',
    machine: 'ANN-01',
    planBiji: 120,
    realBiji: 120,
    planBeratGr: 130.0,
    realBeratGr: 129.8
  },

  // HL2 Vouchers (Hollowing 2 - 4 vouchers sesuai gambar)
  {
    voucherNo: 'VZF2A40031',
    modelCode: 'MDL-KL34-60',
    modelName: 'Kalung Rantai Rolo Hollow',
    materialType: 'Lilin',
    biji: 45,
    beratTotalGr: 148.0,
    entryDate: '06-10 22:00',
    actualStage: 'HL2',
    plannedStage: 'HL2',
    plannedFinishHours: '07-10 11:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Pembersihan sisa lilin tahap 2 asam nitrat',
    operator: 'Rafael Abiyyu',
    machine: 'HL2-01',
    planBiji: 45,
    realBiji: 45,
    planBeratGr: 148.0,
    realBeratGr: 147.5
  },
  {
    voucherNo: 'VZF2A40032',
    modelCode: 'MDL-GL34-62',
    modelName: 'Gelang Sisik Ikan Mas 24K',
    materialType: 'Lilin',
    biji: 50,
    beratTotalGr: 172.0,
    entryDate: '06-10 23:30',
    actualStage: 'HL2',
    plannedStage: 'HL2',
    plannedFinishHours: '07-10 12:30',
    condition: 'ON TRACK',
    delayHours: 0.0,
    delayText: 'On Track (Aman)',
    reason: 'Sirkulasi asam hollowing berjalan normal',
    operator: 'Rafael Abiyyu',
    machine: 'HL2-02',
    planBiji: 50,
    realBiji: 50,
    planBeratGr: 172.0,
    realBeratGr: 171.8
  },
  {
    voucherNo: 'VZF2A40033',
    modelCode: 'MDL-CN34-64',
    modelName: 'Cincin Ukir Naga Klasik',
    materialType: 'Lilin',
    biji: 48,
    beratTotalGr: 115.0,
    entryDate: '06-10 18:00',
    actualStage: 'HL2',
    plannedStage: 'TKD',
    plannedFinishHours: '07-10 07:00',
    condition: 'OVERDUE',
    delayHours: 3.7,
    delayText: 'Terlambat 3.7 Jam',
    reason: 'Pembersihan rongga rumit butuh perendaman ekstra',
    operator: 'Rafael Abiyyu',
    machine: 'HL2-01',
    planBiji: 48,
    realBiji: 48,
    planBeratGr: 115.0,
    realBeratGr: 114.2
  },
  {
    voucherNo: 'VZF2A40034',
    modelCode: 'MDL-LT34-66',
    modelName: 'Liontin Tabung Religi Hollow',
    materialType: 'Lilin',
    biji: 50,
    beratTotalGr: 135.0,
    entryDate: '07-10 01:00',
    actualStage: 'HL2',
    plannedStage: 'HL2',
    plannedFinishHours: '07-10 14:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Hollowing 2 proses akhir lilin',
    operator: 'Rafael Abiyyu',
    machine: 'HL2-02',
    planBiji: 50,
    realBiji: 50,
    planBeratGr: 135.0,
    realBeratGr: 134.8
  },

  // TKD Vouchers (Tunggu Kadar / Test Kadar)
  {
    voucherNo: 'VZF2A40038',
    modelCode: 'MDL-KL34-70',
    modelName: 'Kalung Rantai Sisik Naga',
    materialType: 'Lilin',
    biji: 40,
    beratTotalGr: 155.0,
    entryDate: '07-10 10:00',
    actualStage: 'TKD',
    plannedStage: 'TKD',
    plannedFinishHours: '07-10 10:45',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Uji spektrometri XRF kadar emas murni 99.9%',
    operator: 'Hadi Wijaya',
    machine: 'TKD-01',
    planBiji: 40,
    realBiji: 40,
    planBeratGr: 155.0,
    realBeratGr: 155.1
  },

  // BJD Vouchers (Barang Jadi)
  {
    voucherNo: 'VZF2A40030',
    modelCode: 'MDL-GL34-75',
    modelName: 'Gelang Charm Bintang Gold',
    materialType: 'Lilin',
    biji: 45,
    beratTotalGr: 162.0,
    entryDate: '07-10 10:15',
    actualStage: 'BJD',
    plannedStage: 'BJD',
    plannedFinishHours: '07-10 10:40',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Selesai Tepat Waktu',
    reason: 'Potong pin jigging dan penimbangan akhir',
    operator: 'Rafael Abiyyu',
    machine: 'BJD-01',
    planBiji: 45,
    realBiji: 45,
    planBeratGr: 162.0,
    realBeratGr: 161.9
  },

  // Timah Vouchers (Untuk perbandingan Jalur Timah)
  {
    voucherNo: 'VZF2A40041',
    modelCode: 'MDL-CN34-03',
    modelName: 'Cincin Timah Cor Pria 24K',
    materialType: 'Timah',
    biji: 55,
    beratTotalGr: 168.0,
    entryDate: '06-10 07:00',
    actualStage: 'EFT',
    plannedStage: 'EFT',
    plannedFinishHours: '07-10 18:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Plating Bath Timah EF-04 dedicated',
    operator: 'Bagus Prasetyo',
    machine: 'EF-04',
    planBiji: 55,
    realBiji: 55,
    planBeratGr: 168.0,
    realBeratGr: 168.4
  },
  {
    voucherNo: 'VZF2A40071',
    modelCode: 'MDL-TM34-10',
    modelName: 'Gelang Cor Timah Model Etnik',
    materialType: 'Timah',
    biji: 65,
    beratTotalGr: 195.0,
    entryDate: '05-10 14:00',
    actualStage: 'AMP',
    plannedStage: 'ST1',
    plannedFinishHours: '06-10 12:00',
    condition: 'OVERDUE',
    delayHours: 22.8,
    delayText: 'Terlambat 22.8 Jam',
    reason: 'Penghalusan sambungan cor timah ekstra',
    operator: 'Tukang Amplas B',
    machine: 'AMP-01',
    planBiji: 65,
    realBiji: 65,
    planBeratGr: 195.0,
    realBeratGr: 193.5
  },
  {
    voucherNo: 'VZF2A40072',
    modelCode: 'MDL-TM34-12',
    modelName: 'Kalung Liontin Timah Hollow 24K',
    materialType: 'Timah',
    biji: 50,
    beratTotalGr: 175.0,
    entryDate: '07-10 08:00',
    actualStage: 'CET',
    plannedStage: 'CET',
    plannedFinishHours: '07-10 11:00',
    condition: 'ON PLAN',
    delayHours: 0.0,
    delayText: 'Tepat Rencana',
    reason: 'Injeksi cetak cor timah mesin MT-01',
    operator: 'Operator Cor Timah',
    machine: 'MT-01',
    planBiji: 50,
    realBiji: 50,
    planBeratGr: 175.0,
    realBeratGr: 175.0
  }
];

// Helper to generate full 81 Lilin vouchers matching Gambar 1:
// - 32 in CEL
// - 41 in SOL
// - 4 in ST1
// - 4 in HL2
// Total = 81 vouchers!
// Normalizer helper: Ensures each voucher has strictly 2 indicator colors (green / yellow)
// and clear tracking of whether it is already realized or in-schedule (with past target detection)
export function normalizeFactoryVoucher(v) {
  // Finished stages or explicitly completed
  const isFinishedStage = v.actualStage === 'BJD' || v.actualStage === 'TKD' || v.status === 'REALIZED';
  
  const status = isFinishedStage ? 'REALIZED' : 'SCHEDULED';
  const indicatorColor = isFinishedStage ? 'green' : 'yellow';

  let scheduleState = 'ON_TARGET';
  let timingText = 'Dalam Target Rencana';

  if (isFinishedStage) {
    scheduleState = 'SELESAI';
    timingText = 'Selesai Tepat Waktu';
  } else if ((v.delayHours && v.delayHours > 0) || (v.plannedStage && v.plannedStage !== v.actualStage) || v.condition === 'OVERDUE') {
    scheduleState = 'PAST_TARGET';
    const delay = v.delayHours || 12.0;
    timingText = `Seharusnya Selesai (Lewat ${delay} Jam)`;
  } else {
    scheduleState = 'ON_TARGET';
    timingText = `Dalam Target (Target ${v.plannedFinishHours || 'Hari Ini'})`;
  }

  return {
    ...v,
    status,
    indicatorColor,
    scheduleState,
    statusLabel: isFinishedStage ? 'Terealisasi' : 'Sedang Di-Schedule',
    timingText,
    isPastTarget: scheduleState === 'PAST_TARGET'
  };
}

// Helper to generate full realistic factory vouchers (81 vouchers for Lilin matching factory baseline)
export function getCompleteFactoryVouchers() {
  const existing = REALISTIC_FACTORY_VOUCHERS.map((v, idx) => {
    // Make specific vouchers finished/realized to have realistic distribution
    const isRealized = v.actualStage === 'BJD' || v.actualStage === 'TKD' || idx % 4 === 0;
    return normalizeFactoryVoucher({
      ...v,
      status: isRealized ? 'REALIZED' : 'SCHEDULED'
    });
  });

  const celExisting = existing.filter(v => v.materialType === 'Lilin' && v.actualStage === 'CEL');
  const solExisting = existing.filter(v => v.materialType === 'Lilin' && v.actualStage === 'SOL');

  const generated = [...existing];

  // Fill CEL up to 32 vouchers
  const targetCel = 32;
  const celNeeded = targetCel - celExisting.length;
  for (let i = 1; i <= celNeeded; i++) {
    const vNum = 70 + i;
    const isLate = i % 2 === 0;
    const isCompletedBatch = !isLate && i % 3 === 0;

    const baseVoucher = {
      voucherNo: `VZF2A600${String(vNum).padStart(2, '0')}`,
      modelCode: `MDL-KL34-${String(20 + i).padStart(2, '0')}`,
      modelName: `Kalung Model ${String.fromCharCode(65 + (i % 26))} Lilin`,
      materialType: 'Lilin',
      biji: [40, 70, 140, 150][i % 4],
      beratTotalGr: parseFloat((20 + (i * 1.5) % 30).toFixed(1)),
      entryDate: isLate ? `05-10 14:${String((i * 7) % 60).padStart(2, '0')}` : `07-10 08:${String((i * 5) % 60).padStart(2, '0')}`,
      actualStage: 'CEL',
      plannedStage: isLate ? 'SOL' : 'CEL',
      plannedFinishHours: isLate ? '06-10 16:00' : '07-10 14:00',
      condition: isCompletedBatch ? 'ON PLAN' : (isLate ? 'OVERDUE' : 'ON TRACK'),
      status: isCompletedBatch ? 'REALIZED' : 'SCHEDULED',
      delayHours: isLate ? parseFloat((10 + (i * 0.8)).toFixed(1)) : 0.0,
      delayText: isLate ? `Terlambat ${(10 + (i * 0.8)).toFixed(1)} Jam` : 'Tepat Rencana',
      reason: isLate ? 'Antrean injeksi lilin padat' : 'Sedang proses pencetakan lilin',
      operator: 'Andi Saputra',
      machine: ['ML-01', 'ML-02', 'ML-03'][i % 3],
      planBiji: [40, 70, 140, 150][i % 4],
      realBiji: [40, 70, 140, 150][i % 4],
      planBeratGr: parseFloat((20 + (i * 1.5) % 30).toFixed(1)),
      realBeratGr: parseFloat((20 + (i * 1.5) % 30).toFixed(1))
    };

    generated.push(normalizeFactoryVoucher(baseVoucher));
  }

  // Fill SOL up to 41 vouchers
  const targetSol = 41;
  const solNeeded = targetSol - solExisting.length;
  for (let i = 1; i <= solNeeded; i++) {
    const vNum = 100 + i;
    const isLate = i % 3 === 0;
    const isCompletedBatch = !isLate && i % 4 === 1;

    const baseVoucher = {
      voucherNo: `VZF2A40${String(vNum).padStart(3, '0')}`,
      modelCode: `MDL-GL34-${String(30 + i).padStart(2, '0')}`,
      modelName: `Gelang Model ${String.fromCharCode(65 + (i % 26))} Lilin`,
      materialType: 'Lilin',
      biji: [50, 70, 85, 100, 120][i % 5],
      beratTotalGr: parseFloat((30 + (i * 1.8) % 40).toFixed(1)),
      entryDate: isLate ? `05-10 16:${String((i * 4) % 60).padStart(2, '0')}` : `06-10 20:${String((i * 6) % 60).padStart(2, '0')}`,
      actualStage: 'SOL',
      plannedStage: isLate ? 'ST1' : 'SOL',
      plannedFinishHours: isLate ? '06-10 18:00' : '07-10 15:00',
      condition: isCompletedBatch ? 'ON PLAN' : (isLate ? 'OVERDUE' : 'ON TRACK'),
      status: isCompletedBatch ? 'REALIZED' : 'SCHEDULED',
      delayHours: isLate ? parseFloat((8 + (i * 0.5)).toFixed(1)) : 0.0,
      delayText: isLate ? `Terlambat ${(8 + (i * 0.5)).toFixed(1)} Jam` : 'Tepat Rencana',
      reason: isLate ? 'Antrean semprot perak lapisan 2' : 'Pengeringan perak konduktif',
      operator: 'Dwi Cahyono',
      machine: ['SOL-01', 'SOL-02'][i % 2],
      planBiji: [50, 70, 85, 100, 120][i % 5],
      realBiji: [50, 70, 85, 100, 120][i % 5],
      planBeratGr: parseFloat((30 + (i * 1.8) % 40).toFixed(1)),
      realBeratGr: parseFloat((30 + (i * 1.8) % 40).toFixed(1))
    };

    generated.push(normalizeFactoryVoucher(baseVoucher));
  }

  return generated;
}

// Helper to calculate summary metrics with strictly 2 indicators: Hijau (Terealisasi) & Kuning (Sedang Di-Schedule)
export function calculateReportMetrics(vouchers = []) {
  const total = vouchers.length;
  
  // 🟢 Hijau: Sudah Terealisasi
  const realizedList = vouchers.filter(v => v.indicatorColor === 'green' || v.status === 'REALIZED');
  
  // 🟡 Kuning: Sedang Di-Schedule
  const scheduledList = vouchers.filter(v => v.indicatorColor === 'yellow' || v.status === 'SCHEDULED' || !realizedList.includes(v));

  // Di dalam yang Sedang Di-Schedule:
  // - Melewati Target Planning (Seharusnya sudah selesai)
  // - Dalam Target Normal (Sedang berjalan sesuai waktu)
  const pastTargetList = scheduledList.filter(v => v.scheduleState === 'PAST_TARGET' || (v.delayHours && v.delayHours > 0));
  const onTargetList = scheduledList.filter(v => !pastTargetList.includes(v));

  const totalPlanBiji = vouchers.reduce((sum, v) => sum + (v.planBiji || v.biji || 0), 0);
  const totalRealBiji = vouchers.reduce((sum, v) => sum + (v.realBiji || v.biji || 0), 0);
  const totalPlanBerat = vouchers.reduce((sum, v) => sum + (v.planBeratGr || v.beratTotalGr || 0), 0);
  const totalRealBerat = vouchers.reduce((sum, v) => sum + (v.realBeratGr || v.beratTotalGr || 0), 0);

  const avgDelayHours = pastTargetList.length > 0 
    ? (pastTargetList.reduce((sum, v) => sum + (v.delayHours || 0), 0) / pastTargetList.length).toFixed(1)
    : '0.0';

  return {
    total,
    // 🟢 Indikator Hijau
    realizedCount: realizedList.length,
    realizedPercent: total > 0 ? Math.round((realizedList.length / total) * 100) : 0,
    // 🟡 Indikator Kuning
    scheduledCount: scheduledList.length,
    scheduledPercent: total > 0 ? Math.round((scheduledList.length / total) * 100) : 0,
    // Sub-metrik Kuning (Mengetahui yang seharusnya selesai vs planning)
    pastTargetCount: pastTargetList.length,
    pastTargetPercent: scheduledList.length > 0 ? Math.round((pastTargetList.length / scheduledList.length) * 100) : 0,
    onTargetCount: onTargetList.length,
    // Legacy compatibility aliases
    onPlanCount: realizedList.length,
    onPlanPercent: total > 0 ? Math.round((realizedList.length / total) * 100) : 0,
    overdueCount: pastTargetList.length,
    overduePercent: total > 0 ? Math.round((pastTargetList.length / total) * 100) : 0,
    onTrackCount: onTargetList.length,
    onTrackPercent: total > 0 ? Math.round((onTargetList.length / total) * 100) : 0,
    totalPlanBiji,
    totalRealBiji,
    totalPlanBerat: totalPlanBerat.toFixed(1),
    totalRealBerat: totalRealBerat.toFixed(1),
    avgDelayHours
  };
}

// Function to export table data as CSV (Excel compatible) with clean 2-indicator labels
export function exportToCSV(vouchers, fileName = 'Laporan_Plan_vs_Real_Electroforming.csv') {
  const headers = [
    'No',
    'No Voucher',
    'Kode Model',
    'Nama Produk',
    'Jalur',
    'Qty Biji (Real)',
    'Berat Gram (Real)',
    'Tahap Rencana (Plan)',
    'Tahap Riil (Real)',
    'Indikator Status',
    'Kondisi Planning (Target vs Real)',
    'Jam Masuk Riil',
    'Target Selesai Rencana',
    'Operator / Tukang',
    'Mesin / Stasiun'
  ];

  const rows = vouchers.map((v, idx) => {
    const isGreen = v.indicatorColor === 'green' || v.status === 'REALIZED';
    const statusText = isGreen ? 'Terealisasi (Hijau)' : 'Sedang Di-Schedule (Kuning)';
    const planningText = v.timingText || (isGreen ? 'Selesai Tepat Waktu' : (v.delayHours > 0 ? `Seharusnya Selesai (Lewat ${v.delayHours} Jam)` : 'Dalam Target'));

    return [
      idx + 1,
      `"${v.voucherNo}"`,
      `"${v.modelCode || '-'}"`,
      `"${v.modelName || '-'}"`,
      `"${v.materialType}"`,
      v.realBiji || v.biji,
      v.realBeratGr || v.beratTotalGr,
      `"${v.plannedStage || '-'}"`,
      `"${v.actualStage || '-'}"`,
      `"${statusText}"`,
      `"${planningText}"`,
      `"${v.entryDate || '-'}"`,
      `"${v.plannedFinishHours || '-'}"`,
      `"${v.operator || '-'}"`,
      `"${v.machine || '-'}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
