const beforeStatusApp=appF;

function addStatus(id,month){
  const root=document.querySelector(`#${id}`),app=root.querySelector('.simple-app'),p=F[id];
  let selected;
  const calendar=app.querySelector('.sa-calendar');
  const box=document.createElement('section');
  box.className='attendance';
  calendar.parentElement.after(box);
  const week=document.createElement('section');
  week.className='weekly-progress';
  app.querySelector('.sa-grid').append(week);

  function renderWeekly(){
    const train=[...app.querySelectorAll('.sa-day.train')],groups=[];
    for(let i=0;i<train.length;i+=3)groups.push(train.slice(i,i+3));
    week.innerHTML=`<span>ИТОГ НЕДЕЛЬ</span><h2>Выполнение тренировок</h2><div class="weekly-rings">${groups.map((g,i)=>{
      const yes=g.filter(x=>localStorage.getItem(`f-status-${id}-${x.dataset.date}`)==='attended').length;
      const pct=Math.round(yes/g.length*100);
      return `<article class="week-ring"><i style="--p:${pct}%"><b>${pct}%</b></i><small>НЕД ${i+1} · ${yes}/${g.length}</small></article>`;
    }).join('')}</div>`;
  }

  function setDayStyle(button){
    const status=localStorage.getItem(`f-status-${id}-${button.dataset.date}`)||'';
    button.classList.toggle('attended',status==='attended');
    button.classList.toggle('missed',status==='missed');
    button.textContent=button.textContent.replace(/[✓✕]/g,'').trim()+(status==='attended'?'✓':status==='missed'?'✕':'');
  }

  function renderExercises(){
    const session=app.querySelector('.sa-session');
    session.querySelector('ul').innerHTML=p.work[selected.slot].slice(1).map((exercise,index)=>{
      const key=`f-exercise-${id}-${selected.date}-${index}`;
      const done=localStorage.getItem(key)==='yes';
      return `<li class="exercise-item ${done?'exercise-done':''}" data-exercise="${index}"><span class="exercise-mark">${done?'✓':'○'}</span>${window.exerciseGuidance?window.exerciseGuidance(exercise):exercise}</li>`;
    }).join('');
    session.querySelectorAll('[data-exercise]').forEach(item=>item.onclick=()=>{
      const key=`f-exercise-${id}-${selected.date}-${item.dataset.exercise}`;
      const done=localStorage.getItem(key)==='yes';
      localStorage.setItem(key,done?'':'yes');
      renderExercises();
    });
  }

  function show(date,slot,button){
    selected={date,slot,button};
    app.querySelectorAll('.sa-day.train').forEach(x=>x.classList.toggle('selected',x===button));
    const session=app.querySelector('.sa-session');
    session.querySelector('h2').textContent=p.work[slot][0];
    session.querySelector('.sa-complete').style.display='none';
    renderExercises();
    box.innerHTML=`<b>${date} · ${p.work[slot][0]}</b><p>Нажимайте на упражнение для отметки. Статус всей тренировки можно изменить в любой момент.</p><div class="attend-actions"><button class="attended">✓ Сходил</button><button class="missed">✕ Пропустил</button><button class="clear">↺ Очистить</button></div>`;
    box.querySelector('.attended').onclick=()=>save('attended');
    box.querySelector('.missed').onclick=()=>save('missed');
    box.querySelector('.clear').onclick=()=>save('');
  }

  function save(status){
    localStorage.setItem(`f-status-${id}-${selected.date}`,status);
    setDayStyle(selected.button);
    renderWeekly();
    show(selected.date,selected.slot,selected.button);
  }

  app.querySelectorAll('.sa-day.train').forEach(button=>{
    setDayStyle(button);
    button.onclick=()=>show(button.dataset.date,Number(button.dataset.slot),button);
  });
  renderWeekly();
}

appF=function(id,month=0){
  beforeStatusApp(id,month);
  addStatus(id,month);
};

appF('alex');
appF('elena');
