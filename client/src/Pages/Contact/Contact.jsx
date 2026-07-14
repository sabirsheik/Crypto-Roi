import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeProvider'
import { toast } from 'sonner'
import axios from 'axios'

const Contact = () => {
  const { darkMode } = useTheme()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, formData)
      toast.success(res.data.message || 'Message sent successfully')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setErrors({})
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
        Object.values(err.response.data.errors).forEach(msg => toast.error(msg))
      } else {
        toast.error('Something went wrong, please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`py-28 px-6 transition-colors`}
    >
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Let's Connect</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          We'd love to hear from you. Fill out the form and our team will get back to you shortly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
      >
        {/* Left */}
        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-5 py-3 rounded-xl border bg-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300 placeholder-gray-500 '
              } focus:outline-none focus:ring-2 focus:ring-green-400`}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block mb-2 font-semibold">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-5 py-3 rounded-xl border bg-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300  placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-400`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold">Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="+123 456 7890"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-5 py-3 rounded-xl border bg-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-400`}
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block mb-2 font-semibold">Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="Investment Inquiry"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-5 py-3 rounded-xl border bg-transparent ${
                errors.subject ? 'border-red-500' : 'border-gray-300 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-green-400`}
            />
            {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
          </div>
        </div>

        {/* Message Field */}
        <div className="md:col-span-2">
          <label className="block mb-2 font-semibold">Your Message</label>
          <textarea
            name="message"
            rows="6"
            placeholder="Write your message here..."
            value={formData.message}
            onChange={handleChange}
            className={`w-full px-5 py-4 rounded-xl border bg-transparent ${
              errors.message ? 'border-red-500' : 'border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-green-400`}
          />
          {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message}</p>}
        </div>

        {/* Button */}
        <div className="md:col-span-2 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`inline-block px-8 py-3 text-sm font-semibold 
              text-black bg-green-400 rounded-full 
              hover:bg-gradient-to-r hover:from-green-400 hover:to-green-600 
              hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer
              ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sending...' : 'Send Message →'}
          </motion.button>
        </div>
      </form>
    </motion.section>
  )
}

export default Contact
