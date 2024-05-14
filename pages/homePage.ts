import { Page } from '@playwright/test';
import convertDateToString from '../helpers/convertDateToString';
import handleDates from '../helpers/handleDates';
// import popUps from './popUps';

const searchForAStay = async (page: Page, destination: string, 
    checkInDate: Date, checkOutDate: Date, 
    numOfAdults: number, numOfChildren: number,
    numOfInfants: number, numOfPets: number
) => {
    await enterDestination(page, destination);

    await enterCheckInDate(page, checkInDate);

    await enterCheckOutDate(page, checkOutDate);

    await enterGuests(page, numOfAdults, numOfChildren, numOfInfants, numOfPets);

    await clickSearchButton(page);
};

const enterDestination = async (page: Page, destination: string) => {
    await page.getByPlaceholder("Search destinations").fill(destination);
};

const enterCheckInDate = async (page: Page, checkInDate: Date) => {
    await page.getByTestId("structured-search-input-field-split-dates-0")
        .filter({ hasText: "Check in"}).getByText("Add dates").click();

        const datesPanel = page.getByTestId("structured-search-input-field-dates-panel");
        await handleDates.selectDate(datesPanel, checkInDate);
};

const enterCheckOutDate = async (page: Page, checkOutDate: Date) => {
    if (await page.getByTestId("expanded-searchbar-dates-calendar-tab").isHidden()) {
        await page.getByTestId("structured-search-input-field-split-dates-1")
            .filter({ hasText: "Check out"}).getByText("Add dates").click();
    }

    const datesPanel = page.getByTestId("structured-search-input-field-dates-panel");
    await handleDates.selectDate(datesPanel, checkOutDate);
};

const enterGuests = async (page: Page, numOfAdults: number, numOfChildren: number,
    numOfInfants: number, numOfPets: number
) => {
    await page.getByTestId("structured-search-input-field-guests-button").click();

    await addGuestsOfSpecificType(page, numOfAdults, "adults");
    
    await addGuestsOfSpecificType(page, numOfChildren, "children");
        
    await addGuestsOfSpecificType(page, numOfInfants, "infants");
        
    await addGuestsOfSpecificType(page, numOfPets, "pets");    
};

const addGuestsOfSpecificType = async (page: Page, numOfGuests: number, guestType: string) => {
    let buttonIdentifier = "stepper-guestTypePlaceHolder-increase-button";
    buttonIdentifier = buttonIdentifier.replace("guestTypePlaceHolder", guestType);
    for (let i = 1 ; i <= numOfGuests ; ++i) {
        // await popUps.checkForPopUpInHomePageAndDismissIfExists(page);
        await reOpenAddGuestsSection(page, buttonIdentifier);
        await page.getByTestId(buttonIdentifier).click();
    }
};

// in case there is a pop-up ad modal, dismissing it will cause the "add guests" section to become closed
const reOpenAddGuestsSection = async (page: Page, locator: string) => {
    if (await page.getByTestId(`${locator}`).isHidden()) {
        await page.getByTestId("structured-search-input-field-guests-button").click();
    }
};

const clickSearchButton = async (page: Page) => {
    await page.getByTestId("structured-search-input-search-button").click();
};

export default {
    enterDestination,
    enterCheckInDate,
    enterCheckOutDate,
    enterGuests,
    clickSearchButton,
    searchForAStay
}
