import bcrypt from 'bcrypt'; // Use bcrypt instead of bcrypt.js
import { query } from '../config/db.js'; // Your database connection setup
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// Registration function to create a new user
export const RegistrationUser = async (userData) => {

    //1. destructure the values from req.body
    const { full_name, user_email, user_address, user_number, user_qualification, password, otp_code, otp_expiration, is_verified } = userData;

    // 2. Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert the user data into the database
    const { rows } = await query(
        `INSERT INTO user_tb (full_name, user_email, user_address, user_number, user_qualification, password, otp_code, otp_expiration, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [full_name, user_email, user_address, user_number, user_qualification, hashedPassword, otp_code, otp_expiration, is_verified]
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
export const verifyUserLogin = async (email) => {
        // Query the database to fetch a user by email
        const { rows } = await query(
            `SELECT * FROM user_tb WHERE user_email = $1`,
            [email] // The email parameter
        );

       
        return rows[0]; // This returns the first row (the newly created user)

    
     
};


//Fetch email and name from the database
const getUserEmailAndName = async (userId) => {
    try{
        const result = await query('SELECT user_email, full_name FROM user_tb WHERE user_id = $1', [userId]);
        if(result.rows.length === 0){
            throw new Error('User not found');
        }
        return result.rows[0];
    }catch(error){
        throw new Error('Error fetching user email and name from database: '+ error.message);
    }
};

//Send email function
export const sendEmail = async (userId, subject, message) => {
    try{
        const user = await getUserEmailAndName(userId);  // Get the user's email and name
        const { user_email, full_name } = user;
    
        // Personalize the email by including the user's name
        const personalizedMessage = `Hello ${full_name},\n\n${message}`;  // Modify message with name

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user_email,
            subject: subject,
            text: personalizedMessage,

        });

        console.log('Email sent successfully');

    } catch (error){

        console.log('Error sending email:', error);
        throw new Error('Error sending email', error.message);
    }
}

