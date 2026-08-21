import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEyeOff, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";
import useAuthStore from "../store/useAuthStore";
import { useGoogleAuth } from "../config/GoogleAuth";

const Login = () => {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { isLoading, error, isInitialized, signInWithGoogle } = useGoogleAuth();

  const handleGoogleSuccess = async (userData) => {
    console.log("Google Login Data", userData);
    setLoading(true);
    try {
      const res = await api.post("/auth/googleLogin", userData);

      toast.success(res.data.message);
      setAuthUser(res.data);
      setFormData({ email: "", password: "" });
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const GoogleLogin = () => {
    signInWithGoogle(handleGoogleSuccess, handleGoogleFailure);
  };

  const handleGoogleFailure = (error) => {
    console.error("Google login failed:", error);
    toast.error("Google login failed. Please try again.");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      setAuthUser(res.data);
      toast.success(res.data.message);
      navigate("/chat");
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-md bg-base-100 shadow-xl"
      >
        <div className="card-body">
          <h2 className="text-3xl font-bold text-center text-primary mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-base-content/70 mb-6">
            Login to your account to continue
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
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

            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
                <a
                  href="#"
                  className="label-text-alt link link-hover text-primary"
                >
                  Forgot password?
                </a>
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                <FiLock className="text-base-content/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="grow"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" onClick={togglePasswordVisibility}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full text-lg mb-4"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="divider text-base-content/50">OR</div>

          <button className="btn btn-outline w-full mb-4" onClick={GoogleLogin}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5 mr-2"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.653-3.342-11.124-7.868l-6.57 4.819C9.656 39.663 16.318 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary font-semibold">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
