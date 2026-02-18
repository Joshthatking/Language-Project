// Journal Page Functionality
const journalState = {
    englishText: '',
    spanishText: '',
    currentJournalId: null,
    isMicMuted: false,
    isLatinScript: true
};

// DOM Elements
const englishTextEl = document.getElementById('english-text');
const spanishTextEl = document.getElementById('spanish-text');
const journalTitleEl = document.getElementById('journal-title');
const saveJournalBtn = document.getElementById('save-journal-btn');
const journalList = document.getElementById('journal-list');
const profileBtn = document.getElementById('profile-btn');
const settingsBtn = document.getElementById('settings-btn');
const micToggleBtn = document.getElementById('mic-toggle-btn');
const micIcon = document.getElementById('mic-icon');
const micMutedIcon = document.getElementById('mic-muted-icon');
const waveform = document.getElementById('waveform');
const listeningIndicator = document.getElementById('listening-indicator');
const listeningText = document.getElementById('listening-text');
const langScriptBtn = document.getElementById('lang-script-btn');
const langScriptAbc = document.getElementById('lang-script-abc');
const langScriptChar = document.getElementById('lang-script-char');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadJournalEntries();
    checkForExistingJournal();
});

// Event Listeners
function initializeEventListeners() {
    // Save button
    saveJournalBtn.addEventListener('click', saveJournal);
    
    // Text editing
    englishTextEl.addEventListener('input', handleTextChange);
    spanishTextEl.addEventListener('input', handleTextChange);
    
    // Microphone toggle
    micToggleBtn.addEventListener('click', toggleMicrophone);
    
    // Language script toggle (abc / 文)
    langScriptBtn.addEventListener('click', toggleLanguageScript);
    
    // Profile and settings buttons (placeholder)
    profileBtn.addEventListener('click', () => {
        alert('Profile settings coming soon!');
    });
    
    settingsBtn.addEventListener('click', () => {
        alert('Settings coming soon!');
    });
    
    // Journal list items
    document.querySelectorAll('.journal-item').forEach(item => {
        item.addEventListener('click', function() {
            const journalName = this.querySelector('.journal-name').textContent;
            openJournal(journalName);
        });
    });
}

// Toggle Microphone Mute
function toggleMicrophone() {
    journalState.isMicMuted = !journalState.isMicMuted;
    updateMicrophoneUI();
}

// Toggle Language Script (Latin abc ↔ International 文)
function toggleLanguageScript() {
    journalState.isLatinScript = !journalState.isLatinScript;
    updateLanguageScriptUI();
}

function updateLanguageScriptUI() {
    if (journalState.isLatinScript) {
        langScriptAbc.style.display = '';
        langScriptChar.style.display = 'none';
        langScriptBtn.setAttribute('aria-label', 'Toggle script: Latin (current)');
    } else {
        langScriptAbc.style.display = 'none';
        langScriptChar.style.display = '';
        langScriptBtn.setAttribute('aria-label', 'Toggle script: International (current)');
    }
}

// Update Microphone UI based on mute state
function updateMicrophoneUI() {
    if (journalState.isMicMuted) {
        // Show muted icon, hide normal icon
        micIcon.style.display = 'none';
        micMutedIcon.style.display = 'block';
        
        // Add muted class to waveform and indicator
        waveform.classList.add('muted');
        listeningIndicator.classList.add('muted');
        
        // Update text
        listeningText.textContent = 'Microphone muted';
    } else {
        // Show normal icon, hide muted icon
        micIcon.style.display = 'block';
        micMutedIcon.style.display = 'none';
        
        // Remove muted class from waveform and indicator
        waveform.classList.remove('muted');
        listeningIndicator.classList.remove('muted');
        
        // Update text
        listeningText.textContent = 'Listening for transcription...';
    }
}

// Handle text changes
function handleTextChange(e) {
    if (e.target.id === 'english-text') {
        journalState.englishText = e.target.textContent;
    } else if (e.target.id === 'spanish-text') {
        journalState.spanishText = e.target.textContent;
    }
}

// Save Journal
function saveJournal() {
    const englishText = englishTextEl.textContent.trim();
    const spanishText = spanishTextEl.textContent.trim();
    
    if (!englishText && !spanishText) {
        alert('Please add some content before saving.');
        return;
    }
    
    // Get existing entries
    const entries = getJournalEntries();
    
    const title = journalTitleEl.textContent.trim() || generateJournalTitle();
    
    // Create new entry or update existing
    const entry = {
        id: journalState.currentJournalId || Date.now().toString(),
        title: title,
        date: new Date().toISOString(),
        englishText: englishText,
        spanishText: spanishText,
        language: 'es'
    };
    
    // Remove old entry if updating
    if (journalState.currentJournalId) {
        const filtered = entries.filter(e => e.id !== journalState.currentJournalId);
        entries.length = 0;
        entries.push(...filtered);
    }
    
    // Add new entry at the beginning
    entries.unshift(entry);
    saveJournalEntries(entries);
    
    // Update UI
    journalState.currentJournalId = entry.id;
    loadJournalEntries();
    
    // Show success feedback
    showSaveFeedback();
}

// Generate journal title
function generateJournalTitle() {
    const englishText = englishTextEl.textContent.trim();
    if (englishText) {
        const firstWords = englishText.split(' ').slice(0, 5).join(' ');
        return firstWords.length > 30 ? firstWords.substring(0, 30) + '...' : firstWords;
    }
    return `Journal - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

// Show save feedback
function showSaveFeedback() {
    const originalText = saveJournalBtn.querySelector('span').textContent;
    saveJournalBtn.querySelector('span').textContent = 'Saved!';
    saveJournalBtn.style.background = '#10B981';
    
    setTimeout(() => {
        saveJournalBtn.querySelector('span').textContent = originalText;
        saveJournalBtn.style.background = '';
    }, 2000);
}

// Load Journal Entries
function loadJournalEntries() {
    const entries = getJournalEntries();
    
    // Clear existing list
    journalList.innerHTML = '';
    
    // Add entries to list
    entries.forEach(entry => {
        const item = createJournalListItem(entry);
        journalList.appendChild(item);
    });
}

// Create journal list item
function createJournalListItem(entry) {
    const div = document.createElement('div');
    div.className = 'journal-item';
    div.dataset.journalId = entry.id;
    
    div.innerHTML = `
        <svg class="journal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span class="journal-name">${escapeHtml(entry.title)}</span>
    `;
    
    div.addEventListener('click', () => openJournal(entry.id));
    
    return div;
}

// Open Journal
function openJournal(journalId) {
    const entries = getJournalEntries();
    const entry = entries.find(e => e.id === journalId);
    
    if (entry) {
        journalTitleEl.textContent = entry.title || 'Journal';
        englishTextEl.textContent = entry.englishText || 'Waiting for transcription... Type or dictate here.';
        spanishTextEl.textContent = entry.spanishText || 'Traducción pendiente... Escriba o dicte aquí.';
        journalState.currentJournalId = entry.id;
        journalState.englishText = entry.englishText || '';
        journalState.spanishText = entry.spanishText || '';
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Check for existing journal to load
function checkForExistingJournal() {
    const journalId = sessionStorage.getItem('openJournalId');
    if (journalId) {
        openJournal(journalId);
        sessionStorage.removeItem('openJournalId');
    }
}

// Local Storage Helpers
function getJournalEntries() {
    const entries = localStorage.getItem('journalEntries');
    return entries ? JSON.parse(entries) : [];
}

function saveJournalEntries(entries) {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
