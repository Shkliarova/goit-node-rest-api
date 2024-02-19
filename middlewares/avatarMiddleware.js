import multer from 'multer';
import jimp from 'jimp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { User } from '../schemas/usersSchema.js';
import { HttpError } from '../helpers/HttpError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: join('tmp'),
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

export const upload = multer({ storage: storage });

export const updateAvatar = async (req, res, next) => {
    try {
        const { user, file } = req;
        
        const image = await jimp.read(file.path);
        const avatarFileName = `${user._id}.jpg`;
        const avatarPath = join(__dirname, '..', 'public', 'avatars', avatarFileName);
    
        await image.resize(250, 250).write(avatarPath);
    
        const updatedUser = await User.findByIdAndUpdate(user._id, { avatarURL: `/avatars/${avatarFileName}` }, {new: true});

        if (!updatedUser) {
            throw HttpError(404, "User not found or failed to update");
          }
    
        res.status(200).json({ avatarURL: `/avatars/${avatarFileName}` });
      } catch (error) {
        next(error);
      }
};