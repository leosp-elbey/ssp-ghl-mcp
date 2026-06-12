# SWIPE SAVER PRO — MASTER CONTINUATION FILE
Version: 3.0 — Post-MCP Build Session
Last Updated: June 12, 2026
Status: SYSTEM LIVE — SSP-03 field mapping fix IN PROGRESS — SSP GHL MCP deployed but not yet connected

READING ORDER FOR NEW INSTANCES: Read this file first. Then read MODEL_HANDOFF_INSTRUCTIONS.md. Do not read older .docx versions — they contain stale/conflicting data.


## PROJECT PURPOSE
Build Swipe Saver Pro into a scalable merchant advisory and payment optimization company.

Positioning:
- Merchant Risk Shield Advisor
- Processor Escape Specialist
- Payment Continuity Consultant
- Payment Stack Architect

Compete on: Stability | Risk Reduction | Payment Continuity | Business Survival
NOT on: Lowest Rates | Terminal Sales | Commodity Processing


## LIVE PLATFORM IDENTIFIERS

| Asset | ID / Value |
| --- | --- |
| GHL Location ID | iVoa9cRtLfHVX66r48C7 |
| GHL User ID | oXNEP5zoD39vLgeCClBJ |
| GHL API Key | pit-8cc8635a-721c-49d5-a254-c8fbd3ef7cdb |
| Make.com Org ID | 1012050 |
| Make.com Account | palmerppllc@gmail.com |
| GHL Connection Name (Make) | Swipe Saver Pro GHL |
| Live Form URL | https://link.faasfunding.com/widget/form/nLMZqN7YcObL7MHD0BDo |
| Advisor Alert Email | support@swipesaverpro.com |
| Advisor Alert Phone | +19145136653 |
| Claude.ai Project ID | 019ea40c-6c4b-75c6-bfe8-d938ba344469 |
| Claude.ai Org ID | 61ee5480-82ce-4a4d-828d-1ed017c6c9f4 |


## SSP GHL MCP SERVER — BUILT AND DEPLOYED (June 12, 2026)

### What It Is
A custom MCP server that gives Claude direct read/write access to the SSP GHL location.
Bypasses Make.com's variable-picker UI problems entirely.

### Deployment Status
| Item | Value |
| --- | --- |
| GitHub Repo | https://github.com/leosp-elbey/ssp-ghl-mcp (public) |
| Railway Project | vibrant-comfort (ceac6b71-547f-49fb-8ac4-aec85db5f3bb) |
| Railway Service ID | f94990de-1b59-45c9-9b2c-37d7bc7f37cd |
| Railway Service Instance | 576fcb6c-0bfe-4575-be74-86f0c636d26b |
| Railway Environment ID | 60bd7d25-9036-4408-bc11-319f736c75b2 |
| Public URL | https://ssp-ghl-mcp.up.railway.app |
| SSE Endpoint | https://ssp-ghl-mcp.up.railway.app/sse |
| Deploy Status | ✅ ACTIVE — "Deployment successful", Online |
| Claude Connector | ⚠️ ADDED but NOT CONNECTED — "Connection issue" |
| GHL_SSP_API_KEY env var | ✅ SET in Railway |

### Connection Issue — Root Cause Identified
Railway's public proxy is not routing HTTP traffic to the Express app on port 3000.
The app is confirmed running (deploy logs show "✅ SSP GHL MCP running on port 3000").
Fix needed: In Railway UI → ssp-ghl-mcp service → Settings → Networking → ensure port 3000 is mapped to the public domain.

### To Fix and Connect (FIRST PRIORITY next session)
1. Railway → vibrant-comfort project → ssp-ghl-mcp service → Settings tab
2. Under "Public Networking" — confirm port 3000 is exposed
3. If no port shown: add port 3000
4. Redeploy if needed
5. In Claude.ai → Customize → Connectors → SSP GHL → click Connect
6. Verify connection succeeds (should show 10 tools)

### MCP Tools Available (10 total)
- ssp_get_contact
- ssp_update_contact_fields ← THE KEY FIX FOR SSP-03
- ssp_add_tags / ssp_remove_tags
- ssp_search_contacts
- ssp_get_pipelines
- ssp_create_opportunity
- ssp_update_opportunity
- ssp_get_opportunities_for_contact
- ssp_list_custom_fields


## SSP-03 FIELD MAPPING — ROOT CAUSE AND STATUS

### Problem
SSP-03's GHL "Update a Contact" module has SSP_Merchant_Persona and SSP_Service_Route
mapped with plain text strings instead of purple pill variable tokens.
Result: GHL receives literal path strings, fields stay blank (--).

### What Was Confirmed
- SSP-03 runs successfully (green, 3 operations, no errors)
- GHL INPUT log shows: SSP_Merchant_Persona: "1.ghl_field_writes.SSP_Merchant_Persona" (plain text)
- SSP_Critical_Override Map toggle was turned OFF (fix applied) — no more validation errors
- SSP_Owner_Credit, SSP_Recurring_Billing, SSP_Score_* fields ARE mapping correctly (purple pills)
- Only SSP_Merchant_Persona and SSP_Service_Route are broken

### Fix Options (choose one)
**Option A — Fix via MCP (preferred once connector is live)**
Call ssp_update_contact_fields directly on test contact znEo9Sfn7UefvZLuw4tx
with SSP_Merchant_Persona: "E-Commerce" to validate the field.
Then fix SSP-03's GHL module properly.

**Option B — Fix in Make.com UI manually**
In SSP-03 → Edit → GHL module:
1. Scroll to SSP_Merchant_Persona (Map toggle ON, plain text in field)
2. Triple-click the value field → select all → delete
3. Click into empty field → variable picker opens (star icon tab)
4. Navigate: Module 1 → ghl_field_writes → SSP_Merchant_Persona → click (purple pill appears)
5. Repeat for SSP_Service_Route
6. Save module → save scenario (floppy disk)
7. Replay from SSP-06 History

### Key Field IDs (for direct API/MCP writes)
| Field | GHL Field ID |
| --- | --- |
| SSP_Merchant_Persona | O7assrGiGh6ivY3LWnPf |
| SSP_Service_Route | wvQDucs20sbuvLmUUniW |
| SSP_Critical_Override | 994C1y5mI2iKHxGQzCJz (CHECKBOX — Map OFF in SSP-03) |

### SSP_Merchant_Persona Valid Dropdown Values
E-Commerce, Contractor, Home Services, Coach-Consultant, Restaurant, High-Ticket


## SYSTEM STATUS — CONFIRMED AS OF JUNE 12, 2026

### Make.com Scenarios
| Scenario | ID | Status |
| --- | --- | --- |
| SSP-01 — Intake Webhook Receiver | 5333059 | ✅ ACTIVE |
| SSP-02 — Score Calculation Engine | 5333241 | ✅ ACTIVE |
| SSP-06 — Override Detector | 5333300 | ✅ ACTIVE |
| SSP-03 — GHL Field Updater | 5333411 | ✅ ACTIVE (runs clean — field mapping fix pending) |
| SSP-04 — Status Router | 5333626 | ✅ ACTIVE |
| SSP-05 — Audit Report Generator | NOT YET BUILT | ⏸ PENDING |

### Webhook URLs
| Scenario | URL |
| --- | --- |
| SSP-01 Intake | hook.us2.make.com/wjkxs9ipebkrps0fx6u52guii8frc9bf |
| SSP-02 Score Engine | hook.us2.make.com/xrfqm40goxx5fqsolc9lf8tmuxlx5wk1 |
| SSP-06 Override Detector | hook.us2.make.com/3htfg8522p41zyi8qndrx3hd6svipcck |
| SSP-03 Field Updater Input | hook.us2.make.com/f7vnwoira5geb5ldxwsmyclpvubqr5m6 |
| SSP-04 Status Router | hook.us2.make.com/jeasnl7ci9uneoqnu2hyh3dxyceynnyr |

### Pipeline IDs (verified)
| Pipeline | ID |
| --- | --- |
| SSP Merchant Audit | UwXzxCezyHFwedkAq4pZ |
| Stage: Stable | fb6f9fd4-3a74-40a3-8ba0-bcf799dfa0a7 |
| Stage: Growth | 5cadd001-b791-406b-ba74-8aed341f934b |
| Stage: At Risk | a610982d-ac88-40fe-95ed-280aca620a95 |
| Stage: Crisis | 6e7fd8d5-2d36-4730-bfc3-eaa7f8a40a29 |

### Test Contact
| Field | Value |
| --- | --- |
| Contact ID | znEo9Sfn7UefvZLuw4tx |
| Email | test-ssp@swipesaverpro-internal.com (redirects to final-test@swipesaverpro-internal.com) |
| Status | SSP-03 runs green but SSP_Merchant_Persona and SSP_Service_Route still show -- |

### GHL Assets — Confirmed
| Asset | Status |
| --- | --- |
| SSP Merchant Audit Intake (form) | ✅ PUBLISHED / LIVE |
| SSP — Form to Audit OS (bridge workflow) | ✅ PUBLISHED |
| SSP Merchant Audit Pipeline (Stable/Growth/At Risk/Crisis) | ✅ CONFIRMED |
| Merchant Prospecting Pipeline (legacy) | ✅ PRESERVED — do not overwrite |
| 12 SSP_ Custom Fields (Merchant Application folder) | ✅ CONFIRMED |
| 22 SSP Contact Tags | ✅ CONFIRMED |
| 4 SSP Calendars | ✅ CONFIRMED |
| W-1 through W-7 Workflow Stubs | ✅ DRAFT/INACTIVE — stubs only, no action steps |
| Sean AI Agent | ✅ ACTIVE |

### Missing Tags — Still Need to Create
These 8 tags were identified as missing and need to be created in GHL:
- SSP-status-growth
- SSP-status-crisis
- SSP-route-self-service
- SSP-route-risk-mitigation
- SSP-route-backup-setup
- SSP-route-high-risk-placement
- SSP-bnpl-eligible
- SSP-30-day-checkin


## GHL CUSTOM FIELDS — COMPLETE LIST
All fields in the Merchant Application folder.

| Field Name | Type | Visibility |
| --- | --- | --- |
| SSP_Score_Total | Number | Internal |
| SSP_Risk_Tier | Dropdown | Internal |
| SSP_Score_Processing | Number | Internal |
| SSP_Score_Compliance | Number | Internal |
| SSP_Score_Financial | Number | Internal |
| SSP_Score_Operational | Number | Internal |
| SSP_Owner_Credit | Number | INTERNAL ONLY — NEVER shown to merchants |
| SSP_Monthly_Volume | Number | Internal |
| SSP_Business_Type | Dropdown | Internal |
| SSP_Years_in_Business | Number | Internal |
| SSP_Chargeback_Rate | Number | Internal |
| SSP_Processing_Status | Dropdown | Internal |


## GHL WORKFLOW STUBS — W-1 THROUGH W-7
All stubs are Draft/Inactive. No action steps exist. Do NOT activate without explicit approval.

| Stub | Name in GHL | Trigger | Gate |
| --- | --- | --- | --- |
| W-1 | SSP — Self-Service Education | SSP_Service_Route = Self-Service | None |
| W-2 | SSP — Audit Review Call | SSP_Service_Route = Audit-Call | None |
| W-3 | SSP — Risk Mitigation Program | SSP_Service_Route = Risk-Mitigation | None |
| W-4 | SSP — Processor Migration [HUMAN GATE] | SSP_Service_Route = Processor-Migration | Human gate required |
| W-5 | SSP — Backup Processor Setup | SSP_Service_Route = Backup-Setup | None |
| W-6 | SSP — BNPL Evaluation [HUMAN GATE] | SSP_Service_Route = BNPL-Eval | Human gate required |
| W-7 | SSP — High-Risk Placement EMERGENCY [HUMAN GATE] | SSP_Service_Route = High-Risk-Placement | Human gate required |


## MAKE.COM CHAIN STATUS
| Link | Status | Notes |
| --- | --- | --- |
| GHL Form → SSP-01 | ✅ LIVE | Bridge workflow published |
| SSP-01 → SSP-02 | ✅ WIRED | HTTP POST confirmed |
| SSP-02 → SSP-06 | ✅ WIRED | HTTP POST confirmed |
| SSP-06 → SSP-03 | ✅ WIRED | Both branches wired |
| SSP-03 → SSP-04 | ✅ WIRED | HTTP POST confirmed |
| SSP-04 internal | ✅ COMPLETE | 7 routes + email gates on 3/7 |


## NEXT BUILD PRIORITIES — IN ORDER
| Priority | Component | Status | Gate |
| --- | --- | --- | --- |
| 0 | Fix Railway port mapping for SSP GHL MCP | ⚠️ IMMEDIATE | Do this first — 2 min fix |
| 0 | Connect SSP GHL connector in Claude.ai | ⚠️ IMMEDIATE | Requires port fix |
| 1 | Fix SSP-03 field mappings (Persona + ServiceRoute) | ⏳ BLOCKED | MCP must connect first |
| 2 | Create 8 missing GHL tags | ⏸ QUEUED | After SSP-03 fix |
| 3 | Full end-to-end live form test | ⏸ QUEUED | After field fix |
| 4 | SSP-04 duplicate opportunity [400] fix | ⏸ QUEUED | Add Search before Create |
| 5 | SSP-05 Audit Report Generator | ⏸ NOT BUILT | After chain confirmed clean |
| 6 | W-1 through W-7 Action Steps | ⏸ NOT BUILT | After SSP-05 |
| 7 | Merchant Dashboard | ⏸ NOT BUILT | After workflows |
| 8 | BNPL Qualification Matrix | ⏸ NOT BUILT | After dashboard |


## SSP-04 KNOWN BUG
SSP-04 "Create Opportunity" throws a 400 error when a duplicate opportunity exists.
Fix: Add a "Search Opportunities" GHL module BEFORE "Create Opportunity".
If opportunity found → update existing. If not found → create new.
Pipeline ID: UwXzxCezyHFwedkAq4pZ


## ACCOUNT ISOLATION RULES
Three separate businesses share the Make.com account. Assets must NEVER cross.

| Project | GHL Location | Status |
| --- | --- | --- |
| Swipe Saver Pro (SSP) | iVoa9cRtLfHVX66r48C7 | ACTIVE — full system live |
| Zero Tax Tags (ZTT) | Separate location | Active — separate system |
| Lewis Holding | Separate location | Parent entity |
| VortexTrips | Exists inside SSP GHL account | DO NOT TOUCH — unrelated business |

Tag rule: All SSP tags must begin with SSP-. Never create tags without the SSP- prefix.
MCP rule: SSP GHL MCP tools (ssp_*) are SSP-only. ZTT MCP tools are ZTT-only.


## ACTIVE OPEN DECISIONS
| Decision | Status |
| --- | --- |
| BNPL Revenue Model (advisory fee vs referral vs hybrid) | OPEN — define before partner applications |
| SSP-03 field mapping fix | IN PROGRESS — Railway port fix needed first |
| SSP-04 duplicate opportunity fix | QUEUED |


## GLOBAL BUILD RULES — ALL FUTURE SESSIONS
1. Do not rebuild completed work.
2. Do not replace approved architecture.
3. Do not introduce conflicting systems or terminology.
4. Read this file before acting on any task.
5. GoHighLevel = default platform. Make.com = automation layer. MCP = direct API layer.
6. Never invent live platform data — read from live platform only.
7. Never claim something is built unless created or confirmed via live screenshot.
8. BNPL providers = integrated solutions inside merchant payment systems. SSP is not a lender or broker.
9. Partner applications must be truthful. Never inflate volume, merchant counts, or approvals.
10. Compliance guidance scope = descriptor, MCC, documentation only. Not legal counsel.
11. Human gates on W-4, W-6, W-7 — NEVER remove without explicit account owner approval.
12. SSP-05 does NOT get built until full chain passes end-to-end test.
13. SSP_Owner_Credit — INTERNAL ONLY, never surface to merchants.
14. SSP GHL MCP is scoped to SSP location only. Do not use for ZTT or Lewis Holding.


## CHANGE LOG
| Date | Session | Changes |
| --- | --- | --- |
| June 9–10, 2026 | Session 7–8 | SSP-01 through SSP-04 + SSP-06 activated. Bridge workflow published. Form published. SSP-06 bug fixed. Sean AI fixed. All 24 platform IDs captured. Chain gaps wired. |
| June 10, 2026 | Session 9 | Master file v2.0 — consolidated all stale docs into single authoritative source. |
| June 12, 2026 | Session 10 | SSP GHL MCP server built and deployed to Railway (vibrant-comfort project). GitHub repo created (leosp-elbey/ssp-ghl-mcp). SSP_Critical_Override Map toggle fixed (OFF) in SSP-03. SSP-03 now runs clean (3 ops, no errors). Root cause confirmed: SSP_Merchant_Persona and SSP_Service_Route are plain text in GHL module, not purple pill tokens. Railway port 3000 not exposed publicly — causing Claude connector "Connection issue". GHL API key captured: pit-8cc8635a-721c-49d5-a254-c8fbd3ef7cdb. |


Swipe Saver Pro — Internal Use Only
Provides payment operations guidance only. Not legal, financial, or regulatory advice.
