// Static dataset and utilities for State -> Railway Station mapping and Arrival Station resolution

export interface RailwayStation {
  code: string;
  name: string;
}

export interface StateBoardingConfig {
  state: string;
  stations: RailwayStation[];
}

export const INDIAN_STATES_AND_STATIONS: StateBoardingConfig[] = [
  {
    state: "Andhra Pradesh",
    stations: [
      { code: "BZA", name: "Vijayawada Junction (BZA)" },
      { code: "VSKP", name: "Visakhapatnam Junction (VSKP)" },
      { code: "TPTY", name: "Tirupati Main (TPTY)" },
      { code: "GNT", name: "Guntur Junction (GNT)" },
      { code: "RJY", name: "Rajahmundry (RJY)" },
      { code: "NLR", name: "Nellore (NLR)" },
      { code: "KRNT", name: "Kurnool City (KRNT)" },
      { code: "RU", name: "Renigunta Junction (RU)" },
      { code: "OTHER-AP", name: "Other Station (Andhra Pradesh)" },
    ],
  },
  {
    state: "Arunachal Pradesh",
    stations: [
      { code: "NHLN", name: "Naharlagun Railway Station (NHLN)" },
      { code: "GMTO", name: "Gumto Railway Station (GMTO)" },
      { code: "OTHER-AR", name: "Other Station (Arunachal Pradesh)" },
    ],
  },
  {
    state: "Assam",
    stations: [
      { code: "GHY", name: "Guwahati Railway Station (GHY)" },
      { code: "KYQ", name: "Kamakhya Junction (KYQ)" },
      { code: "DBRG", name: "Dibrugarh (DBRG)" },
      { code: "SCL", name: "Silchar (SCL)" },
      { code: "JTTN", name: "Jorhat Town (JTTN)" },
      { code: "TSK", name: "Tinsukia Junction (TSK)" },
      { code: "NBQ", name: "New Bongaigaon (NBQ)" },
      { code: "OTHER-AS", name: "Other Station (Assam)" },
    ],
  },
  {
    state: "Bihar",
    stations: [
      { code: "PNBE", name: "Patna Junction (PNBE)" },
      { code: "GAYA", name: "Gaya Junction (GAYA)" },
      { code: "MFP", name: "Muzaffarpur Junction (MFP)" },
      { code: "BGP", name: "Bhagalpur Junction (BGP)" },
      { code: "DBG", name: "Darbhanga Junction (DBG)" },
      { code: "KIR", name: "Katihar Junction (KIR)" },
      { code: "CPR", name: "Chhapra Junction (CPR)" },
      { code: "SPJ", name: "Samastipur Junction (SPJ)" },
      { code: "ARA", name: "Ara Junction (ARA)" },
      { code: "BJU", name: "Barauni Junction (BJU)" },
      { code: "PPTA", name: "Patliputra Junction (PPTA)" },
      { code: "DNR", name: "Danapur (DNR)" },
      { code: "MKA", name: "Mokama (MKA)" },
      { code: "OTHER-BR", name: "Other Station (Bihar)" },
    ],
  },
  {
    state: "Chhattisgarh",
    stations: [
      { code: "R", name: "Raipur Junction (R)" },
      { code: "BSP", name: "Bilaspur Junction (BSP)" },
      { code: "DURG", name: "Durg Junction (DURG)" },
      { code: "KRBA", name: "Korba (KRBA)" },
      { code: "RIG", name: "Raigarh (RIG)" },
      { code: "RJN", name: "Raj Nandgaon (RJN)" },
      { code: "OTHER-CG", name: "Other Station (Chhattisgarh)" },
    ],
  },
  {
    state: "Goa",
    stations: [
      { code: "MAO", name: "Madgaon Junction (MAO)" },
      { code: "VSG", name: "Vasco Da Gama (VSG)" },
      { code: "THVM", name: "Thivim (THVM)" },
      { code: "KRMI", name: "Karmali (KRMI)" },
      { code: "OTHER-GA", name: "Other Station (Goa)" },
    ],
  },
  {
    state: "Gujarat",
    stations: [
      { code: "ADI", name: "Ahmedabad Junction (ADI)" },
      { code: "ST", name: "Surat (ST)" },
      { code: "BRC", name: "Vadodara Junction (BRC)" },
      { code: "RJT", name: "Rajkot Junction (RJT)" },
      { code: "DWK", name: "Dwarka (DWK)" },
      { code: "SMNH", name: "Somnath (SMNH)" },
      { code: "BHUJ", name: "Bhuj (BHUJ)" },
      { code: "BVC", name: "Bhavnagar Terminus (BVC)" },
      { code: "OTHER-GJ", name: "Other Station (Gujarat)" },
    ],
  },
  {
    state: "Haryana",
    stations: [
      { code: "UMB", name: "Ambala Cantt (UMB)" },
      { code: "PNP", name: "Panipat Junction (PNP)" },
      { code: "ROK", name: "Rohtak Junction (ROK)" },
      { code: "HSR", name: "Hisar (HSR)" },
      { code: "FDB", name: "Faridabad (FDB)" },
      { code: "GGN", name: "Gurugram (GGN)" },
      { code: "KLK", name: "Kalka (KLK)" },
      { code: "OTHER-HR", name: "Other Station (Haryana)" },
    ],
  },
  {
    state: "Himachal Pradesh",
    stations: [
      { code: "SML", name: "Shimla (SML)" },
      { code: "UHL", name: "Una Himachal (UHL)" },
      { code: "SOL", name: "Solan (SOL)" },
      { code: "KGRA", name: "Kangra (KGRA)" },
      { code: "OTHER-HP", name: "Other Station (Himachal Pradesh)" },
    ],
  },
  {
    state: "Jharkhand",
    stations: [
      { code: "RNC", name: "Ranchi Junction (RNC) - Main Boarding Point" },
      { code: "HTE", name: "Hatia (HTE)" },
      { code: "DHN", name: "Dhanbad Junction (DHN)" },
      { code: "TATA", name: "Tatanagar / Jamshedpur (TATA)" },
      { code: "BKSC", name: "Bokaro Steel City (BKSC)" },
      { code: "JSME", name: "Jasidih / Deoghar (JSME)" },
      { code: "KQR", name: "Koderma Junction (KQR)" },
      { code: "HZD", name: "Hazaribagh Road (HZD)" },
      { code: "GHD", name: "Garhwa Road (GHD)" },
      { code: "DTO", name: "DaltonGanj (DTO)" },
      { code: "GRD", name: "Giridih (GRD)" },
      { code: "MDP", name: "Madhupur Junction (MDP)" },
      { code: "OTHER-JH", name: "Other Station (Jharkhand)" },
    ],
  },
  {
    state: "Karnataka",
    stations: [
      { code: "SBC", name: "KSR Bengaluru City (SBC)" },
      { code: "YPR", name: "Yesvantpur Junction (YPR)" },
      { code: "MYS", name: "Mysuru Junction (MYS)" },
      { code: "UBL", name: "SSS Hubballi Junction (UBL)" },
      { code: "MAQ", name: "Mangaluru Central (MAQ)" },
      { code: "BGM", name: "Belagavi (BGM)" },
      { code: "KLBG", name: "Kalaburagi / Gulbarga (KLBG)" },
      { code: "OTHER-KA", name: "Other Station (Karnataka)" },
    ],
  },
  {
    state: "Kerala",
    stations: [
      { code: "TVC", name: "Thiruvananthapuram Central (TVC)" },
      { code: "ERS", name: "Ernakulam Junction / South (ERS)" },
      { code: "ERN", name: "Ernakulam Town / North (ERN)" },
      { code: "CLT", name: "Kozhikode Main (CLT)" },
      { code: "TCR", name: "Thrissur (TCR)" },
      { code: "QLN", name: "Kollam Junction (QLN)" },
      { code: "CAN", name: "Kannur (CAN)" },
      { code: "ALLP", name: "Alappuzha (ALLP)" },
      { code: "OTHER-KL", name: "Other Station (Kerala)" },
    ],
  },
  {
    state: "Madhya Pradesh",
    stations: [
      { code: "BPL", name: "Bhopal Junction (BPL)" },
      { code: "RKMP", name: "Rani Kamlapati / Habibganj (RKMP)" },
      { code: "INDB", name: "Indore Junction (INDB)" },
      { code: "JBP", name: "Jabalpur Junction (JBP)" },
      { code: "GWL", name: "Gwalior Junction (GWL)" },
      { code: "UJN", name: "Ujjain Junction (UJN)" },
      { code: "RTM", name: "Ratlam Junction (RTM)" },
      { code: "ET", name: "Itarsi Junction (ET)" },
      { code: "KTE", name: "Katni Junction (KTE)" },
      { code: "STA", name: "Satna (STA)" },
      { code: "OTHER-MP", name: "Other Station (Madhya Pradesh)" },
    ],
  },
  {
    state: "Maharashtra",
    stations: [
      { code: "CSMT", name: "Mumbai CSMT (CSMT)" },
      { code: "MMCT", name: "Mumbai Central (MMCT)" },
      { code: "LTT", name: "Lokmanya Tilak Terminus (LTT)" },
      { code: "BDTS", name: "Bandra Terminus (BDTS)" },
      { code: "PUNE", name: "Pune Junction (PUNE)" },
      { code: "NGP", name: "Nagpur Junction (NGP)" },
      { code: "NK", name: "Nashik Road (NK)" },
      { code: "CSN", name: "Chhatrapati Sambhajinagar / Aurangabad (CSN)" },
      { code: "SUR", name: "Solapur (SUR)" },
      { code: "KOP", name: "Kolhapur SCSMT (KOP)" },
      { code: "OTHER-MH", name: "Other Station (Maharashtra)" },
    ],
  },
  {
    state: "Manipur",
    stations: [
      { code: "JRM", name: "Jiribam (JRM)" },
      { code: "OTHER-MN", name: "Other Station (Manipur)" },
    ],
  },
  {
    state: "Meghalaya",
    stations: [
      { code: "MNDP", name: "Mendipathar (MNDP)" },
      { code: "OTHER-ML", name: "Other Station (Meghalaya)" },
    ],
  },
  {
    state: "Mizoram",
    stations: [
      { code: "BHRB", name: "Bairabi (BHRB)" },
      { code: "OTHER-MZ", name: "Other Station (Mizoram)" },
    ],
  },
  {
    state: "Nagaland",
    stations: [
      { code: "DMV", name: "Dimapur (DMV)" },
      { code: "OTHER-NL", name: "Other Station (Nagaland)" },
    ],
  },
  {
    state: "Odisha",
    stations: [
      { code: "BBS", name: "Bhubaneswar (BBS)" },
      { code: "PURI", name: "Puri (PURI)" },
      { code: "CTC", name: "Cuttack Junction (CTC)" },
      { code: "ROU", name: "Rourkela Junction (ROU)" },
      { code: "BAM", name: "Brahmapur / Berhampur (BAM)" },
      { code: "SBP", name: "Sambalpur (SBP)" },
      { code: "BLS", name: "Balasore (BLS)" },
      { code: "JJKR", name: "Jajpur Keonjhar Road (JJKR)" },
      { code: "OTHER-OD", name: "Other Station (Odisha)" },
    ],
  },
  {
    state: "Punjab",
    stations: [
      { code: "ASR", name: "Amritsar Junction (ASR)" },
      { code: "LDH", name: "Ludhiana Junction (LDH)" },
      { code: "JUC", name: "Jalandhar City (JUC)" },
      { code: "BTI", name: "Bathinda Junction (BTI)" },
      { code: "PTA", name: "Patiala (PTA)" },
      { code: "PTK", name: "Pathankot Junction (PTK)" },
      { code: "OTHER-PB", name: "Other Station (Punjab)" },
    ],
  },
  {
    state: "Rajasthan",
    stations: [
      { code: "JP", name: "Jaipur Junction (JP)" },
      { code: "JU", name: "Jodhpur Junction (JU)" },
      { code: "UDZ", name: "Udaipur City (UDZ)" },
      { code: "AII", name: "Ajmer Junction (AII)" },
      { code: "KOTA", name: "Kota Junction (KOTA)" },
      { code: "BKN", name: "Bikaner Junction (BKN)" },
      { code: "JSM", name: "Jaisalmer (JSM)" },
      { code: "ABR", name: "Abu Road (ABR)" },
      { code: "OTHER-RJ", name: "Other Station (Rajasthan)" },
    ],
  },
  {
    state: "Sikkim",
    stations: [
      { code: "RPO", name: "Rangpo Railway Station (RPO)" },
      { code: "NJP-SK", name: "New Jalpaiguri Railhead (NJP - Serving Sikkim)" },
      { code: "OTHER-SK", name: "Other Station (Sikkim)" },
    ],
  },
  {
    state: "Tamil Nadu",
    stations: [
      { code: "MAS", name: "Chennai Central (MAS)" },
      { code: "MS", name: "Chennai Egmore (MS)" },
      { code: "CBE", name: "Coimbatore Junction (CBE)" },
      { code: "MDU", name: "Madurai Junction (MDU)" },
      { code: "TPJ", name: "Tiruchirappalli Junction (TPJ)" },
      { code: "SA", name: "Salem Junction (SA)" },
      { code: "RMM", name: "Rameswaram (RMM)" },
      { code: "CAPE", name: "Kanyakumari (CAPE)" },
      { code: "OTHER-TN", name: "Other Station (Tamil Nadu)" },
    ],
  },
  {
    state: "Telangana",
    stations: [
      { code: "SC", name: "Secunderabad Junction (SC)" },
      { code: "HYB", name: "Hyderabad Deccan / Nampally (HYB)" },
      { code: "KCG", name: "Kacheguda (KCG)" },
      { code: "WL", name: "Warangal (WL)" },
      { code: "KZJ", name: "Kazipet Junction (KZJ)" },
      { code: "OTHER-TS", name: "Other Station (Telangana)" },
    ],
  },
  {
    state: "Tripura",
    stations: [
      { code: "AGTL", name: "Agartala (AGTL)" },
      { code: "DMR", name: "Dharmanagar (DMR)" },
      { code: "OTHER-TR", name: "Other Station (Tripura)" },
    ],
  },
  {
    state: "Uttar Pradesh",
    stations: [
      { code: "LKO", name: "Lucknow Charbagh (LKO)" },
      { code: "LJN", name: "Lucknow Junction NER (LJN)" },
      { code: "BSB", name: "Varanasi Junction (BSB)" },
      { code: "CNB", name: "Kanpur Central (CNB)" },
      { code: "PRYJ", name: "Prayagraj Junction (PRYJ)" },
      { code: "GKP", name: "Gorakhpur Junction (GKP)" },
      { code: "AGC", name: "Agra Cantt (AGC)" },
      { code: "MTJ", name: "Mathura Junction (MTJ)" },
      { code: "AY", name: "Ayodhya Dham Junction (AY)" },
      { code: "VGLJ", name: "Virangana Lakshmibai Jhansi (VGLJ)" },
      { code: "SRE", name: "Saharanpur Junction (SRE)" },
      { code: "MB", name: "Moradabad Junction (MB)" },
      { code: "BE", name: "Bareilly Junction (BE)" },
      { code: "MTC", name: "Meerut City (MTC)" },
      { code: "DDU", name: "Pt. Deen Dayal Upadhyaya Junction (DDU)" },
      { code: "OTHER-UP", name: "Other Station (Uttar Pradesh)" },
    ],
  },
  {
    state: "Uttarakhand",
    stations: [
      { code: "HW", name: "Haridwar Junction (HW)" },
      { code: "DDN", name: "Dehradun (DDN)" },
      { code: "YNRK", name: "Yog Nagari Rishikesh (YNRK)" },
      { code: "KGM", name: "Kathgodam (KGM)" },
      { code: "RK", name: "Roorkee (RK)" },
      { code: "HDW", name: "Haldwani (HDW)" },
      { code: "OTHER-UK", name: "Other Station (Uttarakhand)" },
    ],
  },
  {
    state: "West Bengal",
    stations: [
      { code: "HWH", name: "Howrah Junction (HWH)" },
      { code: "SDAH", name: "Sealdah (SDAH)" },
      { code: "KOAA", name: "Kolkata Chitpur (KOAA)" },
      { code: "NJP", name: "New Jalpaiguri (NJP)" },
      { code: "ASN", name: "Asansol Junction (ASN)" },
      { code: "DGR", name: "Durgapur (DGR)" },
      { code: "KGP", name: "Kharagpur Junction (KGP)" },
      { code: "MLDT", name: "Malda Town (MLDT)" },
      { code: "SGUJ", name: "Siliguri Junction (SGUJ)" },
      { code: "OTHER-WB", name: "Other Station (West Bengal)" },
    ],
  },

  // Union Territories
  {
    state: "Andaman and Nicobar Islands",
    stations: [
      { code: "IXZ", name: "Port Blair Central Hub / Terminal" },
      { code: "OTHER-AN", name: "Other Location (Andaman & Nicobar)" },
    ],
  },
  {
    state: "Chandigarh",
    stations: [
      { code: "CDG", name: "Chandigarh Junction (CDG)" },
    ],
  },
  {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    stations: [
      { code: "VAPI", name: "Vapi Railway Station (VAPI - Serving Daman/DNH)" },
      { code: "OTHER-DD", name: "Other Station (Daman & Diu)" },
    ],
  },
  {
    state: "Delhi (NCT)",
    stations: [
      { code: "NDLS", name: "New Delhi Railway Station (NDLS)" },
      { code: "DLI", name: "Old Delhi Junction (DLI)" },
      { code: "NZM", name: "Hazrat Nizamuddin (NZM)" },
      { code: "ANVT", name: "Anand Vihar Terminal (ANVT)" },
      { code: "DEE", name: "Delhi Sarai Rohilla (DEE)" },
      { code: "OTHER-DL", name: "Other Station (Delhi NCR)" },
    ],
  },
  {
    state: "Jammu and Kashmir",
    stations: [
      { code: "JAT", name: "Jammu Tawi (JAT)" },
      { code: "SVDK", name: "Shri Mata Vaishno Devi Katra (SVDK)" },
      { code: "SINA", name: "Srinagar Railway Station (SINA)" },
      { code: "UHP", name: "Udhampur (UHP)" },
      { code: "OTHER-JK", name: "Other Station (Jammu & Kashmir)" },
    ],
  },
  {
    state: "Ladakh",
    stations: [
      { code: "IXL", name: "Leh Central Hub / Transit Point" },
      { code: "OTHER-LA", name: "Other Location (Ladakh)" },
    ],
  },
  {
    state: "Lakshadweep",
    stations: [
      { code: "AGX", name: "Agatti Island / Kavaratti Transit Point" },
      { code: "OTHER-LD", name: "Other Location (Lakshadweep)" },
    ],
  },
  {
    state: "Puducherry",
    stations: [
      { code: "PDY", name: "Puducherry Railway Station (PDY)" },
      { code: "OTHER-PY", name: "Other Station (Puducherry)" },
    ],
  },
];

/**
 * Returns sorted list of all 36 Indian States and Union Territories.
 */
export function getAllIndianStates(): string[] {
  return INDIAN_STATES_AND_STATIONS.map((item) => item.state).sort((a, b) =>
    a.localeCompare(b)
  );
}

/**
 * Returns the railway stations for a chosen state.
 */
export function getStationsForState(stateName: string): RailwayStation[] {
  if (!stateName) return [];
  const found = INDIAN_STATES_AND_STATIONS.find(
    (item) => item.state.toLowerCase() === stateName.trim().toLowerCase()
  );
  return found ? found.stations : [];
}

import { packagesData } from "./packages";

/**
 * Automatically determines and displays the Yatra Arrival Station
 * from the selected package's Day 1 itinerary data.
 * Safe fallback: "As per itinerary"
 */
export function getArrivalStationFromItinerary(pkg: any): string {
  if (!pkg) return "As per itinerary";

  const titleLower = (pkg.title || "").toLowerCase();

  // 1. Explicit package overrides as required by domain specifications
  if (
    titleLower.includes("2 dhaam") ||
    titleLower.includes("do dham") ||
    titleLower.includes("2 dham")
  ) {
    return "Saharanpur";
  }

  if (
    titleLower.includes("chaar dhaam") ||
    titleLower.includes("char dham")
  ) {
    return "Haridwar";
  }

  if (titleLower.includes("andaman")) {
    return "Port Blair";
  }

  // 2. Parse Day 1 itinerary data (with fallback to static dataset if empty)
  let itinerary = Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 ? pkg.itinerary : null;
  if (!itinerary) {
    const staticPkg = packagesData.find(
      (p) =>
        (pkg.slug && p.slug === pkg.slug) ||
        (pkg.title && p.title.toLowerCase() === pkg.title.toLowerCase())
    );
    if (staticPkg && Array.isArray(staticPkg.itinerary)) {
      itinerary = staticPkg.itinerary;
    }
  }

  const day1 = itinerary ? itinerary[0] : null;
  const day1Title = (day1?.title || "").trim();
  const day1Details = (day1?.details || "").trim();

  // Check title for "Arrive in / at X" or "Arrival in / at X"
  if (day1Title) {
    const arriveMatch = day1Title.match(
      /(?:arrive|arrival)(?:\s+(?:in|at|to))?\s+([A-Za-z\s]+?)(?:\s*(?:&|–|—|→|,|\/|\(|with|for|departure|stay|hotel|check|\n|$))/i
    );
    if (arriveMatch && arriveMatch[1]) {
      const candidate = arriveMatch[1].trim();
      if (
        candidate.length > 2 &&
        !["the", "your", "hotel", "airport"].includes(candidate.toLowerCase())
      ) {
        return candidate;
      }
    }

    // Check title for "X to Y" or "X → Y" or "X - Y"
    const routeMatch = day1Title.match(
      /^([A-Za-z\s]+?)\s+(?:to|–|—|→|-)\s+/i
    );
    if (routeMatch && routeMatch[1]) {
      const candidate = routeMatch[1].trim();
      if (
        candidate.length > 2 &&
        !["drive", "transfer", "flight", "departure"].includes(
          candidate.toLowerCase()
        )
      ) {
        return candidate;
      }
    }
  }

  // Check day1 details for "Arrive in / at X" or "Drive from X"
  if (day1Details) {
    const detailsMatch = day1Details.match(
      /(?:arrive|arrival|drive from)\s+(?:in|at|to)?\s*([A-Za-z\s]+?)(?:\s*(?:&|–|—|→|,|\.|\/|\(|airport|station))/i
    );
    if (detailsMatch && detailsMatch[1]) {
      const candidate = detailsMatch[1].trim();
      if (
        candidate.length > 2 &&
        !["the", "your", "hotel", "airport"].includes(candidate.toLowerCase())
      ) {
        return candidate;
      }
    }
  }

  // 3. Fallback to location city if available
  if (pkg.location && typeof pkg.location === "string") {
    const locCity = pkg.location.split(",")[0]?.trim();
    if (locCity && locCity.length > 2 && !locCity.toLowerCase().includes("multiple")) {
      return locCity;
    }
  }

  return "As per itinerary";
}
