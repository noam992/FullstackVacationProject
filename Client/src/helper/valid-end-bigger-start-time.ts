import moment from 'moment';

export function endTimeBiggerThenStartTime(startDate: string, endDate: string) {

    let dateError: string = "";

    const startYear = parseInt(moment(startDate).format('YYYY'));
    const startMonth = parseInt(moment(startDate).format('MM'));
    const startDay = parseInt(moment(startDate).format('DD'));


    const endYear = parseInt(moment(endDate).format('YYYY'));
    const endMonth = parseInt(moment(endDate).format('MM'));
    const endDay = parseInt(moment(endDate).format('DD'));


    if(startYear > endYear){
        dateError = "Year of start is bigger then the end"
    }

    if(startYear === endYear){
        if(startMonth > endMonth){
            dateError = "Month of start is bigger then the end" 
        }

        if(startMonth === endMonth){
            if(startDay > endDay){
                dateError = "Day of start is bigger then the end"
            }
            
        } 
    }
    if (dateError !== "") {
        return dateError
    } else {
        return dateError
    }

}