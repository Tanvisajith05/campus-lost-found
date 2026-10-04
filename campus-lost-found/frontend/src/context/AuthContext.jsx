import {createContext,useContext,useState} from "react";
import api from "../services/api";
const AuthContext=createContext(null);
export function AuthProvider({children}){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("user")||"null"));
  async function login(email,password){
    const {data}=await api.post("/auth/login",{email,password});
    localStorage.setItem("token",data.token); localStorage.setItem("user",JSON.stringify(data.user)); setUser(data.user);
  }
  function logout(){localStorage.clear();setUser(null);}
  return <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
