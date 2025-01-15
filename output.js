const run=document.querySelector('#run');
run.addEventListener('click',function(e){
    document.querySelector('#output').innerHTML=`${document.querySelector('#results').value} is code to compile`
})