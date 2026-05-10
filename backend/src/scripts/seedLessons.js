import connectDB from "../config/db.js";
import User from "../modules/identity/models/user.model.js";
import Lesson from "../modules/lessons/models/lesson.model.js";
import { hashPassword } from "../utils/password.util.js";

const seedLessons = async () => {
  await connectDB();

  // Ensure an instructor exists
  let instructor = await User.findOne({ roles: "INSTRUCTOR" });

  if (!instructor) {
    const hashedPassword = await hashPassword("Instructor@123");
    instructor = await User.create({
      name: "Demo Instructor",
      email: "instructor@fluentquest.com",
      password: hashedPassword,
      roles: ["INSTRUCTOR"],
      isEmailVerified: true,
    });
    console.log("✅ Demo instructor created: instructor@fluentquest.com / Instructor@123");
  }

  // Check if lessons already seeded
  const existingCount = await Lesson.countDocuments();
  if (existingCount > 0) {
    console.log(`✅ ${existingCount} lessons already exist. Skipping seed.`);
    process.exit();
  }

  const lessons = [
    // ===== A1 LESSONS =====
    {
      title: "Greetings & Introductions",
      description: "Learn basic greetings and how to introduce yourself.",
      language: "English",
      cefrLevel: "A1",
      cefrCanDo: "Can introduce self and ask simple questions about familiar topics",
      type: "MCQ",
      category: "Vocabulary",
      grammarTopic: "Present Simple - To Be",
      order: 1,
      xpReward: 10,
      estimatedMinutes: 5,
      isPublished: true,
      createdBy: instructor._id,
      content: {
        instructions: "Choose the correct answer for each question about greetings.",
        exercises: [
          {
            prompt: "How do you say 'Hola' in English?",
            options: ["Hello", "Goodbye", "Please", "Thanks"],
            correctAnswer: "Hello",
            hints: ["It's a greeting word"],
            explanation: "'Hola' in Spanish means 'Hello' in English.",
          },
          {
            prompt: "Complete: 'My name ___ John.'",
            options: ["is", "are", "am", "be"],
            correctAnswer: "is",
            hints: ["Use the verb 'to be' for third person"],
            explanation: "'My name is' uses the third-person form of 'to be'.",
          },
          {
            prompt: "What is the correct response to 'How are you?'",
            options: ["I am fine, thank you", "My name is", "Goodbye", "Please"],
            correctAnswer: "I am fine, thank you",
            hints: ["This is about your state/feeling"],
            explanation: "'I am fine, thank you' is the standard response.",
          },
          {
            prompt: "Choose the correct form: 'I ___ a student.'",
            options: ["am", "is", "are", "be"],
            correctAnswer: "am",
            hints: ["First person singular of 'to be'"],
            explanation: "'I am' is the first-person singular form.",
          },
          {
            prompt: "What does 'Nice to meet you' express?",
            options: ["Pleasure at meeting someone", "A farewell", "An apology", "A request"],
            correctAnswer: "Pleasure at meeting someone",
            hints: ["Used when you first meet a person"],
            explanation: "This phrase is used to express pleasure when meeting someone new.",
          },
        ],
      },
    },
    {
      title: "Numbers & Colors",
      description: "Learn to count and identify basic colors.",
      language: "English",
      cefrLevel: "A1",
      cefrCanDo: "Can understand familiar names and very simple sentences",
      type: "MCQ",
      category: "Vocabulary",
      grammarTopic: "Basic Nouns and Adjectives",
      order: 2,
      xpReward: 10,
      estimatedMinutes: 5,
      isPublished: true,
      createdBy: instructor._id,
      content: {
        instructions: "Answer questions about numbers and colors.",
        exercises: [
          {
            prompt: "What number comes after 'seven'?",
            options: ["eight", "six", "nine", "five"],
            correctAnswer: "eight",
            hints: ["Count: six, seven, ..."],
            explanation: "The sequence is: six, seven, eight, nine, ten.",
          },
          {
            prompt: "What color is the sky on a clear day?",
            options: ["blue", "red", "green", "yellow"],
            correctAnswer: "blue",
            hints: ["Look up on a sunny day"],
            explanation: "The sky appears blue on a clear day.",
          },
          {
            prompt: "How do you write the number 15 in words?",
            options: ["fifteen", "fifty", "fourteen", "sixteen"],
            correctAnswer: "fifteen",
            hints: ["It's 10 + 5"],
            explanation: "15 is written as 'fifteen'.",
          },
          {
            prompt: "Complete: 'The grass is ___.'",
            options: ["green", "blue", "red", "white"],
            correctAnswer: "green",
            hints: ["Think of nature and parks"],
            explanation: "Grass is typically green in color.",
          },
          {
            prompt: "What is 3 + 4?",
            options: ["seven", "six", "eight", "five"],
            correctAnswer: "seven",
            hints: ["Count three more after four"],
            explanation: "3 + 4 = 7, which is 'seven'.",
          },
        ],
      },
    },
    {
      title: "Present Simple - Daily Routine",
      description: "Learn to describe daily activities using present simple tense.",
      language: "English",
      cefrLevel: "A1",
      cefrCanDo: "Can write a simple postcard",
      type: "FILL_BLANK",
      category: "Grammar",
      grammarTopic: "Present Simple",
      order: 3,
      xpReward: 15,
      estimatedMinutes: 8,
      isPublished: true,
      createdBy: instructor._id,
      content: {
        instructions: "Fill in the blank with the correct verb form.",
        exercises: [
          {
            prompt: "I ___ breakfast at 7 AM. (eat)",
            options: [],
            correctAnswer: "eat",
            hints: ["First person, no change needed"],
            explanation: "In present simple, first person uses the base form: 'I eat'.",
          },
          {
            prompt: "She ___ to school by bus. (go)",
            options: [],
            correctAnswer: "goes",
            hints: ["Third person singular adds -es"],
            explanation: "'Go' becomes 'goes' for he/she/it in present simple.",
          },
          {
            prompt: "They ___ football on Saturdays. (play)",
            options: [],
            correctAnswer: "play",
            hints: ["Plural subject uses base form"],
            explanation: "'They' is plural, so we use the base form 'play'.",
          },
          {
            prompt: "He ___ English at school. (study)",
            options: [],
            correctAnswer: "studies",
            hints: ["Consonant + y → -ies for third person"],
            explanation: "For verbs ending in consonant + y, change y to -ies: 'studies'.",
          },
          {
            prompt: "We ___ TV in the evening. (watch)",
            options: [],
            correctAnswer: "watch",
            hints: ["'We' uses the base form"],
            explanation: "'We' is plural, so we use the base form 'watch'.",
          },
        ],
      },
    },
    // ===== A2 LESSONS =====
    {
      title: "Past Simple - Regular Verbs",
      description: "Learn to talk about past events using regular verbs.",
      language: "English",
      cefrLevel: "A2",
      cefrCanDo: "Can describe background and immediate needs",
      type: "MCQ",
      category: "Grammar",
      grammarTopic: "Past Simple",
      order: 1,
      xpReward: 15,
      estimatedMinutes: 8,
      isPublished: true,
      createdBy: instructor._id,
      content: {
        instructions: "Choose the correct past simple form.",
        exercises: [
          {
            prompt: "Yesterday, I ___ my homework. (finish)",
            options: ["finished", "finish", "finishing", "finishs"],
            correctAnswer: "finished",
            hints: ["Add -ed for regular past simple"],
            explanation: "Regular verbs form past simple by adding -ed: 'finished'.",
          },
          {
            prompt: "She ___ the piano last night. (play)",
            options: ["played", "plays", "playing", "plaied"],
            correctAnswer: "played",
            hints: ["Add -ed to 'play'"],
            explanation: "'Play' + ed = 'played'. Vowel + y keeps the y.",
          },
          {
            prompt: "We ___ to the park last Sunday. (walk)",
            options: ["walked", "walk", "walking", "walks"],
            correctAnswer: "walked",
            hints: ["Regular past tense"],
            explanation: "'Walk' + ed = 'walked'.",
          },
          {
            prompt: "They ___ at the hotel for three nights. (stay)",
            options: ["stayed", "staied", "staid", "stays"],
            correctAnswer: "stayed",
            hints: ["Vowel + y: just add -ed"],
            explanation: "'Stay' ends in vowel + y, so just add -ed: 'stayed'.",
          },
          {
            prompt: "He ___ the door behind him. (close)",
            options: ["closed", "closeed", "closes", "closing"],
            correctAnswer: "closed",
            hints: ["The verb already ends in -e, just add -d"],
            explanation: "Verbs ending in -e just add -d: 'close' → 'closed'.",
          },
        ],
      },
    },
    {
      title: "Comparatives & Superlatives",
      description: "Learn to compare things using adjectives.",
      language: "English",
      cefrLevel: "A2",
      cefrCanDo: "Can handle short social exchanges",
      type: "FILL_BLANK",
      category: "Grammar",
      grammarTopic: "Comparatives and Superlatives",
      order: 2,
      xpReward: 15,
      estimatedMinutes: 10,
      isPublished: true,
      createdBy: instructor._id,
      content: {
        instructions: "Fill in the blank with the correct comparative or superlative form.",
        exercises: [
          {
            prompt: "An elephant is ___ than a cat. (big)",
            options: [],
            correctAnswer: "bigger",
            hints: ["Short adjective: double the consonant and add -er"],
            explanation: "'Big' → 'bigger' (double g + er for comparison).",
          },
          {
            prompt: "This is the ___ movie I've ever seen. (good)",
            options: [],
            correctAnswer: "best",
            hints: ["This is an irregular superlative"],
            explanation: "'Good' has an irregular superlative: 'best'.",
          },
          {
            prompt: "Summer is ___ than winter. (hot)",
            options: [],
            correctAnswer: "hotter",
            hints: ["Short adjective ending in consonant"],
            explanation: "'Hot' → 'hotter' (double t + er).",
          },
          {
            prompt: "English is ___ than Chinese for me. (easy)",
            options: [],
            correctAnswer: "easier",
            hints: ["Adjective ending in -y changes to -ier"],
            explanation: "Adjectives ending in -y change to -ier: 'easy' → 'easier'.",
          },
          {
            prompt: "Mount Everest is the ___ mountain in the world. (high)",
            options: [],
            correctAnswer: "highest",
            hints: ["Superlative form of 'high'"],
            explanation: "'High' → 'highest' for the superlative (add -est).",
          },
        ],
      },
    },
    // ===== B1 LESSON =====
    {
      title: "Present Perfect vs Past Simple",
      description: "Master the difference between present perfect and past simple.",
      language: "English",
      cefrLevel: "B1",
      cefrCanDo: "Can deal with most travel situations",
      type: "MCQ",
      category: "Grammar",
      grammarTopic: "Present Perfect",
      order: 1,
      xpReward: 20,
      estimatedMinutes: 12,
      isPublished: true,
      createdBy: instructor._id,
      content: {
        instructions: "Choose between present perfect and past simple.",
        exercises: [
          {
            prompt: "I ___ to Paris three times. (be)",
            options: ["have been", "was", "been", "am being"],
            correctAnswer: "have been",
            hints: ["Experience up to now → present perfect"],
            explanation: "Use present perfect for life experiences: 'I have been to Paris three times.'",
          },
          {
            prompt: "She ___ her keys yesterday. (lose)",
            options: ["lost", "has lost", "have lost", "loses"],
            correctAnswer: "lost",
            hints: ["'Yesterday' signals a specific past time"],
            explanation: "With specific past time markers (yesterday), use past simple: 'lost'.",
          },
          {
            prompt: "We ___ dinner yet. (not/have)",
            options: ["haven't had", "didn't have", "not had", "don't have"],
            correctAnswer: "haven't had",
            hints: ["'Yet' is a present perfect signal word"],
            explanation: "'Yet' indicates present perfect: 'haven't had'.",
          },
          {
            prompt: "He ___ in London since 2020. (live)",
            options: ["has lived", "lived", "is living", "was living"],
            correctAnswer: "has lived",
            hints: ["'Since' with a starting point → present perfect"],
            explanation: "'Since' + past time point uses present perfect: 'has lived since 2020'.",
          },
          {
            prompt: "They ___ married in 2018. (get)",
            options: ["got", "have got", "have gotten", "getting"],
            correctAnswer: "got",
            hints: ["Specific year = specific past time"],
            explanation: "The specific year 2018 requires past simple: 'got married in 2018'.",
          },
        ],
      },
    },
  ];

  await Lesson.insertMany(lessons);
  console.log(`✅ ${lessons.length} lessons seeded successfully`);
  console.log("   - A1: 3 lessons (Greetings, Numbers, Present Simple)");
  console.log("   - A2: 2 lessons (Past Simple, Comparatives)");
  console.log("   - B1: 1 lesson (Present Perfect vs Past Simple)");
  process.exit();
};

seedLessons();
