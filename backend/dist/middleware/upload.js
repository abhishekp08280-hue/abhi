"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const base = path_1.default.join(process.cwd(), 'uploads');
        let folder = 'materials';
        if (req.path.includes('resume'))
            folder = 'resumes';
        if (req.path.includes('certificates'))
            folder = 'certificates';
        const dest = path_1.default.join(base, folder);
        fs_1.default.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, unique + ext);
    },
});
function fileFilter(_req, file, cb) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype))
        return cb(new Error('Invalid file type'));
    cb(null, true);
}
exports.upload = (0, multer_1.default)({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
