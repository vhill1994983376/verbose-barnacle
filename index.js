// Qdrant Memory Manager Extension for Silly Tavern

// Initialize extension vars
let config = {};
let currentCollection = '';
let memoryCount = 0;
let messageCounter = 0;

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
});

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
        
        // Get current chat messages - simulate getting actual messages
        const messages = [
            { role: 'user', content: 'Hello there!' },
            { role: 'assistant', content: 'Hello! How can I help you today?' },
            { role: 'user', content: 'I need some information about Qdrant.' }
        ];
        
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

// Get active character name (simulated)
function getActiveCharacterName() {
    // In real implementation, would fetch character name from Silly Tavern context
    return 'Character_' + Math.floor(Math.random() * 1000);
}

// Get current chat title (simulated)
function getCurrentChatTitle() {
    // In real implementation, would fetch chat title from Silly Tavern context
    return 'Chat_' + Math.floor(Math.random() * 1000);
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
    collectionInfo.textContent = currentCollection ? `Current Collection: ${currentCollection}` : "No Collection Loaded";
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

// Handle messages (simulated)
function handleNewMessage(message) {
    messageCounter++;
    
    // Create agenic memory when interval is met
    if (messageCounter % config.memoryInterval === 0) {
        createAgenticMemory(message);
    }
    
    // Check for keyword in message and trigger memory creation
    const keywords = ['memory', 'remember', 'think'];
    const containsKeyword = keywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (containsKeyword && messageCounter % 5 === 0) {
        createAgenticMemory(message);
    }
}

// Simulate creating an agentic memory
function createAgenticMemory(content) {
    try {
        if (!config.qdrantUrl) {
            throw new Error("Qdrant URL not configured");
        }
        
        // Simulate memory creation
        console.log(`Creating agentic memory: "${content}"`);
        
        // Increment counter (in a real implementation, we'd add to Qdrant)
        memoryCount++;
        updateMemoryCounter();
        
        updateConnectionStatus(`Created agentic memory with content: "${content.substring(0, 30)}..."`);
        
    } catch (error) {
        updateConnectionStatus(`Error: ${error.message}`);
        console.error('Memory creation error:', error);
    }
}

// Simulated message listener - for demo purposes
setTimeout(() => {
    handleNewMessage("Hello, this is a test message to demonstrate agentic memory creation.");
    handleNewMessage("The second message for testing purposes.");
    handleNewMessage("The third message that should trigger memory generation.");
}, 1000);

// Export functions for use in Silly Tavern environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createAgenticMemory,
        handleNewMessage,
        getSelectedStorageType,
        getActiveCharacterName,
        getCurrentChatTitle
    };
}
