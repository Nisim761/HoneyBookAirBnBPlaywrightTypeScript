import { Page, expect } from '@playwright/test';
import convertDateToString from '../helpers/convertDateToString';

// interface Listing {
//     listing: Locator;
//     rating: number;
// }

const confirmSearchResults = async (page: Page, destination: string,
    checkInDate: Date, checkOutDate: Date, 
    numOfAdults: number, numOfChildren: number,
    numOfInfants: number, numOfPets: number
) => {
    await page.getByTestId("little-search-icon").click();

    const searchResultsDestination = await page.locator("[id=\"bigsearch-query-location-input\"]").getAttribute("value");
    expect(searchResultsDestination.toLocaleLowerCase()).toContain(destination.toLowerCase());

    const expectedCheckInMonth = convertDateToString.getShortMonthNameFromDate(checkInDate);
    const expectedcheckInDay = convertDateToString.getDayFromDate(checkInDate);
    const expectedCheckInDate = expectedCheckInMonth.concat(" ").concat(expectedcheckInDay);
    console.log("expectedCheckInMonth = " + expectedCheckInMonth);
    console.log("expectedcheckInDay = " + expectedcheckInDay);
    
    const searchResultsCheckInDate = await page.getByTestId("structured-search-input-field-split-dates-0").textContent();
    expect(searchResultsCheckInDate).toContain(expectedCheckInDate);

    const expectedCheckOutMonth = convertDateToString.getShortMonthNameFromDate(checkOutDate);
    const expectedcheckOutDay = convertDateToString.getDayFromDate(checkOutDate);
    console.log("expectedCheckOutMonth = " + expectedCheckOutMonth);
    console.log("expectedcheckOutDay = " + expectedcheckOutDay);
    const expectedCheckOutDate = expectedCheckOutMonth.concat(" ").concat(expectedcheckOutDay);

    const searchResultsCheckOutDate = await page.getByTestId("structured-search-input-field-split-dates-1").textContent();
    expect(searchResultsCheckOutDate).toContain(expectedCheckOutDate);

    const guestsList = page.getByTestId("structured-search-input-field-guests-button");
    await guestsList.click();

    const searchResultsAdultsNumber = await page.getByTestId("stepper-adults-value").textContent();
    expect(searchResultsAdultsNumber).toEqual(numOfAdults.toString());

    const searchResultsChildrenNumber = await page.getByTestId("stepper-children-value").textContent();
    expect(searchResultsChildrenNumber).toEqual(numOfChildren.toString());

    const searchResultsInfantsNumber = await page.getByTestId("stepper-infants-value").textContent();
    expect(searchResultsInfantsNumber).toEqual(numOfInfants.toString());

    const searchResultsPetsNumber = await page.getByTestId("stepper-pets-value").textContent();
    expect(searchResultsPetsNumber).toEqual(numOfPets.toString());

    await guestsList.click();

    await page.getByTestId("structured-search-input-search-button").click();
};

const selectHighestRatedListing = async (page: Page) => {
    // click on first listing

    const main = page.getByRole("main");
    const firstCard = main.getByTestId("card-container").filter({ hasText: "average rating"}).first();
    await firstCard.getByTestId("listing-card-subtitle").first().click({ force: true} );

    const listingName = await firstCard.getByTestId("listing-card-name").textContent();
    let listindId = await firstCard.getAttribute("aria-labelledby");
    listindId = listindId!.replace("title_", "");

    return  [listingName, listindId];

    /*
    // all listing, including those that are in the "available for similar dates" section
    const allCardContainers = await main.getByTestId("card-container").filter({ hasText: "average rating"}).all();
    // only listings in the "available for similar dates" section
    const similarDatesCardContainers = await main.locator("[aria-describedby=\"carousel-description\"]")
        .getByTestId("card-container").filter({ hasText: "average rating"}).all();
    // take into account only listings with rating, ignoring listings with "new" indication
    
    const allListingsArray = await Promise.all(allCardContainers);
    console.log("allListingsArray.length = " + allListingsArray.length);
    // const allListingsMap = new Map();
    // allListingsArray.forEach(async (card) => {
    //     const listingName = await card.getByTestId("listing-card-subtitle").getByTestId("listing-card-name").first().textContent();
    //     console.log("listing card name of all listings array: " + listingName);
    //     allListingsMap.set(listingName, card);
    // });
    // console.log("allListingsMap.size = " + allListingsMap.size);

    const similarDatesCardsArray = await Promise.all(similarDatesCardContainers);
    console.log("similarDatesCardsArray.length = " + similarDatesCardsArray.length);
    // const SimilarDatesListingsMap = new Map();
    // similarDatesCardsArray.forEach(async (card) => {
    //     const listingName = await card.getByTestId("listing-card-subtitle").getByTestId("listing-card-name").first().textContent();
    //     console.log("listing card name of similar dates listings array: " + listingName);
    //     SimilarDatesListingsMap.set(listingName, card);
    // });
    // console.log("SimilarDatesListingsMap.size = " + SimilarDatesListingsMap.size);

    // remove listings that are part of the "available for similar dates" section
    // for (const key in SimilarDatesListingsMap.keys()) {
    //     allListingsMap.delete(key);
    // }
    // allListingsMap.keys().removeAll(SimilarDatesListingsMap.keys());
    // SimilarDatesListingsMap.forEach((_, key) => {
    //     allListingsMap.delete(key);
    // });
    // console.log("allListingsMap.length = " + allListingsMap.size);

    // const allListingsSet = new Set(await Promise.all(allListingsArray));
    // const similarDatesCardsSet = new Set(await Promise.all(similarDatesCardsArray));
    // allListingsSet.forEach(item => {
    //     if (similarDatesCardsSet.has(item)) {
    //         allListingsSet.delete(item);
    //     }
    // });

    // allListingsArray = Array.from(allListingsSet);

    // allListingsArray = await Promise.all(allListingsArray.filter(async (itemPromise) => {
    //     const item = itemPromise;
    //     return !similarDatesCardsArray.some(async (removeItemPromise) => {
    //         const removeItem = removeItemPromise;
    //         return item === removeItem;
    //     });
    // }));

    let filteredListings = new Array();
    for (let allListingsIndex = 0 ; allListingsIndex < allListingsArray.length ; ++allListingsIndex) {
        const allListingsCardName = await allListingsArray[allListingsIndex].getByTestId("listing-card-subtitle").getByTestId("listing-card-name").first().textContent();

        let found = false;
        for (let similarDatesIndex = 0 ; similarDatesIndex < similarDatesCardsArray.length ; ++similarDatesIndex) {
            const similarDatesListingName = await similarDatesCardsArray[similarDatesIndex].getByTestId("listing-card-subtitle").getByTestId("listing-card-name").first().textContent();

            if (similarDatesListingName === allListingsCardName) {
                found = true;
                break;
            }
        }

        if (!found) {
            filteredListings.push(allListingsArray[allListingsIndex]);
        }
    }




    // // for (const similarDatesCard of similarDatesCardsArray) {
    // for (let similarDatesIndex = 0 ; similarDatesIndex < similarDatesCardsArray.length ; ++similarDatesIndex) {
    //         const similarDatesListingName = await similarDatesCardsArray[similarDatesIndex].getByTestId("listing-card-subtitle").getByTestId("listing-card-name").first().textContent();

    //     // for (const allListingsCard of allListingsArray) {
    //     for (let allListingsIndex = 0 ; allListingsIndex < allListingsArray.length ; ++allListingsIndex) {
    //         const allListingsCardName = await allListingsArray[allListingsIndex].getByTestId("listing-card-subtitle").getByTestId("listing-card-name").first().textContent();

    //         if (similarDatesListingName !== allListingsCardName) {
    //             console.log("found a unique card name = " + similarDatesListingName);
    //             filteredListings.push(allListingsArray[allListingsIndex]);
    //             // allListingsArray.splice(allListingsIndex, 1);
    //         }
    //     }
    // }

    console.log("filteredListings.length = " + filteredListings.length);

    // const listingsMap = new Map();
    // allListingsMap.forEach(async (_, key) => {
    //     let rating = await key.locator(':has-text("average rating")').first().textContent();
    //     rating = rating?.split(" ")[0]!;
    //     console.log("!!!!! rating = " + rating);
    //     listingsMap.set(rating, key);
    // });
    // console.log("listingsMap.length = " + listingsMap.size);

    // const sortedListingsArray = Array.from(allListingsMap);
    // sortedListingsArray.sort((a, b) => b[1] - a[1]);

    // console.log("sortedListingsArray top rating - " + sortedListingsArray[0][1])
    */
};

export default {
    confirmSearchResults,
    selectHighestRatedListing,
}