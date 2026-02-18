// Journal Management
const journalManager = {
    storageKey: 'journalEntries',
    
    // Get all journal entries
    getEntries() {
        const entries = localStorage.getItem(this.storageKey);
        return entries ? JSON.parse(entries) : [];
    },
    
    // Save journal entries
    saveEntries(entries) {
        localStorage.setItem(this.storageKey, JSON.stringify(entries));
    },
    
    // Add a new journal entry
    addEntry(entry) {
        const entries = this.getEntries();
        const newEntry = {
            id: Date.now().toString(),
            title: entry.title || 'Untitled Journal',
            date: new Date().toISOString(),
            language: entry.language || 'es',
            transcription: entry.transcription || [],
            translation: entry.translation || [],
            audioFileName: entry.audioFileName || null,
            preview: this.generatePreview(entry.transcription)
        };
        entries.unshift(newEntry); // Add to beginning
        this.saveEntries(entries);
        return newEntry;
    },
    
    // Get a journal entry by ID
    getEntry(id) {
        const entries = this.getEntries();
        return entries.find(entry => entry.id === id);
    },
    
    // Delete a journal entry
    deleteEntry(id) {
        const entries = this.getEntries();
        const filtered = entries.filter(entry => entry.id !== id);
        this.saveEntries(filtered);
    },
    
    // Generate preview text from transcription
    generatePreview(transcription) {
        if (!transcription || transcription.length === 0) {
            return 'No content yet.';
        }
        const firstSegment = transcription[0];
        const text = firstSegment.text || '';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    },
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }
};

// Language names mapping
const languageNames = {
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi'
};

// DOM Elements
const journalEntriesContainer = document.getElementById('journal-entries');
const noEntriesMessage = document.getElementById('no-entries');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderJournalEntries();
    
    // Check if we're coming from notebook with a new entry
    checkForNewEntry();
});

// Render all journal entries
function renderJournalEntries() {
    const entries = journalManager.getEntries();
    
    if (entries.length === 0) {
        noEntriesMessage.classList.add('show');
        journalEntriesContainer.innerHTML = '';
        return;
    }
    
    noEntriesMessage.classList.remove('show');
    journalEntriesContainer.innerHTML = '';
    
    entries.forEach(entry => {
        const entryElement = createJournalEntryElement(entry);
        journalEntriesContainer.appendChild(entryElement);
    });
}

// Create a journal entry element
function createJournalEntryElement(entry) {
    const div = document.createElement('div');
    div.className = 'journal-entry';
    div.dataset.entryId = entry.id;
    
    const language = languageNames[entry.language] || entry.language;
    const segmentCount = entry.transcription ? entry.transcription.length : 0;
    
    div.innerHTML = `
        <div class="journal-entry-header">
            <div class="journal-entry-title">${escapeHtml(entry.title)}</div>
            <div class="journal-entry-date">${journalManager.formatDate(entry.date)}</div>
        </div>
        <div class="journal-entry-meta">
            <span>📝 ${segmentCount} segments</span>
            <span>🌐 ${language}</span>
            ${entry.audioFileName ? `<span>🎵 ${escapeHtml(entry.audioFileName)}</span>` : ''}
        </div>
        <div class="journal-entry-preview">${escapeHtml(entry.preview || 'No preview available.')}</div>
        <div class="journal-entry-actions">
            <button class="delete-btn" onclick="deleteJournalEntry(event, '${entry.id}')" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
    `;
    
    // Add click handler to open journal
    div.addEventListener('click', (e) => {
        // Don't open if clicking delete button
        if (e.target.closest('.delete-btn')) {
            return;
        }
        openJournal(entry.id);
    });
    
    return div;
}

// Open a journal entry
function openJournal(entryId) {
    // Store the entry ID in sessionStorage so notebook.html can load it
    sessionStorage.setItem('openJournalId', entryId);
    window.location.href = 'notebook.html';
}

// Delete a journal entry
function deleteJournalEntry(event, entryId) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this journal entry?')) {
        journalManager.deleteEntry(entryId);
        renderJournalEntries();
    }
}

// Check if we need to save a new entry from notebook
function checkForNewEntry() {
    const newEntryData = sessionStorage.getItem('newJournalEntry');
    if (newEntryData) {
        try {
            const entry = JSON.parse(newEntryData);
            journalManager.addEntry(entry);
            sessionStorage.removeItem('newJournalEntry');
            renderJournalEntries();
        } catch (e) {
            console.error('Error parsing new journal entry:', e);
        }
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make deleteJournalEntry available globally
window.deleteJournalEntry = deleteJournalEntry;
