let currentCategory = 'C'; // 初始类别为动物
let currentFamiliarity = 'all'; // 初始熟悉度为全部
let currentLanguage = 'all'; // 初始语言为全部
//const { GoogleSpreadsheet } = require('google-spreadsheet');
// 网页加载完成后执行的函数
window.onload = function() {
    loadWordsFromJson();
};

const apiKey = "AIzaSyCjKRvEzlvle-xwuCCCp_2sPOsF_8F-PdY";
const sheetId = "11k4ClBe3J9teO098xKxbNulGNi6scjD-pnqKxW4sZ68";
// Sheets 中要取得的数据范围，格式如下
const range = "B1:F86";
// Sheets API 的 URL
const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueRenderOption=FORMATTED_VALUE&key=${apiKey}`;

// 加载单词列表的函数
window.onload = function() {
    getapi();
};

let words = {}; // 存放从 JSON 文件中加载的单词数据
function getapi() {
    words = {};
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
                        number: item[0],
                        word: item[1], // 英文
                        partOfSpeech: item[2], // 词性
                        翻译: item[3], // 中文翻译
                        familiarity: item[4]
                    });
                }
            });
            console.table(data);
            console.table(words);
            loadWords(currentCategory, currentFamiliarity, currentLanguage);
        })
        .catch((error) => console.error("Error:", error));
}

function updateCategory(category) {
    currentCategory = category;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}

function loadWords(category, familiarity, language) {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = ''; // 清空之前的单词列表

    if (words[category]) {
        const filteredWords = words[category].filter(wordObj => {
            // 检查熟悉度条件
            if (familiarity !== 'all' && wordObj.familiarity !== familiarity) {
                return false;
            }

            // 检查语言条件
            if (language !== 'all') {
                if (language === 'chinese' && !wordObj.翻译) {
                    return false;
                }
                if (language === 'english' && !wordObj.word) {
                    return false;
                }
            }

            return true; // 符合所有条件的单词
        });

        filteredWords.forEach(wordObj => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';

            const word = document.createElement('h3');
            word.textContent = language === 'chinese' ? wordObj.翻译 : wordObj.word;
            wordItem.appendChild(word);

            const partOfSpeech = document.createElement('h3');
            partOfSpeech.textContent = `词性: ${wordObj.partOfSpeech}`;
            wordItem.appendChild(partOfSpeech);

            const translation = document.createElement('h3');
            translation.textContent = language === 'chinese' ? `单词: ${wordObj.word}` : `Translation: ${wordObj.翻译}`;
            translation.style.display = 'none'; // 初始隐藏翻译
            wordItem.appendChild(translation);

            const familiarityContainer = document.createElement('div');
            familiarityContainer.className = 'familiarity-container';
            familiarityContainer.innerHTML = getFamiliarityHTML(wordObj.familiarity); // 添加熟悉度圆圈的 HTML
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

// 随机化数组顺序的函数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 根据熟悉度返回不同的 HTML 代码
function getFamiliarityHTML(familiarity) {
    let familiarityClass = '';
    switch (familiarity) {
        case '熟悉':
            familiarityClass = 'familiarity-circle chose';
            familiarityClass1 = 'familiarity-circle2';
            familiarityClass2 = 'familiarity-circle3';
            break;
        case '普通':
            familiarityClass = 'familiarity-circle';
            familiarityClass1 = 'familiarity-circle2 chose';
            familiarityClass2 = 'familiarity-circle3';
            break;
        case '不熟悉':
            familiarityClass = 'familiarity-circle';
            familiarityClass1 = 'familiarity-circle2';
            familiarityClass2 = 'familiarity-circle3 chose';
            break;
        default:
            familiarityClass = 'familiarity-circle';
            familiarityClass1 = 'familiarity-circle2';
            familiarityClass2 = 'familiarity-circle3';
    }

    return `
        <div class="familiar-container">
            <span class="${familiarityClass2}" onclick="updateFamiliarityLevel(this, '不熟悉')"></span>
            <span class="${familiarityClass1}" onclick="updateFamiliarityLevel(this, '普通')"></span>
            <span class="${familiarityClass}" onclick="updateFamiliarityLevel(this, '熟悉')"></span>
        </div>
    `;
}

// 更新熟悉度并重新加载单词列表
function updateFamiliarityLevel(element, newFamiliarity) {
    const wordItem = element.closest('.word-item');
    const wordIndex = Array.from(wordItem.parentNode.children).indexOf(wordItem);
    const word = words[currentCategory][wordIndex];
    word.familiarity = newFamiliarity;
    console.table(word);

    // 重新渲染当前单词项
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
    //console.table(word["number"][4]);
    //modifyData(sheetId,"A1",[["1"]]);
}
async function modifyData(spreadsheetId, range, newValue) {
    try {
      // Initialize the Google Spreadsheet API
      const doc = new GoogleSpreadsheet();
      await doc.useServiceAccountAuth({
        client_email: 'service-account@vocabluary.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDk207BZwoW1DCY\nZ/yhgNQKbnqzboldLy+6jNqsrrsap06ms9FJqq9RDctwSFPuTw2Zpn8UBaMrEHdn\nlO/dTW5iEg90qkqaYCh7LR2bxx8UxbSlNcVws+q1n2LeIHldBkf/ERJ3KmPl7U/L\nDyfE3DcQ+2mDNMlvx/yR8zAEol+u1Sh30dODHQi85jMH+HkJnjHlkM8CLGqGz3G5\npH6WrThAk8Mii4gGj1TZKHaVlTBSpYw65mN81asUo/lg5K8g3pqWCWmwJvD3+iZK\nAdmlP2S7nc8c5/0Mc1ewBoQdkJlUEHnvS7KUKk6JAwBO1cTkyVnvWHw2Dth9wIsY\nU+8d/SFXAgMBAAECggEAWgsloffCIvhKxHRJlFvFUfNlCJsppcXOkCYiVcYL7PE+\nA14FrufewdPdIuj6SO3Gqpk1L7IGIIgCivkxJQ/1qdV0SlFEOBg0ZT57g1Klmn0t\nVcFh1TWc1+gFtOLvDVhO1H8plkRR+OHVvs3QNmb0rZRVz99hkD8N03jtAC3I2tbZ\nyd72VG8GiFUKPBo/RDLjfDEiiPPxQsP39i8XOi/7bjKks4MAHQO0TWpW9vHLKZHQ\nKC9GT7G/K3UqJ2wtOZ7NVWbBTIY4mmDwsQCJznFprcZ5qQeTyivapbBVcIp0oIwT\nXnltlcpHD33zBWwDEVgJ7Op0rFRMNJ27YyL+1DewgQKBgQD8XeC5sHYqmaHv3myR\niNTgfPoFnjzTh3TVQLs96s4cgbT7wo1uilUE6bUjSTDZXg6eSfT7oidBouhK+rAd\nq5qaXOGOz2Z56WA0JULMGEom5z2IF2+gTnQmd2PXM0rD+FWgAkeWlZMrTLVuBfvO\nZTAWjbBh3uXzwKhYicF6jG1d1wKBgQDoJsgAbYu/42xs98rOCcMmnijdrCrwCkmV\nFFCGcq8OLpwc5hGr5jEYimGlCxFVxn0mJNo/nv5DvtI6DSrOtM9WMXr8UV2YX+bc\n4heMcPvF4cHwvdOxOj15CRH/XSvYVjKsgmpfbHh2H0xPeFJ1uRYIC/+fcXHPT05B\neF07OhrogQKBgQCZ2lmwmuXPXs4cwEsMBpFRMp/yYN/QTZpqkAYW31k8g87kVV2H\n8ImYbyphErPXMMJUud3Csr6gA0L+wwovbHjadpmESOi+lgpyf+zTJFPAl+UpXLBO\n2MVy1gJmJf0EsBbzb7BZG2MXWLKbGsbCs2m3tjW71Pn3upJnN8Reg9IBDQKBgFZQ\nrQYztMUo2tR9IUOQL6X5IjqhW+mZ+ZfbUMFcfKfqPpMkG6ftU43LTdjej5hzz25S\nP29uPx2TInkBEkx+v6RNi2urGQChj6XKznSiQYpmkQRgoAgCHn8VF0L6MmYiTn8D\nkmdeXj+VDXtywj4RDhb51xZCSM2KsA75oLh3ty+BAoGBAPbzilANDHiWPQHijWoh\n89HGJ9AJIq4d/t01ISAqrJaUjRfcozT6gY+QKJZ1LA3dHbfn0s4RXM/N9DuUuE5s\nhin6GJNkFlq+j04pWQih2ArR2BqzKC5hF8241MgRLWwFiYerR97X1uOFY01o16l+\n7CpguWkNqjPiWVzzDAd6pDw3\n-----END PRIVATE KEY-----\n'
      });
  
      // Load the spreadsheet
      await doc.loadInfo();
  
      // Get the worksheet
      const worksheet = doc.sheetsById[0];
  
      // Update the cell value
      await worksheet.updateCell(range, newValue);
  
      // Save the changes
      await worksheet.save();
  
      console.log('Data modified successfully.');
    } catch (err) {
      console.error(err);
    }
  }
  
// 更新类别并重新加载单词列表
function updateCategory(category) {
    currentCategory = category;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}

// 更新熟悉度并重新加载单词列表
function updateFamiliarity(familiarity) {
    currentFamiliarity = familiarity;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}

// 更新语言并重新加载单词列表
function updateLanguage(language) {
    currentLanguage = language;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}
