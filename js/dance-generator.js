// 舞蹈数据结构
let danceCategories = [];
let allDances = [];
let usedCombinations = new Set();

// 显示元素信息
function showElementsInfo() {
    const elementsInfo = document.getElementById('elementsInfo');
    const elementsList = document.getElementById('elementsList');
    const categoryInfo = danceCategories.map(cat => `${cat.name}(${cat.dances.length}个)`).join(', ');
    elementsList.textContent = `共${danceCategories.length}个分类，${allDances.length}个舞蹈动作：${categoryInfo}`;
    elementsInfo.style.display = 'block';
}

// 加载XML文件
function loadXMLFile(event) {
    const file = event.target.files[0];
    const status = document.getElementById('status');

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xml')) {
        status.innerHTML = '<div class="error">❌ 请选择有效的XML文件</div>';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');

            // 检查XML解析错误
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML格式错误');
            }

            // 解析XML结构 - 支持简单的element格式
            const newCategories = [];
            const newAllDances = [];
            
            const elementNodes = xmlDoc.getElementsByTagName('element');
            for (let i = 0; i < elementNodes.length; i++) {
                const elementName = elementNodes[i].textContent.trim();
                if (elementName) {
                    newAllDances.push(elementName);
                }
            }
            
            // 为简单结构创建一个默认分类
            if (newAllDances.length > 0) {
                newCategories.push({
                    name: '舞蹈动作',
                    dances: newAllDances
                });
            }

            if (newCategories.length === 0) {
                throw new Error('XML文件中没有找到有效的舞蹈分类数据');
            }

            danceCategories = newCategories;
            allDances = newAllDances;
            usedCombinations.clear(); // 清空已使用的组合

            status.innerHTML = `<div class="success">✅ 成功加载 ${danceCategories.length} 个分类，${allDances.length} 个舞蹈动作</div>`;
            showElementsInfo();

        } catch (error) {
            status.innerHTML = `<div class="error">❌ 解析XML文件失败: ${error.message}</div>`;
            console.error('XML解析错误:', error);
        }
    };

    reader.onerror = function () {
        status.innerHTML = '<div class="error">❌ 读取文件失败</div>';
    };

    reader.readAsText(file);
}

// 生成随机组合
function generateCombination() {
    const count = parseInt(document.getElementById('count').value);
    const strategy = document.getElementById('strategy').value;
    const result = document.getElementById('result');
    const status = document.getElementById('status');

    if (!count || count < 1) {
        status.innerHTML = '<div class="error">❌ 请输入有效的组合个数</div>';
        return;
    }

    let combination;
    try {
        switch (strategy) {
            case 'unique':
                combination = generateUniqueElements(count);
                break;
            case 'repeatable':
                combination = generateRepeatableElements(count);
                break;
            case 'category_repeatable':
                combination = generateCategoryRepeatable(count);
                break;
            case 'category_unique':
                combination = generateCategoryUnique(count);
                break;
            default:
                throw new Error('未知的生成策略');
        }

        if (!combination || combination.length === 0) {
            throw new Error('无法生成符合条件的组合');
        }

        // 显示组合
        displayCombination(combination);
        status.innerHTML = `<div class="success">✨ 使用「${getStrategyName(strategy)}」策略生成了 ${combination.length} 个舞蹈动作</div>`;
        
    } catch (error) {
        status.innerHTML = `<div class="error">❌ ${error.message}</div>`;
    }
}

// 获取策略名称
function getStrategyName(strategy) {
    const strategyNames = {
        'unique': '分类可重复，舞蹈不重复',
        'repeatable': '分类可重复，舞蹈可重复',
        'category_repeatable': '分类不重复，舞蹈可重复',
        'category_unique': '分类不重复，舞蹈不重复'
    };
    return strategyNames[strategy] || '未知策略';
}

// 策略a: 分类可重复，舞蹈不重复
function generateUniqueElements(count) {
    if (count > allDances.length) {
        throw new Error(`最多只能生成 ${allDances.length} 个不重复的舞蹈动作`);
    }
    return getRandomCombination(allDances, count);
}

// 策略b: 分类可重复，舞蹈可重复
function generateRepeatableElements(count) {
    const combination = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * allDances.length);
        combination.push(allDances[randomIndex]);
    }
    return combination;
}

// 策略c: 分类不重复，舞蹈可重复
function generateCategoryRepeatable(count) {
    if (count > danceCategories.length) {
        throw new Error(`最多只能生成 ${danceCategories.length} 个不同分类的舞蹈动作`);
    }
    
    const combination = [];
    const usedCategories = new Set();
    
    // 随机选择N个不同分类，每个分类选择一个舞蹈
    while (combination.length < count) {
        // 随机选择一个分类
        const availableCategories = danceCategories.filter(cat => !usedCategories.has(cat.name));
        if (availableCategories.length === 0) break;
        
        const randomCategoryIndex = Math.floor(Math.random() * availableCategories.length);
        const selectedCategory = availableCategories[randomCategoryIndex];
        
        // 从该分类中随机选择一个舞蹈
        const randomDanceIndex = Math.floor(Math.random() * selectedCategory.dances.length);
        const selectedDance = selectedCategory.dances[randomDanceIndex];
        
        combination.push(selectedDance);
        usedCategories.add(selectedCategory.name);
    }
    
    // 打乱顺序
    return shuffleArray(combination);
}

// 策略d: 分类不重复，舞蹈不重复
function generateCategoryUnique(count) {
    if (count > danceCategories.length) {
        throw new Error(`最多只能生成 ${danceCategories.length} 个不同分类的舞蹈动作`);
    }
    
    const combination = [];
    const usedCategories = new Set();
    const usedDances = new Set();
    
    // 随机选择N个不同分类，确保舞蹈也不重复
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (combination.length < count && attempts < maxAttempts) {
        attempts++;
        
        // 随机选择一个未使用的分类
        const availableCategories = danceCategories.filter(cat => !usedCategories.has(cat.name));
        if (availableCategories.length === 0) break;
        
        const randomCategoryIndex = Math.floor(Math.random() * availableCategories.length);
        const selectedCategory = availableCategories[randomCategoryIndex];
        
        // 从该分类中选择一个未使用的舞蹈
        const availableDances = selectedCategory.dances.filter(dance => !usedDances.has(dance));
        if (availableDances.length === 0) {
            // 如果该分类所有舞蹈都已使用，跳过此分类
            continue;
        }
        
        const randomDanceIndex = Math.floor(Math.random() * availableDances.length);
        const selectedDance = availableDances[randomDanceIndex];
        
        combination.push(selectedDance);
        usedCategories.add(selectedCategory.name);
        usedDances.add(selectedDance);
    }
    
    if (combination.length < count) {
        throw new Error('无法生成足够的不重复舞蹈动作（分类和舞蹈都不重复）');
    }
    
    // 打乱顺序
    return shuffleArray(combination);
}

// 数组随机打乱
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 获取随机组合
function getRandomCombination(arr, count) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

// 计算组合数
function calculateCombinations(n, r) {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;

    let result = 1;
    for (let i = 0; i < r; i++) {
        result = result * (n - i) / (i + 1);
    }
    return Math.floor(result);
}

// 根据舞蹈名称查找分类
function findDanceCategory(danceName) {
    for (let category of danceCategories) {
        if (category.dances.includes(danceName)) {
            return category.name;
        }
    }
    return '未知分类';
}

// 显示组合
function displayCombination(combination) {
    const result = document.getElementById('result');
    const container = document.createElement('div');
    container.className = 'combination-container';

    combination.forEach((element, index) => {
        // 创建元素容器
        const elementDiv = document.createElement('div');
        elementDiv.className = 'element';
        elementDiv.style.animationDelay = `${index * 0.1}s`;

        // 创建舞蹈名称
        const nameDiv = document.createElement('div');
        nameDiv.className = 'element-name';
        nameDiv.textContent = element;
        
        // 创建分类标签
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'element-category';
        categoryDiv.textContent = findDanceCategory(element);
        
        // 组装元素
        elementDiv.appendChild(nameDiv);
        elementDiv.appendChild(categoryDiv);
        container.appendChild(elementDiv);

        // 添加箭头（除了最后一个元素）
        if (index < combination.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            arrow.textContent = '→';
            container.appendChild(arrow);
        }
    });

    result.innerHTML = '';
    result.appendChild(container);
}

// 添加加载本地XML文件的函数
function loadRemoteXML() {
    const status = document.getElementById('status');
    status.innerHTML = '<div class="status">正在加载舞蹈动作数据...</div>';

    fetch('xml/freestyle5.0.xml')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(xmlText => {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

                // 检查XML解析错误
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error('XML格式错误');
                }

                // 解析XML结构 - 支持简单的element格式
                const newCategories = [];
                const newAllDances = [];
                
                const elementNodes = xmlDoc.getElementsByTagName('element');
                for (let i = 0; i < elementNodes.length; i++) {
                    const elementName = elementNodes[i].textContent.trim();
                    if (elementName) {
                        newAllDances.push(elementName);
                    }
                }
                
                // 为简单结构创建一个默认分类
                if (newAllDances.length > 0) {
                    newCategories.push({
                        name: '舞蹈动作',
                        dances: newAllDances
                    });
                }

                if (newCategories.length === 0) {
                    throw new Error('XML文件中没有找到有效的舞蹈分类数据');
                }

                danceCategories = newCategories;
                allDances = newAllDances;
                usedCombinations.clear(); // 清空已使用的组合

                status.innerHTML = `<div class="success">✅ 成功从本地加载 ${danceCategories.length} 个分类，${allDances.length} 个舞蹈动作</div>`;
                showElementsInfo();

            } catch (error) {
                status.innerHTML = `<div class="error">❌ 解析XML文件失败: ${error.message}</div>`;
                console.error('XML解析错误:', error);
            }
        })
        .catch(error => {
            status.innerHTML = `<div class="error">❌ 加载XML文件失败: ${error.message}</div>`;
            console.error('XML加载错误:', error);
        });
}

// 页面加载时加载XML数据
window.onload = function () {
    loadRemoteXML();
};