import {useState} from "react"; import {Link,useNavigate} from "react-router-dom"; import {useAuth} from "../context/AuthContext";
export default function Login(){const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState("");const {login}=useAuth();const nav=useNavigate();
 async function submit(e) {
  e.preventDefault();
  setError("");

  try {
    await login(email, password);

    const savedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (savedUser?.role === "ADMIN") {
      nav("/admin");
    } else {
      nav("/");
    }
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Login failed"
    );
  }
}
 return <AuthPage title="Welcome back" subtitle="Sign in to continue to your campus space."><form onSubmit={submit} className="auth-form">
  {error&&<div className="alert alert-danger">{error}</div>}<label>Email<input data-testid="email-input" value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label>
  <label>Password<input data-testid="password-input" value={password} onChange={e=>setPassword(e.target.value)} type="password" required/></label>
  <button data-testid="login-button" className="btn btn-primary btn-lg w-100">Sign in</button>
  <p className="text-center mt-3">New here? <Link to="/register">Create an account</Link></p>
 </form></AuthPage>}
function AuthPage({title,subtitle,children}){return <div className="auth-page"><div className="auth-brand"><div className="brand-mark"><i className="bi bi-search"></i></div>CampusFind</div><div className="auth-card"><h2>{title}</h2><p>{subtitle}</p>{children}</div></div>}
