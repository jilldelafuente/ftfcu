// ===================== Shared header ==========================
const HEADER_HTML = `
  <div class="secondary-nav">
    <div class="secondary-nav-inner">
      <div class="secondary-nav-left">
        <a href="#">Find a Location</a>
        <a href="#">Rates &amp; Fees</a>
        <a href="#">Make a Payment</a>
        <a href="#">Register for Online Banking</a>
      </div>
      <div class="secondary-nav-right">
        <span>Routing #321180379</span>
        <a href="#">Help</a>
        <a href="#">Appointments</a>
        <a href="#">Privacy</a>
        <button type="button" class="secondary-search" aria-label="Search">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="5" cy="5" r="4.3" stroke="currentColor" stroke-width="1"/><line x1="8.2" y1="8.2" x2="11.5" y2="11.5" stroke="currentColor" stroke-width="1"/></svg>
        </button>
      </div>
    </div>
  </div>
  <div class="navbar-sticky">
    <nav class="main-nav">
      <a href="#" class="main-nav-logo"><img src="assets/Logo.svg" alt="First Tech" /></a>
      <button type="button" class="main-nav-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <div class="main-nav-links">
        <a href="#">Bank</a>
        <a href="#">Borrow</a>
        <a href="#">Insure</a>
        <a href="#">Invest</a>
        <a href="#">Discover</a>
        <a href="#">Learn</a>
      </div>
      <div class="main-nav-buttons">
        <a href="#" class="btn btn--dark">Become a member</a>
        <a href="#" class="btn btn--light">Log in</a>
      </div>
    </nav>
  </div>
`;

document.querySelectorAll('.header-slot').forEach((slot) => {
  slot.innerHTML = HEADER_HTML;

  const nav = slot.querySelector('.main-nav');
  const navToggle = slot.querySelector('.main-nav-toggle');
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
});

// ===================== App state ==========================
const ACCOUNTS = {
  auto: { label: 'Auto Loan Refinance', amount: 1150, ctaLabel: 'Apply for auto loan' },
  checking: { label: 'Reward Checking', amount: 120, ctaLabel: 'Open Checking account' },
  savings: { label: 'Reward Savings', amount: 200, ctaLabel: 'Open Savings account' },
};

const state = {
  screen: 'home',
  loanTypeSelected: false,
  selectedAccounts: new Set(),
};

function showScreen(name) {
  state.screen = name;
  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.toggle('active', el.id === `screen-${name}`);
  });
  window.scrollTo({ top: 0, behavior: 'instant' in window.HTMLElement ? 'instant' : 'auto' });
}

function resetApp() {
  state.loanTypeSelected = false;
  state.selectedAccounts.clear();
  document.getElementById('auto-card').setAttribute('aria-pressed', 'false');
  document.getElementById('home-continue').disabled = true;
  document.querySelectorAll('.account-checkbox').forEach((cb) => cb.setAttribute('aria-pressed', 'false'));
  document.querySelectorAll('.account-card').forEach((card) => card.classList.remove('is-selected'));
  document.getElementById('contact-form').reset();
  document.getElementById('results-submit').disabled = true;
  updateFooter();
  showScreen('home');
}

// ===================== Home screen ==========================
const autoCard = document.getElementById('auto-card');
const homeContinue = document.getElementById('home-continue');

autoCard.addEventListener('click', () => {
  state.loanTypeSelected = true;
  autoCard.setAttribute('aria-pressed', 'true');
  homeContinue.disabled = false;
});

homeContinue.addEventListener('click', () => {
  if (!state.loanTypeSelected) return;
  showScreen('q1');
});

// ===================== Quiz screens (q1 / q2) ==========================
document.querySelectorAll('.quiz-options').forEach((group) => {
  const next = group.getAttribute('data-next');
  group.querySelectorAll('.quiz-option').forEach((btn) => {
    btn.addEventListener('click', () => showScreen(next));
  });
});

document.querySelectorAll('.back-link').forEach((btn) => {
  btn.addEventListener('click', () => showScreen(btn.getAttribute('data-back')));
});

// ===================== Contact form (q3) ==========================
const contactForm = document.getElementById('contact-form');
const resultsSubmit = document.getElementById('results-submit');
const nameInput = document.getElementById('contact-name');
const emailInput = document.getElementById('contact-email');
const phoneInput = document.getElementById('contact-phone');

function checkContactValid() {
  const valid = nameInput.value.trim() && emailInput.value.trim() && phoneInput.value.trim();
  resultsSubmit.disabled = !valid;
}
[nameInput, emailInput, phoneInput].forEach((input) => input.addEventListener('input', checkContactValid));

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (resultsSubmit.disabled) return;
  startLoading();
});

// ===================== Loading screen ==========================
const loadingFrame = document.getElementById('loading-frame');
let loadingInterval = null;
let loadingTimeout = null;

function startLoading() {
  showScreen('loading');
  let frame = 1;
  loadingFrame.src = `animation/${frame}.svg`;
  loadingInterval = setInterval(() => {
    frame = (frame % 9) + 1;
    loadingFrame.src = `animation/${frame}.svg`;
  }, 90);
  loadingTimeout = setTimeout(() => {
    clearInterval(loadingInterval);
    showScreen('results');
  }, 2400);
}

// ===================== Results screen ==========================
const accountCountPill = document.getElementById('account-count-pill');
const footerMainText = document.getElementById('footer-main-text');
const footerBenefitText = document.getElementById('footer-benefit-text');
const footerSubText = document.getElementById('footer-sub-text');
const footerCta = document.getElementById('footer-cta');
const footerCtaText = document.getElementById('footer-cta-text');

document.querySelectorAll('.account-card').forEach((card) => {
  const id = card.getAttribute('data-account');
  const checkbox = card.querySelector('.account-checkbox');

  function toggle() {
    const selected = state.selectedAccounts.has(id);
    if (selected) {
      state.selectedAccounts.delete(id);
    } else {
      state.selectedAccounts.add(id);
    }
    checkbox.setAttribute('aria-pressed', String(!selected));
    card.classList.toggle('is-selected', !selected);
    updateFooter();
  }

  checkbox.addEventListener('click', toggle);
  card.addEventListener('click', (e) => {
    if (e.target === checkbox) return;
    toggle();
  });
});

function updateFooter() {
  const ids = Array.from(state.selectedAccounts);
  const count = ids.length;
  const total = ids.reduce((sum, id) => sum + ACCOUNTS[id].amount, 0);

  if (count === 0) {
    footerMainText.textContent = "Select the accounts you'd like to open, or talk to a real person.";
    footerBenefitText.hidden = true;
    footerSubText.textContent = '';
    footerCta.hidden = true;
    accountCountPill.hidden = true;
    return;
  }

  footerMainText.textContent = count === 1 ? '1 account selected' : `${count} accounts selected`;
  footerBenefitText.hidden = false;
  footerBenefitText.textContent = `$${total.toLocaleString()}/yr benefits`;
  footerSubText.textContent = ids.map((id) => ACCOUNTS[id].label).join('   ');

  footerCta.hidden = false;
  footerCtaText.textContent = count === 1 ? ACCOUNTS[ids[0]].ctaLabel : `Open ${count} accounts`;

  accountCountPill.hidden = false;
  accountCountPill.innerHTML = `<span>${count === 1 ? '1 selected' : `${count} selected`}</span><span>$${total.toLocaleString()}/yr</span>`;
}

document.getElementById('start-over').addEventListener('click', resetApp);

// ===================== Init ==========================
updateFooter();
