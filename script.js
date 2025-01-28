
// Array to hold quote objects
let quotes = [
    { text: "Love is a beautiful thing.", category: "Love" },
    { text: "Knowledge is power.", category: "Education" },
    { text: "A stitch in time saves nine.", category: "Motivation" }
];

// Load quotes from local storage if available
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Fetch quotes from server and add them to the quotes array
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        if (!response.ok) {
            throw new Error('Failed to fetch quotes from server');
        }
        const serverQuotes = await response.json();
        // Map the server data to match the format of our quotes array
        const formattedServerQuotes = serverQuotes.map(post => ({
            text: post.title,
            category: "Fetched" // Assign a default category for fetched quotes
        }));
        quotes = [...quotes, ...formattedServerQuotes];
        
        // Save the updated quotes to local storage
        saveQuotes();
        
        // Update the categories dropdown
        populateCategories();
        
        // Show a confirmation message
        alert("Quotes fetched from server and added successfully!");
    } catch (error) {
        console.error('Error fetching quotes:', error);
        alert('Failed to fetch quotes from server. Please try again later.');
    }
}

// Send a new quote to the server using a POST request
async function sendQuoteToServer(quote) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quote)
        });

        if (!response.ok) {
            throw new Error('Failed to send quote to server');
        }
        
        const result = await response.json();
        console.log('Quote sent to server:', result);
        alert("Quote sent to the server successfully!");
    } catch (error) {
        console.error('Error sending quote:', error);
        alert('Failed to send quote to the server. Please try again later.');
    }
}

// Sync quotes with the server
async function syncQuotes() {
    // Fetch quotes from the server and update the local quotes array
    await fetchQuotesFromServer();

    // Filter out quotes that have not been sent to the server (no "Fetched" category)
    const unsentQuotes = quotes.filter(quote => quote.category !== "Fetched");

    // Send unsent quotes to the server
    for (const quote of unsentQuotes) {
        await sendQuoteToServer(quote);
    }

    // Update the categories and save the latest quotes
    populateCategories();
    saveQuotes();

    // Confirmation message for sync completion
    alert("Quotes synced with server!");
}

// Set an interval to sync quotes with the server every 5 minutes (300,000 milliseconds)
setInterval(syncQuotes, 300000);

// Populate categories dynamically in the dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Get unique categories from the quotes array
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

    // Add each category to the dropdown
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore the last selected filter from local storage
    const lastSelectedCategory = localStorage.getItem('selectedCategory');
    if (lastSelectedCategory) {
        categoryFilter.value = lastSelectedCategory;
    }

    // Apply filtering based on the last selected category
    filterQuotes();
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Filter quotes based on the selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    // Update the quote display area
    if (filteredQuotes.length > 0) {
        quoteDisplay.innerHTML = filteredQuotes.map(quote => 
            `<p>"${quote.text}"</p><em>- ${quote.category}</em>`
        ).join('');
    } else {
        quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    }

    // Save the selected category to local storage
    localStorage.setItem('selectedCategory', selectedCategory);
}

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>"${quotes[randomIndex].text}"</p><em>- ${quotes[randomIndex].category}</em>`;
    
    // Save the last viewed quote to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quotes[randomIndex]));
}

// Function to display the last viewed quote if available
function showLastViewedQuote() {
    const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastViewedQuote) {
        const quote = JSON.parse(lastViewedQuote);
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = `<p>"${quote.text}"</p><em>- ${quote.category}</em>`;
    }
}

// Function to create the add quote form dynamically
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button onclick="addQuote()">Add Quote</button>
        <button onclick="fetchQuotesFromServer()">Fetch Quotes from Server</button>
        <button onclick="syncQuotes()">Sync Quotes</button>
    `;
    document.body.appendChild(formContainer);
}

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (quoteText && quoteCategory) {
        // Add the new quote to the array
        const newQuote = { text: quoteText, category: quoteCategory };
        quotes.push(newQuote);

        // Save the updated quotes to local storage
        saveQuotes();

        // Optionally, send the new quote to the server
        sendQuoteToServer(newQuote);

        // Update the categories dropdown if the category is new
        if (!Array.from(document.querySelectorAll('#categoryFilter option')).some(option => option.value === quoteCategory)) {
            populateCategories();
        }

        // Clear input fields
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';

        // Optionally, show a confirmation message
        alert("New quote added successfully!");
    } else {
        alert("Please fill in both fields.");
    }
}

// Call functions to initialize the page when it loads
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();         // Load quotes from local storage
    populateCategories(); // Populate categories and apply the filter
    createAddQuoteForm(); // Create the add quote form
    showLastViewedQuote(); // Display the last viewed quote, if available
});

// Event listener for the "Show Random Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Event listener for the category filter dropdown
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
