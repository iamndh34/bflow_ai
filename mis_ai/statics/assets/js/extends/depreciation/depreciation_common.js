/*
This file is about to handle all logics about depreciation
Can be used for applications in Sale, Finance,...
Include classes:
DepreciationControl{}
*/

class DepreciationControl {
    static callDepreciation(opts) {
        let {method = 0, months, start_date, end_date, price, adjust = null} = opts;
        months = parseInt(months);
        price = parseFloat(price);
        adjust = parseFloat(adjust);
        /*
        method: 0: line method || 1: adjustment method
        months: total months depreciation
        start_date: date start depreciation (DD/MM/YYYY)
        end_date: date end depreciation (DD/MM/YYYY)
        price: origin price to depreciation
        adjust: use for method is adjustment method
        */
        let result = [];
        let totalMonths = months;
        let depreciationValue = Math.round(price / totalMonths); // Khấu hao đều
        let accumulativeValue = 0;
        let currentStartDate = start_date;
        let currentMonth = 1;
        let currentValue = price;
        let endDateObj = DepreciationControl.parseToDateObj(end_date);

        while (true) {
            let currentStartDateObj = DepreciationControl.parseToDateObj(currentStartDate);
            let currentEndDate;
            if (result.length === 0) {
                // Tháng đầu: ngày bắt đầu là start_date và kết thúc vào ngày cuối cùng của tháng
                currentEndDate = DepreciationControl.addOneMonthToLast(currentStartDate, true);
            } else {
                // Các tháng giữa: ngày bắt đầu là ngày 1 và kết thúc vào ngày cuối cùng của tháng
                currentStartDate = `01/${String(currentStartDateObj.getMonth() + 1).padStart(2, '0')}/${currentStartDateObj.getFullYear()}`;
                currentEndDate = DepreciationControl.addOneMonthToLast(currentStartDate, true);
            }
            let currentEndDateObj = DepreciationControl.parseToDateObj(currentEndDate);
            // Tính khấu hao hệ số nếu method === 1
            if (method === 1 && adjust) {
                // Khấu hao hệ số
                let depreciationAdjustValue = Math.round(price / totalMonths * adjust);
                depreciationValue = depreciationAdjustValue;
                if (result.length > 0) {
                    let last_end_value = 0;
                    let last = result[result.length - 1];
                    last_end_value = last?.['end_value'];
                    let total_accumulative_month = 0;
                    for (let data of result) {
                        total_accumulative_month += data?.['accumulative_month'];
                    }
                    // Khấu hao hệ số
                    depreciationAdjustValue = Math.round(last_end_value / totalMonths * adjust);
                    /*
                    Kiểm tra nếu khấu hao theo hệ số mà lớn hơn khấu hao chia đều số tháng còn lại thì lấy theo khấu hao hệ số
                    còn ngược lại thì lấy theo khấu hao chia đều.
                     */
                    let monthsRemain = totalMonths - total_accumulative_month;
                    let depreciationValueCompare = last_end_value / monthsRemain;
                    if (depreciationAdjustValue > depreciationValueCompare) {
                        depreciationValue = depreciationAdjustValue;
                    } else {
                        depreciationValue = depreciationValueCompare;
                    }
                }
            }

            if (currentEndDateObj > endDateObj) {
                if (currentStartDateObj < endDateObj) {
                    /*
                    Kiểm tra nếu là tháng cuối (ngày kết thúc của tháng bằng ngày kết thúc khấu hao)
                    thì khấu hao gán bằng giá trị đầu để khấu hao hết về 0
                     */
                    depreciationValue = currentValue;
                    accumulativeValue += depreciationValue;
                    result.push({
                        month: currentMonth.toString(),
                        begin: currentStartDate,
                        end: end_date,
                        accumulative_month: DepreciationControl.getRatioDaysOnMonth(currentStartDate, end_date),
                        start_value: Math.round(currentValue),
                        depreciation_value: Math.round(depreciationValue),
                        accumulative_value: Math.round(accumulativeValue),
                        end_value: Math.round(currentValue - depreciationValue),
                    });
                }
                break;
            } else {
                let accumulativeMonth = DepreciationControl.getRatioDaysOnMonth(currentStartDate, currentEndDate);
                if (currentStartDateObj.getDate() !== 1) {
                    depreciationValue = depreciationValue * accumulativeMonth;
                }
                /*
                Kiểm tra nếu là tháng cuối (ngày kết thúc của tháng bằng ngày kết thúc khấu hao)
                thì khấu hao gán bằng giá trị đầu để khấu hao hết về 0
                 */
                if (currentEndDate === end_date) {
                    depreciationValue = currentValue;
                }
                accumulativeValue += depreciationValue;
                result.push({
                    month: currentMonth.toString(),
                    begin: currentStartDate,
                    end: currentEndDate,
                    accumulative_month: accumulativeMonth,
                    start_value: Math.round(currentValue),
                    depreciation_value: Math.round(depreciationValue),
                    accumulative_value: Math.round(accumulativeValue),
                    end_value: Math.round(currentValue - depreciationValue),
                });
            }

            currentValue = Math.round(currentValue - depreciationValue);
            if (currentStartDateObj.getDate() !== 1) {
                depreciationValue = Math.round(price / totalMonths);
            }
            currentStartDate = DepreciationControl.addOneDay(currentEndDate);
            currentMonth++;
        }

        return result;
    };

    static extractDataOfRange(opts) {
        let {data_depreciation, start_date, end_date} = opts;
        let matchingRange = DepreciationControl.findMatchingRange(start_date, end_date, data_depreciation);
        if (matchingRange.length > 0) {
            // Xu ly du lieu thang dau tien
            let firstData = matchingRange[0];
            firstData['lease_allocated'] =  firstData?.['depreciation_value'];
            let beginDay = parseInt(start_date.split("/")[0]);
            let beginMonth = parseInt(start_date.split("/")[1]);
            let beginYear = parseInt(start_date.split("/")[2]);

            let beginDayFirstData = parseInt(firstData?.['begin'].split("/")[0]);
            let beginMonthFirstData = parseInt(firstData?.['begin'].split("/")[1]);
            let beginYearFirstData = parseInt(firstData?.['begin'].split("/")[2]);

            // let endDayFirstData = parseInt(firstData?.['end'].split("/")[0]);

            if (beginMonth === beginMonthFirstData && beginYear === beginYearFirstData && beginDayFirstData < beginDay) {
                let daysOfMonth = DepreciationControl.getDaysOfMonth(firstData?.['begin']);
                let daysOfFirstData = firstData?.['accumulative_month'] * daysOfMonth;
                let perDayDepreciation = firstData?.['depreciation_value'] / daysOfFirstData;
                let daysBetween = DepreciationControl.getDaysBetween(firstData?.['begin'], start_date);
                daysBetween = daysBetween - 1;

                // if (daysBetween === beginDay) {
                //     daysBetween = daysBetween - 1;
                // }
                // if (endDayFirstData === beginDay) {
                //     daysBetween = daysBetween - 1;
                // }
                let daysBetweenDepreciation = perDayDepreciation * daysBetween;
                firstData['lease_allocated'] =  firstData?.['depreciation_value'] - daysBetweenDepreciation;
            }
            firstData['lease_time'] = start_date;
            firstData['lease_accumulative_allocated'] = firstData?.['lease_allocated'];
            // Xu ly du lieu thang cuoi cung
            let lastData = matchingRange.at(-1);
            let endDateTarget = end_date;
            let depreciationEndDateObj = DepreciationControl.parseToDateObj(lastData?.['end']);
            let leaseEndDateObj = DepreciationControl.parseToDateObj(end_date);
            if (depreciationEndDateObj < leaseEndDateObj) {
                endDateTarget = lastData?.['end'];
            }
            lastData['lease_time'] = endDateTarget;
            if (matchingRange.length > 1) {
                lastData['lease_allocated'] = lastData?.['depreciation_value'];
                let endDay = parseInt(end_date.split("/")[0]);
                let endMonth = parseInt(end_date.split("/")[1]);
                let endYear = parseInt(end_date.split("/")[2]);

                let beginDayEndData = parseInt(lastData?.['begin'].split("/")[0]);
                let beginMonthEndData = parseInt(lastData?.['begin'].split("/")[1]);
                let beginYearEndData = parseInt(lastData?.['begin'].split("/")[2]);

                if (endMonth === beginMonthEndData && endYear === beginYearEndData && beginDayEndData < endDay) {
                    let daysOfMonth = DepreciationControl.getDaysOfMonth(lastData?.['begin']);
                    let daysOfFirstData = lastData?.['accumulative_month'] * daysOfMonth;
                    let perDayDepreciation = lastData?.['depreciation_value'] / daysOfFirstData;
                    let daysBetween = DepreciationControl.getDaysBetween(lastData?.['begin'], endDateTarget);
                    lastData['lease_allocated'] = perDayDepreciation * daysBetween;
                }
            }
            // Neu chi co 1 record thi set lease_accumulative_allocated = lease_allocated
            if (matchingRange.length === 1) {
                matchingRange[0]['lease_accumulative_allocated'] = matchingRange[0]?.['lease_allocated'];
                return matchingRange;
            }
            // Chay vong lap xu ly du lieu giua firstData va lastData
            for (let i = 1; i < matchingRange.length; i++) {
                if (i < (matchingRange.length - 1)) {
                    matchingRange[i]['lease_allocated'] = matchingRange[i]?.['depreciation_value'];
                }
                matchingRange[i]["lease_accumulative_allocated"] = matchingRange[i - 1]?.["lease_accumulative_allocated"] + matchingRange[i]?.["lease_allocated"];
            }

        }
        return matchingRange;
    };

    static mapDataOfRange(opts) {
        let {data_depreciation, data_of_range} = opts;
        let dataFn = data_depreciation;
        let matchingRangeJSON = {};
        for (let matching of data_of_range) {
            matchingRangeJSON[matching?.['month']] = matching;
        }
        for (let data of dataFn) {
            if (matchingRangeJSON.hasOwnProperty(data?.['month'])) {
                data['lease_allocated'] = Math.round(matchingRangeJSON[data?.['month']]?.['lease_allocated']);
                data['lease_accumulative_allocated'] = Math.round(matchingRangeJSON[data?.['month']]?.['lease_accumulative_allocated']);
            }
        }
        return dataFn;
    };

    static getNetValue(opts) {
        let {data_depreciation, current_date} = opts;
        // Create a copy of the array to prevent mutation
        let depreciationCopy = JSON.parse(JSON.stringify(data_depreciation));
        if (depreciationCopy.length > 0) {
            let firstData = depreciationCopy[0];
            let start_date = firstData?.['begin'];
            let price = firstData?.['start_value'];
            let dataOfRange = DepreciationControl.extractDataOfRange({
                'data_depreciation': depreciationCopy,
                'start_date': start_date,
                'end_date': current_date,
            });
            let last = dataOfRange.at(-1);
            return Math.round(price - last?.['lease_accumulative_allocated']);
        }
        return 0;
    };

    static addOneDay(date_current) {
        const [day, month, year] = date_current.split('/').map(num => parseInt(num));
        const date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + 1);

        const newDay = String(date.getDate()).padStart(2, '0');
        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        const newYear = date.getFullYear();

        return `${newDay}/${newMonth}/${newYear}`;
    };

    static addOneMonthToLast(date_current, alignToEndOfMonth = false) {
        const [day, month, year] = date_current.split('/').map(num => parseInt(num));
        const date = new Date(year, month - 1, day);

        if (alignToEndOfMonth) {
            // Move to the last day of the current month
            date.setMonth(date.getMonth() + 1, 0);
        } else {
            // Move to the same day next month
            date.setMonth(date.getMonth() + 1);
        }

        const newDay = String(date.getDate()).padStart(2, '0');
        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        const newYear = date.getFullYear();

        return `${newDay}/${newMonth}/${newYear}`;
    };

    static parseToDateObj(dateStr) {
        const [day, month, year] = dateStr.split('/').map(num => parseInt(num));
        return new Date(year, month - 1, day); // Convert to Date object
    };

    static calDaysBetween(startDateObj, endDateObj) {
        let timeDifference = endDateObj - startDateObj;
        return timeDifference / (1000 * 60 * 60 * 24);
    };

    static getDaysOfMonth(date) {
        // Convert strings to Date objects
        let [beginDay, beginMonth, beginYear] = date.split('/').map(Number);
        // Get total days of the month
        return new Date(beginYear, beginMonth, 0).getDate();
    };

    static getDaysBetween(begin, end) {
        // Convert strings to Date objects
        let [beginDay, beginMonth, beginYear] = begin.split('/').map(Number);
        let [endDay, endMonth, endYear] = end.split('/').map(Number);
        let beginDate = new Date(beginYear, beginMonth - 1, beginDay);
        let endDate = new Date(endYear, endMonth - 1, endDay);
        return (endDate - beginDate) / (1000 * 60 * 60 * 24) + 1;
    };

    static getRatioDaysOnMonth(begin, end) {
        // Get total days between begin and end
        let totalDaysBetween = DepreciationControl.getDaysBetween(begin, end);
        // Get total days of the month
        let totalDaysInMonth = DepreciationControl.getDaysOfMonth(begin);
        // Calculate the fraction
        return totalDaysBetween / totalDaysInMonth;
    };

    static getEndDateDepreciation(startDate, months) {
        let [day, month, year] = startDate.split('/').map(Number);
        let date = new Date(year, month - 1, day); // Convert to Date object
        date.setMonth(date.getMonth() + months); // Add months
        date.setDate(date.getDate() - 1); // Subtract one day
        return date.toLocaleDateString('en-GB').split('/').join('/');
    };

    static findMatchingRange(lease_from, lease_to, data) {
        let leaseFromDate = new Date(lease_from.split('/').reverse().join('-'));
        let leaseToDate = new Date(lease_to.split('/').reverse().join('-'));

        // Find start index (first dict where lease_from falls in range)
        let startIndex = data.findIndex(item => {
            let beginDate = new Date(item.begin.split('/').reverse().join('-'));
            let endDate = new Date(item.end.split('/').reverse().join('-'));
            return leaseFromDate >= beginDate && leaseFromDate <= endDate;
        });

        // Find end index (first dict where lease_to falls in range)
        // let endIndex = data.findIndex(item => {
        //     let beginDate = new Date(item.begin.split('/').reverse().join('-'));
        //     let endDate = new Date(item.end.split('/').reverse().join('-'));
        //     return leaseToDate >= beginDate && leaseToDate <= endDate;
        // });

        let endIndex = data.findIndex((item, index) => {
            let beginDate = new Date(item.begin.split('/').reverse().join('-'));
            let endDate = new Date(item.end.split('/').reverse().join('-'));
            if (index === data.length - 1) {
                // If it's the last item, only check if leaseToDate >= beginDate
                return leaseToDate >= beginDate;
            } else {
                // Otherwise, check if leaseToDate is between beginDate and endDate
                return leaseToDate >= beginDate && leaseToDate <= endDate;
            }
        });

        // If both start and end indexes are found, return the range
        if (startIndex !== -1 && endIndex !== -1) {
            return data.slice(startIndex, endIndex + 1);
        }

        return []; // Return empty array if no match found
    };
}