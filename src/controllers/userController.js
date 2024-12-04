import * as userService from "../services/userServices.js"

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
        //Extract email and password from the request body
        const { email, password } = req.body;

        // Call the service function to verify login credentials
        const result = await userService.verifyUserLogin(email, password);

        // if there is an error in the login result (e.g., invalid credentials), send a 401 error response
        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        //If login is successful, return the result (which includes the token) in the response
        return res.json(result); // Send success response with token

    } catch (error) {
        //If an error occurs during login, log the error message and send a 500 error response
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};