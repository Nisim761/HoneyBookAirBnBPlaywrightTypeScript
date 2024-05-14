import { Locator } from "playwright";
import convertDateToString from "./convertDateToString";

const selectDate = async (locator: Locator, date: Date) => {
    const dateString = convertDateToString.convertDateToStringForInput(date);

    await locator.locator("[aria-label=\"Calendar\"]")
        .getByTestId("calendar-day-".concat(dateString)).click();
};

const tryToUpdateDate = async (locator: Locator, date: Date): Promise<boolean> => {
    const dateString = convertDateToString.convertDateToStringForInput(date);

    const dateButton = locator.locator("[aria-label=\"Calendar\"]")
        .getByTestId("calendar-day-".concat(dateString));

    const isDateBlocked = await dateButton.getAttribute("data-is-day-blocked");
    if (isDateBlocked === "true") {
        return false;
    } else {
        await dateButton.click();
        return true;
    }
};

export default {
    selectDate,
    tryToUpdateDate,
}