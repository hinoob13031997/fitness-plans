const beforeChartPlacementApp=appF;

function placeWeeklyDiagramByPlan(id){
  const app=document.querySelector(`#${id} .simple-app`);
  const grid=app?.querySelector('.sa-grid');
  const plan=grid?.querySelector('.sa-session');
  const diagram=app?.querySelector('.weekly-progress');
  const weight=app?.querySelector('.sa-chart')?.closest('.sa-card');
  if(!grid||!plan||!diagram)return;
  if(weight)weight.classList.add('weight-progress-card');
  const row=document.createElement('div');
  row.className='plan-progress-row';
  plan.before(row);
  row.append(plan,diagram);
}

appF=function(id,month=0){
  beforeChartPlacementApp(id,month);
  placeWeeklyDiagramByPlan(id);
};

appF('alex');
appF('elena');
