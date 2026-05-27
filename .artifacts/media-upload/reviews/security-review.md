# Security Review — media-upload

**Date:** 2026-05-27
**Reviewer:** pipeline-security-reviewer

```
VERDICT: fail → see mitigations below

ISSUES:
- severity: major
  file: index.html
  category: authz
  message: Unsigned upload preset — anyone with cloud name + preset name can upload
  mitigation: Restrict upload preset in Cloudinary console:
    1. Settings → Upload → Upload presets → bdtrivia → Edit
    2. Allowed domains: 00vk.github.io
    3. Moderation: auto-approve (or manual)
    4. Upload limits: max 100 uploads/day

- severity: major
  file: index.html
  category: input-validation
  message: clientAllowedFormats is widget-only; direct API calls bypass it
  mitigation: Same preset — add allowed_formats server-side in preset config.
    Also added URL validation in code (checks https://res.cloudinary.com/ pattern).

- severity: minor
  file: index.html
  category: input-validation
  message: secure_url not validated before storage
  mitigation: Added URL pattern validation before storing in item.media

- severity: minor
  file: index.html
  category: network
  message: No SRI hash on CDN script
  mitigation: Low risk — Cloudinary is a major CDN; SRI impractical for widget CDN
