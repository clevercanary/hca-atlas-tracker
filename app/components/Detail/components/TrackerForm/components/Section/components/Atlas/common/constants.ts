export const DEFAULT_INPUT_PROPS = {
  BIO_NETWORK: {
    displayEmpty: true,
    label: "Select network",
    readOnly: false,
  },
  INTEGRATION_LEAD_EMAIL: {
    label: "Email",
    readOnly: false,
  },
  INTEGRATION_LEAD_NAME: {
    label: "Full name",
    readOnly: false,
  },
  SHORT_NAME: {
    label: "Short name",
    placeholder: "e.g. Cortex",
    readOnly: false,
  },
  VERSION: {
    label: "Version",
    placeholder: "e.g. 1.0",
    readOnly: false,
  },
  WAVE: {
    displayEmpty: true,
    label: "Select wave",
    readOnly: false,
  },
};
export const FIELD_NAME = {
  BIO_NETWORK: "network",
  INTEGRATION_LEAD_EMAIL: "integrationLead.email",
  INTEGRATION_LEAD_NAME: "integrationLead.name",
  SHORT_NAME: "shortName",
  VERSION: "version",
  WAVE: "wave",
} as const;
