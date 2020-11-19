import os from "os";
import selfsigned from "selfsigned";
import logger from "./logger";
import { promises as fs } from "fs";
import { validateCertKeyPair } from "ssl-validator";
import { certPath, certKeyPath } from "./config";
import crypto from "crypto";

const genCert = async (certPath: string, keyPath: string) => {
  const nets = os.networkInterfaces();
  if (nets == null) {
    throw Error("could not list network interfaces");
  }
  const opts = {
    days: 365,
    extensions: [
      {
        name: "subjectAltName",
        altNames: [] as any,
      },
    ],
  };

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      opts.extensions[0].altNames.push({
        type: 7,
        ip: net.address.toString(),
      });
    }
  }
  logger.info(opts);
  const pems = selfsigned.generate(
    [
      {
        name: "commonName",
        value: "fcl",
      },
      {
        name: "countryName",
        value: "DE",
      },
      {
        name: "stateOrProvinceName",
        value: "Hamburg",
      },
      {
        name: "localityName",
        value: "Hamburg",
      },
      {
        name: "organizationName",
        value: "fcl",
      },
      {
        name: "organizationalUnitName",
        value: "fcl",
      },
    ],
    opts
  );

  await fs.writeFile(certPath, pems.cert);
  await fs.writeFile(keyPath, pems.private);
};

const validateCertKey = async (certPath: string, keyPath: string) => {
  const cert = await fs.readFile(certPath);
  const key = await fs.readFile(keyPath);
  await validateCertKeyPair(cert, key, { skipDateValidation: false });
};

const getHash = (
  content: string,
  inputEncoding: crypto.Utf8AsciiLatin1Encoding,
  outputEncoding: crypto.HexBase64Latin1Encoding
) => {
  const shasum = crypto.createHash("sha256");
  shasum.update(content, inputEncoding);
  const res = shasum.digest(outputEncoding);
  return res;
};

//   fingerprint: 'sha256/gW7+77XUu/I9NQQFi240qT5r28IBjzxfXRBXVE3AXBE='
const getCertFingerprint = async () => {
  const buf = await fs.readFile(certPath);
  const certificate = buf
    .toString()
    .split("\n")
    .filter((line) => !line.includes("-----"))
    .map((line) => line.trim())
    .join("");

  // [NODE VERSION] openssl x509 -noout -fingerprint -sha256 -inform pem -in cert.crt
  const hash = getHash(
    certificate,
    "base64" as crypto.Utf8AsciiLatin1Encoding,
    "base64" as crypto.HexBase64Latin1Encoding
  );

  return `sha256/${hash}`;
};

const initCert = async () => {
  try {
    await validateCertKey(certPath, certKeyPath);
    await fs.access(certPath);
    await fs.access(certKeyPath);
  } catch (e) {
    logger.warn(e);
    await genCert(certPath, certKeyPath);
    logger.info("generated cert and key");
  }
};

export { initCert, genCert, validateCertKey, getCertFingerprint };
