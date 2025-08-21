/**
 * Search Functionality for CloudLab Documentation
 * Provides client-side search across documentation content
 */

class DocumentationSearch {
  constructor() {
    this.searchIndex = [];
    this.searchResults = [];
    this.searchContainer = null;
    this.searchInput = null;
    this.resultsContainer = null;
    this.init();
  }

  init() {
    this.createSearchInterface();
    this.buildSearchIndex();
    this.setupEventListeners();
  }

  /**
   * Create search interface elements
   */
  createSearchInterface() {
    // Create search container
    this.searchContainer = document.createElement('div');
    this.searchContainer.className = 'search-container';
    this.searchContainer.innerHTML = `
      <div class="search-wrapper">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search documentation..."
          aria-label="Search documentation"
        />
        <button class="search-button" aria-label="Search">
          🔍
        </button>
      </div>
      <div class="search-results" style="display: none;"></div>
    `;

    // Insert search container after the first h1 or at the top of the page
    const firstH1 = document.querySelector('h1');
    if (firstH1) {
      firstH1.parentNode.insertBefore(this.searchContainer, firstH1.nextSibling);
    } else {
      document.body.insertBefore(this.searchContainer, document.body.firstChild);
    }

    // Get references to elements
    this.searchInput = this.searchContainer.querySelector('.search-input');
    this.resultsContainer = this.searchContainer.querySelector('.search-results');
  }

  /**
   * Build search index from page content
   */
  buildSearchIndex() {
    const contentElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, code, pre');
    
    contentElements.forEach((element, index) => {
      const text = element.textContent.trim();
      if (text.length > 10) { // Only index meaningful content
        const heading = this.findClosestHeading(element);
        const url = this.getCurrentPageUrl();
        
        this.searchIndex.push({
          id: index,
          text: text.toLowerCase(),
          originalText: text,
          element: element,
          heading: heading,
          url: url,
          type: element.tagName.toLowerCase(),
          relevance: this.calculateRelevance(element)
        });
      }
    });
  }

  /**
   * Find the closest heading for context
   */
  findClosestHeading(element) {
    let current = element;
    while (current && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(current.tagName)) {
      current = current.previousElementSibling || current.parentElement;
    }
    return current ? current.textContent.trim() : 'Documentation';
  }

  /**
   * Get current page URL
   */
  getCurrentPageUrl() {
    return window.location.pathname;
  }

  /**
   * Calculate relevance score for search ranking
   */
  calculateRelevance(element) {
    let score = 1;
    
    // Headings get higher scores
    if (element.tagName.match(/^H[1-6]$/)) {
      score += 5;
      // H1 gets highest score
      if (element.tagName === 'H1') score += 3;
      if (element.tagName === 'H2') score += 2;
      if (element.tagName === 'H3') score += 1;
    }
    
    // Code blocks get medium scores
    if (element.tagName === 'CODE' || element.tagName === 'PRE') {
      score += 2;
    }
    
    // Paragraphs get base scores
    if (element.tagName === 'P') {
      score += 1;
    }
    
    return score;
  }

  /**
   * Setup event listeners for search
   */
  setupEventListeners() {
    // Search input events
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch();
      }
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });

    // Search button click
    const searchButton = this.searchContainer.querySelector('.search-button');
    searchButton.addEventListener('click', () => {
      this.performSearch();
    });

    // Click outside to close results
    document.addEventListener('click', (e) => {
      if (!this.searchContainer.contains(e.target)) {
        this.hideResults();
      }
    });
  }

  /**
   * Handle search input changes
   */
  handleSearch(query) {
    if (query.length < 2) {
      this.hideResults();
      return;
    }

    this.searchResults = this.searchIndex.filter(item => {
      return item.text.includes(query.toLowerCase());
    });

    // Sort by relevance
    this.searchResults.sort((a, b) => b.relevance - a.relevance);

    // Limit results
    this.searchResults = this.searchResults.slice(0, 10);

    this.displayResults();
  }

  /**
   * Perform search with current input
   */
  performSearch() {
    const query = this.searchInput.value.trim();
    if (query.length < 2) return;

    this.handleSearch(query);
  }

  /**
   * Display search results
   */
  displayResults() {
    if (this.searchResults.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>No results found. Try different keywords.</p>
        </div>
      `;
    } else {
      const resultsHTML = this.searchResults.map(result => {
        const excerpt = this.createExcerpt(result.originalText);
        return `
          <div class="search-result-item" data-result-id="${result.id}">
            <div class="search-result-header">
              <h4 class="search-result-title">
                <a href="${result.url}#${this.generateAnchor(result.heading)}">
                  ${result.heading}
                </a>
              </h4>
              <span class="search-result-type">${result.type}</span>
            </div>
            <div class="search-result-excerpt">${excerpt}</div>
            <div class="search-result-context">
              <small>${result.url}</small>
            </div>
          </div>
        `;
      }).join('');

      this.resultsContainer.innerHTML = `
        <div class="search-results-header">
          <h3>Search Results (${this.searchResults.length})</h3>
          <button class="search-close" aria-label="Close search results">×</button>
        </div>
        <div class="search-results-list">
          ${resultsHTML}
        </div>
      `;

      // Add click handlers for result items
      this.resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
          this.navigateToResult(this.searchResults[index]);
        });
      });

      // Add close button handler
      const closeButton = this.resultsContainer.querySelector('.search-close');
      closeButton.addEventListener('click', () => {
        this.hideResults();
      });
    }

    this.showResults();
  }

  /**
   * Create excerpt from text
   */
  createExcerpt(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    
    const words = text.split(' ');
    let excerpt = '';
    
    for (let word of words) {
      if ((excerpt + ' ' + word).length > maxLength) {
        break;
      }
      excerpt += (excerpt ? ' ' : '') + word;
    }
    
    return excerpt + '...';
  }

  /**
   * Generate anchor for headings
   */
  generateAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Navigate to search result
   */
  navigateToResult(result) {
    // Scroll to the element
    result.element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });

    // Highlight the element temporarily
    result.element.style.backgroundColor = 'var(--accent-color)';
    result.element.style.color = 'white';
    
    setTimeout(() => {
      result.element.style.backgroundColor = '';
      result.element.style.color = '';
    }, 2000);

    // Hide search results
    this.hideResults();
    
    // Clear search input
    this.searchInput.value = '';
  }

  /**
   * Show search results
   */
  showResults() {
    this.resultsContainer.style.display = 'block';
    this.resultsContainer.style.position = 'absolute';
    this.resultsContainer.style.zIndex = '1000';
    this.resultsContainer.style.backgroundColor = 'var(--background-color)';
    this.resultsContainer.style.border = '1px solid var(--border-color)';
    this.resultsContainer.style.borderRadius = '6px';
    this.resultsContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    this.resultsContainer.style.maxHeight = '400px';
    this.resultsContainer.style.overflowY = 'auto';
    this.resultsContainer.style.width = '100%';
    this.resultsContainer.style.marginTop = '0.5rem';
  }

  /**
   * Hide search results
   */
  hideResults() {
    this.resultsContainer.style.display = 'none';
  }

  /**
   * Clear search
   */
  clearSearch() {
    this.searchInput.value = '';
    this.hideResults();
    this.searchInput.blur();
  }

  /**
   * Update search index when content changes
   */
  updateIndex() {
    this.searchIndex = [];
    this.buildSearchIndex();
  }
}

/**
 * Initialize search when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  new DocumentationSearch();
});

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DocumentationSearch;
}
