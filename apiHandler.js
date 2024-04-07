//these are variables you need to change with data from your own JobTread account
//instrution on where to find this information is in the README file

var VARgrantKey = "22SSfaQtNgvA2dYgRjkfrYLVn6KQaEZYhi";
var VARorgID = "22NLTQwjkKmc";
var VARtaskType = "013 Pay Phase";

function daysInMonth(month, year) {
    // In JavaScript, Month is 0-indexed, hence month + 1
    // Setting day as 0 goes to the last day of the previous month
    return new Date(year, month + 1, 0).getDate();
}

async function fetchTasksForDay(year, month) {
    //formattedDate doesn't matter now that we're pulling all data for month, rather than each date, save for later use if we switch to a database storage
    //const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Format date as 'YYYY-MM-DD'
    const firstDate = `${year}-${String(month + 1).padStart(2, '0')}-01`; // Start of the month
    const lastDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth(month, year)}`; // End of the month
    
    const grantKey = VARgrantKey;
    const orgID = VARorgID;
    const payload = {
        query: {
            $: { grantKey: grantKey },
            organization: {
                $: { id: orgID },
                id: {},
                tasks: {
                    $: {
                        size: 60,
                        where: {
                            and: [
                                [
                                    ["taskType", "name"],
                                    VARtaskType
                                ],
                                [
                                    "startDate",
                                    ">=",
                                    firstDate
                                ],
                                [
                                    "startDate",
                                    "<=",
                                    lastDate
                                ]
                            ]
                        }
                    },
                    nodes: {
                        id: {},
                        name: {},
                        startDate: {},
                        description: {}
                    }
                }
            }
        }
    };

    try {
        const response = await fetch('fetch.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
    
        // Assuming you're initiating async operations inside the map function, 
        // which returns an array of promises.
        const tasksArrayPromises = data.organization.tasks.nodes.map(async (task) => {
            // If there's any async operation here, make sure to await it.
            // Otherwise, just return the task object or any transformation needed.
            return {
                id: task.id,
                name: task.name,
                startDate: task.startDate,
                description: task.description
            };
        });
    
        // Await all promises to resolve
        const tasksArray = await Promise.all(tasksArrayPromises);
    
        console.log(tasksArray); // Now it should be an array of task objects, not promises.
        return tasksArray;
    
    } catch (error) {
        console.error('Error:', error);
        return []; // Return an empty array in case of error
    }
    
    
}

export { fetchTasksForDay };
