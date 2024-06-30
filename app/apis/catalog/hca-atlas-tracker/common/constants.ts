import {
  Network,
  NetworkKey,
  ROLE,
  SYSTEM,
  TASK_STATUS,
  VALIDATION_STATUS,
} from "./entities";

export const WAVES = ["1", "2", "3"] as const;

export const NETWORK_KEYS = [
  "adipose",
  "breast",
  "development",
  "eye",
  "genetic-diversity",
  "gut",
  "heart",
  "immune",
  "kidney",
  "liver",
  "lung",
  "musculoskeletal",
  "nervous-system",
  "oral",
  "organoid",
  "pancreas",
  "reproduction",
  "skin",
] as const;

export const NETWORKS: Network[] = [
  {
    key: "adipose",
    name: "Adipose Network",
  },
  {
    key: "breast",
    name: "Breast Network",
  },
  {
    key: "development",
    name: "Development Network",
  },
  {
    key: "eye",
    name: "Eye Network",
  },
  {
    key: "genetic-diversity",
    name: "Genetic Diversity Network",
  },
  {
    key: "gut",
    name: "Gut Network",
  },
  {
    key: "heart",
    name: "Heart Network",
  },
  {
    key: "immune",
    name: "Immune Network",
  },
  {
    key: "kidney",
    name: "Kidney Network",
  },
  {
    key: "liver",
    name: "Liver Network",
  },
  {
    key: "lung",
    name: "Lung Network",
  },
  {
    key: "musculoskeletal",
    name: "Musculoskeletal Network",
  },
  {
    key: "nervous-system",
    name: "Nervous System Network",
  },
  {
    key: "oral",
    name: "Oral and Craniofacial Networks",
  },
  {
    key: "organoid",
    name: "Organoid Network",
  },
  {
    key: "pancreas",
    name: "Pancreas Network",
  },
  {
    key: "reproduction",
    name: "Reproduction Network",
  },
  {
    key: "skin",
    name: "Skin Network",
  },
];

export const NETWORK_ICONS: { [key in NetworkKey]: string } = {
  adipose: "/hca-bio-networks/icons/adipose.png",
  breast: "/hca-bio-networks/icons/breast.png",
  development: "/hca-bio-networks/icons/development.png",
  eye: "/hca-bio-networks/icons/eye.png",
  "genetic-diversity": "/hca-bio-networks/icons/genetic-diversity.png",
  gut: "/hca-bio-networks/icons/gut.png",
  heart: "/hca-bio-networks/icons/heart.png",
  immune: "/hca-bio-networks/icons/immune.png",
  kidney: "/hca-bio-networks/icons/kidney.png",
  liver: "/hca-bio-networks/icons/liver.png",
  lung: "/hca-bio-networks/icons/lung.png",
  musculoskeletal: "/hca-bio-networks/icons/musculoskeletal.png",
  "nervous-system": "/hca-bio-networks/icons/nervous-system.png",
  oral: "/hca-bio-networks/icons/oral-and-craniofacial.png",
  organoid: "/hca-bio-networks/icons/organoid.png",
  pancreas: "/hca-bio-networks/icons/pancreas.png",
  reproduction: "/hca-bio-networks/icons/reproduction.png",
  skin: "/hca-bio-networks/icons/skin.png",
};

export const ROLE_GROUP = {
  READ: [ROLE.STAKEHOLDER, ROLE.INTEGRATION_LEAD, ROLE.CONTENT_ADMIN],
};

export const SYSTEM_DISPLAY_NAMES: { [key in SYSTEM]: string } = {
  CAP: "CAP",
  CELLXGENE: "CELLxGENE",
  DUOS: "DUOS",
  HCA_DATA_REPOSITORY: "HCA Data Repository",
};

export const TASK_STATUS_BY_VALIDATION_STATUS: Record<
  VALIDATION_STATUS,
  TASK_STATUS
> = {
  [VALIDATION_STATUS.BLOCKED]: TASK_STATUS.BLOCKED,
  [VALIDATION_STATUS.FAILED]: TASK_STATUS.TODO,
  [VALIDATION_STATUS.OVERRIDDEN]: TASK_STATUS.TODO,
  [VALIDATION_STATUS.PASSED]: TASK_STATUS.DONE,
};

export const VALIDATION_DESCRIPTION = {
  ADD_PRIMARY_DATA: "Add primary data.",
  INGEST_SOURCE_STUDY: "Ingest source study.",
  UPDATE_TITLE_TO_MATCH_PUBLICATION:
    "Update project title to match publication title.",
};
