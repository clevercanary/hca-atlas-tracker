import fsp from "fs/promises";

const DATA_DICTIONARY_URL = "https://raw.githubusercontent.com/clevercanary/hca-validation-tools/refs/heads/main/data_dictionaries/core_data_dictionary.json";
const DATA_DICTIONARY_DOWNLOAD_PATH = "./catalog/downloaded/data-dictionary.json";


async function downloadDataDictionary(): Promise<void> {
  const arrayBuffer = await (await fetch(DATA_DICTIONARY_URL)).arrayBuffer();
  await fsp.writeFile(DATA_DICTIONARY_DOWNLOAD_PATH, new Uint8Array(arrayBuffer));
}

downloadDataDictionary();
