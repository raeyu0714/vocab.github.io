let words = {}; // 存放從 JSON 文件中加載的單字數據
let currentCategory = 'C'; // 初始類別為動物
let currentFamiliarity = 'all'; // 初始熟悉度為全部
let currentLanguage = 'all'; // 初始語言為全部

// 網頁加載完成後執行的函數
window.onload = function() {
    loadWordsFromJson();
};
/*
// 加載 words.json 文件
function loadWordsFromJson() {
    fetch(`words.json?${Math.random()}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        words = data;
        console.log('Words loaded:', words);
        loadWords(currentCategory, currentFamiliarity, currentLanguage);
    })
    .catch(error => console.error('Error loading words:', error));
}
*/



const apiKey = "AIzaSyCjKRvEzlvle-xwuCCCp_2sPOsF_8F-PdY";
const sheetId = "11k4ClBe3J9teO098xKxbNulGNi6scjD-pnqKxW4sZ68";
// Sheets 中要取得的資料範圍，格式如下
const range = "B1:E86";
// Sheets API 的 URL
const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueRenderOption=FORMATTED_VALUE&key=${apiKey}`;
// 加載單字列表的函數
// 加載單字列表的函數
window.onload = function(){
   fetch(url)
  .then((response) => response.json())
  .then((data) => {
    data.values.forEach(item => {
        if (item.length >= 2) {
          const category = item[1][0]; // 提取 "C-001" 的第一个字母作为 category
          if (!words[category]) {
            words[category] = []; // 如果 category 不存在，则创建一个空数组
          }
          // 将 "C-001" 后面的部分作为一个对象放入数组中
          words[category].push({
            word: item[1], // 英文
            partOfSpeech: item[2], // 词性
            翻譯: item[3], // 中文翻译
            familiarity:"不熟悉"
          });
        }
      });
    console.table(data)      
    console.table(words);
    loadWords(currentCategory, currentFamiliarity, currentLanguage)
  })
  .catch((error) => console.error("Error:", error));
}

function updateCategory(category) {
    currentCategory = category;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}
function loadWords(category, familiarity, language) {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = ''; // 清空之前的單字列表

    if (words[category]) {
        const filteredWords = words[category].filter(wordObj => {
            // 檢查熟悉度條件
            if (familiarity !== 'all' && wordObj.familiarity !== familiarity) {
                return false;
            }

            // 檢查語言條件
            if (language !== 'all') {
                if (language === 'chinese' && !wordObj.翻譯) {
                    return false;
                }
                if (language === 'english' && !wordObj.word) {
                    return false;
                }
            }

            return true; // 符合所有條件的單字
        });

        const shuffledWords = shuffleArray(filteredWords); // 隨機排序單字列表
        shuffledWords.forEach(wordObj => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';

            const word = document.createElement('h3');
            word.textContent = language === 'chinese' ? wordObj.翻譯 : wordObj.word;
            wordItem.appendChild(word);

            const partOfSpeech = document.createElement('h3');
            partOfSpeech.textContent = `詞性: ${wordObj.partOfSpeech}`;
            wordItem.appendChild(partOfSpeech);

            const translation = document.createElement('h3');
            translation.textContent = language === 'chinese' ? `單字: ${wordObj.word}` : `Translation: ${wordObj.翻譯}`;
            translation.style.display = 'none'; // 初始隱藏翻譯
            wordItem.appendChild(translation);

            const familiarityContainer = document.createElement('div');
            familiarityContainer.className = 'familiarity-container';
            familiarityContainer.innerHTML = getFamiliarityHTML(wordObj.familiarity); // 添加熟悉度圓圈的 HTML
            wordItem.appendChild(familiarityContainer);

            const showTranslationButton = document.createElement('button');
            showTranslationButton.textContent = 'Show Translation';
            showTranslationButton.onclick = () => {
                translation.style.display = 'block';
                showTranslationButton.style.display = 'none';
            };
            wordItem.appendChild(showTranslationButton);

            wordList.appendChild(wordItem);
        });
    } else {
        wordList.textContent = 'No words found.';
    }
}


// 隨機化陣列順序的函數
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// 根據熟悉度返回不同的 HTML 代碼
function getFamiliarityHTML(familiarity) {
    switch (familiarity) {
        case '熟悉':
            return '<span class="familiarity-circle  familiar"></span><span class="familiarity-circle familiar3"></span><span class="familiarity-circle familiar2"></span>';
        case '普通':
            return '<span class="familiarity-circle"></span><span class="familiarity-circle familiar3"></span><span class="familiarity-circle familiar2"></span>';
        case '不熟悉':
            return '<span class="familiarity-circle"></span><span class="familiarity-circle"></span><span class="familiarity-circle familiar2"></span>';
        default:
            return '';
    }
}

// 更新類別並重新加載單字列表
function updateCategory(category) {
    currentCategory = category;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}

// 更新熟悉度並重新加載單字列表
function updateFamiliarity(familiarity) {
    currentFamiliarity = familiarity;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}

// 更新語言並重新加載單字列表
function updateLanguage(language) {
    currentLanguage = language;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}
