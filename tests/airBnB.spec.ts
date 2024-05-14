import { test } from '@playwright/test';
import homePage from '../pages/homePage';
import resultsPage from '../pages/resultsPage';
import listingPage from '../pages/listingPage';
import confirmationPage from '../pages/confirmationPage';
import calculateDateWithOffset from '../helpers/calculateDateWithOffset';

const homepage = "https://www.airbnb.com";

test('Search for a stay, confirm booking, reserve and validate', async ({ page }) => {
  await page.goto(homepage);

  // auto-dismiss 3 types of pop-ups (in home page, in results page and in listing page)
  page.on('dialog', async dialog => {
    // if (null !== await page.waitForSelector('button[aria-label=\"Close\"]')) {
    // if (await page.locator('[aria-labelledby=\"announcement-curtain\"]').isVisible()) {
      if (null !== await page.waitForSelector('[aria-labelledby=\"announcement-curtain\"]')) {
      await page.locator("button[aria-label=\"Close\"]").click();
    }
  });
  // page.on('dialog', async dialog => await page.locator("button[aria-label=\"Close\"]").click());
  // page.on('dialog', async dialog => {
  //   await page.waitForSelector('button[aria-label=\"Close\"]');
  //   await page.locator("button[aria-label=\"Close\"]").click();
  // });
  // await popUps.autoDismissPopUpModal(page);

  const destination = "rio de janeiro";
  const today = new Date();
  const checkInDate = calculateDateWithOffset.calculateDateWithOffsetFromGivenDate(today, 1);
  const checkOutDate = calculateDateWithOffset.calculateDateWithOffsetFromGivenDate(today, 2);
  const numOfAdults = 2;
  const numOfChildren = 1;
  const numOfInfants = 0;
  const numOfPets = 0;

  // Search for a Stay
  await homePage.searchForAStay(page, destination, checkInDate, 
    checkOutDate, numOfAdults, numOfChildren, numOfInfants, numOfPets);

  await resultsPage.confirmSearchResults(page, destination, checkInDate, 
    checkOutDate, numOfAdults, numOfChildren, numOfInfants, numOfPets);

  // Select a Listing
  const listingPageInfo = await resultsPage.selectHighestRatedListing(page);

  const context = page.context();
  const pages = context.pages();
  const listingPageObj = pages[1];
  
  await listingPage.validateListingPageFinishedLoading(listingPageObj, listingPageInfo);

  // Confirm Booking Details
  await listingPage.confirmBookingDetails(listingPageObj, checkInDate, 
    checkOutDate, numOfAdults, numOfChildren, numOfInfants, numOfPets);

  // Adjust and Verify Guest Count
  const updatedNumOfChildren = 0;
  const numOfChildrenDiff = updatedNumOfChildren - numOfChildren;
  await listingPage.adjustGuestsCount(listingPageObj, 0, numOfChildrenDiff, 0, 0);

  // Change Booking Dates
  const updatedCheckInDate = calculateDateWithOffset.calculateDateWithOffsetFromGivenDate(today, 7);
  const updatedCheckOutDate = calculateDateWithOffset.calculateDateWithOffsetFromGivenDate(today, 8);
  await listingPage.changeBookingDates(listingPageObj, checkInDate, checkOutDate, 
    updatedCheckInDate, updatedCheckOutDate);

  // Reserve and Validate
  await listingPage.reserveBooking(listingPageObj);

  await confirmationPage.validateGuestsInReservationUrl(listingPageObj, numOfAdults, 
    numOfChildrenDiff, numOfInfants, numOfPets);
});
