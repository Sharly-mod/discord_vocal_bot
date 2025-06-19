// Données des recettes
const recipes = [{
        name: "Ramen Classique",
        type: "ramen",
        ingredients: ["Nouilles Ramen", "Œuf", "Algue", "Porc", "Oignon Vert"],
    },
    {
        name: "Ramen Épicé",
        type: "ramen",
        ingredients: ["Nouilles Ramen", "Œuf", "Piment", "Porc", "Oignon Vert"],
    },
    {
        name: "Ramen Végétarien",
        type: "ramen",
        ingredients: ["Nouilles Ramen", "Tofu", "Algue", "Champignons", "Oignon Vert"],
    },
    {
        name: "Pizza Margherita",
        type: "pizza",
        ingredients: ["Pâte à Pizza", "Sauce Tomate", "Fromage", "Tomate", "Basilic"],
    },
    {
        name: "Pizza Pepperoni",
        type: "pizza",
        ingredients: ["Pâte à Pizza", "Sauce Tomate", "Fromage", "Pepperoni"],
    },
    {
        name: "Pizza Végétarienne",
        type: "pizza",
        ingredients: ["Pâte à Pizza", "Sauce Tomate", "Fromage", "Champignons", "Poivron", "Olives"],
    },
    {
        name: "Burger Classique",
        type: "burger",
        ingredients: ["Pain", "Steak de Bœuf", "Fromage", "Laitue", "Tomate", "Oignon", "Ketchup", "Moutarde"],
    },
    {
        name: "Burger au Poulet",
        type: "burger",
        ingredients: ["Pain", "Poulet", "Fromage", "Laitue", "Tomate", "Mayonnaise"],
    },
    {
        name: "Burger Végétarien",
        type: "burger",
        ingredients: ["Pain", "Galette Végétale", "Fromage", "Laitue", "Tomate", "Oignon", "Sauce Spéciale"],
    },
    {
        name: "California Roll",
        type: "sushi",
        ingredients: ["Riz", "Algue", "Avocat", "Crabe", "Concombre"],
    },
    {
        name: "Maki Thon Épicé",
        type: "sushi",
        ingredients: ["Riz", "Algue", "Thon", "Mayo Épicée", "Concombre"],
    },
    {
        name: "Nigiri au Saumon",
        type: "sushi",
        ingredients: ["Riz", "Saumon"],
    },
    {
        name: "Curry au Poulet",
        type: "curry",
        ingredients: ["Riz", "Poulet", "Sauce Curry", "Pommes de Terre", "Carottes"],
    },
    {
        name: "Curry Végétarien",
        type: "curry",
        ingredients: ["Riz", "Tofu", "Sauce Curry", "Pommes de Terre", "Carottes", "Épinards"],
    },
    {
        name: "Curry aux Crevettes",
        type: "curry",
        ingredients: ["Riz", "Crevettes", "Sauce Curry", "Poivrons", "Oignons"],
    },
];

// Données des ingrédients
const foodItems = [
    // Bases de ramen
    { name: "Nouilles Ramen", emoji: "🍜", color: "#fef9c3", category: "base", type: "ramen" },
    { name: "Nouilles Udon", emoji: "🥢", color: "#fef08a", category: "base", type: "ramen" },
    { name: "Nouilles de Riz", emoji: "🍚", color: "#ffffff", category: "base", type: "ramen" },

    // Bases de pizza
    { name: "Pâte à Pizza", emoji: "🍪", color: "#fef3c7", category: "base", type: "pizza" },
    { name: "Pâte Fine", emoji: "🥠", color: "#fef9c3", category: "base", type: "pizza" },
    { name: "Pâte Fourrée", emoji: "🥯", color: "#fef08a", category: "base", type: "pizza" },

    // Bases de burger
    { name: "Steak de Bœuf", emoji: "🥩", color: "#fecaca", category: "base", type: "burger" },
    { name: "Poulet", emoji: "🍗", color: "#fed7aa", category: "base", type: "burger" },
    { name: "Galette Végétale", emoji: "🥬", color: "#bbf7d0", category: "base", type: "burger" },
    { name: "Pain", emoji: "🍞", color: "#fef9c3", category: "base", type: "burger" },

    // Bases de sushi
    { name: "Riz", emoji: "🍚", color: "#ffffff", category: "base", type: "sushi" },
    { name: "Algue", emoji: "🌿", color: "#166534", category: "base", type: "sushi" },

    // Bases de curry
    { name: "Sauce Curry", emoji: "🍛", color: "#ca8a04", category: "base", type: "curry" },
    { name: "Riz", emoji: "🍚", color: "#ffffff", category: "base", type: "curry" },
    { name: "Poulet", emoji: "🍗", color: "#fed7aa", category: "base", type: "curry" },
    { name: "Tofu", emoji: "🫘", color: "#fef9c3", category: "base", type: "curry" },
    { name: "Crevettes", emoji: "🍤", color: "#fed7aa", category: "base", type: "curry" },

    // Garnitures communes
    { name: "Fromage", emoji: "🧀", color: "#fde047", category: "topping", type: "common" },
    { name: "Tomate", emoji: "🍅", color: "#ef4444", category: "topping", type: "common" },
    { name: "Laitue", emoji: "🥬", color: "#86efac", category: "topping", type: "common" },
    { name: "Oignon", emoji: "🧅", color: "#e9d5ff", category: "topping", type: "common" },
    { name: "Œuf", emoji: "🍳", color: "#fef9c3", category: "topping", type: "common" },
    { name: "Oignon Vert", emoji: "葱", color: "#bbf7d0", category: "topping", type: "common" },
    { name: "Algue", emoji: "🌿", color: "#166534", category: "topping", type: "common" },

    // Garnitures de pizza
    { name: "Pepperoni", emoji: "🍕", color: "#fca5a5", category: "topping", type: "pizza" },
    { name: "Champignons", emoji: "🍄", color: "#d1d5db", category: "topping", type: "pizza" },
    { name: "Poivron", emoji: "🫑", color: "#4ade80", category: "topping", type: "pizza" },
    { name: "Olives", emoji: "⚫", color: "#1f2937", category: "topping", type: "pizza" },
    { name: "Ananas", emoji: "🍍", color: "#fde047", category: "topping", type: "pizza" },
    { name: "Jambon", emoji: "🥓", color: "#fda4af", category: "topping", type: "pizza" },
    { name: "Basilic", emoji: "🌿", color: "#16a34a", category: "topping", type: "pizza" },

    // Garnitures de burger
    { name: "Bacon", emoji: "🥓", color: "#fca5a5", category: "topping", type: "burger" },
    { name: "Cornichons", emoji: "🥒", color: "#4ade80", category: "topping", type: "burger" },

    // Garnitures de sushi
    { name: "Avocat", emoji: "🥑", color: "#16a34a", category: "topping", type: "sushi" },
    { name: "Crabe", emoji: "🦀", color: "#fecaca", category: "topping", type: "sushi" },
    { name: "Thon", emoji: "🐟", color: "#ef4444", category: "topping", type: "sushi" },
    { name: "Saumon", emoji: "🍣", color: "#fdba74", category: "topping", type: "sushi" },
    { name: "Concombre", emoji: "🥒", color: "#86efac", category: "topping", type: "sushi" },

    // Garnitures de curry
    { name: "Pommes de Terre", emoji: "🥔", color: "#fef08a", category: "topping", type: "curry" },
    { name: "Carottes", emoji: "🥕", color: "#fb923c", category: "topping", type: "curry" },
    { name: "Épinards", emoji: "🥬", color: "#4ade80", category: "topping", type: "curry" },
    { name: "Crevettes", emoji: "🍤", color: "#fed7aa", category: "topping", type: "curry" },
    { name: "Poivrons", emoji: "🫑", color: "#f87171", category: "topping", type: "curry" },
    { name: "Tofu", emoji: "🫘", color: "#fef9c3", category: "topping", type: "curry" },

    // Sauces
    { name: "Ketchup", emoji: "🍅", color: "#dc2626", category: "sauce", type: "common" },
    { name: "Moutarde", emoji: "🟡", color: "#facc15", category: "sauce", type: "common" },
    { name: "Mayonnaise", emoji: "⚪", color: "#f3f4f6", category: "sauce", type: "common" },
    { name: "Sauce BBQ", emoji: "🟤", color: "#92400e", category: "sauce", type: "common" },
    { name: "Sauce Piquante", emoji: "🌶️", color: "#ef4444", category: "sauce", type: "common" },

    // Sauces de pizza
    { name: "Sauce Tomate", emoji: "🍅", color: "#ef4444", category: "sauce", type: "pizza" },
    { name: "Sauce Blanche", emoji: "🥛", color: "#f3f4f6", category: "sauce", type: "pizza" },
    { name: "Pesto", emoji: "🌿", color: "#16a34a", category: "sauce", type: "pizza" },

    // Sauces de burger
    { name: "Sauce Spéciale", emoji: "🧪", color: "#fdba74", category: "sauce", type: "burger" },

    // Sauces de sushi
    { name: "Sauce Soja", emoji: "醤油", color: "#78350f", category: "sauce", type: "sushi" },
    { name: "Wasabi", emoji: "🟢", color: "#4ade80", category: "sauce", type: "sushi" },
    { name: "Mayo Épicée", emoji: "🟠", color: "#fdba74", category: "sauce", type: "sushi" },

    // Sauces de curry
    { name: "Sauce Curry", emoji: "🍛", color: "#ca8a04", category: "sauce", type: "curry" },
    { name: "Piment", emoji: "🌶️", color: "#ef4444", category: "sauce", type: "curry" },
];

// Noms des clients
const customerNames = [
    "Alex",
    "Bailey",
    "Casey",
    "Dana",
    "Ellis",
    "Frankie",
    "Gray",
    "Harper",
    "Indigo",
    "Jamie",
    "Kelly",
    "Logan",
    "Morgan",
    "Nicky",
    "Parker",
    "Quinn",
    "Riley",
    "Sam",
    "Taylor",
    "Val",
];

// Images des clients
const characterImages = [
    "images/character-1.png",
    "images/character-2.png",
    "images/character-3.png",
    "images/character-4.png",
    "images/character-5.png",
];

// Demandes spéciales
const specialRequests = [
    "Extra épicé s'il vous plaît!",
    "Sans oignons si possible",
    "Puis-je avoir plus de fromage?",
    "Faites-le végétarien",
    "Pas trop de sauce",
];