const fs = require('fs');

// Full vocabulary database compiler to construct exactly 1260 genuine items
// for all 9 weeks (9 weeks * 7 days * 20 words = 1260 words).
// Combining existing 394 items + authentic vocabulary words, verbs, and adjectives.

const existing394 = JSON.parse(fs.readFileSync('scripts/parsed_first_395.json', 'utf8'));

// Load batch 1, 2, 3
const batch1 = require('./vocabBatch1');
const batch2 = require('./vocabBatch2');
const batch3 = require('./vocabBatch3');

// Combine and deduplicate
const combined = [...existing394];
const seen = new Set(combined.map(x => x.english.toLowerCase()));

// helper to add if unique
function addItems(arr) {
  if (!arr || !Array.isArray(arr)) return;
  for (const item of arr) {
    const key = item.english.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
  }
}

// Additional comprehensive words list with phonetics and sentences
// N to Z vocabulary items
const nToZList = [
  // N
  { english: "navigate", bangla: "পথ পরিচালনা করা / পথ চলা", phonetic: "/ˈnævɪɡeɪt/", sentence: "Sailors use the North Star to navigate at sea.", translation: "নাবিকরা সাগরে পথ চলার জন্য ধ্রুবতারা ব্যবহার করেন।" },
  { english: "negotiate", bangla: "সমঝোতা করা / আলোচনা করা", phonetic: "/nɪˈɡoʊʃieɪt/", sentence: "Diplomats negotiate peacefully to resolve disputes.", translation: "কূটনীতিকরা বিরোধ নিষ্পত্তির জন্য শান্তিপূর্ণভাবে আলোচনা করেন।" },
  { english: "nourish", bangla: "পুষ্ট করা / লালন-পালন করা", phonetic: "/ˈnʌrɪʃ/", sentence: "Nutritious vegetables nourish the growing body.", translation: "পুষ্টিকর শাকসবজি বর্ধনশীল শরীরকে পুষ্ট করে।" },
  { english: "nurture", bangla: "যত্ন নিয়ে গড়ে তোলা", phonetic: "/ˈnɜːrtʃər/", sentence: "Teachers nurture the hidden talents of young children.", translation: "শিক্ষকরা ছোট শিশুদের সুপ্ত প্রতিভাকে যত্নসহকারে গড়ে তোলেন।" },
  { english: "notify", bangla: "বিজ্ঞপ্তি দেওয়া / জানানো", phonetic: "/ˈnoʊtɪfaɪ/", sentence: "The board notified students about the upcoming examination.", translation: "বোর্ড শিক্ষার্থীদের আসন্ন পরীক্ষা সম্পর্কে অবহিত করেছে।" },

  // O
  { english: "observe", bangla: "পর্যবেক্ষণ করা / পালন করা", phonetic: "/əbˈzɜːrv/", sentence: "Astronomers observe the night sky with powerful telescopes.", translation: "জ্যোতির্বিজ্ঞানীরা শক্তিশালী দূরবীন দিয়ে রাতের আকাশ পর্যবেক্ষণ করেন।" },
  { english: "obtain", bangla: "অর্জন করা / লাভ করা", phonetic: "/əbˈteɪn/", sentence: "She obtained the highest marks in mathematics.", translation: "সে গণিতে সর্বোচ্চ নম্বর লাভ করেছিল।" },
  { english: "occupy", bangla: "স্থান দখল করা / ব্যস্ত রাখা", phonetic: "/ˈɒkjupaɪ/", sentence: "Reading good books occupies leisure hours constructively.", translation: "ভালো বই পড়া অবসর সময়কে গঠনমূলকভাবে ব্যস্ত রাখে।" },
  { english: "occur", bangla: "ঘটা / সংঘটিত হওয়া", phonetic: "/əˈkɜːr/", sentence: "Solar eclipses occur in a natural cosmic cycle.", translation: "সূর্যগ্রহণ প্রাকৃতিক মহাজাগতিক চক্রে ঘটে থাকে।" },
  { english: "operate", bangla: "পরিচালনা করা / অস্ত্রোপচার করা", phonetic: "/ˈɒpəreɪt/", sentence: "Surgeons operate with great precision in hospitals.", translation: "হাসপাতালে শল্যচিকিৎসকরা অত্যন্ত সূক্ষ্মতার সাথে অস্ত্রোপচার করেন।" },
  { english: "oppose", bangla: "বিরোধিতা করা", phonetic: "/əˈpoʊz/", sentence: "Righteous citizens oppose injustice everywhere.", translation: "ন্যায়নিষ্ঠ নাগরিকরা সর্বত্র অন্যায়ের বিরোধিতা করেন।" },
  { english: "organize", bangla: "সংগঠিত করা / সুবিন্যস্ত করা", phonetic: "/ˈɔːrɡənaɪz/", sentence: "Organize your study desk neatly for focused study.", translation: "মনোযোগী পড়াশোনার জন্য তোমার পড়ার টেবিল পরিপাটি করে সাজাও।" },
  { english: "originate", bangla: "উৎপন্ন হওয়া / উৎপত্তি হওয়া", phonetic: "/əˈrɪdʒɪneɪt/", sentence: "Mighty rivers originate high up in Himalayan glaciers.", translation: "বিশাল নদীগুলো হিমালয়ের উঁচু হিমবাহ থেকে উৎপন্ন হয়।" },
  { english: "outline", bangla: "রূপরেখা তৈরি করা", phonetic: "/ˈaʊtlaɪn/", sentence: "Outline your essay before beginning to write.", translation: "লেখা শুরু করার আগে তোমার প্রবন্ধের রূপরেখা তৈরি করো।" },
  { english: "overcome", bangla: "জয় করা / পরাভূত করা", phonetic: "/ˌoʊvərˈkʌm/", sentence: "Perseverance helps students overcome academic hurdles.", translation: "অধ্যবসায় শিক্ষার্থীদের প্রাতিষ্ঠানিক বাধা জয় করতে সাহায্য করে।" },

  // P
  { english: "participate", bangla: "অংশগ্রহণ করা", phonetic: "/pɑːrˈtɪsɪpeɪt/", sentence: "All students are encouraged to participate in sports.", translation: "সকল শিক্ষার্থীকে খেলাধুলায় অংশগ্রহণ করতে উৎসাহিত করা হয়।" },
  { english: "perceive", bangla: "উপলব্ধি করা / বুঝতে পারা", phonetic: "/pərˈsiːv/", sentence: "He perceived the truth behind the polite words.", translation: "ভদ্র কথার পেছনের সত্যটি সে উপলব্ধি করতে পেরেছিল।" },
  { english: "perform", bangla: "সম্পাদন করা / পরিবেশন করা", phonetic: "/pərˈfɔːrm/", sentence: "The students performed patriotic songs melodiously.", translation: "শিক্ষার্থীরা সুর করে দেশাত্মবোধক গান পরিবেশন করেছিল।" },
  { english: "permit", bangla: "অনুমতি দেওয়া", phonetic: "/pərˈmɪt/", sentence: "The rules do not permit cheating in examinations.", translation: "নিয়মে পরীক্ষায় অসদুপায় অবলম্বন অনুমতি দেয় না।" },
  { english: "persevere", bangla: "অধ্যবসায়ী হওয়া / লেগে থাকা", phonetic: "/ˌpɜːrsɪˈvɪər/", sentence: "Persevere through difficult lessons to gain mastery.", translation: "দক্ষতা অর্জনের জন্য কঠিন পাঠগুলোতেও অধ্যবসায়ী হয়ে লেগে থাকুন।" },
  { english: "persuade", bangla: "রাজি করানো / প্ররোচিত করা", phonetic: "/pərˈsweɪd/", sentence: "She persuaded her classmates to keep the school clean.", translation: "সে তার সহপাঠীদের বিদ্যালয় পরিচ্ছন্ন রাখতে রাজি করিয়েছিল।" },
  { english: "plant", bangla: "রোপণ করা", phonetic: "/plænt/", sentence: "Plant flowering trees to make your garden vibrant.", translation: "তোমার বাগানটি প্রাণবন্ত করতে ফুলের গাছ রোপণ করো।" },
  { english: "postpone", bangla: "স্থগিত রাখা", phonetic: "/poʊstˈpoʊn/", sentence: "The cricket match was postponed due to heavy rainfall.", translation: "ভারী বৃষ্টির কারণে ক্রিকেট ম্যাচটি স্থগিত রাখা হয়েছিল।" },
  { english: "praise", bangla: "প্রশংসা করা", phonetic: "/preɪz/", sentence: "Teachers praise students who work with devotion.", translation: "শিক্ষকরা সেই শিক্ষার্থীদের প্রশংসা করেন যারা নিষ্ঠার সাথে কাজ করে।" },
  { english: "pray", bangla: "প্রার্থনা করা", phonetic: "/preɪ/", sentence: "People pray daily for the peace of the nation.", translation: "মানুষ দেশের শান্তির জন্য প্রতিদিন প্রার্থনা করেন।" },
  { english: "predict", bangla: "ভবিষ্যদ্বাণী করা", phonetic: "/prɪˈdɪkt/", sentence: "Meteorologists predict sunny weather for tomorrow.", translation: "আবহাওয়াবিদরা আগামীকালের জন্য রৌদ্রোজ্জ্বল আবহাওয়ার ভবিষ্যদ্বাণী করেছেন।" },
  { english: "prefer", bangla: "অধিক পছন্দ করা", phonetic: "/prɪˈfɜːr/", sentence: "I prefer green tea to sugary coffee.", translation: "আমি চিনিযুক্ত কফির চেয়ে সবুজ চা বেশি পছন্দ করি।" },
  { english: "prepare", bangla: "প্রস্তুত করা", phonetic: "/prɪˈpɛər/", sentence: "Prepare your examination answers with utmost care.", translation: "অত্যন্ত যত্নের সাথে তোমার পরীক্ষার উত্তর প্রস্তুত করো।" },
  { english: "preserve", bangla: "সংরক্ষণ করা", phonetic: "/prɪˈzɜːrv/", sentence: "We must preserve our historical documents and culture.", translation: "আমাদের অবশ্যই ঐতিহাসিক নথিপত্র ও সংস্কৃতি সংরক্ষণ করতে হবে।" },
  { english: "prevent", bangla: "প্রতিরোধ করা", phonetic: "/prɪˈvɛnt/", sentence: "Clean drinking water prevents common illnesses.", translation: "বিশুদ্ধ পানীয় জল সাধারণ রোগবালাই প্রতিরোধ করে।" },
  { english: "produce", bangla: "উৎপাদন করা", phonetic: "/prəˈdjuːs/", sentence: "Fertile land produces bumper rice harvest in Bangladesh.", translation: "উর্বর মাটি বাংলাদেশে ধানের বাম্পার ফলন উৎপাদন করে।" },
  { english: "protect", bangla: "রক্ষা করা", phonetic: "/prəˈtɛkt/", sentence: "Forests protect coastal areas from cyclonic storms.", translation: "বনাঞ্চল উপকূলীয় এলাকাগুলোকে ঘূর্ণিঝড়ের তাণ্ডব থেকে রক্ষা করে।" },
  { english: "provide", bangla: "সরবরাহ করা / দেওয়া", phonetic: "/prəˈvaɪd/", sentence: "Good schools provide quality moral education.", translation: "ভালো বিদ্যালয়গুলো মানসম্পন্ন নৈতিক শিক্ষা সরবরাহ করে।" },
  { english: "publish", bangla: "প্রকাশ করা", phonetic: "/ˈpʌblɪʃ/", sentence: "The education board published secondary examination results.", translation: "শিক্ষা বোর্ড মাধ্যমিক পরীক্ষার ফলাফল প্রকাশ করেছে।" },
  { english: "pursue", bangla: "অনুসরণ করা / অন্বেষণ করা", phonetic: "/pərˈsjuː/", sentence: "Pursue higher knowledge with relentless curiosity.", translation: "অবিরাম কৌতূহলের সাথে উচ্চতর জ্ঞান অন্বেষণ করুন।" },

  // Q
  { english: "qualify", bangla: "যোগ্যতা অর্জন করা", phonetic: "/ˈkwɒlɪfaɪ/", sentence: "Hard work qualified him for the scholarship.", translation: "কঠোর পরিশ্রম তাকে বৃত্তির জন্য যোগ্য করে তুলেছিল।" },
  { english: "quench", bangla: "নিবারণ করা / মেটানো", phonetic: "/kwɛntʃ/", sentence: "Cool fresh water quenches burning summer thirst.", translation: "শীতল তাজা পানি গ্রীষ্মের তীব্র তৃষ্ণা নিবারণ করে।" },
  { english: "question", bangla: "প্রশ্ন করা / জিজ্ঞাসা করা", phonetic: "/ˈkwɛstʃən/", sentence: "Do not fear to question unclear concepts.", translation: "অস্পষ্ট বিষয় নিয়ে প্রশ্ন করতে ভয় পাবেন না।" },
  { english: "quit", bangla: "ত্যাগ করা / ছেড়ে দেওয়া", phonetic: "/kwɪt/", sentence: "Never quit learning even when challenges appear.", translation: "প্রতিবন্ধকতা এলেও কখনো শেখা ছেড়ে দেবেন না।" },

  // R
  { english: "radiate", bangla: "বিকিরণ করা / উজ্জ্বল হওয়া", phonetic: "/ˈreɪdieɪt/", sentence: "Her cheerful face radiates warmth and kindness.", translation: "তার প্রফুল্ল মুখমণ্ডল উষ্ণতা ও দয়ার দীপ্তি ছড়ায়।" },
  { english: "reach", bangla: "পৌঁছানো", phonetic: "/riːtʃ/", sentence: "Climbers reached the high mountain summit.", translation: "পর্বতারোহীরা উঁচু পাহাড়ের চূড়ায় পৌঁছেছিলেন।" },
  { english: "react", bangla: "প্রতিক্রিয়া দেখানো", phonetic: "/riˈækt/", sentence: "Chemicals react to form new compounds in the lab.", translation: "ল্যাবে নতুন যৌগ গঠনের জন্য রাসায়নিকগুলো বিক্রিয়া করে।" },
  { english: "realize", bangla: "উপলব্ধি করা", phonetic: "/ˈriːəlaɪz/", sentence: "He realized the supreme value of punctuality.", translation: "সে সময়নিষ্ঠার সর্বোচ্চ মূল্য উপলব্ধি করতে পেরেছিল।" },
  { english: "rebuild", bangla: "পুনর্নির্মাণ করা", phonetic: "/ˌriːˈbɪld/", sentence: "Villagers worked together to rebuild the broken bridge.", translation: "ভাঙা সেতুটি পুনর্নির্মাণে গ্রামবাসীরা একসাথে কাজ করেছিলেন।" },
  { english: "recall", bangla: "স্মরণ করা", phonetic: "/rɪˈkɔːl/", sentence: "Elderly people recall their school days with fondness.", translation: "বয়োজ্যেষ্ঠরা তাদের স্কুলজীবনের দিনগুলো ভালোবেসে স্মরণ করেন।" },
  { english: "receive", bangla: "গ্রহণ করা", phonetic: "/rɪˈsiːv/", sentence: "The winner received a prestigious golden trophy.", translation: "বিজয়ী একটি মর্যাদাপূর্ণ সোনালি ট্রফি গ্রহণ করেছিল।" },
  { english: "recognize", bangla: "স্বীকৃতি দেওয়া / চিনতে পারা", phonetic: "/ˈrɛkəɡnaɪz/", sentence: "The world recognizes Bangladesh's economic development.", translation: "বিশ্ব বাংলাদেশের অর্থনৈতিক উন্নয়নকে স্বীকৃতি দেয়।" },
  { english: "recommend", bangla: "সুপারিশ করা", phonetic: "/ˌrɛkəˈmɛnd/", sentence: "I recommend reading this English vocabulary guide.", translation: "আমি এই ইংরেজি শব্দভাণ্ডার নির্দেশিকাটি পড়ার সুপারিশ করছি।" },
  { english: "reconcile", bangla: "মীমাংসা করা / মিলন ঘটানো", phonetic: "/ˈrɛkənsaɪl/", sentence: "Old friends reconciled after a long misunderstanding.", translation: "দীর্ঘ ভুল বোঝাবুঝির পর পুরানো বন্ধুরা আবার মিলেমিশে গেল।" },
  { english: "recover", bangla: "আরোগ্য লাভ করা / পুনরুদ্ধার করা", phonetic: "/rɪˈkʌvər/", sentence: "He recovered his lost strength after rest and good food.", translation: "বিশ্রাম ও ভালো খাবারের পর সে তার হারিয়ে যাওয়া শক্তি পুনরুদ্ধার করল।" },
  { english: "rectify", bangla: "সংশোধন করা", phonetic: "/ˈrɛktɪfaɪ/", sentence: "Always rectify your errors as soon as you find them.", translation: "ত্রুটি ধরা পড়ার সাথে সাথে সর্বদা তা সংশোধন করে নিন।" },
  { english: "reduce", bangla: "হ্রাস করা / কমানো", phonetic: "/rɪˈdjuːs/", sentence: "Turn off lights when leaving to reduce electricity bills.", translation: "বিদ্যুৎ বিল কমাতে বের হওয়ার সময় বাতি নিভিয়ে দিন।" },
  { english: "reflect", bangla: "প্রতিফলিত করা / গভীরভাবে ভাবা", phonetic: "/rɪˈflɛkt/", sentence: "Still pond water reflects the blue sky like a mirror.", translation: "শান্ত পুকুরের পানি আয়নার মতো নীল আকাশকে প্রতিফলিত করে।" },
  { english: "reform", bangla: "সংস্কার করা", phonetic: "/rɪˈfɔːrm/", sentence: "Modern education reforms ensure interactive classroom learning.", translation: "আধুনিক শিক্ষা সংস্কার শ্রেণিকক্ষে মিথস্ক্রিয়ামূলক শিখন নিশ্চিত করে।" },
  { english: "refresh", bangla: "সতেজ করা", phonetic: "/rɪˈfrɛʃ/", sentence: "A cool bath refreshes the body after hard work.", translation: "কঠোর পরিশ্রমের পর শীতল স্নান শরীরকে সতেজ করে তোলে।" },
  { english: "refuse", bangla: "প্রত্যাখ্যান করা", phonetic: "/rɪˈfjuːz/", sentence: "An upright citizen refuses to accept illegal bribes.", translation: "একজন সৎ নাগরিক অবৈধ ঘুষ গ্রহণে অস্বীকৃতি জানান।" },
  { english: "reinforce", bangla: "সুদৃঢ় করা / জোরদার করা", phonetic: "/ˌriːɪnˈfɔːrs/", sentence: "Daily practice reinforces grammar rules in memory.", translation: "নিয়মিত অনুশীলন স্মৃতিতে ব্যাকরণের নিয়মগুলোকে সুদৃঢ় করে।" },
  { english: "rejoice", bangla: "আনন্দ প্রকাশ করা", phonetic: "/rɪˈdʒɔɪs/", sentence: "The entire school rejoiced at the championship win.", translation: "চ্যাম্পিয়নশিপ জয়ে পুরো বিদ্যালয় আনন্দ প্রকাশ করেছিল।" },
  { english: "relieve", bangla: "উপশম করা / স্বস্তি দেওয়া", phonetic: "/rɪˈliːv/", sentence: "Kind words relieve the sorrow of broken hearts.", translation: "সদয় কথা ব্যথিত হৃদয়ের দুঃখ উপশম করে।" },
  { english: "remember", bangla: "মনে রাখা", phonetic: "/rɪˈmɛmbər/", sentence: "Always remember the sacrifices of our great freedom fighters.", translation: "সর্বদা আমাদের মহান মুক্তিযোদ্ধাদের আত্মত্যাগের কথা মনে রাখবেন।" },
  { english: "remind", bangla: "মনে করিয়ে দেওয়া", phonetic: "/rɪˈmaɪnd/", sentence: "Please remind me to submit my homework tomorrow.", translation: "অনুগ্রহ করে আগামীকাল বাড়ির কাজ জমা দেওয়ার কথা আমাকে মনে করিয়ে দেবেন।" },
  { english: "renew", bangla: "নবায়ন করা", phonetic: "/rɪˈnjuː/", sentence: "You must renew your library card every academic year.", translation: "প্রতি শিক্ষাবর্ষে আপনার লাইব্রেরি কার্ড নবায়ন করতে হবে।" },
  { english: "repair", bangla: "মেরামত করা", phonetic: "/rɪˈpɛər/", sentence: "The mechanic repaired the engine efficiently.", translation: "মেকানিক দক্ষতার সাথে ইঞ্জিনটি মেরামত করেছিলেন।" },
  { english: "repeat", bangla: "পুনরাবৃত্তি করা", phonetic: "/rɪˈpiːt/", sentence: "Repeat the sentence aloud to improve clear pronunciation.", translation: "স্পষ্ট উচ্চারণের জন্য বাক্যটি উচ্চস্বরে পুনরাবৃত্তি করো।" },
  { english: "replace", bangla: "প্রতিস্থাপন করা", phonetic: "/rɪˈpleɪs/", sentence: "Replace negative thoughts with positive aspirations.", translation: "নেতিবাচক চিন্তাভাবনাকে ইতিবাচক আকাঙ্ক্ষা দিয়ে প্রতিস্থাপন করুন।" },
  { english: "reply", bangla: "উত্তর দেওয়া", phonetic: "/rɪˈplaɪ/", sentence: "He replied politely to all queries in the interview.", translation: "সাক্ষাৎকারে সে সকল প্রশ্নের উত্তর অত্যন্ত ভদ্রভাবে দিয়েছিল।" },
  { english: "represent", bangla: "প্রতিনিধিত্ব করা", phonetic: "/ˌrɛprɪˈzɛnt/", sentence: "Students represented their district in the national quiz.", translation: "শিক্ষার্থীরা জাতীয় কুইজে তাদের জেলার প্রতিনিধিত্ব করেছিল।" },
  { english: "rescue", bangla: "উদ্ধার করা", phonetic: "/ˈrɛskjuː/", sentence: "Brave divers rescued passengers from the sinking ferry.", translation: "সাহসী ডুবুরিরা ডুবন্ত লঞ্চ থেকে যাত্রীদের উদ্ধার করেছিলেন।" },
  { english: "research", bangla: "গবেষণা করা", phonetic: "/rɪˈsɜːrtʃ/", sentence: "Scientists research deeply to invent disease cures.", translation: "রোগ নিরাময়ের উপায় উদ্ভাবনে বিজ্ঞানীরা গভীরভাবে গবেষণা করেন।" },
  { english: "resolve", bangla: "সমাধান করা / সংকল্প করা", phonetic: "/rɪˈzɒlv/", sentence: "We must resolve differences through peaceful dialogue.", translation: "আমাদের অবশ্যই শান্তিপূর্ণ সংলাপের মাধ্যমে মতপার্থক্য সমাধান করতে হবে।" },
  { english: "respect", bangla: "শ্রদ্ধা করা / সম্মান প্রদর্শন করা", phonetic: "/rɪˈspɛkt/", sentence: "Respect your teachers, parents, and community elders.", translation: "তোমার শিক্ষক, পিতা-মাতা এবং মুরুব্বিদের শ্রদ্ধা করো।" },
  { english: "restore", bangla: "পুনরুদ্ধার করা", phonetic: "/rɪˈstɔːr/", sentence: "Volunteers worked hard to restore the green riverbanks.", translation: "সবুজ নদীপাড় পুনরুদ্ধারে স্বেচ্ছাসেবকরা কঠোর পরিশ্রম করেছিলেন।" },
  { english: "reveal", bangla: "উন্মোচন করা", phonetic: "/rɪˈviːl/", sentence: "Careful examination reveals the truth.", translation: "সতর্ক পরীক্ষা সত্যকে উন্মোচন করে।" },
  { english: "revere", bangla: "গভীরভাবে শ্রদ্ধা করা", phonetic: "/rɪˈvɪər/", sentence: "We revere the martyrs of the 1952 language movement.", translation: "আমরা ১৯৫২ সালের ভাষা আন্দোলনের শহীদদের গভীরভাবে শ্রদ্ধা করি।" },
  { english: "revise", bangla: "পুনরাবৃত্তি করা / সংশোধন করা", phonetic: "/rɪˈvaɪz/", sentence: "Revise your notes thoroughly before exam day.", translation: "পরীক্ষার দিনের আগে তোমার নোটগুলো পুঙ্খানুপুঙ্খভাবে সংশোধন ও রিভিশন করো।" },
  { english: "reward", bangla: "পুরস্কৃত করা", phonetic: "/rɪˈwɔːrd/", sentence: "The school rewarded academic excellence with gold medals.", translation: "বিদ্যালয়টি কৃতিত্বপূর্ণ ফলাফলের জন্য স্বর্ণপদক দিয়ে পুরস্কৃত করেছিল।" },
  { english: "roam", bangla: "ঘুরে বেড়ানো", phonetic: "/roʊm/", sentence: "Spotted deer roam peacefully in the Sundarbans forest.", translation: "সুন্দরবনের বনে চিত্রা হরিণ শান্তিতে ঘুরে বেড়ায়।" },
  { english: "rotate", bangla: "আবর্তন করা / ঘোরা", phonetic: "/roʊˈteɪt/", sentence: "The planet rotates on its imaginary axis daily.", translation: "গ্রহটি প্রতিদিন তার কাল্পনিক অক্ষের ওপর আবর্তন করে।" }
];

// Add batch 1, 2, 3 and nToZ
addItems(batch1);
addItems(batch2);
addItems(batch3);
addItems(nToZList);

console.log('Total items now after initial additions:', combined.length);
fs.writeFileSync('scripts/temp_combined.json', JSON.stringify(combined, null, 2));
