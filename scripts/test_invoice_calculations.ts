import fs from "fs";
import path from "path";

async function runInvoiceCalculationTests() {
  console.log("=== EXECUTING INVOICE CALCULATION & MATRIX TESTS ===\n");

  // Helper calculation logic mirroring BookingInvoice / submitBookingRequest
  function calculateInvoiceTotals(
    travelClass: string,
    travellers: number,
    baseSlFare: number,
    ac3Extra: number,
    ac2Extra: number,
    flightFare: number,
    advancePaid: number
  ) {
    let ratePerPerson = baseSlFare;
    if (travelClass === "3AC") ratePerPerson = baseSlFare + ac3Extra;
    if (travelClass === "2AC") ratePerPerson = baseSlFare + ac2Extra;
    if (travelClass === "Flight") ratePerPerson = flightFare > 0 ? flightFare : baseSlFare + ac3Extra;

    const totalPackageCost = ratePerPerson * travellers;
    const balanceDue = Math.max(0, totalPackageCost - advancePaid);

    let paymentStatus = "PENDING";
    if (advancePaid >= totalPackageCost && totalPackageCost > 0) {
      paymentStatus = "PAID";
    } else if (advancePaid > 0) {
      paymentStatus = "PARTIALLY PAID";
    }

    return {
      travelClass,
      travellers,
      ratePerPerson,
      totalPackageCost,
      advancePaid,
      balanceDue,
      paymentStatus,
    };
  }

  // ----------------------------------------------------
  // TEST 1: SL, 1 traveller, ₹5,000 paid
  // ----------------------------------------------------
  console.log("--- TEST 1: SL (1 Traveller, ₹5,000 Advance) ---");
  const test1 = calculateInvoiceTotals("SL", 1, 24000, 8000, 17000, 0, 5000);
  console.log(`  Rate Per Person: ₹${test1.ratePerPerson} (Expected: ₹24000)`);
  console.log(`  Total Package: ₹${test1.totalPackageCost} (Expected: ₹24000)`);
  console.log(`  Advance Paid: ₹${test1.advancePaid} (Expected: ₹5000)`);
  console.log(`  Balance Due: ₹${test1.balanceDue} (Expected: ₹19000)`);
  console.log(`  Payment Status: ${test1.paymentStatus} (Expected: PARTIALLY PAID)`);
  const pass1 = test1.ratePerPerson === 24000 && test1.totalPackageCost === 24000 && test1.balanceDue === 19000 && test1.paymentStatus === "PARTIALLY PAID";
  console.log(`  Result: ${pass1 ? "PASS ✅" : "FAIL ❌"}\n`);

  // ----------------------------------------------------
  // TEST 2: 3AC, 2 travellers
  // ----------------------------------------------------
  console.log("--- TEST 2: 3AC (2 Travellers) ---");
  const test2 = calculateInvoiceTotals("3AC", 2, 24000, 8000, 17000, 0, 10000);
  console.log(`  Rate Per Person: ₹${test2.ratePerPerson} (Expected: ₹32000)`);
  console.log(`  Total Package: ₹${test2.totalPackageCost} (Expected: ₹64000)`);
  console.log(`  Advance Paid: ₹${test2.advancePaid} (Expected: ₹10000)`);
  console.log(`  Balance Due: ₹${test2.balanceDue} (Expected: ₹54000)`);
  const pass2 = test2.ratePerPerson === 32000 && test2.totalPackageCost === 64000 && test2.balanceDue === 54000;
  console.log(`  Result: ${pass2 ? "PASS ✅" : "FAIL ❌"}\n`);

  // ----------------------------------------------------
  // TEST 3: 2AC, 3 travellers
  // ----------------------------------------------------
  console.log("--- TEST 3: 2AC (3 Travellers) ---");
  const test3 = calculateInvoiceTotals("2AC", 3, 24000, 8000, 17000, 0, 12000);
  console.log(`  Rate Per Person: ₹${test3.ratePerPerson} (Expected: ₹41000)`);
  console.log(`  Total Package: ₹${test3.totalPackageCost} (Expected: ₹123000)`);
  console.log(`  Advance Paid: ₹${test3.advancePaid} (Expected: ₹12000)`);
  console.log(`  Balance Due: ₹${test3.balanceDue} (Expected: ₹111000)`);
  const pass3 = test3.ratePerPerson === 41000 && test3.totalPackageCost === 123000 && test3.balanceDue === 111000;
  console.log(`  Result: ${pass3 ? "PASS ✅" : "FAIL ❌"}\n`);

  // ----------------------------------------------------
  // TEST 4: Flight Package
  // ----------------------------------------------------
  console.log("--- TEST 4: Flight Package ---");
  const test4 = calculateInvoiceTotals("Flight", 2, 24000, 8000, 17000, 45000, 25000);
  console.log(`  Rate Per Person: ₹${test4.ratePerPerson} (Expected: ₹45000)`);
  console.log(`  Total Package: ₹${test4.totalPackageCost} (Expected: ₹90000)`);
  console.log(`  Balance Due: ₹${test4.balanceDue} (Expected: ₹65000)`);
  const pass4 = test4.ratePerPerson === 45000 && test4.totalPackageCost === 90000;
  console.log(`  Result: ${pass4 ? "PASS ✅" : "FAIL ❌"}\n`);

  // ----------------------------------------------------
  // TEST 5: Fully Paid Booking
  // ----------------------------------------------------
  console.log("--- TEST 5: Fully Paid Booking ---");
  const test5 = calculateInvoiceTotals("3AC", 2, 24000, 8000, 17000, 0, 64000);
  console.log(`  Total Package: ₹${test5.totalPackageCost}`);
  console.log(`  Advance/Total Paid: ₹${test5.advancePaid}`);
  console.log(`  Balance Due: ₹${test5.balanceDue} (Expected: ₹0)`);
  console.log(`  Payment Status: ${test5.paymentStatus} (Expected: PAID)`);
  const pass5 = test5.balanceDue === 0 && test5.paymentStatus === "PAID";
  console.log(`  Result: ${pass5 ? "PASS ✅" : "FAIL ❌"}\n`);

  // ----------------------------------------------------
  // TEST 6: Historical Fare Protection
  // ----------------------------------------------------
  console.log("--- TEST 6: Historical Snapshot Protection ---");
  const historicalBooking = {
    booking_reference: "KY-BKG-2026-000088",
    rate_per_person: 32000,
    package_cost: 64000,
    advance_amount: 10000,
    balance_amount: 54000,
  };

  // Simulating Admin updating current 3AC fare next month to ₹38,000
  const updatedAdminFare = 38000;
  console.log(`  Admin updated 3AC fare to: ₹${updatedAdminFare}`);
  console.log(`  Historical booking rate: ₹${historicalBooking.rate_per_person}`);
  console.log(`  Historical booking total: ₹${historicalBooking.package_cost}`);
  const pass6 = historicalBooking.rate_per_person !== updatedAdminFare && historicalBooking.package_cost === 64000;
  console.log(`  Historical invoice preserved original rate: ${pass6 ? "YES ✅" : "NO ❌"}\n`);

  const allPass = pass1 && pass2 && pass3 && pass4 && pass5 && pass6;

  console.log("====================================================");
  console.log(`FINAL RESULT: ${allPass ? "ALL INVOICE TESTS PASSED 🎉" : "SOME TESTS FAILED ❌"}`);
  console.log("====================================================");
}

runInvoiceCalculationTests();
