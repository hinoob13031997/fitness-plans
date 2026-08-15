document.querySelectorAll('.switch [data-person]').forEach(button=>{
  button.addEventListener('click',()=>{
    const id=button.dataset.person;
    document.querySelectorAll('.person').forEach(person=>person.classList.toggle('active',person.id===id));
    document.querySelectorAll('.switch [data-person]').forEach(item=>item.classList.toggle('active',item===button));
    window.scrollTo({top:0,behavior:'smooth'});
  });
});
