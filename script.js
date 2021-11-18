/////////dates 

function isLeapYear(year){
	return ((!year % 100 == 0 && year % 4 == 0) || year % 400 == 0);
}

var leapDaysOfMonth = {
	1:31,
	2:29,
	3:31,
	4:30,
	5:31,
	6:30,
	7:31,
	8:31,
	9:30,
	10:31,
	11:30,
	12:31
}
var daysOfMonth = leapDaysOfMonth;
daysOfMonth[2] --;

var monthNames = {
	1:"January",
	2:"February",
	3:"March",
	4:"April",
	5:"May",
	6:"June",
	7:"July",
	8:"August",
	9:"September",
	10:"October",
	11:"November",
	12:"December"
}

var dayNames = {
	0:"Monday",
	1:"Tuesday",
	2:"Wednesday",
	3:"Thursday",
	4:"Friday",
	5:"Saturday",
	6:"Sunday"
}

function daysInMonth(month, year){
	if(month == 0){
		year -= 1;
		month = 12;
	}
	return isLeapYear(year) ? daysOfMonth[month] : leapDaysOfMonth[month];
}
/////////storage variables
data = {};
/////////page variables
var today = new Date;
//current is what the calendar shows
var currentDay = (today.getDay()+6) % 7;// adjusts sunday = 0 -> monday = 0
var currentDate = today.getDate();
var currentMonth = today.getMonth()+1;//jan = 0 -> jan = 1
var currentYear = today.getYear()+1900;// 2021 = 121 -> 2021 = 2021
var currentWeek = getCurrentWeek();

//active is what the planner shows
var activeDay = currentDay;
var activeDate = currentDate;
var activeWeek = currentWeek;//monday of activeMonth that is the selected week.
var activeMonth = currentMonth;
var activeYear = currentYear;

/////////page functions
function addText(day, text = ""){
	let box = document.createElement("input");
	box.value = text;

	box.addEventListener("focusout", function() {
		submitEntry(day, box.value);	
		document.getElementById("c" + String(day)).removeChild(box);
	});


	box.addEventListener("keyup", function(event) {
	 	if (event.keyCode === 13) {
			box.blur();//removes focus & calls 
		}
	});

	document.getElementById("c" + String(day)).prepend(box);
	box.select();
}

function submitEntry(day, value){//make input box a p tag
	if(value == "")
		return;

	let p = document.createElement("p");
	p.innerHTML = value;
	p.onclick = function(){strike(p);};
	p.addEventListener("contextmenu", function(event){event.preventDefault(); edit(p); return false;}, false);
	let container = document.getElementById("c" + String(day));
	container.insertBefore(p, container.children[container.children.length-1]);
}


function strike(elem){//put strikethrough texbox
	if(!isStruck(elem)){//strike if not struck
		elem.innerHTML = "<strike>" + elem.innerHTML + "</strike>";
	}else{
		//unstrike
		elem.innerHTML = elem.innerHTML.slice(8, elem.innerHTML.length - 9);  

		//account for false positive
		if(elem.innerHTML == undefined)
			elem.innerHTML = "";
	}
}

function remove(elem){
	elem.parentElement.removeChild(elem);
}

function edit(elem){
	let text = elem.innerHTML;
	let day = parseInt(elem.parentElement.id.slice(-1));
	remove(elem);
	addText(day, text);
}

function outerHtmlMinusPTag(elem){
	return elem.outerHTML.slice(3, elem.outerHTML.length-4);
}

function isStruck(elem){
	let s = outerHtmlMinusPTag(elem);//gets the "inner html" including strike tags.
	return ((s.substring(0, 8) == "<strike>") && (s.substring(s.length-9, s.length) == "</strike>"));
}

/////////calendar functions

function buildWeek(row, firstDay, monthLength, lastOfLast){

	let section = document.querySelector("#r" + String(row));
	section.onclick = function(){currentWeek = adjustDate(firstDay); loadWeek();};//monday of the week(sometimes negative), month, year 

	for(i = firstDay; i < firstDay+7; i++){
		let p = document.querySelector("#r" + String(row) + ` :nth-child(${i-firstDay +1})`);

		if(i < 1){
			p.innerHTML = lastOfLast + i;// i will be 0 or negative 
			p.style = "color: gray";
		}else if(i > monthLength){
			p.innerHTML = i - monthLength; 
			p.style = "color: gray";
		}else{
			p.innerHTML = i;
			p.style = "color: black";
		}

	}

	if(currentMonth == activeMonth && currentWeek == activeWeek)
		updateColor("lightGray");
	else
		updateColor("white");
}

function buildCalendar(day, date, month, year){
	document.querySelector("#month").innerHTML = monthNames[month] + " " + String(year);//update name of month

	let firstOfMonthDay = ((day-((date-1)%7))+7)%7;// offset = ((date-1)%7)- subtract day from that % 7 = day of first month; +7 fixes js neg mod behaving differently.
	let lastOfLastMonthDate = daysInMonth(month-1, year);//number of days in previous month/ date of last day in previous month
	let firstMonday = -1 * firstOfMonthDay + 1;//-1 * (days before first until first monday on calendar + 1)
	let monthLength = (isLeapYear(year)) ? daysOfMonth[month] : leapDaysOfMonth[month]; 

	for(let i = 0; i < 6; i++){
		buildWeek(i+1, firstMonday+(i*7), monthLength, lastOfLastMonthDate); 
	}
	
}

function monthPage(toMove){//to move is 1 or -1
	currentMonth += toMove;

	if(currentMonth == 0){
		currentYear -= 1;
		currentMonth = 12;
	}
	if(currentMonth == 13){
		currentYear += 1;
		currentMonth = 1;
	}

	//update current day and date to the new month
	if(toMove > 0){//moving forward
		currentDay = (currentDay + (daysInMonth(currentMonth-1, currentYear)-currentDate) + 1) % 7;//current day + remaining days in this month + 1 (last month, since this month is now adjusted to the next) % 7
		currentDate = 1;
	}else{//moving back
		currentDay = ((currentDay-((currentDate-1)%7))+7+6)%7;//the day of week before first monday (+6) % 7 -> firstMonday -1 
		currentDate = daysInMonth(currentMonth, currentYear);//last day in month before (currentMonth is already adjusted)
	}


	buildCalendar(currentDay, currentDate, currentMonth, currentYear);
}

function adjustDate(date){//adjust for negs/pos
	let monthLength = daysInMonth(currentMonth, currentYear)
	if(date < 1){//adjust for negative
		let lastOfLast = daysInMonth(currentMonth-1, currentYear);
		date = lastOfLast + date;
		monthPage(-1);//month down
	}else if(date > monthLength){//adjusts for date being too high 
		date -= monthLength;
		monthPage(1);//month up
	}
	return date;
}

function getCurrentWeek(){//only use when current = active (when initializing or after loading)
	let monday = currentDate - currentDay;

	if(monday < 1){
		monthPage(-1);//updates current month and year
		activeMonth = currentMonth;
		activeYear = currentYear;
	}
	return monday;
}


function loadWeek(){//loads said week to planner. sometimes day is negative- that many days into prev month.
	updateColor("white");

	//save active week
	saveWeek();

	//update active week/month/year
	activeDay = currentDay;
	activeDate = currentDate;
	activeWeek = currentWeek;
	activeMonth = currentMonth;
	activeYear = currentYear;


	//clear all p tags
	clearParagraphs();

	//load already there p tags
	
	if(data[`${activeMonth}.${activeWeek}.${activeYear}`] == undefined)
		data[`${activeMonth}.${activeWeek}.${activeYear}`] = [[],[],[],[],[],[],[]];


	setParagraphs(data[`${activeMonth}.${activeWeek}.${activeYear}`]);

	updateColor("lightgray");
	updateHeadingDates();
}

function saveWeek(){

	data[`${activeMonth}.${activeWeek}.${activeYear}`] = getParagraphs();

}

/////////save and load functions

function getParagraphs(){//returns text in p tags in main body ([[monday tasks], [tuesday tasks]...])
	let paragraphs = [];
	for(let i = 0; i < 7; i ++){
		let current = [];
		let container = document.getElementById(`c${i+1}`);
		let children = container.children;
		for(let j = 0; j < children.length; j++){
			if(children[j].nodeName == 'P'){
				current.push(outerHtmlMinusPTag(children[j]));
			}
		}

		paragraphs.push(current);	
	}

	return paragraphs;
}


function setParagraphs(weekData){//sets p tags to text in given list of lists of strings
	for(let i = 0; i < weekData.length; i ++){//for each day
		let container = document.getElementById(`c${i+1}`);
		for(let j = 0; j < weekData[i].length; j++){ 
			let p = document.createElement("p");
			p.innerHTML = weekData[i][j];
			p.onclick = function(){strike(p);};
			p.addEventListener("contextmenu", function(event){event.preventDefault(); edit(p); return false;}, false);
			container.prepend(p);
		}
	}
}

function clearParagraphs(){// clears p tags in main body
	for(let i = 0; i < 7; i ++){
		let container = document.getElementById(`c${i+1}`);
		let children = container.children;
		let numberOfChildren = children.length
		for(let j = numberOfChildren-1; j >= 0; j--){
			if(children[j].nodeName == 'P'){
				container.removeChild(children[j]);
			}
		}
	}
}

function getWeekNumber(){
	let firstMonday = -1 * ((activeDay-((activeDate-1)%7))+7)%7 + 1;	
	return((activeWeek -  firstMonday)/7);
}

function updateColor(color){
	document.querySelector("#r" + String(getWeekNumber()+1)).style.setProperty("background-color", color);
}

function updateHeadingDates(){
	let monday = activeWeek;
	let headings = document.querySelector(".headingRow").children;
	let monthLength = daysInMonth(activeMonth);

	for(i = 0; i < headings.length; i++){
		if(monday + i > monthLength)
			headings[i].innerHTML = String(monday + i - monthLength) + " " + dayNames[i];
		else
			headings[i].innerHTML = String(monday + i) + " " + dayNames[i];
	}
}

/////////data saving/loading
function saveData(){
	saveWeek();
	localStorage.setItem("data", JSON.stringify(data));	
}

function loadData(){
	data = JSON.parse(localStorage.getItem("data"));
	clearParagraphs();
	setParagraphs(data[`${activeMonth}.${activeWeek}.${activeYear}`]);
}

window.onbeforeunload = function(){//before page closes
	saveData();	
}
/////////initial calls
buildCalendar(currentDay, currentDate, currentMonth, currentYear);
updateColor("lightgray");
updateHeadingDates();
loadData();
