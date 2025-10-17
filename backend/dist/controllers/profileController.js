"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherMe = getTeacherMe;
exports.updateTeacherMe = updateTeacherMe;
exports.getInstitutionMe = getInstitutionMe;
exports.updateInstitutionMe = updateInstitutionMe;
const TeacherProfile_1 = require("../models/TeacherProfile");
const InstitutionProfile_1 = require("../models/InstitutionProfile");
async function getTeacherMe(req, res) {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== 'teacher')
        return res.status(403).json({ message: 'Forbidden' });
    const profile = await TeacherProfile_1.TeacherProfile.findOne({ userId: req.user.sub });
    res.json(profile || {});
}
async function updateTeacherMe(req, res) {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== 'teacher')
        return res.status(403).json({ message: 'Forbidden' });
    const { name, phone, city, qualification } = req.body;
    const profile = await TeacherProfile_1.TeacherProfile.findOneAndUpdate({ userId: req.user.sub }, { $set: { name, phone, city, qualification } }, { upsert: true, new: true });
    res.json(profile);
}
async function getInstitutionMe(req, res) {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== 'institution')
        return res.status(403).json({ message: 'Forbidden' });
    const profile = await InstitutionProfile_1.InstitutionProfile.findOne({ userId: req.user.sub });
    res.json(profile || {});
}
async function updateInstitutionMe(req, res) {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== 'institution')
        return res.status(403).json({ message: 'Forbidden' });
    const { org_name, contact_person, city, contact_info, description } = req.body;
    const profile = await InstitutionProfile_1.InstitutionProfile.findOneAndUpdate({ userId: req.user.sub }, { $set: { org_name, contact_person, city, contact_info, description } }, { upsert: true, new: true });
    res.json(profile);
}
