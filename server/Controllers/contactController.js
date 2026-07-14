import { contactSchema } from '../validator/contactValidation.js'
import Contact from '../Models/Contact.js'

export const submitContactForm = async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body)

    if (!parsed.success) {
      const errors = {}
      parsed.error.errors.forEach(err => {
        errors[err.path[0]] = err.message
      })
      return res.status(400).json({ errors })
    }

    await Contact.create(parsed.data)
    res.status(200).json({ message: 'Your message has been received.' })
  } catch (error) {
    next(error)
  }
}


export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 })
    res.status(200).json(contacts)
  } catch (error) {
    next(error)
  }
}


export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id)
    if (!contact) return res.status(404).json({ message: 'Message not found' })
    res.status(200).json({ message: 'Message deleted successfully' })
  } catch (error) {
    next(error)
  }
}
