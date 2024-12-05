import * as userService from "../services/userServices.js"
import bcrypt from 'bcrypt'; // Use bcrypt instead of bcrypt.js
import jwtGenerator from '../utils/jwtGenerator.js'; // Ensure the correct path and extension

export const createUser = async (req, res) => {
    try {
        // Extract user data from the request body
        const userData = req.body;

        //Check if the user already exits by email (or other unique field)
        const existingUser = await userService.getUserByEmail(userData.user_email);

        //If the user already exists, return a response with a 400 status and error message
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
            }
                
        //If no user exists, create a new user by calling the RegistrationUser service    
        const newUser = await userService.RegistrationUser(userData);

        // Send a success response with status 200 and a success message
        res.status(200).json({
            message: "User created successfully",
            user: newUser,
        });
    
    }catch (err) {
        // If an error occurs, return a response with a 500 status and an error message
        console.error('Error adding users:', err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation to ensure both fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Call the service function to verify login credentials
        const userResult = await userService.verifyUserLogin(email, password);

        // Ensure the userResult is valid
        if (!userResult) {
            console.error('Invalid response from verifyUserLogin:', userResult);
            return res.status(404).json({ error: "Sorry! An account with that email doesn't exist!" });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, userResult.password);

        // If the password doesn't match, return an error message
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Sorry! Email or password is incorrect" });
        }

        // If the password is valid, generate a JWT token for the user
        const token = jwtGenerator(userResult.user_id);

        // Return a success message along with the generated token
        return res.status(200).json({ message: "Login successfully!", token });

    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error logging in users:', error.message, error.stack);

        // Send a generic error message with status 500
        return res.status(500).json({ error: "An error occurred during login. Please try again." });
    }
};


export const sendEmailToUser = async (req, res) => {
    const { userId, subject, message } = req.body;
  
    try {
      await userService.sendEmail(userId, subject, message); // Send email
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error sending email' });
    }
  };