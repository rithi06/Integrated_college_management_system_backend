const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard',
  authenticateToken,
  authorizeRoles('ADMIN'),
  (req, res) => {
    res.json({ message: "Welcome Admin Dashboard" });
  }
);
const { createStudent, getAllStudents, updateStudent, deleteStudent } = require('../controllers/adminController');

router.post(
  '/create-student',
  authenticateToken,
  authorizeRoles('ADMIN'),
  createStudent
);
router.get(
  '/students',
  authenticateToken,
  authorizeRoles('ADMIN'),
  getAllStudents
);
router.put(
  '/students/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  updateStudent
);
router.delete(
  '/students/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  deleteStudent
);

module.exports = router;
