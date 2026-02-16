const pool = require('../config/db');
const bcrypt = require('bcrypt');

const createStudent = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
  name,
  email,
  password,
  phone,
  register_number,
  roll_number,
  department_id
} = req.body;


    await client.query('BEGIN');

    // 1️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ Insert into users table
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, 'STUDENT')
       RETURNING id`,
      [name, email, hashedPassword, phone]
    );

    const userId = userResult.rows[0].id;

    // 3️⃣ Insert into students table
    const studentResult = await client.query(
      `INSERT INTO students (user_id, register_number, roll_number, department_id)
       VALUES ($1, $2, $3,$4)
       RETURNING *`,
      [userId, register_number, roll_number, department_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: "Student created successfully",
      student: studentResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: "Failed to create student" });
  } finally {
    client.release();
  }
};
const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        u.name,
        u.email,
        u.phone,
        s.register_number,
        s.roll_number,
        s.department_id,
        s.created_at
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { register_number, roll_number, department_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE students
       SET register_number = $1,
           roll_number = $2,
           department_id = $3
       WHERE id = $4
       RETURNING *`,
      [register_number, roll_number, department_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      message: "Student updated successfully",
      student: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update student" });
  }
};
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    // Get student first
    const studentResult = await pool.query(
      "SELECT user_id FROM students WHERE id = $1",
      [id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const userId = studentResult.rows[0].user_id;

    // Delete student
    await pool.query("DELETE FROM students WHERE id = $1", [id]);

    // Delete linked user
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.json({ message: "Student deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete student" });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent
};


