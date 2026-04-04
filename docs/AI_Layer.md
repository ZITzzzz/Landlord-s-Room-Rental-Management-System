# AI Layer, Skills, and Agents — Room Rental Management System

---

## Overview

The AI tier is **additive only** — no existing routes, services, or models are modified. A single line added to `server/src/index.js` mounts the new router. Everything else lives under `server/src/ai/`.

```
server/src/
└── ai/
    ├── anthropic.client.js     # Singleton Anthropic SDK client; respects AI_ENABLED env var
    ├── agentRunner.js          # Generic agentic loop (tool_use ↔ tool_result, max 6 iterations)
    ├── skills/
    │   ├── index.js            # Barrel — exports { toolSchemas, toolHandlers }
    │   ├── getPaymentHistory.js
    │   ├── getRoomUsageStats.js
    │   ├── getContractRenewalContext.js
    │   ├── getConsumptionTrend.js
    │   ├── getMaintenanceSummary.js
    │   ├── getRevenueForecasting.js
    │   ├── getRiskProfile.js
    │   └── getOccupancyPressure.js
    ├── agents/
    │   ├── meterAnomalyAgent.js
    │   ├── contractAdvisorAgent.js
    │   ├── revenueForecasterAgent.js
    │   └── earlyWarningAgent.js
    └── prompts/
        ├── meterAnomaly.prompt.js
        ├── contractAdvisor.prompt.js
        ├── revenueForecaster.prompt.js
        └── earlyWarning.prompt.js

server/src/routes/ai.routes.js
server/src/controllers/ai.controller.js

client/src/api/ai.api.js
client/src/hooks/useAI.js
```

**Dependency to add:** `npm install @anthropic-ai/sdk` in `server/`.

---

## Part 1 — AI Layer

### Which part of the system it belongs to

**Backend infrastructure tier.** Sits between the existing Service layer and the Anthropic API. Contains no business logic.

### What specific function it serves

Provides the shared plumbing for all AI features: the Claude SDK client, the generic agentic loop runner, and the graceful-degradation system used by every agent.

### How it works and why it is needed

**`anthropic.client.js`**

Exports a lazy singleton `new Anthropic({ apiKey, timeout })` built from env vars. If `AI_ENABLED=false` or the key is missing, it exports `null`. Every downstream agent checks for `null` before running and returns `{ aiDisabled: true }` immediately — zero network calls, zero errors.

**`agentRunner.js`**

Implements the Claude agentic tool-use loop:

```
1. client.messages.create({ system, messages, tools, max_tokens })
2. stop_reason === 'end_turn'  →  return final text
3. stop_reason === 'tool_use'  →  run each tool_use block through handlers
                                   collect tool_result blocks
                                   append [assistant turn + user tool-result turn] to messages
                                   repeat from step 1
4. Circuit breaker at maxIterations (default 6) — log warn, return { aiDisabled: true }
```

Accepts: `{ client, systemPrompt, userMessage, tools, handlers, maxIterations }`.
Returns: the final text string from Claude, or `{ aiDisabled: true }` on any failure.

**Why this layer is needed:** Without it, every agent would re-implement the loop and its own error handling. One tested loop means every AI endpoint behaves consistently: if the Claude API is unreachable on the LAN, every `/api/ai/*` route returns `{ success: true, data: null, aiDisabled: true }` — a 200, never a 500. The rest of the application is completely unaffected.

### Environment variables

```
AI_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-opus-4-6
AI_MAX_TOKENS=4096
AI_TIMEOUT_MS=30000
```

In `docker-compose.yml`, the default is `AI_ENABLED=false` — the system runs fully offline without any change in behavior.

### Graceful degradation — 3 layers

| Layer | Mechanism |
|---|---|
| Client build | `VITE_AI_ENABLED=true` — `useAI.js` hooks are disabled at build time if false; no API calls are made |
| Server gate | `anthropic.client.js` exports `null` if disabled; agents return `{ aiDisabled: true }` without touching the network |
| Network failure | `agentRunner.js` catches network errors, logs `warn` via Winston, returns `{ aiDisabled: true, reason: 'network' }` — controller maps to HTTP 200 with null data |

---

## Part 2 — AI Skills

### Which part of the system they belong to

**Backend service tier** (`server/src/ai/skills/`). Skills are pure async functions that query MongoDB through existing Mongoose models and return structured JSON for Claude to reason over.

### What specific function they serve

Skills are the **tools** Claude calls during an agentic loop. Each skill is registered as both an Anthropic tool schema (`name`, `description`, `input_schema`) and a handler function. The barrel `skills/index.js` exports `{ toolSchemas, toolHandlers }` — agents import and filter only the subset of skills they need.

### How they work and why they are needed

Claude cannot query MongoDB directly. Skills bridge this gap using the standard Anthropic tool-use pattern: Claude decides which data it needs, calls the appropriate skill, and reasons over the returned JSON. All skills are **read-only** — no new collections are required, and existing models are never modified.

---

### Skill 1 — `get_payment_history`

**File:** `skills/getPaymentHistory.js`

**(1) Belongs to:** Invoice and contract analysis layer.

**(2) Function:** Returns a contract's full invoice and payment timeline so Claude can assess tenant reliability and outstanding debt.

**(3) How it works:**
- Query: `HoaDon.find({ hop_dong_id }).sort({ nam:1, thang:1 }).limit(months)`
- Computes `daysLate` per paid invoice (= `ngay_thanh_toan − han_thanh_toan`), longest streak of consecutive unpaid months, total outstanding debt.
- Input: `{ hop_dong_id, months=12 }`
- Output:
  ```json
  {
    "invoices": [{ "thang": 3, "nam": 2025, "trang_thai": "da_thanh_toan", "daysLate": 2 }],
    "summary": { "avgDaysLate": 1.8, "maxConsecutiveUnpaid": 0, "totalOutstanding": 0 }
  }
  ```
- Why needed: Multiple agents need payment reliability data. Centralizing this in one skill prevents duplicate query logic across agents.

---

### Skill 2 — `get_room_usage_stats`

**File:** `skills/getRoomUsageStats.js`

**(1) Belongs to:** Room analytics layer.

**(2) Function:** Returns occupancy history for a room — tenancy periods, vacancy gaps, and rent price evolution — so Claude can assess room demand when advising on pricing or renewal.

**(3) How it works:**
- Queries: `HopDong.find({ phong_id }).sort({ ngay_bat_dau:1 })` + `LichSuGiaThuPhong.find({ phong_id })`
- Computes vacancy gaps (days between consecutive contracts) and average tenancy duration.
- Input: `{ phong_id }`
- Output:
  ```json
  {
    "contracts": [...],
    "vacancyGaps": [{ "from": "2024-01-01", "to": "2024-03-01", "days": 60 }],
    "priceHistory": [{ "gia_moi": 3000000, "ngay_ap_dung": "2024-06-01" }],
    "avgTenancyMonths": 8.5
  }
  ```

---

### Skill 3 — `get_contract_renewal_context`

**File:** `skills/getContractRenewalContext.js`

**(1) Belongs to:** Contract management layer.

**(2) Function:** One-shot context fetch for the contract advisor — returns tenant info, payment history, renewal history, and comparable vacant rooms in one call.

**(3) How it works:**
- Queries: `HopDong.findById().populate('phong_id khach_hang_id')` + `LichSuGiaHan` + payment summary + `Phong.find({ khu_id, trang_thai: 'trong' })` for market comparison.
- Computes days remaining until expiry.
- Input: `{ hop_dong_id }`
- Output:
  ```json
  {
    "hopDong": { "ngay_het_han": "2025-05-01", "daysRemaining": 27 },
    "khachHang": { "ho_ten": "Tran Thi B", "so_dien_thoai": "090..." },
    "lichSuGiaHan": [...],
    "paymentSummary": { "avgDaysLate": 1.2, "maxConsecutiveUnpaid": 0 },
    "comparableVacantRooms": [{ "ten": "P102", "gia_thue": 3200000 }]
  }
  ```

---

### Skill 4 — `get_consumption_trend`

**File:** `skills/getConsumptionTrend.js`

**(1) Belongs to:** Invoice validation layer.

**(2) Function:** Returns month-by-month electricity and water consumption for a contract, with statistical anomaly flags — the baseline the meter anomaly agent uses to detect data-entry errors.

**(3) How it works:**
- Query: `HoaDon` (meter fields only), last N months.
- Derives `tieu_thu_dien = chi_so_dien_moi − chi_so_dien_cu` and `tieu_thu_nuoc` per month.
- Computes mean and standard deviation; flags any month where consumption > 2σ from mean as `anomaly: true`.
- Input: `{ hop_dong_id, months=6 }`
- Output:
  ```json
  {
    "trend": [{ "thang": 3, "nam": 2025, "tieu_thu_dien": 120, "tieu_thu_nuoc": 8, "anomaly": false }],
    "stats": { "dien": { "mean": 130.4, "stdDev": 22.1 }, "nuoc": { "mean": 7.8, "stdDev": 1.2 } }
  }
  ```

---

### Skill 5 — `get_maintenance_summary`

**File:** `skills/getMaintenanceSummary.js`

**(1) Belongs to:** Maintenance and repair layer.

**(2) Function:** Returns repair history for a room — costs, tenant-fault incidents, and open repairs — so Claude can factor room condition into contract and deposit decisions.

**(3) How it works:**
- Query: `SuaChua.find({ phong_id, ngay_phat_sinh: { $gte: cutoff } })`
- Aggregates total actual cost, count of tenant-fault repairs, count of open (unresolved) repairs.
- Input: `{ phong_id, months=12 }`
- Output:
  ```json
  {
    "summary": { "totalRepairs": 4, "totalActualCost": 3200000, "tenantFaultCount": 1, "openRepairs": 0 },
    "records": [{ "mo_ta": "Vòi nước hỏng", "chi_phi_thuc_te": 400000, "do_kh_gay_ra": false }]
  }
  ```

---

### Skill 6 — `get_revenue_forecasting_data`

**File:** `skills/getRevenueForecasting.js`

**(1) Belongs to:** Financial analytics layer.

**(2) Function:** Provides the full time-series (historical revenue, costs, profit) plus the current active contract portfolio in one call — everything the revenue forecaster agent needs.

**(3) How it works:**
- Aggregates `HoaDon` (paid invoices grouped by `thang, nam`) and `ChiPhiVanHanh` (costs grouped by `thang, nam`). Reuses the aggregation pattern from `services/thongKe.service.js`.
- Also fetches all active `HopDong` with expiry dates.
- Input: `{ months=12 }`
- Output:
  ```json
  {
    "history": [{ "thang": 3, "nam": 2025, "revenue": 45000000, "costs": 5000000, "profit": 40000000 }],
    "activeContracts": [{ "phong": "P101", "gia_thue": 3000000, "ngay_het_han": "2025-06-01" }],
    "summary": { "avgMonthlyRevenue": 43000000, "contractsExpiringIn30Days": 2 }
  }
  ```

---

### Skill 7 — `get_risk_profile`

**File:** `skills/getRiskProfile.js`

**(1) Belongs to:** Customer risk management layer.

**(2) Function:** Computes a holistic risk snapshot for a customer across all their contracts, including a pre-computed `riskScore` that agents use to triage who needs deep investigation.

**(3) How it works:**
- Queries all `HopDong` for the customer + payment summary per contract + cancellation history + `SuaChua` where `do_kh_gay_ra: true`.
- Pre-computes `riskScore`: `HIGH` if `maxConsecutiveUnpaid >= 2` or `totalOutstanding > 10,000,000 VND`; `MEDIUM` if partially met; otherwise `LOW`.
- Input: `{ khach_hang_id }`
- Output:
  ```json
  {
    "khachHang": { "ho_ten": "Le Van C" },
    "contracts": [{ "hop_dong_id": "...", "phong": "P203", "consecutiveUnpaid": 2, "totalOutstanding": 6000000 }],
    "summary": { "riskScore": "HIGH", "totalOutstanding": 6000000, "cancellationCount": 0, "tenantFaultRepairs": 1 }
  }
  ```

---

### Skill 8 — `get_occupancy_pressure`

**File:** `skills/getOccupancyPressure.js`

**(1) Belongs to:** Occupancy analytics layer.

**(2) Function:** Returns the room availability matrix — vacancy counts, rooms expiring soon, and price range — so Claude can reason about market pressure when advising on renewals or pricing.

**(3) How it works:**
- Queries all `Phong` grouped by `khu_id` + active `HopDong` expiry dates.
- Flags contracts expiring within `days_ahead` days; computes overall occupancy rate and price range of vacant rooms.
- Input: `{ days_ahead=60 }`
- Output:
  ```json
  {
    "byArea": [{ "khu": "Khu A", "trong": 2, "cho_thue": 8, "expiringSoon": 3 }],
    "vacantRoomPriceRange": { "min": 2500000, "max": 4000000 },
    "occupancyRate": 0.82,
    "totalExpiringSoon": 5
  }
  ```

---

## Part 3 — AI Agents

### Which part of the system they belong to

**Backend automation tier** (`server/src/ai/agents/`). Each agent is an async function that calls `agentRunner.js` with a system prompt, a filtered subset of skills, and a structured output contract.

### What specific function they serve

Agents are multi-step reasoning workflows. They allow Claude to iteratively call skills, gather data from multiple independent sources, synthesize across all of it, and return a single structured recommendation — something no deterministic service function can do.

### How they work and why they are needed

Each agent module exports one async function `run(input)`:
1. Filters the required tools from the skills barrel.
2. Constructs a user message for the specific task.
3. Calls `agentRunner.run({ client, systemPrompt, userMessage, tools, handlers })`.
4. Parses the final text as JSON and returns it.

---

### Agent 1 — `meterAnomalyAgent`

**File:** `agents/meterAnomalyAgent.js`
**Prompt:** `prompts/meterAnomaly.prompt.js`

**(1) Belongs to:** Backend middleware step in the invoice creation workflow.

**(2) Function:** Validates electricity and water meter readings before the invoice is saved. Detects transcription errors (e.g., 1200 instead of 120) and genuine consumption spikes.

**(3) How it works and why it is needed:**

**Trigger:** `POST /api/ai/kiem-tra-chi-so` — called by `LapHoaDon.jsx` during the invoice preview step. Runs via `Promise.allSettled` in parallel with the existing `hoaDon.service.tinhHoaDon()` so a failing AI check **never blocks** the preview.

**Skills used:** `get_consumption_trend` — fetches 6 months of consumption history and its σ statistics.

**Why multi-step:** Claude must first call the skill to retrieve the statistical baseline, then compare the submitted readings against it, then classify the anomaly type (transcription error vs. genuine spike vs. normal). This requires at least one tool call followed by structured reasoning.

**System prompt:** Claude acts as a utility meter validator. Returns JSON only. Classifies as `warning` (can proceed with confirmation) or `error` (must correct before proceeding).

**Output:**
```json
{
  "valid": false,
  "severity": "warning",
  "anomalyType": "spike",
  "message": "Điện tiêu thụ 450 kWh — cao 3.2× mức trung bình 140 kWh. Xác nhận nếu đúng.",
  "suggestedValues": { "chi_so_dien_moi": null }
}
```

**Frontend integration:** `LapHoaDon.jsx` renders an Ant Design `Alert` with the message before `PreviewHoaDon`. `warning` shows a "Xác nhận tiếp tục" button; `error` blocks progression until readings are corrected.

---

### Agent 2 — `contractAdvisorAgent`

**File:** `agents/contractAdvisorAgent.js`
**Prompt:** `prompts/contractAdvisor.prompt.js`

**(1) Belongs to:** Backend business logic layer, invoked from the contract detail view.

**(2) Function:** When a contract is within 30 days of expiry, produces a specific recommendation: renew at current or adjusted price, renegotiate, or monitor. Turns the existing static "contract expiring" alert into actionable guidance.

**(3) How it works and why it is needed:**

**Trigger:** `POST /api/ai/tu-van-hop-dong` called by `ChiTietHopDong.jsx` when `daysRemaining <= 30`. Also pre-computed as a background task when the existing `hopDongSapHetHan` alert fires; result cached in memory (TTL 1 hour) so the UI renders instantly.

**Skills used:** `get_contract_renewal_context`, `get_risk_profile`, `get_occupancy_pressure`, `get_maintenance_summary`.

**Why multi-step:** A reliable renewal recommendation requires four independent signals — tenant payment reliability, room market pressure, room condition, and comparable pricing. No single query can produce this. Claude calls all four skills (typically in one round since they're independent), then reasons across the combined data to produce a single recommendation.

**System prompt:** Claude acts as a rental management advisor. Weighs tenant reliability against market conditions. Returns Vietnamese-language reasoning. JSON only.

**Output:**
```json
{
  "recommendation": "RENEW",
  "confidence": "HIGH",
  "suggestedRentAdjustment": 0,
  "reasoning": "Khách trả đúng hạn 11/12 tháng. Khu vực chỉ còn 2 phòng trống — nên ưu tiên giữ lại.",
  "cautions": [],
  "suggestedNewExpiry": "2026-05-01"
}
```

**Frontend integration:** New collapsible "Phân tích AI" panel in `ChiTietHopDong.jsx`. Shows recommendation badge (`RENEW` = green, `NEGOTIATE` = orange, `MONITOR` = red), reasoning text, and a suggested expiry date that pre-fills the `FormGiaHan` renewal modal.

---

### Agent 3 — `revenueForecasterAgent`

**File:** `agents/revenueForecasterAgent.js`
**Prompt:** `prompts/revenueForecaster.prompt.js`

**(1) Belongs to:** Backend analytics layer, surfaced from the Statistics page.

**(2) Function:** Produces a 3-month revenue forecast in conservative and optimistic scenarios, naming specific rooms whose expiring contracts create vacancy risk. Addresses the system's "all reporting is historical-only" gap.

**(3) How it works and why it is needed:**

**Trigger:** `GET /api/ai/du-bao-doanh-thu` — called when the manager opens a new "Dự báo AI" tab on `ThongKe.jsx`.

**Skills used:** `get_revenue_forecasting_data`, `get_occupancy_pressure`.

**Why multi-step:** The agent fetches the historical time series and active portfolio in one call, then separately fetches the occupancy pressure snapshot to understand upcoming expirations. It merges these two independent data sets — one for trend analysis, one for forward-looking vacancy risk — before producing projections. No existing service function performs forward-looking analysis.

**System prompt:** Claude acts as a financial forecasting assistant. Factors in trend direction, upcoming contract expirations, historical vacancy gaps (30–60 days average to relet). Names specific rooms. Returns conservative and optimistic scenarios. Vietnamese narrative. JSON only.

**Output:**
```json
{
  "forecastPeriod": ["2025-04", "2025-05", "2025-06"],
  "conservative": [41000000, 38000000, 40000000],
  "optimistic": [45000000, 44000000, 46000000],
  "keyRisks": [
    { "phong": "P101", "ngay_het_han": "2025-05-01", "estimatedVacancyImpact": -3000000 }
  ],
  "trend": "stable",
  "narrative": "Doanh thu ổn định. Rủi ro chính: 2 hợp đồng hết hạn tháng 5, có thể giảm ~6tr nếu chưa có khách mới."
}
```

**Frontend integration:** New `AIDuBao.jsx` tab inside `ThongKe.jsx`. Reuses the existing `Recharts LineChart` — overlays conservative/optimistic series (dashed lines) on the historical series. `keyRisks` listed as Ant Design warning `List` items.

---

### Agent 4 — `earlyWarningAgent`

**File:** `agents/earlyWarningAgent.js`
**Prompt:** `prompts/earlyWarning.prompt.js`

**(1) Belongs to:** Backend automation layer — runs as a scheduled background job.

**(2) Function:** Proactively identifies customers showing early signs of financial distress before they reach the 2-consecutive-unpaid threshold that triggers cancellation. Supplements (does not replace) the existing 5 reactive dashboard alerts.

**(3) How it works and why it is needed:**

**Trigger:** Runs once on server startup, then every 24 hours via `setInterval`. Results stored in a module-level `Map` cache keyed by `'earlyWarning'` with a timestamp. The existing `canhBao.service.js` is modified by one line to merge this cache into the dashboard alert response. Also directly exposed as `GET /api/ai/canh-bao-som`.

**Skills used:** `get_risk_profile` (triage pass across all customers), then selectively `get_payment_history` and `get_consumption_trend` for customers flagged as MEDIUM or HIGH.

**Why multi-step:** The agent first calls `get_risk_profile` for every active customer to identify who needs attention. For those flagged, it issues targeted deeper calls — e.g., `get_payment_history` to detect a trend of gradually increasing late payments even when eventually paid. This two-pass pattern (triage → selective deep-dive) is inherently iterative and cannot be expressed as a single deterministic query.

**Why it is needed:** The existing alert system fires only after a customer is already 7+ days overdue or has 2 consecutive unpaid months. This agent catches signals one step earlier — a customer who paid but was 5 days late for the first time after 8 months of punctuality. Earlier intervention means fewer cancellations and less lost revenue.

**System prompt:** Claude acts as a risk analyst. Looks for early warning patterns: gradually increasing tardiness, first missed payment, unusual utility consumption spike (possible subletting), tenant-fault maintenance incidents. Classifies each flagged customer as LOW/MEDIUM/HIGH priority. Vietnamese message text. JSON array only.

**Output:**
```json
{
  "generatedAt": "2025-04-04T07:00:00.000Z",
  "warnings": [
    {
      "khach_hang_id": "...",
      "ho_ten": "Nguyen Van A",
      "phong": "P305",
      "priority": "MEDIUM",
      "reason": "Tháng này trả trễ 5 ngày — lần đầu tiên sau 8 tháng đúng hạn. Xu hướng cần theo dõi.",
      "suggestedAction": "Nhắc nhở nhẹ khi thu tiền tháng sau."
    }
  ]
}
```

**Frontend integration:** `Dashboard.jsx` gets a second `useQuery` for `/api/ai/canh-bao-som`. New `CanhBaoAI.jsx` component mirrors `CanhBaoCard.jsx` but uses a purple "AI" badge and shows `priority` instead of alert type. `DanhSachKhachHang.jsx` gains an optional "Rủi ro" column with `LOW/MEDIUM/HIGH` color tags.

---

## New API Routes

All routes are mounted at `/api/ai/` and respect `AI_ENABLED`. If disabled, every route returns `{ success: true, data: null, aiDisabled: true }` immediately.

| Method | Path | Agent/Skill | Notes |
|---|---|---|---|
| `POST` | `/api/ai/kiem-tra-chi-so` | `meterAnomalyAgent` | Run via `Promise.allSettled` — never blocks invoice preview |
| `POST` | `/api/ai/tu-van-hop-dong` | `contractAdvisorAgent` | Cached in memory, TTL 1 hour |
| `GET` | `/api/ai/du-bao-doanh-thu` | `revenueForecasterAgent` | Client `staleTime` 1 hour |
| `GET` | `/api/ai/canh-bao-som` | Returns in-memory cache | Written by background job every 24h |
| `GET` | `/api/ai/canh-bao-som/refresh` | `earlyWarningAgent` (force re-run) | Debug / manual trigger |

All responses use the existing `{ success, data }` envelope.

---

## Existing Files Changed (Additive Only)

| File | Change |
|---|---|
| `server/src/index.js` | Add `app.use('/api/ai', aiRoutes)` — 1 line |
| `server/src/services/canhBao.service.js` | Merge in-memory early warning cache — 1–2 lines |
| `client/src/pages/hoaDon/LapHoaDon.jsx` | Anomaly `Alert` before invoice preview |
| `client/src/pages/hopDong/ChiTietHopDong.jsx` | "Phân tích AI" `Collapse` panel on contracts ≤ 30 days to expiry |
| `client/src/pages/thongKe/ThongKe.jsx` | "Dự báo AI" `Tabs.TabPane` |
| `client/src/pages/Dashboard.jsx` | Merge AI early warnings |
| `client/src/hooks/useDashboard.js` | Add `useEarlyWarnings` query |
| `client/src/pages/khachHang/DanhSachKhachHang.jsx` | Optional "Rủi ro" column |
