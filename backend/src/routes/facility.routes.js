const router = require('express').Router();
const ctrl = require('../controllers/facility.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createFacilitySchema, bookingSchema, approveBookingSchema } = require('../validators/facility.validator');

// Facilities
router.get('/facilities', protect, ctrl.listFacilities);
router.post('/facilities', protect, authorize('Admin', 'SuperAdmin'), validate(createFacilitySchema), ctrl.createFacility);
router.patch('/facilities/:id', protect, authorize('Admin', 'SuperAdmin'), ctrl.updateFacility);
router.get('/facilities/:id/availability', protect, ctrl.checkAvailability);

// Bookings
router.post('/bookings', protect, authorize('Resident'), validate(bookingSchema), ctrl.requestBooking);
router.get('/bookings/my', protect, authorize('Resident'), ctrl.getMyBookings);
router.get('/bookings', protect, authorize('Admin', 'SuperAdmin'), ctrl.listBookings);
router.patch('/bookings/:id/approve', protect, authorize('Admin', 'SuperAdmin'), validate(approveBookingSchema), ctrl.approveBooking);
router.patch('/bookings/:id/cancel', protect, ctrl.cancelBooking);

module.exports = router;
