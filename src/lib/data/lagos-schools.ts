export interface LagosSchool {
  name: string;
  area: string;
}

/**
 * Curated list of well-known private primary and secondary schools in Lagos.
 * Used as autocomplete suggestions in the beta signup form.
 */
export const lagosSchools: LagosSchool[] = [
  // Victoria Island / Ikoyi / Lekki
  { name: 'Atlantic Hall', area: 'Epe' },
  { name: 'British International School Lagos', area: 'Victoria Island' },
  { name: 'Chrisland School', area: 'Victoria Island' },
  { name: 'Corona School Victoria Island', area: 'Victoria Island' },
  { name: 'Dowen College', area: 'Lekki' },
  { name: 'Dreamland Kiddies School', area: 'Lekki' },
  { name: 'Fountain Heights School', area: 'Lekki' },
  { name: 'Grange School', area: 'Ikeja' },
  { name: 'Greensprings School', area: 'Lekki' },
  { name: 'Hallmark School', area: 'Lekki' },
  { name: 'Jephthah Comprehensive Secondary School', area: 'Ikoyi' },
  { name: 'Lagos Preparatory School', area: 'Ikoyi' },
  { name: 'Lekki British School', area: 'Lekki' },
  { name: 'Meadow Hall School', area: 'Lekki' },
  { name: 'Olashore International School', area: 'Lekki' },
  { name: 'Rainbow College', area: 'Lekki' },
  { name: 'St. Saviour\'s School', area: 'Ikoyi' },
  { name: 'The Olive Branch School', area: 'Lekki' },
  { name: 'Vivian Fowler Memorial College', area: 'Lekki' },
  { name: 'Whitesands School', area: 'Lekki' },

  // Ikeja / Maryland / Magodo
  { name: 'Adebayo Mokuolu Memorial School', area: 'Ikeja' },
  { name: 'Caleb International School', area: 'Magodo' },
  { name: 'Children International School', area: 'Lekki' },
  { name: 'Corona School Agbara', area: 'Agbara' },
  { name: 'Corona School Gbagada', area: 'Gbagada' },
  { name: 'Corona School Ikoyi', area: 'Ikoyi' },
  { name: 'De Kinder International School', area: 'Magodo' },
  { name: 'Dansol High School', area: 'Ikeja' },
  { name: 'Day Waterman College', area: 'Ikeja' },
  { name: 'Deeper Life High School', area: 'Gbagada' },
  { name: 'Fountain Nursery and Primary School', area: 'Magodo' },
  { name: 'Grace High School', area: 'Gbagada' },
  { name: 'Greater Heights International School', area: 'Magodo' },
  { name: 'Ikeja Junior High School', area: 'Ikeja' },
  { name: 'Kings College', area: 'Lagos Island' },
  { name: 'Lifeforte International School', area: 'Ikeja' },
  { name: 'Oxbridge Tutorial College', area: 'Maryland' },
  { name: 'Pan African International School', area: 'Magodo' },
  { name: 'Queen\'s College Lagos', area: 'Yaba' },
  { name: 'Regent School', area: 'Magodo' },

  // Surulere / Yaba / Mainland
  { name: 'Aunty Ayo\'s School', area: 'Surulere' },
  { name: 'Baptist Academy', area: 'Obanikoro' },
  { name: 'CMS Grammar School', area: 'Bariga' },
  { name: 'Christ the King College', area: 'Onitolo' },
  { name: 'Federal Government College', area: 'Ijanikin' },
  { name: 'Government College Ikorodu', area: 'Ikorodu' },
  { name: 'Holy Child College', area: 'Obalende' },
  { name: 'Igbobi College', area: 'Yaba' },
  { name: 'International School Lagos', area: 'Yaba' },
  { name: 'Methodist Boys\' High School', area: 'Victoria Island' },

  // Ajah / Sangotedo / Ibeju-Lekki
  { name: 'Babington Macaulay Junior Seminary', area: 'Ikorodu' },
  { name: 'Berean Christian Academy', area: 'Ajah' },
  { name: 'Bloombreed High School', area: 'Ajah' },
  { name: 'Bright Future Academy', area: 'Sangotedo' },
  { name: 'Chrisland College Idimu', area: 'Idimu' },
  { name: 'Christower International School', area: 'Ajah' },
  { name: 'Cherryfield College', area: 'Ajah' },
  { name: 'Covenant Christian Centre Schools', area: 'Iganmu' },
  { name: 'Dig-It School', area: 'Ajah' },
  { name: 'Eversfield Schools', area: 'Sangotedo' },

  // Festac / Amuwo-Odofin / Ojo
  { name: 'Festac Grammar School', area: 'Festac' },
  { name: 'Holy Rosary College', area: 'Amuwo-Odofin' },
  { name: 'Jesuit Memorial College', area: 'Festac' },
  { name: 'Jesyland School', area: 'Festac' },
  { name: 'Providence Heights Secondary School', area: 'Festac' },
  { name: 'Temple School', area: 'Festac' },
  { name: 'The Ambassadors College', area: 'Ojo' },

  // Ikorodu / Epe
  { name: 'Adrao International School', area: 'Ikorodu' },
  { name: 'Chrisland School Ikorodu', area: 'Ikorodu' },
  { name: 'Grace Land Academy', area: 'Ikorodu' },
  { name: 'Ikorodu Grammar School', area: 'Ikorodu' },
  { name: 'New Hall International School', area: 'Epe' },
  { name: 'St. Peter\'s College Ikorodu', area: 'Ikorodu' },

  // Other notable schools
  { name: 'Avi-Cenna International School', area: 'Ikeja' },
  { name: 'Brentfield Academy', area: 'Magodo' },
  { name: 'Chrisland School Opebi', area: 'Ikeja' },
  { name: 'Greenfield Academy', area: 'Surulere' },
  { name: 'Heritage School', area: 'Ikeja' },
  { name: 'Lafarge Africa School', area: 'Ewekoro' },
  { name: 'Lead British International School', area: 'Ikeja' },
  { name: 'Nobel Hall Academic Centre', area: 'Surulere' },
  { name: 'Prestige International School', area: 'Ajah' },
  { name: 'Scholars International Academy', area: 'Lekki' },
  { name: 'St. Gregory\'s College', area: 'Ikoyi' },
  { name: 'St. Finbarr\'s College', area: 'Akoka' },
  { name: 'Tansian International School', area: 'Lekki' },
  { name: 'The Foreshore School', area: 'Ikoyi' },
  { name: 'Topfaith International School', area: 'Ejigbo' },
  { name: 'TotalChild Schools', area: 'Lekki' },
  { name: 'University of Lagos Staff School', area: 'Akoka' },
  { name: 'Woodland International School', area: 'Festac' },
];
