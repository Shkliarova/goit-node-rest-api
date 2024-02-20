import { HttpError } from '../helpers/HttpError.js';
import { Contact } from '../schemas/contactSchema.js';

export const getAllContacts = async (req, res, next) => {
    try {
      const {_id} = req.user;
      const result = await Contact.find({owner: _id});
      res.status(200).json(result);
      } catch (error) {
        next(error);
      }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {_id} = req.user;
        const result = await Contact.findOne({_id: id, owner: _id});
        if (!result) {
          throw HttpError(404, 'Contact not found');
        }
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
};

export const deleteContact = async (req, res, next) => {
    try {
      const { id } = req.params;
      const {_id} = req.user;
      const result = await Contact.findOneAndDelete({
        _id: id,
        owner: _id,
      });
      if (!result) {
        throw HttpError(404, 'Contact not found');
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

export const createContact = async (req, res, next) => {
  try {
    const {_id} = req.user;
    const result = await Contact.create({...req.body, owner: _id});

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {_id} = req.user;

    const result = await Contact.findOneAndUpdate({_id: id, owner: _id}, req.body, { new: true });

    if (!result) {
        throw HttpError(404, 'Not found');
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {_id} = req.user;

    const result = await Contact.findOneAndUpdate({_id: id, owner: _id}, req.body, { new: true });

    if (!result) {
      throw HttpError(404, 'Not found');
    }

      res.status(200).json(result);
  } catch (error) {
    next(error)
  }
}