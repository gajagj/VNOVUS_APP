import React, { useState } from 'react';
import axios from 'axios';
import { decisionData } from './DecisionData';
import MyPagination from './MyPagination';
import '../App.css';
import { Redirect } from 'react-router-dom';
import { EmptyPageComponent } from './EmptyPageComponent';
import { calculateNoDays } from '../utils/funcUtils';

export default class MyDecision extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            decisions: [],
            start: 0,
            end: 15,
            noOfPages: '',
            currentPage: 1,
            unmount: false,
            showTakeAction: false,
            selectedDecision: {}
        }
    }
    componentDidMount() {
        console.log("url value", this.props)
        axios.get(`http://vnovushome.in/vnovus/api/approval/my_approval_list?approver=${this.props.employee.emp_id}`).then(response => {
            console.log("My decisions", response.data)
            this.setState({ decisions: response.data.myapprovals })
        }).catch(error => {
            console.log(error)
        })
    }

    paginationRightFlow = () => {
        this.setState({ start: this.state.start + 15 < this.state.decisions.length ? this.state.start + 15 : this.state.start, end: this.state.end + 15 < this.state.decisions.length ? this.state.end + 15 : this.state.decisions.length, currentPage: this.state.currentPage + 1 > Math.ceil(this.state.decisions.length / 15) ? this.state.currentPage : this.state.currentPage + 1 })
    }
    paginationLeftFlow = () => {
        console.log(this.state.start, this.state.end)
        this.state.currentPage > 1 && this.setState({ start: this.state.start - 15 < 0 ? this.state.start : this.state.start - 15, end: this.state.start - 1, currentPage: this.state.currentPage - 1 <= 0 ? this.state.currentPage : this.state.currentPage - 1 })
    }
    onDecisionTitleClick = (selectedDecision) => {
        this.setState({ showTakeAction: true, selectedDecision: selectedDecision })
    }
    goBackFromAction = () => {
        this.setState({ showTakeAction: false })
    }
    showDecisionsTable = () => {
        let decisionTable = [];
        const { decisions, start, end } = this.state;
        for (let i = start; i < end; i++) {
            decisionTable.push(<tr>
                <td><div style={{ cursor: "pointer" }} onClick={() => this.onDecisionTitleClick(decisions[i])}>{decisions[i].description}</div></td>
                <td>{decisions[i].status_myapproval}</td>
                <td>{calculateNoDays(decisions[i].requested_date)}</td>
                <td><div className={decisions[i].efficiency_myapproval === "green" ? "green-efficiency-button" : "red-efficiency-button"}></div></td>
            </tr>)
        }
        return decisionTable;
    }
    render() {
        console.log("My decision props", this.props)
        console.log(this.state.decisions)

        return <React.Fragment>
            {this.state.showTakeAction ? <div><TakeActionComponent empDetails={this.props.empDetails} selectedDecision={this.state.selectedDecision} goBackFromAction={this.goBackFromAction} /></div> :
                this.state.decisions.length > 0 ? <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Days</th>
                                <th>Efficiency</th>
                            </thead>
                            <tbody>
                                {this.showDecisionsTable()}
                            </tbody>
                        </table>
                    </div>
                    <div className="decision-pagination">
                        <MyPagination totalDecisions={Math.ceil(this.state.decisions.length / 15)} currentPage={this.state.currentPage} onPaginationRightFlow={this.paginationRightFlow} onPaginationLeftFlow={this.paginationLeftFlow} />
                    </div>
                </> : <EmptyPageComponent />
            }
        </React.Fragment>
    }
}

const TakeActionComponent = (props) => {
    console.log("selectedDecision", props.selectedDecision)
    const [addInfoget, setAddInfoget] = useState('')
    const [success_msg, setSuccess_msg] = useState('')
    const [showTransferComp, setShowTransferComp] = useState(false)
    const [selectedemp, setSelectedemp] = useState({ empName: [], empIds: [] })

    const actionMaking = (decisionStatus) => {
        if (decisionStatus === "Transferred") {
            setShowTransferComp(true)
            return
        }
        axios.get(`http://vnovushome.in/vnovus/api/approval/update_approval/format/json?approval_id=${props.selectedDecision.approval_id}&query_id=${props.selectedDecision.query_id}&status=${decisionStatus}&addInfoget=${addInfoget}`).then(res => {
            if (res.data.status) {
                console.log("approved response", res)
                setSuccess_msg(`${decisionStatus} Successfully`)
                props.goBackFromAction()
                alert(`${decisionStatus} Successfully`)
            }
        })
    }
    const handleOptionChange = (e) => {
        let empNames = [...selectedemp.empName]
        let empIds = [...selectedemp.empIds]
        if (e.target.value && empNames.length < 4 && !empIds.includes(props.empDetails[e.target.value].emp_id)) {
            empNames.push(props.empDetails[e.target.value].name)
            empIds.push(props.empDetails[e.target.value].emp_id)
            setSelectedemp({ ...selectedemp, empName: empNames, empIds })
        }
    }
    const onTransferDecision=()=>{
        let transString=''
        let num=['one','two', 'three', 'four']
        selectedemp.empIds.forEach((ids, i)=>{
            transString+=`transferred_${num[i]}=${ids}&`
        })
        //console.log(`http://vnovushome.in/vnovus/api/approval/transfer_approval/format/json?approval_id=${props.selectedDecision.approval_id}&${transString}`)
        axios.get(`http://vnovushome.in/vnovus/api//approval/transfer_approval/format/json?approval_id=${props.selectedDecision.approval_id}&${transString}`).then(res=>{
            if(res.status){
                alert("Decision Transferred Successfully")
                props.goBackFromAction()
            }
        })
    }
    const deleteApprover = (e, i) => {
        e.preventDefault();
        let empNames = [...selectedemp.empName]
        let empIds = [...selectedemp.empIds]
        empNames.splice(i, 1)
        empIds.splice(i, 1)
        setSelectedemp({ ...selectedemp, empName: empNames, empIds })
        console.log("after delete", selectedemp)
        console.log(i)
    }
    return (
        <>{showTransferComp ?
            <div className="actionComponent">
                <div style={{ cursor: "pointer" }} onClick={() => setShowTransferComp(false)}>Go Back</div><br/>

                <div>
                    <label>Description</label><br />
                    <textarea name="description" value={props.selectedDecision.description} rows="4" cols="50"></textarea>
                </div>
                <div>
                    <label>Approvers</label><br />
                    <div className="approvers">{selectedemp.empName.length ? selectedemp.empName.map((t, i) => { return <div style={{ color: 'blue', margin: "5px" }}>{i + 1}.{t}<span><div onClick={(e) => deleteApprover(e, i)} className="del-button"><div style={{ width: "70%", height: "20%", backgroundColor: "white", marginTop: "40%", marginLeft: "15%" }}></div></div></span></div> }) : <div />}</div>
                    <div style={{ float: "right", display: "inline-block", marginRight: "70px" }} onChange={handleOptionChange}><select>
                        <option value="">Select Approvers</option>
                        {props.empDetails.map((emp, index) => {
                            return <option value={index}>{emp.name} - {emp.role.toLowerCase()}</option>
                        })}</select></div>
                    <button className="submit-btn" style={{ backgroundColor: "green", marginLeft: "50px" }} onClick={onTransferDecision}>Transfer</button>
                    <button className="submit-btn" style={{ backgroundColor: "red", marginLeft: "50px" }} onClick={() => setShowTransferComp(false)}>Cancel</button>

                </div>
            </div>
            :
            <div className="actionComponent">
                <div style={{ cursor: "pointer" }} onClick={props.goBackFromAction}>Go Back</div>
                <h1>Approval Request</h1>
                {/* <div>
                    <label>Current Status</label><span>{props.selectedDecision.status}</span>
                </div>
                <div>
                    <label>Requester: </label><span>{props.selectedDecision.emp_name}</span>
                </div>
                <div>
                    <label>No of days: </label><span>{calculateNoDays(props.selectedDecision.requested_date)}</span>
                </div> */}
                <table style={{marginLeft:"0px"}}>
                    <tr>
                        <td><label>Current Status: </label></td>
                        <td>{props.selectedDecision.status}</td>
                    </tr>
                    <tr>
                        <td><label>Requester: </label></td>
                        <td>{props.selectedDecision.emp_name}</td>
                    </tr>
                    <tr>
                        <td><label>No of days: </label></td>
                        <td>{calculateNoDays(props.selectedDecision.requested_date)}</td>
                    </tr>
                </table>
                <div>
                    <label>Description</label><br />
                    <textarea name="description" value={props.selectedDecision.description} rows="4" cols="50"></textarea>
                </div>
                <div>
                    <label>Ask for Additional Info</label><br />
                    <textarea name="addInfoget" value={addInfoget} onChange={(e) => setAddInfoget(e.target.value)} placeholder="comments/remarks/reason for rejection" rows="4" cols="50"></textarea>
                </div>
                <div>
                    <button className="submit-btn" style={{ backgroundColor: "green", marginLeft: "50px" }} onClick={() => actionMaking("Approved")}>Approve</button>
                    <button className="submit-btn" style={{ backgroundColor: "goldenrod", marginLeft: "50px" }} onClick={() => actionMaking("Transferred")}>Transfer</button>
                    <button className="submit-btn" style={{ backgroundColor: "red", marginLeft: "50px" }} onClick={() => actionMaking("Rejected")}>Reject</button>
                </div>
                <div>{success_msg}</div>
            </div>
        }
        </>
    )
}