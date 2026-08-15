const afterDietApp=appF;
appF=function(id,month=0){afterDietApp(id,month);const app=document.querySelector(`#${id} .simple-app`);if(id==='alex'&&app)app.querySelectorAll('.sa-meal').forEach(row=>{if(row.textContent.includes('фасоль'))row.innerHTML='<b>21:00</b>Макароны 80 г сух., куриное бедро без кожи 150 г готов., овощи 200 г';});};
appF('alex');appF('elena');
