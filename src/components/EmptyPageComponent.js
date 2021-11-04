import noDaata from '../images/noData.png'

export const EmptyPageComponent=()=>{
    return(
        <div className="emptyPage">
            <img src={noDaata} alt="no-data-found"/>
        </div>
    )
}