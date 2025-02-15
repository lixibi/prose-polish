import { PromptCardManager } from './js/promptCard.js';
import { MarkdownHandler } from './js/markdownHandler.js';
import { ConnectionManager } from './js/connectionManager.js';
import { CONFIG } from './config.js';
import { initializeCardManagement } from './js/promptCard.js';

// 模型配置
const MODEL_CONFIG = {
    DEEPSEEK: {
        BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        MODELS: {
            V3: 'deepseek-v3',
            R1: 'deepseek-r1'
        }
    }
};

// 检测是否为开发模式
const isDevelopment = window.location.hostname === '127.0.0.1';

// 更新配置
const API_CONFIG = {
    TONGYI_API_KEY: CONFIG.TONGYI_API_KEY,
    API_URL: isDevelopment ? null : 'http://localhost:3000/api/chat',
    DEEPSEEK_API_KEY: CONFIG.DEEPSEEK_API_KEY,
    CUSTOM_MODEL: CONFIG.CUSTOM_MODEL,
    SYSTEM_MESSAGE: CONFIG.SYSTEM_MESSAGE
};

// DOM 元素
const promptCards = document.querySelectorAll('.prompt-card');
const submitButton = document.getElementById('submit-prompt');
const promptOutput = document.getElementById('prompt-output');
const cardContainer = document.querySelector('.prompt-cards');
const paragraphContainer = document.getElementById('paragraph-cards');

// 初始化管理器
const cardManager = new PromptCardManager(cardContainer);
const markdownHandler = new MarkdownHandler(paragraphContainer);
const connectionManager = new ConnectionManager();

// 将管理器暴露到全局，供其他模块使用
window.cardManager = cardManager;
window.connectionManager = connectionManager;

// 监听窗口大小变化和滚动，更新连接线
window.addEventListener('resize', () => connectionManager.updateConnections());
window.addEventListener('scroll', () => connectionManager.updateConnections());

// 设置拖拽功能
// 拖拽开始时记录内容
promptOutput.addEventListener('dragstart', (e) => {
    const content = promptOutput.textContent.trim();
    if (content && content !== '等待提交提示词...' && content !== 'AI思考中...') {
        e.dataTransfer.setData('text/plain', content);
        // 添加拖拽效果
        promptOutput.style.opacity = '0.5';
    } else {
        e.preventDefault();
    }
});

// 拖拽结束时恢复样式
promptOutput.addEventListener('dragend', () => {
    promptOutput.style.opacity = '1';
});

// 允许放置
paragraphContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

// 处理放置事件
paragraphContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const content = e.dataTransfer.getData('text/plain');
    if (content) {
        // 计算放置位置
        const rect = paragraphContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 创建新卡片
        const card = markdownHandler.createCard(content);
        card.style.left = `${x - 150}px`; // 卡片宽度的一半
        card.style.top = `${y - 75}px`;  // 卡片高度的一半
    }
});

// 添加默认卡片
async function addDefaultCards() {
    // 添加第一个卡片
    const card1 = cardManager.addCard(
        '规范表述',
        '以下是一段文字，请你修改它的表述，使其能够满足现代汉语规范的需求：```{{text}}```'
    );
    // console.log('Added card 1:', card1.id);

    // 等待一毫秒以确保时间戳不同
    await new Promise(resolve => setTimeout(resolve, 1));

    // 添加第二个卡片
    const card2 = cardManager.addCard(
        '衔接',
        '以下有两段文字，我想依次把它们衔接在一起，但直接衔接太突兀了。请你编写第三段文字，可以插在两段文字之间，让表达顺畅：\n第一段文字:<p>{{p1}}</p>。\n第二段文字:<p>{{p2}}</p>'
    );
    // console.log('Added card 2:', card2.id);

    await new Promise(resolve => setTimeout(resolve, 1));

    // 添加第三个卡片
    const card3 = cardManager.addCard(
        '稿件整体化',
        '以下写得太细碎了。请你改写这段文字，使其整体性强一些。你不必遵循原文字的结构，可以根据它的内容，重新提炼大纲后再重写，要求情感真挚、用词标准：```{{text}}```'
    );
    // console.log('Added card 3:', card3.id);

    // 校对类
    const card4 = cardManager.addCard(
        '语法检查',
        '请检查以下文字的语法错误，并给出修改建议：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card5 = cardManager.addCard(
        '敏感词检测',
        '请检查以下文字中的敏感词，并给出委婉的替换建议：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card6 = cardManager.addCard(
        '标点优化',
        '请检查以下文字的标点符号使用是否规范，给出修改建议：```{{text}}```'
    );

    // 公文处理类
    const card7 = cardManager.addCard(
        '公文格式化',
        '请将以下文字按照公文格式进行规范化处理：\n文种：{{type}}\n正文：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card8 = cardManager.addCard(
        '请示报告生成',
        '请根据以下要点生成一份规范的请示报告：\n主题：{{subject}}\n主要内容：{{content}}\n请示事项：{{request}}'
    );

    // 创意辅助类
    const card9 = cardManager.addCard(
        '标题生成',
        '请根据以下正文内容，生成5个吸引人的标题：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card10 = cardManager.addCard(
        '摘要生成',
        '请为以下文章生成一段200字以内的摘要：```{{text}}```'
    );

    // 风格转换类
    const card11 = cardManager.addCard(
        '风格转换',
        '请将以下文字改写成指定风格：\n目标风格：{{style}}\n原文：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card12 = cardManager.addCard(
        '口语化表达',
        '请将以下正式文字改写成更口语化的表达：```{{text}}```'
    );

    // 分析类
    const card13 = cardManager.addCard(
        '情感分析',
        '请分析以下文字的情感倾向，并给出具体分析：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card14 = cardManager.addCard(
        '关键词提取',
        '请从以下文字中提取出10个最重要的关键词，并解释选择原因：```{{text}}```'
    );

    // 学术写作类
    const card15 = cardManager.addCard(
        '术语规范',
        '请检查以下学术文章中的术语使用是否规范、一致，给出修改建议：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card16 = cardManager.addCard(
        '参考文献整理',
        '请将以下参考文献按照规范格式整理：\n引用格式：{{format}}\n原始文献：```{{references}}```'
    );

    // 公文政治性处理
    const card17 = cardManager.addCard(
        '政治表述规范',
        '请检查以下文字的政治表述是否规范，确保符合当前政策导向和规范用语：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card18 = cardManager.addCard(
        '公文严肃性提升',
        '请将以下文字修改为更加严肃、庄重的公文表达方式：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card19 = cardManager.addCard(
        '党政机关公文规范',
        '请按照党政机关公文格式标准（GB/T 9704-2012）规范以下文字：\n文种：{{type}}\n正文：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card20 = cardManager.addCard(
        '会议精神转化',
        '请将以下会议/讲话精神转化为正式的公文表述：\n会议类型：{{meeting_type}}\n原始内容：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card21 = cardManager.addCard(
        '政策解读转换',
        '请将以下政策内容转换为更加规范的公文表述，注意准确把握政策精神：```{{text}}```'
    );
    
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const card22 = cardManager.addCard(
        '公文层级表述',
        '请根据以下内容生成合适的公文表述：\n发文机关层级：{{level}}\n接收对象层级：{{target_level}}\n内容：```{{text}}```'
    );
}

// 添加默认文本卡片
function addDefaultTextCard() {
    const defaultText = `欢迎使用AI写作助手！想要流畅地使用，你只需要记住一个规则：插头插在插座上。这是一个示例文本卡片。试试导入《端午的鸭蛋》，或者点击右下角的 + 添加新卡片开始写作吧！`;

    const card = markdownHandler.createCard(defaultText);
    card.style.left = '10px';
    card.style.top = '10px';
}

// 在页面加载完成后添加默认卡片
document.addEventListener('DOMContentLoaded', () => {
    addDefaultCards();  // 添加默认提示词卡片
    addDefaultTextCard();  // 添加默认文本卡片
});

// 监听卡片选择
cardManager.onCardSelected = (card) => {
    submitButton.disabled = !card;
    if (card) {
        document.querySelectorAll('.prompt-card').forEach(element => {
            element.classList.remove('selected');
            if (element.id === card.id) {
                element.classList.add('selected');
            }
        });
    }
};

// 添加新卡片按钮
document.getElementById('add-card').addEventListener('click', () => {
    cardManager.showEditDialog(null);
});

// 修改提示词提交处理
submitButton.addEventListener('click', async () => {
    const selectedCard = cardManager.selectedCard;
    if (!selectedCard) return;

    try {
        // 获取替换了占位符的提示词
        const prompt = selectedCard.getPromptWithConnections();
        const modelInfo = window.getCurrentModel();
        
        // 获取实际使用的模型名称
        let actualModel = '';
        if (modelInfo.model === 'tongyi') {
            actualModel = 'qwen-turbo';
        } else if (modelInfo.model === 'deepseek-v3') {
            actualModel = MODEL_CONFIG.DEEPSEEK.MODELS.V3;
        } else if (modelInfo.model === 'deepseek-r1') {
            actualModel = MODEL_CONFIG.DEEPSEEK.MODELS.R1;
        } else if (modelInfo.model === 'custom' && API_CONFIG.CUSTOM_MODEL) {
            actualModel = API_CONFIG.CUSTOM_MODEL.MODEL;
        }
        
        console.log('提示词:', prompt);

        promptOutput.textContent = 'AI思考中...';
        submitButton.disabled = true;

        const response = await callAIAPI(prompt, modelInfo.model);
        promptOutput.textContent = response;
    } catch (error) {
        promptOutput.textContent = `错误：${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
});

// 初始化 Markdown 处理器
markdownHandler.init();

// 创建隐藏的文件输入框
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.md';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// 处理文件导入
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await markdownHandler.handleFileImport(file);
        // 重置文件输入框的值，这样可以重复导入相同的文件
        fileInput.value = '';
    }
});

// 触发文件选择
document.getElementById('import-button').addEventListener('click', () => {
    fileInput.click();
});

// 导出Markdown文件
document.getElementById('export-button').addEventListener('click', () => {
    const cards = Array.from(document.querySelectorAll('.paragraph-card'));
    
    // 按y坐标排序，y相同时按x坐标排序
    cards.sort((a, b) => {
        const aY = parseInt(a.style.top);
        const bY = parseInt(b.style.top);
        if (aY === bY) {
            const aX = parseInt(a.style.left);
            const bX = parseInt(b.style.left);
            return aX - bX;
        }
        return aY - bY;
    });

    // 提取文本内容并用双换行符连接
    const content = cards
        .map(card => card.querySelector('.card-content').textContent.trim())
        .filter(text => text) // 过滤掉空文本
        .join('\n\n');

    // 创建Blob对象
    const blob = new Blob([content], { type: 'text/markdown' });
    
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'exported_document.md';
    
    // 触发下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // 清理URL对象
    URL.revokeObjectURL(downloadLink.href);
});

// 添加删除所有段落的功能
document.getElementById('clear-paragraphs').addEventListener('click', () => {
    if (confirm('确定要删除所有段落卡片吗？此操作不可撤销。')) {
        // 清空所有段落卡片
        paragraphContainer.innerHTML = '';
        
        // 清除所有连接
        if (window.connectionManager) {
            window.connectionManager.clearAllConnections();
        }

        // 重置导入计数器
        markdownHandler.importCount = 0;
    }
});

// 模拟API调用
async function mockApiCall(message, model) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return `[本地模式] 当前使用的是模拟数据。如需调用在线API，请切换到在线API模式，或使用本地的 Ollama 模型。`;
}

// 显示自定义模型配置对话框
function showCustomModelDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'custom-model-dialog';
    dialog.innerHTML = `
        <div class="custom-model-content">
            <h3>配置自定义模型</h3>
            <div class="form-group">
                <label for="base-url">Base URL</label>
                <input type="text" id="base-url" placeholder="例如：https://api.openai.com/v1" value="${API_CONFIG.CUSTOM_MODEL?.BASE_URL || ''}">
                <div class="hint">API 服务器的基础 URL</div>
            </div>
            <div class="form-group">
                <label for="api-key">API Key</label>
                <input type="password" id="api-key" placeholder="输入你的 API Key" value="${API_CONFIG.CUSTOM_MODEL?.API_KEY || ''}">
                <div class="hint">用于认证的 API 密钥</div>
            </div>
            <div class="form-group">
                <label for="model-name">模型名称</label>
                <input type="text" id="model-name" placeholder="例如：gpt-3.5-turbo" value="${API_CONFIG.CUSTOM_MODEL?.MODEL || ''}">
                <div class="hint">要使用的模型标识符</div>
            </div>
            <div class="custom-model-buttons">
                <button class="cancel-btn">取消</button>
                <button class="save-btn">保存</button>
            </div>
        </div>
    `;

    // 保存按钮事件
    dialog.querySelector('.save-btn').addEventListener('click', () => {
        const baseUrl = dialog.querySelector('#base-url').value.trim();
        const apiKey = dialog.querySelector('#api-key').value.trim();
        const model = dialog.querySelector('#model-name').value.trim();

        if (!baseUrl || !apiKey || !model) {
            alert('请填写所有必要信息');
            return;
        }

        // 更新配置
        API_CONFIG.CUSTOM_MODEL = {
            BASE_URL: baseUrl,
            API_KEY: apiKey,
            MODEL: model
        };

        // 提示用户保存配置到 config.js
        const configText = 
`请将以下配置复制到你的 config.js 文件中的 CUSTOM_MODEL 部分：

CUSTOM_MODEL: {
    BASE_URL: '${baseUrl}',
    API_KEY: '${apiKey}',
    MODEL: '${model}'
}`;
        
        console.log('新的自定义模型配置：');
        console.log(configText);
        alert('配置已更新！请记得将新的配置保存到 config.js 文件中。\n\n配置信息已输出到控制台，你可以直接复制使用。');

        dialog.remove();
    });

    // 取消按钮事件
    dialog.querySelector('.cancel-btn').addEventListener('click', () => {
        dialog.remove();
        if (!API_CONFIG.CUSTOM_MODEL?.BASE_URL) {
            // 如果没有配置，回到默认模型
            const defaultOption = document.querySelector('.model-option[data-model="tongyi"]');
            defaultOption.click();
        }
    });

    document.body.appendChild(dialog);
}

// 显示 Ollama 配置对话框
async function showOllamaDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'ollama-dialog';
    dialog.innerHTML = `
        <div class="ollama-content">
            <h3>配置本地模型</h3>
            <div class="description">
                请确保：<br>
                1. 已经安装 Ollama；<br>
                2. 已经安装本地模型；<br>
                3. Ollama 处于启动服务状态。
            </div>
            <div class="form-group">
                <label>选择模型</label>
                <div class="model-list">
                    <div class="loading">正在获取可用模型列表...</div>
                </div>
            </div>
            <div class="ollama-buttons">
                <button class="cancel-btn">取消</button>
                <button class="confirm-btn" disabled>确定</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // 获取可用模型列表
    try {
        // 首先检查 Ollama 服务是否在运行
        const healthCheck = await fetch('http://localhost:11434');
        if (!healthCheck.ok) {
            throw new Error('无法连接到 Ollama 服务');
        }
        
        // 获取已安装的模型列表
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
            throw new Error('无法获取模型列表');
        }
        
        const data = await response.json();
        const modelList = dialog.querySelector('.model-list');
        const confirmBtn = dialog.querySelector('.confirm-btn');
        
        // 检查是否有模型
        if (data.models && data.models.length > 0) {
            modelList.innerHTML = data.models.map(model => {
                // 获取模型大小（转换为GB）
                const sizeInGB = (model.size / 1024 / 1024 / 1024).toFixed(2);
                // 获取参数大小
                const paramSize = model.details?.parameter_size || '未知';
                // 获取量化级别
                const quantLevel = model.details?.quantization_level || '未知';
                
                return `
                    <div class="model-option" data-name="${model.name}">
                        <input type="radio" name="ollama-model" id="model-${model.name}" value="${model.name}">
                        <label for="model-${model.name}">
                            <div class="model-name">${model.name}</div>
                            <div class="model-info">
                                参数量: ${paramSize} | 
                                量化: ${quantLevel} | 
                                大小: ${sizeInGB}GB
                            </div>
                        </label>
                    </div>
                `;
            }).join('');

            // 启用确定按钮
            confirmBtn.disabled = false;

            // 添加选择事件
            modelList.addEventListener('change', (e) => {
                if (e.target.type === 'radio') {
                    window.ollamaModel = e.target.value;
                }
            });
        } else {
            modelList.innerHTML = `
                <div class="error">未安装任何模型</div>`;
        }
    } catch (error) {
        dialog.querySelector('.model-list').innerHTML = `
            <div class="error">未连接到 Ollama</div>
        `;
    }

    // 取消按钮事件
    dialog.querySelector('.cancel-btn').addEventListener('click', () => {
        dialog.remove();
        // 如果没有配置，回到默认模型
        const defaultOption = document.querySelector('.model-option[data-model="tongyi"]');
        defaultOption.click();
    });

    // 确定按钮事件
    dialog.querySelector('.confirm-btn').addEventListener('click', () => {
        if (!window.ollamaModel) {
            alert('请选择一个模型');
            return;
        }
        dialog.remove();
    });
}

// 修改 initializeModelSelector 函数
function initializeModelSelector() {
    const modelSelector = document.getElementById('model-selector');
    const modelDropdown = document.querySelector('.model-dropdown');
    const modelOptions = document.querySelectorAll('.model-option');
    
    // 设置默认模型为通义千问
    let currentModel = 'deepseek-v3';
    
    // 设置初始选中状态
    modelOptions.forEach(opt => {
        if (opt.dataset.model === 'deepseek-v3') {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });

    // 切换下拉菜单
    modelSelector.addEventListener('click', (e) => {
        e.stopPropagation();
        modelSelector.classList.toggle('active');
        modelDropdown.classList.toggle('show');
    });

    // 选择模型
    modelOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const model = option.dataset.model;
            
            if (model === 'custom') {
                showCustomModelDialog();
            } else if (model === 'ollama') {
                showOllamaDialog();
            }
            
            // 更新选中状态
            modelOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            currentModel = model;
            modelDropdown.classList.remove('show');
            modelSelector.classList.remove('active');
        });
    });

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
        modelDropdown.classList.remove('show');
        modelSelector.classList.remove('active');
    });

    // 获取当前选中的模型和配置
    window.getCurrentModel = () => ({
        model: currentModel,
        config: currentModel === 'custom' ? API_CONFIG.CUSTOM_MODEL : null,
        ollamaModel: currentModel === 'ollama' ? window.ollamaModel : null
    });
}

// 修改 callAIAPI 函数
async function callAIAPI(message, model) {
    const modelInfo = window.getCurrentModel();
    
    // Ollama 模式，不受开发模式影响
    if (modelInfo.model === 'ollama') {
        if (!window.ollamaModel) {
            throw new Error('未选择 Ollama 模型');
        }

        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: window.ollamaModel,
                    prompt: message,
                    system: API_CONFIG.SYSTEM_MESSAGE.content,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Ollama API 错误:', errorData);
                throw new Error(`Ollama API调用失败: ${errorData.error || '未知错误'}`);
            }

            const data = await response.json();
            console.log('Ollama响应数据:', data);
            return data.response;
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('无法连接到 Ollama 服务。请确保：\n1. Ollama 已安装\n2. 已运行 `ollama serve`\n3. 选择的模型已经下载并运行');
            }
            throw error;
        }
    }
    
    // 在本地模式下，除了 Ollama 外的其他模型都使用模拟数据
    if (isDevelopment) {
        console.log('本地模式');
        return `[本地模式] 当前仅支持本地的 Ollama 模型。如需调用在线API，请切换到在线API模式。`;
    }

    // 其他模型的处理逻辑保持不变
    if (modelInfo.model === 'custom') {
        if (!API_CONFIG.CUSTOM_MODEL?.BASE_URL) {
            throw new Error('自定义模型未配置');
        }

        try {
            const response = await fetch(`${API_CONFIG.CUSTOM_MODEL.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.CUSTOM_MODEL.API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: API_CONFIG.CUSTOM_MODEL.MODEL,
                    messages: [
                        API_CONFIG.SYSTEM_MESSAGE,
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('自定义模型 API 错误:', errorData);
                throw new Error(`API调用失败: ${errorData.error?.message || '未知错误'}`);
            }

            const data = await response.json();
            console.log('自定义模型响应数据:', data);
            return data.choices[0].message.content;
        } catch (error) {
            throw error;
        }
    } else if (modelInfo.model === 'tongyi') {
        try {
            const response = await fetch(`https://dashscope.aliyuncs.com/compatible-mode/v1`, {
                method: 'POST',
                headers: {
                    'Authorization': API_CONFIG.TONGYI_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'qwen-plus',
                    input: {
                        messages: [
                            {
                                role: 'system',
                                content: API_CONFIG.SYSTEM_MESSAGE.content
                            },
                            {
                                role: 'user',
                                content: message
                            }
                        ]
                    },
                    parameters: {
                        result_format: 'message'
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('通义千问 API 错误:', errorData);
                throw new Error(`API调用失败: ${errorData.message || '未知错误'}`);
            }

            const data = await response.json();
            console.log('通义千问响应数据:', data);
            return data.output?.choices?.[0]?.message.content;
        } catch (error) {
            throw error;
        }
    } else if (modelInfo.model === 'deepseek-v3' || modelInfo.model === 'deepseek-r1') {
        if (!API_CONFIG.DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API 密钥未配置');
        }

        const modelName = modelInfo.model === 'deepseek-v3' ? 
            MODEL_CONFIG.DEEPSEEK.MODELS.V3 : 
            MODEL_CONFIG.DEEPSEEK.MODELS.R1;

        try {
            const response = await fetch(`${MODEL_CONFIG.DEEPSEEK.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        {
                            role: 'system',
                            content: API_CONFIG.SYSTEM_MESSAGE.content
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('DeepSeek API 错误:', errorData);
                throw new Error(`API调用失败: ${errorData.error?.message || '未知错误'}`);
            }

            const data = await response.json();
            console.log('DeepSeek响应数据:', data);
            return data.choices[0].message.content;
        } catch (error) {
            throw error;
        }
    }
    
    return mockApiCall(message, model);
}

document.addEventListener('DOMContentLoaded', () => {
    // 初始化卡片管理功能
    initializeCardManagement();
    // 初始化模型选择器
    initializeModelSelector();
    
    // ... existing initialization code ...
});

// 修改 PromptCardManager 类中的 selectCard 函数
function selectCard(cardId) {
    if (!cardId) return;

    // 如果点击的是当前已选中的卡片，则取消选中
    if (this.selectedCard?.id === cardId) {
        this.selectedCard = null;
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.classList.remove('selected');
        });
        if (this.onCardSelected) {
            this.onCardSelected(null);
        }
        return;
    }

    const allCards = this.container.querySelectorAll('.prompt-card');
    allCards.forEach(card => card.classList.remove('selected'));

    this.selectedCard = null;

    const cardElement = document.getElementById(cardId);
    if (cardElement) {
        const card = this.cards.get(cardId);
        if (card) {
            cardElement.classList.add('selected');
            this.selectedCard = card;
        }
    }
    
    if (this.onCardSelected) {
        this.onCardSelected(this.selectedCard);
    }
} 