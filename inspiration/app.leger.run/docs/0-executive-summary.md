# Leger Backend: Executive Summary

**Document Version:** 1.0  
**Date:** October 2025  
**Scope:** v0.1.0 (Secrets + Static Hosting) → v0.2.0+ (Configuration Management)

## What is Leger Backend?

Leger Backend is the cloud-hosted API and storage service for the Leger deployment management system. It enables developers to securely store secrets and deployment configurations, accessible from any device via Tailscale-authenticated CLI.

## Architecture Philosophy

**Start Simple, Scale Intentionally**

v0.1.0 delivers the minimum viable infrastructure:
- Secure secret storage with encryption at rest
- Static file hosting for pre-rendered quadlet configurations
- Zero external infrastructure (Cloudflare Workers + KV + R2 only)
- Tailscale-based authentication

v0.2.0+ adds sophisticated configuration management:
- Web UI for high-level configuration (29 decision variables)
- Server-side template rendering
- Version tracking and schema evolution
- Deployment state coordination

## Technical Foundation

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Runtime** | Cloudflare Workers | Serverless edge compute |
| **Secret Storage** | Cloudflare KV | Encrypted key-value store |
| **File Storage** | Cloudflare R2 | S3-compatible object storage |
| **Database** | Cloudflare D1 (v0.2.0+) | SQLite-compatible relational DB |
| **Authentication** | Tailscale API | Zero-trust identity verification |

## v0.1.0: Secrets + Static Hosting

### What Users Can Do

1. **Authenticate:** `leger auth login` verifies via Tailscale
2. **Manage Secrets:** Create, read, update, delete encrypted secrets
3. **Upload Quadlets:** `leger config upload ./quadlets/` → R2 storage
4. **Deploy:** `leger deploy install` downloads and installs quadlets
5. **Multi-Device:** Access same secrets and configs from any device

### What Backend Provides

- **POST /auth/cli** - Tailscale identity verification, JWT issuance
- **Secrets API** - CRUD operations on encrypted secrets
- **Upload API** - Push quadlet files to R2 with versioning
- **Download API** - Pull quadlet files by version
- **Manifest API** - Fetch deployment metadata

### Critical Constraints Met

✅ **Zero Infrastructure:** No VMs, containers, or databases to manage  
✅ **Tailscale Only:** All auth via Tailscale API verification  
✅ **Cloudflare Only:** Workers + KV + R2 - no third-party services  
✅ **CLI-First:** Optimized for developer workflow  
✅ **Security:** Secrets encrypted at rest, Tailscale network perimeter

## v0.2.0+: Configuration Management

### Additional Capabilities

1. **Web UI:** Visual configuration builder (29 decision variables)
2. **Server Rendering:** Template quadlets based on user choices
3. **Version Control:** Track configuration history, rollback support
4. **Schema Evolution:** Migrate configs when templates change
5. **Deployment Tracking:** Monitor which devices have which versions

### Additional Backend Components

- **Cloudflare D1:** Relational database for configuration state
- **Template Engine:** Nunjucks/Liquid for quadlet rendering
- **Schema Registry:** Track template versions from GitHub
- **Diff Engine:** Compare configuration versions
- **Migration System:** Automatic config upgrades

## Data Flow Overview

### v0.1.0 Flow
```
Developer's Machine                 leger.run Backend
─────────────────────                ──────────────────
                                    
1. Render quadlets locally          
   (or clone from GitHub)           
                                    
2. leger config upload ./quadlets  → POST /config/upload
                                    → Store in R2: {user_uuid}/v1/
                                    → Save manifest in KV
                                    
3. leger secrets set key value      → POST /secrets/set
                                    → Encrypt with AES-256-GCM
                                    → Store in KV
                                    
[On different device]               
                                    
4. leger deploy install             → GET /config/latest
                                    ← Download from R2
                                    
5. podman quadlet install           
   legerd fetches secrets           → GET /secrets/get/:name
                                    ← Decrypt and return
```

### v0.2.0+ Flow
```
Developer's Browser                 leger.run Backend
───────────────────                 ──────────────────
                                    
1. Visit app.leger.run              
   Configure via web UI:            
   - Enable RAG? Yes                
   - Vector DB? pgvector             
   - Enable web search? Yes          
   [29 total decisions]             
                                    
2. Click "Save Configuration"       → POST /config/update
                                    → Store raw config in D1
                                    → Render templates with Nunjucks
                                    → Upload rendered quadlets to R2
                                    → Create version entry in D1
                                    ← Return: version 3
                                    
[On deployment machine]             
                                    
3. leger deploy update              → GET /config/latest
                                    → GET /config/diff/v2/v3
                                    ← Show changes
                                    ← Download new quadlets
                                    
4. leger apply                      
   Install with podman              
```

## Success Metrics

### v0.1.0 Launch Criteria

- [ ] CLI authenticates via Tailscale identity
- [ ] Secrets encrypted at rest in KV
- [ ] Users can upload quadlet files to R2
- [ ] Users can download quadlets from R2
- [ ] Versioning works (v1, v2, v3, etc.)
- [ ] All operations < 500ms latency
- [ ] Security audit passed
- [ ] CLI integration test passes

### v0.2.0+ Launch Criteria

- [ ] Web UI configuration builder functional
- [ ] Server-side template rendering working
- [ ] D1 schema supports versioning
- [ ] Configuration diff engine accurate
- [ ] Schema migration system tested
- [ ] Multi-device deployment tracking
- [ ] 1000+ user load test passed

## Development Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **v0.1.0** | 4 weeks | Secrets API, Upload API, R2 integration |
| **v0.1.1** | 2 weeks | Polish, performance optimization |
| **v0.2.0** | 8 weeks | D1 setup, Web UI, Template engine |
| **v0.2.1** | 4 weeks | Schema evolution, Migration system |
| **v1.0.0** | 2 weeks | Production hardening, Documentation |

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| R2 upload performance | Multipart uploads, chunking |
| KV eventual consistency | Cache invalidation strategy |
| Template rendering complexity | Use battle-tested engine (Nunjucks) |
| D1 migration safety | Blue-green schema deployment |
| Tailscale API rate limits | Verification result caching |

### Operational Risks

| Risk | Mitigation |
|------|-----------|
| Cloudflare outage | Document manual failover to GitHub |
| Secret key compromise | Key rotation procedure documented |
| R2 cost explosion | Usage monitoring, quota alerts |
| Breaking CLI changes | API versioning from day one |

## Go/No-Go Decision Points

### Ship v0.1.0 When:

✅ All launch criteria met  
✅ Security audit clean  
✅ CLI integration tests passing  
✅ Documentation complete  
✅ Monitoring dashboards live

### Start v0.2.0 When:

✅ v0.1.0 stable for 2 weeks  
✅ User feedback validates need for web UI  
✅ D1 schema design reviewed  
✅ Template library curated

## Stakeholder Summary

**For CLI Users:**
- v0.1.0: Upload your pre-rendered quadlets, access secrets anywhere
- v0.2.0+: Configure via web UI, automatic rendering, version control

**For Backend Developers:**
- v0.1.0: Simple APIs, clear boundaries, standard patterns
- v0.2.0+: Add D1 layer, template engine, no breaking changes to v0.1.0 APIs

**For Product:**
- v0.1.0: Validates core workflow, proves Tailscale auth
- v0.2.0+: Differentiates from competitors, unlocks advanced features

---

**Next Steps:**
1. Review data models (Document 2)
2. Define API contracts (Document 4)
3. Design authentication flow (Document 5)
4. Map business workflows (Document 7)
