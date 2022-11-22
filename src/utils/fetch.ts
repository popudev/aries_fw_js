import fetch from "node-fetch";

export const getGenesisTransaction = async (url: string) => {
  const response = await fetch(url);
  return await response.text();
};
