let currentCategory = 'A'; // 初始类别为动物
let currentFamiliarity = 'all'; // 初始熟悉度为全部
let currentLanguage = 'all'; // 初始语言为全部
// script.js
var validUsersh;
var validUserurl;
// 等待页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取登录表单
    var loginForm = document.getElementById('loginForm');

    // 添加表单提交事件监听器
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        validUsers = username;

        // 调用处理登录的函数
        handleLogin(username, password);
    });
});
// 定义一个处理登录的函数
function handleLogin(username, password) {
    // 全局变量用于存储当前用户的 thing 值
    // Fetch users data from JSON file
    fetch('users.json')
        .then(response => response.json())
        .then(users => {
            // Validation loop through the users array
            validUser = users.find(function(user) {
                return user.username === username && user.password === password;
            });

            if (validUser) {
                //alert('Login successful');
                // Store the current logged in user's thing value in global variable
                validUsersh = validUser.spreadsheetid;
                validUserurl = validUser.userurl;
                console.table(validUsers);
                getapi();
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('logoutButton').style.display = 'block';
            } else {
                document.getElementById("loginForm").reset();
                //alert('Login failed. Please check your username and password.');
            }
        })
        .catch(error => console.error('Error fetching users data:', error));
}


function handleLogout() {
    // Clear any user-specific data if needed
    // Show login form and hide logout button
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'none';
    validUsersh = null;
    validUserurl = null;
    location.reload();
    alert('Logged out successfully');
}
window.onload = function() {
};
shf =0;
const apiKey = "AIzaSyCjKRvEzlvle-xwuCCCp_2sPOsF_8F-PdY";
//const sheetId = "11k4ClBe3J9teO098xKxbNulGNi6scjD-pnqKxW4sZ68";
// Sheets 中要取得的数据范围，格式如下
const range = "B1:F159";
// Sheets API 的 URL
//const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueRenderOption=FORMATTED_VALUE&key=${apiKey}`;

// 加载单词列表的函数
/*
window.onload = function() {
    getapi();
};
*/
rangearry = ["B1:F159","B1:F159","B1:F171"]
let words = {}; // 存放从 JSON 文件中加载的单词数据
function getapi() {
    console.table(validUsers)
    words = {};
    for (var i=0; i<3; i++) {
        url = `https://sheets.googleapis.com/v4/spreadsheets/${validUsersh}/values/${String.fromCharCode(i+65)}!${rangearry[i]}?valueRenderOption=FORMATTED_VALUE&key=${apiKey}`;
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
                console.table(validUser);
                loadWords(currentCategory, currentFamiliarity, currentLanguage);
            })
            .catch((error) => console.error("Error:", error));
        }
}

function updateCategory(category) {
    currentCategory = category;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}

function loadWords(category, familiarity, language) {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = ''; // 清空之前的单词列表

    if (words[category]) {
        if(shf==0)
        {
            filteredWords = words[category].filter(wordObj => {
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
        }
        if(shf==0) {shuffledWords = shuffleArray(filteredWords); console.table(shuffledWords);}
        else {
            console.table(filteredWords);
            shuffledWords=filteredWords; shf=0;
            console.table(shuffledWords);
        }
        shuffledWords.forEach(wordObj => {
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
// update api
function update(category,value,range) {
    console.table(validUserurl);
    apipath = category
    apivalue = value
    //apivalue = 000
    apirange = range
    //urls = `https://script.google.com/macros/s/AKfycby5bgB3a9utCyrDg2AIOdqBgkcHGBsTXWqK2ZYmJLFH01oPllZlRBSivs_mdc-l3lxI/exec?path=C&action=update&range=F1&vlaue=2`
    //console.table(validUserurl);
    urls = `https://script.google.com/macros/s/${validUserurl}exec?path=${apipath}&action=update&range=${range}&vlaue=${apivalue}`
    console.table(urls);
    fetch(urls)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // 可以在這裡處理成功的回應
        console.table(urls)
        console.log('Request successful');
      })
      .catch(error => {
        // 可以在這裡處理錯誤
        console.error('There has been a problem with your fetch operation:', error);
      });
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
            familiarityClass = 'familiarity-circle ';
            familiarityClass1 = 'familiarity-circle2';
            familiarityClass2 = 'familiarity-circle3 chose';
            break;
        case '普通':
            familiarityClass = 'familiarity-circle';
            familiarityClass1 = 'familiarity-circle2 chose';
            familiarityClass2 = 'familiarity-circle3';
            break;
        case '不熟悉':
            familiarityClass = 'familiarity-circle chose';
            familiarityClass1 = 'familiarity-circle2';
            familiarityClass2 = 'familiarity-circle3 ';
            break;
        default:
            familiarityClass = 'familiarity-circle';
            familiarityClass1 = 'familiarity-circle2';
            familiarityClass2 = 'familiarity-circle3';
    }

    return `
        <div class="familiar-container">
            <span class="${familiarityClass2}" onclick="updateFamiliarityLevel(this, '熟悉')"></span>
            <span class="${familiarityClass1}" onclick="updateFamiliarityLevel(this, '普通')"></span>
            <span class="${familiarityClass}" onclick="updateFamiliarityLevel(this, '不熟悉')"></span>
        </div>
    `;
    
}

// 更新熟悉度并重新加载单词列表
function updateFamiliarityLevel(element, newFamiliarity) {
    const wordItem = element.closest('.word-item');
    const wordIndex = Array.from(wordItem.parentNode.children).indexOf(wordItem);
    //const word = filteredWords[currentCategory][wordIndex];
    //word.familiarity = newFamiliarity;
    filteredWords[wordIndex]["familiarity"] = newFamiliarity;
    console.table(filteredWords[0]["familiarity"]);
    //console.table(word);
    shf=1;
    // 重新渲染当前单词项
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
    update(currentCategory,newFamiliarity,"F"+(parseInt(filteredWords[wordIndex]["number"][4])+parseInt(filteredWords[wordIndex]["number"][3]*10)+parseInt(filteredWords[wordIndex]["number"][2]*100)));
    //console.table(word["number"][4])
    //console.table(parseInt(word["number"][4])+parseInt(word["number"][3]*10)+parseInt(word["number"][2]*100));
    //modifyData(sheetId,"A1",[["1"]]);
}
// 更新类别并重新加载单词列表
function updateCategory(category) {
    currentCategory = category;
    loadWords(currentCategory, currentFamiliarity, currentLanguage);
}
function updateword() {
    getapi();
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
