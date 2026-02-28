import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import './AIChatbot.css';

// ── Humanized tone helpers ────────────────────────────────────────────────────
const OPENINGS = [
  "Great question!",
  "I'd love to help!",
  "Here's what I found for you 😊",
  "That's a popular choice!",
  "Let me share some details about that...",
  "Absolutely!",
  "Of course!",
];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ── Malta Area Data ───────────────────────────────────────────────────────────
const MALTA_AREA_DATA = {
  sliema: {
    name: "Sliema",
    description: "One of Malta's most sought-after addresses, Sliema offers a vibrant seafront promenade lined with restaurants, cafés, and boutiques. It's particularly popular with expats and professionals seeking a cosmopolitan lifestyle.",
    demand: "HIGH",
    aptPrice: "€250k–€500k",
    housePrice: "€450k–€900k",
    vibe: "upscale coastal town with a bustling promenade",
    features: ["sea views", "expat-friendly", "restaurants & nightlife", "shopping"],
  },
  "st. julian's": {
    name: "St. Julian's",
    description: "Malta's entertainment capital, St. Julian's blends a vibrant nightlife scene in Paceville with upmarket residential areas and stunning bay views. It's a top choice for young professionals and investors alike.",
    demand: "HIGH",
    aptPrice: "€220k–€450k",
    housePrice: "€400k–€800k",
    vibe: "entertainment hub with great nightlife and bay views",
    features: ["nightlife", "restaurants", "sea views", "investment potential"],
  },
  "st julians": {
    name: "St. Julian's",
    description: "Malta's entertainment capital, St. Julian's blends a vibrant nightlife scene in Paceville with upmarket residential areas and stunning bay views. It's a top choice for young professionals and investors alike.",
    demand: "HIGH",
    aptPrice: "€220k–€450k",
    housePrice: "€400k–€800k",
    vibe: "entertainment hub with great nightlife and bay views",
    features: ["nightlife", "restaurants", "sea views", "investment potential"],
  },
  valletta: {
    name: "Valletta",
    description: "Malta's UNESCO-listed capital is a living museum of Baroque architecture and rich history. Valletta has undergone a remarkable renaissance with boutique hotels, acclaimed restaurants, and converted palazzo apartments.",
    demand: "HIGH",
    aptPrice: "€200k–€600k",
    vibe: "UNESCO capital full of history, culture and renaissance energy",
    features: ["historic", "cultural", "boutique hotels", "palazzos", "investment"],
  },
  mdina: {
    name: "Mdina",
    description: "The 'Silent City' of Mdina is a perfectly preserved medieval walled city offering an unparalleled sense of history and exclusivity. Properties here are rare and highly prized, ranging from grand palazzos to characterful townhouses.",
    demand: "MEDIUM",
    aptPrice: "€400k–€2M",
    vibe: "medieval Silent City with rare and exclusive properties",
    features: ["historic", "exclusive", "medieval", "palazzos"],
  },
  rabat: {
    name: "Rabat",
    description: "Adjacent to the ancient walled city of Mdina, Rabat offers a quieter, more affordable alternative with easy access to central Malta's amenities. A solid choice for those wanting charm without the premium price.",
    demand: "MEDIUM",
    aptPrice: "€150k–€280k",
    vibe: "traditional village adjacent to Mdina",
    features: ["affordable", "central", "traditional character"],
  },
  mosta: {
    name: "Mosta",
    description: "Famous for its impressive Rotunda dome, Mosta is a thriving central town that perfectly combines Maltese tradition with modern convenience. It's a favourite for families seeking affordable, spacious properties.",
    demand: "MEDIUM",
    aptPrice: "€130k–€230k",
    vibe: "central family-friendly town with the famous Mosta Dome",
    features: ["affordable", "central location", "family-friendly", "spacious"],
  },
  naxxar: {
    name: "Naxxar",
    description: "A well-established residential area near Mosta, Naxxar is popular with families for its spacious properties, good schools, and green surroundings. It strikes a great balance between suburban quiet and urban accessibility.",
    demand: "MEDIUM",
    aptPrice: "€150k–€280k",
    housePrice: "€280k–€550k",
    vibe: "family-friendly residential area with good schools",
    features: ["spacious", "green areas", "family-friendly", "good schools"],
  },
  attard: {
    name: "Attard",
    description: "One of Malta's most prestigious residential areas, Attard is home to the President's Palace and beautiful botanical gardens. Known for large, well-maintained villas and houses on spacious plots.",
    demand: "MEDIUM",
    aptPrice: "€160k–€300k",
    housePrice: "€300k–€600k",
    vibe: "prestigious residential area with the Presidential Palace",
    features: ["prestigious", "spacious gardens", "quiet", "villas"],
  },
  balzan: {
    name: "Balzan",
    description: "A quiet, upscale village forming part of the prestigious Three Villages area, Balzan is known for its leafy streets, large properties, and relaxed atmosphere. Ideal for those seeking a refined residential lifestyle.",
    demand: "MEDIUM-HIGH",
    aptPrice: "€170k–€320k",
    housePrice: "€350k–€700k",
    vibe: "quiet upscale village, part of the prestigious Three Villages",
    features: ["quiet", "prestigious", "large properties", "leafy"],
  },
  lija: {
    name: "Lija",
    description: "The most prestigious of Malta's Three Villages, Lija is renowned for its stunning baroque church, immaculate village core, and some of Malta's finest private residences. A true gem for luxury buyers.",
    demand: "HIGH for luxury",
    aptPrice: "€180k–€350k",
    housePrice: "€400k–€900k",
    vibe: "most prestigious of the Three Villages, known for luxury homes",
    features: ["prestigious", "luxury", "baroque architecture", "privacy"],
  },
  swieqi: {
    name: "Swieqi",
    description: "A modern residential area conveniently located between St. Julian's and the quieter northern areas, Swieqi offers contemporary apartments and townhouses with good value for money.",
    demand: "MEDIUM-HIGH",
    aptPrice: "€200k–€380k",
    vibe: "modern residential area close to St. Julian's",
    features: ["modern", "convenient location", "good value"],
  },
  "san ġwann": {
    name: "San Ġwann",
    description: "A family-friendly residential suburb near the heart of Malta, San Ġwann offers good value properties with easy access to schools, shopping centres, and transport links.",
    demand: "MEDIUM",
    aptPrice: "€130k–€250k",
    housePrice: "€250k–€480k",
    vibe: "family-friendly suburb with good value",
    features: ["family-friendly", "good value", "central location"],
  },
  "san gwann": {
    name: "San Ġwann",
    description: "A family-friendly residential suburb near the heart of Malta, San Ġwann offers good value properties with easy access to schools, shopping centres, and transport links.",
    demand: "MEDIUM",
    aptPrice: "€130k–€250k",
    housePrice: "€250k–€480k",
    vibe: "family-friendly suburb with good value",
    features: ["family-friendly", "good value", "central location"],
  },
  msida: {
    name: "Msida",
    description: "Home to the University of Malta and featuring a picturesque yacht marina, Msida is popular with students and young professionals. It offers affordable apartments and great connectivity.",
    demand: "MEDIUM",
    aptPrice: "€130k–€220k",
    vibe: "university town with a marina, great for young professionals",
    features: ["marina views", "student-friendly", "affordable", "well-connected"],
  },
  "gżira": {
    name: "Gżira",
    description: "An emerging area with impressive waterfront views across to Manoel Island, Gżira is rapidly gaining popularity among young buyers and investors. Prices are still reasonable compared to neighbouring Sliema.",
    demand: "MEDIUM-HIGH",
    aptPrice: "€150k–€280k",
    vibe: "emerging waterfront area with great views and investment potential",
    features: ["waterfront views", "emerging area", "investment potential", "affordable"],
  },
  gzira: {
    name: "Gżira",
    description: "An emerging area with impressive waterfront views across to Manoel Island, Gżira is rapidly gaining popularity among young buyers and investors. Prices are still reasonable compared to neighbouring Sliema.",
    demand: "MEDIUM-HIGH",
    aptPrice: "€150k–€280k",
    vibe: "emerging waterfront area with great views and investment potential",
    features: ["waterfront views", "emerging area", "investment potential"],
  },
  "ta' xbiex": {
    name: "Ta' Xbiex",
    description: "An exclusive residential enclave surrounding a prestigious yacht marina, Ta' Xbiex is one of Malta's most sought-after addresses for high-net-worth individuals. Embassy residences and luxury apartments define this area.",
    demand: "HIGH for luxury",
    aptPrice: "€200k–€450k",
    vibe: "exclusive yacht marina area with embassy residences",
    features: ["yacht marina", "exclusive", "luxury", "embassy area"],
  },
  floriana: {
    name: "Floriana",
    description: "Sitting just outside Valletta's city walls, Floriana offers historic charm at more accessible price points. It's undergoing gradual regeneration and offers good value for those wanting proximity to the capital.",
    demand: "MEDIUM",
    aptPrice: "€130k–€250k",
    vibe: "historic town just outside Valletta's city walls",
    features: ["historic", "near Valletta", "good value", "regeneration"],
  },
  birgu: {
    name: "Birgu (Vittoriosa)",
    description: "One of Malta's Three Cities, Birgu is a jewel of Baroque architecture and maritime history facing the Grand Harbour. Restored townhouses and harbour views make it increasingly attractive to discerning buyers.",
    demand: "MEDIUM",
    aptPrice: "€150k–€300k",
    vibe: "historic Three Cities gem with Grand Harbour views",
    features: ["historic", "harbour views", "baroque", "Three Cities"],
  },
  vittoriosa: {
    name: "Birgu (Vittoriosa)",
    description: "One of Malta's Three Cities, Birgu is a jewel of Baroque architecture and maritime history facing the Grand Harbour. Restored townhouses and harbour views make it increasingly attractive to discerning buyers.",
    demand: "MEDIUM",
    aptPrice: "€150k–€300k",
    vibe: "historic Three Cities gem with Grand Harbour views",
    features: ["historic", "harbour views", "baroque", "Three Cities"],
  },
  senglea: {
    name: "Senglea",
    description: "The smallest of the Three Cities, Senglea occupies a dramatic promontory with water on three sides. Its waterfront properties offer some of the most dramatic harbour views in Malta.",
    demand: "MEDIUM",
    aptPrice: "€130k–€260k",
    vibe: "dramatic waterfront Three Cities peninsula",
    features: ["waterfront", "harbour views", "historic", "Three Cities"],
  },
  cospicua: {
    name: "Cospicua (Bormla)",
    description: "The most affordable of the Three Cities, Cospicua is in the early stages of regeneration and offers significant upside potential for investors willing to take a longer-term view.",
    demand: "LOW-MEDIUM",
    aptPrice: "€110k–€200k",
    vibe: "most affordable Three Cities area with regeneration potential",
    features: ["affordable", "regeneration", "investment potential", "Three Cities"],
  },
  bormla: {
    name: "Cospicua (Bormla)",
    description: "The most affordable of the Three Cities, Cospicua is in the early stages of regeneration and offers significant upside potential for investors willing to take a longer-term view.",
    demand: "LOW-MEDIUM",
    aptPrice: "€110k–€200k",
    vibe: "most affordable Three Cities area with regeneration potential",
    features: ["affordable", "regeneration", "investment potential"],
  },
  marsaskala: {
    name: "Marsaskala",
    description: "A charming seaside resort town on Malta's southeast coast, Marsaskala is beloved for its relaxed pace, picturesque creek, and family-friendly atmosphere. It's a popular second-home destination for Maltese families.",
    demand: "MEDIUM",
    aptPrice: "€150k–€280k",
    vibe: "relaxed seaside resort town popular with families",
    features: ["seafront", "family-friendly", "resort town", "relaxed lifestyle"],
  },
  marsaxlokk: {
    name: "Marsaxlokk",
    description: "Famous for its colourful traditional fishing boats (luzzus), Marsaxlokk sits on a stunning bay and hosts Malta's most popular Sunday fish market. A unique and characterful place to own property.",
    demand: "LOW-MEDIUM",
    aptPrice: "€130k–€250k",
    vibe: "picturesque fishing village on a stunning bay",
    features: ["fishing village", "bay views", "traditional", "character"],
  },
  "żurrieq": {
    name: "Żurrieq",
    description: "A traditional southern Malta village with an authentic Maltese character, Żurrieq offers good value properties away from the tourist trail. It's also close to the beautiful Blue Grotto.",
    demand: "LOW",
    aptPrice: "€110k–€200k",
    vibe: "traditional southern village near the Blue Grotto",
    features: ["traditional", "affordable", "authentic Maltese character"],
  },
  zejtun: {
    name: "Żejtun",
    description: "One of Malta's larger southern towns, Żejtun retains a strong traditional Maltese character. It offers affordable properties for those looking for an authentic lifestyle away from the tourist areas.",
    demand: "LOW-MEDIUM",
    aptPrice: "€110k–€190k",
    vibe: "large traditional southern town with Maltese character",
    features: ["traditional", "affordable", "authentic"],
  },
  fgura: {
    name: "Fgura",
    description: "An urban area in south Malta close to Paola, Fgura offers some of the most affordable apartments on the island. Well connected by public transport and close to major shopping facilities.",
    demand: "LOW-MEDIUM",
    aptPrice: "€100k–€180k",
    vibe: "urban south Malta area with affordable apartments",
    features: ["affordable", "well-connected", "urban"],
  },
  paola: {
    name: "Paola",
    description: "A well-connected urban town in south Malta, Paola is famous for the Ħal Saflieni Hypogeum, a UNESCO-listed prehistoric underground temple. It offers affordable housing with good transport links.",
    demand: "LOW-MEDIUM",
    aptPrice: "€100k–€180k",
    vibe: "urban town with UNESCO heritage and good transport links",
    features: ["affordable", "well-connected", "UNESCO heritage nearby"],
  },
  qormi: {
    name: "Qormi",
    description: "A western Malta town known for its traditional bakeries and industrial areas, Qormi offers some of the island's most affordable properties. A practical choice for those prioritising budget over location.",
    demand: "LOW",
    aptPrice: "€100k–€170k",
    vibe: "western town known as the bread-baking capital of Malta",
    features: ["affordable", "western Malta", "budget-friendly"],
  },
  "żebbuġ": {
    name: "Żebbuġ",
    description: "A traditional Maltese village in the west of the island, Żebbuġ offers authentic character and affordable prices. The village has a rich history and a charming village core.",
    demand: "LOW",
    aptPrice: "€110k–€190k",
    vibe: "traditional western village with authentic Maltese character",
    features: ["traditional", "affordable", "village character"],
  },
  "siġġiewi": {
    name: "Siġġiewi",
    description: "A rural village near the spectacular Dingli Cliffs, Siġġiewi offers an authentic countryside lifestyle with sweeping views. It's increasingly popular with those seeking space and tranquility.",
    demand: "LOW",
    aptPrice: "€100k–€180k",
    vibe: "rural village near Dingli Cliffs with countryside lifestyle",
    features: ["rural", "affordable", "countryside views", "tranquil"],
  },
  dingli: {
    name: "Dingli",
    description: "Perched on Malta's highest cliffs with sweeping views of the Mediterranean, Dingli offers a spectacular natural setting. The village is peaceful and rural, ideal for those seeking escape from urban life.",
    demand: "LOW-MEDIUM",
    aptPrice: "€110k–€200k",
    vibe: "cliff-top village with dramatic Mediterranean views",
    features: ["cliff views", "rural", "tranquil", "scenic"],
  },
  "mellieħa": {
    name: "Mellieħa",
    description: "Malta's northernmost town sits above the island's largest sandy beach, offering a resort lifestyle with stunning sea views. Mellieħa is hugely popular as a holiday home destination and increasingly as a primary residence.",
    demand: "MEDIUM-HIGH",
    aptPrice: "€180k–€350k",
    housePrice: "€300k–€700k",
    vibe: "northern resort town above Malta's best beach with stunning views",
    features: ["sea views", "beach access", "resort lifestyle", "holiday homes"],
  },
  mellieha: {
    name: "Mellieħa",
    description: "Malta's northernmost town sits above the island's largest sandy beach, offering a resort lifestyle with stunning sea views. Mellieħa is hugely popular as a holiday home destination and increasingly as a primary residence.",
    demand: "MEDIUM-HIGH",
    aptPrice: "€180k–€350k",
    housePrice: "€300k–€700k",
    vibe: "northern resort town above Malta's best beach with stunning views",
    features: ["sea views", "beach access", "resort lifestyle", "holiday homes"],
  },
  "st. paul's bay": {
    name: "St. Paul's Bay",
    description: "A popular resort area on Malta's northwest coast, St. Paul's Bay offers a relaxed coastal lifestyle with easy access to beaches and amenities. It attracts families and retirees looking for a quieter pace.",
    demand: "MEDIUM",
    aptPrice: "€140k–€280k",
    vibe: "popular resort with beaches and coastal living",
    features: ["beaches", "family-friendly", "resort atmosphere"],
  },
  "st pauls bay": {
    name: "St. Paul's Bay",
    description: "A popular resort area on Malta's northwest coast, St. Paul's Bay offers a relaxed coastal lifestyle with easy access to beaches and amenities. It attracts families and retirees looking for a quieter pace.",
    demand: "MEDIUM",
    aptPrice: "€140k–€280k",
    vibe: "popular resort with beaches and coastal living",
    features: ["beaches", "family-friendly", "resort atmosphere"],
  },
  "buġibba": {
    name: "Buġibba",
    description: "One of Malta's most popular tourist resorts, Buġibba offers a lively atmosphere, excellent restaurants, and budget-friendly property prices. It's a great entry point into the Malta property market.",
    demand: "MEDIUM",
    aptPrice: "€120k–€230k",
    vibe: "popular tourist resort with budget-friendly prices",
    features: ["tourist resort", "lively", "affordable", "restaurants"],
  },
  bugibba: {
    name: "Buġibba",
    description: "One of Malta's most popular tourist resorts, Buġibba offers a lively atmosphere, excellent restaurants, and budget-friendly property prices. It's a great entry point into the Malta property market.",
    demand: "MEDIUM",
    aptPrice: "€120k–€230k",
    vibe: "popular tourist resort with budget-friendly prices",
    features: ["tourist resort", "lively", "affordable"],
  },
  qawra: {
    name: "Qawra",
    description: "Adjacent to Buġibba, Qawra is a coastal resort area with a more residential feel. It's popular with both investors and owner-occupiers looking for sea-facing apartments at reasonable prices.",
    demand: "MEDIUM",
    aptPrice: "€130k–€240k",
    vibe: "coastal resort area adjacent to Buġibba",
    features: ["coastal", "resort", "sea views", "reasonable prices"],
  },
  gozo: {
    name: "Gozo",
    description: "Malta's sister island is a world away from the mainland's bustle — greener, quieter, and full of dramatic rural landscapes. Gozo is a dream destination for holiday homes, farmhouses, and a peaceful permanent lifestyle.",
    demand: "MEDIUM",
    aptPrice: "€120k–€280k",
    housePrice: "€200k–€600k",
    vibe: "peaceful island lifestyle with rural landscapes and farmhouses",
    features: ["island lifestyle", "rural", "farmhouses", "peaceful", "holiday homes"],
  },
  victoria: {
    name: "Victoria (Gozo)",
    description: "The capital of Gozo, Victoria (also known as Rabat) is the island's main commercial and cultural hub. The historic Citadel dominating the skyline makes it one of the most dramatic settings in the Maltese islands.",
    demand: "MEDIUM",
    aptPrice: "€120k–€280k",
    housePrice: "€200k–€600k",
    vibe: "Gozo's capital with the dramatic historic Citadel",
    features: ["island capital", "Citadel views", "farmhouses", "Gozo lifestyle"],
  },
  xlendi: {
    name: "Xlendi",
    description: "A breathtakingly beautiful bay in southwest Gozo, Xlendi is a firm favourite for those seeking stunning scenery and a relaxed pace of life. The valley leading to the bay is one of Gozo's most picturesque settings.",
    demand: "MEDIUM",
    aptPrice: "€150k–€350k",
    vibe: "stunning bay in southwest Gozo with dramatic scenery",
    features: ["bay views", "scenic", "peaceful", "Gozo lifestyle"],
  },
  marsalforn: {
    name: "Marsalforn",
    description: "Gozo's main resort bay, Marsalforn is a lively (by Gozo standards!) seaside village popular with holidaymakers and expats alike. It offers a good range of restaurants, beach clubs, and a relaxed coastal vibe.",
    demand: "MEDIUM",
    aptPrice: "€130k–€280k",
    vibe: "Gozo's main resort bay with a relaxed coastal vibe",
    features: ["bay views", "resort", "restaurants", "Gozo lifestyle"],
  },
  nadur: {
    name: "Nadur",
    description: "Perched on a hilltop plateau in eastern Gozo, Nadur enjoys panoramic views and is known for its traditional character and energetic village festa. Traditional farmhouses here are in high demand.",
    demand: "MEDIUM",
    aptPrice: "€200k–€500k",
    vibe: "hilltop Gozo village known for farmhouses and panoramic views",
    features: ["farmhouses", "panoramic views", "traditional", "Gozo"],
  },
  "xagħra": {
    name: "Xagħra",
    description: "Home to the UNESCO-listed Ġgantija temples (the world's oldest freestanding structures), Xagħra is a charming Gozo village with a beautiful central square and impressive views.",
    demand: "MEDIUM",
    aptPrice: "€150k–€350k",
    vibe: "Gozo village near the ancient Ġgantija temples",
    features: ["UNESCO heritage", "village charm", "views", "Gozo"],
  },
  xaghra: {
    name: "Xagħra",
    description: "Home to the UNESCO-listed Ġgantija temples (the world's oldest freestanding structures), Xagħra is a charming Gozo village with a beautiful central square and impressive views.",
    demand: "MEDIUM",
    aptPrice: "€150k–€350k",
    vibe: "Gozo village near the ancient Ġgantija temples",
    features: ["UNESCO heritage", "village charm", "views", "Gozo"],
  },
  "għarb": {
    name: "Għarb",
    description: "One of Gozo's most rural and characterful villages, Għarb is beloved for its stunning baroque church, traditional farmhouses, and completely unspoiled character. Perfect for those seeking total peace and authenticity.",
    demand: "LOW-MEDIUM",
    aptPrice: "€180k–€400k",
    vibe: "rural Gozo village with traditional farmhouses and unspoiled character",
    features: ["rural", "farmhouses", "traditional", "peaceful", "Gozo"],
  },
  gharb: {
    name: "Għarb",
    description: "One of Gozo's most rural and characterful villages, Għarb is beloved for its stunning baroque church, traditional farmhouses, and completely unspoiled character. Perfect for those seeking total peace and authenticity.",
    demand: "LOW-MEDIUM",
    aptPrice: "€180k–€400k",
    vibe: "rural Gozo village with traditional farmhouses and unspoiled character",
    features: ["rural", "farmhouses", "traditional", "peaceful", "Gozo"],
  },
};

// ── Rich message renderer ─────────────────────────────────────────────────────
function renderMessage(text) {
  let k = 0;

  function parseInline(str) {
    const result = [];
    const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    let last = 0;
    let m;
    while ((m = regex.exec(str)) !== null) {
      if (m.index > last) result.push(str.slice(last, m.index));
      if (m[0].startsWith('**')) {
        result.push(<strong key={k++}>{m[0].slice(2, -2)}</strong>);
      } else {
        const lm = m[0].match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (lm) {
          const ext = lm[2].startsWith('http');
          result.push(
            <a
              key={k++}
              href={lm[2]}
              className="chat-link"
              target={ext ? '_blank' : '_self'}
              rel={ext ? 'noopener noreferrer' : undefined}
            >
              {lm[1]}
            </a>
          );
        }
      }
      last = m.index + m[0].length;
    }
    if (last < str.length) result.push(str.slice(last));
    return result;
  }

  const lines = text.split('\n');
  const out = [];
  lines.forEach((line, i) => {
    if (line.startsWith('• ')) {
      out.push(
        <div key={k++} className="chat-bullet-item">
          <span className="chat-bullet-dot">•</span>
          <span>{parseInline(line.slice(2))}</span>
        </div>
      );
    } else {
      out.push(...parseInline(line));
    }
    if (i < lines.length - 1) out.push(<br key={k++} />);
  });
  return out;
}

// ── CRM mode ──────────────────────────────────────────────────────────────────
const CRM_GREETING = {
  id: 'greeting',
  role: 'bot',
  text: "👋 Hello! I'm the GKR AI Assistant. I can help you manage properties, inquiries, agents, and owners in the CRM.\n\nHow can I help you today?",
  quickReplies: ['Show me available properties', 'How do I add a property?', 'What are the latest inquiries?', 'Commission calculator info'],
};

function getCrmBotResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('available') || msg.includes('properties') || msg.includes('listing')) {
    return {
      text: `${pick(OPENINGS)} You can view all available properties by navigating to the **Properties** section in the sidebar 🏠.\n\nUse the **status filter** to show only 'Available' listings. You can also filter by:\n• 📍 Location\n• 💰 Price range\n• 🏠 Property type`,
      quickReplies: ['How do I add a property?', 'What are the latest inquiries?', 'Dashboard overview', 'Commission info'],
    };
  }
  if (msg.includes('add property') || msg.includes('new property')) {
    return {
      text: `To add a new property, go to **Properties → + Add Property** 📋.\n\nYou'll need to provide:\n• 🏠 Title and property type\n• 💰 Price and listing type (Sale/Rent)\n• 📍 Location and description\n• 👤 Owner and assigned agent\n• 📸 Photos and features`,
      quickReplies: ['Show available properties', 'Manage owners', 'Manage agents', 'Commission info'],
    };
  }
  if (msg.includes('inquiry') || msg.includes('inquiries')) {
    return {
      text: `You can view and manage all inquiries in the **Inquiries** section 📩.\n\nFrom there you can:\n• ✅ Update inquiry status (New → Contacted → Qualified → Closed)\n• 🏠 Link inquiries to specific properties\n• 👤 Assign to agents\n• 📝 Add internal notes`,
      quickReplies: ['Show available properties', 'Agent management', 'Dashboard stats', 'Help'],
    };
  }
  if (msg.includes('commission') || msg.includes('calculator')) {
    return {
      text: `Malta's standard commission structure 💰:\n\n• 📊 **Commission rate:** 5% of sale price\n• 🏛️ **VAT:** 18% on the commission amount\n• 💵 **Example:** On a €300k property = €15,000 commission + €2,700 VAT = **€17,700 total**\n\nUse the **Mortgage Calculator** tool for detailed financial planning.`,
      quickReplies: ['Show available properties', 'Dashboard stats', 'Add new property', 'Help'],
    };
  }
  if (msg.includes('dashboard') || msg.includes('stats') || msg.includes('overview')) {
    return {
      text: `The **Dashboard** gives you a complete overview of your portfolio 📊:\n\n• 🏠 Total properties and available listings\n• 📋 Properties under offer and sold\n• 👤 Total owner and agent count\n• 📈 Status breakdown chart\n• 📩 Recent inquiry summary`,
      quickReplies: ['Show available properties', 'Latest inquiries', 'Commission info', 'Help'],
    };
  }
  if (msg.includes('owner')) {
    return {
      text: `Manage all property owners in the **Owners** section 👤.\n\nFor each owner you can:\n• 📝 View and edit contact details\n• 🏠 See all their associated properties\n• 📞 Log communications\n• 📊 Track their portfolio performance`,
      quickReplies: ['Manage agents', 'Add new property', 'Show properties', 'Help'],
    };
  }
  if (msg.includes('agent')) {
    return {
      text: `Agent management is in the **Agents** section 👔.\n\nFor each agent you can:\n• 📝 View contact details and EIRA license info\n• 🏠 See all assigned properties\n• 📊 Track performance metrics\n• 📩 View their inquiry pipeline`,
      quickReplies: ['Manage owners', 'Latest inquiries', 'Add new property', 'Help'],
    };
  }
  if (msg.match(/^(hello|hi|hey|good morning|good afternoon|ciao)\b/i)) {
    return {
      text: `Hello! 👋 Welcome to the GKR CRM. I'm here to help you manage your Malta real estate portfolio!\n\nI can help with:\n• 🏠 Property management\n• 📩 Inquiry tracking\n• 👤 Owner & agent management\n• 💰 Commission calculations`,
      quickReplies: ['Show available properties', 'Latest inquiries', 'Dashboard stats', 'Commission info'],
    };
  }
  if (msg.includes('help')) {
    return {
      text: `Here's what I can help you with in the GKR CRM 🤝:\n\n• 🏠 **Properties** – add, edit, filter listings\n• 📩 **Inquiries** – manage and track leads\n• 👤 **Owners** – manage property owners\n• 👔 **Agents** – track agent performance\n• 💰 **Commission** – calculate fees and VAT\n• 📊 **Dashboard** – portfolio overview`,
      quickReplies: ['Show available properties', 'Latest inquiries', 'Dashboard stats', 'Add property'],
    };
  }
  return {
    text: `I don't have specific information about that yet, but I'm learning! 😊\n\nFor complex queries, try:\n• 📚 Checking the documentation\n• 👨‍💼 Contacting your system administrator\n• 🔍 Using the search function in the relevant section`,
    quickReplies: ['Show available properties', 'Latest inquiries', 'Help', 'Dashboard stats'],
  };
}

// ── Listings (public website) mode ────────────────────────────────────────────
const LISTINGS_GREETING = {
  id: 'greeting',
  role: 'bot',
  text: "👋 Hi! I'm GKR's AI assistant. I'm here to help you find your perfect property in Malta ☀️.\n\nI can help you find:\n• 🏠 Properties by location (Sliema, Valletta, Gozo...)\n• 💰 Options by budget\n• 🌊 Sea-view homes\n• 🏡 Villas, farmhouses and more",
  quickReplies: ['Properties in Sliema', 'Apartments under €300k', '3 bedroom villas', 'Properties for rent'],
};

function getListingsBotResponse(message) {
  const msg = message.toLowerCase();

  // 1. Location searches — check all area keys
  const matchedKey = Object.keys(MALTA_AREA_DATA).find(key => msg.includes(key));
  if (matchedKey) {
    const area = MALTA_AREA_DATA[matchedKey];
    const encoded = encodeURIComponent(area.name);
    let text = `${pick(OPENINGS)} **${area.name}** is ${area.vibe} ☀️.\n\n${area.description}\n\n`;
    text += `📊 **Demand:** ${area.demand}\n`;
    text += `🏢 **Apartments:** ${area.aptPrice}\n`;
    if (area.housePrice) text += `🏠 **Houses/Villas:** ${area.housePrice}\n`;
    if (area.features && area.features.length) {
      text += `✨ **Key features:** ${area.features.join(', ')}\n`;
    }
    text += `\n[Browse properties in ${area.name} →](/listings?search=${encoded})`;
    return {
      text,
      quickReplies: [
        `🏠 Apartments in ${area.name}`,
        `💰 Prices in ${area.name}`,
        `🗺️ Compare areas`,
        `📋 All listings`,
      ],
    };
  }

  // 2. Price range queries
  if (msg.match(/under|below|budget|affordable|cheap/i) || msg.match(/€\d|eur|\d+k/i)) {
    const numMatch = msg.match(/(\d[\d,]*)\s*k?\b/);
    const raw = numMatch ? parseInt(numMatch[1].replace(',', ''), 10) : null;
    // Treat numbers under 5000 with 'k' suffix as thousands (e.g. "300k" → 300000)
    const price = raw ? (msg.includes('k') && raw < 5000 ? raw * 1000 : raw) : null;
    if (price && price < 200000) {
      return {
        text: `${pick(OPENINGS)} For a budget under **€${price.toLocaleString()}**, here are your best options in Malta ☀️:\n\n• 🏢 **Studios** in Fgura, Paola, Qormi (from €100k)\n• 🏢 **1-bed apartments** in Cospicua, Żurrieq, Qormi\n• 🌱 Look at **southern towns** for best value\n\nTip: Focus on up-and-coming areas like Cospicua and Floriana for potential capital growth.\n\n[Browse budget-friendly properties →](/listings?maxPrice=${price})`,
        quickReplies: ['🏠 Studios in Malta', '📍 Affordable areas', '🗺️ Compare areas', '📋 All listings'],
      };
    }
    if (price && price <= 350000) {
      return {
        text: `${pick(OPENINGS)} **€${price.toLocaleString()}** opens up a great range of options across Malta 💰:\n\n• 🏢 **1–2 bed apartments** in Sliema, St. Julian's, Swieqi\n• 🏡 **Townhouses** in Mosta, Naxxar, Rabat\n• 🌊 **Sea-view apartments** in Marsaskala, Mellieħa, Buġibba\n• 🏠 **Houses** in southern and central Malta\n\n[Browse properties under €${price.toLocaleString()} →](/listings?maxPrice=${price})`,
        quickReplies: ['🌊 Sea views in budget', '🏡 Townhouses', '📍 Best areas for budget', '📋 All listings'],
      };
    }
    if (price && price <= 700000) {
      return {
        text: `${pick(OPENINGS)} With **€${price.toLocaleString()}**, you have excellent options in Malta's best areas 🏠:\n\n• 🌊 **Sea-view apartments** in Sliema, St. Julian's, Ta' Xbiex\n• 🏡 **Villas** in Attard, Lija, Naxxar\n• 🏛️ **Historic palazzos** in Valletta or Mdina\n• 🏝️ **Gozo farmhouses** for a lifestyle investment\n\n[Browse properties →](/listings?maxPrice=${price})`,
        quickReplies: ['🌊 Sliema properties', '🏡 Villas with pools', '🏛️ Valletta properties', '📋 All listings'],
      };
    }
    if (price && price > 700000) {
      return {
        text: `${pick(OPENINGS)} Welcome to Malta's **luxury property market** ✨! Your budget of **€${price.toLocaleString()}+** opens the very best:\n\n• 🏙️ **Penthouses** in Sliema, St. Julian's with rooftop pools\n• 🏡 **Luxury villas** in Lija, Mellieħa, Naxxar with private pools\n• 🏛️ **Grand palazzos** in Valletta and Mdina\n• ⛵ **Marina apartments** in Ta' Xbiex with yacht berth\n\n[Browse luxury properties →](/listings?minPrice=700000)`,
        quickReplies: ['🏙️ Penthouses', '🏡 Luxury villas', '⛵ Marina properties', '📋 All listings'],
      };
    }
    return {
      text: `${pick(OPENINGS)} Malta offers properties across all price ranges ☀️:\n\n• 💚 **Budget (under €200k):** Southern towns, Buġibba, Qawra\n• 💛 **Mid-range (€200k–€400k):** Sliema, St. Julian's, Mellieħa\n• 🧡 **Premium (€400k–€800k):** Lija, Ta' Xbiex, sea-front apartments\n• ❤️ **Luxury (€800k+):** Penthouses, villas, historic palazzos\n\n[Browse all listings →](/listings)`,
      quickReplies: ['💚 Budget properties', '💛 Mid-range options', '🧡 Premium homes', '❤️ Luxury properties'],
    };
  }

  // 3. Property type queries
  if (msg.includes('penthouse')) {
    return {
      text: `${pick(OPENINGS)} **Penthouses** in Malta offer stunning views and luxury finishes 🌅.\n\nThe best penthouses are found in:\n• 🌊 **Sliema** – sea-front penthouses with wraparound terraces (€400k–€1.5M)\n• 🎭 **St. Julian's** – bay-view penthouses near Spinola Bay (€350k–€1.2M)\n• 🏛️ **Valletta** – rooftop penthouses in converted palazzos (€500k–€2M)\n• 🏖️ **Mellieħa** – penthouses above the sandy beach (€300k–€700k)\n\n[Browse penthouses →](/listings?type=penthouse)`,
      quickReplies: ['🌊 Sliema penthouses', '🏛️ Valletta penthouses', '💰 Penthouse prices', '📋 All listings'],
    };
  }
  if (msg.includes('villa')) {
    return {
      text: `${pick(OPENINGS)} Maltese **villas** often feature private pools, gardens, and stunning views 🏡.\n\nTop villa areas:\n• 🌿 **Mellieħa** – sea-view villas near the beach (€300k–€700k)\n• 🌺 **Naxxar & Attard** – prestigious villas with large gardens (€350k–€800k)\n• 🏛️ **Lija** – Malta's most exclusive villa addresses (€500k+)\n• 🏝️ **Gozo** – rural villas with countryside views (€250k–€600k)\n\n[Browse villas →](/listings?type=villa)`,
      quickReplies: ['🏊 Villas with pools', '🌊 Sea-view villas', '🏝️ Gozo villas', '📋 All listings'],
    };
  }
  if (msg.includes('farmhouse')) {
    return {
      text: `${pick(OPENINGS)} **Farmhouses** (or 'Razzett' in Maltese) are unique traditional properties with huge character 🌾.\n\nBest areas for farmhouses:\n• 🏝️ **Gozo** – the heartland of Maltese farmhouses (€200k–€600k)\n• 🌿 **Nadur & Xagħra** – traditional Gozo hilltop farmhouses\n• 🌾 **Siġġiewi & Żebbuġ** – rural Malta farmhouses (€250k–€500k)\n• 🏛️ **Mdina surrounds** – historic farmhouses near the Silent City\n\nFarmhouses typically feature stone vaulted ceilings, courtyards, and large gardens.\n\n[Browse farmhouses →](/listings?type=farmhouse)`,
      quickReplies: ['🏝️ Gozo farmhouses', '🌿 Malta farmhouses', '💰 Farmhouse prices', '📋 All listings'],
    };
  }
  if (msg.includes('townhouse') || msg.includes('town house')) {
    return {
      text: `${pick(OPENINGS)} **Townhouses** are a quintessentially Maltese property type 🏘️.\n\nThey typically feature stone facades, traditional balconies ('gallarija'), and multiple floors. Popular areas:\n• 🏛️ **Valletta & Three Cities** – historic townhouses in the Grand Harbour area\n• 🌿 **Rabat & Mdina** – traditional townhouses near the Silent City\n• 🏡 **Mosta & Naxxar** – spacious family townhouses (€280k–€500k)\n\n[Browse townhouses →](/listings?type=townhouse)`,
      quickReplies: ['🏛️ Valletta townhouses', '🏡 Family townhouses', '💰 Townhouse prices', '📋 All listings'],
    };
  }
  if (msg.includes('apartment') || msg.includes('flat') || msg.includes('studio')) {
    if (msg.includes('studio')) {
      return {
        text: `${pick(OPENINGS)} **Studios** are perfect for young professionals and investors 🏢.\n\nStudios in Malta start from around **€100,000** in southern towns and can reach **€200,000+** in Sliema. Best areas:\n• 💰 **Budget:** Fgura, Paola, Qormi (€100k–€150k)\n• 🏙️ **Mid-range:** Msida, Floriana, Gżira (€130k–€180k)\n• ✨ **Premium:** Sliema, St. Julian's (€160k–€250k)\n\n[Browse studios →](/listings?type=studio)`,
        quickReplies: ['💰 Cheapest studios', '🌊 Sliema studios', '📈 Investment studios', '📋 All listings'],
      };
    }
    const bedMatch = msg.match(/(\d+)\s*bed/);
    const beds = bedMatch ? bedMatch[1] : null;
    return {
      text: `${pick(OPENINGS)} Malta has an excellent range of **${beds ? beds + '-bedroom ' : ''}apartments** for every budget 🏢.\n\nPopular areas:\n• 🌊 **Sea-view apartments:** Sliema, St. Julian's, Mellieħa (€200k–€600k)\n• 💼 **City living:** Valletta, Floriana, Msida (€130k–€400k)\n• 💰 **Budget-friendly:** Mosta, Naxxar, Marsaskala (€130k–€280k)\n• 🏝️ **Island escape:** Gozo apartments (€120k–€280k)\n\n[Browse all apartments →](/listings?type=apartment)`,
      quickReplies: ['🌊 Sea-view apartments', '💰 Affordable apartments', '🏝️ Gozo apartments', '📋 All listings'],
    };
  }

  // 4. Feature queries
  if (msg.includes('sea view') || msg.includes('seafront') || msg.includes('sea front') || msg.includes('sea-front') || msg.includes('ocean view')) {
    return {
      text: `${pick(OPENINGS)} **Sea-view properties** are among Malta's most prized assets 🌊.\n\nTop areas for sea views:\n• 🏖️ **Sliema** – iconic seafront promenade apartments\n• 🎭 **St. Julian's** – bay-view apartments at Spinola & Balluta\n• 🏝️ **Mellieħa** – panoramic views over Malta's best beach\n• ⛵ **Ta' Xbiex** – exclusive yacht marina views\n• 🏔️ **Dingli** – dramatic cliff-top sea views\n• 🏝️ **Gozo** – unspoiled island sea views (Xlendi, Marsalforn)\n\nExpect a **15–30% price premium** for genuine sea views.\n\n[Browse sea-view properties →](/listings?feature=sea-view)`,
      quickReplies: ['🌊 Sliema seafront', '🏝️ Mellieħa views', "⛵ Ta' Xbiex marina", '📋 All listings'],
    };
  }
  if (msg.includes('pool') || msg.includes('swimming')) {
    return {
      text: `${pick(OPENINGS)} A **private pool** is the ultimate Malta luxury 🏊!\n\nBest areas for pool properties:\n• 🌿 **Naxxar & Attard** – spacious villas with pools (€350k–€800k)\n• 🏛️ **Lija** – Malta's most prestigious pool villas\n• 🌊 **Mellieħa** – holiday villas with pools and sea views\n• 🏝️ **Gozo** – farmhouses with private pools, great for holiday lets\n\nCommunal pools are found in modern apartment complexes in Sliema, St. Julian's, and Swieqi.\n\n[Browse pool properties →](/listings?feature=pool)`,
      quickReplies: ['🏡 Villas with pools', '🌊 Pool + sea view', '🏝️ Gozo pool properties', '📋 All listings'],
    };
  }
  if (msg.includes('garden') || msg.includes('yard') || msg.includes('outdoor')) {
    return {
      text: `${pick(OPENINGS)} **Outdoor space** is a real premium in Malta 🌿.\n\nBest areas for garden properties:\n• 🌺 **Attard** – large gardens near the President's Palace\n• 🌿 **Lija & Balzan** – the Three Villages are renowned for mature gardens\n• 🏡 **Naxxar** – spacious properties with landscaped gardens\n• 🌾 **Siġġiewi & Żebbuġ** – rural properties with generous land\n• 🏝️ **Gozo** – farmhouses with large internal courtyards ('bitha')\n\n[Browse garden properties →](/listings?feature=garden)`,
      quickReplies: ['🌿 Three Villages', '🏡 Naxxar gardens', '🌾 Rural properties', '📋 All listings'],
    };
  }
  if (msg.includes('garage') || msg.includes('parking')) {
    return {
      text: `${pick(OPENINGS)} **Parking and garages** are a significant premium in Malta 🚗.\n\nIn busy towns like Sliema and Valletta, a lock-up garage can add €30k–€80k to a property's value. Areas with better parking availability:\n• 🌳 **Naxxar, Mosta, San Ġwann** – suburban areas with more parking\n• 🌿 **Three Villages** – larger properties often include garages\n• 🏘️ **Southern towns** – generally better parking availability\n\n[Browse properties with parking →](/listings?feature=garage)`,
      quickReplies: ['🏡 Properties with garage', '💰 Budget parking areas', '📋 All listings', '🗺️ Compare areas'],
    };
  }

  // 5. Comparison queries
  const areaMatches = Object.keys(MALTA_AREA_DATA).filter(k => msg.includes(k));
  if (areaMatches.length >= 2) {
    const a1 = MALTA_AREA_DATA[areaMatches[0]];
    const a2 = MALTA_AREA_DATA[areaMatches[1]];
    const text = `${pick(OPENINGS)} Here's a comparison of **${a1.name}** vs **${a2.name}** 🗺️:\n\n**${a1.name}:**\n• 📍 ${a1.vibe}\n• 📊 Demand: ${a1.demand}\n• 🏢 Apts: ${a1.aptPrice}${a1.housePrice ? `\n• 🏠 Houses: ${a1.housePrice}` : ''}\n• ✨ ${a1.features.slice(0, 3).join(', ')}\n\n**${a2.name}:**\n• 📍 ${a2.vibe}\n• 📊 Demand: ${a2.demand}\n• 🏢 Apts: ${a2.aptPrice}${a2.housePrice ? `\n• 🏠 Houses: ${a2.housePrice}` : ''}\n• ✨ ${a2.features.slice(0, 3).join(', ')}\n\n[Browse ${a1.name} →](/listings?search=${encodeURIComponent(a1.name)})  |  [Browse ${a2.name} →](/listings?search=${encodeURIComponent(a2.name)})`;
    return {
      text,
      quickReplies: [`🏠 ${a1.name} properties`, `🏠 ${a2.name} properties`, '💰 Price comparison', '📋 All listings'],
    };
  }

  // 6. Rental queries
  if (msg.includes('short let') || msg.includes('short-let') || msg.includes('holiday') || msg.includes('airbnb')) {
    return {
      text: `${pick(OPENINGS)} Malta is a **fantastic holiday let destination** ☀️!\n\n• Malta sees over **2.5 million tourists** per year\n• Peak season: June–September with very high occupancy\n• Average yields for short lets: **8–14%** in top locations\n\nBest areas for holiday lets:\n• 🌊 **Sliema & St. Julian's** – highest nightly rates\n• 🏖️ **Mellieħa** – near the beach, families love it\n• 🏛️ **Valletta** – cultural tourism, year-round demand\n• 🏝️ **Gozo** – boutique holiday home market\n\n[Browse short-let properties →](/listings?type=short-let)`,
      quickReplies: ['🌊 Sliema short lets', '🏖️ Mellieħa holiday lets', '🏝️ Gozo holiday homes', '📋 All listings'],
    };
  }
  if (msg.includes('rent') || msg.includes('long let') || msg.includes('long-let') || msg.includes('to let')) {
    return {
      text: `${pick(OPENINGS)} Malta's **rental market** is very active 🔑!\n\n**Long lets (12+ months):**\n• 1-bed: €700–€1,400/month\n• 2-bed: €1,000–€2,500/month\n• 3-bed: €1,400–€4,000/month\n\nBest areas for long lets:\n• 🏙️ **Sliema & St. Julian's** – most popular with expats\n• 🎓 **Msida** – student and young professional belt\n• 🌿 **Mosta & Naxxar** – family rentals\n\n[Browse rental properties →](/listings?type=rent)`,
      quickReplies: ['🏙️ Sliema rentals', '🎓 Msida rentals', '🏡 Family rentals', '📋 All listings'],
    };
  }

  // 7. Investment queries
  if (msg.includes('invest') || msg.includes('roi') || msg.includes('yield') || msg.includes('return')) {
    return {
      text: `${pick(OPENINGS)} Malta is an **excellent property investment destination** 💰!\n\nKey investment metrics:\n• 📈 Average capital growth: **4–7% per year**\n• 💵 Long-let rental yields: **3.5–6%**\n• 🏖️ Short-let yields (peak areas): **8–14%**\n• 🇪🇺 EU member state with a strong legal framework\n\nTop investment areas:\n• 🏙️ **Sliema & St. Julian's** – high demand, strong capital growth\n• 🏛️ **Valletta** – regeneration zone, boutique hotel market\n• 🌊 **Mellieħa** – holiday let goldmine near the beach\n• 🏝️ **Gozo** – lower entry price, growing tourist market\n\n[Browse investment properties →](/listings)`,
      quickReplies: ['📈 Best investment areas', '🏖️ Holiday let yields', '🏛️ Valletta investment', '📋 All listings'],
    };
  }

  // 8. Malta lifestyle / expat queries
  if (msg.includes('expat') || msg.includes('living in malta') || msg.includes('move to malta') || msg.includes('relocat') || msg.includes('lifestyle')) {
    return {
      text: `${pick(OPENINGS)} Malta is one of Europe's **top expat destinations** 🌞!\n\nWhy people love living here:\n• ☀️ 300+ days of sunshine per year\n• 🇬🇧 English is an official language\n• 🇪🇺 Full EU rights for EU citizens\n• 💊 Excellent public and private healthcare\n• ✈️ Direct flights across Europe\n• 🏖️ Mediterranean lifestyle with great food and beaches\n• 💰 Favourable tax residency programmes\n\nMost popular expat areas:\n• 🌊 **Sliema & St. Julian's** – cosmopolitan\n• 🏛️ **Valletta** – cultural\n• 🏝️ **Gozo** – peaceful rural lifestyle\n\n[Find your perfect Malta home →](/listings)`,
      quickReplies: ['🌊 Expat-friendly areas', '🏝️ Gozo lifestyle', '💰 Budget for expats', '📋 All listings'],
    };
  }

  // 9. Buying process
  if (msg.includes('buy') && (msg.includes('process') || msg.includes('how') || msg.includes('step'))) {
    return {
      text: `${pick(OPENINGS)} Here's the **Malta property buying process** step by step 📋:\n\n• 1️⃣ **Find your property** – browse listings, arrange viewings\n• 2️⃣ **Make an offer** – negotiate through your agent\n• 3️⃣ **Promise of Sale (Konvenju)** – sign and pay 10% deposit\n• 4️⃣ **Due diligence** – your notary checks title deeds & permits\n• 5️⃣ **Final deed** – sign the contract at the notary\n• 6️⃣ **Pay taxes** – stamp duty is **5%** of purchase price\n\nKey costs to budget:\n• 🏛️ Notary fees: ~1–2%\n• 📋 Agent commission: ~5% + 18% VAT\n• 🏦 Stamp duty: 5%\n\n[Start browsing properties →](/listings)`,
      quickReplies: ['💰 Cost of buying', '🏠 First-time buyer info', '🤝 Speak to an agent', '📋 All listings'],
    };
  }

  // 10. Contact / agent queries
  if (msg.includes('contact') || msg.includes('speak') || msg.includes('call') || msg.includes('phone') || msg.includes('email') || msg.includes('agent')) {
    return {
      text: `${pick(OPENINGS)} I'd love to connect you with one of our expert Malta property agents 🤝!\n\nClick the **'Enquire'** button on any listing to send a direct message, or reach us via:\n• 📞 **Phone:** Available Mon–Sat, 9am–6pm\n• 📧 **Email:** info@goldenkey.mt\n• 💬 **WhatsApp:** Available during office hours\n\n[Browse properties and enquire →](/listings)`,
      quickReplies: ['📋 All listings', '🏠 Popular properties', '🗺️ Areas guide', '💰 Price guide'],
    };
  }

  // Greetings
  if (msg.match(/^(hello|hi|hey|good morning|good afternoon|ciao)\b/i)) {
    return {
      text: `Hello! 👋 Welcome to Golden Key Realty! I'm here to help you find your perfect property in Malta ☀️.\n\nYou can ask me about:\n• 📍 Specific locations (Sliema, Valletta, Gozo...)\n• 💰 Price ranges and budgets\n• 🏠 Property types (apartments, villas, farmhouses...)\n• 🌊 Features (sea views, pools, gardens...)\n• 📈 Investment opportunities\n\nWhat are you looking for?`,
      quickReplies: ['🌊 Sea-view properties', '🏠 Properties in Sliema', '💰 Under €300k', '🏝️ Gozo properties'],
    };
  }

  // General price info
  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('expensive')) {
    return {
      text: `${pick(OPENINGS)} Malta property prices vary by area and type 💰:\n\n• 🏢 **Studios:** €100k–€200k\n• 🛏️ **1-bed apartments:** €130k–€350k\n• 🛏️🛏️ **2-bed apartments:** €200k–€550k\n• 🏡 **3-bed townhouses:** €300k–€800k\n• 🏊 **Villas with pools:** €500k–€3M+\n• 🏛️ **Historic palazzos:** €400k–€5M+\n• 🌾 **Gozo farmhouses:** €200k–€600k\n\n☀️ Malta offers great value compared to many European destinations!\n\n[Browse all listings →](/listings)`,
      quickReplies: ['💰 Under €300k', '🏡 Villas', '🏝️ Gozo properties', '📋 All listings'],
    };
  }

  // Help
  if (msg.includes('help') || msg.includes('what can you')) {
    return {
      text: `${pick(OPENINGS)} Here's what I can help you with 😊:\n\n• 📍 **Locations** – detailed info on 30+ Malta areas\n• 💰 **Budgets** – find what you can get at your price point\n• 🏠 **Property types** – apartments, villas, farmhouses, penthouses\n• 🌊 **Features** – sea views, pools, gardens, parking\n• 🗺️ **Area comparisons** – compare two areas side by side\n• 📈 **Investment** – yields, ROI, best investment areas\n• 🔑 **Rentals** – long lets and holiday lets\n• 📋 **Buying process** – step-by-step guide\n• 🌞 **Malta lifestyle** – expat info, weather, lifestyle\n\nJust ask away!`,
      quickReplies: ['📍 Area guide', '💰 Price guide', '📈 Investment info', '📋 All listings'],
    };
  }

  // Default fallback
  return {
    text: `I'm not sure I caught that, but here's what I can help with 😊:\n\n• 📍 [Browse all listings](/listings)\n• 🌊 [Sea-view properties](/listings?feature=sea-view)\n• 🏡 [Villas and houses](/listings?type=villa)\n• 🏝️ [Properties in Gozo](/listings?search=Gozo)\n• 💰 [Properties under €300k](/listings?maxPrice=300000)\n\nOr try asking about a specific area like **Sliema**, **Valletta**, or **Gozo**!`,
    quickReplies: ['🏠 Properties in Sliema', '🏛️ Valletta properties', '🏝️ Gozo properties', '💰 Under €300k'],
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
function AIChatbot({ variant = 'crm' }) {
  const isListings = variant === 'listings';
  const greeting = isListings ? LISTINGS_GREETING : CRM_GREETING;
  const getBotResponse = isListings ? getListingsBotResponse : getCrmBotResponse;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = (text) => {
    const msg = (text != null ? text : input).trim();
    if (!msg) return;
    // Only clear the input field when the user typed it themselves
    if (text == null) setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const response = getBotResponse(msg);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: response.text,
        quickReplies: response.quickReplies,
      }]);
      setTyping(false);
    }, 700 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const btnClass = `chatbot-quick-btn${isListings ? ' chatbot-quick-btn-listings' : ''}`;

  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`chatbot-toggle${isListings ? ' chatbot-toggle-listings' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="AI Assistant"
        aria-label="Open AI Assistant"
      >
        {open ? <X size={22} strokeWidth={2} /> : <MessageCircle size={22} strokeWidth={1.75} />}
        {!open && messages.length > 1 && <span className="chatbot-toggle-badge" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className={`chatbot-window${isListings ? ' chatbot-window-listings' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className={`chatbot-avatar${isListings ? ' chatbot-avatar-listings' : ''}`}>
                <Bot size={18} strokeWidth={1.75} />
              </div>
              <div>
                <div className="chatbot-name">GKR AI Assistant</div>
                <div className="chatbot-status">🟢 Online</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id}>
                <div className={`chatbot-msg chatbot-msg-${msg.role}`}>
                  {msg.role === 'bot' && (
                    <div className="chatbot-msg-avatar"><Bot size={12} /></div>
                  )}
                  <div className="chatbot-msg-bubble">{renderMessage(msg.text)}</div>
                </div>
                {msg.role === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="chatbot-msg-quick-replies">
                    {msg.quickReplies.map(q => (
                      <button key={q} className={btnClass} onClick={() => sendMessage(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-msg-avatar"><Bot size={12} /></div>
                <div className="chatbot-msg-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-row">
            <input
              className="chatbot-input"
              type="text"
              placeholder={isListings ? 'Ask about Malta properties…' : 'Ask me anything…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={typing}
            />
            <button
              className={`chatbot-send${isListings ? ' chatbot-send-listings' : ''}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
            >
              <Send size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;
