export default function EmptyState({icon="bi-inbox",title="Nothing here yet",text="Your activity will appear here when you get started.",action,children}){
 return <div className="empty-state"><div className="empty-icon"><i className={`bi ${icon}`}></i></div><h5>{title}</h5><p>{text}</p>{action}{children}</div>
}
