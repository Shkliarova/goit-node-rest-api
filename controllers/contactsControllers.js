import { HttpError } from '../helpers/HttpError.js';
import { Contact } from '../schemas/contactSchema.js';
import { createContactSchema, updateContactSchema, favoriteSchema } from '../schemas/contactValidationSchema.js';

export const getAllContacts = async (req, res, next) => {
    try {
        const result = await Contact.find();
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await Contact.findById(id);
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
      const result = await Contact.findByIdAndDelete(id);
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
    const validationResult = createContactSchema.validate(req.body);

    if (validationResult.error) {
      throw HttpError(400, validationResult.error.message);
    }

    const result = await Contact.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const validationResult = updateContactSchema.validate(req.body);

    if (validationResult.error) {
      throw HttpError(400, validationResult.error.message);
    }

    const result = await Contact.findByIdAndUpdate(id, req.body, { returnDocument: "after" });

    if (result.status === 404) {
        throw HttpError(404, 'Not found');
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  try {
    const { id } = req.params

    const validationResult = favoriteSchema.validate(req.body);

    if (validationResult.error) {
      throw HttpError(400, validationResult.error.message);
    }

      const result = await Contact.findByIdAndUpdate(id, req.body, { returnDocument: "after" })

      if (result.status === 404) {
        throw HttpError(404, 'Not found');
      }

      res.status(200).json(result);
  } catch (error) {
    next(error)
  }
}