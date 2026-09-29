import { submitPopupInquiry, syncLeadToGoogleSheets } from "../src/app/admin/actions";
import { supabaseServer } from "../src/utils/supabaseServer";

async function runInquiryPopupTests() {
  console.log("==================================================");
  console.log("   KAMAKHYA YATRA — INQUIRY POPUP VERIFICATION");
  console.log("==================================================");

  const testPhone = "9876543299";
  const testEmail = "testyatra@example.com";
  const testName = "Test Pilgrim Sharma";

  // Clean up any old test record with testPhone
  try {
    await supabaseServer.from("inquiries").delete().eq("phone", testPhone);
    console.log("✅ Cleaned up old test records.");
  } catch (e) {
    console.log("Cleanup notice:", e);
  }

  // TEST 1: Validation - Empty Name
  console.log("\n[Test 1] Testing Validation: Empty Name");
  const resEmptyName = await submitPopupInquiry({
    name: " ",
    mobile: testPhone,
    email: testEmail,
  });
  if (!resEmptyName.success && resEmptyName.error === "Please enter your name.") {
    console.log("✅ Caught empty name correctly:", resEmptyName.error);
  } else {
    console.error("❌ Failed empty name test:", resEmptyName);
    process.exit(1);
  }

  // TEST 2: Validation - Invalid Indian Phone (less than 10 digits)
  console.log("\n[Test 2] Testing Validation: Short Phone");
  const resShortPhone = await submitPopupInquiry({
    name: testName,
    mobile: "98765",
    email: testEmail,
  });
  if (!resShortPhone.success && resShortPhone.error?.includes("10-digit Indian mobile number")) {
    console.log("✅ Caught short mobile number correctly:", resShortPhone.error);
  } else {
    console.error("❌ Failed short phone test:", resShortPhone);
    process.exit(1);
  }

  // TEST 3: Validation - Invalid Phone Starting Digit (doesn't start with 6-9)
  console.log("\n[Test 3] Testing Validation: Phone starting with invalid digit (e.g. 2)");
  const resInvalidStart = await submitPopupInquiry({
    name: testName,
    mobile: "2345678901",
    email: testEmail,
  });
  if (!resInvalidStart.success && resInvalidStart.error?.includes("10-digit Indian mobile number")) {
    console.log("✅ Caught invalid Indian phone prefix correctly:", resInvalidStart.error);
  } else {
    console.error("❌ Failed invalid prefix test:", resInvalidStart);
    process.exit(1);
  }

  // TEST 4: Validation - Invalid Email
  console.log("\n[Test 4] Testing Validation: Malformed Email");
  const resBadEmail = await submitPopupInquiry({
    name: testName,
    mobile: testPhone,
    email: "not-an-email",
  });
  if (!resBadEmail.success && resBadEmail.error?.includes("valid email address")) {
    console.log("✅ Caught invalid email correctly:", resBadEmail.error);
  } else {
    console.error("❌ Failed bad email test:", resBadEmail);
    process.exit(1);
  }

  // TEST 5: Anti-spam Honeypot Check
  console.log("\n[Test 5] Testing Anti-Spam Honeypot");
  const resSpam = await submitPopupInquiry({
    name: "Spam Bot",
    mobile: testPhone,
    email: testEmail,
    honeypot: "http://spamlink.com",
  });
  if (resSpam.success && !resSpam.isDuplicate) {
    // Honeypot returns success to bot without saving
    const { data: spamCheck } = await supabaseServer.from("inquiries").select("id").eq("phone", testPhone);
    if (!spamCheck || spamCheck.length === 0) {
      console.log("✅ Honeypot caught spam bot: returned success silently without inserting into DB.");
    } else {
      console.error("❌ Honeypot allowed spam into database!");
      process.exit(1);
    }
  } else {
    console.error("❌ Honeypot test failed:", resSpam);
    process.exit(1);
  }

  // TEST 6: Successful Inquiry Submission
  console.log("\n[Test 6] Submitting Valid Inquiry Lead");
  const resValid = await submitPopupInquiry({
    name: testName,
    mobile: "+91 " + testPhone, // Test country code stripping
    email: testEmail,
    pageUrl: "http://localhost:3000/tour/spiritual/chaar-dhaam-yatra",
    pageTitle: "Char Dham Yatra Package",
    tourPackage: "Char Dham Yatra",
    source: "Website Popup",
  });

  if (resValid.success && !resValid.isDuplicate) {
    console.log("✅ Valid lead submitted successfully! Message:", resValid.message);
  } else {
    console.error("❌ Valid lead submission failed:", resValid);
    process.exit(1);
  }

  // Verify in Supabase
  const { data: dbRecord } = await supabaseServer
    .from("inquiries")
    .select("*")
    .eq("phone", testPhone)
    .single();

  if (dbRecord && dbRecord.name === testName && dbRecord.phone === testPhone) {
    console.log(`✅ Lead verified in Supabase inquiries table! ID: ${dbRecord.id}, Status: ${dbRecord.status}`);
  } else {
    console.error("❌ Could not find inserted lead in Supabase:", dbRecord);
    process.exit(1);
  }

  // TEST 7: Duplicate Protection within 30 Minutes
  console.log("\n[Test 7] Testing Duplicate Protection (Within 30 min)");
  const resDuplicate = await submitPopupInquiry({
    name: testName + " Duplicate",
    mobile: testPhone,
    email: testEmail,
    pageUrl: "http://localhost:3000/tour/spiritual/chaar-dhaam-yatra",
    pageTitle: "Char Dham Yatra Package",
    tourPackage: "Char Dham Yatra",
    source: "Website Popup",
  });

  if (resDuplicate.success && resDuplicate.isDuplicate) {
    console.log("✅ Duplicate inquiry recognized! Friendly response:", resDuplicate.message);
  } else {
    console.error("❌ Duplicate protection test failed:", resDuplicate);
    process.exit(1);
  }

  // TEST 8: Google Sheets sync fallback test
  console.log("\n[Test 8] Testing Google Sheets sync without env variable (graceful skip)");
  const syncRes = await syncLeadToGoogleSheets({
    name: testName,
    mobile: testPhone,
    email: testEmail,
  });
  if (syncRes.success && syncRes.skipped) {
    console.log("✅ Google Sheets sync handles unconfigured webhook gracefully without error.");
  } else {
    console.log("ℹ️ Google Sheets sync response:", syncRes);
  }

  // Clean up test record
  await supabaseServer.from("inquiries").delete().eq("phone", testPhone);
  console.log("\n✅ Cleaned up test records after verification.");

  console.log("\n==================================================");
  console.log("🎉 ALL INQUIRY POPUP BACKEND TESTS PASSED!");
  console.log("==================================================");
}

runInquiryPopupTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
