(function () {
  var track = document.getElementById('panelsTrack');
  var pills = Array.prototype.slice.call(document.querySelectorAll('.pill-nav__btn'));
  var isProgrammaticScroll = false;
  var scrollEndTimer = null;

  function setActive(index) {
    pills.forEach(function (btn, i) {
      var active = i === index;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    pills[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function goTo(index) {
    var target = index * track.clientWidth;
    isProgrammaticScroll = true;
    track.scrollTo({ left: target, behavior: 'smooth' });
    setActive(index);
    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(function () {
      // Fallback in case the smooth-scroll animation stalled (e.g. a backgrounded tab
      // throttling rAF) so a tap always lands on the right panel.
      if (Math.round(track.scrollLeft) !== target) track.scrollLeft = target;
      isProgrammaticScroll = false;
    }, 500);
  }

  pills.forEach(function (btn, index) {
    btn.addEventListener('click', function () {
      goTo(index);
    });
  });

  track.addEventListener('scroll', function () {
    if (isProgrammaticScroll) return;
    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(function () {
      var index = Math.round(track.scrollLeft / track.clientWidth);
      setActive(index);
    }, 80);
  });
})();

// ===================== Bottom nav / app sections ==========================
(function () {
  var navButtons = Array.prototype.slice.call(document.querySelectorAll('.bottom-nav__btn'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.app-section'));
  var currentSection = 'home';

  function showSection(key) {
    if (currentSection === 'coach' && key !== 'coach' && typeof window.resetCoach === 'function') {
      window.resetCoach();
    }
    currentSection = key;
    sections.forEach(function (section) {
      section.classList.toggle('is-active', section.dataset.section === key);
    });
    navButtons.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.section === key);
    });
  }

  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      showSection(btn.dataset.section);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.subpage-header__back')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      showSection(btn.dataset.section);
    });
  });
})();

// ===================== Coach (Money Coach functionality) ==========================
(function () {
  var body = document.getElementById('coachBody');
  var form = document.getElementById('coachForm');
  if (!form) return;

  var greeting = document.getElementById('coachGreeting');
  var messages = document.getElementById('coachMessages');
  var prompts = document.getElementById('coachPrompts');
  var input = document.getElementById('coachInput');

  var DEFAULT_PROMPTS = [
    'Why is my dining spend up this month?',
    "How's my Home Down Payment goal doing?",
    'How am I doing on my August budget?'
  ];

  var INTENTS = [
    {
      keywords: ['dining', 'restaurant', 'takeout', 'food'],
      reply: ["You've spent $342 on dining this month — about 15% ($45) above your usual pace. A couple fewer takeout orders would put you back on track."],
      followups: ["How's my Home Down Payment goal doing?", 'How am I doing on my August budget?', 'What can I cut back on?']
    },
    {
      keywords: ['home down payment', 'down payment', 'home goal', 'house goal'],
      reply: ["You're 68% of the way to your $40,000 Home Down Payment goal. At your current pace you'll reach it by next spring — adding $150/mo would get you there about 3 months sooner."],
      followups: ['Why is my dining spend up this month?', 'How am I doing on my August budget?']
    },
    {
      keywords: ['budget', 'august'],
      reply: ["You've used 68% of your typical monthly budget with about a third of the month left — you're on track."],
      followups: ["How's my Home Down Payment goal doing?", 'What can I cut back on?']
    },
    {
      keywords: ['card', 'rewards', 'points'],
      reply: ['Your Odyssey Rewards World Elite Mastercard earns 2X points on dining and travel — moving your dining spend to that card instead of your debit card could earn about 340 bonus points/mo.'],
      followups: ['Why is my dining spend up this month?', 'How am I doing on my August budget?']
    },
    {
      keywords: ['cut back', 'save more', 'subscription', 'classpass'],
      reply: ["ClassPass hasn't had a check-in in 60+ days — canceling would free up $29/month toward your goals."],
      followups: DEFAULT_PROMPTS
    },
    {
      keywords: ['hi', 'hello', 'hey', 'thanks', 'thank you'],
      reply: ['Happy to help! Ask me about your spending, goals, or accounts — or type your own question below.'],
      followups: DEFAULT_PROMPTS
    }
  ];

  function matchesKeyword(text, keyword) {
    var escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
  }

  function getResponse(text) {
    var intent = INTENTS.find(function (i) {
      return i.keywords.some(function (k) { return matchesKeyword(text, k); });
    });
    if (intent) return intent;
    return {
      reply: ["I don't have a canned answer for that one yet, but I can help with your spending, goals, or accounts."],
      followups: DEFAULT_PROMPTS
    };
  }

  function addMessage(text, role) {
    var bubble = document.createElement('div');
    bubble.className = 'coach-msg coach-msg--' + role;
    if (Array.isArray(text)) {
      text.forEach(function (line) {
        var p = document.createElement('p');
        p.textContent = line;
        bubble.appendChild(p);
      });
    } else {
      bubble.textContent = text;
    }
    messages.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
    return bubble;
  }

  function renderPrompts(list) {
    prompts.innerHTML = '';
    list.forEach(function (text) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'coach-prompt';
      btn.textContent = text;
      btn.addEventListener('click', function () { sendMessage(text); });
      prompts.appendChild(btn);
    });
  }

  function sendMessage(text) {
    var trimmed = text.trim();
    if (!trimmed) return;

    greeting.style.display = 'none';
    addMessage(trimmed, 'user');
    input.value = '';

    var typing = addMessage('...', 'bot');
    typing.classList.add('coach-msg--typing');
    window.setTimeout(function () {
      typing.remove();
      var response = getResponse(trimmed);
      addMessage(response.reply, 'bot');
      renderPrompts(response.followups);
    }, 500);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage(input.value);
  });

  function reset() {
    messages.innerHTML = '';
    greeting.style.display = '';
    input.value = '';
    renderPrompts(DEFAULT_PROMPTS);
  }

  window.resetCoach = reset;
  renderPrompts(DEFAULT_PROMPTS);
})();
