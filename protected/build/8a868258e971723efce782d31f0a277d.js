
            jQuery(function($) {
                const months = [ 
                    'January', 
                    'February', 
                    'March', 
                    'April', 
                    'May', 
                    'June', 
                    'July', 
                    'August', 
                    'September', 
                    'October', 
                    'November', 
                    'December'
                ];
                const days = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ];

                let today = new Date();
                // let formattedFullDate = months[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear();
                let formattedFullDate = today.getDate() + " " + months[today.getMonth()] + ", " + today.getFullYear();
                $(".date-today-full").text(formattedFullDate);
                $(".date-today-day").text(days[today.getDay()]);
            });
        