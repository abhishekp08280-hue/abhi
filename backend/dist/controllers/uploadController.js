"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = uploadResume;
exports.uploadCertificate = uploadCertificate;
exports.uploadMaterial = uploadMaterial;
const path_1 = __importDefault(require("path"));
function uploadResume(req, res) {
    const file = req.file;
    if (!file)
        return res.status(400).json({ message: 'File is required' });
    const url = `/uploads/resumes/${path_1.default.basename(file.path)}`;
    res.json({ url });
}
function uploadCertificate(req, res) {
    const file = req.file;
    if (!file)
        return res.status(400).json({ message: 'File is required' });
    const url = `/uploads/certificates/${path_1.default.basename(file.path)}`;
    res.json({ url });
}
function uploadMaterial(req, res) {
    const file = req.file;
    if (!file)
        return res.status(400).json({ message: 'File is required' });
    const url = `/uploads/materials/${path_1.default.basename(file.path)}`;
    res.json({ url });
}
