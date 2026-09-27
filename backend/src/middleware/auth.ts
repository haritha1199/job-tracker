import jwt from "jsonwebtoken";
import { error } from "node:console";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if(!token) {
    return res.status(401).json({error: 'no token provided'});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  }
  catch (err) {
    res.status(401).json({error: 'invalid or expired token'});
  }
}