import bcrypt from "bcryptjs";
import User from "./users.model";
import Doctor from './doctor.model';
import Patient from './patient.model';

const createDoctor = async (doctorData: any) => {
  try {
    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();
    return newDoctor._id;
  } catch (err: any) {
    throw new Error(`Failed to create doctor: ${err.message}`);
  }
};

const createPatient = async (patientData: any) => {
  try {
    const newPatient = new Patient(patientData);
    await newPatient.save();
    return newPatient._id;
  } catch (err: any) {
    throw new Error(`Failed to create patient: ${err.message}`);
  }
};

export const registerDoctor = async (data: any) => {
  try {
    console.log("Register Doctor - Received data:", data);
    
    // ✅ Validate userName exists
    if (!data.userName) {
      throw new Error("userName is required");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const doctorId = await createDoctor({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      gender: data.gender
    });

    console.log("Doctor created with ID:", doctorId);

    const newUser = new User({
      userName: data.userName,  // ✅ Make sure this is not undefined
      password: hashedPassword,
      entityId: doctorId,
      role: "Doctor",
    });

    console.log("Creating user with userName:", newUser.userName);

    await newUser.save();
    return "User created successfully";
  } catch (err: any) {
    console.log("Error in creating doctor", err);
    throw err;
  }
};

export const registerPatient = async (data: any) => {
  try {
    console.log("Register Patient - Received data:", data);
    
    // ✅ Validate userName exists
    if (!data.userName) {
      throw new Error("userName is required");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const patientId = await createPatient({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      gender: data.gender
    });

    console.log("Patient created with ID:", patientId);

    const newUser = new User({
      userName: data.userName,  // ✅ Make sure this is not undefined
      password: hashedPassword,
      entityId: patientId,
      role: "Patient",
    });

    console.log("Creating user with userName:", newUser.userName);

    await newUser.save();
    return "User created successfully";
  } catch (err: any) {
    console.log("Error in creating patient", err);
    throw err;
  }
};

export const getAllUsers = async () => {
  const users = await User.find({}).sort({ createdTimestamp: -1 }).lean();

  const populatedUsers = await Promise.all(
    users.map(async (user: any) => {
      const role = user.role;
      const userId = user.entityId;

      let details = null;

      try {
        if (role === 'Doctor') {
          details = await Doctor.findById(userId)
            .select('firstName lastName email phoneNumber gender createdTimestamp')
            .lean();
        } else if (role === 'Patient') {
          details = await Patient.findById(userId)
            .select('firstName lastName email phoneNumber gender createdTimestamp')
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

export const updateDoctor = async (doctorId: string, updatedData: any) => {
  try {
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser) {
      throw new Error("User not found");
    }

    const actualDoctorId = doctorUser.entityId;
    const doctor = await Doctor.findById(actualDoctorId);

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    if (updatedData.firstName) doctor.firstName = updatedData.firstName;
    if (updatedData.lastName) doctor.lastName = updatedData.lastName;
    if (updatedData.email) doctor.email = updatedData.email;
    if (updatedData.phoneNumber) doctor.phoneNumber = updatedData.phoneNumber;
    if (updatedData.gender) doctor.gender = updatedData.gender;

    await doctor.save();

    const user = await User.findOne({ entityId: actualDoctorId, role: "Doctor" });
    if (!user) {
      throw new Error("User record for doctor not found");
    }

    if (updatedData.userName) user.userName = updatedData.userName;
    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    return "Doctor updated successfully";
  } catch (err: any) {
    console.error("Error updating doctor:", err);
    throw err;
  }
};

export const updatePatient = async (patientId: string, updatedData: any) => {
  try {
    const patientUser = await User.findById(patientId);
    if (!patientUser) {
      throw new Error("User not found");
    }

    const actualPatientId = patientUser.entityId;
    const patient = await Patient.findById(actualPatientId);

    if (!patient) {
      throw new Error("Patient not found");
    }

    if (updatedData.firstName) patient.firstName = updatedData.firstName;
    if (updatedData.lastName) patient.lastName = updatedData.lastName;
    if (updatedData.email) patient.email = updatedData.email;
    if (updatedData.phoneNumber) patient.phoneNumber = updatedData.phoneNumber;
    if (updatedData.gender) patient.gender = updatedData.gender;

    await patient.save();

    const user = await User.findOne({ entityId: actualPatientId, role: "Patient" });
    if (!user) {
      throw new Error("User record for patient not found");
    }

    if (updatedData.userName) user.userName = updatedData.userName;
    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    return "Patient updated successfully";
  } catch (err: any) {
    console.error("Error updating patient:", err);
    throw err;
  }
};
