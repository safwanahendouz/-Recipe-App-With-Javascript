// Recipe search + rendering
window.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
  // Helps you copy the base URL from the Console if you want
  window.API_URL = API_URL;

  const searchBtn = document.getElementById("search-btn");
  const userInpEl = document.getElementById("user-inp");
  let resultRoot = document.getElementById("result");

  // Safety in case you remove #result from HTML later
  if (!resultRoot) {
    const host = document.querySelector(".container") || document.body;
    resultRoot = document.createElement("div");
    resultRoot.id = "result";
    host.appendChild(resultRoot);
  }

  const renderError = (message) => {
    resultRoot.innerHTML = `<h3>${message}</h3>`;
  };

  const buildIngredients = (meal) => {
    const ingredients = [];

    // ThemealDB uses strIngredient1..20 + strMeasure1..20
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (!ingredient || !String(ingredient).trim()) continue;

      const cleanIngredient = String(ingredient).trim();
      const cleanMeasure = measure ? String(measure).trim() : "";

      ingredients.push(
        cleanMeasure ? `${cleanMeasure} ${cleanIngredient}` : cleanIngredient
      );
    }

    return ingredients;
  };

  const renderMeal = (meal) => {
    const ingredients = buildIngredients(meal);

    resultRoot.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal || "Meal"}">
      <div class="details">
        <h2>${meal.strMeal || ""}</h2>
        <h4>${meal.strArea || ""}</h4>
      </div>

      <div id="ingredient-con"></div>

      <button id="show-recipe" type="button">View Recipe</button>

      <div id="recipe" style="display:none">
        <div class="recipe-inner">
          <button id="hide-recipe" type="button">&#x2715;</button>
          <p class="recipe-title">${meal.strMeal || "Recipe"}</p>
          <pre id="instructions"></pre>
        </div>
      </div>
    `;

    const ingredientCon = document.getElementById("ingredient-con");
    const instructionsEl = document.getElementById("instructions");
    const recipeEl = document.getElementById("recipe");
    const hideRecipeBtn = document.getElementById("hide-recipe");
    const showRecipeBtn = document.getElementById("show-recipe");

    if (instructionsEl) {
      instructionsEl.textContent = meal.strInstructions || "";
    }

    if (ingredientCon) {
      const ul = document.createElement("ul");
      ingredients.forEach((text) => {
        const li = document.createElement("li");
        li.innerText = text;
        ul.appendChild(li);
      });
      ingredientCon.appendChild(ul);
    }

    if (hideRecipeBtn && recipeEl) {
      hideRecipeBtn.addEventListener("click", () => {
        recipeEl.style.display = "none";
      });
    }

    if (showRecipeBtn && recipeEl) {
      showRecipeBtn.addEventListener("click", () => {
        recipeEl.style.display = "block";
      });
    }
  };

  const runSearch = async () => {
    const userInp = userInpEl ? String(userInpEl.value || "").trim() : "";

    if (userInp.length === 0) {
      renderError("Input Field Cannot Be Empty");
      return;
    }

    try {
      resultRoot.innerHTML = `<h3>Loading...</h3>`;

      const requestUrl = API_URL + encodeURIComponent(userInp);
      console.log("API request URL:", requestUrl); // so you can see the full URL

      const response = await fetch(requestUrl);
      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      const myMeal = data?.meals?.[0];

      if (!myMeal) {
        renderError("No recipe found");
        return;
      }

      renderMeal(myMeal);
    } catch (e) {
      console.error(e);
      renderError("Invalid Input");
    }
  };

  if (searchBtn) searchBtn.addEventListener("click", runSearch);

  if (userInpEl) {
    userInpEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSearch();
    });
  }
});