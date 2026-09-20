import fs from 'fs';
import { verbsListFtoZ } from './verbsListFtoZ.mjs';
import { verbsListPart3 } from './verbsListPart3.mjs';
import { verbsListPart4 } from './verbsListPart4.mjs';

// Load first 394 verified items
const first394 = JSON.parse(fs.readFileSync('scripts/parsed_first_395.json', 'utf8'));

const uniqueMap = new Map();

function insert(item) {
  const k = item.english.toLowerCase().trim();
  if (!uniqueMap.has(k)) {
    uniqueMap.set(k, item);
  }
}

// 1. Insert original 394
for (const item of first394) {
  insert(item);
}

// 2. Insert dictionaries from previous scripts
import { execSync } from 'child_process';
// Read dictionary array from buildCleanUnique1260
const buildFile = fs.readFileSync('scripts/buildCleanUnique1260.mjs', 'utf8');
const dictMatch = buildFile.match(/const dictionary = \[([\s\S]*?)\];/);
if (dictMatch) {
  try {
    const dict = eval(`[${dictMatch[1]}]`);
    for (const [english, bangla, phonetic, sentence, translation] of dict) {
      insert({ english, bangla, phonetic, sentence, translation });
    }
  } catch (e) {
    console.error('eval error', e);
  }
}

// 3. Insert verbsListFtoZ
for (const [english, bangla, phonetic, sentence, translation] of verbsListFtoZ) {
  insert({ english, bangla, phonetic, sentence, translation });
}

// 4. Insert verbsListPart3
for (const [english, bangla, phonetic, sentence, translation] of verbsListPart3) {
  insert({ english, bangla, phonetic, sentence, translation });
}

// 5. Insert verbsListPart4
for (const [english, bangla, phonetic, sentence, translation] of verbsListPart4) {
  insert({ english, bangla, phonetic, sentence, translation });
}

console.log('Unique items before adjectives expansion:', uniqueMap.size);

// 6. Curated educational adjectives to guarantee > 1260 distinct genuine words
const educationalAdjectives = [
  ["academic", "একাডেমিক / প্রাতিষ্ঠানিক", "/ˌækəˈdɛmɪk/", "She has a brilliant academic record.", "তার একটি চমৎকার প্রাতিষ্ঠানিক ফলাফল রয়েছে।"],
  ["accessible", "সহজে প্রবেশযোগ্য", "/əkˈsɛsəbl/", "The school library is accessible to all students.", "বিদ্যালয়ের পাঠাগারটি সকল শিক্ষার্থীর জন্য সহজপ্রবেশ্য।"],
  ["accurate", "সঠিক ও নির্ভুল", "/ˈækjərət/", "Give accurate answers in the quiz.", "কুইজে সঠিক ও নির্ভুল উত্তর দাও।"],
  ["active", "সক্রিয় / কর্মঠ", "/ˈæktɪv/", "Active participation improves your learning.", "সক্রিয় অংশগ্রহণ তোমার শিক্ষাকে উন্নত করে।"],
  ["actual", "প্রকৃত / আসল", "/ˈæktʃuəl/", "The actual results exceeded our expectations.", "প্রকৃত ফলাফল আমাদের প্রত্যাশাকে ছাড়িয়ে গিয়েছিল।"],
  ["acute", "তীব্র / প্রখর", "/əˈkjuːt/", "He has an acute sense of observation.", "তার পর্যবেক্ষণে প্রখর অন্তর্দৃষ্টি রয়েছে।"],
  ["adequate", "পর্যাপ্ত", "/ˈædɪkwət/", "Get adequate sleep before exam day.", "পরীক্ষার দিনের আগে পর্যাপ্ত ঘুমান।"],
  ["admirable", "প্রশংসনীয়", "/ˈædmərəbl/", "Honesty is an admirable human quality.", "সততা একটি প্রশংসনীয় মানবীয় গুণ।"],
  ["advanced", "উন্নত / অগ্রসর", "/ədˈvɑːnst/", "They teach advanced grammar techniques.", "তারা উন্নত ব্যাকরণ পদ্ধতি শেখান।"],
  ["adventurous", "দুঃসাহসিক", "/ədˈvɛntʃərəs/", "Adventurous youth explored the green hills.", "দুঃসাহসী তরুণরা সবুজ পাহাড় অন্বেষণ করেছিল।"],
  ["affectionate", "স্নেহশীল", "/əˈfɛkʃənət/", "She is an affectionate elder sister.", "তিনি একজন স্নেহময়ী বড় বোন।"],
  ["affordable", "সাশ্রয়ী", "/əˈfɔːrdəbl/", "Public transport provides affordable travel.", "গণপরিবহন সাশ্রয়ী ভ্রমণের সুবিধা প্রদান করে।"],
  ["alert", "সতর্ক", "/əˈlɜːrt/", "Stay alert when crossing railway lines.", "রেললাইন পার হওয়ার সময় সতর্ক থাকুন।"],
  ["alive", "জীবন্ত / প্রাণবন্ত", "/əˈlaɪv/", "The lively festival kept traditions alive.", "প্রাণবন্ত উৎসবটি ঐতিহ্যকে বাঁচিয়ে রেখেছে।"],
  ["alluring", "মনোমুগ্ধকর", "/əˈlʊərɪŋ/", "The green village offers an alluring landscape.", "সবুজ গ্রামটি মনোমুগ্ধকর ভূদৃশ্য উপস্থাপন করে।"],
  ["ambitious", "উচ্চাকাঙ্ক্ষী", "/æmˈbɪʃəs/", "Ambitious students dream of serving society.", "উচ্চাকাঙ্ক্ষী শিক্ষার্থীরা সমাজের সেবা করার স্বপ্ন দেখে।"],
  ["amiable", "বন্ধুভাবাপন্ন", "/ˈeɪmiəbl/", "His amiable manners won everyone's heart.", "তার অমায়িক আচরণ সবার মন জয় করেছিল।"],
  ["ample", "পর্যাপ্ত / প্রচুর", "/ˈæmpl/", "There is ample time for revision.", "পুনর্বিবেচনার জন্য পর্যাপ্ত সময় আছে।"],
  ["amusing", "কৌতুকপূর্ণ", "/əˈmjuːzɪŋ/", "The comic book has amusing illustrations.", "কমিক বইটিতে কৌতুকপূর্ণ চিত্র রয়েছে।"],
  ["ancient", "প্রাচীন", "/ˈeɪnʃənt/", "We visited the ancient Buddhist vihara.", "আমরা প্রাচীন বৌদ্ধ বিহারটি পরিদর্শন করেছিলাম।"],
  ["animated", "প্রাণবন্ত", "/ˈænɪmeɪtɪd/", "They had an animated discussion on books.", "বই নিয়ে তাদের একটি প্রাণবন্ত আলোচনা হয়েছিল।"],
  ["annual", "বার্ষিক", "/ˈænjuəl/", "The school holds an annual prize ceremony.", "বিদ্যালয় একটি বার্ষিক পুরস্কার বিতরণী অনুষ্ঠান আয়োজন করে।"],
  ["anxious", "উদ্বিগ্ন", "/ˈæŋkʃəs/", "Do not feel anxious before the test.", "পরীক্ষার আগে উদ্বিগ্ন বোধ করবেন না।"],
  ["apparent", "স্পষ্ট / দৃশ্যমান", "/əˈpærənt/", "His dedication is apparent to everyone.", "তার নিষ্ঠা সবার কাছে স্পষ্ট।"],
  ["appealing", "আকর্ষণীয়", "/əˈpiːlɪŋ/", "Healthy organic food looks appealing.", "স্বাস্থ্যকর জৈব খাবার আকর্ষণীয় দেখায়।"],
  ["applicable", "প্রযোজ্য", "/əˈplɪkəbl/", "This rule is applicable in all schools.", "এই নিয়মটি সকল বিদ্যালয়ে প্রযোজ্য।"],
  ["appreciative", "কৃতজ্ঞতাবোধসম্পন্ন", "/əˈpriːʃətɪv/", "Be appreciative of the help you receive.", "তুমি যে সাহায্য পাও তার প্রতি কৃতজ্ঞতাবোধ রাখো।"],
  ["approachable", "সহজলভ্য / মিশুক", "/əˈproʊtʃəbl/", "The head teacher is warm and approachable.", "প্রধান শিক্ষক আন্তরিক এবং অমায়িক।"],
  ["appropriate", "উপযুক্ত / যথাযথ", "/əˈproʊpriət/", "Wear appropriate dress to the hall.", "হলঘরে উপযুক্ত পোশাক পরিধান করুন।"],
  ["apt", "উপযুক্ত / দক্ষ", "/æpt/", "He made an apt remark during the debate.", "বিতর্কে তিনি একটি অত্যন্ত উপযুক্ত মন্তব্য করেছিলেন।"],
  ["ardent", "উৎসাহী", "/ˈɑːrdnt/", "She is an ardent lover of classical music.", "সে উচ্চাঙ্গ সঙ্গীতের একনিষ্ঠ অনুরাগী।"],
  ["arduous", "কঠিন / শ্রমসাধ্য", "/ˈɑːrdʒuəs/", "Climbing the peak was an arduous journey.", "চূড়ায় আরোহণ ছিল এক শ্রমসাধ্য যাত্রা।"],
  ["aromatic", "সুগন্ধিযুক্ত", "/ˌærəˈmætɪk/", "Cardamom and cloves are aromatic spices.", "এলাচ ও লবঙ্গ সুগন্ধি মসলা।"],
  ["artistic", "শৈল্পিক", "/ɑːrˈtɪstɪk/", "The handloom saree has artistic patterns.", "হস্তচালিত তাঁতের শাড়িতে শৈল্পিক নকশা রয়েছে।"],
  ["ashamed", "লজ্জিত", "/əˈʃeɪmd/", "He felt ashamed of his rude behavior.", "সে তার অভদ্র আচরণের জন্য লজ্জিত বোধ করল।"],
  ["aspiring", "উচ্চাকাঙ্ক্ষী", "/əˈspaɪərɪŋ/", "Aspiring authors write stories every day.", "উচ্চাকাঙ্ক্ষী লেখকরা প্রতিদিন গল্প লেখেন।"],
  ["astonishing", "বিস্ময়কর", "/əˈstɒnɪʃɪŋ/", "The child has astonishing memory skills.", "শিশুটির স্মরণশক্তি বিস্ময়কর।"],
  ["astute", "চতুর / তীক্ষ্ণবুদ্ধি", "/əˈstjuːt/", "The astute lawyer won the case.", "তীক্ষ্ণবুদ্ধি আইনজীবী মামলায় জয়লাভ করেছিলেন।"],
  ["athletic", "ক্রীড়াপ্রেমী / সুঠামদেহী", "/æθˈlɛtɪk/", "Regular running keeps your body athletic.", "নিয়মিত দৌড় শরীরকে সুঠাম রাখে।"],
  ["attentive", "মনোযোগী", "/əˈtɛntɪv/", "Attentive students master lessons fast.", "মনোযোগী শিক্ষার্থীরা দ্রুত পাঠ আয়ত্ত করে।"],
  ["authentic", "খাঁটি / আসল", "/ɔːˈθɛntɪk/", "Always verify authentic sources of news.", "খবরের ক্ষেত্রে সর্বদা আসল উৎস যাচাই করুন।"],
  ["automatic", "স্বয়ংক্রিয়", "/ˌɔːtəˈmætɪk/", "The library door has an automatic lock.", "পাঠাগারের দরজায় একটি স্বয়ংক্রিয় তালা রয়েছে।"],
  ["available", "সহজলভ্য", "/əˈveɪləbl/", "Pure drinking water is freely available here.", "এখানে বিশুদ্ধ খাবার পানি সহজলভ্য।"],
  ["avid", "অত্যন্ত আগ্রহী", "/ˈævɪd/", "He is an avid reader of history books.", "সে ইতিহাস বইয়ের একজন অত্যন্ত আগ্রহী পাঠক।"],
  ["aware", "সচেতন", "/əˈwɛər/", "Be aware of your civic duties.", "তোমার নাগরিক দায়িত্ব সম্পর্কে সচেতন হও।"],
  ["awesome", "চমৎকার / বিস্ময়কর", "/ˈɔːsəm/", "The view from Cox's Bazar is awesome.", "কক্সবাজারের দৃশ্য অত্যন্ত চমৎকার।"],
  ["balanced", "সুষম", "/ˈbælənst/", "Eat a balanced diet to stay robust.", "সুস্থ-সবল থাকতে সুষম খাদ্য গ্রহণ করুন।"],
  ["bare", "অনাবৃত / খালি", "/bɛər/", "Do not walk barefoot on sharp stones.", "ধারালো পাথরের ওপর খালি পায়ে হাঁটবেন না।"],
  ["barren", "অনুর্বর", "/ˈbærən/", "Fertilizers turned barren soil fertile.", "সার ব্যবহারের মাধ্যমে অনুর্বর মাটি উর্বর হয়েছিল।"],
  ["basic", "মৌলিক", "/ˈbeɪsɪk/", "Food, clothing and shelter are basic needs.", "অন্ন, বস্ত্র ও বাসস্থান মৌলিক চাহিদা।"],
  ["beneficial", "উপকারী", "/ˌbɛnɪˈfɪʃl/", "Fresh fruits are beneficial for health.", "তাজা ফলমূল স্বাস্থ্যের জন্য উপকারী।"],
  ["benevolent", "পরোপকারী / হিতৈষী", "/bəˈnɛvələnt/", "A benevolent doctor treated poor patients.", "একজন পরোপকারী ডাক্তার গরিব রোগীদের চিকিৎসা করেছিলেন।"],
  ["bilingual", "দ্বিভাষী", "/baɪˈlɪŋɡwəl/", "She is bilingual in Bengali and English.", "তিনি বাংলা এবং ইংরেজিতে দ্বিভাষী।"],
  ["bitter", "তিক্ত", "/ˈbɪtər/", "Neem tea has a bitter but healthy taste.", "নিম চায়ের স্বাদ তিক্ত তবে স্বাস্থ্যকর।"],
  ["bizarre", "অদ্ভুত", "/bɪˈzɑːr/", "The weird sculpture had a bizarre shape.", "অদ্ভুত ভাস্কর্যটির রূপ ছিল বেশ অদ্ভুত।"],
  ["bland", "স্বাদহীন / নরম", "/blænd/", "Boiled rice has a bland taste.", "সিদ্ধ ভাতের স্বাদ সাধারণত মৃদু ও সাদামাটা।"],
  ["blissful", "পরম আনন্দময়", "/ˈblɪsfl/", "We spent a blissful day near the lake.", "হ্রদের তীরে আমরা একটি পরম আনন্দময় দিন কাটিয়েছিলাম।"],
  ["boisterous", "কোলাহলপূর্ণ", "/ˈbɔɪstərəs/", "Boisterous children played in the field.", "কোলাহলপূর্ণ শিশুরা মাঠে খেলা করছিল।"],
  ["bold", "সাহসী", "/boʊld/", "Take bold decisions for the good of all.", "সকলের মঙ্গলের জন্য সাহসী সিদ্ধান্ত নিন।"],
  ["bountiful", "প্রচুর / প্রাচুর্যময়", "/ˈbaʊntɪfl/", "Autumn brings a bountiful paddy harvest.", "শরৎ প্রাচুর্যময় ধানের ফসল বয়ে আনে।"],
  ["brave", "সাহসী", "/breɪv/", "The brave lifeguard saved drowning swimmers.", "সাহসী লাইফগার্ড ডুবন্ত সাঁতারুদের বাঁচিয়েছিলেন।"],
  ["breathtaking", "শ্বাসরুদ্ধকর সুন্দর", "/ˈbrɛθˌteɪkɪŋ/", "The Himalayan vista is breathtaking.", "হিমালয়ের দৃশ্য শ্বাসরুদ্ধকর সুন্দর।"],
  ["brief", "সংক্ষিপ্ত", "/briːf/", "He delivered a brief yet inspiring speech.", "তিনি একটি সংক্ষিপ্ত অথচ অনুপ্রেরণাদায়ী বক্তব্য দিয়েছিলেন।"],
  ["brilliant", "মেধাবী / উজ্জ্বল", "/ˈbrɪljənt/", "The brilliant scientist won international awards.", "মেধাবী বিজ্ঞানী আন্তর্জাতিক পুরস্কার জিতেছিলেন।"],
  ["brisk", "দ্রুত / চটপটে", "/brɪsk/", "A brisk walk keeps the heart healthy.", "দ্রুত হাঁটা হৃদযন্ত্রকে সুস্থ রাখে।"],
  ["broad", "প্রশস্ত", "/brɔːd/", "The newly paved highway is very broad.", "নতুন পাকা মহাসড়কটি বেশ প্রশস্ত।"],
  ["buoyant", "ভাসমান / প্রফুল্ল", "/ˈbɔɪənt/", "Wood is a buoyant material on water.", "কাঠ পানির ওপর একটি ভাসমান উপাদান।"],
  ["busy", "ব্যস্ত", "/ˈbɪzi/", "Bazaars are busy on festival mornings.", "উৎসবের সকালে হাটবাজার বেশ ব্যস্ত থাকে।"],
  ["calm", "শান্ত", "/kɑːm/", "Maintain a calm demeanor during stress.", "চাপের সময় শান্ত আচরণ বজায় রাখুন।"],
  ["candid", "অকপট / স্পষ্টবাদী", "/ˈkændɪd/", "She gave a candid answer to the question.", "প্রশ্নের জবাবে তিনি একটি অকপট উত্তর দিয়েছিলেন।"],
  ["capable", "সক্ষম / যোগ্য", "/ˈkeɪpəbl/", "He is capable of solving hard equations.", "সে কঠিন সমীকরণ সমাধান করতে সক্ষম।"],
  ["careful", "সতর্ক", "/ˈkɛərfl/", "Be careful while crossing the highway.", "মহাসড়ক পার হওয়ার সময় সতর্ক থাকুন।"],
  ["careless", "অসাবধান", "/ˈkɛərlɪs/", "Careless mistakes reduce exam marks.", "অসাবধান ভুলের কারণে পরীক্ষায় নম্বর কমে যায়।"],
  ["cautious", "সতর্ক", "/ˈkɔːʃəs/", "Cautious drivers prevent accidents.", "সতর্ক চালকরা দুর্ঘটনা প্রতিরোধ করেন।"],
  ["celebrated", "বিখ্যাত / নন্দিত", "/ˈsɛlɪbreɪtɪd/", "Kazi Nazrul Islam is a celebrated poet.", "কাজী নজরুল ইসলাম একজন নন্দিত কবি।"],
  ["central", "কেন্দ্রীয়", "/ˈsɛntrəl/", "The school is in the central part of town.", "বিদ্যালয়টি শহরের কেন্দ্রীয় অংশে অবস্থিত।"],
  ["certain", "নিশ্চিত", "/ˈsɜːrtn/", "It is certain that truth triumphs.", "এটি নিশ্চিত যে সত্যেরই জয় হয়।"],
  ["champion", "বিজয়ী", "/ˈtʃæmpiən/", "The champion team received golden trophies.", "বিজয়ী দল সোনালি ট্রফি গ্রহণ করেছিল।"],
  ["characteristic", "বৈশিষ্ট্যপূর্ণ", "/ˌkærəktəˈrɪstɪk/", "Patience is a characteristic virtue of sages.", "ধৈর্য সাধকদের একটি বৈশিষ্ট্যপূর্ণ সদ্গুণ।"],
  ["charitable", "দানশীল", "/ˈtʃærɪtəbl/", "Kind merchants founded charitable schools.", "দয়ালু ব্যবসায়ীরা দাতব্য বিদ্যালয় প্রতিষ্ঠা করেছিলেন।"],
  ["charming", "মনোমুগ্ধকর", "/ˈtʃɑːrmɪŋ/", "The river bank has a charming view.", "নদীর পাড়ের দৃশ্যটি অত্যন্ত মনোমুগ্ধকর।"],
  ["cheerful", "হাসিখুশি", "/ˈtʃɪərfl/", "A cheerful smile makes everyone happy.", "একটি হাসিখুশি মুখ সবাইকে আনন্দিত করে।"],
  ["childish", "শিশুসুলভ", "/ˈtʃaɪldɪʃ/", "Do not engage in childish quarrels.", "শিশুসুলভ ঝগড়ায় লিপ্ত হবেন না।"],
  ["chilly", "শীতল", "/ˈtʃɪli/", "Winter mornings in Sylhet are chilly.", "সিলেটে শীতের সকাল বেশ ঠান্ডা হয়।"],
  ["chronic", "দীর্ঘস্থায়ী", "/ˈkrɒnɪk/", "Chronic pollution harms urban life.", "দীর্ঘস্থায়ী দূষণ নগর জীবনের ক্ষতি করে।"],
  ["civic", "নাগরিক", "/ˈsɪvɪk/", "Keep civic cleanliness in your locality.", "তোমার এলাকায় নাগরিক পরিচ্ছন্নতা বজায় রাখো।"],
  ["civil", "ভদ্র / অসামরিক", "/ˈsɪvl/", "Always use civil language in debates.", "বিতর্কে সর্বদা মার্জিত ভাষা ব্যবহার করুন।"],
  ["classical", "ধ্রুপদী", "/ˈklæsɪkl/", "He enjoys listening to classical music.", "তিনি ধ্রুপদী সঙ্গীত শুনতে ভালোবাসেন।"],
  ["clean", "পরিচ্ছন্ন", "/kliːn/", "A clean environment prevents ailments.", "পরিচ্ছন্ন পরিবেশ রোগব্যাধি প্রতিরোধ করে।"],
  ["clever", "চালাক / চতুর", "/ˈklɛvər/", "The clever fox outsmarted the hunters.", "চালাক শিয়ালটি শিকারীদের বোকা বানিয়েছিল।"],
  ["climatic", "জলবায়ু সংক্রান্ত", "/klaɪˈmætɪk/", "Climatic changes affect agriculture globally.", "জলবায়ু পরিবর্তন বিশ্বজুড়ে কৃষিকে প্রভাবিত করে।"],
  ["cloudy", "মেঘলা", "/ˈklaʊdi/", "Cloudy skies brought refreshing summer rain.", "মেঘলা আকাশ স্বস্তিদায়ক গ্রীষ্মের বৃষ্টি নিয়ে এলো।"],
  ["clumsy", "আনাড়ি / বেমানান", "/ˈklʌmzi/", "The clumsy pup stumbled over the rug.", "আনাড়ি কুকুরছানাটি পাপোশের ওপর হোঁচট খেয়েছিল।"],
  ["coastal", "উপকূলীয়", "/ˈkoʊstl/", "Sundarbans is in the southern coastal belt.", "সুন্দরবন দক্ষিণ উপকূলীয় অঞ্চলে অবস্থিত।"],
  ["coherent", "সুসংগত", "/koʊˈhɪərənt/", "Write a coherent paragraph in English.", "ইংরেজিতে একটি সুসংগত অনুচ্ছেদ লেখো।"],
  ["collective", "সম্মিলিত", "/kəˈlɛktɪv/", "Collective efforts lead to great progress.", "সম্মিলিত প্রচেষ্টা বিরাট অগ্রগতি সাধন করে।"],
  ["colorful", "রঙিন", "/ˈkʌlərfl/", "Festivals showcase colorful ethnic garments.", "উৎসবগুলো রঙিন জাতিগত পোশাক প্রদর্শন করে।"],
  ["colossal", "বিশাল / প্রকাণ্ড", "/kəˈlɒsl/", "The ancient banyan tree is colossal.", "প্রাচীন বটগাছটি প্রকাণ্ড আকারের।"],
  ["comfortable", "আরামদায়ক", "/ˈkʌmftəbl/", "This wooden chair is very comfortable.", "এই কাঠের চেয়ারটি অত্যন্ত আরামদায়ক।"],
  ["comic", "হাস্যরসাত্মক", "/ˈkɒmɪk/", "The folk theatre performed comic skits.", "লোকনাট্য দল হাস্যকৌতুকপূর্ণ নাটক পরিবেশন করেছিল।"],
  ["commendable", "প্রশংসনীয়", "/kəˈmɛndəbl/", "His commitment to studying is commendable.", "পড়াশোনায় তার নিষ্ঠা প্রশংসনীয়।"],
  ["commercial", "বাণিজ্যিক", "/kəˈmɜːrʃl/", "Chittagong is a vital commercial port.", "চট্টগ্রাম একটি অত্যন্ত গুরুত্বপূর্ণ বাণিজ্যিক বন্দর।"],
  ["common", "সাধারণ", "/ˈkɒmən/", "Good health is the common wish of all.", "সুস্বাস্থ্য সকলেরই সাধারণ আকাঙ্ক্ষা।"],
  ["compact", "ছোট ও আঁটসাঁট", "/kəmˈpækt/", "A compact dictionary is easy to carry.", "একটি ছোট অভিধান বহন করা সহজ।"],
  ["compassionate", "সহানুভূতিশীল", "/kəmˈpæʃənət/", "Be compassionate towards stray creatures.", "অসহায় প্রাণীদের প্রতি সহানুভূতিশীল হোন।"],
  ["compatible", "সামঞ্জস্যপূর্ণ", "/kəmˈpætəbl/", "The software is compatible with laptops.", "সফটওয়্যারটি ল্যাপটপের সাথে সামঞ্জস্যপূর্ণ।"],
  ["compelling", "আকর্ষণীয় / অকাট্য", "/kəmˈpɛlɪŋ/", "The speaker gave compelling arguments.", "বক্তা অকাট্য যুক্তি উপস্থাপন করেছিলেন।"],
  ["competent", "দক্ষ", "/ˈkɒmpɪtənt/", "Competent teachers guide pupils well.", "দক্ষ শিক্ষকরা শিক্ষার্থীদের চমৎকার নির্দেশনা দেন।"],
  ["complete", "সম্পূর্ণ", "/kəmˈpliːt/", "Submit your complete homework on time.", "সময়মতো তোমার সম্পূর্ণ বাড়ির কাজ জমা দাও।"],
  ["complex", "জটিল", "/ˈkɒmplɛks/", "Break complex sentences into simple ones.", "জটিল বাক্যগুলোকে সরল বাক্যে রূপান্তর করো।"],
  ["compliant", "নিয়মানুবর্তী", "/kəmˈplaɪənt/", "Compliant organizations follow the law.", "নিয়মানুবর্তী প্রতিষ্ঠানগুলো আইন মেনে চলে।"],
  ["composed", "ধীরস্থির", "/kəmˈpoʊzd/", "Stay composed even under examination stress.", "পরীক্ষার চাপের মাঝেও ধীরস্থির থাকুন।"],
  ["comprehensive", "ব্যাপক / পূর্ণাঙ্গ", "/ˌkɒmprɪˈhɛnsɪv/", "This is a comprehensive English dictionary.", "এটি একটি পূর্ণাঙ্গ ইংরেজি অভিধান।"],
  ["concise", "সংক্ষিপ্ত ও সারগর্ভ", "/kənˈsaɪs/", "Write concise summaries for quick review.", "দ্রুত পড়ার জন্য সারগর্ভ সারসংক্ষেপ লেখো।"],
  ["conclusive", "চূড়ান্ত", "/kənˈkluːsɪv/", "The report presented conclusive findings.", "প্রতিবেদনটি চূড়ান্ত ফলাফল উপস্থাপন করেছিল।"],
  ["concrete", "সুনির্দিষ্ট / বাস্তব", "/ˈkɒŋkriːt/", "Provide concrete examples in your essay.", "তোমার প্রবন্ধে সুনির্দিষ্ট উদাহরণ প্রদান করো।"],
  ["conditional", "শর্তাধীন", "/kənˈdɪʃənl/", "Passage of the bill was conditional.", "বিলটি পাস হওয়া শর্তাধীন ছিল।"],
  ["confident", "আত্মবিশ্বাসী", "/ˈkɒnfɪdənt/", "Speak with a confident and clear voice.", "আত্মবিশ্বাসী ও স্পষ্ট কণ্ঠে কথা বলুন।"],
  ["confidential", "গোপনীয়", "/ˌkɒnfɪˈdɛnʃl/", "Exam question papers are confidential.", "পরীক্ষার প্রশ্নপত্র অত্যন্ত গোপনীয়।"],
  ["conscious", "সচেতন", "/ˈkɒnʃəs/", "Be conscious of your ecological impact.", "পরিবেশের ওপর তোমার প্রভাব সম্পর্কে সচেতন হও।"],
  ["consecutive", "টানা / ধারাবাহিক", "/kənˈsɛkjətɪv/", "He won medals in three consecutive years.", "সে টানা তিন বছর পদক জিতেছিল।"],
  ["conservative", "রক্ষণশীল", "/kənˈsɜːrvətɪv/", "He prefers conservative spending habits.", "তিনি পরিমিত ব্যয় করার অভ্যাস পছন্দ করেন।"],
  ["considerable", "উল্লেখযোগ্য", "/kənˈsɪdərəbl/", "He made considerable progress in English.", "সে ইংরেজিতে উল্লেখযোগ্য অগ্রগতি করেছে।"],
  ["consistent", "ধারাবাহিক", "/kənˈsɪstənt/", "Consistent study ensures academic success.", "ধারাবাহিক পড়াশোনা শিক্ষাজীবনে সাফল্য এনে দেয়।"],
  ["conspicuous", "সুস্পষ্ট", "/kənˈspɪkjuəs/", "The red beacon is conspicuous at night.", "লাল বাতিটি রাতে অত্যন্ত সুস্পষ্টভাবে দেখা যায়।"],
  ["constant", "ধ্রুব / অবিরাম", "/ˈkɒnstənt/", "Constant practice sharpens memory.", "অবিরাম অনুশীলন স্মৃতিশক্তিকে ধারালো করে।"],
  ["constructive", "গঠনমূলক", "/kənˈstrʌktɪv/", "Constructive feedback helps students grow.", "গঠনমূলক পরামর্শ শিক্ষার্থীদের উন্নতিতে সাহায্য করে।"],
  ["contemporary", "সমসাময়িক", "/kənˈtɛmpərəri/", "They read contemporary literature.", "তারা সমসাময়িক সাহিত্য অধ্যয়ন করে।"],
  ["content", "সন্তুষ্ট", "/kənˈtɛnt/", "A content heart enjoys true tranquility.", "একটি সন্তুষ্ট হৃদয় প্রকৃত প্রশান্তি উপভোগ করে।"],
  ["continuous", "অবিচ্ছিন্ন", "/kənˈtɪnjuəs/", "Continuous learning keeps your intellect alive.", "অবিচ্ছিন্ন জ্ঞানচর্চা তোমার বুদ্ধিকে সজীব রাখে।"],
  ["convenient", "সুবিধাজনক", "/kənˈviːniənt/", "Digital books are convenient to read.", "ডিজিটাল বই পড়া খুবই সুবিধাজনক।"],
  ["conventional", "প্রচলিত", "/kənˈvɛnʃənl/", "Conventional farming methods use natural compost.", "প্রচলিত চাষ পদ্ধতিতে প্রাকৃতিক কম্পোস্ট ব্যবহার করা হয়।"],
  ["cool", "শীতল / শান্ত", "/kuːl/", "Morning breeze feels cool and pleasant.", "সকালের বাতাস শীতল ও মনোরম অনুভূতি দেয়।"],
  ["cooperative", "সহযোগিতাপূর্ণ", "/koʊˈɒpərətɪv/", "Cooperative teamwork ensures victory.", "সহযোগিতাপূর্ণ দলগত কাজ নিশ্চিতভাবেই বিজয় এনে দেয়।"],
  ["cordial", "আন্তরিক", "/ˈkɔːrdiəl/", "The host extended a cordial welcome.", "আয়োজক এক আন্তরিক অভ্যর্থনা জানিয়েছিলেন।"],
  ["correct", "সঠিক", "/kəˈrɛkt/", "Mark the correct option in the quiz.", "কুইজে সঠিক বিকল্পটি চিহ্নিত করো।"],
  ["courageous", "সাহসী", "/kəˈreɪdʒəs/", "Courageous youths stood up for justice.", "সাহসী তরুণরা ন্যায়ের পক্ষে দাঁড়িয়েছিল।"],
  ["courteous", "বিনয়ী / শিষ্টাচারসম্পন্ন", "/ˈkɜːrtiəs/", "Courteous language reflects fine character.", "শিষ্টাচারসম্পন্ন ভাষা উত্তম চরিত্রের পরিচয় দেয়।"],
  ["creative", "সৃজনশীল", "/kriˈeɪtɪv/", "Creative writing expresses unique ideas.", "সৃজনশীল লেখা মৌলিক চিন্তাভাবনা প্রকাশ করে।"],
  ["credible", "বিশ্বাসযোগ্য", "/ˈkrɛdəbl/", "Only rely on credible scientific reports.", "কেবল বিশ্বাসযোগ্য বৈজ্ঞানিক প্রতিবেদনের ওপর নির্ভর করুন।"],
  ["critical", "সংকটপূর্ণ / সূক্ষ্ম", "/ˈkrɪtɪkl/", "Critical thinking solves hard problems.", "সূক্ষ্ম চিন্তাশক্তি জটিল সমস্যাগুলোর সমাধান করে।"],
  ["crucial", "অত্যন্ত গুরুত্বপূর্ণ", "/ˈkruːʃl/", "Water conservation is crucial for life.", "পানি সংরক্ষণ জীবনের জন্য অত্যন্ত গুরুত্বপূর্ণ।"],
  ["cultural", "সাংস্কৃতিক", "/ˈkʌltʃərəl/", "Folk songs represent our cultural identity.", "লোকগান আমাদের সাংস্কৃতিক পরিচয়ের প্রতিনিধিত্ব করে।"],
  ["curious", "কৌতূহলী", "/ˈkjʊəriəs/", "Curious minds explore new horizons.", "কৌতূহলী মন নতুন দিগন্ত অন্বেষণ করে।"],
  ["customary", "প্রথাগত", "/ˈkʌstəməri/", "It is customary to greet guests warmly.", "অতিথিদের উষ্ণ অভ্যর্থনা জানানো প্রথাগত রীতি।"],
  ["cute", "মিষ্টি / মনোরম", "/kjuːt/", "The cute little kitten purred happily.", "মিষ্টি ছোট্ট বিড়ালছানাটি আনন্দে ডাকছিল।"]
];

for (const [english, bangla, phonetic, sentence, translation] of educationalAdjectives) {
  insert({ english, bangla, phonetic, sentence, translation });
}

console.log('Unique items after adjectives expansion:', uniqueMap.size);

// More high-yield curated words
const moreWords = [
  ["daring", "সাহসী", "/ˈdɛərɪŋ/", "The daring rescue saved the fisherman.", "সাহসী উদ্ধার অভিযান জেলেকে বাঁচিয়েছিল।"],
  ["dazzling", "মনোমুগ্ধকর", "/ˈdæzlɪŋ/", "The fireworks displayed dazzling colors.", "আতশবাজি মনোমুগ্ধকর রঙ প্রদর্শন করেছিল।"],
  ["decisive", "দৃঢ়প্রতিজ্ঞ", "/dɪˈsaɪsɪv/", "Take decisive action to avert peril.", "বিপদ এড়াতে দৃঢ়প্রতিজ্ঞ পদক্ষেপ নিন।"],
  ["decorous", "ভদ্র ও শোভন", "/ˈdɛkərəs/", "Maintain decorous behavior in gatherings.", "সমাবেশে শোভন আচরণ বজায় রাখুন।"],
  ["dedicated", "উৎসর্গীকৃত", "/ˈdɛdɪkeɪtɪd/", "Dedicated teachers inspire students.", "উৎসর্গীকৃত শিক্ষকরা শিক্ষার্থীদের অনুপ্রাণিত করেন।"],
  ["defensive", "প্রতিরক্ষামূলক", "/dɪˈfɛnsɪv/", "The fort had strong defensive walls.", "দুর্গের শক্তিশালী প্রতিরক্ষামূলক প্রাচীর ছিল।"],
  ["definite", "নির্দিষ্ট", "/ˈdɛfɪnɪt/", "Set a definite time for daily studies.", "প্রতিদিনের পড়ার জন্য একটি নির্দিষ্ট সময় নির্ধারণ করো।"],
  ["deliberate", "সুচিন্তিত", "/dɪˈlɪbərət/", "He spoke with deliberate care.", "তিনি সুচিন্তিতভাবে কথা বলেছিলেন।"],
  ["delightful", "আনন্দদায়ক", "/dɪˈlaɪtfl/", "A walk in the tea garden is delightful.", "চা বাগানে হাঁটা অত্যন্ত আনন্দদায়ক।"],
  ["democratic", "গণতান্ত্রিক", "/ˌdɛməˈkrætɪk/", "Democratic principles value free speech.", "গণতান্ত্রিক নীতি বাকস্বাধীনতা রক্ষা করে।"],
  ["dependable", "নির্ভরযোগ্য", "/dɪˈpɛndəbl/", "A dependable friend is a great blessing.", "একজন নির্ভরযোগ্য বন্ধু এক পরম আশীর্বাদ।"],
  ["descriptive", "বর্ণনামূলক", "/dɪˈskrɪptɪv/", "Use rich descriptive words in stories.", "গল্পে সমৃদ্ধ বর্ণনামূলক শব্দ ব্যবহার করো।"],
  ["destined", "নির্ধারিত", "/ˈdɛstɪnd/", "Hard workers are destined to succeed.", "পরিশ্রমীরা সফল হওয়ার জন্যই নির্ধারিত।"],
  ["determined", "দৃঢ়সংকল্পবদ্ধ", "/dɪˈtɜːrmɪnd/", "She is determined to pass the test.", "সে পরীক্ষায় উত্তীর্ণ হতে দৃঢ়সংকল্পবদ্ধ।"],
  ["devout", "ধার্মিক", "/dɪˈvaʊt/", "A devout individual loves honesty.", "ধার্মিক ব্যক্তি সততা ভালোবাসেন।"],
  ["diplomatic", "কূটনৈতিক", "/ˌdɪpləˈmætɪk/", "He resolved tensions through diplomatic speech.", "কূটনৈতিক বক্তব্যের মাধ্যমে তিনি উত্তেজনা প্রশমিত করেছিলেন।"],
  ["direct", "সরাসরি", "/daɪˈrɛkt/", "Give direct answers to questions.", "প্রশ্নের সরাসরি উত্তর দিন।"],
  ["discreet", "সতর্ক ও সুবিবেচক", "/dɪˈskriːt/", "Be discreet with private conversations.", "ব্যক্তিগত আলোচনার ক্ষেত্রে সুবিবেচক হোন।"],
  ["distinct", "স্বতন্ত্র / স্পষ্ট", "/dɪˈstɪŋkt/", "Each dialect has a distinct charm.", "প্রতিটি উপভাষার নিজস্ব স্বতন্ত্র মাধুর্য রয়েছে।"],
  ["distinctive", "বিশিষ্ট", "/dɪˈstɪŋktɪv/", "Jamdani sarees have distinctive motifs.", "জামদানি শাড়িতে বিশিষ্ট নকশা রয়েছে।"],
  ["diverse", "বৈচিত্র্যময়", "/daɪˈvɜːrs/", "Bangladesh has a rich diverse heritage.", "বাংলাদেশের রয়েছে সমৃদ্ধ ও বৈচিত্র্যময় ঐতিহ্য।"],
  ["divine", "স্বর্গীয় / মহিমান্বিত", "/dɪˈvaɪn/", "Motherly love has a divine beauty.", "মাতৃস্নেহে এক স্বর্গীয় সৌন্দর্য রয়েছে।"],
  ["dramatic", "নাটকীয়", "/drəˈmætɪk/", "The match had a dramatic last over.", "ম্যাচটিতে একটি নাটকীয় শেষ ওভার ছিল।"],
  ["dynamic", "গতিশীল", "/daɪˈnæmɪk/", "Youth bring dynamic changes to society.", "তরুণরা সমাজে গতিশীল পরিবর্তন নিয়ে আসে।"],
  ["eager", "আগ্রহী", "/ˈiːɡər/", "Pupils are eager to learn new words.", "শিক্ষার্থীরা নতুন শব্দ শিখতে আগ্রহী।"],
  ["earnest", "আন্তরিক", "/ˈɜːrnɪst/", "Make an earnest effort to improve.", "উন্নতির জন্য একটি আন্তরিক প্রচেষ্টা করো।"],
  ["earthly", "পার্থিব", "/ˈɜːrθli/", "Value virtues over earthly possessions.", "পার্থিব সম্পদের চেয়ে সদ্গুণাবলীকে গুরুত্ব দিন।"],
  ["eccentric", "খামখেয়ালী", "/ɪkˈsɛntrɪk/", "The eccentric genius loved quirky puzzles.", "খামখেয়ালী প্রতিভাধর ব্যক্তি অদ্ভুত ধাঁধা ভালোবাসতেন।"],
  ["economic", "অর্থনৈতিক", "/ˌiːkəˈnɒmɪk/", "Education boosts economic security.", "শিক্ষা অর্থনৈতিক নিরাপত্তা বৃদ্ধি করে।"],
  ["economical", "মিতব্যয়ী", "/ˌiːkəˈnɒmɪkl/", "LED bulbs provide economical lighting.", "এলইডি বাল্ব মিতব্যয়ী আলোর ব্যবস্থা করে।"],
  ["ecstatic", "পরমানন্দিত", "/ɪkˈstætɪk/", "She was ecstatic when winning gold.", "স্বর্ণপদক জয়ের পর সে পরমানন্দিত হয়েছিল।"],
  ["educational", "শিক্ষামূলক", "/ˌɛdʒuˈkeɪʃənl/", "This quiz is an educational application.", "এই কুইজটি একটি শিক্ষামূলক অ্যাপ্লিকেশন।"],
  ["effective", "কার্যকর", "/ɪˈfɛktɪv/", "Repetition is an effective learning tool.", "পুনরাবৃত্তি একটি কার্যকর শিক্ষার মাধ্যম।"],
  ["efficient", "দক্ষ", "/ɪˈfɪʃnt/", "An efficient motor saves electricity.", "একটি দক্ষ মোটর বিদ্যুৎ সাশ্রয় করে।"],
  ["elaborate", "বিস্তারিত", "/ɪˈlæbərət/", "He gave an elaborate explanation.", "তিনি একটি বিস্তারিত ব্যাখ্যা দিয়েছিলেন।"],
  ["elastic", "স্থিতিস্থাপক", "/ɪˈlæstɪk/", "Rubber bands are elastic materials.", "রাবার ব্যান্ড স্থিতিস্থাপক উপাদান।"],
  ["electric", "বৈদ্যুতিক", "/ɪˈlɛktrɪk/", "Electric trains run on green power.", "বৈদ্যুতিক ট্রেন পরিবেশবান্ধব শক্তিতে চলে।"],
  ["elegant", "মার্জিত", "/ˈɛlɪɡənt/", "She wore an elegant traditional dress.", "তিনি একটি মার্জিত ঐতিহ্যবাহী পোশাক পরেছিলেন।"],
  ["elementary", "প্রাথমিক", "/ˌɛlɪˈmɛntri/", "Elementary arithmetic is easy to grasp.", "প্রাথমিক পাটিগণিত বোঝা খুব সহজ।"],
  ["elevated", "উচ্চ / উন্নত", "/ˈɛlɪveɪtɪd/", "The railway runs along an elevated track.", "রেলপথটি একটি উড়াল ট্র্যাক বরাবর চলে।"],
  ["eligible", "যোগ্য", "/ˈɛlɪdʒəbl/", "All students are eligible to participate.", "সকল শিক্ষার্থীই অংশ নেওয়ার যোগ্য।"],
  ["eloquent", "বাগ্মী / বাচনপটু", "/ˈɛləkwənt/", "The speaker gave an eloquent speech.", "বক্তা একটি অত্যন্ত বাগ্মী বক্তব্য প্রদান করেছিলেন।"],
  ["eminent", "বিশিষ্ট / প্রখ্যাত", "/ˈɛmɪnənt/", "An eminent doctor opened the hospital.", "একজন প্রখ্যাত চিকিৎসক হাসপাতালটি উদ্বোধন করেছিলেন।"],
  ["emotional", "আবেগপূর্ণ", "/ɪˈmoʊʃənl/", "Patriotic songs create an emotional bond.", "দেশাত্মবোধক গান এক আবেগপূর্ণ বন্ধন তৈরি করে।"],
  ["emphatic", "জোরালো", "/ɪmˈfætɪk/", "He gave an emphatic refusal to bribery.", "ঘুষের প্রতি তিনি এক জোরালো অস্বীকৃতি জানিয়েছিলেন।"],
  ["empirical", "অভিজ্ঞতালব্ধ", "/ɪmˈpɪrɪkl/", "Science relies on empirical evidence.", "বিজ্ঞান অভিজ্ঞতালব্ধ প্রমাণের ওপর নির্ভর করে।"],
  ["enchanted", "মুগ্ধ / মোহিত", "/ɪnˈtʃɑːntɪd/", "Visitors were enchanted by the garden.", "দর্শনার্থীরা বাগানটি দেখে মুগ্ধ হয়েছিলেন।"],
  ["endless", "অনন্ত", "/ˈɛndlɪs/", "Learning is an endless journey of wonder.", "শেখা হলো বিস্ময়ের এক অনন্ত যাত্রা।"],
  ["energetic", "কর্মোদ্যমী", "/ˌɛnərˈdʒɛtɪk/", "Energetic youth love sports and games.", "কর্মোদ্যমী তরুণরা খেলাধুলা ভালোবাসে।"],
  ["enlightened", "আলোকিত", "/ɪnˈlaɪtnd/", "Enlightened minds banish superstition.", "আলোকিত মন কুসংস্কার দূর করে।"],
  ["enormous", "বিশাল", "/ɪˈnɔːrməs/", "An enormous tree stands at village center.", "গ্রামের মাঝে এক বিশাল গাছ দাঁড়িয়ে আছে।"],
  ["enthusiastic", "উৎসাহী", "/ɪnˌθjuːziˈæstɪk/", "Enthusiastic learners answer every question.", "উৎসাহী শিক্ষার্থীরা প্রতিটি প্রশ্নের উত্তর দেয়।"],
  ["entire", "সমগ্র / সম্পূর্ণ", "/ɪnˈtaɪər/", "The entire village rejoiced in the feast.", "সমগ্র গ্রাম ভোজের আনন্দে মেতে উঠেছিল।"],
  ["environmental", "পরিবেশগত", "/ɪnˌvaɪrənˈmɛntl/", "Environmental protection is our civic duty.", "পরিবেশ রক্ষা আমাদের নাগরিক দায়িত্ব।"],
  ["equal", "সমান", "/ˈiːkwəl/", "All citizens have equal constitutional rights.", "সকল নাগরিকের সংবিধানে সমান অধিকার রয়েছে।"],
  ["equitable", "ন্যায়সঙ্গত", "/ˈɛkwɪtəbl/", "Distribute relief goods in an equitable way.", "ন্যায়সঙ্গত উপায়ে ত্রাণসামগ্রী বিতরণ করুন।"],
  ["essential", "অপরিহার্য", "/ɪˈsɛnʃl/", "Pure water is essential for healthy life.", "সুস্থ জীবনের জন্য বিশুদ্ধ পানি অপরিহার্য।"],
  ["eternal", "চিরন্তন", "/ɪˈtɜːrnl/", "Truth and virtue are eternal principles.", "সত্য এবং সদ্গুণ চিরন্তন নীতি।"],
  ["ethical", "নৈতিক", "/ˈɛθɪkl/", "Always pursue ethical business practices.", "সর্বদা নৈতিক ব্যবসায়িক চর্চা অনুসরণ করুন।"],
  ["evident", "সুস্পষ্ট", "/ˈɛvɪdənt/", "Her academic diligence is evident to all.", "পড়াশোনায় তার নিষ্ঠা সবার কাছে সুস্পষ্ট।"],
  ["exact", "সঠিক / নিখুঁত", "/ɪɡˈzækt/", "State the exact time of the seminar.", "সেমিনারের সঠিক সময় উল্লেখ করুন।"],
  ["excellent", "চমৎকার", "/ˈɛksələnt/", "You scored excellent marks on the quiz.", "তুমি কুইজে চমৎকার নম্বর পেয়েছ।"],
  ["exceptional", "ব্যতিক্রমী / অসাধারণ", "/ɪkˈsɛpʃənl/", "He has exceptional musical talent.", "তার অসাধারণ সঙ্গীত প্রতিভা রয়েছে।"],
  ["excessive", "অতিরিক্ত", "/ɪkˈsɛsɪv/", "Avoid excessive consumption of salt.", "অতিরিক্ত লবণ খাওয়া পরিহার করুন।"],
  ["exclusive", "একচেটিয়া / বিশেষ", "/ɪkˈskluːsɪv/", "The newspaper had an exclusive interview.", "পত্রিকায় একটি বিশেষ সাক্ষাৎকার ছাপা হয়েছিল।"],
  ["exemplary", "দৃষ্টান্তমূলক", "/ɪɡˈzɛmpləri/", "His conduct is exemplary for students.", "তার আচরণ শিক্ষার্থীদের জন্য দৃষ্টান্তমূলক।"],
  ["exhausted", "ক্লান্ত", "/ɪɡˈzɔːstɪd/", "The exhausted team rested under the tree.", "ক্লান্ত দলটি গাছের নিচে বিশ্রাম নিয়েছিল।"],
  ["exotic", "ভিনদেশি / অদ্ভুত সুন্দর", "/ɪɡˈzɒtɪk/", "The greenhouse hosts exotic orchids.", "গ্রিনহাউসে দুর্লভ সুন্দর অর্কিড রয়েছে।"],
  ["expensive", "ব্যয়বহুল", "/ɪkˈspɛnsɪv/", "Do not waste funds on expensive gadgets.", "ব্যয়বহুল ডিভাইসে অপচয় করবেন না।"],
  ["experienced", "অভিজ্ঞ", "/ɪkˈspɪəriənst/", "An experienced teacher mentors new tutors.", "একজন অভিজ্ঞ শিক্ষক নতুন শিক্ষকদের প্রশিক্ষণ দেন।"],
  ["expert", "দক্ষ / বিশেষজ্ঞ", "/ˈɛkspɜːrt/", "He is an expert in computer software.", "তিনি কম্পিউটার সফটওয়্যারে বিশেষজ্ঞ।"],
  ["explicit", "স্পষ্ট", "/ɪkˈsplɪsɪt/", "Follow explicit safety instructions in lab.", "গবেষণাগারে স্পষ্ট নিরাপত্তা নির্দেশাবলী মেনে চলুন।"],
  ["expressive", "অভিব্যক্তিময়", "/ɪkˈsprɛsɪv/", "She has expressive and bright eyes.", "তার চোখ দুটি অত্যন্ত বাঙ্ময় ও উজ্জ্বল।"],
  ["exquisite", "সূক্ষ্ম ও সুন্দর", "/ɪkˈskwɪzɪt/", "Jamdani weaves feature exquisite details.", "জামদানি বুননে সূক্ষ্ম কারুকাজ থাকে।"],
  ["extensive", "ব্যাপক", "/ɪkˈstɛnsɪv/", "The library houses an extensive collection.", "পাঠাগারটিতে একটি ব্যাপক সংগ্রহ রয়েছে।"],
  ["extraordinary", "অসাধারণ", "/ɪkˈstrɔːrdnri/", "He displayed extraordinary valor in battle.", "যুদ্ধে তিনি অসাধারণ বীরত্ব প্রদর্শন করেছিলেন।"],
  ["exuberant", "উচ্ছ্বল", "/ɪɡˈzjuːbərənt/", "Exuberant children danced in monsoon rain.", "উচ্ছ্বল শিশুরা বর্ষার বৃষ্টিতে নেচেছিল।"]
];

for (const [english, bangla, phonetic, sentence, translation] of moreWords) {
  insert({ english, bangla, phonetic, sentence, translation });
}

console.log('Total accumulated unique items:', uniqueMap.size);

// If still need more to cross 1260, let's add adjectives from F through Z
const remainingAdjectives = [
  ["faint", "মৃদু / অস্পষ্ট", "/feɪnt/", "We heard a faint sound in the distance.", "আমরা দূর থেকে একটি মৃদু শব্দ শুনতে পেলাম।"],
  ["fair", "ন্যায্য / ফর্সা", "/fɛər/", "Play a fair game and follow the rules.", "নিয়ম মেনে একটি ন্যায্য খেলা খেলুন।"],
  ["faithless", "বিশ্বাসহীন", "/ˈfeɪθlɪs/", "A faithless companion cannot be trusted.", "বিশ্বাসহীন সঙ্গীকে বিশ্বাস করা যায় না।"],
  ["familiar", "পরিচিত", "/fəˈmɪliər/", "Her face looked familiar to me.", "তার মুখটি আমার কাছে পরিচিত মনে হলো।"],
  ["famished", "ক্ষুধার্ত", "/ˈfæmɪʃt/", "The famished traveler ate hungrily.", "ক্ষুধার্ত পথিক ক্ষুধার সাথে আহার করলেন।"],
  ["famous", "বিখ্যাত", "/ˈfeɪməs/", "Sundarbans is famous for Royal Bengal Tigers.", "সুন্দরবন রয়েল বেঙ্গল টাইগারের জন্য বিখ্যাত।"],
  ["fancy", "সৌখিন", "/ˈfænsi/", "She bought a fancy notebook for writing.", "সে লেখার জন্য একটি সৌখিন খাতা কিনেছিল।"],
  ["fantastic", "চমৎকার", "/fænˈtæstɪk/", "We had a fantastic time at the park.", "পার্কে আমরা চমৎকার সময় কাটিয়েছিলাম।"],
  ["far", "দূরবর্তী", "/fɑːr/", "The hills are far from our city.", "পাহাড়গুলো আমাদের শহর থেকে অনেক দূরে।"],
  ["fatal", "মারাত্মক", "/ˈfeɪtl/", "Careless driving can cause fatal crashes.", "অসাবধান গাড়ি চালানো মারাত্মক দুর্ঘটনার কারণ হতে পারে।"],
  ["fearful", "ভীত / ভয়াবহ", "/ˈfɪərfl/", "The fearful storm shook the thatched huts.", "ভয়াবহ ঝড়টি কুঁড়েঘরগুলোকে নাড়িয়ে দিয়েছিল।"],
  ["fearless", "নির্ভীক", "/ˈfɪərlɪs/", "Fearless soldiers stood on the border.", "সীমান্তে নির্ভীক সেনারা দাঁড়িয়ে ছিল।"],
  ["feasible", "বাস্তবায়নযোগ্য", "/ˈfiːzəbl/", "Solar pumping is a feasible farming plan.", "সৌর পাম্পিং একটি বাস্তবায়নযোগ্য কৃষি পরিকল্পনা।"],
  ["ferocious", "হিংস্র", "/fəˈroʊʃəs/", "The ferocious tiger prowled the jungle.", "হিংস্র বাঘটি বনের মধ্যে ঘুরে বেড়াচ্ছিল।"],
  ["fertile", "উর্বর", "/ˈfɜːrtaɪl/", "The delta has very fertile soil.", "বদ্বীপের মাটি অত্যন্ত উর্বর।"],
  ["fervent", "আন্তরিক / প্রবল", "/ˈfɜːrvənt/", "We sent our fervent prayers for peace.", "আমরা শান্তির জন্য আমাদের আন্তরিক প্রার্থনা পাঠিয়েছি।"],
  ["festive", "উৎসবমুখর", "/ˈfɛstɪv/", "The village wore a festive look on Eid.", "ঈদে গ্রামটি উৎসবমুখর রূপ ধারণ করেছিল।"],
  ["fierce", "প্রচণ্ড / তীব্র", "/fɪərs/", "Fierce winds blew across the coast.", "উপকূলজুড়ে প্রচণ্ড বাতাস বয়ে গেল।"],
  ["filthy", "নোংরা", "/ˈfɪlθi/", "Wash hands so they never remain filthy.", "হাত ধুয়ে নিন যাতে তা কখনো নোংরা না থাকে।"],
  ["final", "চূড়ান্ত", "/ˈfaɪnl/", "This is the final question of the quiz.", "এটি কুইজের চূড়ান্ত প্রশ্ন।"],
  ["firm", "দৃঢ়", "/fɜːrm/", "He has a firm belief in honesty.", "সততায় তার দৃঢ় বিশ্বাস রয়েছে।"],
  ["fit", "উপযুক্ত / সুস্থ", "/fɪt/", "Regular exercise keeps you fit and active.", "নিয়মিত ব্যায়াম আপনাকে সুস্থ ও সক্রিয় রাখে।"],
  ["flamboyant", "জমকালো", "/flæmˈbɔɪənt/", "He wore flamboyant garments to the feast.", "ভোজের অনুষ্ঠানে তিনি জমকালো পোশাক পরেছিলেন।"],
  ["flat", "সমতল", "/flæt/", "The field is flat and ideal for cricket.", "মাঠটি সমতল এবং ক্রিকেটের জন্য উপযুক্ত।"],
  ["flawless", "নিখুঁত", "/ˈflɔːlɪs/", "She gave a flawless recitation of poem.", "সে নিখুঁতভাবে কবিতাটি আবৃত্তি করেছিল।"],
  ["fleeting", "ক্ষণস্থায়ী", "/ˈfliːtɪŋ/", "Rainbows are fleeting wonders of nature.", "রামধনু প্রকৃতির এক ক্ষণস্থায়ী বিস্ময়।"],
  ["flexible", "নমনীয়", "/ˈflɛksəbl/", "Bamboo has flexible stems that bend.", "বাঁশের কান্ড নমনীয় যা সহজেই বাঁকানো যায়।"],
  ["flimsy", "পাতলা / পলকা", "/ˈflɪmzi/", "Do not build with flimsy materials.", "পলকা উপাদান দিয়ে ভবন নির্মাণ করবেন না।"],
  ["foolish", "বোকা", "/ˈfuːlɪʃ/", "It is foolish to waste money on lottery.", "লটারিতে টাকা অপচয় করা চরম বোকামি।"],
  ["foregoing", "পূর্ববর্তী", "/fɔːrˈɡoʊɪŋ/", "Review the foregoing rules before tests.", "পরীক্ষার আগে পূর্ববর্তী নিয়মগুলো পর্যালোচনা করো।"],
  ["foreign", "বিদেশি", "/ˈfɒrən/", "Learning foreign languages opens new doors.", "বিদেশি ভাষা শেখা নতুন দুয়ার উন্মোচন করে।"],
  ["formal", "আনুষ্ঠানিক", "/ˈfɔːrml/", "Wear formal attire for the interview.", "সাক্ষাৎকারের জন্য আনুষ্ঠানিক পোশাক পরিধান করুন।"],
  ["formidable", "দুর্ধর্ষ / পরাক্রমশালী", "/ˈfɔːrmɪdəbl/", "The champion team is a formidable rival.", "চ্যাম্পিয়ন দলটি এক পরাক্রমশালী প্রতিদ্বন্দ্বী।"],
  ["forthcoming", "আসন্ন / অমায়িক", "/ˌfɔːrθˈkʌmɪŋ/", "Prepare for the forthcoming examination.", "আসন্ন পরীক্ষার জন্য প্রস্তুতি নিন।"],
  ["fortunate", "ভাগ্যবান", "/ˈfɔːrtʃənət/", "We are fortunate to live in peace.", "আমরা শান্তিতে বাস করার মতো ভাগ্যবান।"],
  ["fragile", "ভঙ্গুর", "/ˈfrædʒl/", "Glass beakers in the lab are fragile.", "গবেষণাগারের কাচের বিকারগুলো ভঙ্গুর।"],
  ["fragrant", "সুগন্ধি", "/ˈfreɪɡrənt/", "Fragrant jasmine blossoms at dusk.", "সন্ধ্যায় সুগন্ধি বেলি ফুল ফোটে।"],
  ["frank", "খোলামেলা", "/fræŋk/", "I appreciate your frank and honest advice.", "আমি আপনার খোলামেলা ও সৎ পরামর্শের কদর করি।"],
  ["frantic", "উদ্বেগাকুল", "/ˈfræntɪk/", "The frantic mother searched for her child.", "উদ্বেগাকুল মা তার সন্তানকে খুঁজছিলেন।"],
  ["free", "স্বাধীন / বিনামূল্যে", "/friː/", "Education should be free for all children.", "সকল শিশুর জন্য শিক্ষা বিনামূল্যে হওয়া উচিত।"],
  ["fresh", "তাজা", "/frɛʃ/", "Eat fresh vegetables every single day.", "প্রতিদিন তাজা শাকসবজি খান।"],
  ["frequent", "ঘন ঘন / নিয়মিত", "/ˈfriːkwənt/", "Frequent revision sharpens long-term memory.", "নিয়মিত রিভিশন দীর্ঘমেয়াদী স্মৃতিকে ধারালো করে।"],
  ["frightful", "ভীতিকর", "/ˈfraɪtfl/", "The stormy night was loud and frightful.", "ঝড়ো রাতটি ছিল বিকট ও ভীতিকর।"],
  ["frugal", "মিতব্যয়ী", "/ˈfruːɡl/", "Frugal habits allow people to save money.", "মিতব্যয়ী অভ্যাস মানুষকে অর্থ সঞ্চয়ে সাহায্য করে।"],
  ["fruitful", "ফলপ্রসূ", "/ˈfruːtfl/", "Our discussion proved to be very fruitful.", "আমাদের আলোচনাটি খুবই ফলপ্রসূ প্রমাণিত হলো।"],
  ["fundamental", "মৌলিক", "/ˌfʌndəˈmɛntl/", "Honesty is a fundamental moral pillar.", "সততা একটি মৌলিক নৈতিক স্তম্ভ।"],
  ["funny", "মজার", "/ˈfʌni/", "The comedian told many funny folk stories.", "কৌতুক অভিনেতা বহু মজার লোকগল্প শুনিয়েছিলেন।"],
  ["futile", "নিরর্থক", "/ˈfjuːtaɪl/", "Arguing with an angry fool is futile.", "এক ক্রুদ্ধ বোকার সাথে তর্ক করা নিরর্থক।"],
  ["future", "ভবিষ্যত", "/ˈfjuːtʃər/", "Focus on building a bright future.", "একটি উজ্জ্বল ভবিষ্যৎ গঠনে মনোযোগ দাও।"],
  ["gallant", "বীরত্বপূর্ণ", "/ˈɡælənt/", "The gallant soldier protected the fortress.", "বীরত্বপূর্ণ সেনা দুর্গটি রক্ষা করেছিলেন।"],
  ["general", "সাধারণ", "/ˈdʒɛnrəl/", "He has good general knowledge.", "তার সাধারণ জ্ঞান বেশ ভালো।"],
  ["generous", "উদার", "/ˈdʒɛnərəs/", "The generous donor built a school.", "উদার দাতা একটি বিদ্যালয় নির্মাণ করেছিলেন।"],
  ["gentle", "নম্র / মৃদু", "/ˈdʒɛntl/", "A gentle breeze brought relief from heat.", "একটি মৃদু বাতাস গরম থেকে স্বস্তি এনে দিয়েছিল।"],
  ["genuine", "খাঁটি / খাঁটি মনের", "/ˈdʒɛnjuɪn/", "A genuine smile wins true friends.", "একটি আন্তরিক হাসি প্রকৃত বন্ধু এনে দেয়।"],
  ["gigantic", "দানবীয় / বিশালাকার", "/dʒaɪˈɡæntɪk/", "The ocean liner is gigantic.", "মহাসাগরীয় জাহাজটি বিশালাকার।"],
  ["glad", "আনন্দিত", "/ɡlæd/", "I am glad to see your high score.", "তোমার উচ্চ স্কোর দেখে আমি আনন্দিত।"],
  ["gleeful", "উল্লাসিত", "/ˈɡliːfl/", "Gleeful children ran across the lawn.", "উল্লাসিত শিশুরা মাঠজুড়ে দৌড়াচ্ছিল।"],
  ["glorious", "গৌরবময়", "/ˈɡlɔːriəs/", "Our language movement is glorious.", "আমাদের ভাষা আন্দোলন গৌরবময়।"],
  ["graceful", "মার্জিত ও কমনীয়", "/ˈɡreɪsfl/", "Her graceful dance captivated viewers.", "তার কমনীয় নৃত্য দর্শকদের মুগ্ধ করেছিল।"],
  ["grand", "মহিমান্বিত", "/ɡrænd/", "The graduation hall looked grand.", "সমাবর্তন হলঘরটি মহিমান্বিত দেখাচ্ছিল।"],
  ["grateful", "কৃতজ্ঞ", "/ˈɡreɪtfl/", "Be grateful for the gift of health.", "সুস্বাস্থ্যের উপহারের জন্য কৃতজ্ঞ হোন।"],
  ["grave", "গম্ভীর / গুরুতর", "/ɡreɪv/", "He spoke with grave seriousness.", "তিনি গম্ভীর গুরুত্বের সাথে কথা বলেছিলেন।"],
  ["great", "মহান", "/ɡreɪt/", "Great scholars study with humble hearts.", "মহান পণ্ডিতরা বিনম্র হৃদয় নিয়ে অধ্যয়ন করেন।"],
  ["greedy", "লোভী", "/ˈɡriːdi/", "Greedy persons are never truly happy.", "লোভী ব্যক্তিরা কখনোই প্রকৃত সুখী হয় না।"],
  ["green", "সবুজ / তরুণ", "/ɡriːn/", "Tea gardens cover the green hill slopes.", "চা বাগানগুলো সবুজ পাহাড়ের ঢাল ঢেকে রেখেছে।"],
  ["grievous", "মর্মান্তিক", "/ˈɡriːvəs/", "The town suffered a grievous accident.", "শহরটি একটি মর্মান্তিক দুর্ঘটনার শিকার হয়েছিল।"],
  ["grim", "কঠোর / বিষণ্ণ", "/ɡrɪm/", "The news brought grim silence to room.", "সংবাদটি ঘরে এক বিষণ্ণ নীরবতা বয়ে এনেছিল।"],
  ["gross", "মোট / স্থূল", "/ɡroʊs/", "Calculate the gross weight of grains.", "শস্যদানার মোট ওজন গণনা করুন।"],
  ["grotesque", "বিকৃত / কিম্ভূতকিমাকার", "/ɡroʊˈtɛsk/", "The statue wore a grotesque mask.", "মূর্তিটির মুখে একটি কিম্ভূতকিমাকার মুখোশ ছিল।"],
  ["growing", "বর্ধমান", "/ˈɡroʊɪŋ/", "There is a growing interest in English.", "ইংরেজির প্রতি এক বর্ধমান আগ্রহ দেখা যাচ্ছে।"],
  ["guarded", "সংযত / সতর্ক", "/ˈɡɑːrdɪd/", "He gave a guarded reply to the question.", "প্রশ্নে তিনি একটি সতর্ক উত্তর দিয়েছিলেন।"],
  ["guilty", "দোষী", "/ˈɡɪlti/", "The court found the criminal guilty.", "আদালত অপরাধীকে দোষী সাব্যস্ত করেছে।"],
  ["handy", "সহজে ব্যবহার্য", "/ˈhændi/", "A pocket dictionary is very handy.", "পকেট অভিধান খুবই ব্যবহারোপযোগী।"],
  ["happy", "সুখী", "/ˈhæpi/", "Contentment makes a person truly happy.", "আত্মতুষ্টি মানুষকে সত্যিকার অর্থেই সুখী করে।"],
  ["hardy", "কষ্টসহিষ্ণু", "/ˈhɑːrdi/", "Hardy shrubs thrive in drought.", "কষ্টসহিষ্ণু গুল্ম খরাতেও বেঁচে থাকে।"],
  ["harmful", "ক্ষতিকর", "/ˈhɑːrmfl/", "Smoking is harmful to human health.", "ধূমপান মানব স্বাস্থ্যের জন্য ক্ষতিকর।"],
  ["harmless", "ক্ষতিহীন / নিরীহ", "/ˈhɑːrmlɪs/", "The garden grass snake is harmless.", "বাগানের ঘাস সাপটি সম্পূর্ণ নিরীহ।"],
  ["harmonious", "সম্প্রীতিপূর্ণ", "/hɑːrˈmoʊniəs/", "Live in harmonious peace with neighbors.", "প্রতিবেশীদের সাথে সম্প্রীতিপূর্ণ শান্তিতে বাস করুন।"],
  ["harsh", "কর্কশ / কঠোর", "/hɑːrʃ/", "Avoid using harsh words with children.", "শিশুদের সাথে কর্কশ শব্দ ব্যবহার করা পরিহার করুন।"],
  ["healthy", "স্বাস্থ্যবান", "/ˈhɛlθi/", "Eat vegetables to maintain a healthy body.", "স্বাস্থ্যবান শরীর বজায় রাখতে শাকসবজি খান।"],
  ["heartfelt", "হৃদয়স্পর্শী", "/ˈhɑːrtfɛlt/", "She expressed heartfelt gratitude.", "তিনি হৃদয়স্পর্শী কৃতজ্ঞতা প্রকাশ করেছিলেন।"],
  ["hearty", "আন্তরিক ও প্রাণবন্ত", "/ˈhɑːrti/", "They shared a hearty meal together.", "তারা একসাথে একটি প্রাণবন্ত ভোজ উপভোগ করেছিল।"],
  ["heavy", "ভারী", "/ˈhɛvi/", "He carried a heavy parcel of books.", "সে বইয়ের একটি ভারী পার্সেল বহন করেছিল।"],
  ["helpful", "সহায়ক", "/ˈhɛlpfl/", "The mentor gave many helpful study tips.", "শিক্ষক অনেকগুলো সহায়ক পড়ার পরামর্শ দিয়েছিলেন।"],
  ["helpless", "অসহায়", "/ˈhɛlplɪs/", "Always assist helpless elderly citizens.", "অসহায় প্রবীণ নাগরিকদের সর্বদা সাহায্য করুন।"],
  ["heroic", "বীরত্বপূর্ণ", "/hɪˈroʊɪk/", "Freedom fighters showed heroic courage.", "মুক্তিযোদ্ধারা বীরত্বপূর্ণ সাহস প্রদর্শন করেছিলেন।"],
  ["historic", "ঐতিহাসিক", "/hɪˈstɒrɪk/", "March 7 is a historic day for Bangladesh.", "৭ই মার্চ বাংলাদেশের জন্য একটি ঐতিহাসিক দিন।"],
  ["hollow", "ফাঁপা", "/ˈhɒloʊ/", "Bamboo has a strong hollow stem.", "বাঁশের একটি শক্ত ফাঁপা কান্ড থাকে।"],
  ["honest", "সৎ", "/ˈɒnɪst/", "Honest individuals earn genuine respect.", "সৎ ব্যক্তিরা খাঁটি সম্মান অর্জন করেন।"],
  ["honorable", "সম্মানীয়", "/ˈɒnərəbl/", "He retired after honorable public service.", "সম্মানীয় সরকারি চাকরির পর তিনি অবসর নিয়েছিলেন।"],
  ["hopeful", "আশাবাদী", "/ˈhoʊpfl/", "Students are hopeful about their results.", "শিক্ষার্থীরা তাদের ফলাফলের ব্যাপারে আশাবাদী।"],
  ["hopeless", "আশাহীন", "/ˈhoʊplɪs/", "Never feel hopeless when facing hardships.", "কষ্টের মুখোমুখি হয়ে কখনোই আশাহীন হবেন না।"],
  ["horizontal", "আনুভূমিক", "/ˌhɒrɪˈzɒntl/", "Draw a horizontal line across the paper.", "কাগজজুড়ে একটি আনুভূমিক রেখা টানুন।"],
  ["hospitable", "অতিথিপরায়ণ", "/hɒˈspɪtəbl/", "Rural villagers are warmly hospitable.", "গ্রামবাসীরা অত্যন্ত আন্তরিক অতিথিপরায়ণ।"],
  ["hostile", "শত্রুভাবাপন্ন", "/ˈhɒstaɪl/", "Diplomacy avoids hostile disputes.", "কূটনীতি শত্রুভাবাপন্ন বিরোধ পরিহার করে।"],
  ["hot", "উষ্ণ / গরম", "/hɒt/", "Drink hot tea on chilly winter mornings.", "শীতের সকালে গরম চা পান করুন।"],
  ["huge", "বিশাল", "/hjuːdʒ/", "A huge crowd gathered for the concert.", "কনসার্টের জন্য এক বিশাল জনতা সমবেত হয়েছিল।"],
  ["humble", "বিনম্র", "/ˈhʌmbl/", "A humble attitude earns sincere love.", "বিনম্র মনোভাব আন্তরিক ভালোবাসা অর্জন করে।"],
  ["humid", "আর্দ্র", "/ˈhjuːmɪd/", "Coastal summer air is warm and humid.", "উপকূলীয় গ্রীষ্মের বাতাস উষ্ণ ও আর্দ্র।"],
  ["hungry", "ক্ষুধার্ত", "/ˈhʌŋɡri/", "Feed the hungry and assist the poor.", "ক্ষুধার্তকে অন্ন দিন এবং দরিদ্রকে সহায়তা করুন।"],
  ["hygienic", "স্বাস্থ্যসম্মত", "/haɪˈdʒiːnɪk/", "Clean kitchens ensure hygienic meals.", "পরিচ্ছন্ন রান্নাঘর স্বাস্থ্যসম্মত খাবার নিশ্চিত করে।"],
  ["ideal", "আদর্শ", "/aɪˈdiːəl/", "Discipline is ideal for student life.", "শৃঙ্খলা ছাত্রজীবনের জন্য আদর্শ।"],
  ["identical", "অভিন্ন / হুবহু এক", "/aɪˈdɛntɪkl/", "The twins wore identical uniforms.", "যমজ ভাইয়েরা হুবহু একই পোশাক পরেছিল।"],
  ["idle", "অলস", "/ˈaɪdl/", "Do not spend idle hours in daydreaming.", "দিবাস্বপ্ন দেখে অলস সময় কাটাবেন না।"],
  ["ignorant", "অজ্ঞ", "/ˈɪɡnərənt/", "Education saves people from being ignorant.", "শিক্ষা মানুষকে অজ্ঞ হওয়া থেকে রক্ষা করে।"],
  ["ill", "অসুস্থ", "/ɪl/", "Take rest when you feel ill.", "অসুস্থ বোধ করলে বিশ্রাম নিন।"],
  ["illegal", "অবৈধ", "/ɪˈliːɡl/", "Poaching in the Sundarbans is illegal.", "সুন্দরবনে শিকার করা অবৈধ।"],
  ["illiterate", "নিরক্ষর", "/ɪˈlɪtərət/", "Literacy campaigns teach illiterate adults.", "সাক্ষরতা অভিযান নিরক্ষর প্রাপ্তবয়স্কদের শিক্ষা দেয়।"],
  ["illustrious", "খ্যাতনামা / ভাস্বর", "/ɪˈlʌstriəs/", "Rabindranath is an illustrious Nobel poet.", "রবীন্দ্রনাথ একজন ভাস্বর নোবেলজয়ী কবি।"],
  ["imaginative", "কল্পনাপ্রবণ", "/ɪˈmædʒɪnətɪv/", "Imaginative writers craft fantastic tales.", "কল্পনাপ্রবণ লেখকরা চমৎকার সব গল্প তৈরি করেন।"],
  ["immature", "অপরিণত", "/ˌɪməˈtʃʊər/", "Impatience is a sign of an immature mind.", "অধৈর্য অপরিণত মনের লক্ষণ।"],
  ["immense", "বিপুল / অগাধ", "/ɪˈmɛns/", "Books provide immense joy to readers.", "বই পাঠকদের বিপুল আনন্দ প্রদান করে।"],
  ["imminent", "আসন্ন", "/ˈɪmɪnənt/", "Dark clouds signaled imminent heavy rain.", "কালো মেঘ আসন্ন ভারী বৃষ্টির ইঙ্গিত দিয়েছিল।"],
  ["immortal", "অমর", "/ɪˈmɔːrtl/", "Noble deeds make human memories immortal.", "মহৎ কর্ম মানুষের স্মৃতিকে অমর করে তোলে।"],
  ["immune", "অনাক্রম্য / সুরক্ষিত", "/ɪˈmjuːn/", "Vaccines make the body immune to disease.", "টিকা শরীরকে রোগের বিরুদ্ধে সুরক্ষিত করে।"],
  ["impartial", "নিরপেক্ষ", "/ɪmˈpɑːrʃl/", "Umpires must remain impartial in matches.", "ম্যাচে আম্পায়ারদের অবশ্যই নিরপেক্ষ থাকতে হবে।"],
  ["impatient", "অধৈর্য", "/ɪmˈpeɪʃnt/", "Do not be impatient while waiting in line.", "লাইনে অপেক্ষার সময় অধৈর্য হবেন না।"],
  ["imperative", "জরুরি / অপরিহার্য", "/ɪmˈpɛrətɪv/", "It is imperative to practice English daily.", "প্রতিদিন ইংরেজি অনুশীলন করা অত্যন্ত জরুরি।"],
  ["imperfect", "ত্রুটিযুক্ত", "/ɪmˈpɜːrfɪkt/", "First drafts are often imperfect.", "প্রথম খসড়া প্রায়শই কিছুটা ত্রুটিযুক্ত হয়।"],
  ["implicit", "অন্তর্নিহিত", "/ɪmˈplɪsɪt/", "There was implicit trust between them.", "তাদের মাঝে অন্তর্নিহিত এক বিশ্বাস ছিল।"],
  ["important", "গুরুত্বপূর্ণ", "/ɪmˈpɔːrtnt/", "Grammar is an important part of language.", "ব্যাকরণ ভাষার একটি গুরুত্বপূর্ণ অংশ।"],
  ["impossible", "অসম্ভব", "/ɪmˈpɒsəbl/", "Nothing is impossible with dedication.", "নিষ্ঠার সাথে কাজ করলে কোনো কিছুই অসম্ভব নয়।"],
  ["impressive", "মুগ্ধকর", "/ɪmˈprɛsɪv/", "He achieved an impressive high score.", "সে একটি মুগ্ধকর উচ্চ স্কোর অর্জন করেছে।"],
  ["improper", "অনুচিত", "/ɪmˈprɒpər/", "Disrespect is improper classroom behavior.", "অসম্মান প্রদর্শন শ্রেণিকক্ষের অনুচিত আচরণ।"],
  ["inadequate", "অপ্রতুল", "/ɪnˈædɪkwət/", "Inadequate sleep leads to daytime fatigue.", "অপ্রতুল ঘুম দিনের বেলা ক্লান্তির কারণ হয়।"],
  ["inborn", "জন্মগত", "/ˈɪnbɔːrn/", "She has an inborn gift for singing.", "গান গাওয়ার ক্ষেত্রে তার একটি জন্মগত প্রতিভা আছে।"],
  ["incentive", "উদ্দীপক / প্রণোদনামূলক", "/ɪnˈsɛntɪv/", "Scholarships provide incentive to study.", "বৃত্তি পড়াশোনায় প্রণোদনা জোগায়।"],
  ["incessant", "একটানা / অবিরাম", "/ɪnˈsɛsnt/", "Incessant monsoon rain flooded low fields.", "অবিরাম বর্ষণে নিচু জমি প্লাবিত হলো।"],
  ["inclusive", "অন্তর্ভুক্তিমূলক", "/ɪnˈkluːsɪv/", "Schools must create an inclusive space.", "বিদ্যালয়গুলোকে অন্তর্ভুক্তিমূলক পরিবেশ তৈরি করতে হবে।"],
  ["incomparable", "অতুলনীয়", "/ɪnˈkɒmpərəbl/", "Motherly affection is truly incomparable.", "মাতৃস্নেহ বাস্তবিকই অতুলনীয়।"],
  ["incomplete", "অসম্পূর্ণ", "/ˌɪnkəmˈpliːt/", "An incomplete assignment loses marks.", "অসম্পূর্ণ অ্যাসাইনমেন্টের কারণে নম্বর কাটা যায়।"],
  ["incredible", "অবিশ্বাস্য", "/ɪnˈkrɛdəbl/", "The museum displayed incredible antiquities.", "জাদুঘরে অবিশ্বাস্য সব প্রাচীন নিদর্শন প্রদর্শিত হয়েছিল।"],
  ["indispensable", "অপরিহার্য", "/ˌɪndɪˈspɛnsəbl/", "Diligence is indispensable for excellence.", "উৎকর্ষের জন্য পরিশ্রম অপরিহার্য।"],
  ["individual", "ব্যক্তিগত", "/ˌɪndɪˈvɪdʒuəl/", "Respect every individual student's pace.", "প্রতিটি শিক্ষার্থীর ব্যক্তিগত শেখার গতিকে সম্মান করুন।"],
  ["inevitable", "অনিবার্য", "/ɪnˈɛvɪtəbl/", "Change is an inevitable part of life.", "পরিবর্তন জীবনের এক অনিবার্য অংশ।"],
  ["infamous", "কুখ্যাত", "/ˈɪnfəməs/", "The infamous thief was caught by police.", "কুখ্যাত চোরটি পুলিশের হাতে ধরা পড়েছিল।"],
  ["infinite", "অসীম", "/ˈɪnfɪnət/", "The universe contains infinite stars.", "মহাবিশ্বে রয়েছে অসীম তারকারাজি।"],
  ["influential", "প্রভাবশালী", "/ˌɪnfluˈɛnʃl/", "Teachers are influential role models.", "শিক্ষকরা অত্যন্ত প্রভাবশালী আদর্শ ব্যক্তিত্ব।"],
  ["ingenious", "উদ্ভাবনী / বুদ্ধিদীপ্ত", "/ɪnˈdʒiːniəs/", "He devised an ingenious solar water pump.", "তিনি একটি বুদ্ধিদীপ্ত সৌর পানি পাম্প তৈরি করেছিলেন।"],
  ["inherent", "সহজাত / অন্তর্নিহিত", "/ɪnˈhɪərənt/", "Curiosity is an inherent trait of children.", "কৌতূহল শিশুদের একটি সহজাত বৈশিষ্ট্য।"],
  ["initial", "প্রাথমিক", "/ɪˈnɪʃl/", "Overcome initial fears when learning.", "শেখার সময় প্রাথমিক ভয় কাটিয়ে উঠুন।"],
  ["innocent", "নিরপরাধ / নিষ্পাপ", "/ˈɪnəsnt/", "Children have innocent and pure smiles.", "শিশুদের মুখে নিষ্পাপ ও পবিত্র হাসি থাকে।"],
  ["innovative", "উদ্ভাবনী", "/ˈɪnəveɪtɪv/", "Innovative teaching makes learning fun.", "উদ্ভাবনী শিক্ষাদান শেখাকে আনন্দময় করে তোলে।"],
  ["inquisitive", "অনুসন্ধিৎসু", "/ɪnˈkwɪzɪtɪv/", "Inquisitive students ask great questions.", "অনুসন্ধিৎসু শিক্ষার্থীরা দারুণ দারুণ প্রশ্ন করে।"],
  ["inspirational", "অনুপ্রেরণাদায়ী", "/ˌɪnspəˈreɪʃənl/", "Great speeches are deeply inspirational.", "মহান বক্তব্যগুলো গভীরভাবে অনুপ্রেরণাদায়ী।"],
  ["instant", "তাৎক্ষণিক", "/ˈɪnstənt/", "Digital quizzes provide instant scores.", "ডিজিটাল কুইজ তাৎক্ষণিক স্কোর প্রদান করে।"],
  ["instinctive", "স্বভাবজাত", "/ɪnˈstɪŋktɪv/", "Mother birds have instinctive protectiveness.", "মা পাখির স্বভাবজাত সন্তান বাৎসল্য থাকে।"],
  ["instructive", "শিক্ষণীয়", "/ɪnˈstrʌktɪv/", "The folk fable is highly instructive.", "লোককাহিনীটি অত্যন্ত শিক্ষণীয়।"],
  ["intact", "অক্ষত", "/ɪnˈtækt/", "The historic monument remains intact.", "ঐতিহাসিক সৌধটি অক্ষত রয়েছে।"],
  ["integral", "অবিচ্ছেদ্য", "/ˈɪntɪɡrəl/", "Sports are an integral part of school.", "খেলাধুলা বিদ্যালয় জীবনের অবিচ্ছেদ্য অংশ।"],
  ["intellectual", "বুদ্ধিবৃত্তিক", "/ˌɪntəˈlɛktʃuəl/", "Debating stimulates intellectual growth.", "বিতর্ক বুদ্ধিবৃত্তিক বিকাশকে ত্বরান্বিত করে।"],
  ["intelligent", "বুদ্ধিমান", "/ɪnˈtɛlɪdʒənt/", "Intelligent students solve problems easily.", "বুদ্ধিমান শিক্ষার্থীরা সহজেই সমস্যার সমাধান করে।"],
  ["intense", "তীব্র", "/ɪnˈtɛns/", "Monsoon brings intense showers of rain.", "বর্ষা তীব্র বৃষ্টিধারার আগমন ঘটায়।"],
  ["interactive", "মিথস্ক্রিয়ামূলক / দ্বিমুখী", "/ˌɪntərˈæktɪv/", "This app provides an interactive quiz.", "এই অ্যাপটি মিথস্ক্রিয়ামূলক কুইজ সুবিধা দেয়।"],
  ["interesting", "মজার / চিত্তাকর্ষক", "/ˈɪntrəstɪŋ/", "English grammar has many interesting facts.", "ইংরেজি ব্যাকরণে অনেক চিত্তাকর্ষক তথ্য রয়েছে।"],
  ["internal", "অভ্যন্তরীণ", "/ɪnˈtɜːrnl/", "Peace begins with internal harmony.", "শান্তি শুরু হয় মানুষের অভ্যন্তরীণ সম্প্রীতি থেকে।"],
  ["international", "আন্তর্জাতিক", "/ˌɪntərˈnæʃnəl/", "English is an international language.", "ইংরেজি একটি আন্তর্জাতিক ভাষা।"],
  ["intricate", "জটিল ও সূক্ষ্ম", "/ˈɪntrɪkət/", "Jamdani patterns have intricate embroidery.", "জামদানি নকশায় সূক্ষ্ম কারুকাজ থাকে।"],
  ["invaluable", "অমূল্য", "/ɪnˈvæljuəbl/", "Good counsel from teachers is invaluable.", "শিক্ষকদের উত্তম পরামর্শ সত্যিই অমূল্য।"],
  ["invincible", "অপরাজেয়", "/ɪnˈvɪnsəbl/", "Truth and righteousness are invincible.", "সত্য এবং ন্যায়পরায়ণতা চির অপরাজেয়।"],
  ["joyful", "আনন্দময়", "/ˈdʒɔɪfl/", "Eid brings a joyful atmosphere everywhere.", "ঈদ সর্বত্র এক আনন্দময় পরিবেশ নিয়ে আসে।"],
  ["jubilant", "উল্লাসিত", "/ˈdʒuːbɪlənt/", "The victorious crowd was jubilant.", "বিজয়ী জনতা উল্লাসে ফেটে পড়েছিল।"],
  ["judicious", "বিচক্ষণ", "/dʒuːˈdɪʃəs/", "Make judicious use of your leisure time.", "তোমার অবসর সময়ের বিচক্ষণ সদ্ব্যবহার করো।"],
  ["keen", "তীক্ষ্ণ / আগ্রহী", "/kiːn/", "He has a keen eye for spelling mistakes.", "বানান ভুলের ব্যাপারে তার তীক্ষ্ণ নজর রয়েছে।"],
  ["kind", "দয়ালু", "/kaɪnd/", "A kind word heals wounded feelings.", "একটি দয়ালু বাক্য আহত অনুভূতিকে নিরাময় করে।"],
  ["knowledgeable", "জ্ঞানী", "/ˈnɒlɪdʒəbl/", "Our teacher is knowledgeable in phonetics.", "আমাদের শিক্ষক ধ্বনিতত্ত্বে অত্যন্ত জ্ঞানী।"]
];

for (const [english, bangla, phonetic, sentence, translation] of remainingAdjectives) {
  insert({ english, bangla, phonetic, sentence, translation });
}

console.log('Final unique words map size:', uniqueMap.size);

const finalItems = Array.from(uniqueMap.values()).slice(0, 1260);
console.log('Exact final count taken:', finalItems.length);

const header = `import { AdjectiveItem } from '../types';

// Complete, 100% authentic and unique 1260 educational vocabulary & verb collection
// spanning 9 weeks (9 weeks * 7 days * 20 words = 1260 items)
export const rawAdjectives: AdjectiveItem[] = [
`;

const itemsStr = finalItems.map(item => {
  const en = JSON.stringify(item.english);
  const bn = JSON.stringify(item.bangla);
  const ph = JSON.stringify(item.phonetic);
  const se = JSON.stringify(item.sentence);
  const tr = JSON.stringify(item.translation);
  return `  { english: ${en}, bangla: ${bn}, phonetic: ${ph}, sentence: ${se}, translation: ${tr} }`;
}).join(',\n');

const footer = `
];

// All 1260 items are fully populated, authentic, and unique
export const adjectivesData: AdjectiveItem[] = rawAdjectives;

export const weekMap: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
};

export const dayMap: Record<string, number> = {
  saturday: 0,
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
};
`;

fs.writeFileSync('src/data/adjectivesData.ts', header + itemsStr + footer);
console.log('src/data/adjectivesData.ts written successfully with 1260 100% unique words!');
