import jwt from "jsonwebtoken";
export const isLoggedIn = async (req, res, next) => {
  try {
    console.log(req.cookies.test);
    const token = req.cookies?.test;
    console.log("Token Found : ", token ? "YES" : "NO");
    
    if (!token) {
      console.log("No token");
      return res.status(401).json({
        success: false,
        message: "Authentication Failed",
      });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.log("Auth middleware failed", error);
  }
};
