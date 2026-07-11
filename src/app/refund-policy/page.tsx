import type { Metadata } from "next";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, ClipboardList, Info, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Kamakhya Yatra",
  description: "Read the refund, cancellation, and tour postponement guidelines of Kamakhya Yatra.",
  alternates: {
    canonical: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  const policies = [
    {
      num: "01",
      enTitle: "Advance Booking Commitment",
      hiTitle: "अग्रिम बुकिंग प्रतिबद्धता",
      enText: "Kamakhya Yatra makes advance bookings for transportation, flights, trains, hotels, cabs, local sightseeing, permits and other travel-related services on behalf of customers.",
      hiText: "कामाख्या यात्रा ग्राहकों की ओर से परिवहन, उड़ानों, ट्रेनों, होटलों, कैब, स्थानीय दर्शनीय स्थलों, परमिट और अन्य यात्रा से संबंधित सेवाओं के लिए अग्रिम बुकिंग करती है।"
    },
    {
      num: "02",
      enTitle: "Tour Postponement Due To Unavoidable Circumstances",
      hiTitle: "अपरिहार्य परिस्थितियों के कारण यात्रा का स्थगन",
      enText: "The company reserves the right to postpone any tour due to unavoidable circumstances such as earthquakes, floods, landslides, cyclones, heavy rainfall, natural disasters, epidemics, pandemics, government restrictions, political unrest, transport disruptions or any force majeure event.",
      hiText: "कंपनी के पास भूकंप, बाढ़, भूस्खलन, चक्रवात, भारी वर्षा, प्राकृतिक आपदाओं, महामारियों, सरकारी प्रतिबंधों, राजनीतिक अशांति, परिवहन व्यवधान या किसी अन्य बलपूर्वक (फोर्स मेज्योर) घटना जैसी अपरिहार्य परिस्थितियों के कारण किसी भी यात्रा को स्थगित करने का पूरा अधिकार सुरक्षित है।"
    },
    {
      num: "03",
      enTitle: "Alternative Travel Date",
      hiTitle: "वैकल्पिक यात्रा तिथि",
      enText: "In case of tour postponement, Kamakhya Yatra will provide an alternative or rescheduled travel date to the customer.",
      hiText: "यात्रा स्थगित होने की स्थिति में, कामाख्या यात्रा ग्राहक को एक वैकल्पिक या पुनर्निर्धारित यात्रा तिथि प्रदान करेगी।"
    },
    {
      num: "04",
      enTitle: "Refund Timeline (120 Days)",
      hiTitle: "धनवापसी समय-सीमा (120 दिन)",
      enText: "If the customer refuses the rescheduled tour date and requests a refund, Kamakhya Yatra may take up to 120 calendar days to process and complete the refund.",
      hiText: "यदि ग्राहक पुनर्निर्धारित यात्रा तिथि को अस्वीकार करता है और रिफंड का अनुरोध करता है, तो कामाख्या यात्रा को रिफंड प्रक्रिया को पूरा करने में 120 कैलेंडर दिनों तक का समय लग सकता है।"
    },
    {
      num: "05",
      enTitle: "Vendor Settlement Requirement",
      hiTitle: "विक्रेता निपटान की आवश्यकता",
      enText: "The refund timeline is necessary because the company has to recover and settle advance payments already made to airlines, railways, hotels, transport operators and other third-party vendors.",
      hiText: "रिफंड की यह समय-सीमा इसलिए आवश्यक है क्योंकि कंपनी को एयरलाइंस, रेलवे, होटलों, परिवहन ऑपरेटरों और अन्य तीसरे पक्ष के विक्रेताओं को किए गए अग्रिम भुगतानों को वापस प्राप्त और व्यवस्थित करना होता है।"
    },
    {
      num: "06",
      enTitle: "Customer-Initiated Cancellation",
      hiTitle: "ग्राहक द्वारा रद्द की गई बुकिंग",
      enText: "If the customer cancels the tour from their own side for personal reasons, Kamakhya Yatra reserves the full right to either deny the refund request or provide a refund solely as a goodwill or complimentary gesture, subject to internal approval.",
      hiText: "यदि ग्राहक व्यक्तिगत कारणों से अपनी ओर से यात्रा रद्द करता है, तो कामाख्या यात्रा को रिफंड अनुरोध को अस्वीकार करने या आंतरिक अनुमोदन के अधीन केवल एक सद्भावना या मानद संकेत के रूप में रिफंड प्रदान करने का पूर्ण अधिकार है।"
    },
    {
      num: "07",
      enTitle: "Refund Is Not Guaranteed",
      hiTitle: "रिफंड की कोई गारंटी नहीं",
      enText: "Customer-initiated cancellations do not automatically qualify for a refund. Refund approval shall remain entirely at the sole discretion of Kamakhya Yatra.",
      hiText: "ग्राहक द्वारा रद्द की गई बुकिंग स्वचालित रूप से रिफंड के लिए योग्य नहीं होती है। रिफंड की मंजूरी पूरी तरह से कामाख्या यात्रा के विवेकाधिकार पर निर्भर करेगी।"
    },
    {
      num: "08",
      enTitle: "Mode Of Refund",
      hiTitle: "रिफंड का तरीका",
      enText: "Approved refunds will be processed through bank transfer, original payment mode or any other company-approved payment method.",
      hiText: "स्वीकृत रिफंड बैंक ट्रांसफर, मूल भुगतान मोड या किसी अन्य कंपनी द्वारा अनुमोदित भुगतान पद्धति के माध्यम से संसाधित किए जाएंगे।"
    },
    {
      num: "09",
      enTitle: "No Chargeback During Refund Period",
      hiTitle: "रिफंड अवधि के दौरान कोई चार्जबैक नहीं",
      enText: "The customer agrees not to initiate any unnecessary disputes, chargebacks or payment reversal requests during the applicable refund processing period.",
      hiText: "ग्राहक सहमत है कि वह लागू रिफंड प्रसंस्करण अवधि के दौरान किसी भी अनावश्यक विवाद, चार्जबैक या भुगतान वापसी का अनुरोध शुरू नहीं करेगा।"
    },
    {
      num: "10",
      enTitle: "Acceptance Of Policy",
      hiTitle: "नीति की स्वीकृति",
      enText: "The customer confirms that they have read, understood and accepted this policy before making the booking and signing the document.",
      hiText: "ग्राहक पुष्टि करता है कि उसने बुकिंग करने और दस्तावेज़ पर हस्ताक्षर करने से पहले इस नीति को पढ़, समझ और स्वीकार कर लिया है।"
    },
    {
      num: "11",
      enTitle: "Deduction of Actual Booking & Service Charges Before Refund",
      hiTitle: "रिफंड से पहले वास्तविक बुकिंग और सेवा शुल्क की कटौती",
      enText: "If Kamakhya Yatra approves any refund, the company reserves the right to deduct all actual expenses and non-recoverable charges already incurred, including hotel reservations, cab bookings, train tickets, flight tickets, food arrangements, guide charges, permits, local transportation, taxes, convenience charges and any other travel-related expenses. The remaining eligible amount, if any, shall be refunded within the applicable refund timeline.",
      hiText: "यदि कामाख्या यात्रा किसी भी रिफंड को मंजूरी देती है, तो कंपनी को होटल आरक्षण, कैब बुकिंग, ट्रेन टिकट, उड़ान टिकट, भोजन व्यवस्था, गाइड शुल्क, परमिट, स्थानीय परिवहन, कर, सुविधा शुल्क और किसी भी अन्य यात्रा से संबंधित खर्चों सहित पहले से किए गए सभी वास्तविक और गैर-वसूली योग्य खर्चों को काटने का अधिकार सुरक्षित है। शेष पात्र राशि, यदि कोई हो, लागू रिफंड समय-सीमा के भीतर वापस की जाएगी।"
    },
    {
      num: "12",
      enTitle: "Exclusive Jurisdiction & Legal Proceedings",
      hiTitle: "विशेष क्षेत्राधिकार और कानूनी कार्यवाही",
      enText: "Any dispute, claim, disagreement, legal proceeding or matter arising out of the booking, cancellation, postponement or refund shall be subject to the exclusive jurisdiction of the competent courts located in Ranchi, Jharkhand, India.",
      hiText: "बुकिंग, रद्दीकरण, स्थगन या रिफंड से उत्पन्न होने वाला कोई भी विवाद, दावा, असहमति, कानूनी कार्यवाही या मामला रांची, झारखंड, भारत में स्थित सक्षम न्यायालयों के विशेष क्षेत्राधिकार के अधीन होगा।"
    },
    {
      num: "13",
      enTitle: "Refund Is Subject To Recovery From Third-Party Vendors",
      hiTitle: "रिफंड तीसरे पक्ष के विक्रेताओं से वसूली के अधीन है",
      enText: "Kamakhya Yatra works with multiple third-party service providers. If these vendors do not provide any refund, partial refund or delay the settlement process, Kamakhya Yatra may not be able to provide a full refund.",
      hiText: "कामाख्या यात्रा कई तीसरे पक्ष के सेवा प्रदाताओं के साथ काम करती है। यदि ये विक्रेता कोई रिफंड या आंशिक रिफंड प्रदान नहीं करते हैं या निपटान प्रक्रिया में देरी करते हैं, तो कामाख्या यात्रा पूर्ण रिफंड प्रदान करने में असमर्थ हो सकती है।"
    },
    {
      num: "14",
      enTitle: "No Guarantee Of Full Refund",
      hiTitle: "पूर्ण रिफंड की कोई गारंटी नहीं",
      enText: "A full refund is not guaranteed under any circumstances. Refund eligibility depends on vendor policies, recoverable amounts, actual expenses incurred and management approval.",
      hiText: "किसी भी परिस्थिति में पूर्ण रिफंड की गारंटी नहीं है। रिफंड की पात्रता विक्रेता की नीतियों, वसूली योग्य राशियों, किए गए वास्तविक खर्चों और प्रबंधन की स्वीकृति पर निर्भर करती है।"
    },
    {
      num: "15",
      enTitle: "Circumstances Where Refund May Not Be Possible",
      hiTitle: "परिस्थितियां जहां रिफंड संभव नहीं हो सकता है",
      enText: "Including but not limited to: non-refundable flight tickets, non-refundable hotel reservations, vendor-imposed cancellation charges, special event bookings, peak season or festival bookings, government taxes and convenience fees, visa or permit-related expenses, force majeure events, and any other unrecoverable expenses already incurred by the company.",
      hiText: "जिसमें शामिल हैं लेकिन इन्हीं तक सीमित नहीं हैं: गैर-रिफंडेबल उड़ान टिकट, गैर-रिफंडेबल होटल आरक्षण, विक्रेता द्वारा लगाए गए रद्दीकरण शुल्क, विशेष कार्यक्रम बुकिंग, पीक सीजन या त्योहार बुकिंग, सरकारी कर और सुविधा शुल्क, वीजा या परमिट से संबंधित खर्च, फोर्स मेज्योर घटनाएं, और कंपनी द्वारा पहले से किए गए कोई भी अन्य गैर-वसूली योग्य खर्च।"
    },
    {
      num: "16",
      enTitle: "Company Shall Not Be Liable For Unrecoverable Expenses",
      hiTitle: "गैर-वसूली योग्य खर्चों के लिए कंपनी उत्तरदायी नहीं होगी",
      enText: "Kamakhya Yatra shall not be held liable for any amount that cannot be recovered from third-party vendors, suppliers or service providers.",
      hiText: "कामाख्या यात्रा को तीसरे पक्ष के विक्रेताओं, आपूर्तिकर्ताओं या सेवा प्रदाताओं से वसूल न की जा सकने वाली किसी भी राशि के लिए उत्तरदायी नहीं ठहराया जाएगा।"
    },
    {
      num: "17",
      enTitle: "Final Decision Authority",
      hiTitle: "अंतिम निर्णय का अधिकार",
      enText: "The final decision regarding postponement, cancellation, refund amount, deductions, refund eligibility and refund approval shall solely rest with Kamakhya Yatra management and shall be binding upon the customer.",
      hiText: "स्थगन, रद्दीकरण, रिफंड राशि, कटौती, रिफंड पात्रता और रिफंड अनुमोदन के संबंध में अंतिम निर्णय पूरी तरह से कामाख्या यात्रा प्रबंधन के पास रहेगा और ग्राहक पर बाध्यकारी होगा।"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Policy Documentation</span>
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading mb-4">Tour Postponement, Cancellation & Refund Policy</h1>
            <p className="text-amber-400 font-heading text-lg md:text-xl font-semibold mb-6">यात्रा स्थगन, रद्दीकरण और धनवापसी नीति</p>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              <span>Last Updated: July 11, 2026</span>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          {/* Policy Cards Grid */}
          <div className="flex flex-col gap-6 mb-16">
            {policies.map((p) => (
              <div 
                key={p.num} 
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row gap-6 items-start"
              >
                {/* Point Number Chip */}
                <div className="w-12 h-12 rounded-xl bg-[#0b1c3e]/5 border border-[#0b1c3e]/10 flex items-center justify-center font-heading text-[#d4af37] font-extrabold text-xl shrink-0">
                  {p.num}
                </div>
                
                {/* Bilingual Text */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* English Block */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#0b1c3e] mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
                      {p.enTitle}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{p.enText}</p>
                  </div>

                  {/* Divider line inside card */}
                  <div className="border-t border-slate-100 my-1"></div>

                  {/* Hindi Block */}
                  <div className="bg-amber-50/30 p-3 rounded-lg border border-amber-500/5">
                    <h3 className="text-sm font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {p.hiTitle}
                    </h3>
                    <p className="text-slate-700 text-xs leading-relaxed font-medium">{p.hiText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Styled Table Section */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg p-6 md:p-10 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="w-6 h-6 text-[#d4af37]" />
              <h2 className="font-heading font-extrabold text-xl md:text-2xl text-[#0b1c3e]">Booking & Cancellation Timeframes</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#0b1c3e] text-white">
                    <th className="p-4 font-bold text-xs uppercase tracking-wider">Timeframe Before Travel</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-wider">Booking Percentage Required</th>
                    <th className="p-4 font-bold text-xs uppercase tracking-wider">Refund Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr className="bg-white hover:bg-slate-50 transition">
                    <td className="p-4 font-semibold text-slate-700">1 Month</td>
                    <td className="p-4 text-slate-600">Full Booking Required</td>
                    <td className="p-4 text-red-600 font-extrabold">Non-Refundable / No Refund</td>
                  </tr>
                  <tr className="bg-slate-50/50 hover:bg-slate-50 transition">
                    <td className="p-4 font-semibold text-slate-700">15 Days</td>
                    <td className="p-4 text-slate-600">50% Advance Booking Allowed</td>
                    <td className="p-4 text-emerald-600 font-extrabold">Refund Subject to Verification</td>
                  </tr>
                  <tr className="bg-white hover:bg-slate-50 transition">
                    <td className="p-4 font-semibold text-slate-700">7 Days</td>
                    <td className="p-4 text-slate-600">25% Booking Allowed</td>
                    <td className="p-4 text-emerald-600 font-extrabold">Refund Subject to Verification</td>
                  </tr>
                  <tr className="bg-slate-50/50 hover:bg-slate-50 transition">
                    <td className="p-4 font-semibold text-slate-700">4 Days</td>
                    <td className="p-4 text-slate-600">No Booking Taken</td>
                    <td className="p-4 text-emerald-600 font-extrabold">Refund Subject to Verification</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex gap-2 items-start text-xs text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p>Refunds marked above are subject to recovery from third-party travel vendors (airlines, hotels, train ticketing, transport suppliers) and prior management approval.</p>
            </div>
          </div>

          {/* Closing Note Section */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center max-w-3xl mx-auto shadow-sm">
            <ShieldCheck className="w-10 h-10 text-amber-600 mx-auto mb-4" />
            <p className="text-[#0b1c3e] font-bold text-base md:text-lg mb-3 leading-relaxed">
              "This policy is attached with every invoice and serves as the customer's consent and acceptance of the Tour Postponement, Cancellation and Refund Policy."
            </p>
            <div className="border-t border-amber-200/60 my-3"></div>
            <p className="text-amber-800 font-medium text-xs md:text-sm italic leading-relaxed">
              "यह नीति प्रत्येक इनवॉइस के साथ संलग्न है और यात्रा स्थगन, रद्दीकरण और धनवापसी (रिफंड) नीति के लिए ग्राहक की सहमति और स्वीकृति के रूप में कार्य करती है।"
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
