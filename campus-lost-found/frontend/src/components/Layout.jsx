import {NavLink,Outlet,useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function Layout(){
 const {user,logout}=useAuth(); const nav=useNavigate();
 const links=[
  ["/","Dashboard","bi-grid-1x2"],
  ["/projects","Projects","bi-folder2-open"],
  ["/clients","Clients","bi-people"],
  ["/settings","Settings","bi-gear"]
 ];
 return <div className="app-shell">
  <aside className="sidebar">
   <div className="brand"><div className="brand-mark"><i className="bi bi-search"></i></div><div><b>CampusFind</b><small>Lost & Found</small></div></div>
   <nav>{links.map(([to,label,icon])=><NavLink key={to} to={to} className={({isActive})=>isActive?"side-link active":"side-link"}><i className={`bi ${icon}`}></i>{label}</NavLink>)}</nav>
   <div className="sidebar-bottom">
    <div className="mini-user"><div className="avatar">{user?.name?.[0]||"U"}</div><div><b>{user?.name||"Guest"}</b><small>{user?.role||"Student"}</small></div></div>
    {user && <button className="btn btn-light w-100 mt-2" onClick={()=>{logout();nav("/login")}} data-testid="logout-button">Log out</button>}
   </div>
  </aside>
  <main className="main-content"><Outlet/></main>
 </div>
}
