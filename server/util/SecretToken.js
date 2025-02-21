import dotenv from "dotenv"
dotenv.config()
import jwt from "jsonwebtoken"

export const createSecretToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_KEY, {
    expiresIn: '30d',
  });
};

export const createRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: '70d', 
  });
};


export const verifyToken = (req, res, next) => {
    // Check for token in the Authorization header first, then check cookies if not found
    let token = req.headers['authorization']?.split(' ')[1] || req.cookies.token;
  
    if (!token) {
      return res.status(403).json({ message: "Access denied, no token provided." });
    }
    
    // Verify the token
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        res.clearCookie('refresh_token');
        res.clearCookie('token');
        return res.status(401).json({ message: "Invalid or expired token." });
      }
      req.userId = decoded.id;
      next(); 
    });
  };

  
  