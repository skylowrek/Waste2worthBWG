/**
 * ============================================
 * WASTE2WORTH - MAIN APPLICATION JAVASCRIPT
 * ============================================
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
  currentView: 'producer', // 'producer' or 'buyer'
  user: {
    id: 'user123',
    name: 'John Doe',
    email: 'john@waste2worth.com',
    type: 'producer',
    avatar: 'JD'
  },
  wasteStreams: [],
  sourcingProfiles: [],
  listings: [],
  offers: [],
  negotiations: [],
  alerts: [],
  transferNotes: [],
  stats: {
    totalRevenue: 0,
    activeListingsCount: 0,
    pendingOffersCount: 0,
    wasteDiverted: 0,
    co2Savings: 0,
    totalPurchased: 0,
    virginMaterialReplaced: 0,
    co2Impact: 0,
    totalSpent: 0,
    activeBidsCount: 0,
    materialsSourced: 0
  }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌱 Waste2Worth Platform Initializing...');
  initializeEventListeners();
  loadMockData();
  renderProducerView();
  updateStats();
  console.log('✅ Waste2Worth Platform Ready!');
});

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
  // View Switching
  const switchBtn = document.getElementById('switchViewBtn');
  if (switchBtn) {
    switchBtn.addEventListener('click', switchView);
  }

  // Producer Actions
  const wasteStreamBtn = document.getElementById('openWasteStreamModal');
  if (wasteStreamBtn) {
    wasteStreamBtn.addEventListener('click', () => openModal('wasteStream'));
  }

  const createListingBtn = document.getElementById('createListingBtn');
  if (createListingBtn) {
    createListingBtn.addEventListener('click', () => openModal('createListing'));
  }

  const viewComplianceBtn = document.getElementById('viewComplianceBtn');
  if (viewComplianceBtn) {
    viewComplianceBtn.addEventListener('click', scrollToCompliance);
  }

  // Buyer Actions
  const sourcingProfileBtn = document.getElementById('openSourcingProfileModal');
  if (sourcingProfileBtn) {
    sourcingProfileBtn.addEventListener('click', () => openModal('sourcingProfile'));
  }

  const createAlertBtn = document.getElementById('createAlertBtn');
  if (createAlertBtn) {
    createAlertBtn.addEventListener('click', () => openModal('createAlert'));
  }

  const viewNegotiationsBtn = document.getElementById('viewNegotiationsBtn');
  if (viewNegotiationsBtn) {
    viewNegotiationsBtn.addEventListener('click', scrollToNegotiations);
  }

  // Filters
  const searchInput = document.getElementById('searchMaterials');
  if (searchInput) {
    searchInput.addEventListener('input', filterListings);
  }

  const categoryFilter = document.getElementById('filterCategory');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterListings);
  }

  const proximityFilter = document.getElementById('filterProximity');
  if (proximityFilter) {
    proximityFilter.addEventListener('change', filterListings);
  }

  const priceFilter = document.getElementById('filterPrice');
  if (priceFilter) {
    priceFilter.addEventListener('change', filterListings);
  }

  // Filter chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
      e.target.classList.add('chip--active');
      filterProducerListings(e.target.dataset.filter);
    });
  });
}

// ============================================
// VIEW SWITCHING
// ============================================

function switchView() {
  const btn = document.getElementById('switchViewBtn');
  const producerView = document.getElementById('producerView');
  const buyerView = document.getElementById('buyerView');

  if (AppState.currentView === 'producer') {
    AppState.currentView = 'buyer';
    producerView.classList.remove('active');
    buyerView.classList.add('active');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M16 9H2M2 9L6 5M2 9L6 13" stroke="currentColor" stroke-width="2"/>
      </svg>
      Switch to Seller
    `;
    renderBuyerView();
    console.log('🛒 Switched to Buyer View');
  } else {
    AppState.currentView = 'producer';
    buyerView.classList.remove('active');
    producerView.classList.add('active');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 9H16M16 9L12 5M16 9L12 13" stroke="currentColor" stroke-width="2"/>
      </svg>
      Switch to Buyer
    `;
    renderProducerView();
    console.log('📦 Switched to Producer View');
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// SCROLL HELPERS
// ============================================

function scrollToCompliance() {
  const complianceSection = document.querySelector('#producerView .section:last-child');
  if (complianceSection) {
    complianceSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function scrollToNegotiations() {
  const negotiationsSection = document.querySelector('#buyerView .negotiations-container').parentElement;
  if (negotiationsSection) {
    negotiationsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============================================
// MODAL SYSTEM
// ============================================

function openModal(type) {
  const modalContainer = document.getElementById('modalContainer');
  let modalContent = '';

  switch(type) {
    case 'wasteStream':
      modalContent = createWasteStreamModal();
      break;
    case 'createListing':
      modalContent = createListingModal();
      break;
    case 'sourcingProfile':
      modalContent = createSourcingProfileModal();
      break;
    case 'createAlert':
      modalContent = createAlertModal();
      break;
    case 'negotiation':
      modalContent = createNegotiationModal();
      break;
    case 'payment':
      modalContent = createPaymentModal();
      break;
  }

  modalContainer.innerHTML = modalContent;
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  // Close modal listeners
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });
  }
  
  const closeBtn = document.querySelector('.modal__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // ESC key to close
  document.addEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
}

function closeModal() {
  const modalContainer = document.getElementById('modalContainer');
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleEscKey);
}

// ============================================
// MODAL TEMPLATES
// ============================================

function createWasteStreamModal() {
  return `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">Define Waste Stream</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <p style="margin-bottom: 24px; color: var(--color-text-secondary);">
            Set up your typical waste materials for automated tracking and matching.
          </p>
          <form id="wasteStreamForm">
            <div class="form-group">
              <label class="form-label">Material Type *</label>
              <select class="form-control" name="materialType" required>
                <option value="">Select material type</option>
                <option value="Wood Offcuts">Wood Offcuts</option>
                <option value="Plastic Waste">Plastic Waste</option>
                <option value="Metal Scrap">Metal Scrap</option>
                <option value="Organic Waste">Organic Waste</option>
                <option value="Cardboard">Cardboard</option>
                <option value="Glass">Glass</option>
                <option value="Textile">Textile</option>
                <option value="E-Waste">E-Waste</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Volume Range (kg/week) *</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <input type="number" class="form-control" name="minVolume" placeholder="Minimum" required min="0">
                <input type="number" class="form-control" name="maxVolume" placeholder="Maximum" required min="1">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Generation Frequency *</label>
              <select class="form-control" name="frequency" required>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Quality Grade</label>
              <select class="form-control" name="quality">
                <option value="A">Grade A - Clean, unmixed</option>
                <option value="B">Grade B - Minor contamination</option>
                <option value="C">Grade C - Mixed materials</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Additional Details</label>
              <textarea class="form-control" name="description" rows="3" placeholder="Any specific details about this waste stream..."></textarea>
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn--primary" onclick="submitWasteStream()">Save Waste Stream</button>
        </div>
      </div>
    </div>
  `;
}

function createListingModal() {
  return `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">Create Marketplace Listing</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <p style="margin-bottom: 24px; color: var(--color-text-secondary);">
            List your waste materials to connect with potential buyers.
          </p>
          <form id="listingForm">
            <div class="form-group">
              <label class="form-label">Material Type *</label>
              <select class="form-control" name="material" required>
                <option value="">Select material</option>
                <option value="Wood Offcuts">Wood Offcuts</option>
                <option value="Plastic Waste">Plastic Waste</option>
                <option value="Metal Scrap">Metal Scrap</option>
                <option value="Organic Waste">Organic Waste</option>
                <option value="Cardboard">Cardboard</option>
                <option value="Glass">Glass</option>
                <option value="Textile">Textile</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Available Quantity (kg) *</label>
              <input type="number" class="form-control" name="quantity" placeholder="e.g., 500" required min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Price per kg (₹) *</label>
              <input type="number" class="form-control" name="price" step="0.01" placeholder="Enter negative for disposal fee" required>
              <small style="color: var(--color-text-secondary); font-size: 12px; margin-top: 4px; display: block;">
                Tip: Use negative values for disposal fees (e.g., -5 means you pay ₹5/kg for disposal)
              </small>
            </div>
            <div class="form-group">
              <label class="form-label">Location *</label>
              <input type="text" class="form-control" name="location" placeholder="City, State" required>
            </div>
            <div class="form-group">
              <label class="form-label">Quality Grade *</label>
              <select class="form-control" name="quality" required>
                <option value="A">Grade A - Clean, unmixed</option>
                <option value="B">Grade B - Minor contamination</option>
                <option value="C">Grade C - Mixed materials</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" name="description" rows="3" placeholder="Provide details about the material condition, packaging, etc."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Available From</label>
              <input type="date" class="form-control" name="availableFrom">
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn--primary" onclick="submitListing()">Publish Listing</button>
        </div>
      </div>
    </div>
  `;
}

function createSourcingProfileModal() {
  return `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">Define Material Sourcing Profile</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <p style="margin-bottom: 24px; color: var(--color-text-secondary);">
            Set your material requirements to get matched with suitable suppliers.
          </p>
          <form id="sourcingProfileForm">
            <div class="form-group">
              <label class="form-label">Material Type *</label>
              <select class="form-control" name="materialType" required>
                <option value="">Select material type</option>
                <option value="Cardboard">Cardboard (Clean)</option>
                <option value="Organic Waste">Organic Waste (Biogas Feedstock)</option>
                <option value="Plastic Type 3">Plastic (Type 3)</option>
                <option value="Metal Scrap">Metal Scrap</option>
                <option value="Wood">Wood</option>
                <option value="Glass">Glass</option>
                <option value="Textile">Textile</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Minimum Volume Required (kg/week) *</label>
              <input type="number" class="form-control" name="minVolume" placeholder="e.g., 500" required min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Maximum Price (₹/kg) *</label>
              <input type="number" class="form-control" name="maxPrice" step="0.01" placeholder="e.g., 15.00" required min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Quality Requirements *</label>
              <select class="form-control" name="quality" required>
                <option value="A">Grade A Only - Clean, unmixed</option>
                <option value="B">Grade B+ - Minor contamination acceptable</option>
                <option value="C">Any Grade - Will accept mixed materials</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Maximum Distance (km) *</label>
              <input type="number" class="form-control" name="maxDistance" placeholder="e.g., 50" required min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Special Requirements</label>
              <textarea class="form-control" name="specialRequirements" rows="3" placeholder="Any specific requirements (packaging, certifications, etc.)"></textarea>
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn--primary" onclick="submitSourcingProfile()">Save Profile</button>
        </div>
      </div>
    </div>
  `;
}

function createAlertModal() {
  return `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">Create Custom Alert</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <p style="margin-bottom: 24px; color: var(--color-text-secondary);">
            Get notified when new listings match your criteria.
          </p>
          <form id="alertForm">
            <div class="form-group">
              <label class="form-label">Alert Name *</label>
              <input type="text" class="form-control" name="alertName" placeholder="e.g., High-Quality Cardboard Alert" required>
            </div>
            <div class="form-group">
              <label class="form-label">Material Type</label>
              <select class="form-control" name="material">
                <option value="">All Materials</option>
                <option value="Cardboard">Cardboard</option>
                <option value="Plastic">Plastic</option>
                <option value="Metal">Metal</option>
                <option value="Organic">Organic</option>
                <option value="Wood">Wood</option>
                <option value="Glass">Glass</option>
                <option value="Textile">Textile</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Minimum Quantity (kg)</label>
              <input type="number" class="form-control" name="minQuantity" placeholder="Leave empty for any quantity" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Maximum Distance (km)</label>
              <input type="number" class="form-control" name="maxDistance" placeholder="Leave empty for any distance" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Maximum Price (₹/kg)</label>
              <input type="number" class="form-control" name="maxPrice" step="0.01" placeholder="Leave empty for any price" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Quality Grade</label>
              <select class="form-control" name="qualityGrade">
                <option value="">Any Grade</option>
                <option value="A">Grade A Only</option>
                <option value="B">Grade B or Better</option>
                <option value="C">Any Grade</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Notification Method *</label>
              <select class="form-control" name="notification" required>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Email & SMS</option>
                <option value="app">In-App Only</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn--primary" onclick="submitAlert()">Create Alert</button>
        </div>
      </div>
    </div>
  `;
}

function createPaymentModal() {
  return `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">Secure Payment</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <div id="paymentReactRoot"></div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// FORM SUBMISSIONS
// ============================================

function submitWasteStream() {
  const form = document.getElementById('wasteStreamForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  const wasteStream = {
    id: Date.now(),
    ...data,
    createdAt: new Date().toISOString()
  };
  
  AppState.wasteStreams.push(wasteStream);
  renderWasteStreams();
  closeModal();
  
  showNotification('✅ Waste stream defined successfully!', 'success');
  console.log('✅ New waste stream added:', wasteStream);
}

function submitListing() {
  const form = document.getElementById('listingForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  const listing = {
    id: Date.now(),
    sellerId: AppState.user.id,
    sellerName: AppState.user.name,
    ...data,
    status: 'active',
    createdAt: new Date().toISOString(),
    views: 0,
    offers: 0
  };
  
  AppState.listings.push(listing);
  AppState.stats.activeListingsCount++;
  
  renderProducerListings();
  updateStats();
  closeModal();
  
  showNotification('✅ Listing published successfully!', 'success');
  console.log('✅ New listing created:', listing);
}

function submitSourcingProfile() {
  const form = document.getElementById('sourcingProfileForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  const profile = {
    id: Date.now(),
    ...data,
    createdAt: new Date().toISOString()
  };
  
  AppState.sourcingProfiles.push(profile);
  renderSourcingProfiles();
  closeModal();
  
  showNotification('✅ Sourcing profile saved successfully!', 'success');
  console.log('✅ New sourcing profile added:', profile);
}

function submitAlert() {
  const form = document.getElementById('alertForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  const alert = {
    id: Date.now(),
    ...data,
    active: true,
    matchCount: 0,
    createdAt: new Date().toISOString()
  };
  
  AppState.alerts.push(alert);
  renderAlerts();
  closeModal();
  
  showNotification('✅ Alert created successfully!', 'success');
  console.log('✅ New alert created:', alert);
}

// ============================================
// RENDER FUNCTIONS - PRODUCER VIEW
// ============================================

function renderProducerView() {
  renderWasteStreams();
  renderProducerListings();
  renderOffers();
  renderTransferNotes();
  updateProducerStats();
}

function renderWasteStreams() {
  const container = document.getElementById('wasteStreamsList');
  if (!container) return;
  
  if (AppState.wasteStreams.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom: 16px; opacity: 0.5;">
          <rect x="16" y="20" width="32" height="28" rx="4" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M24 12V20M40 12V20" stroke="currentColor" stroke-width="2"/>
        </svg>
        <p style="font-size: 16px; margin-bottom: 8px;">No waste streams defined yet</p>
        <p style="font-size: 14px;">Click "Define Waste Stream" to get started</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = AppState.wasteStreams.map(stream => `
    <div class="waste-stream-item">
      <div class="waste-stream-item__title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="display: inline; margin-right: 8px;">
          <path d="M8 2L12 6L8 10L4 6L8 2Z" fill="var(--color-primary)"/>
        </svg>
        ${stream.materialType}
      </div>
      <div class="waste-stream-item__details">
        📊 ${stream.minVolume}-${stream.maxVolume} kg/week • 📅 ${stream.frequency} • ⭐ Grade ${stream.quality || 'Not specified'}
      </div>
      ${stream.description ? `<div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 8px;">${stream.description}</div>` : ''}
    </div>
  `).join('');
}

function renderProducerListings() {
  const container = document.getElementById('producerListings');
  if (!container) return;
  
  const userListings = AppState.listings.filter(l => l.sellerId === AppState.user.id);
  
  if (userListings.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--color-text-secondary); grid-column: 1/-1;">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin-bottom: 16px; opacity: 0.5;">
          <rect x="20" y="25" width="40" height="35" rx="4" stroke="currentColor" stroke-width="2.5" fill="none"/>
          <path d="M30 15V25M50 15V25" stroke="currentColor" stroke-width="2.5"/>
          <path d="M35 40H45M35 50H45" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <p style="font-size: 18px; margin-bottom: 8px; font-weight: 500;">No active listings</p>
        <p style="font-size: 14px; margin-bottom: 24px;">Create your first listing to start connecting with buyers</p>
        <button class="btn btn--primary" onclick="document.getElementById('createListingBtn').click()">Create First Listing</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userListings.map(listing => `
    <div class="listing-card">
      <div class="listing-card__image">
        ${listing.material.charAt(0).toUpperCase()}
        <div class="listing-card__badge">Grade ${listing.quality}</div>
      </div>
      <div class="listing-card__content">
        <h3 class="listing-card__title">${listing.material}</h3>
        <div class="listing-card__meta">
          <div class="listing-card__meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            ${listing.quantity} kg available
          </div>
          <div class="listing-card__meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C5 2 3 4.5 3 6.5C3 9 8 14 8 14C8 14 13 9 13 6.5C13 4.5 11 2 8 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            ${listing.location}
          </div>
          <div class="listing-card__meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            ${listing.views || 0} views
          </div>
        </div>
        ${listing.description ? `<p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px; line-height: 1.5;">${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>` : ''}
        <div class="listing-card__price">
          ${listing.price >= 0 ? '₹' + listing.price : '₹' + Math.abs(listing.price) + ' disposal fee'}/kg
        </div>
        <span class="status status--${listing.status}">${listing.status}</span>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button class="btn btn--sm btn--outline" onclick="editListing(${listing.id})">Edit</button>
          <button class="btn btn--sm btn--outline" onclick="deleteListing(${listing.id})" style="color: var(--color-error);">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderOffers() {
  const tbody = document.getElementById('offersTable');
  if (!tbody) return;
  
  if (AppState.offers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-bottom: 12px; opacity: 0.5;">
            <rect x="10" y="14" width="28" height="22" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          <div>No offers received yet</div>
          <div style="font-size: 13px; margin-top: 8px;">Offers will appear here when buyers are interested in your listings</div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = AppState.offers.map(offer => `
    <tr>
      <td style="font-weight: 500;">${offer.material}</td>
      <td>${offer.buyerName}</td>
      <td style="color: var(--color-primary); font-weight: 600;">₹${offer.amount.toLocaleString()}</td>
      <td>${offer.volume} kg</td>
      <td><span class="status status--${offer.status}">${offer.status}</span></td>
      <td>
        ${offer.status === 'pending' ? `
          <div style="display: flex; gap: 8px;">
            <button class="btn btn--sm btn--success" onclick="acceptOffer(${offer.id})">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5 10L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Accept
            </button>
            <button class="btn btn--sm btn--outline" onclick="negotiateOffer(${offer.id})">Negotiate</button>
          </div>
        ` : offer.status === 'accepted' ? 
          '<span style="color: var(--color-success); font-weight: 500;">✓ Accepted</span>' : 
          '<span style="color: var(--color-text-secondary);">—</span>'}
      </td>
    </tr>
  `).join('');
}

function renderTransferNotes() {
  const container = document.getElementById('transferNotesList');
  if (!container) return;
  
  if (AppState.transferNotes.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px 20px; color: var(--color-text-secondary);">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-bottom: 12px; opacity: 0.5;">
          <path d="M12 8L28 8C30 8 32 10 32 12V36C32 38 30 40 28 40H12C10 40 8 38 8 36V12C8 10 10 8 12 8Z" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M16 18H24M16 24H24M16 30H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p style="font-size: 14px;">No transfer notes yet</p>
        <p style="font-size: 12px; margin-top: 4px;">Transfer notes will be automatically generated when transactions are completed</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = AppState.transferNotes.map(note => `
    <div class="transfer-note">
      <div class="transfer-note__id">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="display: inline; margin-right: 6px;">
          <path d="M3 7L6 10L11 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Transfer Note #${note.id}
      </div>
      <div class="transfer-note__info">
        ${note.material} • ${note.quantity} kg • To: ${note.buyer}
      </div>
      <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 6px;">
        Generated: ${new Date(note.date).toLocaleDateString()}
      </div>
    </div>
  `).join('');
}

function updateProducerStats() {
  const wasteDiv = document.getElementById('wasteDiverted');
  const co2Sav = document.getElementById('co2Savings');
  
  if (wasteDiv) wasteDiv.textContent = AppState.stats.wasteDiverted.toFixed(1);
  if (co2Sav) co2Sav.textContent = AppState.stats.co2Savings.toLocaleString();
}

// ============================================
// RENDER FUNCTIONS - BUYER VIEW
// ============================================

function renderBuyerView() {
  renderSourcingProfiles();
  renderAlerts();
  renderBuyerListings();
  renderNegotiations();
  updateBuyerStats();
}

function renderSourcingProfiles() {
  const container = document.getElementById('sourcingProfileList');
  if (!container) return;
  
  if (AppState.sourcingProfiles.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom: 16px; opacity: 0.5;">
          <rect x="16" y="20" width="32" height="28" rx="4" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <p style="font-size: 16px; margin-bottom: 8px;">No sourcing profiles defined yet</p>
        <p style="font-size: 14px;">Define your material requirements to get matched with suppliers</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = AppState.sourcingProfiles.map(profile => `
    <div class="waste-stream-item">
      <div class="waste-stream-item__title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="display: inline; margin-right: 8px;">
          <path d="M8 2L12 6L8 10L4 6L8 2Z" fill="var(--color-primary)"/>
        </svg>
        ${profile.materialType}
      </div>
      <div class="waste-stream-item__details">
        📊 Min: ${profile.minVolume} kg/week • 💰 Max Price: ₹${profile.maxPrice}/kg • 📍 ${profile.maxDistance} km • ⭐ ${profile.quality}
      </div>
      ${profile.specialRequirements ? `<div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 8px;">${profile.specialRequirements}</div>` : ''}
    </div>
  `).join('');
}

function renderAlerts() {
  const container = document.getElementById('alertsList');
  const countBadge = document.getElementById('alertsCount');
  if (!container) return;
  
  const activeAlerts = AppState.alerts.filter(a => a.active);
  
  if (countBadge) {
    countBadge.textContent = `${activeAlerts.length} Active`;
  }
  
  if (activeAlerts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom: 16px; opacity: 0.5;">
          <path d="M32 12C22 12 16 18 16 22C16 28 32 42 32 42C32 42 48 28 48 22C48 18 42 12 32 12Z" stroke="currentColor" stroke-width="2.5" fill="none"/>
        </svg>
        <p style="font-size: 16px; margin-bottom: 8px;">No alerts configured</p>
        <p style="font-size: 14px; margin-bottom: 24px;">Create alerts to get notified of matching listings</p>
        <button class="btn btn--primary" onclick="document.getElementById('createAlertBtn').click()">Create First Alert</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = activeAlerts.map(alert => `
    <div class="alert-card">
      <div class="alert-card__info">
        <div class="alert-card__title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="display: inline; margin-right: 8px;">
            <path d="M8 3C5 3 3 5.5 3 7C3 9.5 8 14 8 14C8 14 13 9.5 13 7C13 5.5 11 3 8 3Z" fill="var(--color-primary)"/>
          </svg>
          ${alert.alertName}
        </div>
        <div class="alert-card__details">
          ${alert.material || 'All materials'} 
          ${alert.minQuantity ? `• Min: ${alert.minQuantity} kg` : ''} 
          ${alert.maxDistance ? `• ${alert.maxDistance} km` : ''}
          ${alert.maxPrice ? `• Max ₹${alert.maxPrice}/kg` : ''}
        </div>
        <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 8px;">
          ${alert.matchCount || 0} matches • ${alert.notification}
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn--sm btn--outline" onclick="editAlert(${alert.id})">Edit</button>
        <button class="btn btn--sm btn--outline" onclick="deleteAlert(${alert.id})" style="color: var(--color-error);">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderBuyerListings() {
  const container = document.getElementById('buyerListings');
  if (!container) return;
  
  const availableListings = AppState.listings.filter(l => l.sellerId !== AppState.user.id && l.status === 'active');
  
  if (availableListings.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--color-text-secondary); grid-column: 1/-1;">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin-bottom: 16px; opacity: 0.5;">
          <circle cx="35" cy="35" r="20" stroke="currentColor" stroke-width="2.5" fill="none"/>
          <path d="M50 50L65 65" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <p style="font-size: 18px; margin-bottom: 8px; font-weight: 500;">No listings found</p>
        <p style="font-size: 14px;">Try adjusting your filters or check back later for new listings</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = availableListings.map(listing => `
    <div class="listing-card">
      <div class="listing-card__image">
        ${listing.material.charAt(0).toUpperCase()}
        <div class="listing-card__badge">Grade ${listing.quality}</div>
      </div>
      <div class="listing-card__content">
        <h3 class="listing-card__title">${listing.material}</h3>
        <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 12px;">
          By ${listing.sellerName}
        </div>
        <div class="listing-card__meta">
          <div class="listing-card__meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            ${listing.quantity} kg available
          </div>
          <div class="listing-card__meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C5 2 3 4.5 3 6.5C3 9 8 14 8 14C8 14 13 9 13 6.5C13 4.5 11 2 8 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            ${listing.location}
          </div>
          <div class="listing-card__meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            Listed ${getTimeAgo(listing.createdAt)}
          </div>
        </div>
        ${listing.description ? `<p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px; line-height: 1.5;">${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>` : ''}
        <div class="listing-card__price">
          ${listing.price >= 0 ? '₹' + listing.price : '₹' + Math.abs(listing.price) + ' disposal fee'}/kg
        </div>
        <div class="listing-card__actions">
          <button class="btn btn--primary btn--sm" onclick="makeOffer(${listing.id})">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" stroke-width="2"/>
            </svg>
            Make Offer
          </button>
          <button class="btn btn--outline btn--sm" onclick="startNegotiation(${listing.id})">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="4" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            Chat
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderNegotiations() {
  const container = document.getElementById('negotiationsList');
  const countBadge = document.getElementById('negotiationsCount');
  if (!container) return;
  
  const activeNegotiations = AppState.negotiations.filter(n => n.status === 'active');
  
  if (countBadge) {
    countBadge.textContent = `${activeNegotiations.length} Active`;
  }
  
  if (activeNegotiations.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom: 16px; opacity: 0.5;">
          <rect x="16" y="22" width="32" height="24" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M24 30H40M24 38H36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p style="font-size: 16px; margin-bottom: 8px;">No active negotiations</p>
        <p style="font-size: 14px;">Start negotiating on listings you're interested in</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = activeNegotiations.map(negotiation => `
    <div class="negotiation-card">
      <div class="negotiation-card__header">
        <div>
          <div class="negotiation-card__title">${negotiation.material}</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            With ${negotiation.sellerName}
          </div>
        </div>
        <span class="status status--pending">${negotiation.status}</span>
      </div>
      <div class="negotiation-card__messages">
        ${negotiation.messages.map((msg, idx) => `
          <div class="message">
            <div class="message__sender">${msg.sender}</div>
            <div class="message__text">${msg.text}</div>
            <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 4px;">
              ${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <input 
          type="text" 
          class="form-control" 
          placeholder="Type your message..." 
          id="msg-${negotiation.id}"
          onkeypress="if(event.key === 'Enter') sendMessage(${negotiation.id})"
        >
        <button class="btn btn--primary" onclick="sendMessage(${negotiation.id})">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8L14 2L8 14L6 9L2 8Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

function updateBuyerStats() {
  const totalPurch = document.getElementById('totalPurchased');
  const virginMat = document.getElementById('virginMaterialReplaced');
  const co2Imp = document.getElementById('co2Impact');
  
  if (totalPurch) totalPurch.textContent = AppState.stats.totalPurchased.toFixed(1);
  if (virginMat) virginMat.textContent = AppState.stats.virginMaterialReplaced.toLocaleString();
  if (co2Imp) co2Imp.textContent = AppState.stats.co2Impact.toLocaleString();
}

// ============================================
// ACTION FUNCTIONS
// ============================================

function acceptOffer(offerId) {
  const offer = AppState.offers.find(o => o.id === offerId);
  if (!offer) return;
  
  offer.status = 'accepted';
  
  // Create transfer note
  AppState.transferNotes.push({
    id: Date.now(),
    material: offer.material,
    quantity: offer.volume,
    buyer: offer.buyerName,
    date: new Date().toISOString()
  });
  
  // Update stats
  const volumeInTons = offer.volume / 1000;
  AppState.stats.wasteDiverted += volumeInTons;
  AppState.stats.co2Savings += Math.round(offer.volume * 2.5);
  AppState.stats.totalRevenue += offer.amount;
  AppState.stats.pendingOffersCount = Math.max(0, AppState.stats.pendingOffersCount - 1);
  
  renderOffers();
  renderTransferNotes();
  updateStats();
  
  showNotification('✅ Offer accepted! Transfer note generated.', 'success');
  console.log('✅ Offer accepted:', offer);
}

function negotiateOffer(offerId) {
  const offer = AppState.offers.find(o => o.id === offerId);
  if (!offer) return;
  
  startNegotiation(offer.listingId, offer);
  showNotification('💬 Negotiation started', 'info');
}

function makeOffer(listingId) {
  const listing = AppState.listings.find(l => l.id === listingId);
  if (!listing) return;
  
  const amount = prompt(`Enter your offer for ${listing.material}:\n\nCurrent price: ₹${listing.price}/kg\nTotal for ${listing.quantity} kg: ₹${(listing.price * listing.quantity).toFixed(2)}\n\nYour offer amount (₹):`);
  
  if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
    const newOffer = {
      id: Date.now(),
      listingId: listing.id,
      material: listing.material,
      buyerName: AppState.user.name,
      amount: parseFloat(amount),
      volume: listing.quantity,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    AppState.offers.push(newOffer);
    AppState.stats.activeBidsCount++;
    
    updateStats();
    showNotification('✅ Offer submitted successfully!', 'success');
    console.log('✅ New offer submitted:', newOffer);
  }
}

function startNegotiation(listingId, existingOffer = null) {
  const listing = AppState.listings.find(l => l.id === listingId);
  if (!listing) return;
  
  const existing = AppState.negotiations.find(n => n.listingId === listingId);
  if (existing) {
    scrollToNegotiations();
    showNotification('💬 Negotiation already active', 'info');
    return;
  }
  
  const initialMessage = existingOffer ? 
    `Hi! I'd like to discuss my offer of ₹${existingOffer.amount} for your ${listing.material}.` :
    `Hi! I'm interested in your ${listing.material} listing. Can we discuss the terms?`;
  
  AppState.negotiations.push({
    id: Date.now(),
    listingId: listing.id,
    material: listing.material,
    sellerName: listing.sellerName,
    status: 'active',
    messages: [
      { 
        sender: 'You', 
        text: initialMessage,
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  });
  
  renderNegotiations();
  scrollToNegotiations();
  showNotification('✅ Negotiation started!', 'success');
}

function sendMessage(negotiationId) {
  const input = document.getElementById(`msg-${negotiationId}`);
  const negotiation = AppState.negotiations.find(n => n.id === negotiationId);
  
  if (!negotiation || !input || !input.value.trim()) return;
  
  negotiation.messages.push({
    sender: 'You',
    text: input.value.trim(),
    timestamp: new Date().toISOString()
  });
  
  input.value = '';
  renderNegotiations();
  
  // Simulate seller response (demo only)
  setTimeout(() => {
    const responses = [
      "Thank you for your interest! Let me check the availability.",
      "That sounds good. Can we discuss pickup arrangements?",
      "I appreciate your offer. Would you consider a slight adjustment?",
      "Great! Let's move forward with this deal."
    ];
    negotiation.messages.push({
      sender: negotiation.sellerName,
      text: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString()
    });
    renderNegotiations();
  }, 2000);
}

function deleteAlert(alertId) {
  if (!confirm('Are you sure you want to delete this alert?')) return;
  
  AppState.alerts = AppState.alerts.filter(a => a.id !== alertId);
  renderAlerts();
  showNotification('🗑️ Alert deleted', 'info');
}

function editAlert(alertId) {
  showNotification('⚠️ Edit functionality coming soon!', 'info');
}

function deleteListing(listingId) {
  if (!confirm('Are you sure you want to delete this listing?')) return;
  
  AppState.listings = AppState.listings.filter(l => l.id !== listingId);
  AppState.stats.activeListingsCount = Math.max(0, AppState.stats.activeListingsCount - 1);
  
  renderProducerListings();
  updateStats();
  showNotification('🗑️ Listing deleted', 'info');
}

function editListing(listingId) {
  showNotification('⚠️ Edit functionality coming soon!', 'info');
}

// ============================================
// FILTER FUNCTIONS
// ============================================

function filterListings() {
  const search = document.getElementById('searchMaterials')?.value.toLowerCase() || '';
  const category = document.getElementById('filterCategory')?.value || '';
  const proximity = document.getElementById('filterProximity')?.value || '';
  const price = document.getElementById('filterPrice')?.value || '';
  
  console.log('🔍 Filtering:', { search, category, proximity, price });
  
  // Filter logic would be implemented here
  // For now, just re-render
  renderBuyerListings();
}

function filterProducerListings(filter) {
  console.log('🔍 Filter producer listings:', filter);
  // Filter logic would be implemented here
  renderProducerListings();
}

// ============================================
// STATS UPDATE
// ============================================

function updateStats() {
  // Producer stats
  const totalRev = document.getElementById('totalRevenue');
  const activeLis = document.getElementById('activeListingsCount');
  const pendOff = document.getElementById('pendingOffersCount');
  
  if (totalRev) totalRev.textContent = '₹' + AppState.stats.totalRevenue.toLocaleString();
  if (activeLis) activeLis.textContent = AppState.stats.activeListingsCount;
  if (pendOff) pendOff.textContent = AppState.stats.pendingOffersCount;
  
  // Buyer stats
  const totalSp = document.getElementById('totalSpent');
  const activeBids = document.getElementById('activeBidsCount');
  const matSourc = document.getElementById('materialsSourced');
  
  if (totalSp) totalSp.textContent = '₹' + AppState.stats.totalSpent.toLocaleString();
  if (activeBids) activeBids.textContent = AppState.stats.activeBidsCount;
  if (matSourc) matSourc.textContent = AppState.stats.materialsSourced;
  
  updateProducerStats();
  updateBuyerStats();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'info') {
  const colors = {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)'
  };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 24px;
    background: ${colors[type]};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    font-weight: 500;
    max-width: 400px;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hrs ago';
  return Math.floor(seconds / 86400) + ' days ago';
}

// ============================================
// MOCK DATA
// ============================================

function loadMockData() {
  console.log('📊 Loading mock data...');
  
  // Sample waste streams
  AppState.wasteStreams = [
    { 
      id: 1, 
      materialType: 'Wood Offcuts', 
      minVolume: 100, 
      maxVolume: 200, 
      frequency: 'Weekly',
      quality: 'A',
      description: 'Clean pine and oak offcuts from furniture manufacturing'
    },
    { 
      id: 2, 
      materialType: 'Cardboard', 
      minVolume: 50, 
      maxVolume: 100, 
      frequency: 'Daily',
      quality: 'B',
      description: 'Mixed cardboard from packaging operations'
    }
  ];
  
  // Sample listings
  AppState.listings = [
    {
      id: 1,
      sellerId: 'other1',
      sellerName: 'ABC Manufacturing',
      material: 'Cardboard',
      quantity: 500,
      price: 8.5,
      location: 'Mumbai, Maharashtra',
      quality: 'A',
      status: 'active',
      description: 'High-quality corrugated cardboard, clean and sorted. Perfect for recycling.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      views: 45
    },
    {
      id: 2,
      sellerId: 'other2',
      sellerName: 'XYZ Industries',
      material: 'Plastic Waste',
      quantity: 300,
      price: 12,
      location: 'Delhi, NCR',
      quality: 'B',
      status: 'active',
      description: 'Mixed plastic waste, Type 2 and Type 4 HDPE.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      views: 32
    },
    {
      id: 3,
      sellerId: AppState.user.id,
      sellerName: AppState.user.name,
      material: 'Wood Offcuts',
      quantity: 150,
      price: -5,
      location: 'Bangalore, Karnataka',
      quality: 'A',
      status: 'active',
      description: 'Clean wood offcuts from construction project. Mostly pine.',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      views: 28
    },
    {
      id: 4,
      sellerId: 'other3',
      sellerName: 'Green Solutions Ltd',
      material: 'Organic Waste',
      quantity: 800,
      price: -3,
      location: 'Pune, Maharashtra',
      quality: 'B',
      status: 'active',
      description: 'Organic waste suitable for biogas or composting. Daily generation.',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      views: 67
    },
    {
      id: 5,
      sellerId: 'other4',
      sellerName: 'Tech Metals Co',
      material: 'Metal Scrap',
      quantity: 250,
      price: 45,
      location: 'Chennai, Tamil Nadu',
      quality: 'A',
      status: 'active',
      description: 'Aluminum and copper scrap from electronics manufacturing.',
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      views: 89
    }
  ];
  
  // Sample offers
  AppState.offers = [
    {
      id: 1,
      listingId: 3,
      material: 'Wood Offcuts',
      buyerName: 'Green Recyclers',
      amount: 4500,
      volume: 150,
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      listingId: 3,
      material: 'Wood Offcuts',
      buyerName: 'EcoWood Solutions',
      amount: 5000,
      volume: 150,
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];
  
  // Sample sourcing profiles
  AppState.sourcingProfiles = [
    {
      id: 1,
      materialType: 'Cardboard',
      minVolume: 500,
      maxPrice: 10,
      quality: 'A',
      maxDistance: 50,
      specialRequirements: 'Must be clean and sorted by grade'
    }
  ];
  
  // Sample alerts
  AppState.alerts = [
    {
      id: 1,
      alertName: 'High-Quality Cardboard Alert',
      material: 'Cardboard',
      minQuantity: 400,
      maxDistance: 50,
      maxPrice: 10,
      qualityGrade: 'A',
      notification: 'email',
      active: true,
      matchCount: 3,
      createdAt: new Date().toISOString()
    }
  ];
  
  // Sample negotiations
  AppState.negotiations = [
    {
      id: 1,
      listingId: 1,
      material: 'Cardboard',
      sellerName: 'ABC Manufacturing',
      status: 'active',
      messages: [
        { sender: 'You', text: 'Hi! I\'m interested in your cardboard listing. Can we discuss bulk pricing?', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { sender: 'ABC Manufacturing', text: 'Hello! For bulk orders above 400kg, I can offer ₹8/kg.', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { sender: 'You', text: 'That works for me. What about pickup arrangements?', timestamp: new Date(Date.now() - 1800000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  
  // Sample transfer notes
  AppState.transferNotes = [
    {
      id: 100234,
      material: 'Cardboard',
      quantity: 450,
      buyer: 'Recycle Corp',
      date: new Date(Date.now() - 604800000).toISOString()
    }
  ];
  
  // Stats
  AppState.stats = {
    totalRevenue: 45250,
    activeListingsCount: AppState.listings.filter(l => l.sellerId === AppState.user.id).length,
    pendingOffersCount: AppState.offers.filter(o => o.status === 'pending').length,
    wasteDiverted: 2.5,
    co2Savings: 625,
    totalPurchased: 1.8,
    virginMaterialReplaced: 1650,
    co2Impact: 450,
    totalSpent: 32400,
    activeBidsCount: 3,
    materialsSourced: 5
  };
  
  console.log('✅ Mock data loaded successfully');
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('🌱 Waste2Worth App.js Loaded Successfully');
