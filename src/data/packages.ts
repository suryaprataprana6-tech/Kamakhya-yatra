export interface ItineraryItem {
  day: string;
  title: string;
  details: string;
}

export interface Package {
  id: number;
  title: string;
  image: string;
  duration: string;
  price: number;
  category: "Spiritual" | "Holiday" | "International";
  slug: string;
  location: string;
  rating: string;
  description: string;
  inclusions: string[];
  itinerary: ItineraryItem[];
}

export const packagesData: Package[] = [
  // --- Spiritual / Dharmic ---
  {
    id: 1,
    title: "Amarnath Yatra",
    image: "https://images.unsplash.com/photo-1627894485200-b92fb4353967?auto=format&fit=crop&w=800&q=80",
    duration: "5N/6D",
    price: 24500,
    category: "Spiritual",
    slug: "amarnath-yatra",
    location: "Kashmir, India",
    rating: "4.9",
    description: "Embark on the holy pilgrimage to the sacred cave of Amarnath, nestled in the snow-capped Himalayas. Experience divine darshan of the natural ice Shiva Lingam.",
    inclusions: ["Standard Hotel & Tent Stay", "All Vegetarian Meals", "Pahalgam/Baltal Transfers", "Medical Assistance", "Yatra Registration Support"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Srinagar", details: "Arrive in Srinagar, meet our representative, and transfer to your hotel. Evening free to enjoy a Shikara ride on Dal Lake." },
      { day: "Day 2", title: "Srinagar to Sonamarg / Baltal", details: "Drive to Sonamarg, the Meadow of Gold. Proceed to Baltal base camp for overnight stay in tents." },
      { day: "Day 3", title: "Holy Cave Darshan", details: "Early morning trek or helicopter ride to the Amarnath Holy Cave. After Darshan of ice Lingam, return to Baltal." },
      { day: "Day 4", title: "Baltal to Srinagar", details: "Drive back to Srinagar. Visit famous Mughal Gardens like Shalimar Bagh and Nishat Bagh." },
      { day: "Day 5", title: "Srinagar Local Sightseeing", details: "Excursion to Gulmarg. Enjoy Gondola cable car ride and snow activities. Return to Srinagar for houseboat stay." },
      { day: "Day 6", title: "Departure", details: "After breakfast, check out and transfer to Srinagar Airport for your onward journey." }
    ]
  },
  {
    id: 2,
    title: "Chaar Dhaam Yatra",
    image: "/hero-kedarnath.png",
    duration: "10N/11D",
    price: 24000,
    category: "Spiritual",
    slug: "chaar-dhaam-yatra",
    location: "Uttarakhand, India",
    rating: "4.9",
    description: "Seek liberation and divine peace by visiting the four sacred abodes: Yamunotri, Gangotri, Kedarnath, and Badrinath in the pristine Himalayas.",
    inclusions: ["Semi-Deluxe Hotels", "Pure Veg Meals (Breakfast & Dinner)", "Comfortable AC Transport", "Guided Yatra Assistance", "Local Sightseeing"],
    itinerary: [
      { day: "Day 1", title: "Haridwar to Barkot", details: "Drive from Haridwar to Barkot via Mussoorie. Check-in to hotel and rest for the trek." },
      { day: "Day 2", title: "Barkot - Yamunotri - Barkot", details: "Early drive to Janki Chatti, then trek 6 km to Yamunotri. Take holy dip in Surya Kund and return to Barkot." },
      { day: "Day 3", title: "Barkot to Uttarkashi", details: "Drive to Uttarkashi along the Bhagirathi River. Visit the famous Vishwanath Temple." },
      { day: "Day 4", title: "Uttarkashi - Gangotri - Uttarkashi", details: "Drive to Gangotri. Take a holy dip in the Ganges (Bhagirathi) and offer prayers. Return to Uttarkashi." },
      { day: "Day 5", title: "Uttarkashi to Guptkashi", details: "Drive to Guptkashi along the Mandakini River. Enjoy views of the snow-clad peaks." },
      { day: "Day 6", title: "Guptkashi to Kedarnath", details: "Proceed to Sonprayag, then trek 16 km to the holy Kedarnath Temple. Attend the evening Aarti." },
      { day: "Day 7", title: "Kedarnath to Guptkashi", details: "After morning Darshan, trek back down to Sonprayag and drive back to Guptkashi." },
      { day: "Day 8", title: "Guptkashi to Badrinath", details: "Drive to Badrinath via Joshimath. Attend evening Darshan and bath in Tapt Kund." },
      { day: "Day 9", title: "Badrinath to Rudraprayag", details: "Morning Darshan, visit Mana Village (the last Indian village). Drive down to Rudraprayag." },
      { day: "Day 10", title: "Rudraprayag to Rishikesh / Haridwar", details: "Drive via Devprayag (confluence of Alaknanda & Bhagirathi). Check-in at Haridwar and attend Ganga Aarti." },
      { day: "Day 11", title: "Departure", details: "Transfer to airport/railway station for departure." }
    ]
  },
  {
    id: 3,
    title: "Rameshwaram Dham Yatra",
    image: "https://images.unsplash.com/photo-1657301810256-fc983f40160e?auto=format&fit=crop&w=800&q=80",
    duration: "8N/9D",
    price: 23000,
    category: "Spiritual",
    slug: "rameshwaram-dham-yatra",
    location: "Tamil Nadu, India",
    rating: "4.8",
    description: "Journey to the holy island of Rameshwaram, one of the Char Dhams, and experience the sacred bath in 22 teerthams and beautiful Southern temple architecture.",
    inclusions: ["3-Star Hotels", "South & North Indian Meals", "Dedicated Tour Coordinator", "AC Coach for Sightseeing", "All Entry & Darshan Tickets"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Madurai", details: "Arrive in Madurai, transfer to hotel. Visit the historical Meenakshi Amman Temple in the evening." },
      { day: "Day 2", title: "Madurai to Rameshwaram", details: "Drive across the Pamban Bridge to Rameshwaram Island. Check-in to hotel and relax." },
      { day: "Day 3", title: "Rameshwaram Darshan", details: "Take a holy dip in Agnitheertham and the 22 sacred wells inside Ramanathaswamy Temple. Visit Dhanushkodi." },
      { day: "Day 4", title: "Rameshwaram to Kanyakumari", details: "Drive to the southernmost tip of India. Check-in and witness the spectacular sunset over three oceans." },
      { day: "Day 5", title: "Kanyakumari Sightseeing", details: "Visit Vivekananda Rock Memorial, Thiruvalluvar Statue, and Kanyakumari Temple. Proceed to Madurai." },
      { day: "Day 6", title: "Departure", details: "Transfer to Madurai airport/station for departure." }
    ]
  },
  {
    id: 4,
    title: "7 Jyotirlinga Yatra",
    image: "https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=800&q=80",
    duration: "11N/12D",
    price: 20500,
    category: "Spiritual",
    slug: "7-jyotirlinga-yatra",
    location: "Multiple States, India",
    rating: "4.9",
    description: "A comprehensive sacred train journey covering 7 prominent Jyotirlingas including Mahakaleshwar, Omkareshwar, Trimbakeshwar, Bhimashankar, and others.",
    inclusions: ["Sleeper / 3AC Train tickets", "Dharmashala & Hotel stays", "Pure Vegetarian Meals", "Tour Managers", "Local sightseeing coaches"],
    itinerary: [
      { day: "Day 1", title: "Departure & Journey", details: "Board the yatra special train. Dinner and overnight stay on board." },
      { day: "Day 2", title: "Arrive in Ujjain", details: "Arrive in Ujjain, transfer to accommodation. Attend the evening Bhasma Aarti at Mahakaleshwar Jyotirlinga." },
      { day: "Day 3", title: "Ujjain & Omkareshwar", details: "Offer prayers at Harsiddhi Temple, then drive to Omkareshwar Jyotirlinga on the Narmada River island." },
      { day: "Day 4", title: "Omkareshwar to Somnath", details: "Board train for Dwarka / Somnath. Overnignt train journey." },
      { day: "Day 5", title: "Somnath Darshan", details: "Arrive in Somnath, check-in. Visit Somnath Jyotirlinga by the sea and enjoy the light and sound show." },
      { day: "Day 6", title: "Somnath to Dwarka", details: "Drive to Dwarka. Visit Dwarkadhish Temple, Nageshwar Jyotirlinga, and Bet Dwarka." },
      { day: "Day 7", title: "Dwarka to Pune / Bhimashankar", details: "Board train towards Pune for Bhimashankar. Overnight in train." },
      { day: "Day 8", title: "Bhimashankar Darshan", details: "Arrive Pune, drive to Bhimashankar Jyotirlinga in the Sahyadri hills. Return to Pune for overnight." },
      { day: "Day 9", title: "Pune to Nashik (Trimbakeshwar)", details: "Drive to Nashik, visit Trimbakeshwar Jyotirlinga and Panchavati area." },
      { day: "Day 10", title: "Nashik to Grishneshwar & Ellora", details: "Drive to Aurangabad. Visit Grishneshwar Jyotirlinga and Ellora Caves." },
      { day: "Day 11", title: "Return Journey", details: "Start return journey by train." },
      { day: "Day 12", title: "Arrival Home", details: "Arrive at your destination with divine blessings." }
    ]
  },
  {
    id: 5,
    title: "Adi Kailash Yatra",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    duration: "5N/6D",
    price: 31999,
    category: "Spiritual",
    slug: "adi-kailash-yatra",
    location: "Pithoragarh, India",
    rating: "4.9",
    description: "Trek to the pristine Adi Kailash and Om Parvat in the Vyas Valley. Marvel at the sacred peaks that resemble Mount Kailash, offering deep spiritual resonance.",
    inclusions: ["Inner Line Permits", "Homestays / Campsites", "All vegetarian meals", "4x4 SUV Transport", "Local guide & Porter assistance"],
    itinerary: [
      { day: "Day 1", title: "Kathgodam to Dharchula", details: "Drive from Kathgodam to Dharchula along the scenic Kali River. Obtain permits." },
      { day: "Day 2", title: "Dharchula to Gunji", details: "Travel by 4x4 through waterfalls and high altitude passes to Gunji village." },
      { day: "Day 3", title: "Gunji to Adi Kailash Base & Darshan", details: "Early drive to Jolingkong for majestic Darshan of Adi Kailash and Parvati Kund. Return to Gunji." },
      { day: "Day 4", title: "Gunji to Om Parvat & Nabidhang", details: "Visit Nabidhang to witness the miraculous naturally formed 'Om' symbol in snow on Om Parvat. Return to Gunji." },
      { day: "Day 5", title: "Gunji to Dharchula", details: "Drive back to Dharchula. Evening free to explore local markets and border bridge to Nepal." },
      { day: "Day 6", title: "Dharchula to Kathgodam Departure", details: "Return drive to Kathgodam. Departure in evening." }
    ]
  },

  // --- Holiday & Domestic (Desh Yatra) ---
  {
    id: 6,
    title: "Andaman & Nicobar",
    image: "/hero-beach.png",
    duration: "5N/6D",
    price: 41090,
    category: "Holiday",
    slug: "andaman-nicobar",
    location: "Andaman Islands, India",
    rating: "4.8",
    description: "Explore the tropical paradise of Andaman. Relax on the white sands of Radhanagar Beach, snorkel in crystal clear waters, and visit Cellular Jail.",
    inclusions: ["Premium Resorts", "Private Ferry Transfers", "Snorkeling Session", "AC Cab for Sightseeing", "Airport Pickup & Drop"],
    itinerary: [
      { day: "Day 1", title: "Arrive Port Blair", details: "Arrive at Port Blair. Check in to hotel. Visit Cellular Jail and watch the Light & Sound Show." },
      { day: "Day 2", title: "Port Blair to Havelock Island", details: "Take a luxury cruise/ferry to Havelock Island. Visit Radhanagar Beach, one of Asia's finest beaches." },
      { day: "Day 3", title: "Elephant Beach excursion", details: "Speedboat ride to Elephant Beach. Participate in water sports like snorkeling and glass bottom boat ride." },
      { day: "Day 4", title: "Havelock to Neil Island", details: "Transfer to Neil Island. Visit Laxmanpur beach and the Natural Bridge formation." },
      { day: "Day 5", title: "Neil Island to Port Blair", details: "Return to Port Blair. Visit Samudrika Marine Museum or do souvenir shopping." },
      { day: "Day 6", title: "Departure", details: "Transfer to airport for departure flight." }
    ]
  },
  {
    id: 7,
    title: "Kamakhya Darjeeling Gangtok",
    image: "/hero-kamakhya.png",
    duration: "7N/8D",
    price: 22000,
    category: "Holiday",
    slug: "kamakhya-darjeeling-gangtok",
    location: "North East, India",
    rating: "4.8",
    description: "A wonderful blend of spirituality at Kamakhya Temple in Guwahati, tea garden hills of Darjeeling, and the beautiful monasteries of Gangtok.",
    inclusions: ["Cozy Hotels", "Daily Breakfast & Dinner", "SUV vehicle for point-to-point tours", "Permit arrangements", "Guwahati-NJP Transfers"],
    itinerary: [
      { day: "Day 1", title: "Arrive in Guwahati & Kamakhya Darshan", details: "Arrive in Guwahati. Seek blessings at the powerful Maa Kamakhya Temple. Overnight in Guwahati." },
      { day: "Day 2", title: "Guwahati to Gangtok", details: "Drive from Guwahati to Gangtok (Sikkim). Check-in to hotel and explore MG Marg." },
      { day: "Day 3", title: "Tsomgo Lake & Baba Mandir Excursion", details: "Visit the high-altitude Tsomgo Lake and the sacred Baba Harbhajan Singh Mandir." },
      { day: "Day 4", title: "Gangtok to Darjeeling", details: "Transfer to Darjeeling. Check-in and watch the sunset behind Mount Kanchenjunga." },
      { day: "Day 5", title: "Darjeeling Tiger Hill & Local Tour", details: "Wake up at 4 AM to witness sunrise over Everest and Kanchenjunga at Tiger Hill. Visit Batasia Loop and tea gardens." },
      { day: "Day 6", title: "Darjeeling to Guwahati / NJP", details: "Drive to NJP station/Guwahati airport for your return journey." }
    ]
  },
  {
    id: 8,
    title: "Kerala & Kanyakumari",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    duration: "8N/9D",
    price: 22000,
    category: "Holiday",
    slug: "koriginal-kerala-kanyakumari", // changed slug for differentiation
    location: "South India",
    rating: "4.9",
    description: "Enjoy the lush tea fields of Munnar, a romantic houseboat cruise in Alleppey backwaters, and stand at the ocean confluence in Kanyakumari.",
    inclusions: ["Houseboat Stay with All Meals", "Deluxe Resorts in Munnar/Thekkady", "Private AC Cab", "Spice Plantation Tour", "Kathakali Dance Show Entry"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Cochin & drive to Munnar", details: "Arrive Cochin, drive to Munnar. View Cheeyappara waterfalls on the way. Check in to Munnar resort." },
      { day: "Day 2", title: "Munnar Sightseeing", details: "Visit Mattupetty Dam, Echo Point, Tea Museum, and Eravikulam National Park to spot Nilgiri Tahr." },
      { day: "Day 3", title: "Munnar to Thekkady", details: "Drive to Thekkady. Visit spice gardens, enjoy a boat safari on Periyar Lake." },
      { day: "Day 4", title: "Thekkady to Alleppey Houseboat", details: "Transfer to Alleppey. Board traditional Kerala houseboat. Cruise through scenic canals with freshly prepared meals." },
      { day: "Day 5", title: "Alleppey to Kovalam Beach", details: "Check out from houseboat, drive to Kovalam. Relax on the crescent beaches." },
      { day: "Day 6", title: "Kovalam to Kanyakumari Excursion", details: "Visit Vivekananda Rock, Kanyakumari Temple, and view the sunset. Return to Kovalam." },
      { day: "Day 7", title: "Departure", details: "Transfer to Cochin/Trivandrum Airport for departure." }
    ]
  },
  {
    id: 9,
    title: "Kashmir Paradise Group Package",
    image: "https://images.unsplash.com/photo-1571679654681-ba01b9e1e117?auto=format&fit=crop&w=800&q=80",
    duration: "5N/6D",
    price: 18500,
    category: "Holiday",
    slug: "kashmir-paradise",
    location: "Kashmir, India",
    rating: "4.8",
    description: "Walk in the gardens of Srinagar, play in the snows of Gulmarg, and hike beside the glaciers of Sonamarg. Experience a luxury stay in a Dal Lake houseboat.",
    inclusions: ["Houseboat & Hotel Stays", "Breakfast & Dinner", "Shikara Ride", "All transfers by private cab", "Local guide"],
    itinerary: [
      { day: "Day 1", title: "Srinagar Arrival & Houseboat Stay", details: "Arrive in Srinagar. Check in to house boat. Experience a beautiful sunset Shikara Ride." },
      { day: "Day 2", title: "Srinagar to Gulmarg", details: "Drive to Gulmarg, the Meadow of Flowers. Enjoy the famous Gondola cable car ride." },
      { day: "Day 3", title: "Gulmarg to Pahalgam", details: "Drive to Pahalgam, the Valley of Shepherds. Visit saffron fields and Avantipura ruins." },
      { day: "Day 4", title: "Pahalgam Exploration", details: "Excursion to Betaab Valley, Aru Valley, and Chandanwari. Rest in Pahalgam." },
      { day: "Day 5", title: "Pahalgam to Srinagar Local Tour", details: "Return to Srinagar. Visit Shalimar Bagh, Nishat Bagh, and Hazratbal Shrine." },
      { day: "Day 6", title: "Departure", details: "Transfer to Srinagar airport." }
    ]
  },
  {
    id: 10,
    title: "Rajasthan Desert Tour",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    duration: "6N/7D",
    price: 21000,
    category: "Holiday",
    slug: "rajasthan-desert-tour",
    location: "Rajasthan, India",
    rating: "4.7",
    description: "Dive into royal heritage: explore Jaipur's pink palaces, Udaipur's lakes, and camp overnight in the golden sand dunes of Jaisalmer with folk dance performances.",
    inclusions: ["Heritage Hotels & Desert Camp", "Traditional Welcome & Meals", "Camel Safari in Thar Desert", "Folk Dance and Music Night", "Sightseeing Guide"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Jaipur", details: "Arrive in the Pink City. Check-in to hotel. Visit Birla Temple and Chokhi Dhani for Rajasthani dinner." },
      { day: "Day 2", title: "Jaipur Forts Tour", details: "Visit Amber Fort (enjoy elephant/jeep ride), Hawa Mahal, City Palace, and Jantar Mantar." },
      { day: "Day 3", title: "Jaipur to Jodhpur", details: "Drive to Jodhpur. Visit Mehrangarh Fort, Jaswant Thada, and Umaid Bhawan Palace." },
      { day: "Day 4", title: "Jodhpur to Jaisalmer Desert Camp", details: "Drive to Jaisalmer. Proceed to Sam Sand Dunes. Enjoy Camel Safari, Rajasthani folk music, and stay in luxury tents." },
      { day: "Day 5", title: "Jaisalmer Fort & Havelis", details: "Visit the Golden Fort, Patwon ki Haveli, and Salim Singh ki Haveli. Rest in Jaisalmer hotel." },
      { day: "Day 6", title: "Jaisalmer to Jodhpur Departure", details: "Drive back to Jodhpur airport/station for departure." }
    ]
  },

  // --- International (Videsh Yatra) ---
  {
    id: 11,
    title: "Bhutan Tour",
    image: "https://images.unsplash.com/photo-1553856622-d1b352e9a211?auto=format&fit=crop&w=800&q=80",
    duration: "8N/9D",
    price: 28900,
    category: "International",
    slug: "bhutan-tour",
    location: "Bhutan",
    rating: "4.9",
    description: "Discover the Land of the Thunder Dragon. Hike up to the legendary Tiger's Nest Monastery in Paro, visit Tashichho Dzong in Thimphu, and cross the Punakha suspension bridge.",
    inclusions: ["Bhutan Visa & SDF Fees", "3-Star Hotels", "All Meals Included", "English-speaking Local Guide", "Private SUV Transfer"],
    itinerary: [
      { day: "Day 1", title: "Arrive at Paro & drive to Thimphu", details: "Fly to Paro, meet your guide, and take a scenic 1.5 hr drive to Thimphu, the capital city." },
      { day: "Day 2", title: "Thimphu Sightseeing", details: "Visit Buddha Dordenma (Giant Buddha Statue), Simply Bhutan Museum, and Thimphu Dzong." },
      { day: "Day 3", title: "Thimphu to Punakha via Dochula Pass", details: "Drive to Punakha. Stop at Dochula Pass (3,100m) to view Himalayan peaks. Visit Punakha Dzong." },
      { day: "Day 4", title: "Punakha to Paro", details: "Drive back to Paro. Visit Ta Dzong (National Museum) and Rinpung Dzong." },
      { day: "Day 5", title: "Tiger's Nest Monastery Hike", details: "Trek up to the spectacular Paro Taktsang (Tiger's Nest), hanging on a cliff 900 meters above the valley." },
      { day: "Day 6", title: "Departure", details: "Transfer to Paro Airport for flight home." }
    ]
  },
  {
    id: 12,
    title: "Nepal Muktinath Yatra",
    image: "https://images.unsplash.com/photo-1558799401-1dcba79834c2?auto=format&fit=crop&w=800&q=80",
    duration: "7N/8D",
    price: 35000,
    category: "International",
    slug: "nepal-muktinath-yatra",
    location: "Nepal",
    rating: "4.8",
    description: "Perform holy prayers at Muktinath Temple (sacred to Hindus & Buddhists) in the Mustang region, and tour Pashupatinath and Pokhara Lakes.",
    inclusions: ["Pashupatinath Temple Entry", "Jomsom-Pokhara flights or 4x4 Jeep", "Pokhara Lake Boating", "Deluxe Hotels", "Border Assistance"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Kathmandu", details: "Arrive in Kathmandu, transfer to hotel. Rest and prepare for the pilgrimage." },
      { day: "Day 2", title: "Kathmandu Valley Tour", details: "Visit Pashupatinath Temple, Boudhanath Stupa, and Swayambhunath (Monkey Temple)." },
      { day: "Day 3", title: "Kathmandu to Pokhara", details: "Scenic drive to Pokhara, the city of lakes. Check in and enjoy boating on Fewa Lake." },
      { day: "Day 4", title: "Pokhara to Jomsom", details: "Take a thrilling flight or jeep ride through the deepest gorge to Jomsom." },
      { day: "Day 5", title: "Muktinath Darshan", details: "Drive by jeep to Muktinath Temple. Take a bath under 108 holy water spouts. Return to Jomsom." },
      { day: "Day 6", title: "Jomsom to Pokhara", details: "Fly or drive back to Pokhara. Visit Devi's Fall and Gupteshwor Cave." },
      { day: "Day 7", title: "Pokhara to Kathmandu", details: "Drive back to Kathmandu. Evening free for shopping in Thamel." },
      { day: "Day 8", title: "Departure", details: "Transfer to Kathmandu Airport for flight home." }
    ]
  },
  {
    id: 13,
    title: "Sri Lanka Ramayana Spiritual Tour",
    image: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80",
    duration: "6N/7D",
    price: 85000,
    category: "International",
    slug: "sri-lanka-ramayana-tour",
    location: "Sri Lanka",
    rating: "4.9",
    description: "Follow the sacred Ramayana trails in Sri Lanka. Visit Ashoka Vatika, Ravana Falls, Sanjeevani Hill, and the ancient Munneswaram Temple.",
    inclusions: ["Delhi-Colombo Flights", "4-Star Hotels", "All Buffet Meals", "Ramayana Specialist Guide", "Visa Fees Included"],
    itinerary: [
      { day: "Day 1", title: "Arrive Colombo & drive to Kandy", details: "Arrive Colombo, meet guide, and drive to Kandy. Visit Pinnawala Elephant Orphanage on the way." },
      { day: "Day 2", title: "Kandy Temple & Temple of Tooth", details: "Visit the sacred Temple of the Tooth Relic. Witness Kandy Cultural Dance show." },
      { day: "Day 3", title: "Kandy to Nuwara Eliya (Ashoka Vatika)", details: "Drive to Nuwara Eliya. Visit Seetha Amman Temple (Ashoka Vatika) and Gayathri Peedam." },
      { day: "Day 4", title: "Ravana Caves & Falls", details: "Explore Ravana Ella falls and Ravana Caves. Enjoy Sri Lankan tea estate walks." },
      { day: "Day 5", title: "Nuwara Eliya to Bentota", details: "Drive to Bentota coastal town. Enjoy a Madu River boat safari." },
      { day: "Day 6", title: "Bentota to Colombo City Tour", details: "Drive to Colombo. Visit Panchamuga Anjaneyar Temple (dedicated to Hanuman). City sightseeing." },
      { day: "Day 7", title: "Departure Colombo", details: "Transfer to Colombo Airport for return flight." }
    ]
  },
  {
    id: 14,
    title: "Bali Bliss",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    duration: "5N/6D",
    price: 42000,
    category: "International",
    slug: "bali-bliss",
    location: "Bali, Indonesia",
    rating: "4.8",
    description: "Recharge your spirit in beautiful Bali. Tour ancient clifftop temples, stroll through lush rice terraces, swing over jungle ravines, and relax in private pool villas.",
    inclusions: ["Private Pool Villa Stay (1 Night)", "Daily Breakfast", "Kintamani Volcano & Ubud Swing Tour", "Tanah Lot Sunset Temple Tour", "Sim Card & Transfers"],
    itinerary: [
      { day: "Day 1", title: "Arrive Bali", details: "Arrive in Denpasar, Bali. Traditional flower welcome, transfer to your hotel." },
      { day: "Day 2", title: "Ubud & Kintamani Volcano", details: "Visit Celuk Village (silverware), Tegenungan Waterfall, Kintamani Volcano, and the famous Bali Swing." },
      { day: "Day 3", title: "Tirta Empul & Tanah Lot", details: "Visit holy spring temple Tirta Empul, Tegallalang Rice Terraces, and the spectacular sea temple Tanah Lot at sunset." },
      { day: "Day 4", title: "Nusa Penida Island Tour", details: "Take speed boat to Nusa Penida. Visit Kelingking Cliff Beach, Angel Billabong, and Broken Beach." },
      { day: "Day 5", title: "Uluwatu Sunset Temple & Villa check-in", details: "Check into your private pool villa. Visit Uluwatu temple on a cliff edge and watch Kecak Fire Dance." },
      { day: "Day 6", title: "Departure", details: "Relax at villa before checkout. Transfer to airport for flight home." }
    ]
  },
  {
    id: 15,
    title: "Maldives Honeymoon",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    duration: "4N/5D",
    price: 85000,
    category: "Holiday",
    slug: "maldives-honeymoon",
    location: "Maldives",
    rating: "5.0",
    description: "The ultimate luxury island getaway. Stay in an overwater villa, swim with sea turtles, and enjoy candlelit dinners on a private sandy beach.",
    inclusions: ["Overwater Villa Stay (2 Nights)", "All Inclusive Meal Plan", "Speedboat Transfers", "Snorkeling Equipment", "Honeymoon Freebies (Cake, Wine)"],
    itinerary: [
      { day: "Day 1", title: "Arrive Maldives", details: "Arrive at Male Airport, transfer to resort by speedboat. Enjoy welcome drink and settle in beach villa." },
      { day: "Day 2", title: "Water Sports & Snorkeling", details: "Explore the house reef. Snorkel with turtles and manta rays. Enjoy buffet dinners." },
      { day: "Day 3", title: "Overwater Villa Check-in", details: "Move to your Water Villa with direct ocean access. Witness a beautiful Indian Ocean sunset from your deck." },
      { day: "Day 4", title: "Spa & Sunset Cruise", details: "Pamper yourself with a couples massage. Take a sunset dhoni cruise to spot dolphins." },
      { day: "Day 5", title: "Departure", details: "Check out and take speedboat back to Male Airport for flight home." }
    ]
  }
];

export const getPackageBySlug = (slug: string): Package | undefined => {
  return packagesData.find(p => p.slug === slug);
};
