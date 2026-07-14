import { submitInquiry, getLeadsData, updateLeadStatus } from "../src/app/admin/actions";
import { supabaseServer } from "../src/utils/supabaseServer";

async function testLeadsIntegration() {
  console.log("=== STARTING LEADS INTEGRATION VERIFICATION ===");

  const testPhone = "9876543210";
  const dummyPhoneShort = "1234567";
  const testName1 = "Test Pilgrim One";
  const testName2 = "Test Pilgrim One Updated";
  
  // 1. Verify Phone Number validation (too short)
  console.log("\nTesting validation for short phone number...");
  const validationRes = await submitInquiry({
    name: "Short Phone Customer",
    phone: dummyPhoneShort,
    package: "Short Phone Test",
    source: "test"
  });
  
  if (!validationRes.success && validationRes.error === "Phone number must be at least 10 digits.") {
    console.log("✅ Phone number length check successfully caught short input.");
  } else {
    console.error("❌ Failed short phone number validation. Result:", validationRes);
    process.exit(1);
  }

  // 2. Clear any existing test entries first to ensure clean state
  console.log("\nCleaning up previous test leads with phone:", testPhone);
  await supabaseServer.from("inquiries").delete().eq("phone", testPhone);
  await supabaseServer.from("inquiries").delete().eq("phone", "whatsapp"); // clean up whatsapp clicks
  console.log("✅ Cleanup done.");

  // 3. Test submitting a brand new lead
  console.log("\nTesting new lead insertion...");
  const insertRes = await submitInquiry({
    name: testName1,
    phone: testPhone,
    email: "test1@example.com",
    package: "Guwahati Temple Tour",
    date: "2026-08-15",
    guests: "4",
    message: "Needs deluxe rooms.",
    source: "booking_page",
    pageUrl: "http://localhost:3000/book",
    utmSource: "google",
    utmCampaign: "monsoon_sale"
  });

  if (insertRes.success && !insertRes.isUpdate) {
    console.log(`✅ Lead created successfully. ID: ${insertRes.id}`);
  } else {
    console.error("❌ Lead creation failed:", insertRes.error);
    process.exit(1);
  }

  // 4. Test duplicate inquiry within 30 minutes (must update instead of inserting a new record)
  console.log("\nTesting duplicate lead submission within 30 minutes...");
  const duplicateRes = await submitInquiry({
    name: testName2, // updated name
    phone: testPhone,
    email: "test1_updated@example.com", // updated email
    package: "Chaar Dhaam Yatra", // updated package
    date: "2026-08-20", // updated travel date
    guests: "5", // updated pax
    message: "Needs premium suites instead.", // updated message
    source: "package_page",
    pageUrl: "http://localhost:3000/tour/spiritual/chaar-dhaam-yatra",
    utmSource: "facebook",
    utmCampaign: "summer_sale"
  });

  if (duplicateRes.success && duplicateRes.isUpdate && duplicateRes.id === insertRes.id) {
    console.log(`✅ Duplicate inquiry successfully detected and updated. Lead ID ${duplicateRes.id} matched original.`);
  } else {
    console.error("❌ Duplicate inquiry check failed. Result:", duplicateRes);
    process.exit(1);
  }

  // 5. Test direct WhatsApp bypass validation
  console.log("\nTesting direct WhatsApp bypass validation...");
  const whatsappRes = await submitInquiry({
    name: "WhatsApp Click Lead",
    phone: "whatsapp",
    package: "Chaar Dhaam Yatra",
    source: "whatsapp_button",
    message: "User clicked direct WhatsApp link."
  });

  if (whatsappRes.success) {
    console.log(`✅ Direct WhatsApp lead created successfully (bypassed digit validation). ID: ${whatsappRes.id}`);
  } else {
    console.error("❌ Direct WhatsApp lead creation failed:", whatsappRes.error);
    process.exit(1);
  }

  // 6. Verify database reflects the updates correctly
  console.log("\nQuerying lead to verify database contents...");
  const { data: leadData, error: dbError } = await supabaseServer
    .from("inquiries")
    .select("*")
    .eq("id", insertRes.id)
    .single();

  if (dbError || !leadData) {
    console.error("❌ Failed to query database for lead:", dbError?.message);
    process.exit(1);
  }

  if (
    leadData.name === testName2 &&
    leadData.email === "test1_updated@example.com" &&
    leadData.package === "Chaar Dhaam Yatra" &&
    leadData.guests === "5" &&
    leadData.source === "package_page" &&
    leadData.utm_source === "facebook"
  ) {
    console.log("✅ Database fields matches updated values perfectly.");
  } else {
    console.error("❌ Database fields do not match updated values. Found:", leadData);
    process.exit(1);
  }

  // 7. Verify status change
  console.log("\nTesting lead status change...");
  const statusRes = await updateLeadStatus(Number(insertRes.id), "Contacted");
  if (statusRes.success) {
    const { data: updatedLead } = await supabaseServer
      .from("inquiries")
      .select("status")
      .eq("id", insertRes.id)
      .single();
    if (updatedLead && updatedLead.status === "Contacted") {
      console.log("✅ Lead status successfully updated to 'Contacted'.");
    } else {
      console.error("❌ Lead status mismatch in DB after update. Found:", updatedLead);
      process.exit(1);
    }
  } else {
    console.error("❌ Lead status update failed:", statusRes.error);
    process.exit(1);
  }

  // 8. Test metrics calculation
  console.log("\nTesting dashboard metrics calculations...");
  const dataRes = await getLeadsData();
  if (dataRes.success && dataRes.data) {
    const { metrics } = dataRes.data;
    console.log("✅ Metrics successfully computed:");
    console.log(`   - Total Leads: ${metrics.totalLeads}`);
    console.log(`   - Pending Leads: ${metrics.pendingLeads}`);
    console.log(`   - Contacted Leads: ${metrics.contactedLeads}`);
    console.log(`   - Resolved Leads: ${metrics.resolvedLeads}`);
    console.log(`   - Today's Leads: ${metrics.todayLeads}`);
    console.log(`   - This Month's Leads: ${metrics.thisMonthLeads}`);
  } else {
    console.error("❌ Failed to query dashboard leads data:", dataRes.error);
    process.exit(1);
  }

  // 9. Clean up test entries
  console.log("\nCleaning up test leads...");
  await supabaseServer.from("inquiries").delete().eq("phone", testPhone);
  await supabaseServer.from("inquiries").delete().eq("phone", "whatsapp");
  console.log("✅ Cleanup done.");

  console.log("\n=== ALL LEADS INTEGRATION CHECKS PASSED ===");
}

// Mock admin cookie session for testing server actions locally
process.env.ADMIN_PASSWORD = "[YAHAN APNA STRONG PASSWORD LIKHO]";
// We need to bypass the admin check inside actions by mocking the cookies.get.
// Since we are running in tsx, let's mock the Next.js cookies module.
jestLikeMock();

function jestLikeMock() {
  const nextHeaders = require("next/headers");
  const originalCookies = nextHeaders.cookies;
  nextHeaders.cookies = async function() {
    return {
      get: (name: string) => {
        if (name === "admin_session") {
          return { value: "authenticated" };
        }
        return null;
      }
    };
  };
}

testLeadsIntegration().catch((err) => {
  console.error("Verification test crashed:", err);
  process.exit(1);
});
