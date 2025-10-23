# en vrac:

- no dashboard, the default page is the api keys secrets. 

- /settings is account settings, displaying tailscale account, cockpit enablement and delete account red button (see button at end of acountsettings2). cockpit enablemenet form is like security1 and security2. taiscale config is global.

- /api-keys is the api secret key page. see env4, env6 and env7 but could also balance it per-account like integrations-marketplace2. this is the connectable accounts section that is different from the integrations marketplace. this is for adding third party api s.

- /releases is the timestamped complete configurations, can create new release config ui is central, and it is orthoginal to the api secrets ("integrations") which are more static. this looks like main-config-management1. there is also a meta settings page for each release; as seen in project-settings2

- since a release takes some time to load into the r2 database, user can check status of their "deployment" (ie applying the templates and saving) like in domain6; tailnet-aware Domains moved to release level (Caddy per-release)

- per release settings: project-settings2

- services is like vercel's installed integrations console. there is an integrations console, and a link to the marketplace. see integrations-marketplace1.

- /marketplace when logged in has direct install button. overall centralized view with tags

- for leger there should be a dedicated models page

key commonalities:
- leger labs standard header is similar to "top header". described left to right: top row is logo, My Account, then at the right of the ui: STAR on github, changelog, docs. there is no top-right modal, the "account settings" are in the main settings
- second row is for: api keys, releases/deployments, models (coming soon), marketplace, settings


env variables entry is done like in the env7 picture; this is where the user can see api keys

note: "releases" and "deployments" are fully interchangeabe.

---

decision framework template
### [Section Name]

**Status**: 🟡 TO DECIDE → ✅ DECIDED / ❌ OUT / 🔄 DEFERRED

**Implementation Strategy**:
- [ ] Hardcoded Custom React
- [ ] Schema-Driven RJSF
- [ ] Hybrid (Custom wrapper + RJSF forms)

**Features Included**:
- ✅ Feature 1 - Rationale
- ✅ Feature 2 - Rationale
- ❌ Feature 3 - Why excluded

**Features Excluded** (from Vercel):
- ❌ Teams - No team accounts
- ❌ Feature X - Not needed because...

**Schema Requirements** (if RJSF):
```json
{
  "type": "object",
  "properties": {
    "fieldName": { "type": "string" }
  }
}
```

**Component Usage**:
```typescript
// High-level structure
<PageLayout>
  <CategorySection>...</CategorySection>
</PageLayout>
```

**Open Questions**:
1. Question about functionality?
2. Question about UX flow?
3. Question about data model?
```

---

## Navigation Hierarchy (IA)
```
┌─────────────────────────────────────────┐
│ Main Navigation (Top Bar)               │
├─────────────────────────────────────────┤
│ • Projects (dropdown)                   │
│ • Account                               │
│ • [User Avatar] → Account Settings      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Project-Level Navigation (Sidebar)      │
├─────────────────────────────────────────┤
│ Project: [Dropdown]                     │
│                                         │
│ Overview                                │
│ Deployments                             │
│ Settings                                │
│   ├─ General                            │
│   ├─ Domains                            │
│   ├─ Environment Variables              │
│   ├─ Integrations                       │
│   └─ Advanced                           │
│ Security & Access                       │
│   ├─ Tailscale Network                  │
│   └─ Authentication                     │
└─────────────────────────────────────────┘
```
