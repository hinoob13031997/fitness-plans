const beforeJournalControlsApp=appF;

function enhanceJournal(id,month){
  const app=document.querySelector(`#${id} .simple-app`);
  if(!app)return;
  const chartCard=app.querySelector('.sa-chart')?.closest('.sa-card');
  const log=chartCard?.querySelector('.sa-log');
  if(!chartCard||!log)return;

  const entries=JSON.parse(localStorage.getItem(`f-log-${id}`)||'[]');
  log.innerHTML=entries.length
    ? `<div class="journal-list">${entries.slice().reverse().map((entry,reverseIndex)=>{
        const index=entries.length-1-reverseIndex;
        return `<div class="journal-row"><span>${entry.date}: ${entry.weight} кг · ${entry.ex} · ${entry.load}</span><button type="button" data-remove-entry="${index}" aria-label="Удалить запись">Удалить</button></div>`;
      }).join('')}</div><button type="button" class="clear-journal">Очистить весь журнал</button>`
    : '<p class="sa-note">Пока нет записей. После сохранения здесь появится вес и результат упражнения.</p>';

  log.querySelectorAll('[data-remove-entry]').forEach(button=>button.onclick=()=>{
    const next=JSON.parse(localStorage.getItem(`f-log-${id}`)||'[]');
    next.splice(Number(button.dataset.removeEntry),1);
    localStorage.setItem(`f-log-${id}`,JSON.stringify(next));
    appF(id,month);
  });
  log.querySelector('.clear-journal')?.addEventListener('click',()=>{
    if(confirm('Очистить все записи журнала? Это действие нельзя отменить.')){
      localStorage.removeItem(`f-log-${id}`);
      appF(id,month);
    }
  });
}

appF=function(id,month=0){
  beforeJournalControlsApp(id,month);
  enhanceJournal(id,month);
};

appF('alex');
appF('elena');
