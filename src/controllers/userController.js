import * as userService from "../services/userServices.js"
import  generateOTP  from "../utils/otp.generator.js";
import bcrypt from 'bcrypt'; // Use bcrypt instead of bcrypt.js
import jwtGenerator from '../utils/jwtGenerator.js'; // Ensure the correct path and extension
import sendEmail from "../utils/nodemailer.js";

export const createUser = async (req, res) => {
    try {
        // Extract user data from the request body
        const userData = req.body;
        console.log(userData);
        const otp = generateOTP()

        //Check if the user already exits by email (or other unique field)
        const existingUser = await userService.getUserByEmail(userData.user_email);

        //If the user already exists, return a response with a 400 status and error message
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
            }


            //this data is to be stored in database
        const queries = {
            ...userData,
            otp_code: otp,  // Add the OTP code
            otp_expiration: new Date(Date.now() + 10 * 60 * 1000),  // Set OTP expiration to 10 minutes
            is_verified: false,  // Set verification status to false initially
        }

        const subject = 'Email Verification'
        const message = `Your OTP code is: ${otp}`

        sendEmail(queries.user_email, subject, message)
                
        //If no user exists, create a new user by calling the RegistrationUser service    
        const newUser = await userService.RegistrationUser(queries);

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


 export  const ResendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Generate a new OTP and set expiration
        const otp = generateOTP();
        const queries = {
            email,
            otp_code: otp,
            otp_expiration: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
        };

        const subject = 'Email Verification';
        const message = `Your OTP code is: ${otp}`;

        // Check if the email exists in the database
        const emailExists = await userService.EmailExists({ email });

        if (!emailExists || emailExists.length === 0) {
            // If email doesn't exist, return a 404 error
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the OTP to the user's email
        sendEmail(email, subject, message);

        // Update the OTP and expiration in the database
        const result = await userService.ResendOTP(queries);

        // Return success response
        return res.status(200).json({
            message: 'OTP is resent',
            result,
        });
    } catch (error) {
        console.error('Error resending OTP:', error.message);

        // Handle errors and return 500 response
        return res.status(500).json({ message: 'Error resending OTP', error: error.message });
    }
};


export const VerifyEmail = async (req, res) => {
    try {
        const { email, otp_code } = req.body;

        // Step 1: Check if the email exists
        const emailExists = await userService.EmailExists({ email });

        if (emailExists.length <= 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Step 2: Attempt to verify the email
        try {
            const user = await userService.VerifyEmail({ email, otp_code });

            // If the OTP is invalid or the user could not be found
            if (!user) {
                return res.status(400).json({ message: 'OTP is invalid' });
            }

            // If the email is successfully verified
            const result = user;

            console.log(result);

            return res.status(200).json({
                message: 'Email is verified',
                result: result,
            });
        } catch (error) {
            // Handling specific errors
            if (error.message === 'OTP is expired') {
                return res.status(400).json({ message: 'OTP is expired' });
            }
            if (error.message === 'Email has already been verified') {
                return res.status(401).json({ message: 'Email has already been verified' });
            }
        }
    } catch (error) {
        // General error handling
        return res.status(500).json({ message: error.message });
    }
};
