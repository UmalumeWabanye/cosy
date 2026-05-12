const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  toggleUser,
  deleteUser,
  getReports,
} = require('../controllers/adminController');

// All routes require auth + admin role
router.use(protect, adminOnly);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/toggle', toggleUser);
router.delete('/users/:id', deleteUser);

router.get('/reports', getReports);

module.exports = router;
