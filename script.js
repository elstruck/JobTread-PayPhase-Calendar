import { fetchTasksForDay } from './apiHandler.js';

document.addEventListener('DOMContentLoaded', function() {
    const calendarView = document.getElementById('calendar-view');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const monthHeader = document.querySelector('.month-header');

    let currentDate = new Date(); // Year, month index (0-based), day
    console.log(currentDate);

  function updateMonthHeader(monthlyTotal) {
      const monthNames = ["January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"];
      const formattedMonthlyTotal = monthlyTotal.toLocaleString("en-US", {style: "currency", currency: "USD"});
      monthHeader.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()} - Total: ${formattedMonthlyTotal}`;
  }

  // Calculate the days in the given month
  function daysInMonth(month, year) {
      return new Date(year, month + 1, 0).getDate();
  }

  //async function to make JobTread API call per month in calendar
  async function loadAndProcessTasks(year, month) {
    let monthlyTasksArray = [];
    try {
        monthlyTasksArray = await fetchTasksForDay(year, month); // fetch all tasks for the month
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
    return monthlyTasksArray;
  }

  // This function takes an array of task objects and displays them
  function displayTasks(i, day, tasksArray, amount) {
    var amountAllDay = 0;
    const tasksContainer = document.getElementById('day'+i); // Ensure you have a div with this ID in your HTML

    tasksArray.forEach(task => {
      const taskDate = task.startDate; 

      if (taskDate === day) { // Check if the task is for the specific day
          var zz = task.description ? Number(task.description).toFixed(2) : "0.00";
          const taskDiv = document.createElement('div');
          taskDiv.className = 'task';
          taskDiv.innerHTML = `<div class="task-name">${task.name}</div><div class="task-amount">$${zz}</div><br />`;
          tasksContainer.appendChild(taskDiv);

          amountAllDay += Number(zz);
      }
    });
    return amountAllDay;
  }

  // main function to create calendar view for the month
  async function generateCalendar(year, month) {
        const today = new Date();
        const days = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const tasksArray = await loadAndProcessTasks(year, month);
        var amount = 0;

        calendarView.innerHTML = ''; // Clear previous view

        let weekTotal = 0; // Initialize weekly total
        let daysProcessed = 0; // Track days processed to handle weekly totals
        let monthlyTotal = 0; // Initialize montly total    

        for (let i = 0; i < firstDay; i++) {
            calendarView.appendChild(document.createElement('div')); // Empty cells for month view
            daysProcessed++;
        }
        for (let i = 1; i <= days; i++) {
            const day = document.createElement('div');
            day.id = 'day'+i;
            day.className = 'calendar-day';  
            day.innerHTML = i;
            calendarView.appendChild(day);
            
            const f_date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            //displayTasks(i, f_date, tasksArray, amount);
          
            const amountForDay = displayTasks(i, f_date, tasksArray, amount);
            monthlyTotal += amountForDay;
            weekTotal += amountForDay;        

            if (amount > 0){
              const formattedAmount = amount.toLocaleString("en-US", {style: "currency", currency: "USD"});
              const amountDisplay = document.createElement('div');
              amountDisplay.innerHTML = `<br><small>yooooo ${formattedAmount}</small>`;
              day.appendChild(amountDisplay);
          } 

            // Check if this day is today
            if (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth() && i === today.getDate()) {
                day.classList.add('today');
            }

            calendarView.appendChild(day);
            daysProcessed++;

            // At the end of each week or end of month, append the week total
            if (daysProcessed % 7 == 0 || i == days) {
                const tasksSummary = document.createElement('div');
                tasksSummary.className = 'tasks-summary';
                const formattedWeekTotal = weekTotal.toLocaleString("en-US", {style: "currency", currency: "USD"});
                tasksSummary.innerHTML = `${formattedWeekTotal}`; 
                calendarView.appendChild(tasksSummary);
                weekTotal = 0; // Reset week total
            }
        }      

      updateMonthHeader(monthlyTotal); // Update the month header
  }


    function updateCalendar(direction) {
            currentDate.setMonth(currentDate.getMonth() + direction);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    }

    prevButton.addEventListener('click', () => updateCalendar(-1));
    nextButton.addEventListener('click', () => updateCalendar(1));

    generateCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Initial call to generate calendar
});
