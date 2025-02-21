"use client";
import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);  

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().required("Required").min(6, "Too Short!"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: (values) => {
      setLoading(true);  
      const { newPassword } = values;
      const token = window.location.pathname.split("/").pop();

      axios
        .put(`http://localhost:5000/reset-password/${token}`, { newPassword })
        .then((response) => {
          toast.success(response.data.message);
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        })
        .catch((error) => {
          console.log(error, ">>>>");
          toast.error("Your link has expired");
        })
        .finally(() => {
          setLoading(false);  
        });
    },
  });

  return (
    <main id="content" role="main" className="w-full  max-w-md mx-auto p-6">
      <div className="mt-7 bg-white  rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
        <div className="p-4 sm:p-7">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Remember your password?
              <a
                className="text-blue-600 decoration-2 hover:underline font-medium"
                href="#"
              >
                Login here
              </a>
            </p>
          </div>
          <div className="mt-5">
            <form onSubmit={formik.handleSubmit}>
              <div className="grid gap-y-4">
                <div>
                  <span style={{ color: 'red', fontsize: '10' }}>{formik.touched.newPassword && formik.errors.newPassword}</span>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      onChange={formik.handleChange}
                      value={formik.values.newPassword}
                      className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                    
                    />
                  </div>
                </div>
                <div>
                  <span style={{ color: 'red', fontsize: '10' }}>{formik.touched.confirmPassword && formik.errors.confirmPassword}</span>

                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      onChange={formik.handleChange}
                      value={formik.values.confirmPassword}
                      className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                    
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                  disabled={loading}  
                >
                  {loading ? (
                    <span>Loading...</span>  
                  ) : (
                    <span>Reset password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
    </main>
  );
};

export default ResetPassword;
