const nutritionBaseApp = appF;

const nutritionTargets = {
  alex: { protein: 130, fats: 75, carbs: 389, veg: 450, water: 8, adjust: 180 },
  elena: { protein: 110, fats: 55, carbs: 164, veg: 400, water: 7, adjust: 120 }
};

const nutritionSwaps = {
  alex: [
    ['Крупа или паста', 'рис ↔ гречка ↔ макароны ↔ картофель'],
    ['Курица', 'индейка ↔ яйца ↔ тунец в собственном соку'],
    ['Творог', 'кефир ↔ натуральный йогурт'],
    ['Фрукт', 'банан ↔ яблоко ↔ груша (по сезону)']
  ],
  elena: [
    ['Крупа', 'гречка ↔ рис ↔ картофель ↔ макароны'],
    ['Курица/индейка', 'рыба ↔ яйца ↔ творог'],
    ['Кефир/йогурт', 'творог ↔ натуральный йогурт'],
    ['Фрукт', 'яблоко ↔ банан ↔ апельсин (по сезону)']
  ]
};

function nutritionStatus(id) {
  const entries = JSON.parse(localStorage.getItem(`f-log-${id}`) || '[]')
    .filter(x => x.date && Number.isFinite(+x.weight))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (entries.length < 2) return 'Добавьте минимум две записи веса с разницей около 14 дней — появится подсказка по порциям.';
  const last = entries.at(-1);
  const prior = [...entries].reverse().find(x => (new Date(last.date) - new Date(x.date)) / 86400000 >= 12);
  if (!prior) return 'Нужно две записи веса с интервалом около 14 дней — пока порции не меняем.';
  const days = Math.max(1, Math.round((new Date(last.date) - new Date(prior.date)) / 86400000));
  const change = +(last.weight - prior.weight).toFixed(1);
  if (id === 'alex') {
    if (change < 0.2) return `За ${days} дн. вес изменился на ${change} кг. Если самочувствие нормальное, добавьте ≈${nutritionTargets[id].adjust} ккал: +40 г сухой крупы или +1 банан и 15 г арахиса.`;
    if (change > 0.9) return `За ${days} дн. вес вырос на ${change} кг. Уберите ≈${nutritionTargets[id].adjust} ккал: −40 г сухой крупы или −15 г арахиса и 1 банан.`;
    return `За ${days} дн. вес вырос на ${change} кг. Темп выглядит ровным — текущие порции оставьте без изменений.`;
  }
  if (change > -0.1) return `За ${days} дн. вес изменился на ${change} кг. Если нет сильного голода и упадка сил, уменьшите рацион примерно на ${nutritionTargets[id].adjust} ккал: −30 г сухой крупы или −10 г орехов и 1 фрукт.`;
  if (change < -0.8) return `За ${days} дн. вес снизился на ${Math.abs(change)} кг. Это может быть слишком быстро: добавьте ≈${nutritionTargets[id].adjust} ккал и оцените самочувствие.`;
  return `За ${days} дн. вес снизился на ${Math.abs(change)} кг. Темп выглядит умеренным — текущие порции оставьте без изменений.`;
}

function renderNutritionExtras(id, month) {
  const app = document.querySelector(`#${id} .simple-app`);
  if (!app) return;
  const session = app.querySelector('.sa-session');
  const attendance = app.querySelector('.attendance');
  if (session && attendance && !attendance.innerHTML.trim()) {
    session.querySelector('h2').textContent = 'Выберите день тренировки';
    session.querySelector('ul').innerHTML = '<li class="session-hint">Нажмите на синюю дату ПН, СР или ПТ в календаре — здесь появится подходящая тренировка.</li>';
    session.querySelector('.sa-complete').style.display = 'none';
  }
  app.querySelectorAll('.sa-day.train').forEach(day => day.addEventListener('click', () => session?.querySelector('.session-hint')?.remove()));
  const calendarCard = [...app.querySelectorAll('.sa-card')].find(card => card.querySelector('.sa-calendar'));
  if (calendarCard && !calendarCard.querySelector('.calendar-legend')) {
    const legend = document.createElement('p');
    legend.className = 'calendar-legend';
    legend.innerHTML = '<i class="planned"></i> Запланировано <i class="attended"></i> Выполнено <i class="missed"></i> Пропущено';
    calendarCard.append(legend);
  }
  const head = app.querySelector('.sa-head');
  if (head && !head.querySelector('.today-button')) {
    const today = document.createElement('button');
    today.type = 'button'; today.className = 'today-button'; today.textContent = 'Сегодня';
    today.onclick = () => { const now = new Date(); appF(id, (now.getFullYear() - 2026) * 12 + now.getMonth() - 7); };
    head.append(today);
  }
  const chartLog = app.querySelector('.sa-chart')?.closest('.sa-card')?.querySelector('.sa-log');
  if (chartLog && /Пока нет записей/.test(chartLog.textContent)) chartLog.innerHTML = '<p class="sa-note">Введите вес тела после тренировки — здесь появится график и список записей. Ошибочную запись можно удалить.</p>';
  const target = nutritionTargets[id];
  const dietCard = [...app.querySelectorAll('.sa-card')].find(card => card.querySelector('.sa-meal'));
  if (!dietCard) return;
  dietCard.querySelectorAll('.nutrition-extra').forEach(x => x.remove());
  const macros = document.createElement('div');
  macros.className = 'nutrition-extra macro-summary';
  macros.innerHTML = `<b>Цель на день</b><span>Белки ${target.protein} г · Жиры ${target.fats} г · Углеводы ${target.carbs} г</span>`;
  dietCard.querySelector('h2').after(macros);
  const tracker = document.createElement('section');
  tracker.className = 'nutrition-extra nutrition-tracker';
  const today = new Date().toISOString().slice(0, 10);
  const waterKey = `f-water-${id}-${today}`;
  const vegKey = `f-veg-${id}-${today}`;
  let glasses = Math.min(target.water, Number(localStorage.getItem(waterKey) || 0));
  let vegDone = localStorage.getItem(vegKey) === 'yes';
  function drawTracker() {
    tracker.innerHTML = `<b>Ежедневные отметки</b><div><button type="button" class="water-button">💧 Вода: ${glasses}/${target.water} стаканов</button><button type="button" class="veg-button ${vegDone ? 'is-done' : ''}">🥬 Овощи и фрукты: ${target.veg} г ${vegDone ? '✓' : ''}</button></div>`;
    tracker.querySelector('.water-button').onclick = () => { glasses = glasses >= target.water ? 0 : glasses + 1; localStorage.setItem(waterKey, glasses); drawTracker(); };
    tracker.querySelector('.veg-button').onclick = () => { vegDone = !vegDone; localStorage.setItem(vegKey, vegDone ? 'yes' : ''); drawTracker(); };
  }
  drawTracker();
  dietCard.append(tracker);
  const guide = document.createElement('section');
  guide.className = 'nutrition-extra portion-guide';
  guide.innerHTML = `<b>Корректор порций по весу</b><p>${nutritionStatus(id)}</p><small>Это подсказка, а не автоматическое изменение рациона. При заболеваниях, беременности или приёме лекарств — согласуйте питание с врачом.</small>`;
  dietCard.after(guide);
  const swaps = document.createElement('details');
  swaps.className = 'nutrition-extra food-swaps';
  swaps.innerHTML = `<summary>Замены продуктов без смены логики рациона</summary><ul>${nutritionSwaps[id].map(([from, to]) => `<li><b>${from}:</b> ${to}</li>`).join('')}</ul>`;
  guide.after(swaps);
  if (month >= 2) {
    const supplement = document.createElement('p');
    supplement.className = 'nutrition-extra supplement-rule';
    supplement.textContent = id === 'alex' ? 'Гейнер: показывается только после выбора тренировочного дня; используйте порцию по этикетке, если калории не добраны обычной едой.' : 'Протеин: показывается только после выбора тренировочного дня; 20–25 г белка, как дополнение к рациону.';
    swaps.after(supplement);
  }
  app.querySelectorAll('.sa-meal').forEach(row => { if (/гейнер|протеин/i.test(row.textContent)) row.remove(); });
  app.querySelectorAll('.sa-day.train').forEach(day => day.addEventListener('click', () => {
    app.querySelector('.selected-supplement')?.remove();
    if (month < 2) return;
    const note = document.createElement('p');
    note.className = 'selected-supplement';
    note.textContent = id === 'alex' ? 'После этой тренировки: гейнер — ½–1 порция по этикетке, только если не добираются калории едой.' : 'После этой тренировки: протеин — порция, содержащая 20–25 г белка; это не замена ужина.';
    app.querySelector('.attendance')?.after(note);
  }));
}

appF = function(id, month = 0) {
  nutritionBaseApp(id, month);
  renderNutritionExtras(id, month);
};
appF('alex');
appF('elena');
