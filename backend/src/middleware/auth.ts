import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import User from "../models/user";

// 1. Check if the token is valid (Auth0)
export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE, // Make sure this is in your .env file
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL, // Make sure this is in your .env file
  tokenSigningAlg: "RS256",
});

// 2. Parse the token to find the user in OUR database
export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decoded.sub;

    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.sendStatus(401);
    }

    // Attach these to the request so the Controller can use them!
    (req as any).auth0Id = auth0Id as string;
    (req as any).userId = user._id.toString();
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
