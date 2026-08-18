import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    toast.success("Form submitted successfully!");

    try {
      const res = await api.get("/auth/contact", formData);
      toast.success(res.data.message);

    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center pt-28">
      <div className="max-w-7xl w-full mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-base-content mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Have questions about VibeChat? We're here to help. Fill out the form
            and our team will get back to you shortly.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 bg-base-100 rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Column: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-2/5 bg-primary p-10 text-primary-content flex flex-col justify-between"
          >
            <div>
              <h3 className="text-3xl font-bold mb-6">Contact Information</h3>
              <p className="mb-10 opacity-80 text-lg">
                Fill up the form and our Team will get back to you within 24
                hours.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-content/20 rounded-full flex items-center justify-center">
                    <FiPhone size={24} />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Call Us</p>
                    <p className="font-semibold text-lg">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-content/20 rounded-full flex items-center justify-center">
                    <FiMail size={24} />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Email Us</p>
                    <p className="font-semibold text-lg">hello@vibechat.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-content/20 rounded-full flex items-center justify-center">
                    <FiMapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Our Location</p>
                    <p className="font-semibold text-lg">
                      123 Vibe Street, Tech City
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="relative mt-12 h-32 overflow-hidden rounded-xl hidden sm:block">
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-content/10 rounded-full"></div>
              <div className="absolute top-4 -left-8 w-24 h-24 bg-primary-content/10 rounded-full"></div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:w-3/5 p-10 lg:p-14"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">
                    Your Name
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all bg-base-200">
                  <FiUser className="text-base-content/50" />
                  <input
                    type="text"
                    name="name"
                    className="grow"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">
                    Email Address
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all bg-base-200">
                  <FiMail className="text-base-content/50" />
                  <input
                    type="email"
                    name="email"
                    className="grow"
                    placeholder="hello@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">
                    Message
                  </span>
                </label>
                <textarea
                  name="message"
                  className="textarea textarea-bordered h-32 focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-base-200 text-base py-3"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full md:w-auto px-10 gap-2 mt-4 text-lg"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
                <FiSend />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
