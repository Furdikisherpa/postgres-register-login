import bcrypt from 'bcrypt'; // Use bcrypt instead of bcrypt.js
import jwtGenerator from '../utils/jwtGenerator.js'; // Ensure the correct path and extension
import { query } from '../config/db.js'; // Your database connection setup

// Registration function to create a new user
export const RegistrationUser = async (userData) => {

    //1. destructure the values from req.body
    const { full_name, user_email, user_address, user_number, user_qualification, password } = userData;

    // 2. Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert the user data into the database
    const { rows } = await query(
        `INSERT INTO user_tb (full_name, user_email, user_address, user_number, user_qualification, password)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [full_name, user_email, user_address, user_number, user_qualification, hashedPassword]
    );

    // Return the newly created user from the query result
    return rows[0]; // This returns the first row (the newly created user)

};

//Function to get a user by email to check if the email alreaady exists in the database
export const getUserByEmail = async (email) => {
    try{
        //Query the database to find a user by their email
        const result = await query(
            `SELECT * FROM user_tb WHERE user_email = $1` //SQL query to find a user with the given email
            , [email] // The email parameter to search for
        );

        //If a user is found, return the first row from the result
        if (result.rows.length > 0){
            return result.rows[0]; //Return the user details
        }

        // If no user is found, return null
        return null; //If no matching user is found, return null

    }catch(error){
        //If there is an error while querying the database, throw an error with a descriptive message
        throw new Error('Error fetching user by email'); //Throw an error if the query fails
    }
};

// Function to verify user login by comparing the provided email and password
export const verifyUserLogin = async (email, password) => {
    try {
        // Query the database to fetch a user by email
        const userResult = await query(
            `SELECT * FROM user_tb WHERE user_email = $1`,
            [email] // The email parameter
        );

        // If no user found, return an error message
        if (userResult.rows.length === 0) {
            return { error: "Sorry! An account with that email doesn't exist!" };
        }

        const user = userResult.rows[0];

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        //If the password doesn't match, return an error message 
        if (!isPasswordValid) {
            return { error: "Sorry! Email or password is incorrect" };
        }

        // If the password is valid, generate a JWT Tokem for the user
        const token = jwtGenerator(user.user_id); //Generate a JWT  token using the user's ID


        // Return a success message along with the generated token 
        return { message: "Login successfully!", token }; //Return success message and token

    } catch (error) {
        //If an error occurs, throw an error with the message
        throw new Error(error.message);// Throw the error message if any unexpected error occurs
    }
};
