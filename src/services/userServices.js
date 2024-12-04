import bcrypt from 'bcrypt'; // Use bcrypt instead of bcrypt.js
import jwtGenerator from '../utils/jwtGenerator.js'; // Ensure the correct path and extension
import { query } from '../config/db.js'; // Your database connection setup

export const RegistrationUser = async (userData) => {
    const { full_name, user_email, user_address, user_number, user_qualification, password } = userData;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await query(
        `INSERT INTO user_tb (full_name, user_email, user_address, user_number, user_qualification, password)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [full_name, user_email, user_address, user_number, user_qualification, hashedPassword]
    );

    return rows[0];
};

export const verifyUserLogin = async (email, password) => {
    try {
        // Fetch user from the database by email
        const userResult = await query(
            `SELECT * FROM user_tb WHERE user_email = $1`,
            [email]
        );

        // If no user found, return an error
        if (userResult.rows.length === 0) {
            return { error: "Sorry! An account with that email doesn't exist!" };
        }

        const user = userResult.rows[0];

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return { error: "Sorry! Email or password is incorrect" };
        }

        // Generate token and return user details
        const token = jwtGenerator(user.user_id);

        return { message: "Login successfully!", token };
    } catch (error) {
        throw new Error(error.message);
    }
};
