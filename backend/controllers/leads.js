const Leads = require('../models/leads');

module.exports = {
    createLead: async (req, res) => {
        try {
            const lead = await Leads.create({
                email: req.email
            });
            return lead;
        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error: Unable to generate lead.'
            });
        }
    },
    getLeadId: async (req, res) => {
        try {
            const lead = await Leads.findOne({
                email: req.email
            });
            if(lead === null){
                return false;
            }
            return lead._id;
        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error: Unable to fetch lead ID.'
            });
        }
    }

}