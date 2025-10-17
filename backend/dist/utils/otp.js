"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.hashOtp = hashOtp;
exports.verifyOtp = verifyOtp;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
function generateOtp(length = 6) {
    const code = crypto_1.default.randomInt(0, 10 ** length).toString().padStart(length, '0');
    return code;
}
async function hashOtp(otp) {
    const saltRounds = 10;
    return bcrypt_1.default.hash(otp, saltRounds);
}
async function verifyOtp(otp, hash) {
    return bcrypt_1.default.compare(otp, hash);
}
