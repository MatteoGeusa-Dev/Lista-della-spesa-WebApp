window.onload = function () {
    loadListFromStorage();
};


var itemList = [];

function loadListFromStorage() {
    var storedList = localStorage.getItem('shoppingList');
    if (storedList) {
        itemList = JSON.parse(storedList);
        updateUI();
    }
}


function saveListToStorage() {
    localStorage.setItem('shoppingList', JSON.stringify(itemList));
}


var nextItemId = 1; 

fetch('food_categories.json')
.then(response => response.json())
.then(data => {
    foodCategories = data;
})
.catch(error => console.error('Errore durante il caricamento del file JSON:', error));



function addItem() {
    var itemInput = document.getElementById("itemInput").value.trim();
    var categorySelect = document.getElementById("categorySelect");
    var category = categorySelect.options[categorySelect.selectedIndex].value;

    if (category === "Automatico") {
        var items = itemInput.split(',').map(item => item.trim());

        items.forEach(function (item) {
            item = item.charAt(0).toUpperCase() + item.slice(1);
            var detectedCategory = null;
            // Verifica se l'alimento contiene una parola chiave associata a una categoria
            Object.keys(foodCategories).forEach(function (key) {
                var keywords = foodCategories[key].map(keyword => keyword.toLowerCase());
                if (keywords.some(keyword => item.toLowerCase().includes(keyword))) {
                    detectedCategory = key;
                }
            });
            if (detectedCategory) {
                category = detectedCategory;
            } else {
                // Se l'alimento non contiene parole chiave note, lo aggiungiamo alla categoria "Altro"
                category = "Altro";
            }
            if (item !== "" && !itemList.some(obj => obj.name === item)) {
                itemList.push({ id: nextItemId++, name: item, category: category, checked: false });
            }
        });
    } else {
        var items = itemInput.split(',').map(item => item.trim());
        
        items.forEach(function (item) {
            item = item.charAt(0).toUpperCase() + item.slice(1);
            if (item !== "" && !itemList.some(obj => obj.name === item)) {
                itemList.push({ id: nextItemId++, name: item, category: category, checked: false });
            }
        });
    }

    updateUI();
    saveListToStorage();
    document.getElementById("itemInput").value = "";
}







function openModal() {
    document.getElementById("myModal").style.display = "block";
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

function resetList() {
    itemList = [];
    localStorage.removeItem('shoppingList');
    localStorage.removeItem('dieta');
    updateUI();
    saveListToStorage();
    closeModal();
    document.getElementById("itemInput").value = "";

    document.getElementById("confirmationMessage").classList.add("show");

    setTimeout(function () {
        document.getElementById("confirmationMessage").classList.remove("show");;
    }, 2000);

}

function removeItem(id) {
    itemList = itemList.filter(item => item.id !== id); 
    updateUI();
    saveListToStorage();
}

function updateUI() {
    var categories = {};

    itemList.forEach(function (item) {
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    });

    var ulList = document.getElementById("itemList");
    ulList.innerHTML = "";

    Object.keys(categories).forEach(function(category) {
        var categoryHeader = document.createElement("li");
        categoryHeader.textContent = category;
        categoryHeader.style.fontWeight = "bold";
        categoryHeader.style.background = "lightblue";
        ulList.appendChild(categoryHeader);

        categories[category].sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        categories[category].forEach(function(item) {
            var elemLi = document.createElement("li");
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.checked;
            checkbox.addEventListener('change', function () {
                item.checked = this.checked;
                if (this.checked) {
                    itemList = itemList.filter(i => i !== item);
                    itemList.push(item);
                }
                saveListToStorage();
                updateUI();
            });

            elemLi.appendChild(checkbox);
            var textNode = document.createElement("span");
            textNode.innerText = item.name;
            elemLi.style.marginLeft= "20px";
            elemLi.appendChild(textNode);

            if (item.checked) {
                textNode.style.color = "grey";
                elemLi.style.opacity = "0.5";
                elemLi.style.background = "lightgray";
            }

            var deleteButton = document.createElement("button");
            deleteButton.textContent = "Rimuovi";
            deleteButton.className = "deleteButton";
            deleteButton.addEventListener('click', function () {
                removeItem(item.id);
            });
            elemLi.appendChild(deleteButton);

            ulList.appendChild(elemLi);
        });
    });
}

function handleKeyPress(event) {
    if (event.keyCode === 13) {
        addItem();
    }
}

