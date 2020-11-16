import { Plugins } from "@capacitor/core";
const { SSLIntercept } = Plugins;
import { isPlatform } from "@ionic/vue";
import { getJSON, setJSON } from "@kickertech/common/store/SettingsStore";
const FP_STORE_KEY = "ssl_fingerprints";

export const getFingerprints = () => {
  const fp = getJSON(FP_STORE_KEY);
  if (!fp) {
    return [];
  }
  return fp;
};

export const syncFingerprints = () => {
  const fs = getFingerprints();
  if ((isPlatform("ios") || isPlatform("android")) && fs) {
    fs.forEach((f: string) => SSLIntercept.addFingerprint({ fingerprint: f }));
  }
};

export const addFingerprint = (fingerprint: string) => {
  let fp = getJSON(FP_STORE_KEY);
  if (fp == null) {
    fp = [];
  }
  if (fp && !fp.find((x: string) => x == fingerprint)) {
    fp.push(fingerprint);
    setJSON(FP_STORE_KEY, fp);
  }
  if (isPlatform("ios") || isPlatform("android")) {
    SSLIntercept.addFingerprint({ fingerprint });
  }
};

export const removeFingerprint = (fingerprint: string) => {
  let fp = getJSON(FP_STORE_KEY);
  if (fp) {
    fp = fp.filter((x: string) => x != fingerprint);
    setJSON(FP_STORE_KEY, fp);
  }
  if (isPlatform("ios") || isPlatform("android")) {
    SSLIntercept.removeFingerprint({ fingerprint });
  }
};
