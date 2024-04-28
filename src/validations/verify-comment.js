import getPool from "../database/get-pool.js";

export default async function verifyComment(id) {
  const pool = await getPool();
  try {
    const [[comment]] = await pool.query(
      `SELECT * FROM comments WHERE id = ?`,[id]);
    console.log(comment);
    if (!comment) {
      throw {
        status: 404,
        message: "Comment not found",
        code: "NOT FOUND",
      };
    }

    return comment;
  } catch (error) {
    throw error;
  }
}