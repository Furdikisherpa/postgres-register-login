import { query } from '../config/db.js';

export const RegistrationUser = async(userData) => {
    const { full_name, user_email, user_address, user_number, user_qualification, password} = userData;
    const {rows} = await query (
        `INSERT INTO user_tb ( full_name, user_email, user_address, user_number, user_qualification, password)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [full_name, user_email, user_address, user_number, user_qualification, password]
    );
    return rows[0];
}