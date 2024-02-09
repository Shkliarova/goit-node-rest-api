import { HttpError } from "../../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import { User } from "../../schemas/usersSchema.js";

const { JWT_SECRET } = process.env;

export const authMiddleware = async (req, res, next) => {
    const {authorization = ''} = req.headers;

    const [type, token] = authorization.split(' ');

    if(type !== "Bearer"){
        throw HttpError(401, "Not authorized");
    }

    if(!token){
        throw HttpError(401, "Not authorized");
    }

    try {
        const {id} = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(id);
        req.user = user;
    } catch (error) {
        if(error.name === "TokenExpiredError" || error.name === "JsonWebTokenError"){
            throw HttpError(401, "Not authorized");
        }
        throw error;
    }
    next();
}