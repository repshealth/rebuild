(function () {
  'use strict';

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mnav = document.querySelector('.mobile-nav');
  if (toggle && mnav) {
    toggle.addEventListener('click', function () {
      var open = mnav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mnav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- app showcase ---------- */
  var show = document.querySelector('.app-show');
  if (show) {
    var blocks = [].slice.call(show.querySelectorAll('.ap-block'));
    var keys = blocks.map(function (b) { return b.getAttribute('data-ap'); });
    var current = keys[0];

    function paint(key) {
      if (key === current) { return; }
      var prevIdx = keys.indexOf(current);
      var nextIdx = keys.indexOf(key);
      current = key;
      [].forEach.call(show.querySelectorAll('[data-ap]'), function (el) {
        var on = el.getAttribute('data-ap') === key;
        if (el.classList.contains('ap-screen')) {
          el.classList.toggle('is-out', !on && keys.indexOf(el.getAttribute('data-ap')) < nextIdx);
        }
        el.classList.toggle('is-on', on);
      });
    }

    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { paint(en.target.getAttribute('data-ap')); }
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      blocks.forEach(function (b) { so.observe(b); });
    }

    [].forEach.call(show.querySelectorAll('.ap-dot'), function (dot) {
      dot.addEventListener('click', function () {
        var key = dot.getAttribute('data-ap');
        paint(key);
        var target = show.querySelector('.ap-block[data-ap="' + key + '"]');
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      });
    });
  }

  /* ---------- video: tap the poster overlay to start ---------- */
  [].forEach.call(document.querySelectorAll('.video-slot'), function (slot) {
    var ph = slot.querySelector('.video-ph');
    var vid = slot.querySelector('video');
    if (!ph || !vid) { return; }
    ph.addEventListener('click', function () {
      slot.classList.add('is-playing');
      var played = vid.play();
      if (played && played.catch) { played.catch(function () {}); }
    });
    // pause the other video when one starts
    vid.addEventListener('play', function () {
      [].forEach.call(document.querySelectorAll('.video-slot video'), function (other) {
        if (other !== vid) { other.pause(); }
      });
    });
  });

  /* ---------- marquee, built from srcs already on the page ---------- */
  var track = document.getElementById('marquee-track');
  var extraBox = document.getElementById('marquee-extra');
  if (track) {
    var srcs = [].map.call(document.querySelectorAll('.ap-screen'), function (i) { return i.src; });
    if (extraBox) {
      srcs = srcs.concat([].map.call(extraBox.querySelectorAll('img'), function (i) { return i.src; }));
    }
    var half = document.createDocumentFragment();
    srcs.forEach(function (src) {
      var im = new Image();
      im.src = src; im.alt = ''; im.loading = 'lazy';
      half.appendChild(im);
    });
    track.appendChild(half.cloneNode(true));
    track.appendChild(half);
  }

  /* ---------- faq ---------- */
  [].forEach.call(document.querySelectorAll('.faq-q'), function (q) {
    q.addEventListener('click', function () {
      var open = q.getAttribute('aria-expanded') === 'true';
      var panel = q.nextElementSibling;
      q.setAttribute('aria-expanded', !open);
      panel.style.maxHeight = open ? null : panel.scrollHeight + 'px';
    });
  });

  /* ---------- quiz ---------- */
  var quiz = document.getElementById('rebuild-quiz');
  if (!quiz) { return; }
  var answers = {};
  var LAST_Q = 4;

  function goTo(n) {
    [].forEach.call(quiz.querySelectorAll('.quiz-step'), function (s) {
      s.classList.toggle('is-active', +s.getAttribute('data-step') === n);
    });
    [].forEach.call(quiz.querySelectorAll('.quiz-prog span'), function (b) {
      b.classList.toggle('is-done', +b.getAttribute('data-step') <= n);
    });
    var card = quiz.getBoundingClientRect();
    if (card.top < 0) { quiz.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  [].forEach.call(quiz.querySelectorAll('.quiz-opt'), function (opt) {
    opt.addEventListener('click', function () {
      var group = opt.closest('.quiz-opts');
      var key = group.getAttribute('data-q');
      answers[key] = opt.getAttribute('data-v');
      [].forEach.call(group.querySelectorAll('.quiz-opt'), function (o) {
        o.classList.toggle('is-picked', o === opt);
      });
      var step = +opt.closest('.quiz-step').getAttribute('data-step');
      setTimeout(function () { goTo(step + 1); }, 220);
    });
  });

  [].forEach.call(quiz.querySelectorAll('.quiz-back'), function (b) {
    b.addEventListener('click', function () { goTo(+b.getAttribute('data-goto')); });
  });

  quiz.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('q-name').value.trim();
    var email = document.getElementById('q-email').value.trim();
    var phone = document.getElementById('q-phone').value.trim();
    var err = document.getElementById('q-err');
    var ok = name.length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    err.classList.toggle('is-on', !ok);
    if (!ok) { return; }

    var payload = {
      client: 'rebuild',
      source: 'quiz',
      form: 'Website check',
      page: location.pathname,
      utm_campaign: new URLSearchParams(location.search).get('utm_campaign') || '',
      name: name,
      email: email,
      phone: phone,
      answers: {
        'Main goal': answers.goal || '',
        'Biggest struggle': answers.struggle || '',
        'Support wanted': answers.support || ''
      }
    };

    // Leads land in the REPS dashboard under the Rebuild client.
    var LEADS_ENDPOINT = 'https://repshealthgrowth.com/api/forms';

    function done() {
      quiz.classList.remove('is-sending');
      goTo(5);
    }

    quiz.classList.add('is-sending');
    fetch(LEADS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) { console.error('Lead not accepted:', r.status); }
      done();
    }).catch(function (e) {
      // Never strand the person on the form if the network fails.
      console.error('Lead send failed:', e);
      done();
    });
  });
})();
