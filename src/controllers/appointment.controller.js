const Appointment = require('../models/appointment.model');
const { isDoctorAvailable } = require('../mock/doctorAvailability');

exports.createAppointment = async (req, res) => {
  const { patientId, doctorId, department, date, timeSlot } = req.body;

  if (!patientId || !doctorId || !department || !date || !timeSlot) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!isDoctorAvailable(doctorId, timeSlot)) {
    return res.status(400).json({ error: 'Doctor not available at selected time.' });
  }

  const existing = await Appointment.findOne({ doctorId, date, timeSlot });
  if (existing) {
    return res.status(409).json({ error: 'Time slot already booked.' });
  }

  try {
    const appointment = new Appointment({ patientId, doctorId, department, date, timeSlot });
    await appointment.save();
    res.status(201).json({ message: 'Appointment confirmed', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Server error while saving appointment.' });
  }
};
