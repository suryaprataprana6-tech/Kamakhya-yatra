import { submitCancellationRequest, getCancellationsData, updateCancellationStatus, updateCancellationRefundStatus, updateCancellationAdminNotes } from "../src/app/admin/actions";
import { supabaseServer } from "../src/utils/supabaseServer";

async function testCancellationsIntegration() {
  console.log("=== STARTING CANCELLATIONS INTEGRATION VERIFICATION ===");

  const testBookingId = "KY-TEST-999";
  const testPhone = "9999988888";
  const testEmail = "test_cancel@example.com";
  
  // 1. Clear any existing test entries first to ensure a clean state
  console.log("\nCleaning up previous test cancellations with booking ID:", testBookingId);
  try {
    const { error: deleteError } = await supabaseServer
      .from("booking_cancellations")
      .delete()
      .eq("booking_id", testBookingId);
      
    if (deleteError) {
      console.warn("Could not delete existing records (likely table does not exist yet):", deleteError.message);
      console.log("\n[VERIFICATION NOTICE] If the table 'booking_cancellations' does not exist in the database, this test will fail as expected. You will need to execute frontend/supabase_cancellation_migration.sql in your Supabase SQL Editor first.");
    } else {
      console.log("✅ Cleanup done.");
    }
  } catch (err: any) {
    console.warn("Cleanup encountered an exception:", err.message);
  }

  // 2. Submit a new cancellation request
  console.log("\nTesting new cancellation request submission...");
  const submitRes = await submitCancellationRequest({
    bookingId: testBookingId,
    customerName: "Spiritual Pilgrim",
    phone: testPhone,
    email: testEmail,
    packageName: "Kamakhya Shakti Peeth Tour 3D2N",
    travelDate: "2026-09-10",
    cancellationReason: "Personal emergency at home.",
    refundPolicyAccepted: true
  });

  if (submitRes.success) {
    console.log(`✅ Cancellation request created successfully. Record ID: ${submitRes.id}`);
  } else {
    console.error("❌ Cancellation request creation failed:", submitRes.error);
    process.exit(1);
  }

  const recordId = Number(submitRes.id);

  // 3. Verify record was created in database
  console.log("\nQuerying cancellation record to verify fields...");
  const { data: record, error: dbError } = await supabaseServer
    .from("booking_cancellations")
    .select("*")
    .eq("id", recordId)
    .single();

  if (dbError || !record) {
    console.error("❌ Failed to query database for cancellation record:", dbError?.message);
    process.exit(1);
  }

  if (
    record.booking_id === testBookingId &&
    record.customer_name === "Spiritual Pilgrim" &&
    record.email === testEmail &&
    record.status === "Pending" &&
    record.refund_status === "Eligible"
  ) {
    console.log("✅ Database fields matches submitted values perfectly.");
  } else {
    console.error("❌ Database fields do not match submitted values. Found:", record);
    process.exit(1);
  }

  // 4. Test status update (should trigger SMTP email notification to the customer)
  console.log("\nTesting cancellation status change (triggers SMTP email)...");
  const statusRes = await updateCancellationStatus(recordId, "Under Review");
  if (statusRes.success) {
    const { data: updatedRecord } = await supabaseServer
      .from("booking_cancellations")
      .select("status")
      .eq("id", recordId)
      .single();
    if (updatedRecord && updatedRecord.status === "Under Review") {
      console.log("✅ Cancellation status successfully updated to 'Under Review'.");
    } else {
      console.error("❌ Cancellation status mismatch after update. Found:", updatedRecord);
      process.exit(1);
    }
  } else {
    console.error("❌ Cancellation status update failed:", statusRes.error);
    process.exit(1);
  }

  // 5. Test refund status update (should trigger SMTP email notification to the customer)
  console.log("\nTesting refund status change (triggers SMTP email)...");
  const refundRes = await updateCancellationRefundStatus(recordId, "Refund Initiated");
  if (refundRes.success) {
    const { data: updatedRecord } = await supabaseServer
      .from("booking_cancellations")
      .select("refund_status")
      .eq("id", recordId)
      .single();
    if (updatedRecord && updatedRecord.refund_status === "Refund Initiated") {
      console.log("✅ Refund status successfully updated to 'Refund Initiated'.");
    } else {
      console.error("❌ Refund status mismatch after update. Found:", updatedRecord);
      process.exit(1);
    }
  } else {
    console.error("❌ Refund status update failed:", refundRes.error);
    process.exit(1);
  }

  // 6. Test admin notes update
  console.log("\nTesting admin notes update...");
  const notesRes = await updateCancellationAdminNotes(recordId, "Customer contacted. Refund initiated through standard banking.");
  if (notesRes.success) {
    const { data: updatedRecord } = await supabaseServer
      .from("booking_cancellations")
      .select("admin_notes")
      .eq("id", recordId)
      .single();
    if (updatedRecord && updatedRecord.admin_notes === "Customer contacted. Refund initiated through standard banking.") {
      console.log("✅ Admin notes successfully saved in DB.");
    } else {
      console.error("❌ Admin notes mismatch after update. Found:", updatedRecord);
      process.exit(1);
    }
  } else {
    console.error("❌ Admin notes update failed:", notesRes.error);
    process.exit(1);
  }

  // 7. Test fetching all cancellations (dashboard query)
  console.log("\nTesting getCancellationsData (dashboard fetching)...");
  const dashboardRes = await getCancellationsData();
  if (dashboardRes.success && Array.isArray(dashboardRes.data)) {
    const matched = dashboardRes.data.some((c: any) => c.id === recordId);
    if (matched) {
      console.log(`✅ Dashboard data successfully fetched and verified! Total requests: ${dashboardRes.data.length}`);
    } else {
      console.error("❌ Could not find our test request in the dashboard data list.");
      process.exit(1);
    }
  } else {
    console.error("❌ getCancellationsData failed:", dashboardRes.error);
    process.exit(1);
  }

  // 8. Clean up test record
  console.log("\nCleaning up test cancellation record...");
  await supabaseServer.from("booking_cancellations").delete().eq("booking_id", testBookingId);
  console.log("✅ Cleanup done.");

  console.log("\n=== ALL CANCELLATIONS INTEGRATION CHECKS PASSED ===");
}

// Mock admin cookie session for testing server actions locally
process.env.ADMIN_PASSWORD = "kamakhya@2026";
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

testCancellationsIntegration().catch((err) => {
  console.error("Verification test crashed:", err);
  process.exit(1);
});
