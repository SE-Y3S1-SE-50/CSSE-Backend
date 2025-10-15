

const bcrypt = require("bcryptjs");

const User = require("./users.model");
const Doctor = require('./doctor.model')

const createDoctor = async (doctorData) => {
  try {
    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();
    return newDoctor._id;
  } catch (err) {
    throw new Error(`Failed to create doctor: ${err.message}`);
  }
};

const createPatient = async (patientData) => {
  try {
    const newPatient = new Doctor(patientData);
    await newPatient.save();
    return newPatient._id;
  } catch (err) {
    throw new Error(`Failed to create patient: ${err.message}`);
  }
};

const registerDoctor = async (data) => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const doctorId = await createDoctor({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender
    })

    const newUser = new User({
      userName: data.userName,
      password: hashedPassword,
      entityId: doctorId,
      role: "Doctor",
    });

    await newUser.save();
    return "User created successfully";
  } catch (err) {
    console.log("Error in creating doctor", err);
    return "Error in creating doctor user";
  }
};

const registerPatient = async (data) => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const patientId = await createPatient({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender
    })

    const newUser = new User({
      userName: data.userName,
      password: hashedPassword,
      entityId: patientId,
      role: "Patient",
    });

    await newUser.save();
    return "User created successfully";
  } catch (err) {
    console.log("Error in creating patient", err);
    return "Error in creating patient user";
  }
};


const getAllUsers = async () => {
  const users = await User.find({}).sort({ createdTimestamp: -1 }).lean();

  const populatedUsers = await Promise.all(
    users.map(async (user) => {
      const role = user.role;      
      const userId = user.entityId

      let details = null;
  
      try {
        if (role === 'Doctor') {
          details = await Doctor.findById(userId)
            .select('userName firstName lastName email phoneNumber gender entityId role createdTimestamp')
            .lean();
        } else if (role === 'Patient') {
          details = await Patient.findById(userId)
            .select('userName firstName lastName email phoneNumber gender entityId role createdTimestamp')
            .lean();
        } 
      } catch (err) {
        console.error(`Error populating user ${user._id}:`, err);
      }

      return {
        ...user,
        userDetails: details || null,
      };
    })
  );

  return populatedUsers;
};



const updateDoctor = async (doctorId, updatedData) => {
  try {
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser) {
      return "User not found";
    }
  
    
    doctorId = doctorUser.entityId;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return "Doctor not found";
    }

    
    if (updatedData.firstName) doctor.firstName = updatedData.firstName;
    if (updatedData.lastName) doctor.lastName = updatedData.lastName;
    if (updatedData.email) doctor.email = updatedData.email;
    if (updatedData.phoneNumber) doctor.phoneNumber = updatedData.phoneNumber;
    if (updatedData.gender) doctor.gender = updatedData.gender;

    await doctor.save();

    
    const user = await User.findOne({ entityId: doctorId, role: "Doctor" });
    if (!user) {
      return "User record for doctor not found";
    }

    if (updatedData.userName) user.userName = updatedData.userName;
    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    
    return "Doctor updated successfully";
  } catch (err) {
    console.error("Error updating doctor:", err);
    return "Error updating doctor";
  }
};
  

const updatePatient = async (patientId, updatedData) => {
  try {
    const patientUser = await User.findById(patientId);
    if (!patientUser) {
      return "User not found";
    }
  
    
    patientId = patientUser.entityId;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return "Patient not found";
    }

    
    if (updatedData.firstName) patient.firstName = updatedData.firstName;
    if (updatedData.lastName) patient.lastName = updatedData.lastName;
    if (updatedData.email) patient.email = updatedData.email;
    if (updatedData.phoneNumber) patient.phoneNumber = updatedData.phoneNumber;
    if (updatedData.gender) patient.gender = updatedData.gender;

    await patient.save();

    
    const user = await User.findOne({ entityId: patientId, role: "Patient" });
    if (!user) {
      return "User record for patient not found";
    }

    if (updatedData.userName) user.userName = updatedData.userName;
    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    
    return "Patient updated successfully";
  } catch (err) {
    console.error("Error updating patient:", err);
    return "Error updating patient";
  }
};


module.exports = {

  registerDoctor,

  getAllUsers,
  updateDoctor,
  registerPatient,
  updatePatient

};
