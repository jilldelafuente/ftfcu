// Mobile nav toggle
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.navbar__toggle');
navToggle.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Hero persona preview toggle
const HERO_PERSONAS = {
  anonymous: {
    bg: '_images/images/GettyImages-2133181950.jpg',
    headline: "Banking<br>that's actually yours.",
  },
  auto: {
    bg: '_images/figma-export/persona-auto-loan.jpg',
    flip: true,
    headline: 'Your auto loan<br>quote is ready.',
    copy: "Rates as low as 8.32% APR — plus 0.50% off with a First Tech relationship.",
    cta: 'See your estimated payment',
  },
  dcu: {
    bg: '_images/figma-export/persona-dcu-member.jpg',
    headline: 'Your membership just got a lot bigger.',
    copy: "Same account you've always had, with a lot more behind it.",
    cta: "See what's included",
  },
  new: {
    bg: '_images/figma-export/persona-new-member.jpg',
    headline: 'Your rate is waiting.',
    copy: 'Add Rewards Checking before day 90 and your savings earns 3.00% APY, plus $10/month back in ATM fees.',
    cta: 'Open Rewards Checking',
  },
};

const heroBgImg = document.getElementById('heroBgImg');
const heroHeadline = document.getElementById('heroHeadline');
const heroAnonExtras = document.getElementById('heroAnonExtras');
const heroPersonaCopy = document.getElementById('heroPersonaCopy');
const heroPersonaText = document.getElementById('heroPersonaText');
const heroPersonaCta = document.getElementById('heroPersonaCta');
const heroPersonaToggle = document.getElementById('heroPersonaToggle');

function setHeroPersona(key) {
  const persona = HERO_PERSONAS[key];
  if (!persona) return;

  heroBgImg.src = persona.bg;
  heroBgImg.classList.toggle('is-flipped', Boolean(persona.flip));
  heroHeadline.innerHTML = persona.headline;

  const isAnonymous = key === 'anonymous';
  heroAnonExtras.style.display = isAnonymous ? '' : 'none';
  heroPersonaCopy.style.display = isAnonymous ? 'none' : 'flex';
  if (!isAnonymous) {
    heroPersonaText.textContent = persona.copy;
    heroPersonaCta.textContent = persona.cta;
  }

  heroPersonaToggle.querySelectorAll('button').forEach((btn) => {
    const isActive = btn.dataset.persona === key;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });
}

heroPersonaToggle.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => setHeroPersona(btn.dataset.persona));
});

// Explore carousel arrows
const roleCards = document.getElementById('roleCards');
document.querySelectorAll('.carousel-arrow').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dir = Number(btn.dataset.dir);
    const cardWidth = 256 + 27; // card width + gap
    roleCards.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' });
  });
});

// Loan calculator
const loanType = document.getElementById('loanType');
const loanAmount = document.getElementById('loanAmount');
const loanTerm = document.getElementById('loanTerm');
const rateBox = document.getElementById('rateBox');
const paymentEstimate = document.getElementById('paymentEstimate');

function parseAmount(value) {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function formatAmount(n) {
  return n.toLocaleString('en-US');
}

function currentRate() {
  return parseFloat(loanType.selectedOptions[0].dataset.rate);
}

function monthlyPayment(principal, annualRatePct, months) {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function recalculate() {
  const principal = parseAmount(loanAmount.value);
  const months = Number(loanTerm.value);
  const rate = currentRate();

  rateBox.textContent = `${rate.toFixed(2)}% APR`;

  const payment = monthlyPayment(principal, rate, months);
  paymentEstimate.textContent = `$${Math.round(payment).toLocaleString('en-US')}`;
}

// Size the pills to hug their current content. Native <select> elements size
// themselves to their widest option, not the selected one, so the visible
// text ends up floating in extra space unless we measure and set an exact
// pixel width for whichever option is currently showing.
const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d');

function textWidth(text, el) {
  const style = getComputedStyle(el);
  measureCtx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return measureCtx.measureText(text).width;
}

function sizeSelect(select) {
  const style = getComputedStyle(select);
  const width = textWidth(select.selectedOptions[0].text, select)
    + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  select.style.width = `${Math.ceil(width)}px`;
}

function sizeAmountInput() {
  loanAmount.size = Math.max(loanAmount.value.length, 1);
}

loanAmount.addEventListener('input', () => {
  const caretAtEnd = loanAmount.selectionStart === loanAmount.value.length;
  const digits = parseAmount(loanAmount.value);
  loanAmount.value = formatAmount(digits);
  if (caretAtEnd) {
    loanAmount.setSelectionRange(loanAmount.value.length, loanAmount.value.length);
  }
  sizeAmountInput();
  recalculate();
});

[loanType, loanTerm].forEach((el) => el.addEventListener('change', () => {
  sizeSelect(el);
  recalculate();
}));

recalculate();
sizeAmountInput();
[loanType, loanTerm].forEach(sizeSelect);

// Money Coach floating chat
const moneycoachFab = document.getElementById('moneycoachFab');
const moneycoachPanel = document.getElementById('moneycoachPanel');
const moneycoachClose = document.getElementById('moneycoachClose');
const moneycoachInput = document.getElementById('moneycoachInput');
const moneycoachForm = document.getElementById('moneycoachForm');
const moneycoachBody = document.getElementById('moneycoachBody');
const moneycoachBadge = document.querySelector('.moneycoach-panel__badge');
const moneycoachGreeting = document.getElementById('moneycoachGreeting');
const moneycoachPrompts = document.getElementById('moneycoachPrompts');
const moneycoachMessages = document.getElementById('moneycoachMessages');

function openMoneycoach() {
  moneycoachPanel.classList.add('is-open');
  moneycoachPanel.setAttribute('aria-hidden', 'false');
  moneycoachFab.classList.add('is-hidden');
  moneycoachFab.setAttribute('aria-expanded', 'true');
  moneycoachInput.focus();
}

function closeMoneycoach() {
  moneycoachPanel.classList.remove('is-open');
  moneycoachPanel.setAttribute('aria-hidden', 'true');
  moneycoachFab.classList.remove('is-hidden');
  moneycoachFab.setAttribute('aria-expanded', 'false');
  resetMoneycoach();
}

moneycoachFab.addEventListener('click', openMoneycoach);
moneycoachClose.addEventListener('click', closeMoneycoach);

// Money Coach response engine — rule-based matching against the rates and
// products actually shown on this page. Not a live AI backend; it's meant
// to give genuinely relevant, general guidance, consistent with the
// disclaimer ("general guidance only, not personalized advice").
const DEFAULT_PROMPTS = [
  "What's a good rate for a first home loan?",
  'How much should I save before buying a car?',
  "What's the difference between certificates or rewards savings?",
];

const MONEYCOACH_INTENTS = [
  // --- Home loan sub-topics (must come before the general home-loan intent) ---
  {
    keywords: ['fixed and variable', 'fixed or variable', 'fixed vs variable', 'fixed versus variable'],
    reply: [
      'Fixed home equity (starting at 5.117%) locks your rate for the life of the loan, so your payment never changes — good if you want predictability.',
      "The variable home equity line (7.00% APR) works more like a credit line: you draw what you need and pay interest only on that, but the rate can move with the market — good for ongoing projects like renovations.",
    ],
    followups: [
      'How do I get pre-qualified?',
      'What do I need to apply?',
      "What's a good rate for a first home loan?",
    ],
  },
  {
    keywords: ['pre-qualified', 'prequalified', 'pre qualify', 'get approved', 'get pre-approved'],
    reply: [
      'Pre-qualifying usually just takes basic info — income, employment, and an estimate of your credit — and gives you a ballpark of what you could borrow, without a hard credit check.',
      "From there, a lender can walk you through fixed vs. variable options and lock a rate once you're ready.",
    ],
    followups: [
      'What do I need to apply?',
      "What's the difference between fixed and variable home equity?",
      'How do I become a member?',
    ],
  },
  {
    keywords: ['what do i need to apply', 'documents', 'paperwork', 'need to apply'],
    reply: [
      "Typically you'll want proof of income (pay stubs or tax returns), ID, and information on the property or existing mortgage if it's a home equity loan.",
      'Exact requirements can vary, so the fastest way to get a precise list is talking to a lender directly.',
    ],
    followups: [
      'How do I get pre-qualified?',
      "What's a good rate for a first home loan?",
      'How do I become a member?',
    ],
  },
  {
    keywords: ['home loan', 'mortgage', 'home equity', 'first home', 'buy a house', 'buying a house'],
    reply: [
      "For home equity, we've got fixed rates starting at 5.117% (great if you want predictable payments) or a variable home equity line currently at 7.00% APR (more flexible if you'll draw funds over time).",
      "As a first step, most members get pre-qualified so they know their budget before house-hunting. Want to talk to a lender about what you'd qualify for?",
    ],
    followups: [
      "What's the difference between fixed and variable home equity?",
      'How do I get pre-qualified?',
      'What do I need to apply?',
    ],
  },

  // --- Auto loan sub-topics ---
  {
    keywords: ['new and used', 'new vs used', 'new or used'],
    reply: [
      'New auto loans start at 6.25% APR, used at 6.75% — used cars carry a slightly higher rate since they typically carry more risk and depreciation.',
      "If you're refinancing an existing auto loan, that starts at 6.00% APR.",
    ],
    followups: [
      'Do I get a discount as a member?',
      'How is my monthly payment calculated?',
      'How much should I save before buying a car?',
    ],
  },
  {
    keywords: ['discount as a member', 'relationship discount', 'member discount'],
    reply: [
      'Existing members get a 0.50% relationship discount on auto loans — so a new auto loan comes out to 5.75% APR instead of 6.25%.',
    ],
    followups: [
      'How is my monthly payment calculated?',
      "What's the difference between new and used auto rates?",
      'How do I become a member?',
    ],
  },
  {
    keywords: ['payment calculated', 'monthly payment', 'how is my payment'],
    reply: [
      'Your payment comes down to three things: how much you borrow, your rate, and your term length — longer terms lower the monthly payment but cost more in total interest.',
      "Try the loan calculator further up this page — plug in your numbers and it'll estimate your monthly payment instantly.",
    ],
    followups: [
      "What's the difference between new and used auto rates?",
      'Do I get a discount as a member?',
      'How much should I save before buying a car?',
    ],
  },
  {
    keywords: ['car', 'auto', 'vehicle', 'truck'],
    reply: [
      'New auto loans start at 6.25% APR, used auto at 6.75% — and existing members get a 0.50% relationship discount on top of that.',
      "A common rule of thumb for saving: aim for at least 10-20% down, and keep the total loan (including tax/fees) low enough that payments stay under ~10% of your take-home pay. Want the 48-month payment estimate? Try the loan calculator further up the page.",
    ],
    followups: [
      "What's the difference between new and used auto rates?",
      'Do I get a discount as a member?',
      'How is my monthly payment calculated?',
    ],
  },

  // --- Certificates / Rewards Savings sub-topics ---
  {
    keywords: ['qualify for the higher', 'qualifying-spend', 'qualify for rewards savings'],
    reply: [
      'You need a linked Everyday Banking checking account that meets a qualifying-spend requirement — once that\'s active, your Rewards Savings balance earns up to 3.00% APY.',
    ],
    followups: [
      'Can I withdraw from a certificate early?',
      "What's the difference between certificates or rewards savings?",
      'Tell me about everyday banking',
    ],
  },
  {
    keywords: ['withdraw from a certificate', 'early withdrawal', 'cash out a certificate', 'withdraw early'],
    reply: [
      "Certificates typically carry an early-withdrawal penalty, since you're agreeing to lock the funds in for the full term in exchange for the guaranteed 3.20% APY.",
      'If you think you might need the money sooner, Rewards Savings is the more flexible option.',
    ],
    followups: [
      'How do I qualify for the higher Rewards Savings rate?',
      "What's the difference between certificates or rewards savings?",
      'How do I become a member?',
    ],
  },
  {
    keywords: ['certificate', 'certificates', 'cd', 'rewards savings', 'savings account'],
    reply: [
      "Certificates lock in a fixed rate for a fixed term — our 12-month certificate is 3.20% APY right now. You get a guaranteed return, but your money's tied up until it matures.",
      'Rewards Savings is more flexible — up to 3.00% APY once your linked checking meets a qualifying-spend requirement, and you can access the funds anytime.',
      "Rule of thumb: certificates for money you won't need soon, Rewards Savings for your everyday cushion or short-term goals.",
    ],
    followups: [
      'How do I qualify for the higher Rewards Savings rate?',
      'Can I withdraw from a certificate early?',
      'Tell me about everyday banking',
    ],
  },
  {
    keywords: ['credit card', 'rewards card', 'points'],
    reply: [
      'Our credit card earns 2X points on dining and travel, plus First Tech Beyond members get extra discounts through Odyssey Rewards World Elite.',
    ],
    followups: [
      "What's a good rate for a first home loan?",
      "What's the difference between certificates or rewards savings?",
      'Tell me about business banking',
    ],
  },
  {
    keywords: ['business', 'small business', 'llc'],
    reply: [
      'Business Banking earns rewards on everyday business spend and includes discounts on Microsoft 365 and QuickBooks — worth a look if you run a small business.',
    ],
    followups: [
      'Tell me about your credit card rewards',
      'How do I become a member?',
      "What's a good rate for a first home loan?",
    ],
  },
  {
    keywords: ['member', 'join', 'eligible', 'eligibility', 'sign up'],
    reply: [
      "Membership is open through 1,700+ partner employers, and you'll get access to 5,600+ shared branches nationwide — plus every account is NCUA-insured up to $250,000.",
      'Signup takes just a few minutes if you want to get started.',
    ],
    followups: [
      "What's a good rate for a first home loan?",
      'How much should I save before buying a car?',
      'Tell me about everyday banking',
    ],
  },
  {
    keywords: ['checking', 'atm', 'everyday banking'],
    reply: [
      "Everyday Banking reimburses up to $10/month in ATM fees, and it's also what unlocks the higher Rewards Savings rate.",
    ],
    followups: [
      'How do I qualify for the higher Rewards Savings rate?',
      "What's the difference between certificates or rewards savings?",
      'How do I become a member?',
    ],
  },
  {
    keywords: ['hi', 'hello', 'hey', 'thanks', 'thank you'],
    reply: ["Happy to help! Ask me about loan rates, savings, or where to start — or type your own question below."],
    followups: DEFAULT_PROMPTS,
  },
];

function matchesKeyword(text, keyword) {
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function getMoneycoachResponse(text) {
  const intent = MONEYCOACH_INTENTS.find((i) => i.keywords.some((k) => matchesKeyword(text, k)));
  if (intent) return intent;
  return {
    reply: [
      "I don't have a canned answer for that one yet, but I can help with loan rates, savings options, or membership questions.",
      'Try asking about home loans, auto loans, certificates vs. Rewards Savings, or credit cards.',
    ],
    followups: DEFAULT_PROMPTS,
  };
}

function addMoneycoachMessage(text, role) {
  const bubble = document.createElement('div');
  bubble.className = `moneycoach-msg moneycoach-msg--${role}`;
  if (Array.isArray(text)) {
    text.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      bubble.appendChild(p);
    });
  } else {
    bubble.textContent = text;
  }
  moneycoachMessages.appendChild(bubble);
  moneycoachBody.scrollTop = moneycoachBody.scrollHeight;
  return bubble;
}

function renderMoneycoachPrompts(prompts) {
  moneycoachPrompts.innerHTML = '';
  prompts.forEach((text) => {
    const btn = document.createElement('button');
    btn.className = 'moneycoach-prompt';
    btn.type = 'button';
    btn.textContent = text;
    btn.addEventListener('click', () => sendMoneycoachMessage(text));
    moneycoachPrompts.appendChild(btn);
  });
}

function resetMoneycoach() {
  moneycoachMessages.innerHTML = '';
  moneycoachGreeting.style.display = '';
  moneycoachBadge.style.display = '';
  moneycoachInput.value = '';
  renderMoneycoachPrompts(DEFAULT_PROMPTS);
}

function sendMoneycoachMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  moneycoachGreeting.style.display = 'none';
  moneycoachBadge.style.display = 'none';

  addMoneycoachMessage(trimmed, 'user');
  moneycoachInput.value = '';

  const typing = addMoneycoachMessage('...', 'bot');
  typing.classList.add('moneycoach-msg--typing');
  window.setTimeout(() => {
    typing.remove();
    const response = getMoneycoachResponse(trimmed);
    addMoneycoachMessage(response.reply, 'bot');
    renderMoneycoachPrompts(response.followups);
  }, 500);
}

moneycoachForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMoneycoachMessage(moneycoachInput.value);
});

renderMoneycoachPrompts(DEFAULT_PROMPTS);

// Location entry (find a branch near you)
const locationBar = document.getElementById('locationBar');
const locationToggle = document.getElementById('locationToggle');
const locationValue = document.getElementById('locationValue');
const locationForm = document.getElementById('locationForm');
const locationInput = document.getElementById('locationInput');

if (locationBar) {
  function openLocationForm() {
    locationBar.classList.add('is-open');
    locationToggle.setAttribute('aria-expanded', 'true');
    locationInput.value = '';
    locationInput.focus();
  }

  function closeLocationForm() {
    locationBar.classList.remove('is-open');
    locationToggle.setAttribute('aria-expanded', 'false');
  }

  locationToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (locationBar.classList.contains('is-open')) {
      closeLocationForm();
    } else {
      openLocationForm();
    }
  });

  locationForm.addEventListener('click', (e) => e.stopPropagation());

  locationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const zip = locationInput.value.trim();
    if (!zip) return;
    locationValue.textContent = zip;
    closeLocationForm();
  });

  document.addEventListener('click', (e) => {
    if (!locationBar.contains(e.target)) closeLocationForm();
  });
}

// App callout — rotating feature showcase
const CALLOUT_FEATURES = [
  {
    icon: '_images/icons/aistars.svg',
    title: 'Money Coach',
    desc: 'Ask questions about your accounts anytime.',
    phone: '_images/phonemockup.png',
  },
  {
    icon: '_images/icons/goals.png',
    title: 'See your goals',
    desc: 'Track spending and savings goals right from the app, updated in real time.',
    phone: '_images/phonemockup.png',
  },
  {
    icon: '_images/icons/Arrow.svg',
    title: 'Move money in seconds',
    desc: 'Transfers between First Tech accounts land instantly.',
    phone: '_images/phonemockup.png',
  },
];

const calloutFeature = document.getElementById('calloutFeature');
if (calloutFeature) {
  const calloutFeatureIcon = document.getElementById('calloutFeatureIcon');
  const calloutFeatureTitle = document.getElementById('calloutFeatureTitle');
  const calloutFeatureDesc = document.getElementById('calloutFeatureDesc');
  const calloutPhoneImg = document.getElementById('calloutPhoneImg');
  let calloutIndex = 0;

  function showCalloutFeature(index) {
    calloutFeature.classList.add('is-transitioning');
    calloutPhoneImg.style.opacity = '0';
    window.setTimeout(() => {
      const feature = CALLOUT_FEATURES[index];
      calloutFeatureIcon.src = feature.icon;
      calloutFeatureTitle.textContent = feature.title;
      calloutFeatureDesc.textContent = feature.desc;
      calloutPhoneImg.src = feature.phone;
      calloutFeature.classList.remove('is-transitioning');
      calloutPhoneImg.style.opacity = '1';
    }, 300);
  }

  window.setInterval(() => {
    calloutIndex = (calloutIndex + 1) % CALLOUT_FEATURES.length;
    showCalloutFeature(calloutIndex);
  }, 5000);
}

// Why-us stats — fade in one at a time when the section scrolls into view
const statsRow = document.querySelector('.stats-row');
if (statsRow) {
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statsRow.classList.add('is-visible');
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  statsObserver.observe(statsRow);
}
