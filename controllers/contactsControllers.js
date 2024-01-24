import { HttpError } from '../helpers/HttpError.js';
import {listContacts, getContactById, removeContact, addContact, updateContactService} from '../services/contactsServices.js';
import { createContactSchema, updateContactSchema } from '../schemas/contactsSchemas.js';

export const getAllContacts = async (req, res, next) => {
    try {
        const result = await listContacts();
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await getContactById(id);
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
      const result = await removeContact(id);
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
      const { name, email, phone } = req.body;
      const validationResult = createContactSchema.validate({ name, email, phone });
      
      if (validationResult.error) {
        throw HttpError(400, validationResult.error.message);
      }
  
      const result = await addContact( {name, email, phone} );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  export const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (!Object.keys(data).length) {
            throw HttpError(400, 'Body must have at least one field');
        }

        const validationResult = updateContactSchema.validate(data);

        if (validationResult.error) {
            throw HttpError(400, validationResult.error.message);
        }

        const result = await updateContactService(id, data);

        if (result.status === 404) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};