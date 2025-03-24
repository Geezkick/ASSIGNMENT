// Constants for DOM elements
const dogList = document.getElementById('dogList');
const searchInput = document.getElementById('searchInput');
const toggleModeBtn = document.getElementById('toggleMode');

// State
let dogBreeds = [];

// Fetch dog breeds and their images
async function fetchDogBreeds() {
    try {
        const breedResponse = await fetch('https://dog.ceo/api/breeds/list/all');
        const breedData = await breedResponse.json();
        
        const breedNames = Object.keys(breedData.message).slice(0, 10); // Limit to 10 for performance
        dogBreeds = await Promise.all(
            breedNames.map(async (breed, index) => {
                const imageResponse = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
                const imageData = await imageResponse.json();
                return {
                    id: index + 1,
                    name: breed,
                    image: imageData.message,
                    likes: 0,
                    error: '' // Add error state for each breed
                };
            })
        );
        
        renderDogBreeds(dogBreeds);
    } catch (error) {
        console.error('Error fetching dog breeds:', error);
        dogList.innerHTML = '<p>Sorry, something went wrong!</p>';
    }
}

// Fetch a new image for a specific breed with loading and error handling
async function fetchNewImage(breedName, breedId, buttonElement) {
    const originalText = buttonElement.textContent;
    buttonElement.textContent = 'Fetching...'; // Loading indicator
    buttonElement.disabled = true; // Disable button during fetch

    try {
        const response = await fetch(`https://dog.ceo/api/breed/${breedName}/images/random`);
        const data = await response.json();
        const breed = dogBreeds.find(b => b.id === breedId);
        if (breed) {
            breed.image = data.message;
            breed.error = ''; // Clear error on success
            renderDogBreeds(dogBreeds);
        }
    } catch (error) {
        console.error(`Error fetching new image for ${breedName}:`, error);
        const breed = dogBreeds.find(b => b.id === breedId);
        if (breed) {
            breed.error = 'Failed to load new image';
            renderDogBreeds(dogBreeds);
        }
    } finally {
        buttonElement.textContent = originalText; // Reset button text
        buttonElement.disabled = false; // Re-enable button
    }
}

// Render dog breeds to the DOM
function renderDogBreeds(breeds) {
    dogList.innerHTML = ''; // Clear previous content
    breeds.forEach(breed => {
        const dogCard = document.createElement('div');
        dogCard.classList.add('dog-card');
        dogCard.innerHTML = `
            <img src="${breed.image}" alt="${breed.name}">
            <h3>${breed.name}</h3>
            <p>Likes: <span class="likes">${breed.likes}</span></p>
            ${breed.error ? `<p class="error">${breed.error}</p>` : ''}
            <button class="new-image-btn" data-breed="${breed.name}" data-id="${breed.id}">New Image</button>
            <button class="reset-likes-btn" data-id="${breed.id}">Reset Likes</button>
        `;
        // Like functionality (click on card, excluding buttons)
        dogCard.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') { // Fixed syntax error
                handleLike(breed.id);
            }
        });
        // New image button
        const newImageBtn = dogCard.querySelector('.new-image-btn');
        newImageBtn.addEventListener('click', () => {
            fetchNewImage(breed.name, breed.id, newImageBtn);
        });
        // Reset likes button
        const resetLikesBtn = dogCard.querySelector('.reset-likes-btn');
        resetLikesBtn.addEventListener('click', () => handleResetLikes(breed.id));
        
        dogList.appendChild(dogCard);
    });
}

// Event Handler: Like a breed
function handleLike(breedId) {
    const breed = dogBreeds.find(b => b.id === breedId);
    if (breed) {
        breed.likes += 1;
        renderDogBreeds(dogBreeds);
    }
}

// Event Handler: Reset likes
function handleResetLikes(breedId) {
    const breed = dogBreeds.find(b => b.id === breedId);
    if (breed) {
        breed.likes = 0;
        renderDogBreeds(dogBreeds);
    }
}

// Event Handler: Search breeds
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredBreeds = dogBreeds.filter(breed => 
        breed.name.toLowerCase().includes(query)
    );
    renderDogBreeds(filteredBreeds);
});

// Event Handler: Toggle dark mode
toggleModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Event Handler: Highlight card on mouseover
dogList.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.dog-card');
    if (card) {
        card.style.backgroundColor = '#f0f0f0'; // Light highlight
        card.addEventListener('mouseout', () => {
            card.style.backgroundColor = ''; // Reset
        }, { once: true });
    }
});

// Initialize the app
fetchDogBreeds();