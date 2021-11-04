import { display } from '@mui/system';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import MyPagination from './MyPagination';
import { css, jsx } from '@emotion/react';
import { EmptyPageComponent } from './EmptyPageComponent';
import { calculateNoDays } from '../utils/funcUtils';
import addIcon from '../images/add-icon.png';

export default class MyRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myRequests: [],
            start: 0,
            end: 0,
            noOfPages: '',
            currentPage: 1,
            addRequestInd: false,
            showApprovalComponent: false,
            selectedReq: {}
        }
    }

    componentDidMount() {
        axios.get(`http://vnovushome.in/vnovus/api/queries/query_by_userid?user_id=${this.props.employee.emp_id}`).then(response => {
            console.log("myqueries", response.data.myqueries)
            let responseData = response.data.myqueries;
            this.setState({ myRequests: responseData, end: Math.min(responseData.length, 15) })
        }).catch(error => {
            console.log(error)
        })
    }
    onRequestTitleClick = (selectedReq) => {
        this.setState({ showApprovalComponent: !this.state.showApprovalComponent, selectedReq: selectedReq })
    }

    showDecisionsTable = () => {
        let decisionTable = [];
        const { myRequests, start, end } = this.state;
        for (let i = start; i < end; i++) {
            decisionTable.push(<tr>
                <td><div style={{ cursor: "pointer" }} onClick={() => this.onRequestTitleClick(myRequests[i])}>{myRequests[i].description}</div></td>
                <td>{myRequests[i].overall_status}</td>
                <td>{calculateNoDays(myRequests[i].request_date)}</td>
                <td><div className={myRequests[i].efficiency == "green" ? "green-efficiency-button" : "red-efficiency-button"}></div></td>
            </tr>)
        }
        return decisionTable;
    }
    paginationRightFlow = () => {
        this.setState({ start: this.state.start + 15 < this.state.myRequests.length ? this.state.start + 15 : this.state.start, end: this.state.end + 15 < this.state.myRequests.length ? this.state.end + 15 : this.state.myRequests.length, currentPage: this.state.currentPage + 1 > Math.ceil(this.state.myRequests.length / 15) ? this.state.currentPage : this.state.currentPage + 1 })
    }
    paginationLeftFlow = () => {
        this.state.currentPage > 1 && this.setState({ start: this.state.start - 15 < 0 ? this.state.start : this.state.start - 15, end: this.state.start - 1, currentPage: this.state.currentPage - 1 <= 0 ? this.state.currentPage : this.state.currentPage - 1 })
    }
    onAddRequest = () => {
        this.setState({ addRequestInd: !this.state.addRequestInd })
    }
    render() {
        return <React.Fragment>
            {this.state.myRequests.length > 0 ? <>{this.state.showApprovalComponent ? <ApprovalComponent selectedReq={this.state.selectedReq} onRequestTitleClick={this.onRequestTitleClick} /> : !this.state.addRequestInd ? <>
                <div id="outer-most" onClick={this.onAddRequest}>
                    <div id="outer">
                        <div id="vert"></div>
                        <div id="horiz"></div>
                    </div>
                </div>
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
                    <MyPagination employee={this.props.employee} totalDecisions={Math.ceil(this.state.myRequests.length / 15)} currentPage={this.state.currentPage} onPaginationRightFlow={this.paginationRightFlow} onPaginationLeftFlow={this.paginationLeftFlow} />

                </div>
            </> : <div className="table-container" ><AddComponent empDetails={this.props.empDetails} employeeId={this.props.employee.emp_id} onAddRequestClick={this.onAddRequest} /></div>
            }</> : <EmptyPageComponent />}
        </React.Fragment>
    }
}
const addrequest = {
    "description": "I am adding a query",
    "request_date": "2021-10-20",
    "target_date": "2021-10-25",
    "requester": "2",
    "title": "macroid apps",
    "approver1": "4"
}
const AddComponent = (props) => {
    const [selectedemp, setSelectedemp] = useState({ empName: [], empIds: [] })
    const [formValues, setFormValues] = useState({ description: "", analytic_result: "", target_date: "" })
    const [successMsg, setSuccessMsg] = useState("")
    const handleFieldChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value })
    }
    const handleOptionChange = (e) => {
        let empNames = [...selectedemp.empName]
        let empIds = [...selectedemp.empIds]
        if (e.target.value && empNames.length < 8 && !empIds.includes(props.empDetails[e.target.value].emp_id)) {
            empNames.push(props.empDetails[e.target.value].name)
            empIds.push(props.empDetails[e.target.value].emp_id)
            setSelectedemp({ ...selectedemp, empName: empNames, empIds })
        }
    }
    useEffect(() => {
        // axios.get("http://vnovushome.in/vnovus/api/queries/add_query/format/json?description=Arun is requesting a approval from axios&request_date=2021-10-20&target_date=2021-10-25&requester=2&title=macroid apps&approver1=3").then(res => {
        //     console.log("add", res)
        // })
    }, [])
    const handleButtonClick = (e) => {
        console.log("formvalues", formValues)
        e.preventDefault();
        let todaysdate = new Date();
        let request_date = todaysdate.getFullYear() + '-' + (parseInt(todaysdate.getMonth()) + 1) + '-' + todaysdate.getDate()
        let target_Date = formValues.target_date
        let approverString = ''
        if (selectedemp.empIds.length) {
            selectedemp.empIds.forEach((id, i) => {
                approverString += `approver${i + 1}=${id}&`
            })
        }
        let url = `http://vnovushome.in/vnovus/api/queries/add_query/format/json?description=${formValues.description}&request_date=${request_date}&target_date=${target_Date}&requester=${props.employeeId}&title=macroid apps&${approverString}`
        axios.get(url).then(res => {
            console.log('request added successfully', res)
            setSuccessMsg("Request added successfully")
        }).catch(err => {
            setSuccessMsg("Exception occured")
        })
        setFormValues({ description: "", analytic_result: "", target_date: "" })
        setSelectedemp({ empName: [], empIds: [] })
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
    return <>
        <form className="addrequest-form">
            <h2>Add Request</h2>
            <div>
                <label>Description</label><br />
                <textarea onChange={handleFieldChange} name="description" value={formValues.description} placeholder="Description" rows="4" cols="50"></textarea>
            </div>
            <div>
                <label>Analytics Result</label><br />
                <textarea name="analytic_result" onChange={handleFieldChange} value={formValues.analytic_result} placeholder="Analytics Result" rows="4" cols="50"></textarea>
            </div>
            <div>
                <label>Approvers</label><br />
                <div className="approvers">{selectedemp.empName.length ? selectedemp.empName.map((t, i) => { return <div style={{ color: 'blue', margin: "5px" }}>{i + 1}.{t}<span><div onClick={(e) => deleteApprover(e, i)} className="del-button"><div style={{ width: "70%", height: "20%", backgroundColor: "white", marginTop: "40%", marginLeft: "15%" }}></div></div></span></div> }) : <div />}</div>
                <div style={{ float: "right", display: "inline-block", marginRight: "70px" }}><select onChange={handleOptionChange}>
                    <option value="">Select Approvers</option>
                    {props.empDetails.map((emp, index) => {
                        return <option value={index}>{emp.name} - {emp.role.toLowerCase()}</option>
                    })}</select></div>
            </div>
            <div>
                <label>Target Date</label><br />
                <input name="target_date" onChange={handleFieldChange} value={formValues.target_date} type="date" />
            </div>
            <div>
                <button className="submit-btn" onClick={handleButtonClick}>Submit</button><span><button className="submit-btn" onClick={() => props.onAddRequestClick()}>Cancel</button></span>
            </div>
            <div style={{ color: "green" }}>{successMsg}</div>
        </form>
    </>
}


const ApprovalComponent = (props) => {
    console.log("selected request", props)

    const [approverList, setApproverList] = useState([])
    const [transferlist, setTransferlist] = useState([])
    const [clicked, setClicked] = useState('')

    useEffect(() => {
        axios.get(`http://vnovushome.in/vnovus/api/approval/get_approval_list/format/json?query_id=${props.selectedReq.query_id}`).then(res => {
            console.log(res.data)
            if (res.data.status) {
                setApproverList(res.data.approvals)
            }
        })
    }, [])
    console.log("approver list", approverList)
    const transferredApprover=(appId)=>{
       const list= approverList.map(approver=>{
            if(approver.transferred_from === appId){
                return <div><div className="approverCard"><b>{approver.approver_name}</b> {approver.status}</div></div>
                
            }
        })
        setTransferlist(list)
        setClicked(appId)
    }
    const originalApproverList = () => {
        return approverList.map(approver => {
            if(approver.type === 'Original'){
                if(approver.status === 'Transferred'){
                    return <div><div className="approverCard" style={{backgroundColor: clicked===approver.approver ? "green" : ""}}><b>{approver.approver_name}</b> {approver.status}</div>
                    <div style={{ display: "block", marginLeft: "50px" }} onClick={()=>transferredApprover(approver.approver)}><img style={{ width: "15px", height: "15px" }} src={addIcon} alt="add-icon" /></div>
                    </div>
                }else{
                return <div><div className="approverCard"><b>{approver.approver_name}</b> {approver.status}</div>
                </div>
            }
        }
            
        })
    }
    return (
        <div className="actionComponent" style={{ width: "1000px" }}>
            <div onClick={props.onRequestTitleClick}>Go Back</div>
            <h2>Approvers Info</h2>
            <div>
                <label>Description: </label><span>{props.selectedReq.description}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>{originalApproverList()}</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>{transferlist}</div>
        </div>
    )
}