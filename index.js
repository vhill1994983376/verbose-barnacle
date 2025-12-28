// Qdrant Memory Manager Extension for Silly Tavern v1.15

// Initialize extension vars
let config = {};
let currentCollection = '';
let memoryCount = 0;
let messageCounter = 0;
let isActive = false;

// DOM Elements
const qdrantUrlInput = document.getElementById('qdrantUrl');
const openRouterApiKeyInput = document.getElementById('openRouterApiKey');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const storageTypeRadios = document.getElementsByName('storageType');
const memoryIntervalSelect = document.getElementById('memoryInterval');
const uploadChatBtn = document.getElementById('uploadChatBtn');
const searchKeywordInput = document.getElementById('searchKeyword');
const searchBtn = document.getElementById('searchBtn');
const searchResultsDiv = document.getElementById('searchResults');
const memoryCountSpan = document.getElementById('memoryCount');
const refreshCounterBtn = document.getElementById('refreshCounterBtn');
const connectionStatus = document.getElementById('connectionStatus');
const collectionInfo = document.getElementById('collectionInfo');

// Load saved configuration
document.addEventListener('DOMContentLoaded', () => {
    // Try to load saved settings
    const savedConfig = localStorage.getItem('qdrantConfig');
    if (savedConfig) {
        config = JSON.parse(savedConfig);
        qdrantUrlInput.value = config.qdrantUrl || '';
        openRouterApiKeyInput.value = config.openRouterApiKey || '';
        updateStorageType(config.storageType);
    }
    
    // Set default from manifest
    if (!config.memoryInterval) {
        config.memoryInterval = 2;
        memoryIntervalSelect.value = config.memoryInterval;
    }
    
    // Update UI elements
    updateConnectionStatus('Disconnected');
    updateMemoryCounter();
    
    // Initialize extension in Silly Tavern v1.15 environment
    initExtension();
});

// Initialize extension functionality
async function initExtension() {
    try {
        // Attempt to access Silly Tavern APIs
        if (typeof window.SillyTavern !== 'undefined') {
            // Register extension with Silly Tavern v1.15
            await registerExtension();
        } else {
            // Fallback for direct usage
            console.warn("Silly Tavern context not available. Running in standalone mode.");
            isActive = true;
        }
    } catch (error) {
        console.error("Failed to initialize extension:", error);
        updateConnectionStatus("Initialization failed");
    }
}

// Register with Silly Tavern v1.15
async function registerExtension() {
    // In v1.15, extensions might need to register differently
    if (window.SillyTavern.extensions) {
        try {
            // Register the extension with Silly Tavern
            window.SillyTavern.extensions.register({
                name: 'Qdrant Memory Manager',
                version: '1.15',
                description: 'Manage agentic memories with Qdrant server integration',
                icon: 'memory',
                init: () => {
                    isActive = true;
                    setupEventListeners();
                    console.log('Qdrant Memory Manager extension initialized');
                },
                destroy: () => {
                    isActive = false;
                    console.log('Qdrant Memory Manager extension destroyed');
                }
            });
        } catch (error) {
            console.error("Extension registration failed:", error);
        }
    }
}

// Setup event listeners for Silly Tavern v1.15
function setupEventListeners() {
    // Listen for new messages (v1.15 event system)
    if (window.SillyTavern.events) {
        window.SillyTavern.events.on('message', handleNewMessage);
        window.SillyTavern.events.on('characterChanged', handleCharacterChange);
        window.SillyTavern.events.on('chatChanged', handleChatChange);
    }
}

// Cleanup event listeners
function cleanupEventListeners() {
    if (window.SillyTavern.events) {
        window.SillyTavern.events.off('message', handleNewMessage);
        window.SillyTavern.events.off('characterChanged', handleCharacterChange);
        window.SillyTavern.events.off('chatChanged', handleChatChange);
    }
}

// Update radio buttons for storage types
function updateStorageType(selectedType) {
    for (let i = 0; i < storageTypeRadios.length; i++) {
        if (storageTypeRadios[i].value === selectedType) {
            storageTypeRadios[i].checked = true;
            break;
        }
    }
}

// Save configuration
saveConfigBtn.addEventListener('click', () => {
    config = {
        qdrantUrl: qdrantUrlInput.value,
        openRouterApiKey: openRouterApiKeyInput.value,
        storageType: getSelectedStorageType(),
        memoryInterval: parseInt(memoryIntervalSelect.value)
    };
    
    localStorage.setItem('qdrantConfig', JSON.stringify(config));
    updateConnectionStatus('Configuration Saved');
});

// Get selected radio button value
function getSelectedStorageType() {
    for (let i = 0; i < storageTypeRadios.length; i++) {
        if (storageTypeRadios[i].checked) {
            return storageTypeRadios[i].value;
        }
    }
    return 'character';
}

// Upload current chat
uploadChatBtn.addEventListener('click', async () => {
    try {
        if (!config.qdrantUrl) {
            throw new Error("Please configure Qdrant URL first");
        }

        const characterName = getActiveCharacterName();
        const chatName = getCurrentChatTitle();
        
        let collectionName = '';
        if (config.storageType === 'character') {
            collectionName = `char_${characterName}`;
        } else {
            collectionName = `chat_${chatName}`;
        }
        
        if (!collectionName) {
            throw new Error("Cannot determine collection name");
        }
        
        // Check if collection exists
        const collectionExists = await checkCollectionExists(collectionName);
        
        if (collectionExists) {
            alert("Collection already exists for this chat/character!");
            return;
        }
        
        // Get current chat messages from Silly Tavern v1.15
        const messages = await getChatMessages();
        
        if (messages.length === 0) {
            throw new Error("No messages found to upload");
        }
        
        // Upload messages to Qdrant
        await uploadMessagesToQdrant(messages, collectionName);
        
        currentCollection = collectionName;
        updateCollectionInfo();
        updateMemoryCounter();
        updateConnectionStatus(`Uploaded ${messages.length} messages to ${collectionName}`);
        
    } catch (error) {
        updateConnectionStatus(`Error: ${error.message}`);
        console.error('Upload error:', error);
    }
});

// Get chat messages from Silly Tavern (v1.15 compatible)
async function getChatMessages() {
    // In v1.15, access chat messages through Silly Tavern API
    try {
        // This would depend on Silly Tavern v1.15 API
        const messages = [];
        
        // Simulate fetching messages - in reality this would call Silly Tavern APIs
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { role: 'user', content: 'Hello there!' },
                    { role: 'assistant', content: 'Hello! How can I help you today?' },
                    { role: 'user', content: 'I need some information about Qdrant.' }
                ]);
            }, 300);
        });
    } catch (error) {
        console.error("Failed to retrieve chat messages:", error);
        return [];
    }
}

// Search memories in Qdrant
searchBtn.addEventListener('click', async () => {
    try {
        if (!config.qdrantUrl) {
            throw new Error("Please configure Qdrant URL first");
        }

        if (!currentCollection) {
            throw new Error("No collection loaded");
        }

        const keywords = searchKeywordInput.value.split(',').map(k => k.trim()).filter(k => k);
        if (keywords.length === 0) {
            throw new Error("Please enter at least one keyword");
        }
        
        const results = await searchMemoriesInQdrant(keywords, currentCollection);
        
        displaySearchResults(results);
        updateConnectionStatus(`Found ${results.length} matching memories`);
        
    } catch (error) {
        searchResultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        updateConnectionStatus(`Error: ${error.message}`);
        console.error('Search error:', error);
    }
});

// Refresh memory counter
refreshCounterBtn.addEventListener('click', async () => {
    try {
        if (!config.qdrantUrl) {
            throw new Error("Please configure Qdrant URL first");
        }
        
        if (!currentCollection) {
            updateMemoryCounter(0);
            return;
        }
        
        const count = await getMemoryCount(currentCollection);
        updateMemoryCounter(count);
        updateConnectionStatus(`Memory count refreshed`);
        
    } catch (error) {
        updateConnectionStatus(`Error: ${error.message}`);
        console.error('Counter error:', error);
    }
});

// Get active character name (v1.15 compatible)
function getActiveCharacterName() {
    try {
        // Check if we have Silly Tavern API access
        if (window.SillyTavern && window.SillyTavern.getCharacter) {
            const character = window.SillyTavern.getCharacter();
            return character?.name || 'Unknown_Character';
        }
        // Fallback for direct usage
        return 'Character_' + Math.floor(Math.random() * 1000);
    } catch (error) {
        console.error("Failed to get character name:", error);
        return 'Character_' + Math.floor(Math.random() * 1000);
    }
}

// Get current chat title (v1.15 compatible)
function getCurrentChatTitle() {
    try {
        // Check if we have Silly Tavern API access
        if (window.SillyTavern && window.SillyTavern.getChat) {
            const chat = window.SillyTavern.getChat();
            return chat?.title || 'Unnamed_Chat';
        }
        // Fallback for direct usage
        return 'Chat_' + Math.floor(Math.random() * 1000);
    } catch (error) {
        console.error("Failed to get chat title:", error);
        return 'Chat_' + Math.floor(Math.random() * 1000);
    }
}

// Handle character change event
function handleCharacterChange(character) {
    console.log('Character changed to:', character?.name);
    // Auto-update collection based on new character if needed
    if (config.storageType === 'character') {
        // Rebuild collection reference if needed
        updateCollectionInfo();
    }
}

// Handle chat change event
function handleChatChange(chat) {
    console.log('Chat changed to:', chat?.title);
    // Auto-update collection reference if needed
    if (config.storageType === 'chat') {
        // Rebuild collection reference if needed
        updateCollectionInfo();
    }
}

// Check if collection exists in Qdrant
async function checkCollectionExists(collectionName) {
    // Simulate API call to Qdrant
    return new Promise((resolve) => {
        setTimeout(() => {
            // In real implementation this would be an actual network request
            resolve(false); // For demo purposes always returns false
        }, 300);
    });
}

// Upload messages to Qdrant
async function uploadMessagesToQdrant(messages, collectionName) {
    // Simulate uploading messages to Qdrant
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Uploading ${messages.length} messages to ${collectionName}`);
            resolve(true);
        }, 500);
    });
}

// Search memories in Qdrant
async function searchMemoriesInQdrant(keywords, collectionName) {
    // Simulate search operation
    return new Promise((resolve) => {
        setTimeout(() => {
            const results = [];
            if (keywords.includes('test') || keywords.includes('demo')) {
                results.push({
                    id: 1,
                    content: "This is a test memory",
                    score: 0.95
                });
                results.push({
                    id: 2,
                    content: "Another demo memory",
                    score: 0.87
                });
            }
            resolve(results);
        }, 500);
    });
}

// Get memory count
async function getMemoryCount(collectionName) {
    // Simulate getting count from Qdrant
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(42); // For demo purposes
        }, 300);
    });
}

// Update connection status display
function updateConnectionStatus(status) {
    connectionStatus.textContent = status;
    connectionStatus.style.color = status.includes('Error') ? '#e74c3c' : 
                                  status.includes('Saved') ? '#27ae60' : 
                                  status.includes('Connected') ? '#27ae60' : '#7f8c8d';
}

// Update collection info display
function updateCollectionInfo() {
    const charName = getActiveCharacterName();
    const chatName = getCurrentChatTitle();
    
    if (config.storageType === 'character') {
        collectionInfo.textContent = currentCollection ? 
            `Current Collection: ${currentCollection}` : 
            `Collection for: ${charName}`;
    } else {
        collectionInfo.textContent = currentCollection ? 
            `Current Collection: ${currentCollection}` : 
            `Collection for: ${chatName}`;
    }
    collectionInfo.style.fontWeight = currentCollection ? 'bold' : 'normal';
}

// Update memory counter display
function updateMemoryCounter(count) {
    if (count !== undefined) {
        memoryCount = count;
    }
    
    memoryCountSpan.textContent = memoryCount;
    memoryCountSpan.style.color = memoryCount > 0 ? '#27ae60' : '#7f8c8d';
}

// Display search results
function displaySearchResults(results) {
    if (results.length === 0) {
        searchResultsDiv.innerHTML = '<p>No memories found matching your keywords.</p>';
        return;
    }
    
    let html = '';
    results.forEach(result => {
        html += `
            <p>
                <strong>ID:</strong> ${result.id} | 
                <strong>Score:</strong> ${(result.score * 100).toFixed(1)}%<br>
                ${result.content}
            </p>
        `;
    });
    
    searchResultsDiv.innerHTML = html;
}

// Handle new message input (v1.15)
function handleNewMessage(messageData) {
    // Message object format for Silly Tavern v1.15
    const { message, sender, timestamp } = messageData;
    
    if (!isActive) return;
    
    messageCounter++;
    
    // Create agenic memory when interval is met
    if (messageCounter % config.memoryInterval === 0) {
        createAgenticMemory(message, sender);
    }
    
    // Check for keyword in message and trigger memory creation
    const keywords = ['memory', 'remember', 'think'];
    const containsKeyword = keywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );
    
    if (containsKeyword && messageCounter % 5 === 0) {
        createAgenticMemory(message, sender);
    }
}

// Create agentic memory (v1.15)
function createAgenticMemory(content, sender) {
    try {
        if (!config.qdrantUrl) {
            throw new Error("Qdrant URL not configured");
        }
        
        // In v1.15, we may have more structured data
        const memory = {
            content: content,
            creator: sender,
            timestamp: Date.now(),
            collection: currentCollection || 'default'
        };
        
        // Simulate memory creation
        console.log(`Creating agentic memory:`, memory);
        
        // Increment counter (in a real implementation, we'd add to Qdrant)
        memoryCount++;
        updateMemoryCounter();
        
        updateConnectionStatus(`Created agentic memory from ${sender}: "${content.substring(0, 30)}..."`);
        
    } catch (error) {
        updateConnectionStatus(`Error: ${error.message}`);
        console.error('Memory creation error:', error);
    }
}

// Cleanup on extension removal
window.addEventListener('beforeunload', () => {
    cleanupEventListeners();
});

// Simulated initial messages for demonstration
setTimeout(() => {
    handleNewMessage({ 
        message: "Hello, this is a test message to demonstrate agentic memory creation.", 
        sender: "User", 
        timestamp: Date.now() 
    });
    handleNewMessage({ 
        message: "The second message for testing purposes.", 
        sender: "User", 
        timestamp: Date.now() 
    });
    handleNewMessage({ 
        message: "The third message that should trigger memory generation.", 
        sender: "User", 
        timestamp: Date.now() 
    });
}, 1000);

// Export for Silly Tavern environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createAgenticMemory,
        handleNewMessage,
        getSelectedStorageType,
        getActiveCharacterName,
        getCurrentChatTitle,
        initExtension,
        registerExtension
    };
}
