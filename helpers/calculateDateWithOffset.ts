const calculateDateWithOffsetFromGivenDate = (date: Date, offsetInDays: number): Date => {
    const desiredDate = new Date(date);
    desiredDate.setDate(desiredDate.getDate() + offsetInDays);
    return desiredDate;
};

export default {
    calculateDateWithOffsetFromGivenDate,
}