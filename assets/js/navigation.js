/**
 * Navigation Enhancement for CloudLab Documentation
 * Provides dynamic sidebar generation and active link highlighting
 */

class DocumentationNavigation {
  constructor() {
    this.currentPath = window.location.pathname;
    this.sidebarContainer = document.querySelector('.sidebar');
    this.init();
  }

  init() {
    this.generateSidebar();
    this.highlightActiveLinks();
    this.setupMobileNavigation();
    this.setupBreadcrumbs();
  }

  /**
   * Generate dynamic sidebar navigation based on current page
   */
  generateSidebar() {
    if (!this.sidebarContainer) return;

    const currentSection = this.getCurrentSection();
    const sidebarHTML = this.buildSidebarHTML(currentSection);
    
    this.sidebarContainer.innerHTML = sidebarHTML;
  }

  /**
   * Get the current section from the URL path
   */
  getCurrentSection() {
    const pathParts = this.currentPath.split('/').filter(Boolean);
    return pathParts[0] || 'home';
  }

  /**
   * Build sidebar HTML for the current section
   */
  buildSidebarHTML(section) {
    const navigationData = this.getNavigationData();
    const currentSectionData = navigationData[section] || navigationData.home;

    let html = `
      <div class="sidebar-header">
        <h3>${currentSectionData.title}</h3>
      </div>
      <nav class="sidebar-nav">
        <ul>
    `;

    // Add section overview link
    if (currentSectionData.overview) {
      html += `
        <li>
          <a href="${currentSectionData.overview.url}" class="sidebar-overview">
            📋 ${currentSectionData.overview.title}
          </a>
        </li>
      `;
    }

    // Add section links
    if (currentSectionData.links) {
      currentSectionData.links.forEach(link => {
        const isActive = this.currentPath.includes(link.url);
        const activeClass = isActive ? 'active' : '';
        
        html += `
          <li>
            <a href="${link.url}" class="${activeClass}">
              ${link.icon} ${link.title}
            </a>
          </li>
        `;
      });
    }

    // Add related sections
    if (currentSectionData.related) {
      html += '<li class="sidebar-divider"><span>Related Sections</span></li>';
      currentSectionData.related.forEach(related => {
        html += `
          <li>
            <a href="${related.url}" class="sidebar-related">
              🔗 ${related.title}
            </a>
          </li>
        `;
      });
    }

    html += `
        </ul>
      </nav>
    `;

    return html;
  }

  /**
   * Get navigation data structure
   */
  getNavigationData() {
    return {
      home: {
        title: 'Documentation Home',
        overview: {
          title: 'Getting Started',
          url: '/'
        },
        links: [
          { title: 'System Overview', url: '/architecture/overview/system-overview', icon: '🏗️' },
          { title: 'Quick Start Guide', url: '/knowledge/tutorials/', icon: '🚀' },
          { title: 'API Reference', url: '/api/', icon: '🔌' }
        ],
        related: [
          { title: 'Architecture', url: '/architecture/', icon: '🏗️' },
          { title: 'Development', url: '/development/', icon: '💻' },
          { title: 'Operations', url: '/operations/', icon: '🔧' }
        ]
      },
      architecture: {
        title: 'Architecture',
        overview: {
          title: 'Architecture Overview',
          url: '/architecture/overview/system-overview'
        },
        links: [
          { title: 'System Overview', url: '/architecture/overview/system-overview', icon: '🏗️' },
          { title: 'Architecture Decisions', url: '/architecture/decisions/', icon: '📋' },
          { title: 'C4 Models', url: '/architecture/diagrams/c4-models/', icon: '📊' },
          { title: 'Patterns', url: '/architecture/patterns/', icon: '🔧' }
        ],
        related: [
          { title: 'API Design', url: '/api/guides/', icon: '🔌' },
          { title: 'Development', url: '/development/', icon: '💻' },
          { title: 'Operations', url: '/operations/', icon: '🔧' }
        ]
      },
      api: {
        title: 'API & Integration',
        overview: {
          title: 'API Overview',
          url: '/api/'
        },
        links: [
          { title: 'API Design Principles', url: '/api/guides/api-design-principles', icon: '📋' },
          { title: 'OpenAPI Specs', url: '/api/specifications/openapi/', icon: '📄' },
          { title: 'Authentication', url: '/api/guides/authorization', icon: '🔐' },
          { title: 'Testing', url: '/api/testing/', icon: '🧪' }
        ],
        related: [
          { title: 'Architecture', url: '/architecture/', icon: '🏗️' },
          { title: 'Development', url: '/development/', icon: '💻' },
          { title: 'Security', url: '/development/guidelines/security-best-practices', icon: '🛡️' }
        ]
      },
      development: {
        title: 'Development',
        overview: {
          title: 'Development Overview',
          url: '/development/'
        },
        links: [
          { title: 'Coding Standards', url: '/development/guidelines/coding-standards', icon: '📋' },
          { title: 'Setup Guide', url: '/development/setup/', icon: '⚙️' },
          { title: 'Testing Guidelines', url: '/development/guidelines/testing-guidelines', icon: '🧪' },
          { title: 'Security', url: '/development/guidelines/security-best-practices', icon: '🛡️' }
        ],
        related: [
          { title: 'Architecture', url: '/architecture/', icon: '🏗️' },
          { title: 'API Design', url: '/api/guides/', icon: '🔌' },
          { title: 'Operations', url: '/operations/', icon: '🔧' }
        ]
      },
      knowledge: {
        title: 'Knowledge Base',
        overview: {
          title: 'Knowledge Overview',
          url: '/knowledge/'
        },
        links: [
          { title: 'Core Concepts', url: '/knowledge/concepts/', icon: '🧠' },
          { title: 'Tutorials', url: '/knowledge/tutorials/', icon: '📚' },
          { title: 'References', url: '/knowledge/references/', icon: '📖' }
        ],
        related: [
          { title: 'Architecture', url: '/architecture/', icon: '🏗️' },
          { title: 'Development', url: '/development/', icon: '💻' },
          { title: 'API Design', url: '/api/guides/', icon: '🔌' }
        ]
      },
      operations: {
        title: 'Operations',
        overview: {
          title: 'Operations Overview',
          url: '/operations/'
        },
        links: [
          { title: 'Runbooks', url: '/operations/runbooks/', icon: '📋' },
          { title: 'Monitoring', url: '/operations/monitoring/', icon: '📊' },
          { title: 'Troubleshooting', url: '/operations/troubleshooting/', icon: '🔧' }
        ],
        related: [
          { title: 'Architecture', url: '/architecture/', icon: '🏗️' },
          { title: 'Development', url: '/development/', icon: '💻' },
          { title: 'Security', url: '/development/guidelines/security-best-practices', icon: '🛡️' }
        ]
      },
      business: {
        title: 'Business',
        overview: {
          title: 'Business Overview',
          url: '/business/'
        },
        links: [
          { title: 'Requirements', url: '/business/requirements/', icon: '📋' },
          { title: 'User Stories', url: '/business/user-stories/', icon: '👥' },
          { title: 'Workflows', url: '/business/workflows/', icon: '🔄' }
        ],
        related: [
          { title: 'Architecture', url: '/architecture/', icon: '🏗️' },
          { title: 'Development', url: '/development/', icon: '💻' },
          { title: 'Operations', url: '/operations/', icon: '🔧' }
        ]
      }
    };
  }

  /**
   * Highlight active links in the sidebar
   */
  highlightActiveLinks() {
    const links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(link => {
      if (this.currentPath.includes(link.getAttribute('href'))) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Setup mobile navigation toggle
   */
  setupMobileNavigation() {
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-nav-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.style.cssText = `
      display: none;
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem;
      font-size: 1.2rem;
      cursor: pointer;
    `;

    if (window.innerWidth <= 768) {
      document.body.appendChild(mobileToggle);
      mobileToggle.addEventListener('click', () => {
        this.sidebarContainer.classList.toggle('mobile-open');
      });
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        if (!document.querySelector('.mobile-nav-toggle')) {
          document.body.appendChild(mobileToggle);
        }
      } else {
        if (document.querySelector('.mobile-nav-toggle')) {
          document.querySelector('.mobile-nav-toggle').remove();
        }
        this.sidebarContainer.classList.remove('mobile-open');
      }
    });
  }

  /**
   * Setup breadcrumb navigation
   */
  setupBreadcrumbs() {
    const breadcrumbContainer = document.querySelector('.breadcrumb');
    if (!breadcrumbContainer) return;

    const pathParts = this.currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ title: 'Home', url: '/' }];

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const title = this.formatBreadcrumbTitle(part);
      breadcrumbs.push({ title, url: currentPath });
    });

    const breadcrumbHTML = breadcrumbs.map((crumb, index) => {
      if (index === breadcrumbs.length - 1) {
        return `<li>${crumb.title}</li>`;
      }
      return `<li><a href="${crumb.url}">${crumb.title}</a></li>`;
    }).join('');

    breadcrumbContainer.innerHTML = breadcrumbHTML;
  }

  /**
   * Format breadcrumb titles
   */
  formatBreadcrumbTitle(part) {
    return part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

/**
 * Initialize navigation when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  new DocumentationNavigation();
});

/**
 * Handle navigation state changes
 */
window.addEventListener('popstate', () => {
  new DocumentationNavigation();
});

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DocumentationNavigation;
}
