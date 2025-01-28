let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  // Add more predefined quotes here
];

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteDisplay.textContent = quotes[randomIndex].text;
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
  // Ensure both fields are filled
  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    
    // Add the new quote to the quotes array
    quotes.push(newQuote);
    
    // Save the updated quotes array to local storage
    saveQuotes();
    
    // Update the categories dropdown
    populateCategories();

    // Update the quote display to show the new quote
    showRandomQuote();
    
    // Post the new quote to the server
    postQuoteToServer(newQuote);
    
    // Notify the user
    alert('Quote added successfully!');
    
    // Clear the input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  } else {
    alert('Please enter both a quote and a category.');
  }
}

// Function to populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  if (selectedCategory === 'all') {
    showRandomQuote();
  } else {
    const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    if (filteredQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      quoteDisplay.textContent = filteredQuotes[randomIndex].text;
    } else {
      quoteDisplay.textContent = 'No quotes available for this category.';
    }
  }
}

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await response.json();
    const newQuotes = serverQuotes.map(post => ({ text: post.title, category: 'Server' }));
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    notifyUser('Quotes fetched from server successfully!');
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    notifyUser('Error fetching quotes from server.');
  }
}

// Function to post a new quote to the server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quote),
    });
    const result = await response.json();
    console.log('Quote posted to the server:', result);
  } catch (error) {
    console.error('Error posting quote to server:', error);
  }
}

// Function to sync quotes with the server
async function syncQuotes() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await response.json();
    const newQuotes = serverQuotes.map(post => ({ text: post.title, category: 'Server' }));

    // Conflict resolution: server data takes precedence
    quotes = newQuotes;
    saveQuotes();
    populateCategories();
    notifyUser('Quotes synced with the server successfully!');
  } catch (error) {
    console.error('Error syncing quotes with server:', error);
    notifyUser('Error syncing quotes with the server.');
  }
}

// Start periodic sync with the server
function startDataSync() {
  setInterval(syncQuotes, 60000); // Sync every 60 seconds
}

// Function to notify users of updates or conflicts
function notifyUser(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Function to create the form for adding new quotes
function createAddQuoteForm() {
  // Create a container for the form
  const formContainer = document.createElement('div');

  // Create input for new quote text
  const newQuoteText = document.createElement('input');
  newQuoteText.id = 'newQuoteText';
  newQuoteText.type = 'text';
  newQuoteText.placeholder = 'Enter a new quote';
  formContainer.appendChild(newQuoteText);

  // Create input for new quote category
  const newQuoteCategory = document.createElement('input');
  newQuoteCategory.id = 'newQuoteCategory';
  newQuoteCategory.type = 'text';
  newQuoteCategory.placeholder = 'Enter quote category';
  formContainer.appendChild(newQuoteCategory);

  // Create a button to add the new quote
  const addQuoteButton = document.createElement('button');
  addQuoteButton.textContent = 'Add Quote';
  addQuoteButton.onclick = addQuote;
  formContainer.appendChild(addQuoteButton);

  // Append the form container to the body or a specific element
  document.body.appendChild(formContainer);
}

// Initialize the application
window.onload = function() {
  createAddQuoteForm();
  loadQuotes();
  populateCategories();
  showRandomQuote();
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  startDataSync();
};

// Add necessary CSS for notifications
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #4CAF50;
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 1000;
  }
`;
document.head.appendChild(style);