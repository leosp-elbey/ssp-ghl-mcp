# SSP GHL MCP Server

MCP server scoped to the **Swipe Saver Pro** GHL location (`iVoa9cRtLfHVX66r48C7`).

## Tools

| Tool | Description |
|---|---|
| `ssp_get_contact` | Get full contact record by ID |
| `ssp_update_contact_fields` | Write SSP custom fields (Persona, ServiceRoute, Override, scores, etc.) |
| `ssp_add_tags` | Add SSP- prefixed tags |
| `ssp_remove_tags` | Remove tags |
| `ssp_search_contacts` | Search by name/email/phone |
| `ssp_get_pipelines` | List pipelines and stages |
| `ssp_create_opportunity` | Create opp in SSP Merchant Audit pipeline |
| `ssp_update_opportunity` | Update stage/status of existing opp |
| `ssp_get_opportunities_for_contact` | Get all opps for a contact |
| `ssp_list_custom_fields` | List all custom fields with IDs and options |

## Setup

### 1. Get SSP API Key
GHL → Swipe Saver Pro → Settings → Integrations → API Key  
Copy the key.

### 2. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway new

# Set env var
railway variables set GHL_SSP_API_KEY=your_key_here

# Deploy
railway up
```

### 3. Get your Railway URL
After deploy: `railway domain` — copy the HTTPS URL.

### 4. Add to this Claude project
In Claude.ai → this project → Settings → MCP Servers → Add:
- **Name**: SSP GHL
- **URL**: `https://your-railway-url.railway.app/mcp` (or the plain URL for stdio)

## Local dev (stdio mode — for Claude Code)
```bash
GHL_SSP_API_KEY=your_key node index.js
```

## Environment Variables
| Var | Required | Description |
|---|---|---|
| `GHL_SSP_API_KEY` | ✅ | SSP location API key from GHL Settings |

## Key IDs (hardcoded)
- Location: `iVoa9cRtLfHVX66r48C7`
- Pipeline: `UwXzxCezyHFwedkAq4pZ`
- SSP_Merchant_Persona field: `O7assrGiGh6ivY3LWnPf`
- SSP_Service_Route field: `wvQDucs20sbuvLmUUniW`
- SSP_Critical_Override field: `994C1y5mI2iKHxGQzCJz`
