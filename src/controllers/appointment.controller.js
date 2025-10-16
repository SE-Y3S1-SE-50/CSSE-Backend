const Appointment = require('../models/appointment.model');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, department, date, timeSlot, patientDetails } = req.body;

    // Validation
    if (!patientId || !doctorId || !department || !date || !timeSlot) {
      return res.status(400).json({ error: 'All appointment fields are required.' });
    }

    if (!patientDetails || !patientDetails.fullName || !patientDetails.email || !patientDetails.phone) {
      return res.status(400).json({ error: 'Patient details (name, email, phone) are required.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientDetails.email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Check if time slot is already booked
    const existing = await Appointment.findOne({ 
      doctorId, 
      date: new Date(date), 
      timeSlot 
    });
    
    if (existing) {
      return res.status(409).json({ error: 'This time slot is already booked. Please select another time.' });
    }

    // Create new appointment
    const appointment = new Appointment({ 
      patientId, 
      doctorId, 
      department, 
      date: new Date(date), 
      timeSlot,
      patientDetails
    });
    
    await appointment.save();

    res.status(201).json({ 
      message: 'Appointment confirmed successfully!', 
      appointment 
    });
    
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Server error while saving appointment. Please try again.' });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, timeSlot: 1 });
    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error while fetching appointments.' });
  }
};

// Get appointments by patient email
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const { email } = req.params;
    const appointments = await Appointment.find({ 
      'patientDetails.email': email 
    }).sort({ date: 1, timeSlot: 1 });
    
    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error while fetching appointments.' });
  }
};

// Get appointments by doctor
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId }).sort({ date: 1, timeSlot: 1 });
    res.status(200).json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error while fetching appointments.' });
  }
};
