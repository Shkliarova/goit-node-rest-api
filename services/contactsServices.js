import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const contactsPath = join(__dirname, '../db/contacts.json');

export async function listContacts() {
    const data = await fs.readFile(contactsPath);
    return JSON.parse(data);
  }
  
export async function getContactById(contactId) {
    const contacts = await listContacts();
    const result = contacts.find(item => item.id === contactId);
    return result || null;
  }
  
export  async function removeContact(contactId) {
    const contacts = await listContacts();
    const index = contacts.findIndex(item => item.id === contactId);
    if (index === -1){
        return null;
    } 
    const [result] = contacts.splice(index, 1);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2))
    return result;
  }
  
export async function addContact({name, email, phone}) {
    const contacts = await listContacts();
    const newContact = {
        id: nanoid(),
        name,
        email,
        phone
    }
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
  }

  export const updateContactService = async (contactId, data) => {
      const contacts = await listContacts();
      const index = contacts.findIndex((contact) => contact.id === contactId);

        if (index === -1) {
            return { status: 404, message: 'Not found' };
        }

        const updatedContact = {
            id: contactId,
            name: data.name || contacts[index].name,
            email: data.email || contacts[index].email,
            phone: data.phone || contacts[index].phone,
        };

    contacts[index] = updatedContact;
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return contacts[index];
  };