const convertDateToStringForInput = (date: Date): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    return formatter.format(date);
};

const convertDateToStringForValidation = (date: Date): string => {
    return date.toISOString().slice(0, 10);
};

const getShortMonthNameFromDate = (date: Date): string => {
    return date.toLocaleString('default', { month: 'short' });
};

const getDayFromDate = (date: Date): string => {
    return date.getDate().toString();
};

export default {
    convertDateToStringForInput,
    convertDateToStringForValidation,
    getShortMonthNameFromDate,
    getDayFromDate,
}