/**
 * The people the Documents screens assign work to.
 *
 * There is no user-management source for this yet — `US-002` and `US-004`
 * manage users in Settings, but the prototype does not join the two lists —
 * so this stays the mockup's roster, shared rather than re-declared per
 * screen. Two screens each holding their own copy is how the Author field and
 * the Document Type field drifted apart before 2026-11-10.
 */
export const people = [
  "Sarah Johnson",
  "James O’Brien",
  "Priya Shah",
  "Emily Chen",
  "Ravi Patel",
  "Amit Kothari",
  "Nina Patel",
];

// Departments moved to `organisation-settings.ts` on 2026-11-11, when
// `US-009 - Manage Departments` was built: they are configured in Settings
// now, so a second hard-coded copy here would be the drift this module exists
// to prevent.
