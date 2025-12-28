# verbose-barnacle
This Qdrant Memory Manager extension provides:

Qdrant Connection Configuration:

GUI form to enter Qdrant server URL and OpenRouter API key
Local storage of configuration settings
Status indicators for connection state
Flexible Storage Options:

Switch between separate collections per character or per chat
Automatic collection naming based on selected option
Memory Management:

Automatic agentic memory creation every N messages (default: 2)
Manual "Upload Current Chat" button to add all messages to Qdrant
Memory counter that updates with Qdrant collection data
Memory Search Functionality:

Keyword-based search system
Visual display of search results with relevance scores
User-Friendly Interface:

Clean, responsive design with intuitive controls
Clear status messages for user feedback
Well-organized sections for easy navigation
Safety Features:

Duplicate collection prevention during upload
Error handling with descriptive messages
Input validation before operations
The extension follows Silly Tavern's extension structure requirements and is designed to work with versions 1.14+ while providing robust Qdrant integration capabilities.
