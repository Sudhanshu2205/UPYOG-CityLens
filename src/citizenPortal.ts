// Citizen Services Portal Component for UPYOG Dashboard
// Implements:
// 1. Property Tax Calculator & Premium Simulated Checkout
// 2. Water Connection Step-by-Step Wizard & Live Pipeline Tracker
// 3. Public Grievance Redressal (PGR) reporting & Interactive Kanban Board
// 4. Document Vault & On-Demand High-Fidelity Printable Certificates (Birth, Death, Trade)

import { playClick, playTick, playSuccess, playWarning, playChime } from './soundEffects.ts';

// Model interface for a Grievance
interface Grievance {
  id: string;
  category: string;
  ulb: string;
  description: string;
  status: 'submitted' | 'assigned' | 'in-progress' | 'resolved';
  submittedAt: string;
  citizenName: string;
}

// Initial state
let grievances: Grievance[] = [
  {
    id: "GRV-84920",
    category: "Streetlight Malfunction",
    ulb: "Lucknow Municipal Corporation",
    description: "Sector 4 streetlights have been completely dark for three days, raising safety concerns.",
    status: "in-progress",
    submittedAt: "2 hours ago",
    citizenName: "Rakesh Sharma"
  },
  {
    id: "GRV-37411",
    category: "Garbage Pile Up",
    ulb: "Varanasi Municipal Corporation",
    description: "Piles of domestic refuse clogging the drain at Assi Ghat. Strong odour.",
    status: "assigned",
    submittedAt: "5 hours ago",
    citizenName: "Ananya Mishra"
  },
  {
    id: "GRV-10928",
    category: "Pothole Damage",
    ulb: "Kanpur Municipal Corporation",
    description: "Huge pothole at the main bypass intersection near NH-24. High accident risk.",
    status: "submitted",
    submittedAt: "10 mins ago",
    citizenName: "Vikram Malhotra"
  }
];

// Active Water Application state
interface WaterApplication {
  applicantName: string;
  aadhaar: string;
  ulb: string;
  useType: string;
  diameter: string;
  submittedAt: number;
}

let activeWaterApplication: WaterApplication | null = null;
let waterPipelineTimer: number | null = null;
let currentWaterPhase = 0;

export function renderCitizenPortal(container: HTMLElement) {
  container.innerHTML = `
    <div class="portal-grid">
      <!-- Portal Sub-Header Navigation -->
      <div class="portal-subnav glass">
        <button class="subnav-btn active" data-tab="tax"><span class="btn-icon">🪙</span>Property Tax</button>
        <button class="subnav-btn" data-tab="water"><span class="btn-icon">🚰</span>Water Connection</button>
        <button class="subnav-btn" data-tab="pgr"><span class="btn-icon">📢</span>Grievance PGR</button>
        <button class="subnav-btn" data-tab="vault"><span class="btn-icon">📜</span>Document Vault</button>
      </div>

      <!-- Tab Content Area -->
      <div class="portal-tab-content">
        <!-- RENDER CHOSEN TAB HERE -->
      </div>
    </div>
  `;

  // Bind Subnav Toggles
  const tabContent = container.querySelector('.portal-tab-content') as HTMLElement;
  const buttons = container.querySelectorAll('.subnav-btn');

  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => playTick());
    btn.addEventListener('click', () => {
      const selectedTab = btn.getAttribute('data-tab') || 'tax';
      
      // Update UI active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      playChime();
      switchTab(selectedTab, tabContent);
    });
  });

  // Default display
  switchTab('tax', tabContent);
}

function switchTab(tab: string, container: HTMLElement) {
  if (tab === 'tax') {
    renderPropertyTax(container);
  } else if (tab === 'water') {
    renderWaterConnection(container);
  } else if (tab === 'pgr') {
    renderPGR(container);
  } else if (tab === 'vault') {
    renderDocumentVault(container);
  }
}

// ==========================================
// 1. PROPERTY TAX ASSESSMENT & PAYMENT
// ==========================================
function renderPropertyTax(container: HTMLElement) {
  container.innerHTML = `
    <div class="tax-layout">
      <!-- Calculator Form -->
      <div class="tax-card form-side glass">
        <h3 class="gradient-text"><span class="section-badge">Calculator</span>Self-Assessment Property Tax</h3>
        <p class="section-desc">Assess your property tax instantly using the authorized UPYOG computing system guidelines. Select categories below to calculate your annual rate.</p>
        
        <form id="tax-form" class="dynamic-form">
          <div class="form-row">
            <div class="form-group">
              <label for="tax-ulb">Urban Local Body (ULB)</label>
              <select id="tax-ulb" required>
                <option value="Lucknow">Lucknow Municipal Corporation</option>
                <option value="Varanasi">Varanasi Municipal Corporation</option>
                <option value="Noida">Noida Authority</option>
                <option value="Kanpur">Kanpur Municipal Corporation</option>
              </select>
            </div>
            <div class="form-group">
              <label for="tax-zone">Municipal Valuation Zone</label>
              <select id="tax-zone" required>
                <option value="A">Zone A (Premium Core Area)</option>
                <option value="B">Zone B (Mid-town Residential)</option>
                <option value="C">Zone C (Suburban Outer Rim)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="tax-category">Property Usage Classification</label>
              <select id="tax-category" required>
                <option value="residential">Residential Unit (Self/Tenant)</option>
                <option value="commercial">Commercial Shop/Office</option>
                <option value="industrial">Industrial Complex / Warehouse</option>
              </select>
            </div>
            <div class="form-group">
              <label for="tax-occupancy">Occupancy Style</label>
              <select id="tax-occupancy" required>
                <option value="self">Self Occupied</option>
                <option value="rented">Rented out / Leasehold</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="tax-area">Total Built-Up Area (sq. ft.)</label>
              <input type="number" id="tax-area" value="1200" min="100" max="100000" required>
            </div>
            <div class="form-group">
              <label for="tax-floors">Number of Floors</label>
              <input type="number" id="tax-floors" value="1" min="1" max="10" required>
            </div>
          </div>
        </form>
      </div>

      <!-- Bill & Assessment Breakout Invoice -->
      <div class="tax-card receipt-side glass">
        <h3>Assessment Statement</h3>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="gov-title">UPYOG TAX AUDIT</div>
            <div id="invoice-id" class="invoice-num">UPY-2026-T88102</div>
          </div>
          <div class="divider"></div>
          
          <div class="invoice-details">
            <div class="invoice-line"><span>Annual Unit Value (AV)</span><span id="inv-av">₹0</span></div>
            <div class="invoice-line"><span>Base Property Tax (10% of AV)</span><span id="inv-base">₹0</span></div>
            <div class="invoice-line"><span>Water/Sanitation Cess (2%)</span><span id="inv-water">₹0</span></div>
            <div class="invoice-line"><span>Educational Cess (5% of Base)</span><span id="inv-edu">₹0</span></div>
            <div class="invoice-line discount"><span>Digital Direct Discount (10%)</span><span id="inv-disc">-₹0</span></div>
            <div class="divider"></div>
            <div class="invoice-line total"><span>Net Payable Amount</span><span id="inv-total" class="accent-orange">₹0</span></div>
          </div>
          
          <button id="pay-tax-btn" class="primary-btn pulse-glow">
            <span class="btn-icon">🔒</span>Pay Tax Securely
          </button>
        </div>
      </div>
    </div>

    <!-- Gorgeous Modal Container -->
    <div id="payment-modal" class="modal-backdrop hidden">
      <div class="modal-content glass animate-scale">
        <button id="modal-close" class="modal-close-btn">&times;</button>
        <div class="modal-body">
          <!-- Renders checkout steps -->
        </div>
      </div>
    </div>
  `;

  // Bind Form Calculations
  const areaInput = container.querySelector('#tax-area') as HTMLInputElement;
  const floorsInput = container.querySelector('#tax-floors') as HTMLInputElement;
  const zoneSelect = container.querySelector('#tax-zone') as HTMLSelectElement;
  const catSelect = container.querySelector('#tax-category') as HTMLSelectElement;
  const occSelect = container.querySelector('#tax-occupancy') as HTMLSelectElement;

  const invAV = container.querySelector('#inv-av') as HTMLElement;
  const invBase = container.querySelector('#inv-base') as HTMLElement;
  const invWater = container.querySelector('#inv-water') as HTMLElement;
  const invEdu = container.querySelector('#inv-edu') as HTMLElement;
  const invDisc = container.querySelector('#inv-disc') as HTMLElement;
  const invTotal = container.querySelector('#inv-total') as HTMLElement;
  const payBtn = container.querySelector('#pay-tax-btn') as HTMLButtonElement;

  let calculatedTotal = 0;

  const calculateTax = () => {
    const area = parseFloat(areaInput.value) || 0;
    const floors = parseInt(floorsInput.value) || 1;
    const zone = zoneSelect.value;
    const category = catSelect.value;
    const occupancy = occSelect.value;

    // Unit value factors depending on zone and category
    let unitRate = 1.25; // default base sqft value per month
    if (zone === 'A') unitRate *= 1.5;
    if (zone === 'C') unitRate *= 0.75;

    if (category === 'commercial') unitRate *= 2.5;
    if (category === 'industrial') unitRate *= 1.8;

    if (occupancy === 'rented') unitRate *= 1.2;

    // Math
    const annualValue = Math.round(area * floors * unitRate * 12);
    const baseTax = Math.round(annualValue * 0.10);
    const waterTax = Math.round(annualValue * 0.02);
    const eduCess = Math.round(baseTax * 0.05);
    const totalBeforeDiscount = baseTax + waterTax + eduCess;
    const discount = Math.round(totalBeforeDiscount * 0.10);
    const total = totalBeforeDiscount - discount;

    calculatedTotal = total;

    // Render outputs
    invAV.textContent = `₹${annualValue.toLocaleString('en-IN')}`;
    invBase.textContent = `₹${baseTax.toLocaleString('en-IN')}`;
    invWater.textContent = `₹${waterTax.toLocaleString('en-IN')}`;
    invEdu.textContent = `₹${eduCess.toLocaleString('en-IN')}`;
    invDisc.textContent = `-₹${discount.toLocaleString('en-IN')}`;
    invTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
  };

  // Event bindings
  [areaInput, floorsInput, zoneSelect, catSelect, occSelect].forEach(element => {
    element.addEventListener('input', () => {
      calculateTax();
      playTick();
    });
  });

  // Calculate initially
  calculateTax();

  // Secure Checkout Modal Trigger
  const modal = container.querySelector('#payment-modal') as HTMLElement;
  const modalClose = container.querySelector('#modal-close') as HTMLButtonElement;
  const modalBody = container.querySelector('.modal-body') as HTMLElement;

  payBtn.addEventListener('click', () => {
    playClick();
    modal.classList.remove('hidden');
    renderCheckoutStep(modalBody, calculatedTotal, modal);
  });

  modalClose.addEventListener('click', () => {
    playClick();
    modal.classList.add('hidden');
  });
}

function renderCheckoutStep(container: HTMLElement, amount: number, modal: HTMLElement) {
  container.innerHTML = `
    <div class="checkout-wrapper">
      <h3 class="modal-title">Secure Portal Gateway</h3>
      <p class="modal-subtitle">You are paying: <strong class="accent-orange">₹${amount.toLocaleString('en-IN')}</strong> to the municipal treasury.</p>
      
      <div class="checkout-selector">
        <button id="chk-card-tab" class="chk-tab-btn active"><span class="icon">💳</span>Credit/Debit Card</button>
        <button id="chk-upi-tab" class="chk-tab-btn"><span class="icon">📱</span>UPI / Bharat QR</button>
      </div>

      <div class="checkout-method-container">
        <!-- Methods load here -->
      </div>
    </div>
  `;

  const methodContainer = container.querySelector('.checkout-method-container') as HTMLElement;
  const cardBtn = container.querySelector('#chk-card-tab') as HTMLButtonElement;
  const upiBtn = container.querySelector('#chk-upi-tab') as HTMLButtonElement;

  const showCardCheckout = () => {
    cardBtn.classList.add('active');
    upiBtn.classList.remove('active');
    
    methodContainer.innerHTML = `
      <div class="card-checkout-form">
        <!-- Interactive Plastic Card Preview -->
        <div class="plastic-card-preview">
          <div class="card-front glass-card">
            <div class="card-chip"></div>
            <div class="card-network-logo">VISA</div>
            <div id="card-view-num" class="card-num-text">•••• •••• •••• ••••</div>
            <div class="card-bottom">
              <div class="card-holder">
                <span class="label">CARD HOLDER</span>
                <span id="card-view-name" class="name-text">CITIZEN NAME</span>
              </div>
              <div class="card-expiry">
                <span class="label">EXPIRES</span>
                <span id="card-view-exp" class="exp-text">MM/YY</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Inputs -->
        <form id="payment-card-form" class="checkout-inputs">
          <div class="form-group">
            <label>Name on Card</label>
            <input type="text" id="pay-name" placeholder="John Doe" autocomplete="off" required>
          </div>
          <div class="form-group">
            <label>Card Number</label>
            <input type="text" id="pay-num" maxlength="19" placeholder="4111 2222 3333 4444" autocomplete="off" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Expiry Date</label>
              <input type="text" id="pay-exp" placeholder="MM/YY" maxlength="5" autocomplete="off" required>
            </div>
            <div class="form-group">
              <label>CVV/CVC</label>
              <input type="password" id="pay-cvv" placeholder="•••" maxlength="3" autocomplete="off" required>
            </div>
          </div>
          <button type="submit" class="submit-payment-btn pulse-glow">Complete Payment (₹${amount.toLocaleString('en-IN')})</button>
        </form>
      </div>
    `;

    // Plastic card interactivity
    const payName = container.querySelector('#pay-name') as HTMLInputElement;
    const payNum = container.querySelector('#pay-num') as HTMLInputElement;
    const payExp = container.querySelector('#pay-exp') as HTMLInputElement;
    const payCvv = container.querySelector('#pay-cvv') as HTMLInputElement;

    const vName = container.querySelector('#card-view-name') as HTMLElement;
    const vNum = container.querySelector('#card-view-num') as HTMLElement;
    const vExp = container.querySelector('#card-view-exp') as HTMLElement;

    payName.addEventListener('input', () => {
      playTick();
      vName.textContent = payName.value.toUpperCase() || 'CITIZEN NAME';
    });

    payNum.addEventListener('input', () => {
      playTick();
      let val = payNum.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formatted = '';
      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
      }
      payNum.value = formatted;
      vNum.textContent = formatted || '•••• •••• •••• ••••';
    });

    payExp.addEventListener('input', () => {
      playTick();
      let val = payExp.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      payExp.value = val;
      vExp.textContent = val || 'MM/YY';
    });

    payCvv.addEventListener('input', () => playTick());

    // Submit handler
    const payForm = container.querySelector('#payment-card-form') as HTMLFormElement;
    payForm.addEventListener('submit', (e) => {
      e.preventDefault();
      runPaymentSimulation(container, amount, modal);
    });
  };

  const showUpiCheckout = () => {
    upiBtn.classList.add('active');
    cardBtn.classList.remove('active');

    methodContainer.innerHTML = `
      <div class="upi-checkout">
        <div class="qr-container glass">
          <!-- Hand drawn styling of BharatQR -->
          <svg class="bharat-qr" viewBox="0 0 100 100" width="160" height="160">
            <rect x="0" y="0" width="100" height="100" fill="none"/>
            <!-- Outer borders and QR bits in saffron/indigo -->
            <path d="M5 5h25v25H5zm5 5v15h15V10z M65 5h25v25H65zm5 5v15h15V10z M5 65h25v25H5zm5 5v15h15V70z" fill="#1e1b4b"/>
            <!-- Fake central emblem -->
            <circle cx="50" cy="50" r="10" fill="#f97316"/>
            <text x="50" y="53" font-size="8" fill="#fff" text-anchor="middle" font-family="Outfit" font-weight="bold">UPI</text>
            <!-- Pixels -->
            <path d="M38 12h5v5h-5z M45 8h4v4h-4z M15 35h5v5h-5z M50 20h8v4h-8z M80 35h7v7h-7z M35 50h5v8h-5z M58 60h4v15h-4z M40 80h10v5h-10z M72 72h12v12H72z M85 60h5v8h-5z" fill="#a855f7"/>
          </svg>
          <div class="qr-label">Bharat QR Code / UPI Scan</div>
        </div>
        <p class="upi-desc">Scan this dynamically generated transaction token with any authorized UPI App (BHIM, PhonePe, GPay) to settle instantly.</p>
        <button id="simulate-upi-btn" class="primary-btn pulse-glow">Scan / Simulate Payment Success</button>
      </div>
    `;

    const simBtn = container.querySelector('#simulate-upi-btn') as HTMLButtonElement;
    simBtn.addEventListener('click', () => {
      runPaymentSimulation(container, amount, modal);
    });
  };

  cardBtn.addEventListener('click', () => { playClick(); showCardCheckout(); });
  upiBtn.addEventListener('click', () => { playClick(); showUpiCheckout(); });

  // Initial state
  showCardCheckout();
}

function runPaymentSimulation(container: HTMLElement, amount: number, modal: HTMLElement) {
  playClick();
  
  // Progress flow loading screen
  container.innerHTML = `
    <div class="payment-processing">
      <div class="interactive-spinner">
        <div class="inner-spin"></div>
        <span class="spin-shield">🛡️</span>
      </div>
      <h3 id="process-title" class="status-msg">Initiating Ledger Link...</h3>
      <p id="process-desc" class="status-desc">Establishing end-to-end encrypted node connection with National Payment Corporation systems.</p>
    </div>
  `;

  const title = container.querySelector('#process-title') as HTMLElement;
  const desc = container.querySelector('#process-desc') as HTMLElement;

  const states = [
    { title: "Securing Portal Gateway...", desc: "Authenticating SSL handshake and tokenizing payload nodes.", delay: 1000 },
    { title: "Verifying Treasury Allocations...", desc: "Checking Urban Local Body accounting channels for direct ledger credits.", delay: 2200 },
    { title: "Finalizing Payment Settlement...", desc: "Treasury credit recorded. Dispatching e-stamp voucher.", delay: 3500 },
  ];

  states.forEach(s => {
    setTimeout(() => {
      if (title && desc) {
        title.textContent = s.title;
        desc.textContent = s.desc;
        playTick();
      }
    }, s.delay);
  });

  // Complete success flow
  setTimeout(() => {
    playSuccess();
    triggerScreenConfetti();

    const timestamp = new Date().toLocaleString();
    const receiptNum = "REC-" + Math.floor(100000 + Math.random() * 900000);
    
    container.innerHTML = `
      <div class="payment-success">
        <div class="success-seal">✓</div>
        <h3 class="gradient-text-saffron">Assessment Settled!</h3>
        <p class="success-badge-lbl">National Treasury Receipt Issued</p>
        
        <div class="receipt-mini glass">
          <div class="rec-row"><span>Receipt ID:</span><strong>${receiptNum}</strong></div>
          <div class="rec-row"><span>Total Paid:</span><strong>₹${amount.toLocaleString('en-IN')}</strong></div>
          <div class="rec-row"><span>Authorized On:</span><span>${timestamp}</span></div>
          <div class="rec-row"><span>Status:</span><span class="tag green">DIGITALLY SECURED</span></div>
        </div>

        <p class="tax-note">A ledger receipt copy has been deposited in your centralized Citizen Vault. You can verify it under the 'Document Vault' tab.</p>
        
        <div class="success-actions">
          <button id="download-rec-btn" class="primary-btn"><span class="btn-icon">💾</span>Download Receipt</button>
          <button id="close-success-btn" class="text-btn">Return to Dashboard</button>
        </div>
      </div>
    `;

    const closeBtn = container.querySelector('#close-success-btn') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => {
      playClick();
      modal.classList.add('hidden');
    });

    const dlBtn = container.querySelector('#download-rec-btn') as HTMLButtonElement;
    dlBtn.addEventListener('click', () => {
      playClick();
      downloadTextAsFile(
        `UPYOG MUNICIPAL TREASURY RECEIPT\n` +
        `==================================\n` +
        `Receipt Reference: ${receiptNum}\n` +
        `State Portal Hub: NUDM India\n` +
        `Timestamp: ${timestamp}\n` +
        `Settled Amount: INR ${amount.toLocaleString('en-IN')}.00\n` +
        `Allocated Zone: UPYOG E-Governance Network\n\n` +
        `This is a digitally compiled invoice certificate sealed in central records. No physical signature required.`,
        `UPYOG_Tax_Receipt_${receiptNum}.txt`
      );
    });
  }, 4800);
}

// ==========================================
// 2. WATER pipeline CONNECTION WIZARD & TRACKER
// ==========================================
function renderWaterConnection(container: HTMLElement) {
  if (activeWaterApplication) {
    renderWaterTracker(container);
  } else {
    renderWaterWizard(container);
  }
}

function renderWaterWizard(container: HTMLElement) {
  container.innerHTML = `
    <div class="wizard-layout glass">
      <div class="wizard-header">
        <h3 class="gradient-text"><span class="section-badge">Registration</span>New Water Connection Application</h3>
        <p class="section-desc">Submit formal application to align your property to the city's main water & drainage grids in 4 clean steps.</p>
        
        <!-- Progress Steps -->
        <div class="wizard-steps-indicator">
          <div class="step-dot active" data-step="1">1<span>Identity</span></div>
          <div class="step-line"></div>
          <div class="step-dot" data-step="2">2<span>Pipes</span></div>
          <div class="step-line"></div>
          <div class="step-dot" data-step="3">3<span>Documents</span></div>
          <div class="step-line"></div>
          <div class="step-dot" data-step="4">4<span>Submit</span></div>
        </div>
      </div>

      <div class="wizard-content-box">
        <!-- Form elements inserted here dynamically -->
      </div>

      <div class="wizard-footer">
        <button id="wiz-prev" class="secondary-btn hidden"><span class="btn-icon">←</span>Previous</button>
        <button id="wiz-next" class="primary-btn">Next<span class="btn-icon">→</span></button>
      </div>
    </div>
  `;

  const contentBox = container.querySelector('.wizard-content-box') as HTMLElement;
  const prevBtn = container.querySelector('#wiz-prev') as HTMLButtonElement;
  const nextBtn = container.querySelector('#wiz-next') as HTMLButtonElement;
  const dots = container.querySelectorAll('.step-dot');

  let currentStep = 1;
  let applicationData = {
    name: "Aaditya Roy",
    phone: "9876543210",
    aadhaar: "4532 9901 8492",
    ulb: "Lucknow Municipal Corporation",
    useType: "residential",
    diameter: "0.5"
  };

  const updateStepView = () => {
    // Show/hide buttons
    if (currentStep === 1) prevBtn.classList.add('hidden');
    else prevBtn.classList.remove('hidden');

    if (currentStep === 4) nextBtn.innerHTML = `Submit Application <span class="btn-icon">✓</span>`;
    else nextBtn.innerHTML = `Next <span class="btn-icon">→</span>`;

    // Highlight Dots
    dots.forEach((dot, idx) => {
      if (idx + 1 <= currentStep) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    // Load step HTML
    if (currentStep === 1) {
      contentBox.innerHTML = `
        <div class="step-view anim-fade-in">
          <h4>Step 1: Citizen Identity & Municipality Details</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Applicant Full Name</label>
              <input type="text" id="wiz-name" value="${applicationData.name}" placeholder="Full Name" required>
            </div>
            <div class="form-group">
              <label>Mobile Number</label>
              <input type="tel" id="wiz-phone" value="${applicationData.phone}" placeholder="10 digit mobile" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Aadhaar Identity Card Number</label>
              <input type="text" id="wiz-aadhaar" value="${applicationData.aadhaar}" placeholder="XXXX XXXX XXXX" required>
            </div>
            <div class="form-group">
              <label>Allocated Municipality (ULB)</label>
              <select id="wiz-ulb" required>
                <option value="Lucknow Municipal Corporation" ${applicationData.ulb.includes('Lucknow') ? 'selected' : ''}>Lucknow Municipal Corporation</option>
                <option value="Varanasi Municipal Corporation" ${applicationData.ulb.includes('Varanasi') ? 'selected' : ''}>Varanasi Municipal Corporation</option>
                <option value="Noida Authority" ${applicationData.ulb.includes('Noida') ? 'selected' : ''}>Noida Authority</option>
                <option value="Kanpur Municipal Corporation" ${applicationData.ulb.includes('Kanpur') ? 'selected' : ''}>Kanpur Municipal Corporation</option>
              </select>
            </div>
          </div>
        </div>
      `;
    } else if (currentStep === 2) {
      contentBox.innerHTML = `
        <div class="step-view anim-fade-in">
          <h4>Step 2: Technical Pipeline Configuration</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Utility Use Category</label>
              <select id="wiz-use" required>
                <option value="residential" ${applicationData.useType === 'residential' ? 'selected' : ''}>Residential Domestic Grid</option>
                <option value="commercial" ${applicationData.useType === 'commercial' ? 'selected' : ''}>Commercial / Complex Tap</option>
                <option value="industrial" ${applicationData.useType === 'industrial' ? 'selected' : ''}>Heavy Industrial Allocation</option>
              </select>
            </div>
            <div class="form-group">
              <label>Inflow Pipe Diameter (Inches)</label>
              <select id="wiz-dia" required>
                <option value="0.5" ${applicationData.diameter === '0.5' ? 'selected' : ''}>0.5 inch (Standard household pressure)</option>
                <option value="1.0" ${applicationData.diameter === '1.0' ? 'selected' : ''}>1.0 inch (High demand building / duplex)</option>
                <option value="2.0" ${applicationData.diameter === '2.0' ? 'selected' : ''}>2.0 inch (Industrial flow volume)</option>
              </select>
            </div>
          </div>
          <div class="pipe-spec-alert glass">
            <span class="alert-icon">⚡</span>
            <div>
              <strong>Pressure Alert:</strong> Connections exceeding 0.5 inches are subjected to physical flow testing and dynamic engineering field assessments prior to grid commissioning.
            </div>
          </div>
        </div>
      `;
    } else if (currentStep === 3) {
      contentBox.innerHTML = `
        <div class="step-view anim-fade-in">
          <h4>Step 3: Upload supporting Documentation</h4>
          <p class="sub-desc">Drag & drop files below or simulate uploading required documents. Digital scans are validated using instant optical processing.</p>
          
          <div class="doc-upload-grid">
            <div class="doc-upload-card glass">
              <span class="doc-icon">📇</span>
              <div class="doc-info">
                <strong>Aadhaar Card Scan (Self Attested)</strong>
                <span class="status green">✓ Verified Auto-Match</span>
              </div>
            </div>
            
            <div class="doc-upload-card glass">
              <span class="doc-icon">📜</span>
              <div class="doc-info">
                <strong>Authorized Land Registry / Sale Deed</strong>
                <span class="status green">✓ Verified Property Ownership</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (currentStep === 4) {
      contentBox.innerHTML = `
        <div class="step-view anim-fade-in">
          <h4>Step 4: Formal Registration Review</h4>
          <p class="sub-desc">Please review your pipeline allocation details. Submitting registers your intent in the municipal database instantly.</p>
          
          <div class="summary-sheet glass">
            <div class="sum-line"><span>Primary Nominee:</span><strong>${applicationData.name}</strong></div>
            <div class="sum-line"><span>Mobile Linked:</span><span>${applicationData.phone}</span></div>
            <div class="sum-line"><span>Aadhaar Identity:</span><span>${applicationData.aadhaar}</span></div>
            <div class="sum-line"><span>Allocated Local Body:</span><strong>${applicationData.ulb}</strong></div>
            <div class="sum-line"><span>Pipe Spec Volume:</span><span>${applicationData.diameter} Inch Inlet</span></div>
            <div class="sum-line"><span>Tariff Category:</span><span>${applicationData.useType.toUpperCase()} RATE</span></div>
          </div>
        </div>
      `;
    }
  };

  const saveFormValues = () => {
    if (currentStep === 1) {
      const nameInp = container.querySelector('#wiz-name') as HTMLInputElement;
      const phoneInp = container.querySelector('#wiz-phone') as HTMLInputElement;
      const aadhInp = container.querySelector('#wiz-aadhaar') as HTMLInputElement;
      const ulbSel = container.querySelector('#wiz-ulb') as HTMLSelectElement;

      if (nameInp) applicationData.name = nameInp.value;
      if (phoneInp) applicationData.phone = phoneInp.value;
      if (aadhInp) applicationData.aadhaar = aadhInp.value;
      if (ulbSel) applicationData.ulb = ulbSel.value;
    } else if (currentStep === 2) {
      const useSel = container.querySelector('#wiz-use') as HTMLSelectElement;
      const diaSel = container.querySelector('#wiz-dia') as HTMLSelectElement;

      if (useSel) applicationData.useType = useSel.value;
      if (diaSel) applicationData.diameter = diaSel.value;
    }
  };

  // Nav clicks
  nextBtn.addEventListener('click', () => {
    playClick();
    saveFormValues();

    if (currentStep < 4) {
      currentStep++;
      updateStepView();
    } else {
      // Submit form!
      activeWaterApplication = {
        applicantName: applicationData.name,
        aadhaar: applicationData.aadhaar,
        ulb: applicationData.ulb,
        useType: applicationData.useType,
        diameter: applicationData.diameter,
        submittedAt: Date.now()
      };

      currentWaterPhase = 0;
      triggerWaterSimulation(container);
    }
  });

  prevBtn.addEventListener('click', () => {
    playClick();
    saveFormValues();
    if (currentStep > 1) {
      currentStep--;
      updateStepView();
    }
  });

  // Render initial view
  updateStepView();
}

function triggerWaterSimulation(container: HTMLElement) {
  playSuccess();
  triggerScreenConfetti();

  // Switch to tracker layout
  renderWaterTracker(container);

  // Set interval to progress states automatically for the user to watch!
  if (waterPipelineTimer) clearInterval(waterPipelineTimer);

  waterPipelineTimer = window.setInterval(() => {
    if (currentWaterPhase < 4) {
      currentWaterPhase++;
      playChime();
      
      const dots = container.querySelectorAll('.pipe-step');
      const progBar = container.querySelector('.pipe-progress-bar-fill') as HTMLElement;
      
      if (dots[currentWaterPhase]) {
        dots[currentWaterPhase].classList.add('completed');
        dots[currentWaterPhase].classList.add('pulse-active');
        // Unpulse previous
        if (dots[currentWaterPhase - 1]) dots[currentWaterPhase - 1].classList.remove('pulse-active');
      }

      if (progBar) {
        progBar.style.width = `${currentWaterPhase * 25}%`;
      }

      // Check if finished
      if (currentWaterPhase === 4) {
        playSuccess();
        triggerScreenConfetti();
        if (waterPipelineTimer) {
          clearInterval(waterPipelineTimer);
          waterPipelineTimer = null;
        }

        // Show a completion banner
        const footerInfo = container.querySelector('.tracker-footer') as HTMLElement;
        if (footerInfo) {
          footerInfo.innerHTML = `
            <div class="completion-banner glass">
              <span class="comp-icon">🎉</span>
              <div>
                <strong>Pipeline Operational!</strong> Water connection is live and recorded in the municipal telemetry database. Meter reference: <strong>MTR-90028</strong>.
              </div>
            </div>
          `;
        }
      }
    }
  }, 10000); // Progress every 10 seconds (total 40 seconds)
}

function renderWaterTracker(container: HTMLElement) {
  if (!activeWaterApplication) return;

  container.innerHTML = `
    <div class="tracker-layout glass">
      <div class="tracker-header">
        <h3 class="gradient-text"><span class="section-badge active">Live Tracker</span>Water Grid Connection Status</h3>
        <p class="section-desc">Track real-time digital and mechanical validation pipelines for the property of <strong>${activeWaterApplication.applicantName}</strong>.</p>
        
        <div class="tracker-actions">
          <button id="cancel-connection-btn" class="danger-text-btn">Withdraw Application</button>
        </div>
      </div>

      <!-- Realtime Progress Timeline -->
      <div class="tracker-timeline-wrapper">
        <div class="pipe-progress-bar">
          <div class="pipe-progress-bar-fill" style="width: ${currentWaterPhase * 25}%;"></div>
        </div>

        <div class="pipe-steps-container">
          <div class="pipe-step ${currentWaterPhase >= 0 ? 'completed' : ''} ${currentWaterPhase === 0 ? 'pulse-active' : ''}">
            <div class="step-num">1</div>
            <div class="step-info">
              <strong>Application Digitally Sealed</strong>
              <span>Token validated: SEC-W-${Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
          </div>

          <div class="pipe-step ${currentWaterPhase >= 1 ? 'completed' : ''} ${currentWaterPhase === 1 ? 'pulse-active' : ''}">
            <div class="step-num">2</div>
            <div class="step-info">
              <strong>GIS Grid Feasibility Mapping</strong>
              <span>Analyzing pipe pressures and hydraulic grids</span>
            </div>
          </div>

          <div class="pipe-step ${currentWaterPhase >= 2 ? 'completed' : ''} ${currentWaterPhase === 2 ? 'pulse-active' : ''}">
            <div class="step-num">3</div>
            <div class="step-info">
              <strong>Physical Field Survey Audit</strong>
              <span>Verification of flow pipes by ULB Inspector</span>
            </div>
          </div>

          <div class="pipe-step ${currentWaterPhase >= 3 ? 'completed' : ''} ${currentWaterPhase === 3 ? 'pulse-active' : ''}">
            <div class="step-num">4</div>
            <div class="step-info">
              <strong>Sewerage Tariff Verification</strong>
              <span>Security deposits accounted on national database</span>
            </div>
          </div>

          <div class="pipe-step ${currentWaterPhase >= 4 ? 'completed' : ''} ${currentWaterPhase === 4 ? 'pulse-active' : ''}">
            <div class="step-num">5</div>
            <div class="step-info">
              <strong>Meter Commissioned</strong>
              <span>Smart IoT water meter linked to portal account</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tracker-footer">
        ${currentWaterPhase === 4 ? `
          <div class="completion-banner glass">
            <span class="comp-icon">🎉</span>
            <div>
              <strong>Pipeline Operational!</strong> Water connection is live and recorded in the municipal telemetry database. Meter reference: <strong>MTR-90028</strong>.
            </div>
          </div>
        ` : `
          <div class="progress-notice glass">
            <span class="notice-icon">⏳</span>
            <div>
              <strong>System processing:</strong> Digital and mechanical checks are being conducted automatically. Total completion takes about 40 seconds. Keep this tab open.
            </div>
          </div>
        `}
      </div>
    </div>
  `;

  // Bind cancel action
  const cancelBtn = container.querySelector('#cancel-connection-btn') as HTMLButtonElement;
  cancelBtn.addEventListener('click', () => {
    playWarning();
    if (confirm("Are you sure you want to withdraw this application? All pipeline allocation locks will be released.")) {
      if (waterPipelineTimer) {
        clearInterval(waterPipelineTimer);
        waterPipelineTimer = null;
      }
      activeWaterApplication = null;
      currentWaterPhase = 0;
      playClick();
      renderWaterConnection(container);
    }
  });
}

// ==========================================
// 3. PUBLIC GRIEVANCE REDRESSAL (PGR) BOARD
// ==========================================
function renderPGR(container: HTMLElement) {
  container.innerHTML = `
    <div class="pgr-layout">
      <!-- Lodge Grievance Form -->
      <div class="pgr-card form-box glass">
        <h3 class="gradient-text"><span class="section-badge">Lodgement</span>Lodge Public Grievance</h3>
        <p class="section-desc">Report community maintenance issues (potholes, garbage, leakages) directly to the municipal emergency response unit.</p>
        
        <form id="pgr-form" class="dynamic-form">
          <div class="form-group">
            <label for="pgr-name">Reporter Name</label>
            <input type="text" id="pgr-name" value="Amit Kumar" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="pgr-category">Grievance Category</label>
              <select id="pgr-category" required>
                <option value="Pothole Damage">Potholes / Broken Asphalt</option>
                <option value="Streetlight Malfunction">Streetlight Malfunction</option>
                <option value="Garbage Pile Up">Garbage Pile Up / Solid Waste</option>
                <option value="Water Sewerage Leakage">Water & Sewerage Leakage</option>
                <option value="Stray Animal Hazard">Stray Animal Hazard</option>
              </select>
            </div>
            <div class="form-group">
              <label for="pgr-ulb">Affected Municipality (ULB)</label>
              <select id="pgr-ulb" required>
                <option value="Lucknow Municipal Corporation">Lucknow Municipal Corporation</option>
                <option value="Varanasi Municipal Corporation">Varanasi Municipal Corporation</option>
                <option value="Noida Authority">Noida Authority</option>
                <option value="Kanpur Municipal Corporation">Kanpur Municipal Corporation</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="pgr-desc">Describe Situation & Location Specifics</label>
            <textarea id="pgr-desc" rows="3" placeholder="Identify nearby landmarks and severity of issue..." required></textarea>
          </div>

          <!-- GPS Simulator -->
          <div class="gps-simulator glass">
            <div class="gps-dot animate-ping"></div>
            <div class="gps-coordinates">GPS: 26.8467° N, 80.9462° E (Lucknow Sec-A Pin-Locked)</div>
          </div>

          <button type="submit" class="primary-btn pulse-glow"><span class="btn-icon">📢</span>Broadcast Grievance</button>
        </form>
      </div>

      <!-- Interactive Kanban Board -->
      <div class="pgr-card board-box glass">
        <div class="board-header">
          <h3>Local Resolution Command Board</h3>
          <p class="section-desc">Track all local municipal dispatches. Drag or click cards to progress resolving workflows!</p>
        </div>
        
        <div class="kanban-grid">
          <!-- Column 1: Submitted -->
          <div class="kanban-col" data-col="submitted">
            <div class="col-header"><span class="indicator red"></span>Submitted <span id="cnt-submitted" class="badge">0</span></div>
            <div class="col-cards-container" id="col-submitted"></div>
          </div>

          <!-- Column 2: Assigned -->
          <div class="kanban-col" data-col="assigned">
            <div class="col-header"><span class="indicator orange"></span>Assigned <span id="cnt-assigned" class="badge">0</span></div>
            <div class="col-cards-container" id="col-assigned"></div>
          </div>

          <!-- Column 3: In Progress -->
          <div class="kanban-col" data-col="in-progress">
            <div class="col-header"><span class="indicator blue"></span>On-Site <span id="cnt-in-progress" class="badge">0</span></div>
            <div class="col-cards-container" id="col-in-progress"></div>
          </div>

          <!-- Column 4: Resolved -->
          <div class="kanban-col" data-col="resolved">
            <div class="col-header"><span class="indicator green"></span>Resolved <span id="cnt-resolved" class="badge">0</span></div>
            <div class="col-cards-container" id="col-resolved"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render Kanban Cards
  const populateBoard = () => {
    const colSubs = container.querySelector('#col-submitted') as HTMLElement;
    const colAsgs = container.querySelector('#col-assigned') as HTMLElement;
    const colPrgs = container.querySelector('#col-in-progress') as HTMLElement;
    const colRsgs = container.querySelector('#col-resolved') as HTMLElement;

    // Reset container HTMLs
    colSubs.innerHTML = '';
    colAsgs.innerHTML = '';
    colPrgs.innerHTML = '';
    colRsgs.innerHTML = '';

    let cntS = 0, cntA = 0, cntP = 0, cntR = 0;

    grievances.forEach(g => {
      const card = document.createElement('div');
      card.className = 'kanban-card glass anim-scale';
      card.setAttribute('draggable', 'true');
      card.innerHTML = `
        <div class="card-ref">${g.id} <span class="card-time">${g.submittedAt}</span></div>
        <div class="card-cat">${g.category}</div>
        <div class="card-desc">${g.description}</div>
        <div class="card-reporter">👤 ${g.citizenName}</div>
        <div class="card-ulb">🏢 ${g.ulb.split(' ')[0]}</div>
        
        <div class="card-actions">
          ${g.status !== 'resolved' ? `<button class="card-prog-btn" data-id="${g.id}">Dispatch Step →</button>` : `<span class="res-check">🏆 Resolved</span>`}
        </div>
      `;

      card.addEventListener('dragstart', (e: any) => {
        e.dataTransfer.setData('text/plain', g.id);
        playTick();
      });

      // Prog button event
      const progBtn = card.querySelector('.card-prog-btn') as HTMLButtonElement;
      if (progBtn) {
        progBtn.addEventListener('mouseenter', () => playTick());
        progBtn.addEventListener('click', () => {
          progressGrievance(g.id);
        });
      }

      if (g.status === 'submitted') { colSubs.appendChild(card); cntS++; }
      else if (g.status === 'assigned') { colAsgs.appendChild(card); cntA++; }
      else if (g.status === 'in-progress') { colPrgs.appendChild(card); cntP++; }
      else if (g.status === 'resolved') { colRsgs.appendChild(card); cntR++; }
    });

    // Update Badges
    container.querySelector('#cnt-submitted')!.textContent = String(cntS);
    container.querySelector('#cnt-assigned')!.textContent = String(cntA);
    container.querySelector('#cnt-in-progress')!.textContent = String(cntP);
    container.querySelector('#cnt-resolved')!.textContent = String(cntR);
  };

  const progressGrievance = (id: string) => {
    const item = grievances.find(x => x.id === id);
    if (!item) return;

    if (item.status === 'submitted') {
      item.status = 'assigned';
      item.submittedAt = "Just now";
      playChime();
    } else if (item.status === 'assigned') {
      item.status = 'in-progress';
      item.submittedAt = "Just now";
      playChime();
    } else if (item.status === 'in-progress') {
      item.status = 'resolved';
      item.submittedAt = "Just now";
      playSuccess();
      triggerScreenConfetti();
    }
    populateBoard();
  };

  // Bind Form Submission
  const form = container.querySelector('#pgr-form') as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInp = container.querySelector('#pgr-name') as HTMLInputElement;
    const catSel = container.querySelector('#pgr-category') as HTMLSelectElement;
    const ulbSel = container.querySelector('#pgr-ulb') as HTMLSelectElement;
    const descInp = container.querySelector('#pgr-desc') as HTMLTextAreaElement;

    const newGrv: Grievance = {
      id: "GRV-" + Math.floor(10000 + Math.random() * 90000),
      category: catSel.value,
      ulb: ulbSel.value,
      description: descInp.value,
      status: 'submitted',
      submittedAt: "Just now",
      citizenName: nameInp.value
    };

    grievances.unshift(newGrv);
    playSuccess();
    triggerScreenConfetti();
    
    // Clear textarea
    descInp.value = '';
    populateBoard();
  });

  // Setup drag & drop columns
  const cols = container.querySelectorAll('.kanban-col');
  cols.forEach(col => {
    col.addEventListener('dragover', (e: any) => {
      e.preventDefault();
    });

    col.addEventListener('drop', (e: any) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const targetCol = col.getAttribute('data-col') as any;
      const item = grievances.find(x => x.id === id);

      if (item && targetCol) {
        if (item.status !== targetCol) {
          item.status = targetCol;
          item.submittedAt = "Just now";
          if (targetCol === 'resolved') {
            playSuccess();
            triggerScreenConfetti();
          } else {
            playChime();
          }
          populateBoard();
        }
      }
    });
  });

  // Render cards initially
  populateBoard();
}

// ==========================================
// 4. DOCUMENT VAULT & printable CERTIFICATES
// ==========================================
function renderDocumentVault(container: HTMLElement) {
  container.innerHTML = `
    <div class="vault-layout">
      <!-- Search Request Panel -->
      <div class="vault-card search-box glass">
        <h3 class="gradient-text"><span class="section-badge">Vault</span>Civic Document Safe Vault</h3>
        <p class="section-desc">Instantly search municipal logs and compile high-fidelity, verified official digital certificates with functioning cryptographic QR codes.</p>
        
        <form id="vault-form" class="dynamic-form">
          <div class="form-group">
            <label for="vault-doc-type">Certificate Type</label>
            <select id="vault-doc-type" required>
              <option value="birth">Certificate of Birth (Form-5)</option>
              <option value="death">Certificate of Death (Form-6)</option>
              <option value="trade">Municipal Trade & Commerce License</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="vault-name">Full Legal Name</label>
              <input type="text" id="vault-name" value="Amit Kumar Sharma" placeholder="As registered in official records" required>
            </div>
            <div class="form-group">
              <label for="vault-date">Event / Establishment Date</label>
              <input type="date" id="vault-date" value="1992-06-15" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="vault-location">Location of Event / ULB</label>
              <input type="text" id="vault-location" value="Lucknow, Uttar Pradesh" placeholder="Hospital or Registered Ward" required>
            </div>
            <div class="form-group">
              <label for="vault-parent">Parent / Proprietor Name</label>
              <input type="text" id="vault-parent" value="Ram Sharan Sharma" placeholder="Father/Mother/Owner Name" required>
            </div>
          </div>

          <button type="submit" class="primary-btn pulse-glow"><span class="btn-icon">📜</span>Compile Certificate Card</button>
        </form>
      </div>

      <!-- Preview Printable Panel -->
      <div class="vault-card preview-box glass">
        <h3>Live Certificate Preview</h3>
        <p class="section-desc">Below is the compiled high-fidelity vector preview of the official certificate card. Press Print to save it as a clean PDF.</p>
        
        <div id="certificate-render-target">
          <!-- Holds styled certificate -->
          <div class="cert-placeholder">
            <span>Fill parameters and click Compile to synthesize a high-fidelity government certificate.</span>
          </div>
        </div>

        <div class="cert-actions hidden" id="cert-action-bar">
          <button id="print-cert-btn" class="primary-btn"><span class="btn-icon">🖨️</span>Print Certificate (PDF)</button>
          <button id="download-cert-txt-btn" class="secondary-btn"><span class="btn-icon">💾</span>Download Schema Ledger</button>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#vault-form') as HTMLFormElement;
  const renderTarget = container.querySelector('#certificate-render-target') as HTMLElement;
  const actionBar = container.querySelector('#cert-action-bar') as HTMLElement;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    playSuccess();
    triggerScreenConfetti();

    const type = (container.querySelector('#vault-doc-type') as HTMLSelectElement).value;
    const name = (container.querySelector('#vault-name') as HTMLInputElement).value;
    const date = (container.querySelector('#vault-date') as HTMLInputElement).value;
    const loc = (container.querySelector('#vault-location') as HTMLInputElement).value;
    const parentName = (container.querySelector('#vault-parent') as HTMLInputElement).value;

    const certId = `UPY-${type.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Create printable HTML template
    let certTitle = "CERTIFICATE OF BIRTH";
    let subRule = "ISSUED UNDER SECTION 12/17 OF THE REGISTRATION OF BIRTHS & DEATHS ACT, 1969";
    let bodyText = `This is to certify that the following information has been taken from the original record of birth which is the register for municipal district local body area.`;
    
    let gridDetails = `
      <div class="c-line"><span>Name:</span><strong>${name.toUpperCase()}</strong></div>
      <div class="c-line"><span>Sex/Gender:</span><span>MALE</span></div>
      <div class="c-line"><span>Date of Birth:</span><strong>${formattedDate}</strong></div>
      <div class="c-line"><span>Place of Birth:</span><span>${loc}</span></div>
      <div class="c-line"><span>Name of Father:</span><span>${parentName}</span></div>
      <div class="c-line"><span>Registration No:</span><strong>${certId}</strong></div>
    `;

    if (type === 'death') {
      certTitle = "CERTIFICATE OF DEATH";
      subRule = "ISSUED UNDER SECTION 12/17 OF THE REGISTRATION OF BIRTHS & DEATHS ACT, 1969";
      bodyText = `This is to certify that the following information has been taken from the official register of deaths in the records of the Urban Local Body.`;
      gridDetails = `
        <div class="c-line"><span>Deceased Name:</span><strong>${name.toUpperCase()}</strong></div>
        <div class="c-line"><span>Date of Decease:</span><strong>${formattedDate}</strong></div>
        <div class="c-line"><span>Place of Event:</span><span>${loc}</span></div>
        <div class="c-line"><span>Guardian/Relative Name:</span><span>${parentName}</span></div>
        <div class="c-line"><span>Registration No:</span><strong>${certId}</strong></div>
      `;
    } else if (type === 'trade') {
      certTitle = "MUNICIPAL TRADE LICENSE";
      subRule = "ISSUED UNDER SECTION 443 OF THE MUNICIPAL CORPORATION ACT, 1959";
      bodyText = `This license authorizes the enterprise detailed below to operate commercial trade operations within the geographical municipal bounds of the ULB.`;
      gridDetails = `
        <div class="c-line"><span>Proprietor Name:</span><strong>${parentName.toUpperCase()}</strong></div>
        <div class="c-line"><span>Trade/Enterprise Name:</span><strong>${name.toUpperCase()}</strong></div>
        <div class="c-line"><span>Commencement Date:</span><strong>${formattedDate}</strong></div>
        <div class="c-line"><span>Registered Premises:</span><span>${loc}</span></div>
        <div class="c-line"><span>License Number:</span><strong>${certId}</strong></div>
      `;
    }

    // Functioning QR verification link
    const verificationUrl = `https://upyog.gov.in/verify?id=${certId}&type=${type}&name=${encodeURIComponent(name)}`;

    renderTarget.innerHTML = `
      <div class="official-certificate-sheet printable-area">
        <!-- Ashoka Watermark backdrop -->
        <div class="cert-watermark">UPYOG</div>

        <!-- Classic Triple Border -->
        <div class="cert-border-outer">
          <div class="cert-border-inner">
            
            <!-- Government Headers -->
            <div class="cert-header">
              <div class="national-emblem-svg">
                <!-- Ashoka Chakra SVG Mock -->
                <svg viewBox="0 0 100 100" width="45" height="45">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#b45309" stroke-width="2"/>
                  <circle cx="50" cy="50" r="10" fill="none" stroke="#2563eb" stroke-width="1.5"/>
                  <path d="M50 5 v90 M5 50 h90 M18 18 l64 64 M18 82 l64 -64 M32 10 l36 80 M10 32 l80 36 M10 68 l80 -36 M32 90 l36 -80" stroke="#2563eb" stroke-width="0.75"/>
                </svg>
              </div>
              <h2>MINISTRY OF URBAN DEVELOPMENT & E-GOVERNANCE</h2>
              <h3>GOVERNMENT OF INDIA</h3>
              <div class="cert-title-badge">${certTitle}</div>
              <p class="cert-law-rule">${subRule}</p>
            </div>

            <p class="cert-body-intro">${bodyText}</p>

            <!-- Details Block -->
            <div class="cert-grid">
              ${gridDetails}
            </div>

            <!-- Validation row with digital seal and working QR -->
            <div class="cert-footer">
              <div class="qr-block" title="Scan to verify or click to open.">
                <!-- Direct clickable QR for mock verification -->
                <a href="${verificationUrl}" target="_blank" class="qr-anchor">
                  <svg viewBox="0 0 100 100" width="70" height="70">
                    <rect x="0" y="0" width="100" height="100" fill="#fff" stroke="#000" stroke-width="2"/>
                    <rect x="5" y="5" width="25" height="25" fill="#000"/>
                    <rect x="70" y="5" width="25" height="25" fill="#000"/>
                    <rect x="5" y="70" width="25" height="25" fill="#000"/>
                    <rect x="10" y="10" width="15" height="15" fill="#fff"/>
                    <rect x="75" y="10" width="15" height="15" fill="#fff"/>
                    <rect x="10" y="75" width="15" height="15" fill="#fff"/>
                    <path d="M35 15h10v5H35z M55 10h10v5H55z M45 45h15v5H45z M15 35h5v20h-5z M75 35h15v5H75z M35 75h10v10H35z M80 80h10v10H80z" fill="#000"/>
                  </svg>
                </a>
                <span class="qr-lbl">Tap / Scan Card QR<br>to Verify Online</span>
              </div>

              <div class="seal-block">
                <div class="seal-stamp">
                  <span>UPYOG DIGITAL SEAL</span>
                </div>
              </div>

              <div class="signature-block">
                <div class="sig-line">Digital Seal Registered</div>
                <div class="sig-title">REGISTRAR OF EVENTS (ULB)</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    actionBar.classList.remove('hidden');

    // Bind printable triggers
    const printBtn = container.querySelector('#print-cert-btn') as HTMLButtonElement;
    printBtn.onclick = () => {
      playClick();
      window.print();
    };

    const dlTxtBtn = container.querySelector('#download-cert-txt-btn') as HTMLButtonElement;
    dlTxtBtn.onclick = () => {
      playClick();
      downloadTextAsFile(
        `UPYOG CRYPTOGRAPHIC SCHEMA BLOCK\n` +
        `==================================\n` +
        `Block Reference: ${certId}\n` +
        `Document Class: ${type.toUpperCase()}\n` +
        `Nominee Target: ${name}\n` +
        `Registered Date: ${formattedDate}\n` +
        `State Authority: Government of India\n` +
        `Verified Seal Checksum: 0xFD${Math.floor(10000000 + Math.random() * 90000000).toString(16)}\n` +
        `Endpoint Anchor: ${verificationUrl}`,
        `Certificate_Schema_${certId}.txt`
      );
    };
  });
}

// Helpers
function triggerScreenConfetti() {
  // Spawn decorative falling confetti particles in vanilla CSS
  const colors = ['#f97316', '#a855f7', '#10b981', '#3b82f6', '#facc15'];
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-particle';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${5 + Math.random() * 10}px`;
    confetti.style.height = `${10 + Math.random() * 15}px`;
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confetti.style.animationDuration = `${1.5 + Math.random() * 2}s`;
    
    document.body.appendChild(confetti);

    // Remove particle from body once completed
    setTimeout(() => {
      confetti.remove();
    }, 3500);
  }
}

function downloadTextAsFile(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
