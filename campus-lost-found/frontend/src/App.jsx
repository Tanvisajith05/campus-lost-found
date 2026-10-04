import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";
import Layout from "./components/Layout";
import Protected from "./components/Protected";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ItemDetails from "./pages/ItemDetails";
import Report from "./pages/Report";
import MyActivity from "./pages/MyActivity";
import Admin from "./pages/Admin";

export default function App(){return <AuthProvider><BrowserRouter><Routes>
 <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
 <Route element={<Protected><Layout/></Protected>}>
  <Route path="/" element={<Dashboard/>}/><Route path="/projects" element={<Projects/>}/><Route path="/clients" element={<Clients/>}/>
  <Route path="/settings" element={<Settings/>}/><Route path="/item/:id" element={<ItemDetails/>}/>
  <Route path="/report/:type" element={<Report/>}/><Route path="/activity" element={<MyActivity/>}/>
  <Route path="/admin" element={<Protected admin><Admin/></Protected>}/>
 </Route>
 <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></BrowserRouter></AuthProvider>}
