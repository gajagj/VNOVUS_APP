
const Pagination = (props) => {
    return <div className="pagination">
        <span>{props.currentPage} of {props.totalDecisions}</span>&nbsp;&nbsp;
        <a href="#" onClick={props.onPaginationLeftFlow}>❮</a>&nbsp;&nbsp;
        <a href="#" onClick={props.onPaginationRightFlow}>❯</a>
    </div>
}

export default Pagination;