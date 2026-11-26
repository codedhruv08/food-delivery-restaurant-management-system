
async function loadRecipes() {
    const container = document.getElementById("api-food-list");

    try {
        container.innerHTML = "Loading recipes...";

        const response = await fetch(
            "https://dummyjson.com/recipes"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();

        container.innerHTML = data.recipes.map(recipe => `
            <article class="food-card">
                <div class="card-img">
                    <img src="${recipe.image}" alt="${recipe.name}">
                </div>

                <div class="card-body">
                    <h3>${recipe.name}</h3>
                    <p class="food-restaurant">
                        ${recipe.cuisine}
                    </p>
                    <p class="food-rating">
                        ⭐ ${recipe.rating}
                    </p>
                </div>
            </article>
        `).join("");

    } catch (error) {
        container.innerHTML =
            "Unable to load recipes. Please try again.";

        console.log(error);
    }
}

loadRecipes();
