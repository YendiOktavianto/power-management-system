// validation.ts

/** helper kecil untuk memicu native picker (date/time) bila tersedia */
// validation.ts
export function openPicker(el: HTMLInputElement | null) {
  if (!el) return;
  try {
    el.focus();
    if (typeof (el as any).showPicker === "function") {
      try {
        // coba pakai showPicker dulu (wajib dalam user gesture)
        (el as any).showPicker();
        return;
      } catch {
        // kalau NotAllowedError, fallback ke click()
      }
    }
    // fallback universal yang tetap dianggap user gesture
    el.click();
  } catch {
    // jangan melempar error supaya UI tidak crash
  }
}

/** simple parser "900 / 1 Phase" → [900, "1 Phase"] */
export function parsePowerPhase(input: string): { power: number; phase: string } | null {
  const [powerStr, phaseStr] = (input || "").split(" / ");
  const powerNum = Number((powerStr ?? "").trim());
  if (Number.isNaN(powerNum) || !phaseStr) return null;
  return { power: powerNum, phase: String(phaseStr).trim() };
}

export function validateCostForm(fields: {
  powerLabel: string;
  cost: string;
  validFrom: string;
  validUntil: string;
}) {
  const errors: Record<string, string> = {};

  // Wattage/Phase
  if (!fields.powerLabel) {
    errors.power = "Wattage/Phase is required!";
  } else if (!parsePowerPhase(fields.powerLabel)) {
    errors.power = "Invalid Wattage/Phase format!";
  }

  // Cost
  if (!fields.cost) {
    errors.cost = "Cost is required!";
  } else {
    const n = Number(fields.cost);
    if (Number.isNaN(n) || n <= 0) {
      errors.cost = "Cost must be a positive number!";
    }
  }

  // Valid from / until
  if (!fields.validFrom) {
    errors.validFrom = "Valid from is required!";
  }
  // validUntil bersifat opsional: hanya cek kalau diisi
  if (fields.validUntil) {
    if (
      fields.validFrom &&
      new Date(fields.validUntil) <= new Date(fields.validFrom)
    ) {
      errors.validUntil = "Valid until must be after Valid from!";
    }
  }

  return errors;
}
