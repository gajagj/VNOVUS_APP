import React from 'react';
import {Link} from 'react-router-dom';


export default class Navbar extends React.Component{
    constructor(props){
        super(props);
    }
    
    render(){
        const{employee, auth}=this.props
        return <>
                <ul className="nav">
                    <li className="brand">VNOVUS</li>
                    <li><Link to="/mydecision">My Decision</Link></li>
                    <li><Link to="/myrequest">My Request</Link></li>
                    <li>My DashBoard</li>
                </ul>
                
        </>
    }
}