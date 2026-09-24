import crypto from "crypto";

const generateCode = () => {
  return crypto.randomBytes(4).toString("base64url");
};

export default generateCode;