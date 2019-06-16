var moment = require('moment');

function getMonthDateRange(year, month) {
    // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
    // array is 'year', 'month', 'day', etc
    var startDate = moment([year, month - 1]);

    // Clone the value before .endOf()
    var endDate = moment(startDate).endOf('month');

    // just for demonstration:
    console.log(startDate.toDate());
    console.log(endDate.toDate());

    // make sure to call toDate() for plain JavaScript date type
    return { startDate, endDate };
}

function msToSQLDate(ms){
    return moment(new Date(Number(ms))).format('YYYY-MM-DD H:mm:ss');
}

module.exports = {
    getMonthDateRange,
    msToSQLDate
}