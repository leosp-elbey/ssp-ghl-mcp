#!/usr/bin/env node
/**
 * SSP GHL MCP Server — HTTP/SSE transport
 * For deployment to Railway / Render / etc.
 * Claude.ai project MCP servers need an HTTP endpoint.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";

const GHL_API_KEY = process.env.GHL_SSP_API_KEY || "";
const LOCATION_ID  = "iVoa9cRtLfHVX66r48C7";
const BASE_URL     = "https://services.leadconnectorhq.com";
const API_VERSION  = "2021-07-28";
const PORT         = process.env.PORT || 3000;

if (!GHL_API_KEY) {
  console.error("❌ GHL_SSP_API_KEY env var not set");
  process.exit(1);
}

// ── Field IDs (verified against SSP location) ──────────────────────────────
const FIELD_IDS = {
  SSP_Merchant_Persona  : "O7assrGiGh6ivY3LWnPf",
  SSP_Service_Route     : "wvQDucs20sbuvLmUUniW",
  SSP_Critical_Override : "994C1y5mI2iKHxGQzCJz",
};

const SSP_PIPELINE_ID = "UwXzxCezyHFwedkAq4pZ";
const SSP_STAGES = {
  Stable: "fb6f9fd4-3a74-40a3-8ba0-bcf799dfa0a7",
  Growth: "5cadd001-b791-406b-ba74-8aed341f934b",
  AtRisk: "a610982d-ac88-40fe-95ed-280aca620a95",
  Crisis: "6e7fd8d5-2d36-4730-bfc3-eaa7f8a40a29",
};

// ── HTTP helper ──────────────────────────────────────────────────────────────
async function ghlFetch(method, path, body = null) {
  const url  = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: {
      "Authorization": `Bearer ${GHL_API_KEY}`,
      "Content-Type" : "application/json",
      "Version"      : API_VERSION,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(url, opts);
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// ── Build MCP server (tools) ─────────────────────────────────────────────────
function buildMcpServer() {
  const server = new McpServer({ name: "ssp-ghl", version: "1.0.0" });

  // ssp_get_contact
  server.tool("ssp_get_contact", "Get full GHL contact by ID",
    { contactId: z.string() },
    async ({ contactId }) => {
      const r = await ghlFetch("GET", `/contacts/${contactId}`);
      return { content: [{ type: "text", text: JSON.stringify(r.data, null, 2) }] };
    }
  );

  // ssp_update_contact_fields
  server.tool("ssp_update_contact_fields",
    "Write SSP custom fields to a contact. Key fields: SSP_Merchant_Persona (E-Commerce|Contractor|Home Services|Coach-Consultant|Restaurant|High-Ticket), SSP_Service_Route, SSP_Critical_Override.",
    {
      contactId            : z.string(),
      SSP_Merchant_Persona : z.string().optional().describe("Dropdown: E-Commerce | Contractor | Home Services | Coach-Consultant | Restaurant | High-Ticket"),
      SSP_Service_Route    : z.string().optional(),
      SSP_Critical_Override: z.boolean().optional(),
      SSP_Merchant_Status  : z.string().optional(),
      SSP_Score_Shutdown   : z.number().optional(),
      SSP_Score_Chargeback : z.number().optional(),
      SSP_Score_Funding    : z.number().optional(),
      SSP_Score_CostLeakage: z.number().optional(),
      SSP_Score_Composite  : z.number().optional(),
      SSP_Business_Age     : z.number().optional(),
      SSP_Owner_Credit     : z.number().optional(),
      SSP_Recurring_Billing: z.string().optional(),
    },
    async (args) => {
      const { contactId, ...fields } = args;
      const customFields = [];

      const idMap = { SSP_Merchant_Persona: FIELD_IDS.SSP_Merchant_Persona, SSP_Service_Route: FIELD_IDS.SSP_Service_Route, SSP_Critical_Override: FIELD_IDS.SSP_Critical_Override };
      const keyMap = { SSP_Merchant_Status: "merchant_status", SSP_Score_Shutdown: "score_shutdown", SSP_Score_Chargeback: "score_chargeback", SSP_Score_Funding: "score_funding", SSP_Score_CostLeakage: "score_cost_leakage", SSP_Score_Composite: "composite", SSP_Business_Age: "business_age", SSP_Owner_Credit: "owner_credit", SSP_Recurring_Billing: "recurring_billing" };

      for (const [k, v] of Object.entries(fields)) {
        if (v === undefined) continue;
        if (idMap[k])  customFields.push({ id: idMap[k], value: v });
        else if (keyMap[k]) customFields.push({ key: `contact.${keyMap[k]}`, value: v });
      }

      if (!customFields.length) return { content: [{ type: "text", text: "No fields provided." }] };
      const r = await ghlFetch("PUT", `/contacts/${contactId}`, { customFields });
      return {
        content: [{
          type: "text",
          text: r.ok
            ? `✅ Updated ${customFields.length} field(s) on ${contactId}:\n${customFields.map(f => `  ${f.id || f.key} = ${JSON.stringify(f.value)}`).join("\n")}`
            : `❌ GHL ${r.status}: ${JSON.stringify(r.data)}`,
        }],
      };
    }
  );

  // ssp_add_tags
  server.tool("ssp_add_tags", "Add SSP- tags to a contact",
    { contactId: z.string(), tags: z.array(z.string()) },
    async ({ contactId, tags }) => {
      const t = tags.map(x => x.startsWith("SSP-") ? x : `SSP-${x}`);
      const r = await ghlFetch("POST", `/contacts/${contactId}/tags`, { tags: t });
      return { content: [{ type: "text", text: r.ok ? `✅ Added: ${t.join(", ")}` : `❌ ${r.status}: ${JSON.stringify(r.data)}` }] };
    }
  );

  // ssp_remove_tags
  server.tool("ssp_remove_tags", "Remove tags from a contact",
    { contactId: z.string(), tags: z.array(z.string()) },
    async ({ contactId, tags }) => {
      const t = tags.map(x => x.startsWith("SSP-") ? x : `SSP-${x}`);
      const r = await ghlFetch("DELETE", `/contacts/${contactId}/tags`, { tags: t });
      return { content: [{ type: "text", text: r.ok ? `✅ Removed: ${t.join(", ")}` : `❌ ${r.status}: ${JSON.stringify(r.data)}` }] };
    }
  );

  // ssp_search_contacts
  server.tool("ssp_search_contacts", "Search contacts by name, email, or phone",
    { query: z.string(), limit: z.number().optional().default(10) },
    async ({ query, limit }) => {
      const r = await ghlFetch("GET", `/contacts/search?locationId=${LOCATION_ID}&query=${encodeURIComponent(query)}&limit=${limit}`);
      return { content: [{ type: "text", text: JSON.stringify(r.data, null, 2) }] };
    }
  );

  // ssp_get_pipelines
  server.tool("ssp_get_pipelines", "List SSP pipelines and stages", {},
    async () => {
      const r = await ghlFetch("GET", `/opportunities/pipelines?locationId=${LOCATION_ID}`);
      return { content: [{ type: "text", text: JSON.stringify(r.data, null, 2) }] };
    }
  );

  // ssp_create_opportunity
  server.tool("ssp_create_opportunity", "Create opportunity in SSP Merchant Audit pipeline",
    {
      contactId    : z.string(),
      name         : z.string(),
      stage        : z.enum(["Stable","Growth","AtRisk","Crisis"]).default("Stable"),
      monetaryValue: z.number().optional(),
      status       : z.enum(["open","won","lost","abandoned"]).default("open"),
    },
    async ({ contactId, name, stage, monetaryValue, status }) => {
      const body = { locationId: LOCATION_ID, pipelineId: SSP_PIPELINE_ID, pipelineStageId: SSP_STAGES[stage], contactId, name, status };
      if (monetaryValue !== undefined) body.monetaryValue = monetaryValue;
      const r = await ghlFetch("POST", "/opportunities/", body);
      return { content: [{ type: "text", text: r.ok ? `✅ Created: ${JSON.stringify(r.data?.opportunity || r.data, null, 2)}` : `❌ ${r.status}: ${JSON.stringify(r.data)}` }] };
    }
  );

  // ssp_update_opportunity
  server.tool("ssp_update_opportunity", "Update an existing SSP opportunity",
    {
      opportunityId: z.string(),
      stage        : z.enum(["Stable","Growth","AtRisk","Crisis"]).optional(),
      status       : z.enum(["open","won","lost","abandoned"]).optional(),
      monetaryValue: z.number().optional(),
      name         : z.string().optional(),
    },
    async ({ opportunityId, stage, status, monetaryValue, name }) => {
      const body = {};
      if (stage) body.pipelineStageId = SSP_STAGES[stage];
      if (status) body.status = status;
      if (monetaryValue !== undefined) body.monetaryValue = monetaryValue;
      if (name) body.name = name;
      const r = await ghlFetch("PUT", `/opportunities/${opportunityId}`, body);
      return { content: [{ type: "text", text: r.ok ? `✅ Updated ${opportunityId}` : `❌ ${r.status}: ${JSON.stringify(r.data)}` }] };
    }
  );

  // ssp_get_opportunities_for_contact
  server.tool("ssp_get_opportunities_for_contact", "Get all opportunities for an SSP contact",
    { contactId: z.string() },
    async ({ contactId }) => {
      const r = await ghlFetch("GET", `/opportunities/search?location_id=${LOCATION_ID}&contact_id=${contactId}`);
      return { content: [{ type: "text", text: JSON.stringify(r.data, null, 2) }] };
    }
  );

  // ssp_list_custom_fields
  server.tool("ssp_list_custom_fields", "List all SSP custom fields with IDs and dropdown options", {},
    async () => {
      const r = await ghlFetch("GET", `/locations/${LOCATION_ID}/customFields?model=contact`);
      const fields = (r.data?.customFields || []).map(f => ({
        id: f.id, name: f.name, dataType: f.dataType,
        options: f.options?.map(o => o.value || o.label) || [],
      }));
      return { content: [{ type: "text", text: JSON.stringify(fields, null, 2) }] };
    }
  );

  return server;
}

// ── Express + SSE ────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ name: "ssp-ghl-mcp", version: "1.0.0", status: "ok", location: LOCATION_ID }));

// SSE connections map
const transports = new Map();

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports.set(transport.sessionId, transport);
  res.on("close", () => transports.delete(transport.sessionId));

  const server = buildMcpServer();
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId  = req.query.sessionId;
  const transport  = transports.get(sessionId);
  if (!transport) return res.status(404).json({ error: "Session not found" });
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`✅ SSP GHL MCP running on port ${PORT}`);
  console.log(`   Location: ${LOCATION_ID}`);
  console.log(`   SSE endpoint: http://localhost:${PORT}/sse`);
});
