import express from 'express';
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} from '../controllers/contactsControllers.js';
import { isValidId } from '../helpers/isValidId.js';
import { validateBody } from '../helpers/validateBody.js'
import { createContactSchema, updateContactSchema, favoriteSchema } from '../schemas/contactValidationSchema.js';
import { authMiddleware } from '../controllers/middlewares/authMiddleware.js';

export const contactsRouter = express.Router();

contactsRouter.get("/", authMiddleware, getAllContacts);

contactsRouter.get("/:id", authMiddleware, isValidId, getOneContact);

contactsRouter.delete("/:id", authMiddleware, isValidId, deleteContact);

contactsRouter.post("/", authMiddleware, validateBody(createContactSchema), createContact);

contactsRouter.put("/:id", authMiddleware, isValidId, validateBody(updateContactSchema), updateContact);

contactsRouter.patch("/:id/favorite", authMiddleware, isValidId, validateBody(favoriteSchema), updateStatusContact)
