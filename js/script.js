// Mobile nav toggle
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.navbar__toggle');
navToggle.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
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
const memberType = document.getElementById('memberType');
const loanType = document.getElementById('loanType');
const loanAmount = document.getElementById('loanAmount');
const loanTerm = document.getElementById('loanTerm');
const rateBox = document.getElementById('rateBox');
const paymentEstimate = document.getElementById('paymentEstimate');

const RELATIONSHIP_DISCOUNT = 0.50; // existing member discount, percentage points

function parseAmount(value) {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function formatAmount(n) {
  return n.toLocaleString('en-US');
}

function currentRate() {
  const baseRate = parseFloat(loanType.selectedOptions[0].dataset.rate);
  const discount = memberType.value === 'existing' ? RELATIONSHIP_DISCOUNT : 0;
  return Math.max(baseRate - discount, 0);
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

[memberType, loanType, loanTerm].forEach((el) => el.addEventListener('change', () => {
  sizeSelect(el);
  recalculate();
}));

recalculate();
sizeAmountInput();
[memberType, loanType, loanTerm].forEach(sizeSelect);
