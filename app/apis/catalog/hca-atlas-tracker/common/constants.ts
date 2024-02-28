import { Network, NetworkKey } from "./entities";

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
