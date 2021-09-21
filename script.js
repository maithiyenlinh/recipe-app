const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const appName = $('.app-name')
const mealContainer = $('.meal-container');

const favRecipe = $('.fav-recipes');

const searchName = $('#search');
const searchBtn = $('.fa-search');

const mealPopup = $('#meal-popup');
const closeBtn = $('.icon-close');
const iconInfo = $('.icon-info');

const infoContainer = $('.meal-info-container');
const mealInfoWrapper = $('.meal-info');
const mealHeading = $('.meal-info__heading');
const table = $('table');
const mealFooter = $('.meal-info__footer');

const app = {
    // hanle Config localStorage 
    getConfig(key) {
        return JSON.parse(localStorage.getItem(key)) || ["52877", "53020", "52923", "53006"];
    },
    
    setConfig(key, value) {
        const config = this.getConfig(key);
        localStorage.setItem(key, JSON.stringify([...config, value]));
    },

    removeConfig(key, value) {
        const config = this.getConfig(key);
        localStorage.setItem(key, JSON.stringify(config.filter(id => id != value)))
    },

    // Get data from API
    async getRandomMeal() {
        const reponse = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await reponse.json();
        const randomMeal = data.meals[0];
        this.addMeal(randomMeal, true);
    },

    async getMealById(id) {
        const reponse = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
        const data = await reponse.json();
        const mealById = data.meals[0];
        return mealById;
    },

    async getMealBySearch(name) {
        const repository = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + name);
        const data = await repository.json();
        const mealBySearch = data.meals;
        return mealBySearch;
    },

    //Add meals
    addMeal(mealData, random = false) {
        const favMeals = this.getConfig('idMeal');
        const meal = document.createElement('div');
        meal.classList.add('meal');
        meal.id = mealData.idMeal;
        meal.innerHTML = `
        <div class="meal-heading ${random ? "random" : ""}">
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="meal-img">
        </div>
        <div class="meal-body">
            <div class="meal-name">
                ${mealData.strMeal}
            </div>
            <button class="btn btn-fav">
                <i class="icon ${favMeals.includes(mealData.idMeal) ? 'fa' : 'far'} fa-heart"></i>
            </button>
        </div>
        `
        mealContainer.appendChild(meal);
        this.handleEvent();
    },

    //handle events on web
    handleEvent() {
        const favBtns = $$('.btn-fav');
        favBtns.forEach(favBtn => {
            favBtn.onclick = (e) => {
                const idMeal = e.target.closest('.meal').id;
                if (e.target.localName === 'i') {
                    if (e.target.classList.toggle('fa')) {
                        e.target.classList.remove('far');
                        this.setConfig('idMeal', idMeal);
                        this.addFavMeals(idMeal);
                    } else {
                        e.target.classList.add('far');
                        this.removeConfig('idMeal', idMeal);
                        this.removeFavMeal(idMeal);
                    }
                }
            };
        });

        searchBtn.onclick = async () => {
            const meals = await this.getMealBySearch(searchName.value);
            mealContainer.innerHTML = '';
            if (meals) {
                meals.forEach(meal => {
                    this.addMeal(meal);
                })
            }
            searchName.value = '';
        };

        const meals = $$('.meal');
        meals.forEach(meal => {
            meal.onclick = (e) => {
                const transfer = e.target.localName === 'img' || e.target.closest('.meal-name') !== null;
                if (transfer) {
                    const idMeal = e.target.closest('.meal').id;
                    this.openRecipe(idMeal);
                }
            }
        });

        
        favRecipe.onclick = (e) => {
            const idMeal = e.target.closest('.fav-item').id.slice(4);
            this.openRecipe(idMeal);
        }

        
        closeBtn.onclick = () => {
            infoContainer.classList.add('hidden');
        }

        const iconHearts = $$('.fa-heart:not(.icon-info)');

        iconInfo.onclick = (e) => {
            const idMeal = e.target.closest('.meal-info').id.slice(7);
            if(e.target.classList.toggle('fa')) {
                e.target.classList.remove('far');
                this.setConfig('idMeal', idMeal);
                this.addFavMeals(idMeal);
            } else {
                e.target.classList.add('far');
                this.removeConfig('idMeal', idMeal);
                this.removeFavMeal(idMeal);
            }

            if (iconHearts) {
                const favMeals = this.getConfig('idMeal');
                iconHearts.forEach(icon => {
                    if (favMeals.includes(icon.closest('.meal').id)) {
                        icon.classList.add('fa');
                        icon.classList.remove('far');
                    } else {
                        icon.classList.add('far');
                        icon.classList.remove('fa');
                    }
                });
            }
        }
    },

    //render Fav Meal on localStorage
    renderFavMeal() {
        const idMeals = this.getConfig('idMeal');
        idMeals.forEach(id => {
            this.addFavMeals(id);
        });
    },

    // add new Fav Meal after click
    async addFavMeals(idMeal) {
        const meal = await this.getMealById(idMeal);
        const favItem = document.createElement('li');
        favItem.classList.add('fav-item');
        favItem.id = 'fav-' + meal.idMeal;
        favItem.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="fav-item-img">
            ${meal.strMeal}
        `
        favRecipe.appendChild(favItem);
        favItem.scrollIntoView({
            behavior: 'smooth',
            inline: 'center'
        });
    },

    //remove Fav meal after click
    removeFavMeal(idMeal) {
        const id = 'fav-' + idMeal;
        const favItem = document.getElementById(id);
        favRecipe.removeChild(favItem);
    },

    async openRecipe(idMeal) {
        const favMeals = this.getConfig('idMeal');
        const mealInfo = await this.getMealById(idMeal);
        if (favMeals.includes(idMeal)) {
            iconInfo.classList.add('fa');
            iconInfo.classList.remove('far');
        } else {
            iconInfo.classList.add('far');
            iconInfo.classList.remove('fa');
        }
        mealInfoWrapper.id = 'recipe-' + idMeal;
        infoContainer.classList.remove('hidden');
        const youtubeLink = mealInfo.strYoutube.replace('watch?v=', 'embed/');

        mealHeading.innerHTML = `
        <h2>${mealInfo.strMeal}</h2>
        <iframe width="100%" height="300px" src=${youtubeLink} title="YouTube video player" 
        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `
        for(let i=1; i <= 20; i++) {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            if (mealInfo['strIngredient' + i]) {
                td1.innerText = mealInfo['strIngredient' + i];
                if(mealInfo['strMeasure' + i]) {
                    td2.innerText = mealInfo['strMeasure' + i];
                } else {
                    td2.innerText = '';
                }
                tr.appendChild(td1);
                tr.appendChild(td2);
                table.appendChild(tr);
            } else {
                break;
            }
        }

        mealFooter.innerHTML = `
        <h4>Instructors</h4>
        <p>${mealInfo.strInstructions}</p>
        `           
    },


    start() {
        this.getRandomMeal();
        this.renderFavMeal();
        appName.onclick = () => {
            mealContainer.innerHTML = '';
            this.getRandomMeal();
        }
    }
}

app.start();
