# Chat History & Project Documentation: Singapore SORA Calculator

**Generated**: 2026-10-05  
**Repository**: [https://github.com/zhuohx/sora-calc_demo.git](https://github.com/zhuohx/sora-calc_demo.git)  
**Author**: ZhuoHuixin (zhuohx)  

---

## 1. Initial Prompt & Implementation

### User Request
> build me a simple singapore based sora calculator that reads mas backed overnight rates for calculating interest payments accurately and efficiently. just the frontend for now, i will include the backend integration later.

### Assistant Response Summary
Built a Singapore-based **SORA (Singapore Overnight Rate Average) Calculator** following official Monetary Authority of Singapore (MAS) and ABS/SFG standards.

#### Key Modules Implemented:
1. **Mathematical Engine (`src/services/soraCalculator.ts` & `src/services/masRates.ts`)**:
   - Implemented the official MAS Compounded SORA formula:
     $$\text{Compounded SORA} = \left[ \prod_{i=1}^{d_0} \left( 1 + \frac{r_i \times n_i}{365} \right) - 1 \right] \times \frac{365}{d} \times 100\%$$
   - Enforced **Actual/365 (ACT/365)** day-count convention.
   - Handled Singapore business days ($d_0$) and calendar day weights ($n_i = 3$ for Friday rates spanning the weekend).
   - Provided benchmarks: **3-Month Compounded SORA** (Singapore primary mortgage standard), **1-Month Compounded SORA**, **6-Month Compounded SORA**, and Daily Compounded in Arrears.

2. **User Interface (`src/components/`)**:
   - `Header.tsx`: Live MAS rate ticker, publication timestamp (9:00 AM SGT), and quick modals.
   - `LoanInputPanel.tsx`: Loan quantum (SGD) with presets (HDB S$400k, Condo S$1.2M, etc.), tenure slider (1–35 years), bank margin/spread presets (+0.60% to +1.00%), and calculation mode selectors.
   - `ResultsDashboard.tsx`: Monthly instalment KPI, Principal vs. Interest ratio bar, effective rate, total interest over tenure, and daily interest accrual.
   - `AmortizationTable.tsx`: Full schedule toggleable between Yearly Summary and Month-by-Month breakdown with instant **Export to CSV**.
   - `CompoundingAuditView.tsx`: Step-by-step mathematical verification table displaying each business day, published rate $r_i$, calendar days $n_i$, daily factor, and running cumulative product.
   - `StressTestMatrix.tsx`: MAS Total Debt Servicing Ratio (TDSR) regulatory stress test benchmarked at **4.00% p.a. floor** alongside rate shock sensitivities (-100 bps to +200 bps).
   - `FixedVsSoraComparison.tsx`: Floating SORA vs. Bank Fixed Rate packages comparison with break-even rate analysis.
   - `FormulaModal.tsx`: Complete educational guide explaining the transition from SOR/SIBOR to SORA and compounding conventions.
   - `RatesManagerModal.tsx`: Interactive dataset table allowing rate edits, CSV import/export, and new rate additions.

---

## 2. Git Repository Initialization & First Push

### User Request
> git push https://[GITHUB_PAT]@github.com/zhuohx/sora-calc_demo.git

### Assistant Response Summary
1. Initialized empty Git repository in `/app/applet/.git`.
2. Configured Git author credentials:
   - `user.name`: `zhuohx`
   - `user.email`: `ZhuoHuixin@gmail.com`
3. Staged all project files and created the initial commit:
   - Commit ID: `963d3e5`
   - Message: `Initial commit: Singapore SORA Loan & Interest Calculator with MAS overnight rates engine`
4. Added remote origin and pushed to branch `main`:
   ```bash
   git remote add origin https://github.com/zhuohx/sora-calc_demo.git
   git push -u origin main
   ```

---

## 3. Serverless MAS Connection Setup

### User Request
> add a serverless connection that pulls MAS data using the following end points:
> 
> - store this in /api folder (at project root level) NOT src file
> - include /health.ts and /sora.ts within the same subfolder
> - do not hardcode any api keys, i will include them manually
> 
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
> 
> # All requests need the header: KeyId: <MAS_KEY_ID>

### Assistant Response Summary
Created serverless backend architecture inside `/api` at the project root level:

#### 1. `/api/health.ts`
- Probe endpoint returning JSON uptime, service status, and verification of whether `MAS_KEY_ID` is configured without exposing the key.

#### 2. `/api/sora.ts`
- Connects directly to the MAS Gateway endpoint:
  `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
- Dispatches requests with header: `KeyId: <MAS_KEY_ID>`
- Dynamic authentication: Reads from `process.env.MAS_KEY_ID` (or `process.env.MAS_API_KEY`, or `KeyId` request header). No hardcoded credentials.
- Normalizes MAS response into standard data format:
  - Date (YYYY-MM-DD)
  - Daily SORA rate
  - 1M, 3M, and 6M compounded rates
  - Volume (SGD Million) and SORA Index
- Built-in 10-minute in-memory caching to avoid MAS API rate-limiting (bypassable with `?refresh=true`).
- Returns structured HTTP error responses if key is missing (400) or unauthorized (401).

#### 3. Full-Stack Dev Server & Local Proxy (`server.ts`)
- Mounted Express server routing `/api/health` and `/api/sora` directly to the serverless handlers.
- Integrated Vite middleware for development (`npm run dev` running `tsx server.ts`).
- Updated `.env.example` with `MAS_KEY_ID` documentation.
- Committed and pushed changes to GitHub:
  - Commit ID: `255445a`
  - Message: `Add serverless MAS SORA connection (/api/sora and /api/health) with KeyId header support`

---

## 4. Current File Tree

```text
/
├── .env.example
├── .gitignore
├── CHAT_EXPORT.md
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── api/
│   ├── health.ts
│   └── sora.ts
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── AmortizationTable.tsx
    │   ├── BackendIntegrationModal.tsx
    │   ├── CompoundingAuditView.tsx
    │   ├── FixedVsSoraComparison.tsx
    │   ├── FormulaModal.tsx
    │   ├── Header.tsx
    │   ├── LoanInputPanel.tsx
    │   ├── RatesManagerModal.tsx
    │   ├── ResultsDashboard.tsx
    │   └── StressTestMatrix.tsx
    ├── services/
    │   ├── masRates.ts
    │   └── soraCalculator.ts
    └── types/
        └── sora.ts
```
