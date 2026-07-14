// Routes/contactRoute.js
import express from 'express'
import {
  submitContactForm,
  getAllContacts,
  deleteContact,
} from '../Controllers/contactController.js'


import { checkRole, auth } from '../Middleware/auth/auth.js' // New middleware

const router = express.Router()

// Public Route
router.post('/contact', submitContactForm)

// Admin/Manager Protected Routes
router.get('/all/messages', auth, checkRole(["admin", "manager"]), getAllContacts)
router.delete('/delete/message/:id', auth, checkRole(["admin", "manager"]), deleteContact)

export default router
