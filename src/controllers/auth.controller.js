
const  User = require('../models/users.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {registerDoctor,
  getAllUsers,
  updateDoctor,
  registerPatient,
  updatePatient} = require('../models/auth.model')


const httpUpdateDoctor = async (req, res) => {
    try {
        const doctorId = req.body.doctorId
        const data = req.body;
        const updatedDoctor = await updateDoctor(doctorId, data);
        res.status(200).json(updatedDoctor);
    } catch (err) {
        console.log("Error in updating doctor", err);
        return res.status(500).json({message: err})
    }
}


const httpRegisterDoctor = async (req, res) => {
    try {
        await registerDoctor(req.body)

        res.status(201).json({message: 'Doctor created successfully'})
    } catch (err) {
        console.log("Error in creating doctor", err);
        return res.status(500).json({message: err})
    }
}

const httpUpdatePatient = async (req, res) => {
    try {
        const patientId = req.body.patientId
        const data = req.body;
        const updatedPatient = await updatePatient(patientId, data);
        res.status(200).json(updatedPatient);
    } catch (err) {
        console.log("Error in updating patient", err);
        return res.status(500).json({message: err})
    }
}


const httpRegisterPatient = async (req, res) => {
    try {
        await registerPatient(req.body)

        res.status(201).json({message: 'Patient created successfully'})
    } catch (err) {
        console.log("Error in creating patient", err);
        return res.status(500).json({message: err})
    }
}

const httpGetAllUsers = async (req, res) => {
    try {
        const users = await getAllUsers()
        res.status(200).json(users)
    } catch (err) {
        console.log("Error in getting all users", err);
        return res.status(500).json({message: err})
    }
}





const register = async (req, res) => {
    
    try {const {username, password, role} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User({
            username,
            password: hashedPassword,
            role
        })
        await newUser.save();
        return res.status(201).json({message: 'User created successfully'})
    } catch(err) {
        return res.status(500).json({message: err})
    }
}

const login = async (req, res) => {
    try {const {username, password} = req.body;

        const user = await User.findOne({username});

        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({message: 'Invalid credentials'})
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role

        }, process.env.JWT_SECRET , {expiresIn: '1h'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000 
        })

        return res.status(200).json({ "Message" :"Login successful",  "role": user.role})
    } catch(err) {
        console.log(err)
        return res.status(500).json({message: err})
        
    }

}

module.exports = {
    register,
    login, 
    httpRegisterDoctor,
    httpRegisterPatient,
    httpGetAllUsers,
    httpUpdatePatient,
    httpUpdateDoctor
}