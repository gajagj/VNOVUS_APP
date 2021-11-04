import React from 'react';
import TextField from '@mui/material/TextField';
import './LoginPage.css';
import { Redirect, Route, useHistory, Link } from 'react-router-dom';
import MyDecision from './MyDecision'
import axios from 'axios';


export default class Login extends React.Component{
    constructor(props){
        super(props);
        this.state={
            username:"",
            password:"",
            empDetails:[],
            loginMessage:"",
            auth:false
        }
    }
    componentDidMount(){
        axios.get("http://vnovushome.in/vnovus/api/employee/all_employees").then(response=>{
            this.setState({empDetails: response.data.employees})
        })
    }
    handleLogin=()=>{
        // e.preventDefault();
        const{username,password,empDetails,auth}=this.state;
        console.log("onclick called", username,password,empDetails)
        console.log("props", this.props)
        for(let i=0; i<empDetails.length; i++){
            if(empDetails[i].name!==username && empDetails[i].password!==password){
                this.setState({loginMessage:"Your Login is Successfull!!!", auth:true, nextComponent:<MyDecision employee={empDetails[i]}/>});
                return <Redirect to="/mydecision"/>
            }
        };
        this.setState({loginMessage:"Your Username/Password is incorrect"})
    }

    handleFieldChange=(e)=>{
        this.setState({[e.target.name]: e.target.value})
    }

    render(){
        return <>
        {!this.state.auth ? <div className="login-container">
            <form className="login-card">
            {/* <div><h1>VNOVUS</h1></div> */}
            <div className="login-user"><TextField id="standard-basic" label="Username" name="username" variant="standard" onChange={this.handleFieldChange}/></div>
            <div className="login-user"><TextField id="standard-basic" label="Password" name="password" variant="standard" onChange={this.handleFieldChange} /></div>
            <div><Link to={this.state.auth ? "/mydecision" : "/"}><button className="login-btn" type="button" onClick={this.handleLogin}>Login</button></Link></div>
            <div>{this.state.loginMessage}</div>
            </form>
        </div> : this.state.nextComponent}
        </>
    }
}