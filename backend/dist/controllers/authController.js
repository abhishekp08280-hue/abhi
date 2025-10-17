"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.verifyOtp = verifyOtp;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dayjs_1 = __importDefault(require("dayjs"));
const User_1 = require("../models/User");
const Otp_1 = require("../models/Otp");
const RefreshToken_1 = require("../models/RefreshToken");
const otp_1 = require("../utils/otp");
const mailService_1 = require("../services/mailService");
const jwt_1 = require("../utils/jwt");
const OTP_TTL_MINUTES = 10;
async function register(req, res) {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role)
            return res.status(400).json({ message: 'email, password, role required' });
        const existing = await User_1.User.findOne({ email });
        if (existing)
            return res.status(409).json({ message: 'User already exists' });
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await User_1.User.create({ email, passwordHash, role, isVerified: false });
        const otp = (0, otp_1.generateOtp)();
        const otpHash = await (0, otp_1.hashOtp)(otp);
        await Otp_1.Otp.create({
            userId: user._id,
            otpHash,
            purpose: 'register',
            expiresAt: (0, dayjs_1.default)().add(OTP_TTL_MINUTES, 'minute').toDate(),
            used: false,
        });
        await (0, mailService_1.sendOtpEmail)(email, otp);
        res.status(201).json({ message: 'User created. OTP sent to email.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
async function verifyOtp(req, res) {
    try {
        const { email, otp } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const record = await Otp_1.Otp.findOne({ userId: user._id, purpose: 'register', used: false }).sort({ createdAt: -1 });
        if (!record)
            return res.status(400).json({ message: 'OTP not found' });
        if (record.expiresAt.getTime() < Date.now())
            return res.status(400).json({ message: 'OTP expired' });
        const ok = await (0, otp_1.verifyOtp)(otp, record.otpHash);
        if (!ok)
            return res.status(400).json({ message: 'Invalid OTP' });
        record.used = true;
        await record.save();
        user.isVerified = true;
        await user.save();
        res.json({ message: 'Email verified. You can now login.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        if (!user.isVerified)
            return res.status(401).json({ message: 'Email not verified' });
        const ok = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(401).json({ message: 'Invalid credentials' });
        const payload = { sub: String(user._id), role: user.role };
        const accessToken = (0, jwt_1.signAccessToken)(payload, '15m');
        const refreshToken = (0, jwt_1.signRefreshToken)(payload, process.env.REFRESH_TTL || '7d');
        const tokenHash = await bcrypt_1.default.hash(refreshToken, 10);
        const ttlDays = (process.env.REFRESH_TTL || '7d');
        const expiresAt = (0, dayjs_1.default)().add(7, 'day').toDate();
        await RefreshToken_1.RefreshToken.create({ userId: user._id, tokenHash, expiresAt, revoked: false });
        res.json({ accessToken, refreshToken });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
async function refresh(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: 'refreshToken required' });
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const records = await RefreshToken_1.RefreshToken.find({ userId: payload.sub, revoked: false });
        const ok = await Promise.all(records.map(r => bcrypt_1.default.compare(refreshToken, r.tokenHash)));
        if (!ok.some(Boolean))
            return res.status(401).json({ message: 'Refresh token not recognized' });
        const accessToken = (0, jwt_1.signAccessToken)({ sub: payload.sub, role: payload.role }, '15m');
        res.json({ accessToken });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
async function logout(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: 'refreshToken required' });
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const records = await RefreshToken_1.RefreshToken.find({ userId: payload.sub, revoked: false });
        for (const r of records) {
            const match = await bcrypt_1.default.compare(refreshToken, r.tokenHash);
            if (match) {
                r.revoked = true;
                await r.save();
            }
        }
        res.json({ message: 'Logged out' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
