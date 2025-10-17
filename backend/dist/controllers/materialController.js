"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMaterialMeta = uploadMaterialMeta;
exports.listMaterials = listMaterials;
const StudyMaterial_1 = require("../models/StudyMaterial");
async function uploadMaterialMeta(req, res) {
    if (!req.user)
        return res.status(401).json({ message: 'Unauthorized' });
    const { title, subject, classGrade, fileUrl, linkUrl } = req.body;
    const doc = await StudyMaterial_1.StudyMaterial.create({
        uploaderId: req.user.sub,
        title,
        subject,
        classGrade,
        fileUrl,
        linkUrl,
    });
    res.status(201).json(doc);
}
async function listMaterials(req, res) {
    const { q, subject, classGrade } = req.query;
    const filter = {};
    if (q)
        filter.$text = { $search: q };
    if (subject)
        filter.subject = subject;
    if (classGrade)
        filter.classGrade = classGrade;
    const docs = await StudyMaterial_1.StudyMaterial.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(docs);
}
