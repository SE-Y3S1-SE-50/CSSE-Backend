const Schedule = require('../models/schedule.model');
const Staff = require('../models/staff.model');
const Department = require('../models/department.model');

// Get all schedules
const getAllSchedules = async (req, res) => {
    try {
        const { startDate, endDate, departmentId, staffId } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.shiftDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (departmentId) {
            query.departmentId = departmentId;
        }

        if (staffId) {
            query.staffId = staffId;
        }

        const schedules = await Schedule.find(query)
            .populate('staffId', 'firstName lastName role')
            .populate('departmentId', 'name')
            .populate('createdBy', 'userName')
            .sort({ shiftDate: 1, startTime: 1 });

        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ message: 'Error fetching schedules' });
    }
};

// Get schedule by date range
const getSchedulesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const schedules = await Schedule.find({
            shiftDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
        .populate('staffId', 'firstName lastName role')
        .populate('departmentId', 'name')
        .sort({ shiftDate: 1, startTime: 1 });

        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules by date range:', error);
        res.status(500).json({ message: 'Error fetching schedules by date range' });
    }
};

// Create new schedule
const createSchedule = async (req, res) => {
    try {
        const scheduleData = req.body;
        console.log('Received schedule data:', scheduleData);
        
        // Check for conflicts
        const conflict = await Schedule.findOne({
            staffId: scheduleData.staffId,
            shiftDate: scheduleData.shiftDate,
            $or: [
                {
                    startTime: { $lt: scheduleData.endTime },
                    endTime: { $gt: scheduleData.startTime }
                }
            ],
            status: { $ne: 'Cancelled' }
        });

        if (conflict) {
            return res.status(400).json({ 
                message: 'Staff member already has a conflicting shift at this time' 
            });
        }

        const schedule = new Schedule(scheduleData);
        await schedule.save();
        await schedule.populate('staffId', 'firstName lastName role');
        await schedule.populate('departmentId', 'name');
        await schedule.populate('createdBy', 'userName');

        res.status(201).json(schedule);
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ message: 'Error creating schedule' });
    }
};

// Update schedule
const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check for conflicts if updating time or staff
        if (updateData.staffId || updateData.startTime || updateData.endTime || updateData.shiftDate) {
            const existingSchedule = await Schedule.findById(id);
            const staffId = updateData.staffId || existingSchedule.staffId;
            const shiftDate = updateData.shiftDate || existingSchedule.shiftDate;
            const startTime = updateData.startTime || existingSchedule.startTime;
            const endTime = updateData.endTime || existingSchedule.endTime;

            const conflict = await Schedule.findOne({
                _id: { $ne: id },
                staffId: staffId,
                shiftDate: shiftDate,
                $or: [
                    {
                        startTime: { $lt: endTime },
                        endTime: { $gt: startTime }
                    }
                ],
                status: { $ne: 'Cancelled' }
            });

            if (conflict) {
                return res.status(400).json({ 
                    message: 'Staff member already has a conflicting shift at this time' 
                });
            }
        }

        updateData.updatedTimestamp = new Date();
        const schedule = await Schedule.findByIdAndUpdate(id, updateData, { new: true })
            .populate('staffId', 'firstName lastName role')
            .populate('departmentId', 'name')
            .populate('createdBy', 'userName');

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.status(200).json(schedule);
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ message: 'Error updating schedule' });
    }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByIdAndDelete(id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ message: 'Error deleting schedule' });
    }
};

// Get available staff for a specific time slot
const getAvailableStaff = async (req, res) => {
    try {
        const { date, startTime, endTime, departmentId } = req.query;
        
        // Find staff who are already scheduled during this time
        const scheduledStaff = await Schedule.find({
            shiftDate: new Date(date),
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ],
            status: { $ne: 'Cancelled' }
        }).select('staffId');

        const scheduledStaffIds = scheduledStaff.map(s => s.staffId);

        // Find available staff
        let query = { isActive: true };
        if (departmentId) {
            query.department = departmentId;
        }
        if (scheduledStaffIds.length > 0) {
            query._id = { $nin: scheduledStaffIds };
        }

        const availableStaff = await Staff.find(query)
            .populate('department', 'name')
            .sort({ firstName: 1 });

        res.status(200).json(availableStaff);
    } catch (error) {
        console.error('Error fetching available staff:', error);
        res.status(500).json({ message: 'Error fetching available staff' });
    }
};

module.exports = {
    getAllSchedules,
    getSchedulesByDateRange,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getAvailableStaff
};
