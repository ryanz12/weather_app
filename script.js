const API_KEY = '2becc604d9918c532dd258df8b564078';
const title = document.getElementById('title');

function r(n){
    return Math.round(n);
}

function addIcon(name){
    return `<span class="material-symbols-outlined">${name}</span>`;
}

function box(content){
    return `<div>${content}</div>`
}

function calcMoonPhase(d){
    const newMoon = new Date('1900-1-1');
    const daysSince = (d - newMoon)/(1000 * 60 * 60 * 24);
    const lunarCycle = 29.53058867; //time in days
    const phases = ['New Moon', 'Waxing Cresent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Cresent'];
    const phaseIndex = Math.floor((daysSince % lunarCycle) / lunarCycle * 8) % 8;
    return phases[phaseIndex];
}

function calcWindChill(c,s){
    //http://weather.uky.edu/aen599/wchart.htm#:~:text=WIND%20CHILL%20FORMULA(S)%3A,the%20temperature%20in%20degrees%20Fahrenheit.
    const t=(c*9/5)+32;
    const v=s/1.609;
    return r(((0.0817*(3.71*v**0.5 + 5.81 -0.25*v)*(t - 91.4) + 91.4) - 32)*5/9);
}

function fetchApi(lat,long,format,city,key){
    let link, forecastLink;
    
    const precipMap = document.getElementById('precipMap');

    city == null
    ?(
        link = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=${format}`,
        forecastLink = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=${format}`,
        precipMap.src = `https://www.rainviewer.com/map.html?loc=${lat},${long},10&oFa=0&oC=1&oU=0&oCS=1&oF=1&oAP=0&c=3&o=90&lm=1&layer=radar&sm=1&sn=1&hu=0`
    )
    :(
        link = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=${format}`,
        forecastLink = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=${format}`
    )  

    fetch(link)
    .then(response => response.json())
    .then(data => {
        console.log(data);

        if(data.message){
            search.value = 'Please enter a valid city'
        }else{
            const date = new Date();
            data.name==''?title.innerHTML='International Waters':title.innerHTML=`${data.name}, ${data.sys.country} as of ${date.getHours()>9?date.getHours():'0'+date.getHours()}:${date.getMinutes()>9?date.getMinutes():'0'+date.getMinutes()}`;
    
            search.value = '';
    
            const tempValue = document.getElementById('tempValue');
            const skyStatus = document.getElementById('skyStatus');
            const highAndLow = document.getElementById('highAndLow');
    
            tempValue.innerHTML = `${r(data.main.temp)}&deg;`;
            skyStatus.innerHTML = data.weather[0].description.split(' ').map(x => x[0].toUpperCase() + x.slice(1)).join(' ');
            highAndLow.innerHTML = `Day ${r(data.main.temp_max)}&deg;&nbsp;&middot; Night ${r(data.main.temp_min)}&deg;`;
    
            //Weather today
            const titleTwo = document.getElementById('titleTwo');
            const feelsLike = document.getElementById('feelsLike');
            const sunInfo = document.getElementById('sunInfo');
    
            titleTwo.innerHTML = `Weather Today in ${data.name}, ${data.sys.country}`;
            feelsLike.innerHTML = `Feels Like <div>${r(data.main.feels_like)}&deg;</div>`;
    
            const sunrise = new Date(data.sys.sunrise*1000);
            const sunset = new Date(data.sys.sunset*1000);
            sunInfo.innerHTML = ''; //reset 
            sunInfo.innerHTML += `${addIcon('upload')}`
            sunInfo.innerHTML += `${sunrise.getHours()>9?sunrise.getHours():'0'+sunrise.getHours()}:${sunrise.getMinutes()>9?sunrise.getMinutes():'0'+sunrise.getMinutes()}&nbsp;&nbsp;`;
            
            sunInfo.innerHTML += `${addIcon('download')}`;
            sunInfo.innerHTML += `${sunset.getHours()>9?sunset.getHours():'0'+sunset.getHours()}:${sunset.getMinutes()>9?sunset.getMinutes():'0'+sunset.getMinutes()}`;
    
            //gridItems
            const hnl = document.getElementById("highLow");
            const wind = document.getElementById("wind");
            const humid = document.getElementById("humid");
            const dewPoint = document.getElementById("dewPoint");
            const pressure = document.getElementById('pressure');
            const visibility = document.getElementById('visibility');
            const moonPhase = document.getElementById('moonPhase');
            const windchill = document.getElementById('windChill');
    
            hnl.innerHTML = `${addIcon('device_thermostat')}&nbsp;&nbsp;&nbsp;High / Low <div>${r(data.main.temp_max)}&deg;/${r(data.main.temp_min)}&deg;</div>`;
            wind.innerHTML = `${addIcon('air')}&nbsp;&nbsp;&nbsp;Wind <div>${r(data.wind.speed*3.6)} km/h</div>`;
            humid.innerHTML = `${addIcon('humidity_percentage')}&nbsp;&nbsp;&nbsp;Humidity <div>${data.main.humidity}%</div>`;
            dewPoint.innerHTML = `${addIcon('dew_point')}&nbsp;&nbsp;&nbsp;Dew Point <div>${r(data.main.temp - ((100-data.main.humidity)/5))}&deg;</div>`;
            pressure.innerHTML = `${addIcon('compress')}&nbsp;&nbsp;&nbsp;Pressure <div>${data.main.pressure} mb</div>`;
            visibility.innerHTML = `${addIcon('visibility')}&nbsp;&nbsp;&nbsp;Visibility <div>${r(data.visibility/1000)} km</div>`;
            moonPhase.innerHTML = `${addIcon('nightlight')}&nbsp;&nbsp;&nbsp;Moon Phase <div>${calcMoonPhase(date)}</div>`;
            windchill.innerHTML = `${addIcon('thermostat')}&nbsp;&nbsp;&nbsp;Wind-chill <div>${calcWindChill(data.main.temp, data.wind.speed*3.6)}&deg;</div>`;
    
            const now = document.querySelector('.timeContainer>div:nth-child(1)');
            now.innerHTML = '';
            let img = document.createElement('img');
            img.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            now.innerHTML += `${box('Now')}`;
            now.innerHTML += box(`${r(data.main.temp)}&deg;`);
            now.appendChild(img);
    
            const dailyNow = document.querySelector('.dailyContainer>div:nth-child(1)');
            dailyNow.innerHTML = '';
            let dupeImg = document.createElement('img');
            dupeImg.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            dailyNow.innerHTML += box("Today");
            dailyNow.innerHTML += box(`${r(data.main.temp_max)}&deg;`);
            dailyNow.appendChild(dupeImg);

            // 
            // dynamic background
            // 
            const canvas = document.getElementById('myCanvas');
            const c = canvas.getContext('2d');

            canvas.height = document.documentElement.scrollHeight;
            canvas.width = window.innerWidth;

            window.addEventListener('resize', ()=>{
                canvas.height = document.body.scrollHeight;
                canvas.width = window.innerWidth;
            })

            const gravity = 9.81;

            class Raindrop{
                constructor(x, y){
                    this.x = x;
                    this.y = y;
                    this.length = Math.random()*10+10;
                    this.time = 2;
                    this.speed = gravity * this.time;
                }
                update(){
                    this.y += this.speed;
                    this.x += data.wind.deg>180?-1:1;
                    if (this.y > canvas.height) {
                        this.y = -this.length;
                        this.x = Math.random() * canvas.width;
                    }
                }
                draw(){
                    c.beginPath();
                    c.moveTo(this.x, this.y);
                    c.lineTo(this.x, this.y + this.length);
                    c.strokeStyle = 'blue';
                    c.lineWidth = 2;
                    c.stroke();
                }
            }

            const raindrops = [];
            const rainAudio = new Audio('raining.mp3');
            rainAudio.loop = true;

            if(data.weather[0].description.includes('rain')||data.weather[0].description.includes('thunderstorm')){
                for (let i=0; i<100; i++) {
                    raindrops.push(new Raindrop(Math.random()*canvas.width, Math.random()*canvas.height));
                }
                rainAudio.play();
            }else{
                rainAudio.pause();
                rainAudio.currentTime = 0;
            }

            const curLocalTime = new Date(data.dt * 1000 + data.timezone * 1000 + new Date().getTimezoneOffset() * 60 * 1000);
            const curLocalHour = curLocalTime.getHours();
            console.log(curLocalHour);

            // meta tag for mobile
            const meta = document.querySelector('meta[name="theme-color"]');
            let metaColor;

            function animate(){
                requestAnimationFrame(animate);
                c.clearRect(0,0,canvas.width, canvas.height);
                // background
                const gradient = c.createLinearGradient(0, 0, canvas.width, canvas.height);

                //morning-lunch
                if(curLocalHour>6&&curLocalHour<18){
                    gradient.addColorStop(0, '#87CEEB');
                    gradient.addColorStop(1, 'white');
                    
                    metaColor = '#87CEEB';
                }//afternoon
                else if(curLocalHour>=18&&curLocalHour<20){
                    gradient.addColorStop(0, '#87CEEB');
                    gradient.addColorStop(1, '#FFF7E5');

                    metaColor = '#FFF7E5';
                }//night
                else if(curLocalHour>=20||curLocalHour<=6){
                    gradient.addColorStop(0, '#0c0c33');
                    gradient.addColorStop(1, '#301330');

                    metaColor = '#0c0c33';
                }                
                c.fillStyle = gradient;
                c.fillRect(0, 0, canvas.width, canvas.height);
                
                raindrops.forEach(element => {
                    element.update();
                    element.draw();
                });
            }
            animate();

            meta.setAttribute('content', metaColor)
        }
    })
    .catch(error => {
        console.error(error);
    })

    //forecast fetch
    fetch(forecastLink)
    .then(response=>response.json())
    .then(data =>{
        //console.log(data);

        if(data.message){

        }else{
            //clear everything for search
            for(let i=0; i<4; i++){
                const curGridItem = document.querySelector(`.timeContainer>div:nth-child(${i+2})`);
                const dGridItem = document.querySelector(`.dailyContainer>div:nth-child(${i+2})`);

                curGridItem.innerHTML = '';
                dGridItem.innerHTML = '';
            }
            
            for(let i=2; i<6; i++){
                const curGridItem = document.querySelector(`.timeContainer>div:nth-child(${i})`);
                let curGridImg = document.createElement('img');
                let dataIndex = i-2;
                curGridItem.innerHTML += box(`${data.list[dataIndex].dt_txt.slice(11,16)}`);
                curGridItem.innerHTML += box(`${r(data.list[dataIndex].main.temp)}&deg;`);
                curGridImg.src = `https://openweathermap.org/img/wn/${data.list[dataIndex].weather[0].icon}@2x.png`;
                curGridItem.appendChild(curGridImg);
            }

            const date = new Date();
            const monthsArray = [
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December"
            ];
            for(let i=0; i<4; i++){
                let dtIndex = i+8;
                const dGridItems = document.querySelector(`.dailyContainer>div:nth-child(${i+2})`);
                let dGridImg = document.createElement('img');
                dGridItems.innerHTML += box(`${monthsArray[date.getMonth()]} ${date.getDate()+i+1}`);
                dGridItems.innerHTML += box(`${r(data.list[dtIndex].main.temp)}&deg;`);
                dGridImg.src = `https://openweathermap.org/img/wn/${data.list[dtIndex].weather[0].icon}@2x.png`;
                dGridItems.appendChild(dGridImg);
            }
        }
    })
    .catch(error => {
        console.error(error)
    })
        
}

navigator.geolocation.getCurrentPosition(
    function success(pos){
        let lat = pos.coords.latitude;
        let long = pos.coords.longitude;

        fetchApi(lat,long,'metric',null,API_KEY);
    },
    function unsuccess(){
        //later
        title.innerHTML = 'Enable location to access local weather';
    }
)

const search = document.getElementById('search');
const searchType = document.getElementById('searchType');

searchType.addEventListener('change', ()=>{
    //console.log(searchType.value);
    search.setAttribute('placeholder', `Search by ${searchType.value=='cityName'?'City':'Latitude and Longitude'}`);
})

function searchF(){
    if(searchType.value=='cityName'){
        /^[a-zA-Z]+$/gm.test(search.value) == false?search.value = 'Invalid Input':fetchApi(null,null,'metric',search.value,API_KEY);
    }else{
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/gm.test(search.value)==false?search.value='Input must be in format: lat, long':fetchApi(search.value.split(' ')[0], search.value.split(' ')[1], 'metric', null, API_KEY)
    }
}

const searchResultContainer = document.getElementById('searchResultContainer');

search.addEventListener('keydown', (e)=>{
    if(e.key == 'Enter'){
        //filter input
        searchF();
        searchResultContainer.innerHTML = '';
        searchResultContainer.style.display = 'none';
    }   
});

//Geocoding api

search.addEventListener('input', ()=>{
    if(search.value != ''){
        searchResultContainer.style.display = 'grid';
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${search.value}&limit=5&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            searchResultContainer.innerHTML = '';
            for(let i=0; i<data.length; i++){
                searchResultContainer.innerHTML += box(`${data[i].name}${data[i].state?', '+data[i].state+',':','} ${data[i].country}`);
                document.querySelector(`#searchResultContainer>div:nth-child(${i+1})`).setAttribute('data-lat-long', `${data[i].lat} ${data[i].lon}`);
            }

            let searchBtns = document.querySelectorAll('#searchResultContainer>div');

            searchBtns.forEach(element => {
                element.addEventListener('click', ()=>{
                    //console.log(element.dataset.latLong);

                    fetchApi(element.dataset.latLong.split(' ')[0], element.dataset.latLong.split(' ')[1], 'metric', null, API_KEY);
                    searchResultContainer.innerHTML = '';
                    searchResultContainer.style.display = 'none';
                })
            });
        })
        .catch(error=>{
            console.error(error)
        })

    }else{
        console.log('nothing to search');
        searchResultContainer.innerHTML = '';
        searchResultContainer.style.display = 'none';
    }

})
