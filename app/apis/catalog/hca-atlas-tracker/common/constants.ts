import { StaticImageData } from "next/image";
import adiposeIcon from "../../../../../public/hca-bio-networks/icons/adipose.png";
import breastIcon from "../../../../../public/hca-bio-networks/icons/breast.png";
import developmentIcon from "../../../../../public/hca-bio-networks/icons/development.png";
import eyeIcon from "../../../../../public/hca-bio-networks/icons/eye.png";
import geneticDiversityIcon from "../../../../../public/hca-bio-networks/icons/genetic-diversity.png";
import gutIcon from "../../../../../public/hca-bio-networks/icons/gut.png";
import heartIcon from "../../../../../public/hca-bio-networks/icons/heart.png";
import immuneIcon from "../../../../../public/hca-bio-networks/icons/immune.png";
import kidneyIcon from "../../../../../public/hca-bio-networks/icons/kidney.png";
import liverIcon from "../../../../../public/hca-bio-networks/icons/liver.png";
import lungIcon from "../../../../../public/hca-bio-networks/icons/lung.png";
import musculoskeletalIcon from "../../../../../public/hca-bio-networks/icons/musculoskeletal.png";
import nervousSystemIcon from "../../../../../public/hca-bio-networks/icons/nervous-system.png";
import oralIcon from "../../../../../public/hca-bio-networks/icons/oral-and-craniofacial.png";
import organoidIcon from "../../../../../public/hca-bio-networks/icons/organoid.png";
import pancreasIcon from "../../../../../public/hca-bio-networks/icons/pancreas.png";
import reproductionIcon from "../../../../../public/hca-bio-networks/icons/reproduction.png";
import skinIcon from "../../../../../public/hca-bio-networks/icons/skin.png";
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

export const NETWORK_ICONS: { [key in NetworkKey]: StaticImageData } = {
  adipose: adiposeIcon,
  breast: breastIcon,
  development: developmentIcon,
  eye: eyeIcon,
  "genetic-diversity": geneticDiversityIcon,
  gut: gutIcon,
  heart: heartIcon,
  immune: immuneIcon,
  kidney: kidneyIcon,
  liver: liverIcon,
  lung: lungIcon,
  musculoskeletal: musculoskeletalIcon,
  "nervous-system": nervousSystemIcon,
  oral: oralIcon,
  organoid: organoidIcon,
  pancreas: pancreasIcon,
  reproduction: reproductionIcon,
  skin: skinIcon,
};
