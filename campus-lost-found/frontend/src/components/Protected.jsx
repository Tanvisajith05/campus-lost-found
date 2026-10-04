import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
export default function Protected({children,admin=false}){const {user}=useAuth();if(!user)return <Navigate to="/login" replace/>;if(admin&&user.role!=="ADMIN")return <Navigate to="/" replace/>;return children}
