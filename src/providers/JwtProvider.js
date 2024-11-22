import JWT from "jsonwebtoken";
const generateToken = async (payload, tokenLife = "1d", secretSignature) => {
  try {
    return JWT.sign(payload, secretSignature, {
      expiresIn: tokenLife,
      algorithm: "HS256",
    });
  } catch (error) {
    throw new Error(error);
  }
};
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
  }
};
export const JwtProvider = { generateToken, verifyToken };
