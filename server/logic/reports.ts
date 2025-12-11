import type { CompanyReport } from "@shared/schema";

const countryAnalysisTable = [
  { parameter: "Market Size", india: "$3.2T GDP, 1.4B population", singapore: "$400B GDP, 5.8M population" },
  { parameter: "Tech Ecosystem", india: "Mature startup ecosystem, strong IT talent pool", singapore: "Regional tech hub, excellent infrastructure" },
  { parameter: "Regulatory Environment", india: "Evolving framework, recent data localization rules", singapore: "Business-friendly, strong IP protection" },
  { parameter: "FX Volatility", india: "Medium volatility, INR managed float", singapore: "Low volatility, SGD strength" },
  { parameter: "Exit Environment", india: "Active IPO market, strategic M&A", singapore: "Strong capital markets access" },
  { parameter: "Ease of Business", india: "Improving (63rd globally)", singapore: "World-leading (2nd globally)" },
];

export function generateReport(companyId: string): CompanyReport | null {
  switch (companyId) {
    case "mantla":
      return generateMantlaReport();
    case "instaworks":
      return generateInstaworksReport();
    case "disprztech":
      return generateDisprzReport();
    default:
      return null;
  }
}

function generateMantlaReport(): CompanyReport {
  return {
    header: {
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      companyName: "Mantla Platform",
      sector: "CPaaS / Enterprise Communications",
      headquarters: "Bangalore, India",
      sourceDatabases: ["Pitchbook", "Crunchbase", "Refinitiv", "Capital IQ", "CB Insights"],
    },
    executiveSummary: [
      "Mantla Platform is a high-growth cloud communications platform targeting the underserved SME segment in India with a comprehensive omnichannel messaging solution.",
      "The company has demonstrated 42% YoY revenue growth with 78% recurring revenue, positioning it well for scalable expansion across APAC markets.",
      "Strong product-market fit evidenced by deep integrations with major CRM platforms (Salesforce, HubSpot, Zoho) and support for WhatsApp Business API, RCS, SMS, and email.",
      "Investment thesis centers on market share capture in India's rapidly growing CPaaS market (25% CAGR) and potential for geographic expansion into Southeast Asia.",
      "Key value creation levers include enterprise upselling, ARPU expansion through additional channels, and operational efficiency improvements.",
      "Exit pathways include strategic acquisition by global CPaaS players (Twilio, Infobip) or domestic tech conglomerates seeking communication infrastructure.",
    ],
    countryAnalysis: {
      table: countryAnalysisTable,
      keyPoints: [
        "India's CPaaS market is projected to reach $2.5B by 2027, growing at 25% CAGR driven by digital transformation and regulatory push for business messaging.",
        "The SME segment represents 63 million businesses in India with low CPaaS penetration, offering significant greenfield opportunity.",
        "Recent WhatsApp Business API adoption by Indian enterprises has accelerated demand for unified messaging platforms.",
        "Bangalore-based tech talent pool provides cost-effective access to skilled engineering resources for product development.",
      ],
    },
    financialAnalysis: {
      qualityOfEarnings: [
        { label: "Recurring Revenue", detail: "78% of total revenue is recurring through SaaS subscriptions and usage-based contracts" },
        { label: "Customer Retention", detail: "Net Revenue Retention of 115% indicates strong expansion within existing accounts" },
        { label: "Unit Economics", detail: "LTV/CAC ratio of 4.2x demonstrates efficient customer acquisition" },
        { label: "Revenue Recognition", detail: "Clean revenue recognition with minimal deferred revenue adjustments" },
      ],
      growthAndPositioning: [
        { label: "Revenue Growth", detail: "42% YoY growth driven by SME acquisition and enterprise expansion" },
        { label: "Gross Margin", detail: "68% gross margin with path to 72%+ through carrier optimization" },
        { label: "Market Position", detail: "Top 5 CPaaS provider in India SME segment with 8% market share" },
        { label: "Competitive Moat", detail: "Proprietary routing optimization and local carrier relationships" },
      ],
    },
    operationalAndValueCreation: [
      "Implement enterprise sales motion to move upmarket and increase deal sizes from current $15K ACV to $50K+ ACV.",
      "Expand channel coverage to include voice and video capabilities, increasing platform stickiness and ARPU.",
      "Build self-service onboarding to reduce customer acquisition costs by 30% and accelerate SME velocity.",
      "Establish presence in Southeast Asian markets (Indonesia, Philippines) leveraging existing technology stack.",
      "Optimize carrier costs through volume negotiations and intelligent routing, improving gross margins by 4-5 points.",
    ],
    exitFeasibility: [
      "Strategic acquirers include global CPaaS leaders (Twilio, Vonage/Ericsson, Infobip) seeking India market entry.",
      "Domestic technology conglomerates (Reliance Jio, Tata Digital) represent potential acquirers for communication infrastructure.",
      "IPO pathway viable given strong unit economics and India's active public markets for tech companies.",
      "Comparable transactions suggest 8-12x revenue multiples for high-growth CPaaS businesses with strong retention.",
      "3-4 year hold period recommended to execute enterprise expansion and achieve scale for optimal exit valuation.",
    ],
  };
}

function generateInstaworksReport(): CompanyReport {
  return {
    header: {
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      companyName: "Instaworks",
      sector: "CPaaS / Enterprise Communications",
      headquarters: "Mumbai, India",
      sourceDatabases: ["Pitchbook", "Crunchbase", "Refinitiv", "Capital IQ", "CB Insights"],
    },
    executiveSummary: [
      "Instaworks is a leading enterprise-grade CPaaS provider in India with established relationships with major technology companies and financial institutions.",
      "The company achieves 85% recurring revenue with industry-leading 35% YoY growth while maintaining conservative leverage (0.8x Debt/EBITDA).",
      "Differentiated by robust global delivery infrastructure with 99.99% uptime SLA and carrier-grade reliability trusted by large enterprises.",
      "Investment thesis focuses on market leadership consolidation, international expansion, and margin improvement through operational scale.",
      "Strong exit feasibility with clear strategic buyer interest from global communications platforms seeking Asia-Pacific presence.",
    ],
    countryAnalysis: {
      table: countryAnalysisTable,
      keyPoints: [
        "India represents the largest addressable market in APAC for enterprise communication platforms with $1.2B current market size.",
        "Enterprise digital transformation initiatives are driving 40%+ growth in API-based communication spending.",
        "Regulatory clarity on A2P messaging and OTP delivery has created favorable operating environment for established players.",
        "Mumbai's position as India's financial capital provides access to key enterprise customer base in BFSI sector.",
      ],
    },
    financialAnalysis: {
      qualityOfEarnings: [
        { label: "Recurring Revenue", detail: "85% recurring through enterprise contracts with 2-3 year terms" },
        { label: "Customer Quality", detail: "Top 10 customers include Fortune 500 technology companies and major Indian banks" },
        { label: "Margin Profile", detail: "32% FCF conversion with clear path to 40%+ through scale" },
        { label: "Working Capital", detail: "Negative working capital model with favorable payment terms" },
      ],
      growthAndPositioning: [
        { label: "Revenue Growth", detail: "35% YoY growth with 95% gross retention and 120% net retention" },
        { label: "Market Share", detail: "15% market share in India enterprise CPaaS, #2 position" },
        { label: "Geographic Reach", detail: "Delivery infrastructure in 50+ countries supporting multinational clients" },
        { label: "Product Breadth", detail: "Full-stack offering: SMS, Voice, Video, WhatsApp, Email, Push" },
      ],
    },
    operationalAndValueCreation: [
      "Consolidate market leadership through strategic tuck-in acquisitions of regional CPaaS providers.",
      "Expand Middle East presence leveraging existing carrier relationships and enterprise references.",
      "Launch AI-powered conversation analytics product to increase platform value and customer stickiness.",
      "Implement usage-based pricing optimization to improve revenue per message by 15-20%.",
      "Drive operational efficiency through automation of carrier onboarding and customer support.",
    ],
    exitFeasibility: [
      "Premium exit multiple expected given market leadership position and enterprise customer quality.",
      "Twilio, MessageBird, and Infobip have all executed APAC acquisitions at 10-15x revenue multiples.",
      "Strategic value proposition includes instant access to established enterprise relationships and delivery infrastructure.",
      "IPO readiness achievable within 3 years given current scale and corporate governance standards.",
      "Dual-track exit process recommended to maximize competitive tension between strategic and financial buyers.",
    ],
  };
}

function generateDisprzReport(): CompanyReport {
  return {
    header: {
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      companyName: "Disprztech",
      sector: "SaaS / EdTech / Learning Experience Platform",
      headquarters: "Singapore",
      sourceDatabases: ["Pitchbook", "Crunchbase", "Refinitiv", "Capital IQ", "CB Insights"],
    },
    executiveSummary: [
      "Disprztech is a next-generation AI-powered Learning Experience Platform (LXP) helping enterprises close skills gaps through personalized, data-driven learning pathways.",
      "The company demonstrates exceptional SaaS fundamentals with 92% recurring revenue, 55% YoY growth, and minimal leverage (0.5x Debt/EBITDA).",
      "Differentiated technology stack leverages proprietary AI/ML for skills taxonomy, competency mapping, and personalized content recommendations.",
      "Singapore headquarters provides strategic access to APAC enterprise markets while maintaining operational centers in India for cost efficiency.",
      "Investment thesis centers on capturing the growing corporate learning market as enterprises prioritize workforce reskilling in the AI era.",
      "Strong product-led growth motion complemented by enterprise sales, creating efficient customer acquisition across market segments.",
    ],
    countryAnalysis: {
      table: countryAnalysisTable,
      keyPoints: [
        "Singapore serves as ideal regional HQ with access to multinational enterprise decision-makers across APAC.",
        "Corporate learning market in APAC projected to reach $50B by 2027, with LXP segment growing at 25% CAGR.",
        "Post-pandemic enterprise focus on skills development and workforce agility driving accelerated LXP adoption.",
        "Singapore's position as regional business hub provides credibility with Fortune 500 APAC headquarters.",
      ],
    },
    financialAnalysis: {
      qualityOfEarnings: [
        { label: "Recurring Revenue", detail: "92% recurring SaaS revenue through annual and multi-year enterprise contracts" },
        { label: "Revenue Quality", detail: "Dollar-based net retention of 130%+ driven by seat expansion and module upsells" },
        { label: "Customer Concentration", detail: "Healthy diversification with top customer at 8% of revenue" },
        { label: "Unit Economics", detail: "LTV/CAC of 5.5x with 14-month CAC payback period" },
      ],
      growthAndPositioning: [
        { label: "Revenue Growth", detail: "55% YoY growth accelerating from 40% in prior year" },
        { label: "Gross Margin", detail: "82% gross margin typical of pure SaaS business model" },
        { label: "Market Position", detail: "Recognized as Leader in Gartner's Corporate LMS/LXP quadrant for APAC" },
        { label: "AI Differentiation", detail: "Proprietary skills intelligence engine with 50,000+ mapped competencies" },
      ],
    },
    operationalAndValueCreation: [
      "Expand enterprise sales team in North America to capture Fortune 500 global deployments.",
      "Launch skills marketplace connecting enterprise learning demand with curated content providers.",
      "Develop AI-powered skills assessment tools to strengthen competitive moat and increase switching costs.",
      "Build strategic partnerships with HR technology platforms (Workday, SAP SuccessFactors) for distribution.",
      "Introduce consumption-based pricing tier to capture mid-market customers through product-led growth.",
    ],
    exitFeasibility: [
      "Strategic buyers include HR technology platforms (Workday, SAP, Oracle) seeking AI-powered learning capabilities.",
      "Corporate learning market consolidation trend provides multiple potential acquirers.",
      "Comparable LXP transactions (Degreed, EdCast acquisitions) suggest 10-15x ARR multiples for market leaders.",
      "IPO pathway supported by strong SaaS metrics and growing investor interest in AI/skills-tech sector.",
      "Singapore listing provides access to deep capital markets while US listing remains viable for scale exit.",
    ],
  };
}
