let left_cloud = document.getElementById('left');
let small_cloud = document.getElementById('small');
let right_cloud = document.getElementById('right');
let start = document.getElementById('start');

window.addEventListener('scroll', function(){
    let value = window.scrollY;
    small_cloud.style.left = value * (1.75) + 'px';
    left_cloud.style.left = value * (1.75) + 'px';
    right_cloud.style.left = value * -1.75 + 'px';
})