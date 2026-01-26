// Immigration Glossary Terms
// 25+ terms covering agencies, statuses, forms, concepts, and penalties

export interface GlossaryTerm {
  id: string
  term: string
  shortDefinition: string
  fullDefinition: string
  category: 'agency' | 'status' | 'form' | 'concept' | 'penalty'
  realWorldContext?: string
  commonMisconceptions?: string[]
  relatedTerms?: string[]
  // For matching in text - includes variations, acronyms, etc.
  aliases?: string[]
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // === AGENCIES ===
  {
    id: 'uscis',
    term: 'USCIS',
    shortDefinition: 'U.S. Citizenship and Immigration Services - processes immigration benefits and applications.',
    fullDefinition: 'USCIS is the federal agency that oversees lawful immigration to the United States. They process applications for visas, green cards, work permits, naturalization, and asylum. Unlike ICE, USCIS does not handle enforcement - their role is to adjudicate immigration benefits.',
    category: 'agency',
    realWorldContext: 'As of 2024, USCIS processes over 8 million applications annually with an average wait time of 6-18 months depending on the benefit type. Processing times have increased significantly in recent years.',
    commonMisconceptions: [
      'USCIS does not conduct deportations - that\'s ICE',
      'USCIS officers are not the same as border patrol agents',
    ],
    relatedTerms: ['ice', 'cbp', 'eoir'],
    aliases: ['U.S. Citizenship and Immigration Services', 'immigration services', 'citizenship services'],
  },
  {
    id: 'ice',
    term: 'ICE',
    shortDefinition: 'Immigration and Customs Enforcement - handles immigration enforcement and deportation.',
    fullDefinition: 'ICE is the federal law enforcement agency responsible for immigration enforcement within the United States. This includes investigating immigration violations, detaining individuals, and carrying out deportations. ICE operates separately from USCIS, which processes immigration benefits.',
    category: 'agency',
    realWorldContext: 'ICE was created in 2003 as part of the Department of Homeland Security. ERO (Enforcement and Removal Operations) handles deportations while HSI (Homeland Security Investigations) handles criminal investigations.',
    commonMisconceptions: [
      'ICE cannot enter your home without a warrant signed by a judge',
      'An ICE administrative warrant is different from a judicial warrant',
    ],
    relatedTerms: ['uscis', 'removal-proceedings', 'cbp'],
    aliases: ['Immigration and Customs Enforcement', 'immigration enforcement'],
  },
  {
    id: 'cbp',
    term: 'CBP',
    shortDefinition: 'Customs and Border Protection - patrols borders and ports of entry.',
    fullDefinition: 'CBP is the largest federal law enforcement agency, responsible for securing U.S. borders and ports of entry. They inspect travelers and cargo entering the country, enforce immigration and customs laws at the border, and can deny entry to non-citizens. Border Patrol is a division of CBP.',
    category: 'agency',
    realWorldContext: 'CBP has authority to search travelers and their belongings at borders without a warrant. They can also operate within 100 miles of any border - an area where about 2/3 of Americans live.',
    relatedTerms: ['uscis', 'ice', 'advance-parole'],
    aliases: ['Customs and Border Protection', 'border patrol', 'customs'],
  },
  {
    id: 'eoir',
    term: 'EOIR',
    shortDefinition: 'Executive Office for Immigration Review - operates immigration courts.',
    fullDefinition: 'EOIR is part of the Department of Justice and operates the immigration court system. Immigration judges hear cases involving deportation/removal proceedings, asylum claims, and appeals. Unlike regular courts, immigration courts are administrative and individuals do not have a right to a government-appointed attorney.',
    category: 'agency',
    realWorldContext: 'As of 2024, the immigration court backlog exceeds 3 million cases. The average wait time for a court hearing is over 4 years in many jurisdictions.',
    commonMisconceptions: [
      'There is no right to a free lawyer in immigration court',
      'Immigration judges work for the executive branch, not the judicial branch',
    ],
    relatedTerms: ['removal-proceedings', 'asylum'],
    aliases: ['Executive Office for Immigration Review', 'immigration court', 'immigration judge'],
  },

  // === STATUSES ===
  {
    id: 'daca',
    term: 'DACA',
    shortDefinition: 'Deferred Action for Childhood Arrivals - temporary protection for those brought to the US as children.',
    fullDefinition: 'DACA is a program that provides temporary protection from deportation and work authorization to individuals who were brought to the United States as children without documentation. It does not provide a path to citizenship or permanent residence. Recipients must renew every two years and meet specific requirements including continuous residence and education.',
    category: 'status',
    realWorldContext: 'Created by executive action in 2012, DACA currently protects approximately 580,000 recipients. The program has faced multiple legal challenges and remains in a state of uncertainty. No new applications are being accepted as of 2024.',
    commonMisconceptions: [
      'DACA is not a path to citizenship',
      'DACA recipients pay taxes and are not eligible for federal financial aid or most benefits',
      'DACA can be revoked at any time by executive action',
    ],
    relatedTerms: ['ead', 'advance-parole', 'i-821d'],
    aliases: ['Deferred Action for Childhood Arrivals', 'Dreamer', 'DACA recipient'],
  },
  {
    id: 'tps',
    term: 'TPS',
    shortDefinition: 'Temporary Protected Status - protection for nationals of designated countries.',
    fullDefinition: 'TPS is a temporary immigration status granted to nationals of certain countries experiencing ongoing armed conflict, environmental disaster, or other extraordinary conditions. TPS provides protection from deportation and work authorization, but does not lead directly to permanent residence.',
    category: 'status',
    realWorldContext: 'Countries currently designated for TPS include El Salvador, Haiti, Honduras, Nepal, Nicaragua, Somalia, South Sudan, Sudan, Syria, Ukraine, Venezuela, and Yemen. Some individuals have held TPS for over 20 years.',
    commonMisconceptions: [
      'TPS is temporary and can be terminated by the government',
      'TPS does not automatically lead to a green card',
    ],
    relatedTerms: ['ead', 'daca'],
    aliases: ['Temporary Protected Status'],
  },
  {
    id: 'green-card',
    term: 'Green Card',
    shortDefinition: 'Permanent resident card allowing indefinite residence in the US.',
    fullDefinition: 'A green card (officially Form I-551) grants lawful permanent resident (LPR) status, allowing the holder to live and work permanently in the United States. Green card holders can eventually apply for citizenship after meeting residence and other requirements. They have most rights of citizens except voting and some federal jobs.',
    category: 'status',
    realWorldContext: 'The annual limit for green cards is about 226,000 for family-based and 140,000 for employment-based categories. Wait times for some categories from certain countries can exceed 20 years due to per-country limits.',
    commonMisconceptions: [
      'Green cards can be revoked or lost if you spend too much time outside the US',
      'Green card holders can be deported if convicted of certain crimes',
      'Having a green card does not automatically make you a citizen',
    ],
    relatedTerms: ['i-485', 'priority-date', 'naturalization'],
    aliases: ['permanent resident', 'LPR', 'permanent residence', 'lawful permanent resident', 'I-551'],
  },
  {
    id: 'h1b',
    term: 'H-1B',
    shortDefinition: 'Temporary work visa for specialized occupations.',
    fullDefinition: 'The H-1B visa allows U.S. employers to hire foreign workers in specialty occupations requiring at least a bachelor\'s degree. It is valid for up to 6 years (3 years, renewable once). Many H-1B holders pursue green cards while on the visa, but the H-1B itself does not provide a direct path to permanent residence.',
    category: 'status',
    realWorldContext: 'The annual H-1B cap is 85,000 visas (65,000 regular plus 20,000 for advanced degree holders). In recent years, USCIS has received 3-4 times more applications than available slots, requiring a lottery system.',
    commonMisconceptions: [
      'H-1B status is tied to a specific employer - losing your job means losing status',
      'The H-1B lottery doesn\'t guarantee selection even with a job offer',
    ],
    relatedTerms: ['ead', 'green-card', 'priority-date'],
    aliases: ['H1B', 'H-1B visa', 'specialty occupation visa'],
  },
  {
    id: 'asylum',
    term: 'Asylum',
    shortDefinition: 'Protection for those fleeing persecution in their home country.',
    fullDefinition: 'Asylum is a form of protection that allows individuals who meet the definition of a refugee to remain in the United States. To qualify, you must prove you have suffered persecution or have a well-founded fear of persecution based on race, religion, nationality, political opinion, or membership in a particular social group.',
    category: 'status',
    realWorldContext: 'Asylum seekers must apply within one year of arriving in the US, with limited exceptions. The asylum backlog currently exceeds 1.6 million cases. Approval rates vary significantly by nationality and court location.',
    commonMisconceptions: [
      'Seeking asylum is legal - it is not illegal to request protection at the border',
      'Asylum seekers can apply whether they entered legally or not',
      'Economic hardship alone does not qualify someone for asylum',
    ],
    relatedTerms: ['eoir', 'removal-proceedings', 'ead'],
    aliases: ['asylum seeker', 'political asylum', 'asylee'],
  },

  // === FORMS ===
  {
    id: 'i-130',
    term: 'I-130',
    shortDefinition: 'Petition for Alien Relative - starts the family-based green card process.',
    fullDefinition: 'Form I-130 is filed by a U.S. citizen or permanent resident to establish a family relationship with a relative who wants to immigrate. It is the first step in the family-based green card process. Approval of the I-130 does not grant immigration status - it simply establishes that a qualifying relationship exists.',
    category: 'form',
    realWorldContext: 'Processing times vary from 12 months to several years depending on the relationship category and whether the petitioner is a citizen or green card holder.',
    relatedTerms: ['i-485', 'priority-date', 'green-card'],
    aliases: ['Petition for Alien Relative', 'family petition'],
  },
  {
    id: 'i-485',
    term: 'I-485',
    shortDefinition: 'Application to Register Permanent Residence - the green card application.',
    fullDefinition: 'Form I-485 is the actual application to become a lawful permanent resident (get a green card). It can only be filed when a visa number is available (priority date is current). The process includes background checks, biometrics, medical exam, and often an interview.',
    category: 'form',
    realWorldContext: 'I-485 processing times range from 8 months to several years. While pending, applicants can often get work and travel authorization. The medical exam must be done by a USCIS-designated civil surgeon.',
    relatedTerms: ['i-130', 'green-card', 'priority-date', 'ead', 'advance-parole'],
    aliases: ['adjustment of status', 'AOS', 'green card application'],
  },
  {
    id: 'i-601a',
    term: 'I-601A',
    shortDefinition: 'Provisional Unlawful Presence Waiver - waives immigration bars before leaving the US.',
    fullDefinition: 'Form I-601A allows certain individuals with unlawful presence to request a provisional waiver of the 3-year or 10-year bar before leaving the US for their immigrant visa interview. This reduces the risk of being stuck abroad. The waiver requires proving that a U.S. citizen or permanent resident spouse or parent would suffer extreme hardship.',
    category: 'form',
    realWorldContext: 'Before the I-601A existed (created 2013), people had to leave the US first, then apply for the waiver from abroad - often waiting years separated from family with uncertain outcomes.',
    commonMisconceptions: [
      'The waiver is not automatic - you must prove extreme hardship to a qualifying relative',
      'Hardship to the applicant themselves is not sufficient',
    ],
    relatedTerms: ['unlawful-presence', 'three-year-bar', 'ten-year-bar'],
    aliases: ['provisional waiver', 'I-601A waiver', 'unlawful presence waiver'],
  },
  {
    id: 'i-765',
    term: 'I-765',
    shortDefinition: 'Application for Employment Authorization - work permit application.',
    fullDefinition: 'Form I-765 is used to request an Employment Authorization Document (EAD), which allows certain non-citizens to work in the United States. Various categories qualify, including pending green card applicants, asylum seekers (after 180 days), DACA recipients, and certain visa holders\' spouses.',
    category: 'form',
    realWorldContext: 'EADs are typically valid for 1-2 years and must be renewed. Processing times have been a significant issue, with some applicants waiting 6+ months for work authorization.',
    relatedTerms: ['ead', 'daca', 'i-485'],
    aliases: ['work permit application', 'EAD application'],
  },
  {
    id: 'i-821d',
    term: 'I-821D',
    shortDefinition: 'Consideration of Deferred Action for Childhood Arrivals - DACA application.',
    fullDefinition: 'Form I-821D is the application for DACA status. It must be filed with Form I-765 (work permit) and I-765WS (worksheet). Initial applicants and those renewing must meet specific requirements including age, education, residence, and criminal history criteria.',
    category: 'form',
    realWorldContext: 'As of 2024, only renewal applications are being accepted - no new initial applications due to ongoing litigation. Renewals should be filed 120-150 days before expiration.',
    relatedTerms: ['daca', 'ead', 'i-765'],
    aliases: ['DACA application', 'DACA renewal'],
  },

  // === CONCEPTS ===
  {
    id: 'ead',
    term: 'EAD',
    shortDefinition: 'Employment Authorization Document - official work permit card.',
    fullDefinition: 'An EAD (also called a work permit) is a card issued by USCIS that proves you are authorized to work in the United States. Unlike employment-based visas which are tied to a specific employer, an EAD allows you to work for any employer. Various immigration categories provide EAD eligibility.',
    category: 'concept',
    realWorldContext: 'Many employers are unfamiliar with EADs, which can create hiring challenges. EAD holders have the same work rights as any other authorized worker, but the card must be renewed before expiration.',
    relatedTerms: ['i-765', 'daca', 'advance-parole'],
    aliases: ['Employment Authorization Document', 'work permit', 'work authorization'],
  },
  {
    id: 'advance-parole',
    term: 'Advance Parole',
    shortDefinition: 'Permission to re-enter the US while an application is pending.',
    fullDefinition: 'Advance Parole is a travel document that allows certain individuals with pending immigration applications to travel abroad and return to the United States. Without it, leaving the country could abandon your pending application or trigger immigration bars. It is NOT a visa and does not guarantee re-entry.',
    category: 'concept',
    realWorldContext: 'For DACA recipients, using Advance Parole can create a lawful entry, potentially opening paths to adjustment of status. However, Advance Parole is rarely approved for DACA except for humanitarian, employment, or educational purposes.',
    commonMisconceptions: [
      'Advance Parole is not a visa - you can still be denied entry at the border',
      'Traveling without Advance Parole on a pending application usually means abandonment',
    ],
    relatedTerms: ['i-485', 'daca', 'cbp'],
    aliases: ['AP', 'travel document', 'parole document'],
  },
  {
    id: 'unlawful-presence',
    term: 'Unlawful Presence',
    shortDefinition: 'Time spent in the US without valid status after entry.',
    fullDefinition: 'Unlawful presence is time spent in the United States after the expiration of authorized stay or without being admitted or paroled. Accumulating more than 180 days triggers the 3-year bar; more than one year triggers the 10-year bar. These bars apply when you leave the US and try to return.',
    category: 'concept',
    realWorldContext: 'Many people accrue unlawful presence without realizing it - for example, by overstaying a visa or working without authorization. Time before age 18 does not count toward unlawful presence.',
    commonMisconceptions: [
      'Unlawful presence is not the same as illegal entry',
      'The bars are triggered by leaving, not just by accruing the time',
    ],
    relatedTerms: ['three-year-bar', 'ten-year-bar', 'i-601a'],
    aliases: ['overstay', 'out of status'],
  },
  {
    id: 'priority-date',
    term: 'Priority Date',
    shortDefinition: 'Your place in line for an immigrant visa.',
    fullDefinition: 'A priority date is essentially your spot in the immigration queue. For family cases, it\'s when the I-130 petition was filed. For employment cases, it\'s typically when the labor certification was filed. You cannot complete the green card process until your priority date is "current" - meaning visa numbers are available for your category.',
    category: 'concept',
    realWorldContext: 'Due to annual visa limits and per-country caps, wait times vary dramatically. Currently, some employment-based categories for Indian nationals have wait times exceeding 50 years.',
    relatedTerms: ['green-card', 'i-130', 'i-485'],
    aliases: ['PD', 'visa bulletin'],
  },
  {
    id: 'naturalization',
    term: 'Naturalization',
    shortDefinition: 'The process of becoming a U.S. citizen.',
    fullDefinition: 'Naturalization is the legal process by which a non-citizen becomes a U.S. citizen. Requirements typically include being a permanent resident for 5 years (3 years if married to a citizen), continuous residence and physical presence, good moral character, English and civics knowledge, and taking the Oath of Allegiance.',
    category: 'concept',
    realWorldContext: 'The naturalization test covers 100 civics questions and basic English. Accommodations are available for elderly applicants and those with disabilities. Processing times average 8-14 months.',
    relatedTerms: ['green-card'],
    aliases: ['citizenship', 'become a citizen', 'N-400'],
  },

  // === PENALTIES ===
  {
    id: 'three-year-bar',
    term: '3-Year Bar',
    shortDefinition: 'Bar from re-entering the US after 180+ days of unlawful presence.',
    fullDefinition: 'The 3-year bar is an automatic penalty that applies when someone accrues between 180 days and one year of unlawful presence in the US and then departs. They are barred from returning to the US for 3 years from the date of departure. The bar can sometimes be waived through the I-601A process.',
    category: 'penalty',
    realWorldContext: 'This bar catches many people off guard. Someone who overstays a tourist visa by 7 months and then leaves voluntarily faces 3 years unable to return, even if they have a U.S. citizen spouse.',
    commonMisconceptions: [
      'The bar is triggered by leaving, not just by accruing the time',
      'Voluntary departure does not avoid the bar',
    ],
    relatedTerms: ['unlawful-presence', 'ten-year-bar', 'i-601a'],
    aliases: ['three year bar', '3 year bar', '180 day bar'],
  },
  {
    id: 'ten-year-bar',
    term: '10-Year Bar',
    shortDefinition: 'Bar from re-entering the US after 1+ year of unlawful presence.',
    fullDefinition: 'The 10-year bar applies when someone accrues more than one year of unlawful presence in the US and then departs. They are barred from returning for 10 years from the date of departure. Like the 3-year bar, this can sometimes be waived through I-601A if a qualifying relative would suffer extreme hardship.',
    category: 'penalty',
    realWorldContext: 'Many long-term undocumented residents face this bar if they try to leave and re-enter legally. This creates impossible choices between staying without status or leaving family behind for a decade.',
    relatedTerms: ['unlawful-presence', 'three-year-bar', 'i-601a'],
    aliases: ['ten year bar', '10 year bar', 'one year bar'],
  },
  {
    id: 'removal-proceedings',
    term: 'Removal Proceedings',
    shortDefinition: 'Formal deportation process in immigration court.',
    fullDefinition: 'Removal proceedings are the formal legal process to deport someone from the United States. Cases are heard in immigration court before an immigration judge. Individuals can present defenses, apply for relief (like asylum), and appeal decisions. However, there is no right to a government-provided attorney.',
    category: 'penalty',
    realWorldContext: 'The immigration court backlog means many people spend years in proceedings. Some are detained throughout; others are released. About 50% of those without lawyers are ordered removed, compared to higher success rates for those with representation.',
    commonMisconceptions: [
      'Removal proceedings are civil, not criminal - but consequences are severe',
      'You can fight your case but must find and pay for your own lawyer',
    ],
    relatedTerms: ['eoir', 'ice', 'asylum'],
    aliases: ['deportation proceedings', 'deportation', 'removal order'],
  },
  {
    id: 'rfe',
    term: 'RFE',
    shortDefinition: 'Request for Evidence - USCIS asking for more documentation.',
    fullDefinition: 'A Request for Evidence (RFE) is a notice from USCIS asking for additional documentation or clarification before they can make a decision on your application. RFEs are common and don\'t necessarily mean your case is being denied - they just need more information. However, not responding properly can result in denial.',
    category: 'concept',
    realWorldContext: 'RFE response deadlines are typically 30-87 days. It\'s often worth consulting an immigration attorney before responding, as a weak response can lead to denial.',
    relatedTerms: ['uscis', 'i-485'],
    aliases: ['Request for Evidence', 'request for additional evidence'],
  },
  {
    id: 'noid',
    term: 'NOID',
    shortDefinition: 'Notice of Intent to Deny - warning before case denial.',
    fullDefinition: 'A Notice of Intent to Deny (NOID) is a formal notice that USCIS plans to deny your application, giving you one last chance to address their concerns. It explains the reasons for the intended denial and provides a deadline to respond with evidence or arguments.',
    category: 'concept',
    realWorldContext: 'Unlike an RFE, a NOID means USCIS has already determined to deny based on current evidence. A strong response with compelling new evidence is crucial. Many NOIDs can be overcome with proper documentation.',
    relatedTerms: ['uscis', 'rfe'],
    aliases: ['Notice of Intent to Deny', 'intent to deny'],
  },
]

// Get term by ID
export function getTermById(id: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find(t => t.id === id)
}

// Get terms by category
export function getTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
  return GLOSSARY_TERMS.filter(t => t.category === category)
}

// Search terms by query (searches term, aliases, and definitions)
export function searchTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase()
  return GLOSSARY_TERMS.filter(term =>
    term.term.toLowerCase().includes(lowerQuery) ||
    term.aliases?.some(a => a.toLowerCase().includes(lowerQuery)) ||
    term.shortDefinition.toLowerCase().includes(lowerQuery)
  )
}
