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