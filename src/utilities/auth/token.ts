import jwt from "jsonwebtoken";

// Only HS256 is used to sign our tokens. Pinning the algorithm prevents
// algorithm-confusion attacks (e.g. a token forged with "none"/RS256).
const ALGORITHMS: jwt.Algorithm[] = ["HS256"];

/**
 * Verify a JWT's signature and return its decoded payload.
 *
 * Unlike `jwt.decode`, this validates the signature and expiry, so the payload
 * can be trusted for authorization decisions. Throws if the token is missing,
 * malformed, expired, or signed with the wrong key/algorithm.
 */
export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.TOKEN_SECRET_KEY, {
    algorithms: ALGORITHMS,
  });
}
