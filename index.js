
const http = require('http');
const https = require('https');
const { StringDecoder } = require('string_decoder');

// Create an HTTP server
const server = http.createServer((req, res) => {
    const targetUrl = 'https://time.com/'; // The URL to retrieve data from

    // Make an HTTPS GET request to the specified URL
    https.get(targetUrl, (response) => {
         // Variable to store the HTML response
        let responseData = '';
        // Using UTF-8 encoding
        const decoder = new StringDecoder('utf-8'); 

        // Accumulate received data chunks to the 'responseData' variable
        response.on('data', (chunk) => {
            responseData += decoder.write(chunk);
        });

        // When the entire response is received, create a DOM-like structure
        response.on('end', () => {
            responseData += decoder.end();

            // Use regular expressions to extract information from the HTML content
            const listItemRegex = /<li\s+class\s*=\s*"latest-stories__item"[^>]*>(.*?)<\/li>/gs; // Pattern for <li> tag
            const titleRegex = /<h3\s+class\s*=\s*"latest-stories__item-headline"[^>]*>(.*?)<\/h3>/; // Pattern for <h3> tag
            const linkRegex = /<a\s+href="([^"]*)"[^>]*>/; // Pattern for <a> tag

            const extractedData = []; // Initialize an empty array to store extracted data
            let match;

            // Loop through all matches of the listItemRegex in the HTML content
            while ((match = listItemRegex.exec(responseData)) !== null) {
                const listItemContent = match[1];
                const titleMatch = titleRegex.exec(listItemContent);
                const linkMatch = linkRegex.exec(listItemContent);

                // If title and link matches are found, extract and store the object in the array
                if (titleMatch && linkMatch) {
                    const extractedItem = {
                        title: titleMatch[1].trim(),
                        link: 'https://time.com' + linkMatch[1],
                    };
                    extractedData.push(extractedItem); // Push the object into the array
                }
            }

            // Set HTTP response headers and send the extracted array data as JSON-formatted string
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(extractedData));
        });

        // On error, log the error message and send a 500 status with an error response
    }).on('error', (err) => {
        console.error(`Error: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Failed to retrieve the webpage. Error: ${err.message}`);
    });
});

// Start the server on port 3000 or use the provided environment variable PORT
// The API endpoint is /getTimeStories
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/getTimeStories`);
});

