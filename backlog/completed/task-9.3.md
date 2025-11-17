---
id: task-9.3
title: "Implement Prompt Template System"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P2", "violet"]
milestone: "M9 - Violet AI Integration"
dependencies: []
estimated_hours: 3
---

## Description
Create the system prompt template library for different Violet use cases (D-046: draft_message, gig_inquiry, songwriting, career_advice).

## Acceptance Criteria
- [ ] Prompt templates defined for all contexts
- [ ] draft_message: Warm, engaging fan message template
- [ ] gig_inquiry: Professional booking inquiry template
- [ ] songwriting: Creative lyrical assistance template
- [ ] career_advice: Industry-aware guidance template
- [ ] Templates stored as constants or configuration
- [ ] Easy to add new templates
- [ ] Templates include tone, constraints, output format guidance

## Implementation Plan
1. Create api/utils/violet-templates.ts
2. Define getVioletSystemPrompt(context: string) function
3. Create template object with contexts as keys:
   - draft_message: "You are Violet, an AI assistant helping an artist write a fan message. Be warm, engaging, and authentic. Keep it under 500 words. Focus on connecting with fans and sharing updates."
   - gig_inquiry: "You are Violet, an AI assistant helping an artist write a gig inquiry. Be professional, highlight their strengths, and include relevant experience. Keep it concise (150-300 words)."
   - songwriting: "You are Violet, an AI assistant helping an artist with songwriting. Offer creative suggestions, lyrical ideas, and constructive feedback. Be encouraging and collaborative."
   - career_advice: "You are Violet, an AI assistant providing career guidance to an independent artist. Be encouraging, practical, and industry-aware. Offer actionable next steps."
4. Export function that returns appropriate template for context
5. Add default template for unknown contexts (falls back to career_advice)
6. Document template structure for future additions

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-046 (Real AI with prompt templates)
- docs/initial-spec/architecture.md - Claude API prompting strategy

**Priority:** P2 - Violet quality feature
**File:** api/utils/violet-templates.ts
**Can Run Parallel With:** task-9.1, task-9.2
