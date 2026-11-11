/**
 * What Settings configures and the rest of Accura reads.
 *
 * `US-007` (PRD-001) AC-04, `US-008` AC-04 and `US-009` AC-01 all exist so
 * that one administrator decision reaches the modules: a document type's
 * abbreviation and review frequency, the organisation's ID format, and the
 * department list. Until 2026-11-11 each of those was hard-coded separately in
 * the screen that needed it — the frequency as a constant in the document
 * details, the numbering as literals in the create form, the departments in
 * `document-directory.ts` — so Settings showed values it did not own and the
 * modules used values nobody could change.
 *
 * The state lives in `DocumentsPrototype` and is passed down, so an edit in
 * Settings is visible in Documents without a reload.
 */

/** `US-007` AC-01: the twelve built-in types, with their review frequency. */
export type DocumentTypeSetting = {
  abbreviation: string;
  description: string;
  /** `US-007` AC-03: whole years, defaulting to 3. */
  frequencyYears: number;
  name: string;
};

/** `US-007` (PRD-001) AC-03: the default when a type sets none of its own. */
export const DEFAULT_REVIEW_YEARS = 3;

export const initialDocumentTypes: DocumentTypeSetting[] = [
  {
    abbreviation: "BR",
    description: "Instructions and records for manufacturing a specific batch",
    frequencyYears: 3,
    name: "Batch Record",
  },
  {
    abbreviation: "DS",
    description: "Technical design details for implementing requirements",
    frequencyYears: 3,
    name: "Design Specification",
  },
  {
    abbreviation: "EXT",
    description: "Externally issued documents used by the organisation",
    frequencyYears: 2,
    name: "External Document",
  },
  {
    abbreviation: "FS",
    description: "Description of how a system will meet user requirements",
    frequencyYears: 3,
    name: "Functional Specification",
  },
  {
    abbreviation: "MS",
    description: "Acceptance criteria for a raw material or component",
    frequencyYears: 3,
    name: "Material Specification",
  },
  {
    abbreviation: "PS",
    description: "Acceptance criteria for a finished product",
    frequencyYears: 3,
    name: "Product Specification",
  },
  {
    abbreviation: "REC",
    description: "Completed evidence of an activity having been performed",
    frequencyYears: 5,
    name: "Record",
  },
  {
    abbreviation: "REP",
    description: "Findings and conclusions from a study or investigation",
    frequencyYears: 3,
    name: "Report",
  },
  {
    abbreviation: "TMP",
    description: "Reusable blank form issued under document control",
    frequencyYears: 3,
    name: "Template",
  },
  {
    abbreviation: "TM",
    description: "Procedure for performing an analytical or physical test",
    frequencyYears: 3,
    name: "Test Method",
  },
  {
    abbreviation: "URS",
    description: "Requirements describing what a system or equipment must do",
    frequencyYears: 3,
    name: "User Requirements Specification",
  },
  {
    abbreviation: "VMP",
    description:
      "Overall strategy and responsibilities for validation activities",
    frequencyYears: 3,
    name: "Validation Master Plan",
  },
];

/** `US-009` AC-01: each department has a Name and an optional Description. */
export type DepartmentSetting = { description: string; name: string };

export const initialDepartments: DepartmentSetting[] = [
  {
    description: "Equipment, facilities and technical design",
    name: "Engineering",
  },
  {
    description: "Production lines, batch execution and packaging",
    name: "Manufacturing",
  },
  {
    description: "Testing, release and laboratory operations",
    name: "Quality Control",
  },
];

/**
 * `US-008` AC-01: the Document ID format. The Document Type segment is not
 * here — AC-01 says it comes from Settings > Documents > Document Types.
 */
export type NumberingSetting = {
  includeYear: boolean;
  prefix: string;
  separator: "-" | "/" | ".";
  sequenceLength: number;
};

export const initialNumbering: NumberingSetting = {
  includeYear: true,
  prefix: "ACME",
  separator: "-",
  sequenceLength: 6,
};

/**
 * `US-008` AC-02: the preview is built the same way a real ID is, so what the
 * administrator sees is what the modules will generate.
 */
export function formatDocumentId(
  numbering: NumberingSetting,
  abbreviation: string,
  sequence: number,
) {
  const parts = [numbering.prefix, abbreviation];
  if (numbering.includeYear) parts.push(String(new Date().getFullYear()));
  parts.push(String(sequence).padStart(numbering.sequenceLength, "0"));
  return parts.join(numbering.separator);
}

/** The review frequency for a type written "Name (ABBR)", or the default. */
export function frequencyForType(
  types: DocumentTypeSetting[],
  typeLabel: string,
) {
  const abbreviation = typeLabel.match(/\(([^)]+)\)\s*$/)?.[1];
  const match = types.find(
    (type) =>
      type.abbreviation === abbreviation ||
      `${type.name} (${type.abbreviation})` === typeLabel,
  );
  return match?.frequencyYears ?? DEFAULT_REVIEW_YEARS;
}
