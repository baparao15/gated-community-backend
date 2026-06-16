const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Admin: user management
router.get('/users', protect, authorize('Admin', 'SuperAdmin'), ctrl.listUsers);
router.get('/users/:id', protect, ctrl.getUserById);
router.patch('/users/:id/approve', protect, authorize('Admin', 'SuperAdmin'), ctrl.approveUser);
router.patch('/users/:id/status', protect, authorize('Admin', 'SuperAdmin'), ctrl.updateUserStatus);
router.patch('/users/:id/role', protect, authorize('SuperAdmin'), ctrl.updateUserRole);
router.delete('/users/:id', protect, authorize('Admin', 'SuperAdmin'), ctrl.deleteUser);

// Resident: own profile
router.get('/residents/profile', protect, authorize('Resident'), ctrl.getMyProfile);
router.patch('/residents/profile', protect, authorize('Resident'), ctrl.updateMyProfile);
router.post('/residents/tenants', protect, authorize('Resident'), ctrl.addTenant);

// Admin: units
router.get('/units', protect, authorize('Admin', 'SuperAdmin'), ctrl.listUnits);
router.post('/units', protect, authorize('Admin', 'SuperAdmin'), ctrl.createUnit);
router.patch('/units/:id', protect, authorize('Admin', 'SuperAdmin'), ctrl.updateUnit);

module.exports = router;
