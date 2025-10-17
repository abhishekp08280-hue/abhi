"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
const Session_1 = require("../models/Session");
function buildJitsiLink(title) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const room = `TeacherPortal-${slug}-${Date.now()}`;
    return `https://meet.jit.si/${room}`;
}
async function createSession(req, res) {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    const { title, description, startTime, duration } = req.body;
    const meetingLink = buildJitsiLink(title);
    const doc = await Session_1.Session.create({
        hostId: req.user.sub,
        title,
        description,
        startTime,
        duration,
        meetingLink,
        provider: 'Jitsi',
    });
    res.status(201).json(doc);
}
async function getSession(req, res) {
    const { id } = req.params;
    const doc = await Session_1.Session.findById(id);
    if (!doc)
        return res.status(404).json({ message: 'Not found' });
    res.json(doc);
}
