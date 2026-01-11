# Leak Detection - Physics Documentation

Physics documentation for leak detection algorithms in RGA spectra analysis.

---

## Detectors (4)

### [AirLeak.md](./AirLeak.md)
**Air Leak Detection Using N₂/O₂ Ratio**

Detects atmospheric air leaks by analyzing the nitrogen-to-oxygen ratio (N₂:O₂ ≈ 4:1 in air).

**Key Masses:** 28 (N₂⁺), 32 (O₂⁺), 40 (Ar⁺)
**Code:** `src/modules/rga/lib/detectors/leaks/detectAirLeak.ts`
**Cross-Validation:** ✅ Validated (Gemini + Grok unanimous approval)

---

### [HeliumLeak.md](./HeliumLeak.md)
**Helium Tracer Leak Detection**

Detects helium tracer gas used in leak testing.

**Key Masses:** 4 (He⁺), 3 (³He⁺)
**Code:** `src/modules/rga/lib/detectors/leaks/detectHeliumLeak.ts`
**Cross-Validation:** ⚠️ Conditional (2 CRITICAL fixes required)

---

### [VirtualLeak.md](./VirtualLeak.md)
**Virtual Leak Identification**

Identifies virtual leaks (trapped volumes outgassing).

**Key Masses:** 18 (H₂O⁺), 44 (CO₂⁺)
**Code:** `src/modules/rga/lib/detectors/leaks/detectVirtualLeak.ts`
**Cross-Validation:** ⬜ Pending validation

---

### [CoolingWaterLeak.md](./CoolingWaterLeak.md)
**Cooling Water Leak Detection**

Detects cooling water leaks in vacuum systems.

**Key Masses:** 18 (H₂O⁺), 17 (OH⁺), 16 (O⁺)
**Code:** `src/modules/rga/lib/detectors/leaks/detectCoolingWaterLeak.ts`
**Cross-Validation:** ⬜ Pending validation

---

## Scientific References

All detectors reference the master scientific collection:
**[../../SCIENTIFIC/REFERENCES.md](../../SCIENTIFIC/REFERENCES.md)**

---

**Category:** Leaks
**Total Detectors:** 4
**Validated:** 1 (25%)
**Pending:** 3 (75%)
