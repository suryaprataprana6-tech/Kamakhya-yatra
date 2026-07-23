import { MapPin, Phone, Mail, BadgeCheck, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ── Brand SVG icons (official paths, no extra dependency) ──────── */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98H9.198V21.5Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[17px] h-[17px]">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

/* ── Social link definitions ────────────────────────────────────── */
const socialLinks = [
  {
    label: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61562942375687",
    icon: <FacebookIcon />,
    bg: "bg-[#1877F2]",
    shadow: "shadow-[0_4px_14px_rgba(24,119,242,0.45)]",
    hoverShadow: "hover:shadow-[0_6px_20px_rgba(24,119,242,0.6)]",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/kamakhya_yatra",
    icon: <InstagramIcon />,
    // Instagram gradient applied via inline style below
    bg: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]",
    shadow: "shadow-[0_4px_14px_rgba(225,48,108,0.45)]",
    hoverShadow: "hover:shadow-[0_6px_20px_rgba(225,48,108,0.6)]",
  },
  {
    label: "WhatsApp",
    url: "https://wa.me/917079044000",
    icon: <WhatsAppIcon />,
    bg: "bg-[#25D366]",
    shadow: "shadow-[0_4px_14px_rgba(37,211,102,0.45)]",
    hoverShadow: "hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)]",
  },
  {
    label: "Twitter",
    url: "#",
    icon: <TwitterIcon />,
    bg: "bg-[#1DA1F2]",
    shadow: "shadow-[0_4px_14px_rgba(29,161,242,0.45)]",
    hoverShadow: "hover:shadow-[0_6px_20px_rgba(29,161,242,0.6)]",
  },
  {
    label: "YouTube",
    url: "#",
    icon: <YouTubeIcon />,
    bg: "bg-[#FF0000]",
    shadow: "shadow-[0_4px_14px_rgba(255,0,0,0.4)]",
    hoverShadow: "hover:shadow-[0_6px_20px_rgba(255,0,0,0.55)]",
  },
];

const trustBadges = [
  {
    label: "MSME Registered",
    subtext: "Government of India Certified (Reg. details pending)",
    icon: BadgeCheck,
  },
  {
    label: "GST Registered",
    subtext: "Tax Compliant Business Entity (GSTIN pending)",
    icon: ShieldCheck,
  },
  {
    label: "Trademark Registered",
    subtext: "Kamakhya Yatra® Brand Protection",
    icon: Award,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0b1c3e] text-slate-300 border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
        {/* About section */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-[#d4af37]/50 bg-[#0b1c3e]">
              <Image src="/logo.png" alt="Kamakhya Yatra logo" fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-white font-heading text-lg font-extrabold tracking-wide uppercase">Kamakhya Yatra</h2>
              <p className="text-[10px] text-[#d4af37] font-semibold tracking-widest -mt-1">PREMIUM TOUR & TRAVEL</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Spiritual pilgrimages, domestic getaways, international tours, and holiday packages crafted with care across India and abroad.
          </p>

          {/* ── 3D Brand-Colored Social Icons ── */}
          <div className="flex gap-3 mt-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={[
                  "w-10 h-10 rounded-full flex items-center justify-center text-white",
                  social.bg,
                  social.shadow,
                  social.hoverShadow,
                  // 3D emboss: light inset highlight top-left
                  "ring-1 ring-inset ring-white/20",
                  // Hover: lift up + scale
                  "hover:scale-110 hover:-translate-y-0.5",
                  // Active: press down
                  "active:scale-95 active:shadow-none active:translate-y-0",
                  // Smooth transitions
                  "transition-all duration-200 ease-out",
                ].join(" ")}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* ── Trust & Certification Badges ── */}
          <div className="flex flex-col gap-2 mt-5 pt-5 border-t border-white/5">
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Accreditation & Trust</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {trustBadges.map((badge, idx) => {
                const IconComponent = badge.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition cursor-default shadow-inner"
                    title={badge.subtext}
                  >
                    <IconComponent className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    <span className="text-[10px] font-bold text-slate-200 tracking-wide">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Our Yatras */}
        <div className="lg:col-span-2 lg:col-start-6 flex flex-col gap-4">
          <h4 className="text-white font-heading font-extrabold text-sm uppercase tracking-wider border-l-2 border-[#d4af37] pl-3">Our Yatras</h4>
          <ul className="flex flex-col gap-2.5 text-sm font-semibold">
            <li><Link href="/desh-yatra" className="hover:text-[#d4af37] transition">Desh Yatra</Link></li>
            <li><Link href="/videsh-yatra" className="hover:text-[#d4af37] transition">Videsh Yatra</Link></li>
            <li><Link href="/dharmic-yatra" className="hover:text-[#d4af37] transition">Dharmic Yatra</Link></li>
            <li><Link href="/holiday-yatra" className="hover:text-[#d4af37] transition">Holiday Yatra</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h4 className="text-white font-heading font-extrabold text-sm uppercase tracking-wider border-l-2 border-[#d4af37] pl-3">Quick Links</h4>
          <ul className="flex flex-col gap-2.5 text-sm font-semibold">
            <li><Link href="/" className="hover:text-[#d4af37] transition">Home</Link></li>
            <li><Link href="/about-us" className="hover:text-[#d4af37] transition">About Us</Link></li>
            <li><Link href="/contact-us" className="hover:text-[#d4af37] transition">Contact Us</Link></li>
            <li><Link href="/refund-policy" className="hover:text-[#d4af37] transition">Refund Policy</Link></li>
            <li><Link href="/cancel-booking" className="hover:text-[#d4af37] transition">Cancel Booking</Link></li>
            <li><Link href="/terms-conditions" className="hover:text-[#d4af37] transition">Terms & Conditions</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-[#d4af37] transition">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h4 className="text-white font-heading font-extrabold text-sm uppercase tracking-wider border-l-2 border-[#d4af37] pl-3">Contact Info</h4>
          <ul className="flex flex-col gap-3.5 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <span>2nd Floor, Keshri Height, Opp. Manyavar Shop, Ratu Road, Ranchi, Jharkhand</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
              <a href="tel:+917079044000" className="hover:text-white transition">+91 70790 44000</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
              <a href="mailto:kamakhyayatra19@gmail.com" className="hover:text-white transition text-xs break-all">kamakhyayatra19@gmail.com</a>
            </li>
          </ul>

          {/* Management Profiles */}
          <div className="mt-2 flex flex-col gap-2">
            {/* Ankit Dubey */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3.5 transition-colors hover:bg-white/10">
              <div className="w-[60px] h-[60px] relative shrink-0 rounded-full overflow-hidden border border-[#d4af37]/30">
                <Image 
                  src="/Ankit Dubey.png" 
                  alt="Ankit Dubey - Director at Kamakhya Yatra" 
                  fill 
                  className="object-cover object-top" 
                  sizes="60px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-[15px] tracking-wide leading-tight">Ankit Dubey</span>
                <span className="text-[#d4af37] text-[11px] font-bold uppercase tracking-wider mt-0.5">Director</span>
                <span className="text-slate-400 text-[10px] font-medium tracking-widest mt-0.5">Kamakhya Yatra</span>
              </div>
            </div>

            {/* Mona Sahu */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3.5 transition-colors hover:bg-white/10">
              <div className="w-[60px] h-[60px] relative shrink-0 rounded-full overflow-hidden border border-[#d4af37]/30">
                <Image 
                  src="/Mona Sahu.png" 
                  alt="Mona Sahu - Director at Kamakhya Yatra" 
                  fill 
                  className="object-cover object-top" 
                  sizes="60px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-[15px] tracking-wide leading-tight">Mona Sahu</span>
                <span className="text-[#d4af37] text-[11px] font-bold uppercase tracking-wider mt-0.5">Director</span>
                <span className="text-slate-400 text-[10px] font-medium tracking-widest mt-0.5">Kamakhya Yatra</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center text-xs text-slate-500 font-semibold">
        {/* Left: Copyright */}
        <div className="flex justify-center md:justify-start text-center md:text-left">
          <p>© {new Date().getFullYear()} Kamakhya Yatra. All Rights Reserved.</p>
        </div>

        {/* Center: Developer Credit */}
        <div className="flex justify-center items-center gap-3">
          <div className="w-[46px] h-[46px] relative shrink-0 rounded-full overflow-hidden border border-[#d4af37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Image 
              src="/developersurya.png" 
              alt="Mr. Surya Pratap Rana - Web Developer" 
              fill 
              className="object-cover object-top" 
              sizes="46px"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-slate-400 text-[10px] font-medium leading-tight">Developed & Maintained by</span>
            <span className="text-white font-bold text-[13px] leading-tight mt-0.5 whitespace-nowrap">Mr. Surya Pratap Rana</span>
            <span className="text-[#d4af37] text-[10px] font-bold tracking-widest mt-0.5">WEB DEVELOPER</span>
          </div>
        </div>

        {/* Right: Legal Links */}
        <div className="flex justify-center md:justify-end gap-4 flex-wrap">
          <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
          <Link href="/terms-conditions" className="hover:underline">Terms</Link>
          <Link href="/refund-policy" className="hover:underline">Refunds</Link>
          <Link href="/cancel-booking" className="hover:underline">Cancellation</Link>
        </div>
      </div>
    </footer>
  );
}
