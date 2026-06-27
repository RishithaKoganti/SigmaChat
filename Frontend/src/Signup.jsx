import { useState, useContext } from "react";
import { MyContext } from "./MyContext";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const { setToken, setUser } = useContext(MyContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        navigate("/");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="authContainer">
      <div className="authBox">
        <h2>Create Account</h2>
        <form onSubmit={handleSignup}>
          {error && <p className="error">{error}</p>}
          <div className="inputGroup">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="inputGroup">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="inputGroup">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="authBtn">Sign up</button>
        </form>
        <p className="redirectText">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Signup;
