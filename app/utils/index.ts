export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

export function convertDate(date: any) {
    const todayLocal = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, // Set hours to 0 (midnight local)
        0, // Set minutes to 0
        0  // Set seconds to 0
    );

    // Helper to add leading zero for single-digit numbers
    const pad = (num: any) => String(num).padStart(2, '0');

    const year = todayLocal.getFullYear();
    const month = pad(todayLocal.getMonth() + 1); // getMonth() is 0-indexed
    const day = pad(todayLocal.getDate());
    const hours = pad(todayLocal.getHours());   // Will be '00'
    const minutes = pad(todayLocal.getMinutes()); // Will be '00'
    const seconds = pad(todayLocal.getSeconds()); // Will be '00'

    // Construct the string
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    return formattedDate;
}

export function convertDateFormat(dateString: any) {
  const date = new Date(dateString);
  
  const options: any = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}

export function convertTimeFormat(dateString: any) {
  const date = new Date(dateString);
  
  const options: any = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hours12: true // Use 12-hour format
  };
  
  return date.toLocaleTimeString('en-US', options);
}

export function convertDateTimeFormat(details: any) {
  return convertDateFormat(details.date) + ' ' + convertTimeFormat(details.time);
}

export function convertHtmlEmail(body: any) {
  return `<html>
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              </head>
              <body>
                <div>
                  ${body}
                </div>
              </body>
            </html>`;
}