import { Locator, Page, expect } from '@playwright/test';
import convertDateToString from '../helpers/convertDateToString';
import handleDates from '../helpers/handleDates';

const validateListingPageFinishedLoading = async (page: Page, listindInfo: string[]) => {
    // dismiss "automatic translation on" modal
    if (null !== await page.waitForSelector('button[aria-label=\"Close\"]')) {
        await page.locator("button[aria-label=\"Close\"]").click();
    }

    const listingPageUrl = page.url();

    const listingName = listindInfo[0];
    const listindId = listindInfo[1];
    
    const main = page.getByRole("main");
    const pageHeadline = await main.locator("h1").textContent();
    
    expect(listingPageUrl).toContain(listindId);
    expect(pageHeadline).toContain(listingName);
};

const confirmBookingDetails = async (page: Page, checkInDate: Date, checkOutDate: Date, 
    numOfAdults: number, numOfChildren: number, numOfInfants: number, numOfPets: number) => {

        await confirmBookingDates(page, checkInDate, checkOutDate);

        await confirmBookingGuests(page, numOfAdults, numOfChildren, numOfInfants, numOfPets);
};

const confirmBookingDates = async (page: Page, checkInDate: Date, checkOutDate: Date) => {
    const bookingDetailsElement = page.getByTestId("book-it-default");

    const bookingDates = await bookingDetailsElement.locator(`button[aria-label^="Change dates"]`).getAttribute("aria-label");
    
    const bookingCheckInDate = bookingDates!.split("Check-in: ")[1].split(";")[0];
    expect(bookingCheckInDate).toEqual(convertDateToString.convertDateToStringForValidation(checkInDate));

    const bookingCheckOutDate = bookingDates!.split("Checkout: ")[1];
    expect(bookingCheckOutDate).toEqual(convertDateToString.convertDateToStringForValidation(checkOutDate));
};

const openGuestsSection = async (locator: Locator) => {
    
    await locator.locator("[id=\"GuestPicker-book_it-trigger\"]").click();
};

const closeGuestsSection = async (locator: Locator) => {
    
    await locator.locator("[aria-labelledby=\"GuestPicker-book_it-form\"]")
        .getByRole("button", { name: "Close" }).click();
};

const confirmBookingGuests = async (page: Page, numOfAdults: number, numOfChildren: number,
     numOfInfants: number, numOfPets: number) => {
    const bookingDetailsElement = page.getByTestId("book-it-default");
    await openGuestsSection(bookingDetailsElement);

    await confirmBookingGuestType(bookingDetailsElement, numOfAdults, "adults");
    
    await confirmBookingGuestType(bookingDetailsElement, numOfChildren, "children");
    
    await confirmBookingGuestType(bookingDetailsElement, numOfInfants, "infants");
    
    await confirmBookingGuestType(bookingDetailsElement, numOfPets, "pets");
    
    await closeGuestsSection(bookingDetailsElement);
};

const confirmBookingGuestType = async (locator: Locator, numOfGuest: number, guestType: string) => {
    let buttonIdentifier = "GuestPicker-book_it-form-guestTypePlaceHolder-stepper-value";
    buttonIdentifier = buttonIdentifier.replace("guestTypePlaceHolder", guestType);
    
    const bookingGuestsNumber = await locator
        .getByTestId(buttonIdentifier).textContent();
    expect(bookingGuestsNumber).toEqual(numOfGuest.toString());
};

const adjustGuestsCount = async (page: Page, numOfAdultsDiff: number, numOfChildrenDiff: number, 
    numOfInfantsDiff: number, numOfPetsDiff: number) => {
        const bookingDetailsElement = page.getByTestId("book-it-default");
        await openGuestsSection(bookingDetailsElement);

        await adjustGuestTypeCount(page, numOfAdultsDiff, "adults");
        await adjustGuestTypeCount(page, numOfChildrenDiff, "children");
        await adjustGuestTypeCount(page, numOfInfantsDiff, "infants");
        await adjustGuestTypeCount(page, numOfPetsDiff, "pets");

        await closeGuestsSection(bookingDetailsElement);
};

const adjustGuestTypeCount = async (page: Page, numOfGuestDiff: number, guestType: string) => {
    let increaseCountButtonIdentifier = "GuestPicker-book_it-form-guestTypePlaceHolder-stepper-increase-button";
    let decreaseCountButtonIdentifier = "GuestPicker-book_it-form-guestTypePlaceHolder-stepper-decrease-button";
    increaseCountButtonIdentifier = increaseCountButtonIdentifier.replace("guestTypePlaceHolder", guestType);
    decreaseCountButtonIdentifier = decreaseCountButtonIdentifier.replace("guestTypePlaceHolder", guestType);

    if (numOfGuestDiff > 0) {
        await increaseGuestsOfSpecificType(page, increaseCountButtonIdentifier, numOfGuestDiff);
    } else if (numOfGuestDiff < 0) {
        await decreaseGuestsOfSpecificType(page, decreaseCountButtonIdentifier, numOfGuestDiff);
    }
};

const increaseGuestsOfSpecificType = async (page: Page, locator: string, numOfGuestsDiff: number) => {
    for (let i = 1 ; i <= numOfGuestsDiff ; ++i) {
        await page.getByTestId(locator).click();
    }
};

const decreaseGuestsOfSpecificType = async (page: Page, locator: string, numOfGuestsDiff: number) => {
    for (let i = 1 ; i <= numOfGuestsDiff ; ++i) {
        await page.getByTestId(locator).click();
    }
};

const changeBookingDates = async (page: Page, originalCheckInDate: Date, originalCheckOutDate: Date,
    updatedCheckInDate: Date, updatedCheckOutDate: Date
) => {
    const bookingDetailsElement = page.getByTestId("book-it-default");
    await bookingDetailsElement.locator(`button[aria-label^="Change dates"]`).click();

    const availabilityCalendar = bookingDetailsElement.getByTestId("bookit-sidebar-availability-calendar");
    
    // await bookingDetailsElement.locator("input[id=\"checkIn-book_it\"]").click();
    const possibleToUpdateCheckInDate = await handleDates.tryToUpdateDate(availabilityCalendar, updatedCheckInDate);

    let possibleToUpdateCheckOutDate: boolean;
    if (possibleToUpdateCheckInDate) {
        // await bookingDetailsElement.locator(`button[aria-label^="Change dates"]`).click();
        await bookingDetailsElement.locator("input[id=\"checkOut-book_it\"]").click();
        possibleToUpdateCheckOutDate = await handleDates.tryToUpdateDate(availabilityCalendar, updatedCheckOutDate);

        if (possibleToUpdateCheckOutDate) {
            await bookingDetailsElement.getByTestId("availability-calendar-save").click();
        }
    }

    if (!possibleToUpdateCheckInDate || !possibleToUpdateCheckOutDate) {
        await bookingDetailsElement.getByText("Clear dates").click();

        await bookingDetailsElement.locator("input[id=\"checkIn-book_it\"]").click();
        await handleDates.selectDate(availabilityCalendar, originalCheckInDate);
        
        await bookingDetailsElement.locator("input[id=\"checkOut-book_it\"]").click();
        await handleDates.selectDate(availabilityCalendar, originalCheckOutDate);
    }
};

const reserveBooking = async (page: Page) => {
    await page.locator("[data-section-id=\"BOOK_IT_SIDEBAR\"]").getByTestId("book-it-default")
        .getByTestId("homes-pdp-cta-btn").getByText("Reserve").click();
};

export default {
    validateListingPageFinishedLoading,
    confirmBookingDetails,    
    confirmBookingDates,
    confirmBookingGuests,
    adjustGuestsCount,
    changeBookingDates,
    reserveBooking,
}