const buttons=document.querySelectorAll('[data-person]');
buttons.forEach(button=>button.addEventListener('click',()=>{
  buttons.forEach(item=>item.classList.toggle('active',item===button));
  document.querySelectorAll('.person').forEach(page=>page.classList.toggle('active',page.id===button.dataset.person));
  window.scrollTo({top:0,behavior:'smooth'});
}));
