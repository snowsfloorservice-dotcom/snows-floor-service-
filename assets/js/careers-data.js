// Toggle currentlyHiring to show or hide a role on careers.html and job detail routes.
// Each job can be available in one or more hiring areas through its locations array.
const SNOWS_CAREER_SERVICE_AREAS = [
  { city: "Hattiesburg", state: "MS", label: "Hattiesburg, MS", zipCodes: ["39401", "39402", "39406", "39407"], latitude: 31.3271, longitude: -89.2903 },
  { city: "Petal", state: "MS", label: "Petal, MS", zipCodes: ["39465"], latitude: 31.3466, longitude: -89.2601 },
  { city: "Rawls Springs", state: "MS", label: "Rawls Springs, MS", zipCodes: ["39402"], latitude: 31.3832, longitude: -89.3726 },
  { city: "Seminary", state: "MS", label: "Seminary, MS", zipCodes: ["39479"], latitude: 31.5627, longitude: -89.4978 },
  { city: "Collins", state: "MS", label: "Collins, MS", zipCodes: ["39428"], latitude: 31.6454, longitude: -89.5553 },
  { city: "Mount Olive", state: "MS", label: "Mount Olive, MS", zipCodes: ["39119"], latitude: 31.761, longitude: -89.6548 },
  { city: "Magee", state: "MS", label: "Magee, MS", zipCodes: ["39111"], latitude: 31.8738, longitude: -89.7337 },
  { city: "Mendenhall", state: "MS", label: "Mendenhall, MS", zipCodes: ["39114"], latitude: 31.9618, longitude: -89.8701 },
  { city: "D'Lo", state: "MS", label: "D'Lo, MS", zipCodes: ["39062"], latitude: 31.9885, longitude: -89.9001 },
  { city: "Braxton", state: "MS", label: "Braxton, MS", zipCodes: ["39044"], latitude: 32.0204, longitude: -89.9695 },
  { city: "Star", state: "MS", label: "Star, MS", zipCodes: ["39167"], latitude: 32.0932, longitude: -90.0401 },
  { city: "Florence", state: "MS", label: "Florence, MS", zipCodes: ["39073"], latitude: 32.1535, longitude: -90.1312 },
  { city: "Byram", state: "MS", label: "Byram, MS", zipCodes: ["39272"], latitude: 32.1793, longitude: -90.2454 },
  { city: "Pearl", state: "MS", label: "Pearl, MS", zipCodes: ["39208"], latitude: 32.2746, longitude: -90.132 },
  { city: "Brandon", state: "MS", label: "Brandon, MS", zipCodes: ["39042", "39047"], latitude: 32.2732, longitude: -89.9859 },
  { city: "Clinton", state: "MS", label: "Clinton, MS", zipCodes: ["39056", "39058"], latitude: 32.3415, longitude: -90.3218 }
];

// Nearby lookups are not posted hiring cities, but they help typed city/ZIP searches
// resolve to the closest available Mississippi hiring area.
const SNOWS_CAREER_NEARBY_LOCATIONS = [
  { city: "Jackson", state: "MS", label: "Jackson, MS", zipCodes: ["39201", "39202", "39203", "39204", "39205", "39206", "39209", "39211", "39212", "39213", "39216", "39217", "39225", "39269"], closestServiceArea: "Byram, MS" },
  { city: "Richland", state: "MS", label: "Richland, MS", zipCodes: ["39218"], closestServiceArea: "Florence, MS" },
  { city: "Flowood", state: "MS", label: "Flowood, MS", zipCodes: ["39232"], closestServiceArea: "Pearl, MS" },
  { city: "Terry", state: "MS", label: "Terry, MS", zipCodes: ["39170"], closestServiceArea: "Byram, MS" },
  { city: "Purvis", state: "MS", label: "Purvis, MS", zipCodes: ["39475"], closestServiceArea: "Hattiesburg, MS" },
  { city: "Sumrall", state: "MS", label: "Sumrall, MS", zipCodes: ["39482"], closestServiceArea: "Hattiesburg, MS" }
];

function careerAreaByCity(city) {
  return SNOWS_CAREER_SERVICE_AREAS.find((area) => area.city === city);
}

function careerLabelsForCities(cities) {
  return cities
    .map((city) => careerAreaByCity(city))
    .filter(Boolean)
    .map((area) => area.label);
}

function careerZipCodesForLocations(locations) {
  const locationSet = new Set(locations);
  return [...new Set(SNOWS_CAREER_SERVICE_AREAS
    .filter((area) => locationSet.has(area.label))
    .flatMap((area) => area.zipCodes))];
}

const MISSISSIPPI_HIRING_CITIES = SNOWS_CAREER_SERVICE_AREAS.map((area) => area.city);
const MISSISSIPPI_HIRING_LOCATIONS = SNOWS_CAREER_SERVICE_AREAS.map((area) => area.label);
const MISSISSIPPI_HIRING_ZIP_CODES = [...new Set(SNOWS_CAREER_SERVICE_AREAS.flatMap((area) => area.zipCodes))];
const REMOTE_LOCATION = "Remote / Mississippi";
const REMOTE_HIRING_LOCATIONS = [REMOTE_LOCATION, ...MISSISSIPPI_HIRING_LOCATIONS];
const CORE_FIELD_CITIES = ["Hattiesburg", "Petal", "Rawls Springs", "Seminary", "Collins", "Mount Olive", "Magee"];
const CORE_FIELD_LOCATIONS = careerLabelsForCities(CORE_FIELD_CITIES);
const CORE_FIELD_ZIP_CODES = careerZipCodesForLocations(CORE_FIELD_LOCATIONS);
const JACKSON_ROUTE_CITIES = ["Florence", "Byram", "Pearl", "Brandon", "Clinton"];
const JACKSON_ROUTE_LOCATIONS = careerLabelsForCities(JACKSON_ROUTE_CITIES);
const JACKSON_ROUTE_ZIP_CODES = careerZipCodesForLocations(JACKSON_ROUTE_LOCATIONS);

window.SNOWS_CAREER_SERVICE_AREAS = SNOWS_CAREER_SERVICE_AREAS;
window.SNOWS_CAREER_NEARBY_LOCATIONS = SNOWS_CAREER_NEARBY_LOCATIONS;

window.SNOWS_CAREERS_JOBS = [
  {
    slug: "floor-cleaner-intern",
    title: "Floor Cleaner Intern",
    company: "Snow's Floor Service",
    department: "Operations",
    location: "Hattiesburg, MS",
    cities: CORE_FIELD_CITIES,
    locations: CORE_FIELD_LOCATIONS,
    zipCodes: CORE_FIELD_ZIP_CODES,
    employmentType: "Internship",
    payType: "Paid internship",
    shortDescription: "Learn the basics of professional commercial floor care while supporting experienced technicians on active job sites.",
    description: "This role is built for someone who wants hands-on exposure to commercial floor care. Interns help with setup, cleanup, equipment movement, and basic service tasks while learning the standards Snow's Floor Service uses on customer job sites.",
    responsibilities: [
      "Assist with setup, cleanup, and safe movement of equipment.",
      "Support floor preparation and detail work under supervision.",
      "Follow job-site safety standards and team instructions."
    ],
    requirements: [
      "Strong work ethic and willingness to learn.",
      "Comfortable working in commercial spaces after regular business hours when needed.",
      "Able to follow directions and ask questions when something is unclear."
    ],
    schedule: "Flexible project-based shifts, including evening or weekend work depending on customer schedules.",
    transportationRequirements: "Reliable transportation to local job sites or agreed meeting points is required.",
    currentlyHiring: false
  },
  {
    slug: "floor-cleaner-trainee",
    title: "Floor Cleaner Trainee",
    company: "Snow's Floor Service",
    department: "Operations",
    location: "Hattiesburg, MS",
    cities: CORE_FIELD_CITIES,
    locations: CORE_FIELD_LOCATIONS,
    zipCodes: CORE_FIELD_ZIP_CODES,
    employmentType: "Full-time",
    payType: "Hourly",
    shortDescription: "Build hands-on skills in commercial floor cleaning, maintenance, and job-site service standards.",
    description: "Floor Cleaner Trainees learn Snow's Floor Service procedures while working alongside experienced technicians. This role is for dependable candidates who want to grow into professional commercial floor cleaning and maintenance work.",
    responsibilities: [
      "Prepare work areas, equipment, and floor care supplies.",
      "Learn cleaning, scrubbing, buffing, and maintenance procedures.",
      "Work closely with senior technicians to complete client projects.",
      "Keep job sites organized and leave customer spaces clean."
    ],
    requirements: [
      "Dependable attendance and professional appearance.",
      "Ability to lift and move floor care equipment safely.",
      "Positive attitude and comfort working as part of a crew.",
      "Willingness to learn service checklists and safety procedures."
    ],
    schedule: "Full-time schedule with flexibility for evening, overnight, or weekend commercial jobs when customers require after-hours service.",
    transportationRequirements: "Reliable transportation to local job sites or company meeting points is required.",
    currentlyHiring: false
  },
  {
    slug: "floor-cleaner",
    title: "Floor Cleaner",
    company: "Snow's Floor Service",
    department: "Operations",
    location: "Hattiesburg, MS",
    cities: CORE_FIELD_CITIES,
    locations: CORE_FIELD_LOCATIONS,
    zipCodes: CORE_FIELD_ZIP_CODES,
    employmentType: "Full-time",
    payType: "Hourly",
    shortDescription: "Perform professional floor care services for commercial facilities with a focus on reliable, polished results.",
    description: "Floor Cleaners complete commercial floor cleaning and maintenance work for local facilities. This role supports strip and wax projects, floor scrubbing, buffing, and routine maintenance visits with a focus on quality, safety, and dependable service.",
    responsibilities: [
      "Complete commercial floor cleaning and maintenance tasks.",
      "Operate floor care equipment safely and correctly.",
      "Maintain clean job sites and communicate project needs to team leads.",
      "Follow service checklists for consistent customer-ready results."
    ],
    requirements: [
      "Previous cleaning or floor care experience preferred.",
      "Ability to follow service checklists and safety procedures.",
      "Reliable transportation and schedule flexibility.",
      "Ability to stand, walk, lift, and move equipment during active jobs."
    ],
    schedule: "Full-time work with evening, overnight, and weekend availability expected for commercial floor care projects.",
    transportationRequirements: "Reliable transportation is required. Some jobs may require traveling between service areas during the same shift.",
    currentlyHiring: false
  },
  {
    slug: "team-lead-trainee",
    title: "Team Lead Trainee",
    company: "Snow's Floor Service",
    department: "Operations Leadership",
    location: "Hattiesburg, MS",
    cities: CORE_FIELD_CITIES,
    locations: CORE_FIELD_LOCATIONS,
    zipCodes: CORE_FIELD_ZIP_CODES,
    employmentType: "Full-time",
    payType: "Hourly",
    shortDescription: "Train toward crew leadership while learning project planning, quality checks, and client-ready communication.",
    description: "Team Lead Trainees learn how Snow's Floor Service plans, runs, and checks commercial floor care jobs. This position is designed for someone who already has solid work habits and wants to grow into crew leadership.",
    responsibilities: [
      "Assist team leads with job setup, task assignments, and closeout.",
      "Learn quality standards for finished commercial floors.",
      "Help keep crews organized, safe, and on schedule."
    ],
    requirements: [
      "Floor care or cleaning experience preferred.",
      "Clear communication and steady decision-making.",
      "Interest in growing into a leadership role."
    ],
    schedule: "Full-time schedule with flexibility for after-hours commercial work and occasional weekend projects.",
    transportationRequirements: "Reliable transportation to job sites, walkthroughs, and team meeting points is required.",
    currentlyHiring: false
  },
  {
    slug: "team-lead",
    title: "Floor Team Lead",
    company: "Snow's Floor Service",
    department: "Operations Leadership",
    location: "Hattiesburg, MS",
    cities: [...CORE_FIELD_CITIES, ...JACKSON_ROUTE_CITIES],
    locations: [...CORE_FIELD_LOCATIONS, ...JACKSON_ROUTE_LOCATIONS],
    zipCodes: [...new Set([...CORE_FIELD_ZIP_CODES, ...JACKSON_ROUTE_ZIP_CODES])],
    employmentType: "Full-time",
    payType: "Hourly",
    shortDescription: "Lead floor care crews on commercial projects while protecting quality, timing, safety, and client satisfaction.",
    description: "The Floor Team Lead guides commercial floor care crews through active jobs, checks finished work, and helps keep each project organized from setup through closeout. This role is for someone who can lead by example and communicate clearly with both team members and customers.",
    responsibilities: [
      "Coordinate crew tasks and job-site workflow.",
      "Inspect completed work against Snow's Floor Service standards.",
      "Communicate job progress, supply needs, and client notes.",
      "Support safe equipment use and professional conduct on customer sites."
    ],
    requirements: [
      "Commercial cleaning or floor care leadership experience.",
      "Ability to operate and guide safe use of floor care equipment.",
      "Professional communication and dependable follow-through.",
      "Comfortable documenting job notes and reporting project needs."
    ],
    schedule: "Full-time leadership role with evening, overnight, and weekend availability as required by commercial customer schedules.",
    transportationRequirements: "Reliable transportation is required. This role may require traveling across multiple hiring areas and meeting crews at different job sites.",
    currentlyHiring: false
  },
  {
    slug: "marketing-representative",
    title: "Marketing Representative",
    company: "Snow's Floor Service",
    department: "Marketing",
    location: REMOTE_LOCATION,
    cities: MISSISSIPPI_HIRING_CITIES,
    locations: REMOTE_HIRING_LOCATIONS,
    zipCodes: MISSISSIPPI_HIRING_ZIP_CODES,
    remote: true,
    nationwideRemote: false,
    employmentType: "Part-time",
    payType: "Hourly plus performance opportunities",
    shortDescription: "Represent Snow's Floor Service in the community and help introduce our commercial floor care services to local organizations.",
    description: "The Marketing Representative supports local outreach for Snow's Floor Service. This role helps introduce commercial floor care services to businesses, churches, schools, retail spaces, and facilities while keeping outreach professional and organized.",
    responsibilities: [
      "Support local outreach to businesses, schools, churches, and retail spaces.",
      "Share service information professionally and accurately.",
      "Track outreach activity and pass qualified opportunities to the sales team.",
      "Help maintain a positive, trustworthy brand presence in the community."
    ],
    requirements: [
      "Friendly, professional communication style.",
      "Comfortable with local field outreach and follow-up.",
      "Organized, dependable, and brand-conscious.",
      "Able to track notes and follow simple outreach processes."
    ],
    schedule: "Part-time schedule with flexible outreach blocks. Some daytime availability is helpful for contacting businesses.",
    transportationRequirements: "Reliable transportation may be needed for local outreach, business visits, or community events.",
    currentlyHiring: false
  },
  {
    slug: "sales-associate",
    title: "Sales Associate",
    company: "Snow's Floor Service",
    department: "Sales",
    location: REMOTE_LOCATION,
    cities: MISSISSIPPI_HIRING_CITIES,
    locations: REMOTE_HIRING_LOCATIONS,
    zipCodes: MISSISSIPPI_HIRING_ZIP_CODES,
    remote: true,
    nationwideRemote: false,
    employmentType: "Full-time",
    payType: "Base plus commission opportunities",
    shortDescription: "Help commercial clients understand floor care options, schedule walkthroughs, and move from inquiry to service plan.",
    description: "The Sales Associate helps commercial prospects understand Snow's Floor Service offerings and move from first conversation to quote, walkthrough, or maintenance plan. This role depends on clear follow-up, organized notes, and professional communication.",
    responsibilities: [
      "Follow up with qualified leads and prospective commercial clients.",
      "Coordinate walkthroughs and service conversations.",
      "Maintain clear notes on client needs, timing, and next steps.",
      "Represent Snow's Floor Service with professionalism and accuracy."
    ],
    requirements: [
      "Sales or customer-facing experience preferred.",
      "Clear phone, email, and in-person communication.",
      "Ability to understand service needs and represent the brand well.",
      "Organized follow-up habits and comfort using basic business systems."
    ],
    schedule: "Full-time schedule with availability for business-hour follow-up, walkthrough coordination, and occasional after-hours customer needs.",
    transportationRequirements: "Reliable transportation may be required for walkthroughs, local meetings, and commercial client visits.",
    currentlyHiring: false
  },
  {
    slug: "sales-intern",
    title: "Sales Intern",
    company: "Snow's Floor Service",
    department: "Sales",
    location: REMOTE_LOCATION,
    cities: MISSISSIPPI_HIRING_CITIES,
    locations: REMOTE_HIRING_LOCATIONS,
    zipCodes: MISSISSIPPI_HIRING_ZIP_CODES,
    remote: true,
    nationwideRemote: false,
    employmentType: "Internship",
    payType: "Paid internship",
    shortDescription: "Learn local service sales by supporting lead research, outreach preparation, and follow-up organization.",
    description: "The Sales Intern supports local business development by helping with research, outreach preparation, and follow-up organization. This role is designed for someone interested in sales, marketing, or local service business growth.",
    responsibilities: [
      "Research potential commercial clients and service opportunities.",
      "Assist with outreach lists, notes, and scheduling support.",
      "Learn Snow's Floor Service offerings and customer standards."
    ],
    requirements: [
      "Interest in sales, marketing, or local business development.",
      "Professional communication and attention to detail.",
      "Reliable schedule and willingness to learn."
    ],
    schedule: "Flexible internship schedule based on outreach needs and training availability.",
    transportationRequirements: "Reliable phone and internet access are required. Local transportation may be needed for occasional in-person outreach or meetings.",
    currentlyHiring: false
  }
];
