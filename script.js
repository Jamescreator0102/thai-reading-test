const words = [
  {
    word: "จักจั่น",
    readAs: "จัก-กะ-จั่น",
    accepted: ["จักจั่น", "จักกะจั่น"]
  },
  {
    word: "ตั๊กแตน",
    readAs: "ตั๊ก-กะ-แตน",
    accepted: ["ตั๊กแตน", "ตั๊กกะแตน"]
  },
  {
    word: "กตัญญู",
    readAs: "กะ-ตัน-ยู",
    accepted: ["กตัญญู", "กะตัญญู", "กะตันยู"]
  },
  {
    word: "ประโยชน์",
    readAs: "ประ-โหยด",
    accepted: ["ประโยชน์", "ประโหยด"]
  },
  {
    word: "พุทธศักราช",
    readAs: "พุด-ทะ-สัก-กะ-หราด",
    accepted: ["พุทธศักราช", "พุดทะสักกะหราด"]
  },
  {
    word: "บริสุทธิ์",
    readAs: "บอ-ริ-สุด",
    accepted: ["บริสุทธิ์", "บอริสุด"]
  },
  {
    word: "ความสุข",
    readAs: "ความ-สุก",
    accepted: ["ความสุข", "ความสุก"]
  },
  {
    word: "วัฒนธรรม",
    readAs: "วัด-ทะ-นะ-ทำ",
    accepted: ["วัฒนธรรม", "วัดทะนะทำ"]
  },
  {
    word: "สามัคคี",
    readAs: "สา-มัก-คี",
    accepted: ["สามัคคี", "สามักคี"]
  },
  {
    word: "ประเทศไทย",
    readAs: "ประ-เทด-ไท",
    accepted: ["ประเทศไทย", "ประเทศไท"]
  }
];

let currentIndex = 0;
let score = 0;
let studentName = "";
let recognition = null;
let isListening = false;

const startPage = document.getElementById("startPage");
const testPage = document.getElementById("testPage");
const summaryPage = document.getElementById("summaryPage");

const studentNameInput = document.getElementById("studentName");
const startButton = document.getElementById("startButton");
const startMessage = document.getElementById("startMessage");

const currentNumber = document.getElementById("currentNumber");
const totalWords = document.getElementById("totalWords");
const scoreDisplay = document.getElementById("score");
const wordDisplay = document.getElementById("wordDisplay");

const microphoneButton = document.getElementById("microphoneButton");
const microphoneText = document.getElementById("microphoneText");
const microphoneStatus = document.getElementById("microphoneStatus");

const recognizedBox = document.getElementById("recognizedBox");
const recognizedText = document.getElementById("recognizedText");
const resultBox = document.getElementById("resultBox");
const nextButton = document.getElementById("nextButton");

const summaryName = document.getElementById("summaryName");
const finalScore = document.getElementById("finalScore");
const finalTotal = document.getElementById("finalTotal");
const summaryMessage = document.getElementById("summaryMessage");
const restartButton = document.getElementById("restartButton");

totalWords.textContent = words.length;
finalTotal.textContent = words.length;

startButton.addEventListener("click", startTest);
microphoneButton.addEventListener("click", startListening);
nextButton.addEventListener("click", nextWord);
restartButton.addEventListener("click", restartTest);

function showPage(page) {
  startPage.classList.add("hidden");
  testPage.classList.add("hidden");
  summaryPage.classList.add("hidden");

  page.classList.remove("hidden");
}

function startTest() {
  const name = studentNameInput.value.trim();

  if (!name) {
    startMessage.textContent = "กรุณากรอกชื่อผู้ทดสอบ";
    return;
  }

  studentName = name;
  currentIndex = 0;
  score = 0;

  startMessage.textContent = "";
  scoreDisplay.textContent = "0";

  showPage(testPage);
  displayWord();
}

function displayWord() {
  const item = words[currentIndex];

  if (!item) {
    showSummary();
    return;
  }

  currentNumber.textContent = currentIndex + 1;
  scoreDisplay.textContent = score;
  wordDisplay.textContent = item.word;

  microphoneButton.disabled = false;
  microphoneButton.classList.remove("listening");
  microphoneText.textContent = "กดเพื่ออ่าน";
  microphoneStatus.textContent = "กดปุ่มไมโครโฟนแล้วเริ่มอ่าน";

  recognizedBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  resultBox.classList.remove("correct", "incorrect");
  nextButton.classList.add("hidden");

  recognizedText.textContent = "";
  resultBox.textContent = "";
}

function createRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    microphoneStatus.textContent =
      "เบราว์เซอร์นี้ไม่รองรับ กรุณาใช้ Google Chrome";
    microphoneButton.disabled = true;
    return null;
  }

  const engine = new SpeechRecognition();

  engine.lang = "th-TH";
  engine.continuous = false;
  engine.interimResults = false;
  engine.maxAlternatives = 5;

  engine.onstart = function () {
    isListening = true;

    microphoneButton.disabled = true;
    microphoneButton.classList.add("listening");
    microphoneText.textContent = "กำลังฟัง...";
    microphoneStatus.textContent = "อ่านคำได้เลย";

    recognizedBox.classList.add("hidden");
    resultBox.classList.add("hidden");
    nextButton.classList.add("hidden");
  };

  engine.onresult = function (event) {
    const alternatives = [];

    if (event.results && event.results[0]) {
      for (let i = 0; i < event.results[0].length; i++) {
        alternatives.push(event.results[0][i].transcript.trim());
      }
    }

    checkAnswer(alternatives);
  };

  engine.onerror = function (event) {
    resetMicrophone();

    if (event.error === "not-allowed") {
      microphoneStatus.textContent =
        "กรุณาอนุญาตการใช้ไมโครโฟน แล้วรีเฟรชหน้าเว็บ";
    } else if (event.error === "no-speech") {
      microphoneStatus.textContent =
        "ระบบไม่ได้ยินเสียง กรุณาลองใหม่";
    } else if (event.error === "audio-capture") {
      microphoneStatus.textContent =
        "ไม่พบไมโครโฟน กรุณาตรวจสอบอุปกรณ์";
    } else {
      microphoneStatus.textContent =
        "รับเสียงไม่สำเร็จ กรุณาลองใหม่";
    }
  };

  engine.onend = function () {
    isListening = false;
    microphoneButton.classList.remove("listening");

    if (resultBox.classList.contains("hidden")) {
      microphoneButton.disabled = false;
      microphoneText.textContent = "กดเพื่ออ่าน";
    }
  };

  return engine;
}

function startListening() {
  if (isListening) {
    return;
  }

  if (!recognition) {
    recognition = createRecognition();
  }

  if (!recognition) {
    return;
  }

  try {
    recognition.start();
  } catch (error) {
    resetMicrophone();
    microphoneStatus.textContent =
      "กรุณารอสักครู่แล้วลองใหม่";
  }
}

function checkAnswer(alternatives) {
  const item = words[currentIndex];
  const heard = alternatives[0] || "";

  const acceptedAnswers = [
    item.word,
    item.readAs,
    ...item.accepted
  ];

  const isCorrect = alternatives.some(function (spoken) {
    return acceptedAnswers.some(function (answer) {
      return normalizeText(spoken) === normalizeText(answer);
    });
  });

  recognizedText.textContent =
    heard || "ไม่สามารถถอดเสียงได้";

  recognizedBox.classList.remove("hidden");

  if (isCorrect) {
    score += 1;
    scoreDisplay.textContent = score;

    resultBox.textContent = "✅ อ่านถูกต้อง";
    resultBox.classList.remove("hidden", "incorrect");
    resultBox.classList.add("correct");

    microphoneStatus.textContent = "เยี่ยมมาก";
    microphoneButton.disabled = true;
    nextButton.classList.remove("hidden");
  } else {
    resultBox.textContent = "❌ ยังไม่ถูก ลองอ่านอีกครั้ง";
    resultBox.classList.remove("hidden", "correct");
    resultBox.classList.add("incorrect");

    microphoneStatus.textContent =
      "กดไมโครโฟนเพื่อลองใหม่";

    microphoneButton.disabled = false;
    microphoneText.textContent = "ลองอีกครั้ง";
  }
}

function normalizeText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/[.,!?'"():;_/\\]/g, "")
    .replace(/์/g, "");
}

function resetMicrophone() {
  isListening = false;
  microphoneButton.disabled = false;
  microphoneButton.classList.remove("listening");
  microphoneText.textContent = "กดเพื่ออ่าน";
}

function nextWord() {
  currentIndex += 1;

  if (currentIndex >= words.length) {
    showSummary();
  } else {
    displayWord();
  }
}

function showSummary() {
  showPage(summaryPage);

  summaryName.textContent =
    "ผู้ทดสอบ: " + studentName;

  finalScore.textContent = score;

  const percentage = Math.round(
    (score / words.length) * 100
  );

  if (percentage === 100) {
    summaryMessage.textContent =
      "ยอดเยี่ยม อ่านถูกครบทุกคำ";
  } else if (percentage >= 80) {
    summaryMessage.textContent =
      "ทำได้ดีมาก";
  } else if (percentage >= 60) {
    summaryMessage.textContent =
      "ทำได้ดี ควรฝึกเพิ่มเติม";
  } else {
    summaryMessage.textContent =
      "ฝึกอ่านบ่อย ๆ แล้วจะเก่งขึ้น";
  }
}

function restartTest() {
  currentIndex = 0;
  score = 0;
  isListening = false;

  studentNameInput.value = studentName;
  showPage(startPage);
}
