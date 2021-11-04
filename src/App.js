import './App.css';
import './components/LoginPage.css';
import MyDecision from './components/MyDecision';
import Navbar from './components/Navbar';
import { BrowserRouter, Switch, Route, Link, withRouter, Redirect } from 'react-router-dom';
import MyRequest from './components/MyRequest';
import MyPagination from './components/MyPagination';
import React from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import { EmptyPageComponent } from './components/EmptyPageComponent';


class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: "",
      password: "",
      empDetails: [],
      loginMessage: "",
      auth: 0
    }
  }
  componentDidMount() {
    axios.get("http://vnovushome.in/vnovus/api/employee/all_employees").then(response => {
      this.setState({ empDetails: response.data.employees })
    })
  }
  handleLogin = () => {
    // e.preventDefault();
    const { username, password, empDetails, auth } = this.state;
    console.log("onclick called", username, password, empDetails)
    console.log("props", this.props)
    for (let i = 0; i < empDetails.length; i++) {
      if (empDetails[i].name === username && empDetails[i].password === password) {
        this.setState({ loginMessage: "Your Login is Successfull!!!", auth: 1, currentEmployee:empDetails[i]});
        return
      }
    };
    this.setState({ loginMessage: "Your Username/Password is incorrect" })
  }

  handleFieldChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }
  decisionClick=()=>{
    this.setState({auth:1})
  }
  requestClick=()=>{
    this.setState({auth:2})
  }
  render() {
    return (
      <div className="app">
         {/* <BrowserRouter> */}
         <ul className="nav">
                    <li className="brand">VNOVUS</li>
                    {this.state.auth && <li className={this.state.auth===1 ? "decision-color" : "" } onClick={this.decisionClick}>My Decision</li>}
                    {this.state.auth && <li className={this.state.auth===2 ? "decision-color" : "" } onClick={this.requestClick}>My Request</li>}
                    {this.state.auth && <li className={this.state.auth===3 ? "decision-color" : "" } onClick={()=> this.setState({auth:3})}>My DashBoard</li>}
                    {this.state.auth && <li>Welcome {this.state.currentEmployee.name}</li>}
                </ul>
          {this.state.auth===0 && <div className="login-container">
            <form className="login-card">
              <div className="login-user"><TextField id="standard-basic" label="Username" name="username" variant="standard" onChange={this.handleFieldChange} /></div>
              <div className="login-user"><TextField id="standard-basic" label="Password" name="password" variant="standard" onChange={this.handleFieldChange} /></div>
              <div><button className="login-btn" type="button" onClick={this.handleLogin}>Login</button></div>
              <div>{this.state.loginMessage}</div>
            </form>
          </div>}
         {this.state.auth===1 && <MyDecision employee={this.state.currentEmployee} empDetails={this.state.empDetails}/>}
         {this.state.auth===2 && <MyRequest employee={this.state.currentEmployee} empDetails={this.state.empDetails}/>}
         {this.state.auth===3 && <EmptyPageComponent/>}
          {/* <Switch>
            <Route path="/mydecision" component={() => <MyDecision employee={this.state.currentEmployee}/>}/>
            <Route path="/myrequest" component={()=><MyRequest employee={this.state.currentEmployee}/>} />
          </Switch> */}
        {/* </BrowserRouter> */}
      </div>
    );
  }
}

export default (App)