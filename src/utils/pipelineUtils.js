// Pipeline Utilities for End-to-End Order Scheduling
// Generates and synchronizes steps 1 to 10 (Lilin) and 1 to 14 (Timah)

import { LILIN_PROCESSES, TIMAH_PROCESSES } from '../data/initialData';

export const SETUP_BUFFER_HOURS = 0.1; // 5 minutes buffer between products (5/60 ≈ 0.083 -> rounded 0.1h)

/**
 * Formats timeline hour decimal (e.g. 7.5) into Indonesian date and time string
 * e.g., "06 Okt 07:30 (Shift 1)"
 */
export function formatTimelineHour(hourDecimal, baseDate = null) {
  const now = new Date();
  const effectiveBase = baseDate ? new Date(baseDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const d = new Date(effectiveBase.getTime() + hourDecimal * 3600 * 1000);
  const daysIndo = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const dayName = daysIndo[d.getDay()];
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthName = months[d.getMonth()];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  let shiftNum = 3;
  const h = d.getHours();
  if (h >= 7 && h < 15) shiftNum = 1;
  else if (h >= 15 && h < 23) shiftNum = 2;

  return `${dayName}, ${String(day).padStart(2, '0')} ${monthName} ${hh}:${mm} (Shift ${shiftNum})`;
}

/**
 * Calculates lead time in minutes based on Kapasitas Lilin / Timah parameters:
 * - CEL: 0.5 min/bj (30s)
 * - WBN: 135s / 3 man = 45s/bj = 0.75 min/bj (368 min for 490 bj)
 * - SOL: 15s/bj / 2 man = 7.5s/bj = 0.125 min/bj (61 min for 490 bj)
 * - STI: 10s/bj / 1 man = 10s/bj = 0.166 min/bj (82 min for 490 bj)
 * - TBA: 110 min fixed batch (6,600s)
 * - EFL / EFT: 2,100 min fixed batch (126,000s = 35h)
 * - BOR: 15s/bj / 3 man = 5s/bj = 0.083 min/bj (41 min for 490 bj)
 * - HL1 / HL2: 780 min fixed batch (46,800s = 13h)
 * - ANN: 60 min fixed batch (3,600s = 1h)
 * - TKD: 20 min
 * - BJD: 15 min
 */
export function calculateLeadTimeMinutes(proc, biji = 490, difficultyFactor = 1.0) {
  let minutes = proc.defaultLeadTimeMinutes || 60;

  if (biji && biji > 0) {
    if (proc.code === 'CEL') {
      minutes = Math.round(biji * 0.5);
    } else if (proc.code === 'WBN') {
      minutes = Math.round((biji * 135) / (3 * 60));
    } else if (proc.code === 'SOL') {
      minutes = Math.round((biji * 15) / (2 * 60));
    } else if (proc.code === 'STI') {
      minutes = Math.round((biji * 10) / 60);
    } else if (proc.code === 'BOR') {
      minutes = Math.round((biji * 15) / (3 * 60));
    } else if (proc.code === 'TBA') {
      minutes = 110;
    } else if (proc.code === 'EFL' || proc.code === 'EFT') {
      minutes = 2100;
    } else if (proc.code === 'HL1' || proc.code === 'HL2') {
      minutes = 780;
    } else if (proc.code === 'ANN') {
      minutes = 60;
    } else if (proc.code === 'TKD') {
      minutes = 20;
    } else if (proc.code === 'BJD') {
      minutes = 15;
    }
  }

  return Math.max(1, Math.round(minutes * Number(difficultyFactor)));
}

/**
 * Generates all sequential blocks for an order from Stage 1 to the final stage
 * Lilin: Stages 1 to 12 (CEL -> WBN -> SOL -> STI -> TBA -> EFL -> BOR -> HL1 -> ANN -> HL2 -> TKD -> BJD)
 * Timah: Stages 1 to 14 (CET -> AMP -> GLD -> ULR -> STB -> ST1 -> EFT -> ST2 -> BOR -> OVN -> HL1 -> ANN -> TKD -> BJD)
 */
export function generateFullOrderPipeline({
  voucherNo,
  modelCode,
  soNumber = 'SO 1',
  materialType = 'Lilin',
  biji = 490,
  volumeMl = 350,
  difficultyFactor = 1.0,
  startHour = 7.0, // Timeline start hour
  selectedProcessCode = null, // The process configured by user
  selectedMachineId = null,   // The machine selected by user for that process!
  assignedStartMachine = null,
  assignedEFMachine = null,
  operatorName = 'Bagus Prasetyo',
  tesAirTime = '07:15 WIB',
  notes = '',
  existingBlocks = []         // To intelligently balance across available machines
}) {
  const isLilin = materialType === 'Lilin';
  const processList = isLilin ? LILIN_PROCESSES : TIMAH_PROCESSES;
  const blocks = [];
  let currentStart = Number(startHour);

  processList.forEach((proc, index) => {
    // 1. Direct selection match: if user explicitly selected this process and machine in modal
    let chosenMachineId = null;
    if (selectedProcessCode && proc.code === selectedProcessCode && selectedMachineId) {
      chosenMachineId = selectedMachineId;
    }
    // 2. Start process match (CEL / CET)
    else if ((proc.code === 'CEL' || proc.code === 'CET') && (assignedStartMachine || (selectedProcessCode === proc.code && selectedMachineId))) {
      chosenMachineId = assignedStartMachine || selectedMachineId;
    }
    // 3. EF process match (EFL / EFT)
    else if (proc.isEFBath && (assignedEFMachine || (selectedProcessCode === proc.code && selectedMachineId))) {
      chosenMachineId = assignedEFMachine || selectedMachineId;
    }
    // 4. Multi-machine processes: Smart Load-Balancing
    else if (proc.machines.length > 1) {
      const runningMachines = proc.machines.filter(m => m.status !== 'Trouble');
      if (runningMachines.length > 0) {
        if (existingBlocks && existingBlocks.length > 0) {
          // Score machines based on existing block overlaps at currentStart
          const scored = runningMachines.map(m => {
            const conflictCount = existingBlocks.filter(b => 
              b.processCode === proc.code && 
              b.machineId === m.id &&
              b.startHour < (currentStart + 6) &&
              (b.startHour + (b.durationHours || 2)) > currentStart
            ).length;
            const totalHoursOnMachine = existingBlocks
              .filter(b => b.processCode === proc.code && b.machineId === m.id)
              .reduce((sum, b) => sum + (b.durationHours || 0), 0);
            return { m, conflictCount, totalHoursOnMachine };
          });
          scored.sort((a, b) => {
            if (a.conflictCount !== b.conflictCount) return a.conflictCount - b.conflictCount;
            return a.totalHoursOnMachine - b.totalHoursOnMachine;
          });
          chosenMachineId = scored[0].m.id;
        } else {
          chosenMachineId = runningMachines[0].id;
        }
      } else {
        chosenMachineId = proc.machines[0]?.id;
      }
    } else {
      chosenMachineId = proc.machines[0]?.id;
    }

    const durationMinutes = calculateLeadTimeMinutes(proc, Number(biji), Number(difficultyFactor));
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
      tesAirTime: proc.code === 'STI' || proc.code === 'ST1' ? tesAirTime : null,
      notes: notes || `Rencana Order ${voucherNo} [Tahap ${index + 1}/${processList.length} - ${proc.name}]`
    });

    // Advance to next step (current finish + setup buffer)
    currentStart = Math.round((currentStart + durationHours + SETUP_BUFFER_HOURS) * 10) / 10;
  });

  return blocks;
}

/**
 * Auto-cascade order chain (Bi-directional: Forward & Backward):
 * When one step of an order is moved forward OR backward, all connected steps of that order
 * shift by the same delta, preserving setup buffers and chronological validity.
 * Colliding blocks of other orders on affected machines are automatically ripple-pushed forward
 * along with their respective downstream pipelines.
 */
export function cascadeOrderSteps(allBlocks, draggedBlock, newStartHour, newMachineId = null) {
  const targetVoucher = draggedBlock.voucherNo;
  const targetStepNumber = draggedBlock.stepNumber || 1;
  const originalStart = draggedBlock.startHour;
  const deltaHours = Math.round((newStartHour - originalStart) * 10) / 10;

  // Clone all blocks for pure calculation
  let blocksCopy = allBlocks.map(b => ({ ...b }));

  // Find all blocks of target order, ordered by stepNumber
  const orderIndices = [];
  blocksCopy.forEach((b, idx) => {
    if (b.voucherNo === targetVoucher) orderIndices.push(idx);
  });
  orderIndices.sort((a, b) => (blocksCopy[a].stepNumber || 0) - (blocksCopy[b].stepNumber || 0));

  // 1. Shift the target order blocks based on delta
  orderIndices.forEach(idx => {
    const blk = blocksCopy[idx];
    const stepNum = blk.stepNumber || 1;

    if (blk.id === draggedBlock.id) {
      // Merge all updated properties from draggedBlock (durationMinutes, durationHours, biji, modelCode, etc.)
      Object.assign(blk, draggedBlock);
      blk.startHour = Math.max(0, Math.round(newStartHour * 10) / 10);
      if (newMachineId) blk.machineId = newMachineId;
    } else if (stepNum > targetStepNumber) {
      // Downstream steps shift forward OR backward by deltaHours!
      const shifted = Math.round((blk.startHour + deltaHours) * 10) / 10;
      blk.startHour = Math.max(0, shifted);
    } else if (targetStepNumber === 1) {
      // If user drags step 1, entire order shifts
      const shifted = Math.round((blk.startHour + deltaHours) * 10) / 10;
      blk.startHour = Math.max(0, shifted);
    }
  });

  // 2. Enforce strict chronological order within the target order
  let runningOrderEnd = 0;
  for (let i = 0; i < orderIndices.length; i++) {
    const blk = blocksCopy[orderIndices[i]];
    if (i > 0) {
      const minStart = Math.round((runningOrderEnd + SETUP_BUFFER_HOURS) * 10) / 10;
      if (blk.startHour < minStart) {
        blk.startHour = minStart;
      }
    }
    runningOrderEnd = blk.startHour + blk.durationHours;
  }

  // 3. Multi-pass collision resolution across all machines with ripple cascade
  for (let pass = 0; pass < 5; pass++) {
    let hasCollisions = false;

    // Group blocks by machine: processCode + machineId
    const machineMap = {};
    blocksCopy.forEach(b => {
      const key = `${b.processCode}___${b.machineId}`;
      if (!machineMap[key]) machineMap[key] = [];
      machineMap[key].push(b);
    });

    Object.keys(machineMap).forEach(key => {
      const list = machineMap[key];
      // Sort by startHour
      list.sort((a, b) => a.startHour - b.startHour);

      let prevBlockEnd = 0;
      for (let i = 0; i < list.length; i++) {
        const blk = list[i];
        if (i > 0) {
          const minAllowed = Math.round((prevBlockEnd + SETUP_BUFFER_HOURS) * 10) / 10;
          if (blk.startHour < minAllowed) {
            hasCollisions = true;
            const pushDelta = Math.round((minAllowed - blk.startHour) * 10) / 10;
            blk.startHour = minAllowed;

            // Ripple push: all downstream steps of THIS pushed order also shift forward by pushDelta!
            const pushedVoucher = blk.voucherNo;
            const pushedStep = blk.stepNumber || 1;
            blocksCopy.forEach(otherBlk => {
              if (otherBlk.voucherNo === pushedVoucher && (otherBlk.stepNumber || 0) > pushedStep) {
                otherBlk.startHour = Math.max(otherBlk.startHour, Math.round((otherBlk.startHour + pushDelta) * 10) / 10);
              }
            });
          }
        }
        prevBlockEnd = blk.startHour + blk.durationHours;
      }
    });

    if (!hasCollisions) break;
  }

  return blocksCopy;
}

