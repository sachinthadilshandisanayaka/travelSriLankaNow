# Development Changelog

| Task ID | Date | Description | Files Changed | Status |
|---------|------|-------------|---------------|--------|
| #001 | 2026-01-31 | Animation system (Three.js, GSAP, Sigiriya) | landing.component.ts/html/scss, sigiriya-scene.service.ts, particles-config.service.ts, package.json | Reverted |
| #002 | 2026-01-31 | Removed animations, simplified landing | landing.component.ts/html/scss, package.json | Completed |
| #003 | 2026-01-31 | Applied Navy Blue theme to landing | landing.component.scss | Completed |
| #004 | 2026-01-31 | Fixed View Details button - fixed position at bottom of cards | locations/events/places .html/.scss | Completed |
| #005 | 2026-01-31 | Applied fixed View Details button to landing page | landing.component.html/.scss | Completed |

---

## Rollback Reference

| Task | To Rollback | Action Required |
|------|-------------|-----------------|
| #005 | Restore old landing buttons | Revert landing.component to use location-footer with view-link |
| #004 | Restore old buttons | Revert card HTML/SCSS to use footer with view-link |
| #003 | Remove theme | Replace landing.component.scss with hardcoded colors |
| #002 | Restore animations | Re-add services + dependencies from #001 |
| #001 | Remove animations | Delete services, simplify component, remove deps |

---

## Theme Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Navy Dark | #0F2854 | Headers, buttons |
| Navy | #1C4D8D | Main actions |
| Blue | #4988C4 | Hover states |
| Sky | #BDE8F5 | Backgrounds |
| Gold | #D4AF73 | Ratings |

*Last Updated: 2026-01-31*
