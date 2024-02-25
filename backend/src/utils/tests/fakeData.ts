// Courtesy of ChatGPT

import { Chance } from "chance";

const hebrewNames = [
	"אביגיל",
	"אבישג",
	"אביתר",
	"אביה",
	"אביהו",
	"אביחיל",
	"אבירם",
	"אבישי",
	"אברהם",
	"אבשלום",
	"אגם",
	"אדל",
	"אדם",
	"אדר",
	"אדריאל",
	"אודד",
	"אודליה",
	"אוהב",
	"אוהד",
	"אוהר",
	"אומר",
	"אור",
	"אוראל",
	"אורגד",
	"אורה",
	"אוריאל",
	"אוריה",
	"אורן",
	"אושר",
	"אחיה",
	"אחיטוב",
	"אחיעזר",
	"איל",
	"אילן",
	"אילנה",
	"אימא",
	"איתי",
	"איתן",
	"אלה",
	"אלון",
	"אליאב",
	"אליאור",
	"אליהו",
	"אליה",
	"אליעד",
	"אליעזר",
	"אליכם",
	"אלירז",
	"אלישבע",
	"אלישיב",
	"אלישמע",
	"אלישע",
	"אלכס",
	"אלכסנדר",
	"אלמוג",
	"אלעד",
	"אלעזר",
	"אלקנה",
	"אלרועי",
	"אמונה",
	"אמיר",
	"אמיתי",
	"אמנון",
	"אמציה",
	"אנאל",
	"אנה",
	"אסף",
	"אפיק",
	"אראל",
	"ארז",
	"אריאל",
	"אריה",
	"אשד",
	"אשדוד",
	"אשר",
	"אתי",
	"בארי",
	"באריה",
	"בוריס",
	"בן",
	"בן עמי",
	"בן ציון",
	"בר",
	"בראל",
	"ברכיה",
	"ברק",
	"ברקאי",
	"גד",
	"גדי",
	"גדעון",
	"גולן",
	"גור",
	"גיא",
	"גידי",
	"גיל",
	"גילה",
	"גילי",
	"גל",
	"גלעד",
	"גפן",
	"גרשון",
	"גת",
	"דב",
	"דבורה",
	"דוד",
	"דור",
	"דורון",
	"דורית",
	"דן",
	"דנה",
	"דניאל",
	"דניאלה",
	"דניאלי",
	"דנית",
	"דפנה",
	"הדס",
	"הדסה",
	"הילה",
	"הילי",
	"הלל",
	"הראל",
	"הרמן",
	"ורד",
	"זאב",
	"זהבה",
	"זוהר",
	"זיו",
	"חביב",
	"חביבה",
	"חגי",
	"חגית",
	"חוה",
	"חיים",
	"חיה",
	"חיל",
	"חנה",
	"חנוך",
	"חנין",
	"חנן",
	"חסד",
	"חסיד",
	"חפץ",
	"חפצי",
	"חצובה",
	"טל",
	"טליה",
	"יאיר",
	"יאל",
	"ידידיה",
	"יהודה",
	"יהונתן",
	"יהל",
	"יובל",
	"יוחאי",
	"יוכבד",
	"יונתן",
	"יוסף",
	"יועז",
	"יועקב",
	"יופי",
	"יחיאל",
	"יחזקאל",
	"יחל",
	"יחסין",
	"יחידה",
	"יחיאה",
	"יטיר",
	"יכין",
	"ילד",
	"ים",
	"ימית",
	"ימיני",
	"ינון",
	"יעל",
	"יעקב",
	"יפה",
	"יפית",
	"יפעת",
	"יפתח",
	"יצחק",
	"יקותיאל",
	"ירוחם",
	"ירמיה",
	"ירמיהו",
	"ישי",
	"ישראל",
	"ישראלי",
	"כוכב",
	"כוכבה",
	"כפיר",
	"כרמל",
	"לאה",
	"לב",
	"לביא",
	"לבנה",
	"להב",
	"לוטם",
];

const hebrewLastNames = [
	"אברהמי",
	"אדלר",
	"אהרונוביץ",
	"אוזן",
	"אולמן",
	"אורבך",
	"אורן",
	"אורנשטיין",
	"אחרוב",
	"אילון",
	"אילקוביץ",
	"אינקל",
	"אלבז",
	"אלוני",
	"אלטשולר",
	"אלמוג",
	"אלעזר",
	"אלפון",
	"אלפסי",
	"אלקיים",
	"אם",
	"אנגל",
	"אניב",
	"אסף",
	"אפרגן",
	"אפרתי",
	"ארביב",
	"ארון",
	"אריאל",
	"ארנון",
	"ארנט",
	"ארשבורן",
	"באום",
	"בדרמן",
	"בוסקילה",
	"ביטון",
	"בירנבוים",
	"בלוך",
	"בלטיאנסקי",
	"בלז",
	"בלילטי",
	"בלס",
	"בנדטי",
	"בנצור",
	"בן יעקב",
	"בן ישי",
	"בנט",
	"בן ציון",
	"בנקו",
	"בסיסו",
	"בסן",
	"בעז",
	"ברוך",
	"ברוש",
	"ברזילי",
	"ברטוב",
	"ברקוביץ",
	"ברקן",
	"ברקת",
	"בשר",
	"גאון",
	"גולדברג",
	"גור",
	"גלבוע",
	"גלי",
	"גליל",
	"גנץ",
	"גנשור",
	"גס",
	"גפן",
	"גרינברג",
	"גרינשטיין",
	"גרמון",
	"גרסיה",
	"גרפי",
	"דאון",
	"דביר",
	"דגן",
	"דהן",
	"דובוביץ",
	"דובק",
	"דוד",
	"דודאי",
	"דויטש",
	"דולב",
	"דונין",
	"דיקמן",
	"דליה",
	"דנון",
	"דנינו",
	"דניס",
	"דניצ",
	"דנציגר",
	"דסקל",
	"דרייר",
	"הבר",
	"הלוי",
	"הלפרין",
	"הפרץ",
	"הרמן",
	"השכוני",
	"ולדימירסקי",
	"זוהר",
	"זילבר",
	"חאפר",
	"חג'אזי",
	"חדד",
	"חדוש",
	"חובה",
	"חולדאי",
	"חולצמן",
	"חולצני",
	"חולינסקי",
	"חורניש",
	"חושי",
	"חזן",
	"חימיניס",
	"חלפון",
	"חמד",
	"חנא",
	"חנאבי",
	"חנוך",
	"חנין",
	"חנני",
	"חסדי",
	"חשמל",
	"טובול",
	"טולידנו",
	"יבל",
	"יגודי",
	"ידיד",
	"יזמוביץ",
	"יחיאל",
	"יטבת",
	"ייון",
	"ילון",
	"ילין",
	"ימין",
	"ינאי",
	"יניב",
	"ינקוביץ",
	"יסעור",
	"יעקוב",
	"יעקובוביץ",
	"יפה",
	"יפו",
	"יפצא",
	"יפת",
	"יץ",
	"כהן",
	"כוכב",
	"כוכבי",
	"כט",
	"כהן",
	"כהן עברי",
	"כהן גבריאל",
	"כוסוביץ",
	"כימני",
	"כמיה",
	"כנפי",
	"כספי",
	"כץ",
	"כרמל",
	"לבוביץ",
	"לבקוביץ",
	"להב",
	"לוי",
	"לוטן",
	"לופסקי",
	"לידני",
	"לימון",
	"ליפשיץ",
	"ליצמן",
	"לנדאו",
	"לנדסברג",
];

export function getRandomHebrewName() {
	const firstName = Chance().pickone(hebrewNames);
	const lastName = Chance().pickone(hebrewLastNames);

	return `${firstName} ${lastName}`;
}
