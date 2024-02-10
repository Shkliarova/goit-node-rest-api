import { User } from "../schemas/usersSchema.js";
import { HttpError } from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import dotenv from "dotenv"

dotenv.config()

const { JWT_SECRET } = process.env;

export const register = async (req, res, next) => {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const result = await User.create({
            email,
            password: hashedPassword,
        })

        res.status(201).json({
            id: result._id,
            email,
            subscription: result.subscription,
        })
    } catch (error) {
        if(error.code === 11000){
            throw HttpError(409, 'Email in use');
        }
        throw error;
    }
}

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({email});

    if(!user){
        throw HttpError(401, "Email or password is wrong");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if(!isValidPassword){
        throw HttpError(401, "Email or password is wrong");
    }

    const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '24h'});

    res.status(200).json({
        token,
        user: {
            email,
            subscription: user.subscription,
          }
    });
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