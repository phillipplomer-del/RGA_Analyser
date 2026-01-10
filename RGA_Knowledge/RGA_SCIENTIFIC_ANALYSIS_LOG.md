# RGA Analyser: Scientific Analysis Log & Feature Research

> **Purpose:** Continuous documentation of scientific validation, feature research, and error checking for the RGA Analyser.
> **Status:** Active / Rolling Log

---

## 📅 Log Entry: 2026-01-10 - Rate-of-Rise Feature Analysis

**Context:** Review of `DOCUMENTATION/ARCHIVED/RATE_OF_RISE_FEATURE_SPEC (1).md` for scientific validity.

### 1. Validated Concepts ✅
*   **Leak Rate Formula:** The fundamental equation $Q = V \cdot dp/dt$ is physically correct for static rise tests.
*   **Helium Conversion:** The factor of **2.7** for converting Air leak rates to Helium equivalent is correct for molecular flow conditions ($\sqrt{M_{air}/M_{He}} = \sqrt{29/4} \approx 2.7$).

### 2. Discrepancies Found ⚠️
*   **Curve Fitting Models (Outgassing vs. Virtual Leak):**
    *   *Issue:* The spec proposed "Logarithmic" for Virtual Leaks and "Exponential" for Outgassing.
    *   *Correction Identified:*
        *   **Virtual Leaks:** Typically follow an **Exponential** decay ($1 - e^{-t/\tau}$) as the trapped volume pressure equilibrates.
        *   **Outgassing:** Typically follows a **Power Law** ($t^{-n}$), which integrates to a **Logarithmic** rise ($A \cdot \ln(t) + B$) over long periods.
    *   *Action:* Models in the spec need to be swapped or labeled correctly in the implementation.

---

## 📅 Log Entry: 2026-01-10 - Advanced Offline Analysis Features (Initial Review)

**Context:** Analysis of existing documentation to identify scientific strengths and potential offline features.

### 1. Findings: Existing Validity ✅
*   **Differentiation:** Correctly distinguishing `Baked` vs. `Unbaked` systems is a strong USP.
*   **Methodology:** Rejection of quantitative He-leak rates without calibration is scientifically sound.

### 2. Proposed Features for Implementation 🚀

#### 2.1 Kinetic Fingerprinting (Desorptions-Kinetik)
*   **Concept:** Use the decay exponent $n$ ($P \propto t^{-n}$) to identify gas sources.
*   **Science:**
    *   $n \approx 1$ → Surface Desorption (e.g., Water in unbaked system).
    *   $n \approx 0.5$ → Bulk Diffusion (e.g., Hydrogen permeation, outgassing polymers).
*   **Benefit:** Diagnoses *source* of contamination (Surface vs. Material).

#### 2.2 Dynamic Limit of Detection (LOD $3\sigma$)
*   **Concept:** Calculate LOD per scan based on baseline noise.
*   **Formula:** $LOD = \mu_{noise} + 3 \sigma_{noise}$ (IUPAC Standard).
*   **Benefit:** Replaces arbitrary "1e-10" cutoffs with statistically robust limits.

#### 2.3 Intelligent Background Subtraction
*   **Concept:** Subtraction of a "Background" ASCII file from the measurement.
*   **Details:** Must handle negative values (clamping) and normalization drifts.

### 3. Critical Fixes Needed 🐛
*   **Temperature Correction Bias:**
    *   Found in `PRESSURE_CALIBRATION_SPEC_V2.md`.
    *   **Logic:** Hot gauges measure lower density. Formulation was inverted.
    *   **Fix:** Use $P_{corr} = P_{meas} \cdot (T_{curr} / T_{ref})$.

---

## 📅 Log Entry: 2026-01-10 - Research on Advanced Rate-of-Rise Features (Offline)

**Context:** Investigation of additional scientific features for Rate-of-Rise analysis based on offline CSV data.

### 1. New Feature Ideas & Validation 💡

#### 1.1 Permeation Lag Detection (Elastomer Check)
*   **Concept:** Permeation through O-rings has a "Time Lag" ($t_{lag} = L^2 / 6D$) before it becomes constant.
*   **Offline Data:** If the RoR curve shows a **delayed increase** (S-Curve) rather than an immediate linear or decreasing slope, it indicates permeation (e.g., through a Viton seal).
*   **Benefit:** Distinguishes "Real Leak" (immediate) can "Permeation" (delayed).

#### 1.2 Statistical Uncertainty Calculation (Confidence Intervals)
*   **Concept:** Leaks are often reported as single numbers ($3.4 \times 10^{-9}$), which implies false precision.
*   **Method:**
    *   Use **Linear Regression Analysis** on the $P(t)$ data.
    *   Calculate the **Standard Error of the Slope** ($SE_{slope}$).
    *   Report Leak Rate as $Q \pm 2 \cdot SE_{slope}$ (95% Confidence Interval).
*   **Source:** Metrology standards for flow measurement.

#### 1.3 Volume Estimation (Reverse Pump-Down)
*   **Concept:** If the CSV contains the **pump-down phase** *before* the valve was closed:
    *   Use $V = - S_{eff} \cdot P / (dP/dt)$.
    *   *Constraint:* Requires user input of Pumping Speed ($S_{eff}$) or a calibration run.
*   **Verdict:** Nice-to-have, but depends on user knowing their pump speed.

### 2. Standards Review (Reporting) 📋
*   **ISO 27892:** Incorrect standard (Torque measurement).
*   **Relevant Best Practices (NASA/ASTM):**
    *   Report: Volume, Measurement Time, Pre-Pumping Time (History), Start/End Pressure, $\Delta P$.
    *   Calculated Outgassing/Leak Rate with specified units.
    *   **Action for App:** Generated PDF reports *must* include these fields to be compliant with industrial norms.
