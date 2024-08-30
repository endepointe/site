
const slideItems = document.getElementById('slide-list-items').children;
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

for (let i = 0; i < slideItems.length; i++) 
{
    slideItems[i].addEventListener('click', () => {
        goToSlide(i);
    });
}

function goToSlide(n) 
{
    slides[currentSlide].classList.add('visually-hidden');
    slides[n].classList.remove('visually-hidden');
    currentSlide = n;
}
