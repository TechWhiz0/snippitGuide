let allCards = [];
let activeFilters = new Set();

document.addEventListener('DOMContentLoaded', async () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  updateNavigation(isLoggedIn);
  await loadCards();
  
  // Add search input event listener
  document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
});

function updateNavigation(isLoggedIn) {
  const navbarNav = document.getElementById('navbarNav');
  if (isLoggedIn) {
    navbarNav.innerHTML = `
      <ul class="navbar-nav">
        <li class="nav-item me-3">
          <a href="/add-course.html" class="btn btn-outline-dark">Add Course</a>
        </li>
        <li class="nav-item">
          <button onclick="handleLogout()" class="btn btn-dark">Logout</button>
        </li>
      </ul>
    `;
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function loadCards() {
  try {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
      const response = await fetch('/api/cards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      allCards = await response.json();
    } else {
      allCards = [
        {
          title: 'Node.js',
          description: "JavaScript runtime built on Chrome's V8 JavaScript engine",
          tags: ['Web Development', 'Backend'],
        },
        {
          title: 'React',
          description: 'A JavaScript library for building user interfaces',
          tags: ['Web Development', 'Frontend'],
        },
        {
          title: 'Next.js',
          description: 'The React Framework for Production',
          tags: ['Web Development', 'Frontend', 'SSR'],
        },
        {
          title: 'TypeScript',
          description: 'Typed JavaScript at Any Scale',
          tags: ['Web Development', 'Programming Language'],
        },
      ];
    }

    // Extract unique tags and create filter buttons
    const uniqueTags = new Set(allCards.flatMap(card => card.tags));
    const tagFiltersContainer = document.getElementById('tagFilters');
    tagFiltersContainer.innerHTML = Array.from(uniqueTags)
      .map(tag => `
        <span class="badge badge-custom" onclick="toggleFilter('${tag}')">${tag}</span>
      `).join('');

    renderCards(allCards);
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to load courses');
  }
}

function toggleFilter(tag) {
  const tagElement = Array.from(document.getElementById('tagFilters').children)
    .find(el => el.textContent.trim() === tag);
    
  if (activeFilters.has(tag)) {
    activeFilters.delete(tag);
    tagElement.classList.remove('active');
  } else {
    activeFilters.add(tag);
    tagElement.classList.add('active');
  }
  
  filterAndRenderCards();
}

function handleSearch() {
  filterAndRenderCards();
}

function filterAndRenderCards() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  let filteredCards = allCards;
  
  // Apply search filter
  if (searchTerm) {
    filteredCards = filteredCards.filter(card => 
      card.title.toLowerCase().includes(searchTerm) ||
      card.description.toLowerCase().includes(searchTerm) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply tag filters
  if (activeFilters.size > 0) {
    filteredCards = filteredCards.filter(card =>
      card.tags.some(tag => activeFilters.has(tag))
    );
  }
  
  renderCards(filteredCards);
}

function renderCards(cards) {
  const cardContainer = document.getElementById('cardContainer');
  const noResults = document.getElementById('noResults');
  
  if (cards.length === 0) {
    cardContainer.innerHTML = '';
    noResults.classList.remove('d-none');
    return;
  }
  
  noResults.classList.add('d-none');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  cardContainer.innerHTML = cards.map(card => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${card.title}</h5>
          <p class="card-text">${card.description}</p>
          <div class="mb-3">
            ${card.tags.map(tag => `
              <span class="badge badge-custom me-1" onclick="toggleFilter('${tag}')">${tag}</span>
            `).join('')}
          </div>
          ${isLoggedIn ? 
            `<a href="/course/${card._id}" class="learn-more mt-3">View Details <span>&rarr;</span></a>` : 
            `<a href="/login.html" class="learn-more mt-3">Login to view details <span>&rarr;</span></a>`}
        </div>
      </div>
    </div>
  `).join('');
}

async function handleLogout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Ensures cookies are included in the request
    });

    if (response.ok) {
      // Clear any local storage or session items
      localStorage.removeItem('isLoggedIn');
      alert('Logged out successfully!');

      // Redirect to login page or homepage
      window.location.href = '/login';
    } else {
      // Extract error message if available
      const errorData = await response.json();
      alert(`Logout failed: ${errorData.message || 'Please try again.'}`);
    }
  } catch (error) {
    console.error('Error during logout:', error);
    alert('An unexpected error occurred during logout. Please try again.');
  }
}
