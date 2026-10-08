(() => {
  const app = document.querySelector('#app');
  const reset = document.querySelector('#resetDemo');
  const toast = document.querySelector('#toast');

  const state = {
    step: 0,
    wellbeing: '',
    note: '',
    decision: '',
    evidenceOpen: false,
    openedSources: new Set(),
  };

  const wellbeingLabels = {
    energetic: 'Бодро',
    usual: 'Как обычно',
    low: 'Ниже обычного',
  };

  const decisionLabels = {
    intervals: 'Тренироваться по плану',
    light: 'Сделать тренировку легче',
    postpone: 'Перенести тренировку',
    later: 'Решить позже',
  };

  const icons = {
    today: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M9 20v-6h6v6"/></svg>',
    data: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9m5 10V5m6 14v-7m5 7V3"/></svg>',
    history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6M12 7v5l3 2"/></svg>',
    profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>',
  };

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function status() {
    return '<div class="status-row"><span>07:42</span><span class="status-dots">●●● · 94%</span></div>';
  }

  function progress(active) {
    return `<div class="progress" aria-label="Шаг ${active} из 5">${[1,2,3,4,5].map(n => `<span class="${n <= active ? 'done' : ''}"></span>`).join('')}</div>`;
  }

  function backButton() {
    return '<button class="ghost back" type="button" data-action="back" aria-label="Назад">‹</button>';
  }

  function nav() {
    return `<nav class="bottom-nav" aria-label="Навигация">
      <button class="nav-item active" type="button" data-nav="today">${icons.today}<span>Сегодня</span></button>
      <button class="nav-item" type="button" data-nav="data">${icons.data}<span>Данные</span></button>
      <button class="nav-item" type="button" data-nav="history">${icons.history}<span>История</span></button>
      <button class="nav-item" type="button" data-nav="profile">${icons.profile}<span>Профиль</span></button>
    </nav>`;
  }

  function sourceCard({ id, brand, badge, score, title, copy, rows, className }) {
    const open = state.openedSources.has(id);
    return `<article class="source-card ${className} ${open ? 'open' : ''}">
      <div class="source-head"><span class="source-brand">${brand}</span><span class="source-pill ${className === 'garmin' ? 'fresh' : 'sleep'}">${badge}</span></div>
      <div class="source-score">${score}</div>
      <h3>${title}</h3>
      <p class="source-copy">${copy}</p>
      <button class="source-toggle" type="button" data-action="toggle-source" data-source="${id}">${open ? 'Скрыть показатели' : 'Показать показатели'}</button>
      <div class="source-details">${rows.map(([a,b]) => `<div class="detail-row"><span>${a}</span><strong>${b}</strong></div>`).join('')}</div>
    </article>`;
  }

  function choice({ value, title, caption, group, selected }) {
    return `<button class="choice ${selected === value ? 'selected' : ''}" type="button" data-action="select-${group}" data-value="${value}">
      <span class="choice-dot" aria-hidden="true"></span>
      <span class="choice-text"><strong>${title}</strong>${caption ? `<span>${caption}</span>` : ''}</span>
    </button>`;
  }

  function todayScreen() {
    return `<div class="screen home">
      ${status()}
      <div class="top-row"><div><div class="eyebrow">Пульс · сегодня</div><h1>Доброе утро</h1></div><span class="mini-pill">Garmin + Oura</span></div>
      <section class="hero">
        <div class="hero-content">
          <span class="tag">обновлено в 07:35</span>
          <div class="hero-title">Показатели не совпадают</div>
          <p class="hero-copy">Garmin показывает обычные значения. По данным Oura, восстановление ниже обычного.</p>
        </div>
      </section>
      <div class="metric-grid">
        <article class="card metric"><div class="metric-label">Пульс покоя</div><div class="metric-value volt">62</div><div class="fine">уд/мин · Garmin</div></article>
        <article class="card metric"><div class="metric-label">Сон</div><div class="metric-value ion">5:48</div><div class="fine">сегодня · Oura</div></article>
      </div>
      <article class="conflict-card">
        <div class="conflict-label">Перед тренировкой</div>
        <h3>Сверьте данные</h3>
        <p class="body">Сравните показатели, добавьте самочувствие и примите решение.</p>
      </article>
      <button class="primary home-primary" type="button" data-action="next">Сравнить данные</button>
      ${nav()}
    </div>`;
  }

  function compareScreen() {
    return `<div class="screen">
      ${status()}
      <div class="top-row">${backButton()}<span class="mini-pill">сегодня · 9 июля</span></div>
      ${progress(1)}
      <div class="eyebrow">Шаг 1 · сравнение</div>
      <h2>Почему оценки отличаются</h2>
      <p class="body">Устройства учитывают разные показатели. Раскройте карточки, чтобы проверить дату, единицы измерения и источник.</p>
      <div class="source-stack">
        ${sourceCard({ id:'garmin', className:'garmin', brand:'GARMIN', badge:'сегодня · 07:31', score:'82', title:'Показатели близки к обычным', copy:'Пульс покоя и вчерашняя нагрузка — в вашем обычном диапазоне.', rows:[['Пульс покоя','62 уд/мин'],['HRV','64 мс'],['Источник','файл Garmin']] })}
        ${sourceCard({ id:'oura', className:'oura', brand:'OURA', badge:'сегодня · 07:35', score:'58', title:'Восстановление ниже обычного', copy:'Ночной сон был короче обычного, а HRV — ниже вашего диапазона за неделю.', rows:[['Сон','5 ч 48 мин'],['HRV','52 мс'],['Источник','файл Oura']] })}
      </div>
      <button class="primary" type="button" data-action="next">Добавить самочувствие</button>
    </div>`;
  }

  function wellbeingScreen() {
    return `<div class="screen">
      ${status()}
      <div class="top-row">${backButton()}<span class="mini-pill">личный контекст</span></div>
      ${progress(2)}
      <div class="eyebrow">Шаг 2 · самочувствие</div>
      <h2>Как вы себя чувствуете?</h2>
      <p class="body">Отметка дополнит показатели устройств. «Пульс» не использует её для диагноза или готового решения.</p>
      <div class="choice-list">
        ${choice({value:'energetic', title:'Бодро', caption:'Энергии больше обычного', group:'wellbeing', selected:state.wellbeing})}
        ${choice({value:'usual', title:'Как обычно', caption:'Самочувствие без изменений', group:'wellbeing', selected:state.wellbeing})}
        ${choice({value:'low', title:'Ниже обычного', caption:'Чувствую усталость', group:'wellbeing', selected:state.wellbeing})}
      </div>
      <label class="fine" for="wellbeingNote">Комментарий — необязательно</label>
      <textarea class="note-field" id="wellbeingNote" placeholder="Например: поздно лёг спать">${state.note}</textarea>
      <div style="height:12px"></div>
      <button class="primary" type="button" data-action="next" ${state.wellbeing ? '' : 'disabled'}>Посмотреть объяснение</button>
    </div>`;
  }

  function briefScreen() {
    return `<div class="screen">
      ${status()}
      <div class="top-row">${backButton()}<span class="mini-pill">объяснение «Пульса»</span></div>
      ${progress(3)}
      <div class="eyebrow">Шаг 3 · объяснение</div>
      <h2>Почему данные не совпадают</h2>
      <p class="body">«Пульс» объясняет расхождение, но не выбирает нагрузку за вас.</p>
      <article class="assistant-card">
        <div class="assistant-label">✦ сводка</div>
        <h3>Устройства учитывают разные показатели</h3>
        <div class="insight-list">
          <div class="insight"><span class="insight-index">01</span><span>Garmin учитывает пульс покоя и недавнюю нагрузку. Сегодня они близки к вашим обычным значениям.</span></div>
          <div class="insight"><span class="insight-index">02</span><span>Oura сильнее учитывает сон. Сегодня вы спали на 1 ч 12 мин меньше обычного.</span></div>
          <div class="insight"><span class="insight-index">03</span><span>Вы отметили: «${wellbeingLabels[state.wellbeing]}». «Пульс» показывает это рядом с данными, но не делает медицинских выводов.</span></div>
        </div>
      </article>
      <button class="secondary" style="width:100%" type="button" data-action="toggle-evidence">${state.evidenceOpen ? 'Скрыть источники' : 'На чём основано'}</button>
      <div class="evidence" ${state.evidenceOpen ? '' : 'hidden'}>
        <div class="evidence-row"><span>Garmin</span><span>файл · 07:31</span></div>
        <div class="evidence-row"><span>Oura</span><span>файл · 07:35</span></div>
        <div class="evidence-row"><span>Самочувствие</span><span>ваша отметка</span></div>
        <div class="evidence-row"><span>Важно</span><span>это не медицинская рекомендация</span></div>
      </div>
      <div style="height:12px"></div>
      <button class="primary" type="button" data-action="next">Выбрать нагрузку</button>
    </div>`;
  }

  function decisionScreen() {
    return `<div class="screen">
      ${status()}
      <div class="top-row">${backButton()}<span class="mini-pill">вы решаете</span></div>
      ${progress(4)}
      <div class="eyebrow">Шаг 4 · ваш выбор</div>
      <h2>Как поступить с тренировкой?</h2>
      <p class="body">Выберите вариант. «Пульс» сохранит его вместе с текущими данными, но не изменит тренировку в Garmin или другом приложении.</p>
      <div class="decision-banner"><strong>Что учтено:</strong> данные не совпадают · самочувствие «${wellbeingLabels[state.wellbeing]}»</div>
      <div class="choice-list">
        ${choice({value:'intervals', title:'Тренироваться по плану', caption:'Оставить интервальную тренировку', group:'decision', selected:state.decision})}
        ${choice({value:'light', title:'Сделать тренировку легче', caption:'Самостоятельно снизить нагрузку', group:'decision', selected:state.decision})}
        ${choice({value:'postpone', title:'Перенести тренировку', caption:'Вернуться к ней в другой день', group:'decision', selected:state.decision})}
        ${choice({value:'later', title:'Решить позже', caption:'Ничего не сохранять сейчас', group:'decision', selected:state.decision})}
      </div>
      <button class="primary" type="button" data-action="save" ${state.decision ? '' : 'disabled'}>Сохранить выбор</button>
    </div>`;
  }

  function completeScreen() {
    return `<div class="screen">
      ${status()}
      ${progress(5)}
      <div class="success-orbit"><span class="success-check">✓</span></div>
      <div style="text-align:center"><div class="eyebrow">Выбор сохранён</div><h2 style="margin-top:8px">Решение записано</h2><p class="body">К записи добавлены самочувствие и источники. Вы сможете изменить выбор.</p></div>
      <article class="card summary-card">
        <div class="summary-row"><span>Ваш выбор</span><strong>${decisionLabels[state.decision]}</strong></div>
        <div class="summary-row"><span>Самочувствие</span><strong>${wellbeingLabels[state.wellbeing]}</strong></div>
        <div class="summary-row"><span>Источники</span><strong>Garmin · Oura</strong></div>
        <div class="summary-row"><span>Время</span><strong>07:46</strong></div>
      </article>
      <button class="secondary" style="width:100%" type="button" data-action="edit-decision">Изменить решение</button>
      <div style="height:10px"></div>
      <button class="ghost" style="width:100%" type="button" data-action="finish">На главный экран</button>
      ${nav()}
    </div>`;
  }

  function render() {
    const screens = [todayScreen, compareScreen, wellbeingScreen, briefScreen, decisionScreen, completeScreen];
    app.innerHTML = screens[state.step]();
    const field = document.querySelector('#wellbeingNote');
    if (field) field.addEventListener('input', event => { state.note = event.target.value; });
  }

  app.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    const { action, value, source, nav: navTarget } = target.dataset;

    if (navTarget && navTarget !== 'today') {
      showToast('В демо доступен маршрут с главного экрана');
      return;
    }
    if (navTarget === 'today') {
      state.step = 0;
      render();
      return;
    }

    if (action === 'next') state.step = Math.min(5, state.step + 1);
    if (action === 'back') state.step = Math.max(0, state.step - 1);
    if (action === 'toggle-source') {
      state.openedSources.has(source) ? state.openedSources.delete(source) : state.openedSources.add(source);
    }
    if (action === 'select-wellbeing') state.wellbeing = value;
    if (action === 'select-decision') state.decision = value;
    if (action === 'toggle-evidence') state.evidenceOpen = !state.evidenceOpen;
    if (action === 'save') state.step = 5;
    if (action === 'edit-decision') state.step = 4;
    if (action === 'finish') state.step = 0;
    render();
  });

  reset.addEventListener('click', () => {
    state.step = 0;
    state.wellbeing = '';
    state.note = '';
    state.decision = '';
    state.evidenceOpen = false;
    state.openedSources.clear();
    render();
    showToast('Демонстрация возвращена к началу');
  });

  render();
})();
