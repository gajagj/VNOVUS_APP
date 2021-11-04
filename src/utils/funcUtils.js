export const calculateNoDays=(x)=>{
    let date1=new Date();
    let date2= new Date(x);
    let diff = date1.getTime() - date2.getTime();
    let mydays= diff/(1000 * 3600 * 24)
    return parseInt(mydays)
}