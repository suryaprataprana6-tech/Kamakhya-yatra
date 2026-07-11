interface InquiryData {
  name: string;
  phone: string;
  package?: string;
  date?: string;
  guests?: string;
  email?: string;
  message?: string;
}

/**
 * Utility to format and open a pre-filled WhatsApp message for lead inquiries.
 * It opens WhatsApp in a new tab to initiate a chat with the company's WhatsApp number.
 */
export function sendInquiryToWhatsApp(data: InquiryData) {
  let text = `New Inquiry - Kamakhya Yatra\n`;
  text += `Name: ${data.name.trim()}\n`;
  text += `Phone: ${data.phone.trim()}\n`;

  if (data.package) {
    text += `Interested Package: ${data.package.trim()}\n`;
  }
  if (data.date) {
    text += `Preferred Travel Date: ${data.date.trim()}\n`;
  }
  if (data.guests) {
    text += `Number of Guests: ${data.guests.trim()}\n`;
  }
  if (data.email) {
    text += `Email: ${data.email.trim()}\n`;
  }
  if (data.message) {
    text += `Message/Details: ${data.message.trim()}\n`;
  }

  const whatsappUrl = `https://wa.me/917079044000?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, "_blank");
}
