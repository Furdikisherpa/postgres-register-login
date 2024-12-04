import * as userService from "../services/userServices.js"

export const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await userService.RegistrationUser(userData);
        res.status(200).json(newUser);
    }catch (err) {
        console.error('Error adding users:', err);
        res.status(500).json({message: "Internal Server"});
    }
}

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Call the service to verify login
        const result = await userService.verifyUserLogin(email, password);

        // Handle service response
        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        return res.json(result); // Send success response with token
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};