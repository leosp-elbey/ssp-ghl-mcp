#!/usr/bin/env node
/**
 * SSP GHL MCP Server
 * Scoped to Swipe Saver Pro location: iVoa9cRtLfHVX66r48C7
 * 
 * Tools:
 *  - ssp_get_contact
 *  - ssp_update_contact_fields
 *  - ssp_add_tags / ssp_remove_tags
 *  - ssp_create_opportunity / ssp_update_opportunity
 *  - ssp_get_pipelines
 *  - ssp_search_contacts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const GHL_API_KEY = process.env.GHL_SSP_API_KEY || "";
const LOCATION_ID  = "iVoa9cRtLfHVX66r48C7";
const BASE_URL     = "https://services.leadconnectorhq.com";
const API_VERSION  = "2021-07-28";

// ── SSP field IDs (verified) ─────────────────────────────────────────────────
const FIELD_IDS = {
  SSP_Merchant_Persona  : "O7assrGiGh6ivY3LWnPf",
  SSP_Service_Route     : "wvQDucs20sbuvLmUUniW",
  SSP_Critical_Override : "994C1y5mI2iKHxGQzCJz",
  SSP_Merchant_Status   : "merchant_status",          // text field key
  SSP_Score_Shutdown    : "score_shutdown",
  SSP_Score_Chargeback  : "score_chargeback",
  SSP_Score_Funding     : "score_funding",
  SSP_Score_CostLeakage : "score_cost_leakage",
  SSP_Score_Composite   : "composite",
  SSP_Business_Age      : "business_age",
  SSP_Owner_Credit      : "owner_credit",
  SSP_Recurring_Billing : "recurring_billing",
};

// SSP pipeline
const SSP_PIPELINE_ID = "UwXzxCezyHFwedkAq4pZ";
const SSP_STAGES = {
  Stable  : "fb6f9fd4-3a74-40a3-8ba0-bcf799dfa0a7",
  Growth  : "5cadd001-b791-406b-ba74-8aed341f934b",
  AtRisk  : "a610982d-ac88-40fe-95ed-280aca620a95",
  Crisis  : "6e7fd8d5-2d36-4730-bfc3-eaa7f8a40a29",
};

// ── HTTP helper ───────────────────────────────────────────────────────────────
async function ghlFetch(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
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
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

// ── MCP Server ────────────────────────────────────────────────────────────────
const server = new McpServer({
  name   : "ssp-ghl",
  version: "1.0.0",
});

// ── TOOL: ssp_get_contact ────────────────────────────────────────────────────
server.tool(
  "ssp_get_contact",
  "Get full contact record from SSP GHL by contact ID",
  { contactId: z.string().describe("GHL contact ID") },
  async ({ contactId }) => {
    const r = await ghlFetch("GET", `/contacts/${contactId}`);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(r.data, null, 2),
      }],
    };
  }
);

// ── TOOL: ssp_update_contact_fields ─────────────────────────────────────────
server.tool(
  "ssp_update_contact_fields",
  "Write custom field values to an SSP contact. Pass field names as keys with their new values.",
  {
    contactId           : z.string().describe("GHL contact ID"),
    SSP_Merchant_Persona: z.string().optional().describe("E-Commerce | Contractor | Home Services | Coach-Consultant | Restaurant | High-Ticket"),
    SSP_Service_Route   : z.string().optional().describe("Service route value"),
    SSP_Critical_Override: z.boolean().optional().describe("true = override active"),
    SSP_Merchant_Status : z.string().optional().describe("Merchant status dropdown value"),
    SSP_Score_Shutdown  : z.number().optional(),
    SSP_Score_Chargeback: z.number().optional(),
    SSP_Score_Funding   : z.number().optional(),
    SSP_Score_CostLeakage: z.number().optional(),
    SSP_Score_Composite : z.number().optional(),
    SSP_Business_Age    : z.number().optional(),
    SSP_Owner_Credit    : z.number().optional(),
    SSP_Recurring_Billing: z.string().optional(),
    extra_fields        : z.array(z.object({
      id   : z.string().optional(),
      key  : z.string().optional(),
      value: z.any(),
    })).optional().describe("Any additional custom fields by id or key"),
  },
  async (args) => {
    const { contactId, extra_fields, ...fieldArgs } = args;

    // Build customFields array
    const customFields = [];
    const nameToId = {
      SSP_Merchant_Persona  : FIELD_IDS.SSP_Merchant_Persona,
      SSP_Service_Route     : FIELD_IDS.SSP_Service_Route,
      SSP_Critical_Override : FIELD_IDS.SSP_Critical_Override,
    };
    const nameToKey = {
      SSP_Merchant_Status  : "merchant_status",
      SSP_Score_Shutdown   : "score_shutdown",
      SSP_Score_Chargeback : "score_chargeback",
      SSP_Score_Funding    : "score_funding",
      SSP_Score_CostLeakage: "score_cost_leakage",
      SSP_Score_Composite  : "composite",
      SSP_Business_Age     : "business_age",
      SSP_Owner_Credit     : "owner_credit",
      SSP_Recurring_Billing: "recurring_billing",
    };

    for (const [name, value] of Object.entries(fieldArgs)) {
      if (value === undefined) continue;
      if (nameToId[name]) {
        customFields.push({ id: nameToId[name], value });
      } else if (nameToKey[name]) {
        customFields.push({ key: `contact.${nameToKey[name]}`, value });
      }
    }

    if (extra_fields) {
      for (const f of extra_fields) customFields.push(f);
    }

    if (customFields.length === 0) {
      return { content: [{ type: "text", text: "No fields provided — nothing to update." }] };
    }

    const r = await ghlFetch("PUT", `/contacts/${contactId}`, { customFields });
    return {
      content: [{
        type: "text",
        text: r.ok
          ? `✅ Updated ${customFields.length} field(s) on contact ${contactId}`
          : `❌ GHL error ${r.status}: ${JSON.stringify(r.data)}`,
      }],
    };
  }
);

// ── TOOL: ssp_add_tags ───────────────────────────────────────────────────────
server.tool(
  "ssp_add_tags",
  "Add one or more SSP- prefixed tags to a contact",
  {
    contactId: z.string(),
    tags      : z.array(z.string()).describe("Tag names — will be prefixed with SSP- if not already"),
  },
  async ({ contactId, tags }) => {
    const normalised = tags.map(t => t.startsWith("SSP-") ? t : `SSP-${t}`);
    const r = await ghlFetch("POST", `/contacts/${contactId}/tags`, { tags: normalised });
    return {
      content: [{
        type: "text",
        text: r.ok
          ? `✅ Added tags: ${normalised.join(", ")}`
          : `❌ GHL error ${r.status}: ${JSON.stringify(r.data)}`,
      }],
    };
  }
);

// ── TOOL: ssp_remove_tags ────────────────────────────────────────────────────
server.tool(
  "ssp_remove_tags",
  "Remove one or more tags from an SSP contact",
  {
    contactId: z.string(),
    tags      : z.array(z.string()),
  },
  async ({ contactId, tags }) => {
    const normalised = tags.map(t => t.startsWith("SSP-") ? t : `SSP-${t}`);
    const r = await ghlFetch("DELETE", `/contacts/${contactId}/tags`, { tags: normalised });
    return {
      content: [{
        type: "text",
        text: r.ok
          ? `✅ Removed tags: ${normalised.join(", ")}`
          : `❌ GHL error ${r.status}: ${JSON.stringify(r.data)}`,
      }],
    };
  }
);

// ── TOOL: ssp_search_contacts ────────────────────────────────────────────────
server.tool(
  "ssp_search_contacts",
  "Search SSP contacts by name, email, or phone",
  {
    query: z.string().describe("Search term — name, email, or phone"),
    limit: z.number().default(10).optional(),
  },
  async ({ query, limit = 10 }) => {
    const r = await ghlFetch(
      "GET",
      `/contacts/search?locationId=${LOCATION_ID}&query=${encodeURIComponent(query)}&limit=${limit}`
    );
    return {
      content: [{
        type: "text",
        text: JSON.stringify(r.data, null, 2),
      }],
    };
  }
);

// ── TOOL: ssp_get_pipelines ──────────────────────────────────────────────────
server.tool(
  "ssp_get_pipelines",
  "List all SSP pipelines and their stages",
  {},
  async () => {
    const r = await ghlFetch("GET", `/opportunities/pipelines?locationId=${LOCATION_ID}`);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(r.data, null, 2),
      }],
    };
  }
);

// ── TOOL: ssp_create_opportunity ─────────────────────────────────────────────
server.tool(
  "ssp_create_opportunity",
  "Create an opportunity in the SSP Merchant Audit pipeline",
  {
    contactId  : z.string(),
    name       : z.string().describe("Opportunity name"),
    stage      : z.enum(["Stable", "Growth", "AtRisk", "Crisis"]).default("Stable"),
    monetaryValue: z.number().optional(),
    status     : z.enum(["open", "won", "lost", "abandoned"]).default("open"),
  },
  async ({ contactId, name, stage, monetaryValue, status }) => {
    const body = {
      locationId  : LOCATION_ID,
      pipelineId  : SSP_PIPELINE_ID,
      pipelineStageId: SSP_STAGES[stage],
      contactId,
      name,
      status,
    };
    if (monetaryValue !== undefined) body.monetaryValue = monetaryValue;

    const r = await ghlFetch("POST", "/opportunities/", body);
    return {
      content: [{
        type: "text",
        text: r.ok
          ? `✅ Opportunity created: ${JSON.stringify(r.data?.opportunity || r.data, null, 2)}`
          : `❌ GHL error ${r.status}: ${JSON.stringify(r.data)}`,
      }],
    };
  }
);

// ── TOOL: ssp_update_opportunity ─────────────────────────────────────────────
server.tool(
  "ssp_update_opportunity",
  "Update an existing SSP opportunity's stage or status",
  {
    opportunityId: z.string(),
    stage        : z.enum(["Stable", "Growth", "AtRisk", "Crisis"]).optional(),
    status       : z.enum(["open", "won", "lost", "abandoned"]).optional(),
    monetaryValue: z.number().optional(),
    name         : z.string().optional(),
  },
  async ({ opportunityId, stage, status, monetaryValue, name }) => {
    const body = {};
    if (stage)          body.pipelineStageId = SSP_STAGES[stage];
    if (status)         body.status = status;
    if (monetaryValue !== undefined) body.monetaryValue = monetaryValue;
    if (name)           body.name = name;

    const r = await ghlFetch("PUT", `/opportunities/${opportunityId}`, body);
    return {
      content: [{
        type: "text",
        text: r.ok
          ? `✅ Opportunity ${opportunityId} updated`
          : `❌ GHL error ${r.status}: ${JSON.stringify(r.data)}`,
      }],
    };
  }
);

// ── TOOL: ssp_get_opportunities_for_contact ───────────────────────────────────
server.tool(
  "ssp_get_opportunities_for_contact",
  "Get all SSP opportunities for a contact",
  { contactId: z.string() },
  async ({ contactId }) => {
    const r = await ghlFetch(
      "GET",
      `/opportunities/search?location_id=${LOCATION_ID}&contact_id=${contactId}`
    );
    return {
      content: [{
        type: "text",
        text: JSON.stringify(r.data, null, 2),
      }],
    };
  }
);

// ── TOOL: ssp_list_custom_fields ─────────────────────────────────────────────
server.tool(
  "ssp_list_custom_fields",
  "List all custom fields in the SSP location",
  {},
  async () => {
    const r = await ghlFetch(
      "GET",
      `/locations/${LOCATION_ID}/customFields?model=contact`
    );
    const fields = r.data?.customFields || [];
    const summary = fields.map(f => ({
      id      : f.id,
      name    : f.name,
      dataType: f.dataType,
      options : f.options?.map(o => o.value || o.label) || [],
    }));
    return {
      content: [{
        type: "text",
        text: JSON.stringify(summary, null, 2),
      }],
    };
  }
);

// ── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
