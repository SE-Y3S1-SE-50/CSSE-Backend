const User = require('../models/users.model');
const Doctor = require('../models/doctor.model');

const getDoctorDetailsById = async (id) => {
  try {
    const cleanId = id.replace(/^:/, '').trim();
    const user = await User.findById(cleanId);
    
    if (!user) {
      console.error("User not found");
      return null;
    }

    if (user.role !== 'Doctor') {
      console.error("User is not a doctor");
      return null;
    }

    const doctor = await Doctor.findById(user.entityId);

    return [doctor, user];
  } catch (err) {
    console.error("Error fetching doctor by ID:", err);
    return null;
  }
};

const httpGetDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctorDetails = await getDoctorDetailsById(doctorId);
    
    if (!doctorDetails) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    return res.status(200).json(doctorDetails);
  } catch (err) {
    console.error("Error in getting doctor details", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  httpGetDoctorById
};