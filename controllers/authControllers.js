import { User } from "../schemas/usersSchema.js";
import { HttpError } from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import gravatar from "gravatar";

dotenv.config()

const { JWT_SECRET } = process.env;

export const register = async (req, res, next) => {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const avURL = gravatar.url(email);

    try {
        const result = await User.create({
            email,
            password: hashedPassword,
        })

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
        //was a crash using existing email
        //pass error to the next middleware
        next(error);
    }
}

export const login = async (req, res, next) => {
    //add try/catch blocks
    // in catch block pass error to the next middleware
    const { email, password } = req.body;

    try {
        const user = await User.findOne({email});

        if(!user){
            next(HttpError(401, "Email or password is wrong"));
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if(!isValidPassword){
            next(HttpError(401, "Email or password is wrong"));
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