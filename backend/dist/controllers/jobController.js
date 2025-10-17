"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.searchJobs = searchJobs;
exports.applyJob = applyJob;
exports.getInstitutionJobs = getInstitutionJobs;
exports.getJobApplications = getJobApplications;
const Job_1 = require("../models/Job");
const Application_1 = require("../models/Application");
const User_1 = require("../models/User");
const notifyService_1 = require("../services/notifyService");
async function createJob(req, res) {
    if (!req.user || req.user.role !== 'institution')
        return res.status(403).json({ message: 'Forbidden' });
    const { title, description, qualifications, city, salary, tags } = req.body;
    const job = await Job_1.Job.create({ employerId: req.user.sub, title, description, qualifications, city, salary, tags });
    res.status(201).json(job);
}
async function searchJobs(req, res) {
    const { q, city, tag } = req.query;
    const filter = {};
    if (q)
        filter.$text = { $search: q };
    if (city)
        filter.city = city;
    if (tag)
        filter.tags = tag;
    const jobs = await Job_1.Job.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(jobs);
}
async function applyJob(req, res) {
    if (!req.user || req.user.role !== 'teacher')
        return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { coverLetter } = req.body;
    const application = await Application_1.Application.create({ jobId: id, teacherId: req.user.sub, coverLetter, status: 'applied' });
    const job = await Job_1.Job.findById(id);
    if (job) {
        const institution = await User_1.User.findById(job.employerId);
        if (institution) {
            await (0, notifyService_1.sendMailOnApply)(institution.email, req.user.sub, job.title);
        }
    }
    res.status(201).json(application);
}
async function getInstitutionJobs(req, res) {
    if (!req.user || req.user.role !== 'institution')
        return res.status(403).json({ message: 'Forbidden' });
    const jobs = await Job_1.Job.find({ employerId: req.user.sub }).sort({ createdAt: -1 });
    res.json(jobs);
}
async function getJobApplications(req, res) {
    if (!req.user || req.user.role !== 'institution')
        return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const apps = await Application_1.Application.find({ jobId: id }).sort({ appliedAt: -1 });
    res.json(apps);
}
