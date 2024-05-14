import { Page, expect } from '@playwright/test';

const validateGuestsInReservationUrl = async (page: Page, numOfAdults: number, numOfChildren: number, 
    numOfInfants: number, numOfPets: number) => {
    const url = page.url();

    if (numOfAdults > 0) {
        await validateGuestTypeNumber(url, numOfAdults, "numberOfAdults=");
    }

    if (numOfChildren > 0) {
        await validateGuestTypeNumber(url, numOfChildren, "numberOfChildren=");
    }

    if (numOfInfants > 0) {
        await validateGuestTypeNumber(url, numOfInfants, "numberOfInfants=");
    }

    if (numOfPets > 0) {
        await validateGuestTypeNumber(url, numOfPets, "numberOfPets=");
    }
};

const validateGuestTypeNumber = async (text: string, numOfguests: number, subStrToLookFor: string) => {
    expect(text).toContain(subStrToLookFor.concat(numOfguests.toString()));
};

export default {
    validateGuestsInReservationUrl,
}