const { HttpError } = require('../helpers/HttpError.js');
const contactsService = require('../services/contactsServices.js');
const { createContactSchema, updateContactSchema } = require('../schemas/contactsSchemas.js');

const getAllContacts = async (req, res, next) => {
    try {
        const result = await contactsService.listContacts();
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
};

const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await contactsService.getContactById(id);
        if (!result) {
          throw new HttpError(404, 'Contact not found');
        }
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
};

const deleteContact = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await contactsService.removeContact(id);
      if (!result) {
        throw new HttpError(404, 'Contact not found');
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

const createContact = async (req, res, next) => {
    try {
      const { name, email, phone } = req.body;
      const validationResult = createContactSchema.validate({ name, email, phone });
      
      if (validationResult.error) {
        throw new HttpError(400, validationResult.error.message);
      }
  
      const result = await contactsService.addContact({ name, email, phone });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  const updateContact = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
  
      if (!name && !email && !phone) {
        throw new HttpError(400, 'Body must have at least one field');
      }
  
      const validationResult = updateContactSchema.validate({ name, email, phone });
  
      if (validationResult.error) {
        throw new HttpError(400, validationResult.error.message);
      }
  
      const existingContact = await contactsService.getContactById(id);
  
      if (!existingContact) {
        throw new HttpError(404, 'Contact not found');
      }
  
      const updatedContact = {
        id,
        name: name || existingContact.name,
        email: email || existingContact.email,
        phone: phone || existingContact.phone,
      };
  
      const result = await contactsService.updateContact(updatedContact);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = {
    getAllContacts,
    getOneContact,
    deleteContact,
    createContact,
    updateContact,
  };
