import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    lifeStory: "",
    partnerPref: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { email, password, name, dob, gender, lifeStory, partnerPref } = formData;
  
    // Building based on the url
    const serverurl = process.env.REACT_APP_API_URL;
    const url = isLogin ? `${serverurl}/login` : `${serverurl}/signup`;
    
    const requestData = isLogin
      ? { email, password }  // For login, send only email and password
      : { name, email, password, dob, gender, lifeStory, partnerPref };  // For signup, send all required fields
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Something went wrong, please try again");
      }
  
      if (isLogin) {
        alert("Login Success");
      } else {
        alert("Account Created Successfully");
        setIsLogin(true); // Switch to the login form
      }
  
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || "An error occurred");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? "Login" : "Create Account"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </>
          )}
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <>
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />

              <label>Gender:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <label>Life Story:</label>
              <textarea
                name="lifeStory"
                value={formData.lifeStory}
                onChange={handleChange}
                required
                className="full-width"
              />

              <label>Partner Preference:</label>
              <textarea
                name="partnerPref"
                value={formData.partnerPref}
                onChange={handleChange}
                required
                className="full-width"
              />
            </>
          )}

          <button type="submit" className="full-width">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create an account" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}
