"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, Sparkles, Bot } from "lucide-react";
import Image from "next/image";
import { searchPackagesForAI } from "@/app/admin/actions";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   KNOWLEDGE BASE — All FAQ answers, package info, and Kamakhya details
   This block is sent as context to the AI. For now it powers local
   pattern-matching; later replace getAIResponse() with a real API call.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const FAQ_KNOWLEDGE: { patterns: string[]; answer: string }[] = [
  {
    patterns: ["book", "booking", "how do i book", "reserve", "book a tour"],
    answer:
      "Booking with Kamakhya Yatra is easy! 🙏\n\n1. Browse packages on our website\n2. Click 'View Details' or 'Book Now'\n3. Fill in your details (name, phone, preferred date)\n4. Our travel specialist will verify seat availability and assist with your booking deposit\n\nYou can also reach us directly on WhatsApp at +91 70790 44000 or call us for instant assistance.",
  },
  {
    patterns: ["difference", "desh", "videsh", "dharmic", "holiday", "types", "categories", "yatra types"],
    answer:
      "Great question! Here's a quick breakdown of our yatra categories:\n\n🕉 **Dharmic Yatra** — Sacred pilgrimages & temple darshans (Amarnath, Chaar Dhaam, Kamakhya, Vaishno Devi)\n\n🇮🇳 **Desh Yatra** — Domestic leisure trips across India (Kashmir, Darjeeling, Kerala, Andaman)\n\n✈ **Videsh Yatra** — International packages (Nepal, Bhutan, Bali, Sri Lanka, Maldives)\n\n🌴 **Holiday Yatra** — Relaxed family vacations, honeymoons & weekend getaways\n\nEach category can be customized to your preferences!",
  },
  {
    patterns: ["customize", "customise", "itinerary", "hotel", "change", "modify", "flexible"],
    answer:
      "Absolutely! Almost all our packages are fully customizable. You can request changes in:\n\n• **Travel dates** — pick any date that works for you\n• **Hotel category** — Standard 3★, Premium 4★, or Luxury 5★\n• **Vehicle type** — SUV, Sedan, or Group Coach\n• **Sightseeing** — Add or remove specific destinations\n• **Meal plan** — Veg, non-veg, or Jain food options\n\nJust tell our travel specialist what you'd like, and we'll tailor the itinerary for you.",
  },
  {
    patterns: ["payment", "pay", "upi", "card", "bank", "deposit", "advance"],
    answer:
      "We offer multiple secure payment options:\n\n💳 Credit / Debit Cards\n📱 UPI (Google Pay, PhonePe, Paytm)\n🏦 Bank Transfer / NEFT / IMPS\n💵 Cash deposit at our office\n\nA token advance is required to secure hotel & transportation bookings. The remaining balance is payable before departure. We'll share a detailed payment schedule once you confirm your package.",
  },
  {
    patterns: ["cancel", "refund", "cancellation"],
    answer:
      "Our cancellation and refund policy depends on the notice period and package type:\n\n• **30+ days before departure** — Maximum refund (minus processing fees)\n• **15-30 days** — Partial refund\n• **Less than 15 days** — Subject to non-refundable components (flights, permits, hotel bookings)\n\nFor exact terms on your specific package, please speak with our sales manager or check our Refund Policy page.",
  },
  {
    patterns: ["document", "id", "passport", "visa", "documentation"],
    answer:
      "Here's what you'll need:\n\n🇮🇳 **Domestic tours (Desh / Dharmic Yatra)**\n— Valid Government-issued Photo ID (Aadhar, Voter ID, Passport)\n\n✈ **International tours (Videsh Yatra)**\n— Valid Passport (minimum 6 months validity)\n— Travel Visa (we provide full visa processing support!)\n\nWe'll send a detailed checklist once your booking is confirmed.",
  },
  {
    patterns: ["group", "corporate", "college", "school", "family group"],
    answer:
      "Yes! We organize dedicated group travel for:\n\n👨‍👩‍👧‍👦 Large families & joint family trips\n🏢 Corporate outings & team retreats\n🎓 College & school excursions\n🕉 Spiritual group congregations\n\nGroup discounts are available based on size. Contact us with your group details and we'll create a custom proposal!",
  },
  {
    patterns: ["support", "on-ground", "coordinator", "guide", "emergency", "help during"],
    answer:
      "You're never alone on a Kamakhya Yatra tour! 🤝\n\n• **Dedicated tour coordinator** assigned before departure\n• **English-speaking local guides** at every destination\n• **Trusted, verified drivers** for all transfers\n• **24/7 helpline** for emergencies\n• **Real-time updates** on transport & hotel check-ins\n\nOur on-ground team handles everything so you can focus on enjoying your journey.",
  },
  {
    patterns: ["kamakhya", "kamakhya temple", "guwahati", "assam", "goddess"],
    answer:
      "🙏 **Kamakhya Temple — The Jewel of Our Brand**\n\nKamakhya Temple is one of the most revered Shakti Peethas in India, located atop Nilachal Hill in Guwahati, Assam.\n\n**History & Significance:**\nDedicated to Goddess Kamakhya (a form of Goddess Sati/Shakti), this ancient temple is believed to be the spot where Sati's womb fell when Lord Vishnu's Sudarshan Chakra dismembered her body. It's the most important center of Tantric worship in India.\n\n**Architecture:**\nThe temple features a distinctive beehive-shaped dome (shikhara) and a dark underground sanctum housing the sacred natural spring.\n\n**Best Time to Visit:**\n• **October – March** — Pleasant weather, ideal for darshan\n• **June (Ambubachi Mela)** — The grand annual festival when the temple closes for 3 days and reopens with massive celebrations\n\n**Nearby Attractions:**\n• Umananda Temple (Peacock Island on Brahmaputra)\n• Assam State Museum & Zoo\n• Pobitora Wildlife Sanctuary\n• Madan Kamdev (ancient archaeological ruins)\n• Hajo (tri-faith pilgrimage site)\n\n**Travel Tips:**\n• Wear modest clothing for temple visit\n• Darshan queues can be long — plan early morning visits\n• Photography is restricted inside the main sanctum\n• Book through us for VIP darshan arrangements!\n\nWe offer dedicated **Kamakhya Temple Yatra packages** starting from ₹12,000. Ask me for details!",
  },
  {
    patterns: ["amarnath", "cave", "shiva"],
    answer:
      "🏔 **Amarnath Yatra** (5N/6D) — ₹24,500 per person\n\nPilgrimage to the sacred ice Shiva Lingam cave in Kashmir.\n\n**Highlights:**\n• Holy Cave Darshan (trek or helicopter option)\n• Srinagar sightseeing — Dal Lake Shikara ride, Mughal Gardens\n• Gulmarg Gondola cable car ride\n• Sonamarg — Meadow of Gold\n\n**Inclusions:** Hotel & tent stay, all vegetarian meals, Pahalgam/Baltal transfers, medical assistance, yatra registration support.\n\n**Best months:** June – August (yatra season)\n\nWould you like me to share the detailed day-by-day itinerary?",
  },
  {
    patterns: ["chaar dhaam", "char dham", "kedarnath", "badrinath", "yamunotri", "gangotri"],
    answer:
      "🙏 **Chaar Dhaam Yatra** (10N/11D) — ₹24,000 per person\n\nVisit all four sacred abodes in Uttarakhand: Yamunotri, Gangotri, Kedarnath & Badrinath.\n\n**Route Highlights:**\n• Haridwar → Barkot → Yamunotri trek (6 km)\n• Uttarkashi → Gangotri → holy Ganges dip\n• Guptkashi → Kedarnath trek (16 km) → evening Aarti\n• Badrinath Darshan → Mana Village (last Indian village)\n• Rishikesh → Ganga Aarti at Haridwar\n\n**Inclusions:** Semi-deluxe hotels, veg meals, AC transport, guided assistance.\n\n**Best months:** May – June, September – October\n\nShall I help you book or customize this package?",
  },
  {
    patterns: ["nepal", "bhutan", "international", "videsh"],
    answer:
      "✈ Our popular **Videsh Yatra** packages:\n\n🇳🇵 **Nepal Muktinath Yatra** (6N/7D) — ₹22,000\n— Pashupatinath, Muktinath Temple, Pokhara, Kathmandu\n\n🇧🇹 **Bhutan Discovery** (6N/7D) — ₹35,000\n— Tiger's Nest Monastery, Thimphu, Paro, Punakha Dzong\n\nAll international packages include visa support, comfortable stays, guided tours, and all meals.\n\nWould you like details on any specific international destination?",
  },
  {
    patterns: ["darjeeling", "gangtok", "sikkim", "north east", "northeast"],
    answer:
      "🏔 **Darjeeling & Gangtok** (6N/7D) — ₹18,000 per person\n\nExplore the beauty of North East India!\n\n**Highlights:**\n• Darjeeling — Tiger Hill sunrise, Batasia Loop, tea gardens, toy train\n• Gangtok — MG Marg, Rumtek Monastery, Tsomgo Lake, Nathula Pass\n\n**Inclusions:** 3★ hotels, breakfast & dinner, transfers, sightseeing.\n\n**Best months:** March – May, October – December\n\nWant me to customize this package for you?",
  },
  {
    patterns: ["kerala", "backwater", "munnar", "alleppey"],
    answer:
      "🌴 **Kerala Backwater Bliss** (5N/6D) — ₹20,000 per person\n\nGod's Own Country awaits!\n\n**Highlights:**\n• Munnar — tea plantations, Eravikulam National Park\n• Thekkady — Periyar Tiger Reserve boat ride\n• Alleppey — Houseboat stay on Kerala backwaters\n• Kochi — Fort Kochi, Chinese fishing nets\n\n**Inclusions:** Premium hotels + 1 night houseboat, breakfast & dinner, AC transfers.\n\n**Best months:** September – March",
  },
  {
    patterns: ["price", "cost", "budget", "cheap", "expensive", "how much", "rate"],
    answer:
      "Our packages are designed for every budget:\n\n💰 **Budget-Friendly** (from ₹12,000) — Standard hotels, group transport\n💎 **Premium** (₹18,000 – ₹30,000) — 3-4★ hotels, private vehicle, all meals\n👑 **Luxury** (₹35,000+) — 5★ stays, flights, VIP darshan, personal guide\n\nAll prices are per person on twin-sharing basis. Solo travelers, families & groups get customized quotes.\n\nTell me your destination and budget, and I'll suggest the best package!",
  },
  {
    patterns: ["best time", "when to visit", "season", "weather", "month"],
    answer:
      "Here are the best travel months for our popular destinations:\n\n🏔 **Amarnath** — June to August\n🙏 **Chaar Dhaam** — May – June, Sep – Oct\n🌺 **Kamakhya Temple** — Oct – March (Ambubachi Mela in June)\n🌴 **Kerala** — September to March\n🏔 **Darjeeling/Gangtok** — March – May, Oct – Dec\n🇳🇵 **Nepal** — March – May, Sep – Nov\n🇧🇹 **Bhutan** — March – May, Sep – Nov\n🏖 **Andaman** — October to May\n\nLet me know your preferred month and I'll suggest the best destinations!",
  },
];

const GREETING =
  "Namaste! 🙏 I'm **Yatra AI**, your personal travel assistant at Kamakhya Yatra. I can help you with:\n\n• Booking queries & package details\n• Itinerary information for all destinations\n• Kamakhya Temple & spiritual travel tips\n• Payment options & policies\n\nHow can I help you today?";

const FALLBACK =
  "I appreciate your question! While I may not have the exact answer right now, our travel specialists would love to help you personally.\n\n📞 **Call:** +91 70790 44000\n💬 **WhatsApp:** [Click here](https://wa.me/917079044000)\n📧 **Email:** info@kamakhyayatra.com\n\nIs there anything else I can assist you with?";

const QUICK_CHIPS = [
  "How do I book a tour?",
  "Desh vs Videsh vs Dharmic Yatra?",
  "Can I customize my itinerary?",
  "Payment options?",
  "Tell me about Kamakhya Temple",
  "Best time to visit destinations?",
  "Package prices & budgets?",
];

/* ─── Types ─── */
interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔌 API INTEGRATION POINT
   ──────────────────────────────────────────────────────────
   Replace this function with a real AI API call (OpenAI, Claude,
   Gemini, etc.) when ready. The function receives the user's
   message and full chat history, and should return the assistant's
   response string.

   Example integration:
   ```
   async function getAIResponse(userMsg: string, history: Message[]): Promise<string> {
     const res = await fetch("/api/chat", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         messages: history.map(m => ({ role: m.role, content: m.content })),
         systemPrompt: SYSTEM_PROMPT,  // Include FAQ_KNOWLEDGE + package data
       }),
     });
     const data = await res.json();
     return data.reply;
   }
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
async function getAIResponse(userMsg: string, _history: Message[]): Promise<string> {
  // Simulate network delay for realistic typing indicator
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

  const lower = userMsg.toLowerCase();

  // Dynamic Intent Detection for Itinerary Search
  const intentKeywords = ["itinerary", "tour plan", "package details", "schedule", "day wise", "trip plan", "package", "tour"];
  const matchedIntent = intentKeywords.find(k => lower.includes(k));
  if (matchedIntent) {
    console.log("User Query:", userMsg);
    console.log("Detected Intent:", matchedIntent);
    
    // Clean query by removing intent words
    let searchQuery = lower;
    intentKeywords.forEach(k => {
      searchQuery = searchQuery.replace(new RegExp(`\\b${k}\\b`, 'gi'), '');
    });
    // Remove extra words like "show", "me", "for"
    searchQuery = searchQuery.replace(/\b(show|me|for|a|an|the)\b/gi, '').trim();

    console.log("Searching Package:", searchQuery);

    if (searchQuery.length > 2) {
      try {
        const matchedPackages = await searchPackagesForAI(searchQuery);
        
        if (matchedPackages && matchedPackages.length > 0) {
          console.log("Matched Packages Count:", matchedPackages.length);
          console.log("Matched Package Name:", matchedPackages[0].title);
          
          let debugOutput = `\n\n[DEBUG]\nIntent: ${matchedIntent}\nKeyword: ${searchQuery}\nPackages Found: ${matchedPackages.length}`;

          if (matchedPackages.length === 1) {
            const pkg = matchedPackages[0];
            let response = `🏷 **Package Name:** ${pkg.title}\n`;
            response += `🕒 **Duration:** ${pkg.duration || "Customizable"}\n\n`;
            
            if (pkg.itinerary && Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0) {
              pkg.itinerary.forEach((day: any, idx: number) => {
                const title = day.title || day.activity || day.description || "Activity";
                const details = day.details ? `\n${day.details}` : "";
                response += `📅 **Day ${idx + 1}:**\n**${title}**${details}\n\n`;
              });
            } else {
              response += `*Day-wise itinerary is currently being updated. Please contact our travel advisor.*\n\n`;
            }

            // Pricing logic
            response += `💰 **Pricing:**\n`;
            if (pkg.fares) {
              if (pkg.fares.sl_fare) response += `Sleeper: ₹${pkg.fares.sl_fare.toLocaleString("en-IN")}\n`;
              if (pkg.fares.ac3_extra_charge) response += `3AC: ₹${(pkg.fares.sl_fare + pkg.fares.ac3_extra_charge).toLocaleString("en-IN")}\n`;
              if (pkg.fares.ac2_extra_charge) response += `2AC: ₹${(pkg.fares.sl_fare + pkg.fares.ac2_extra_charge).toLocaleString("en-IN")}\n`;
              if (pkg.fares.flight_fare) response += `Flight: ₹${pkg.fares.flight_fare.toLocaleString("en-IN")}\n`;
            } else if (pkg.price) {
              response += `Base Price: ₹${pkg.price.toLocaleString("en-IN")}\n`;
            }
            response += `\n`;

            if (pkg.whats_included && Array.isArray(pkg.whats_included) && pkg.whats_included.length > 0) {
               response += `✅ **Inclusions:**\n`;
               pkg.whats_included.forEach((item: string) => {
                 response += `- ${item}\n`;
               });
               response += `\n`;
            }

            const exclusions = pkg.exclusions || pkg.whats_excluded || [];
            if (exclusions && Array.isArray(exclusions) && exclusions.length > 0) {
               response += `❌ **Exclusions:**\n`;
               exclusions.forEach((item: string) => {
                 response += `- ${item}\n`;
               });
               response += `\n`;
            } else {
               response += `❌ **Exclusions:**\n- Personal Expenses\n- Train/Flight Meals\n- Anything not mentioned in Inclusions\n\n`;
            }
            
            response += `📞 **Kamakhya Yatra**\n7079044000 | 7079088000\n`;
            response += debugOutput;
            return response;
          } else {
            // Multiple matches
            let response = `I found multiple packages matching your request. Which one would you like to see?\n\n`;
            matchedPackages.forEach((pkg: any) => {
               response += `• **${pkg.title}** (${pkg.duration || ''})\n`;
            });
            response += `\nPlease reply with the specific package name.`;
            response += debugOutput;
            return response;
          }
        }
      } catch (err) {
        console.error("AI Search Error:", err);
      }
    }
  }

  // Check knowledge base for pattern matches
  for (const entry of FAQ_KNOWLEDGE) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return entry.answer;
    }
  }

  // Generic greetings
  if (/^(hi|hello|hey|namaste|namaskar|hola)/.test(lower)) {
    return "Hello! 👋 Welcome to Kamakhya Yatra. How can I assist you today? You can ask me about tour packages, bookings, destinations, or anything travel-related!";
  }

  if (/thank|thanks|dhanyavaad/.test(lower)) {
    return "You're welcome! 🙏 It's my pleasure to help. Feel free to ask if you need anything else. Happy travels with Kamakhya Yatra! ✨";
  }

  return FALLBACK;
}

/* ─── Simple Markdown-like renderer ─── */
function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    // Bold
    let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Links
    processed = processed.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#d4af37] underline hover:text-amber-300 transition">$1</a>'
    );
    if (processed.trim() === "") return <br key={i} />;
    return (
      <span key={i} className="block" dangerouslySetInnerHTML={{ __html: processed }} />
    );
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: GREETING, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // floating widget state
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const msgIdRef = useRef(1);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: msgIdRef.current++,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const reply = await getAIResponse(trimmed, [...messages, userMsg]);
        const assistantMsg: Message = {
          id: msgIdRef.current++,
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: msgIdRef.current++,
            role: "assistant",
            content: "Oops! Something went wrong. Please try again or contact us at +91 70790 44000.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, messages]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  /* ──── Inline Section (replaces FAQ accordion) ──── */
  const InlineChat = (
    <div className="w-full max-w-4xl mx-auto">
      {/* chat container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* header bar */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-[#0b1c3e] to-[#162d5a] px-6 py-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#d4af37]/60 shadow-lg flex-shrink-0">
            <Image src="/yatra-ai-avatar.png" alt="Yatra AI Assistant" fill sizes="48px" className="object-cover" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0b1c3e]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              Yatra AI <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            </h3>
            <p className="text-slate-300 text-xs">Online · Typically replies instantly</p>
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="h-[420px] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50 to-white scroll-smooth"
             role="log" aria-label="Chat messages" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#d4af37]/30 flex-shrink-0 mt-1">
                  <Image src="/yatra-ai-avatar.png" alt="AI" fill sizes="32px" className="object-cover" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#0b1c3e] text-white rounded-br-md"
                    : "bg-white border border-slate-150 text-slate-700 rounded-bl-md shadow-sm"
                }`}
              >
                {renderMarkdown(msg.content)}
                <span className="block text-[10px] mt-2 opacity-50">
                  {isMounted ? (
                    msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  ) : (
                    <span className="invisible">00:00 PM</span>
                  )}
                </span>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#0b1c3e] flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold">
                  You
                </div>
              )}
            </div>
          ))}

          {/* typing indicator */}
          {isTyping && (
            <div className="flex gap-3 items-end">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#d4af37]/30 flex-shrink-0">
                <Image src="/yatra-ai-avatar.png" alt="AI" fill sizes="32px" className="object-cover" />
              </div>
              <div className="bg-white border border-slate-150 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm" role="status" aria-label="Assistant is typing">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* quick-reply chips */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => sendMessage(chip)}
              disabled={isTyping}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-full border border-[#d4af37]/30 bg-white text-[#0b1c3e] hover:bg-[#d4af37]/10 hover:border-[#d4af37]/60 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* input bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 bg-white">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tours, bookings, Kamakhya Temple…"
            disabled={isTyping}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm text-[#0b1c3e] placeholder:text-slate-400 outline-none focus:border-[#0b1c3e] focus:ring-2 focus:ring-[#0b1c3e]/10 transition-all disabled:opacity-60"
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="w-11 h-11 rounded-full bg-[#0b1c3e] text-white flex items-center justify-center hover:bg-[#162d5a] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );

  /* ──── Floating Widget (bottom-right bubble) ──── */
  const FloatingWidget = (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#0b1c3e] to-[#1a3a6e] shadow-[0_8px_30px_rgba(11,28,62,0.4)] flex items-center justify-center hover:shadow-[0_12px_40px_rgba(11,28,62,0.5)] transition-shadow duration-300 group"
            aria-label="Open Yatra AI chat"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#d4af37]/50">
              <Image src="/yatra-ai-avatar.png" alt="Yatra AI" fill sizes="40px" className="object-cover" />
            </div>
            {/* pulse ring */}
            <span className="absolute inset-0 rounded-full border-2 border-[#d4af37]/30 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-2rem))] rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col"
            style={{ maxHeight: "min(640px, calc(100vh - 3rem))" }}
            role="dialog"
            aria-label="Yatra AI chat assistant"
          >
            {/* header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#0b1c3e] to-[#162d5a] px-5 py-3.5 flex-shrink-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#d4af37]/60 flex-shrink-0">
                <Image src="/yatra-ai-avatar.png" alt="Yatra AI" fill sizes="40px" className="object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0b1c3e]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  Yatra AI <Sparkles className="w-3 h-3 text-[#d4af37]" />
                </h3>
                <p className="text-slate-300 text-[11px]">Online · Instant replies</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition p-1"
                      aria-label="Close chat">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* messages */}
            <div ref={isOpen ? scrollRef : undefined}
                 className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white min-h-0"
                 role="log" aria-label="Chat messages" aria-live="polite">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#d4af37]/30 flex-shrink-0 mt-0.5">
                      <Image src="/yatra-ai-avatar.png" alt="AI" fill sizes="28px" className="object-cover" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#0b1c3e] text-white rounded-br-sm"
                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {renderMarkdown(msg.content)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2.5 items-end">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#d4af37]/30 flex-shrink-0">
                    <Image src="/yatra-ai-avatar.png" alt="AI" fill sizes="28px" className="object-cover" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm" role="status" aria-label="Typing">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* quick chips (scrollable row in floating mode) */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80 flex gap-2 overflow-x-auto no-scrollbar"
                 role="group" aria-label="Suggested questions">
              {QUICK_CHIPS.slice(0, 5).map((chip) => (
                <button key={chip} onClick={() => sendMessage(chip)} disabled={isTyping}
                  className="flex-shrink-0 px-3 py-1.5 text-[10px] font-semibold rounded-full border border-[#d4af37]/30 bg-white text-[#0b1c3e] hover:bg-[#d4af37]/10 transition disabled:opacity-40 whitespace-nowrap">
                  {chip}
                </button>
              ))}
            </div>

            {/* input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-white flex-shrink-0">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…" disabled={isTyping}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-[#0b1c3e] placeholder:text-slate-400 outline-none focus:border-[#0b1c3e] transition disabled:opacity-60"
                aria-label="Type your message" />
              <button type="submit" disabled={isTyping || !input.trim()}
                className="w-10 h-10 rounded-full bg-[#0b1c3e] text-white flex items-center justify-center hover:bg-[#162d5a] transition disabled:opacity-40 shadow-md"
                aria-label="Send message">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  /* ──── Combined render ──── */
  return (
    <>
      {/* Inline section (replaces the old FAQ accordion) */}
      <section className="py-20 px-6 bg-slate-50" id="ai-assistant">
        <div className="max-w-4xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25">
              <Bot className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">AI-Powered</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0b1c3e] mb-4">
              Meet <span className="text-[#d4af37]">Yatra AI</span> — Your Travel Assistant
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Get instant answers about bookings, itineraries, packages, and Kamakhya Yatra — powered by AI.
              Ask anything, from package details to travel tips.
            </p>
          </div>

          {InlineChat}
        </div>
      </section>

      {/* Floating widget always visible */}
      {FloatingWidget}

      {/* hide scrollbar for chip containers */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
