import { User } from "../schemas/usersSchema.js";
import { HttpError } from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import gravatar from "gravatar";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

dotenv.config()

const { JWT_SECRET, MAILER_PASS, LOCAL_HOST } = process.env;

const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const config = {
            host: 'smtp.meta.ua',
            port: 465,
            secure: true,
            auth: {
                user: "aeilssia@meta.ua",
                pass: MAILER_PASS
            }
        }

        const transporter = nodemailer.createTransport(config);
    
        const verificationLink = `${LOCAL_HOST}/api/auth/verify/${verificationToken}`;

        const mailOptions = {
            from: "aeilssia@meta.ua",
            to: email,
            subject: 'Email Verification',
            text: `Please verify your email: ${verificationLink}`,
            html: `<p>Please verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`
        }
    
        await transporter.sendMail(mailOptions);
    
    } catch (error) {
        console.error('Verification email does not sent:', error);
    }
};

export const register = async (req, res, next) => {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const avURL = gravatar.url(email);

    try {
        const result = await User.create({
            email,
            password: hashedPassword,
            verificationToken: uuidv4(),
        })

        await sendVerificationEmail(email, result.verificationToken);

        res.status(201).json({
            id: result._id,
            email,
            subscription: result.subscription,
            avatarURL: avURL,
        })
    } catch (error) {
        if(error.code === 11000){
            next(HttpError(409, 'Email in use'));
        }
        next(error);
    }
}

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({email});

        if(!user){
            return next(HttpError(401, "Email or password is wrong"));
        }

        if (!user.verify) {
            return next(HttpError(401, "Email not verified"));
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if(!isValidPassword){
            return next(HttpError(401, "Email or password is wrong"));
        }

        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '24h'});

        res.status(200).json({
            token,
            user: {
                email,
                subscription: user.subscription,
            }
        });
    } catch (error) {
        next(error);
    }
}

export const logout = async (req, res) => {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ''}, { new: true });
    res.status(204).json({
        message: "Logout success",
    })
}

export const getCurrent = async (req, res) => {
    const {email, subscription} = req.user;

    res.status(200).json({
        email,
        subscription,
    })
}

export const verifyEmail = async (req, res, next) => {
    const { verificationToken } = req.params;

    try {
        const user = await User.findOne({ verificationToken });

        if (!user) {
            return next(HttpError(404, 'User not found'));
        }

        user.verify = true;
        user.verificationToken = "";
        await user.save();

        res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
        next(error);
    }
}

export const resendVerificationEmail = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Missing required field email' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(HttpError(404, 'User not found'));
        }

        if (user.verify) {
            return res.status(400).json({ message: 'Verification has already been passed' });
        }

        await sendVerificationEmail(email, user.verificationToken);

        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        next(error);
    }
};