import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const cleanLine = line.replace("\r", "").trim();
      const parts = cleanLine.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join("=").trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (key && !key.startsWith("#")) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {}

async function runOnlineRegressionTest() {
  console.log("=== EXECUTING ONLINE REGRESSION TEST ===");

  const { submitCancellationRequest, verifyBookingForCancellation } = await import("../src/app/admin/actions");

  // Create a dummy File object for invoice attachment
  const dummyBuffer = Buffer.from("Dummy Online Invoice Content");
  const dummyBlob = new Blob([dummyBuffer], { type: "application/pdf" });
  const dummyFile = new File([dummyBlob], "Online_Invoice_Test.pdf", { type: "application/pdf" });

  console.log("\n1. Testing online verification with invalid booking ID...");
  const fakeRes = await verifyBookingForCancellation("INVALID-BKG-9999", "9999999999");
  if (!fakeRes.success) {
    console.log("✅ Fake online booking correctly rejected:", fakeRes.error);
  } else {
    console.error("❌ Fake online booking was unexpectedly accepted!");
    process.exit(1);
  }

  console.log("\n2. Testing online cancellation submission with unverified/invalid booking ID...");
  const submitFakeRes = await submitCancellationRequest({
    bookingSource: "online",
    bookingId: "INVALID-BKG-9999",
    phone: "9999999999",
    cancellationReason: "Testing invalid online booking",
    refundPolicyAccepted: true,
    invoiceFile: dummyFile,
  });

  if (!submitFakeRes.success) {
    console.log("✅ Online cancellation submission with invalid ID correctly failed:", submitFakeRes.error);
  } else {
    console.error("❌ Online cancellation submission with invalid ID unexpectedly succeeded!");
    process.exit(1);
  }

  console.log("\n🎉 ONLINE REGRESSION TEST PASSED PERFECTLY! Security checks for online bookings are fully intact.");
}

runOnlineRegressionTest();
