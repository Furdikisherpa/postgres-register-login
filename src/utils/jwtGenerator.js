import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Initialize dotenv to load environment variables
dotenv.config();

const jwtGenerator = (user_id) => {
  try {
    const payload = {
      user: user_id,
    };

    // Use the JWT_SECRET environment variable for signing the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return token;
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw new Error("Token generation failed");
  }
};

export default jwtGenerator;
