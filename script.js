const d = document,
  synth = window.speechSynthesis,
  utterThis = new SpeechSynthesisUtterance(),
  $mainScreen = d.querySelector(".screen"),
  $secondScreen = d.querySelector(".pokeindex-right__screen"),
  $nameScreen = d.querySelector(".controller-touch"),
  $searchInput = d.querySelector(".input-poke"),
  $lightSpeak = d.querySelector(".circle-big"),
  $lightSpeakSmall = d.querySelector(".status-light"),
  $powerBtn = d.querySelector(".buttons-circle"),
  $soundPowerBtn = d.createElement("audio"),
  $textPlaying = d.querySelector(".text-playing"),
  $btnStartSearch = d.querySelector(".btn-buscar"),
  $btnStopSearch = d.querySelector(".btn-stop");

let voices = [];

const onLightSpeak = () => {
  $lightSpeak.classList.add("is-speak");
  $lightSpeakSmall.classList.add("is-speak");
};

const offLightSpeak = () => {
  $lightSpeak.classList.remove("is-speak");
  $lightSpeakSmall.classList.remove("is-speak");
};

const pokedexSpeak = (
  name,
  type,
  species,
  mainAttack,
  detail,
  detail2,
  detail3
) => {
  const phrase = `
    ${name}. Pokémon tipo ${type}. Perteneciente a la especie ${species}. 
    Su ataque más poderoso es: ${mainAttack}. ${detail} ${detail2} ${detail3}
  `;
  utterThis.text = phrase;
  utterThis.voice = voices[59];
  utterThis.rate = 1.3;

  if (synth.speaking) {
    synth.cancel();
    synth.speak(utterThis);
  }

  synth.speak(utterThis);

  utterThis.onstart = () => {
    onLightSpeak();
  };

  utterThis.onend = () => {
    offLightSpeak();
    $btnStartSearch.classList.remove("disabled");
    $btnStopSearch.classList.remove("disabled");
    $searchInput.removeAttribute("disabled");
  };
};

async function getDataPokemon() {
  let pokeApi = `http://pokeapi.co/api/v2/pokemon/${$searchInput.value}`;

  try {
    $secondScreen.innerHTML = `<img class="loader" src="assets/puff.svg" alt="Cargando...">`;
    $mainScreen.innerHTML = `<img class="loader" src="assets/puff.svg" alt="Cargando...">`;

    let res = await fetch(pokeApi);
    pokemon = await res.json();

    if (!res) throw { status: res.status, statusText: res.statusText };

    try {
      let res = await fetch(pokemon.types[0].type.url);
      pokemonType = await res.json();

      if (!res) throw { status: res.status, statusText: res.statusText };
    } catch (error) {
      let message = error.statusText || "Ha ocurrido un error";
      $secondScreen.innerHTML =
        "<p>Algunos pokémones son tan dificil de encontrar, que no se tiene infomación acerca de ellos...con suerte podemos encontrar alguna imagén que los represente.</p>";
    }

    try {
      let res = await fetch(pokemon.species.url),
        pokemonSpecies = await res.json();

      if (!res) throw { status: res.status, statusText: res.statusText };

      $btnStartSearch.classList.add("disabled");
      $searchInput.setAttribute("disabled", true);

      $mainScreen.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      `;

      $nameScreen.innerHTML = `
        <p>${pokemon.name.toUpperCase()}</p>
      `;

      $secondScreen.innerHTML = `
        <p>Tipo: ${pokemonType.names[4].name}</p>
        <br>
        <p>Ataques:</p>
        <br>
        <ul>
          <li>${pokemon.moves[0].move.name}</li>
          <br>
          <li>${pokemon.moves[1].move.name}</li>
          <br>
          <li>${pokemon.moves[2].move.name}</li> 
        </ul>
        <br><br><br>
        <p>Especie: ${pokemonSpecies.genera[5].genus}</p>
      `;

      let pokemonDetails = pokemonSpecies.flavor_text_entries;

      const detailsPokemon = pokemonDetails.filter(
        (detail) => detail.language.name === "es"
      );

      pokedexSpeak(
        pokemon.name,
        pokemonType.names[4].name,
        pokemonSpecies.genera[5].genus,
        pokemon.moves[0].move.name,
        detailsPokemon[0].flavor_text.replace(/\n/g, " "),
        detailsPokemon[1].flavor_text.replace(/\n/g, " "),
        detailsPokemon[2].flavor_text.replace(/\n/g, " ")
      );
    } catch (error) {
      $secondScreen.innerHTML =
        "<p>Algunos pokémones son tan dificil de encontrar, que no se tiene infomación acerca de ellos...con suerte podemos encontrar alguna imagén que los represente.</p>";
    }
  } catch (error) {
    let message = error.statusText || "Ha ocurrido un error";
    $mainScreen.innerHTML = `😮: ${message}`;
    $secondScreen.innerHTML =
      "<p>No encontramos lo que buscabas, intentalo nuevamente...</p>";
  }
}

const onPokedex = () => {
  $powerBtn.classList.remove("is-off");
  $powerBtn.style.background = "#8cc6ff";
  $mainScreen.style.background = "#474445";
  $secondScreen.style.background = "#474445";
  $searchInput.removeAttribute("disabled");
  $searchInput.setAttribute("placeholder", "Ingrese número o nombre");
  $btnStartSearch.classList.remove("disabled");
  $btnStopSearch.classList.remove("disabled");
};

const offPokedex = () => {
  synth.cancel();
  $powerBtn.classList.add("is-off");
  $powerBtn.style.background = "#474445";
  $mainScreen.style.background = "#000000";
  $secondScreen.style.background = "#000000";
  $mainScreen.innerHTML = "";
  $secondScreen.innerHTML = "";
  $nameScreen.innerHTML = "";
  $searchInput.value = "";
  $searchInput.setAttribute("disabled", true);
  $searchInput.setAttribute("placeholder", "");
  $btnStartSearch.classList.add("disabled");
  $btnStopSearch.classList.add("disabled");
  offLightSpeak();
};

/* Delegación de Eventos */
d.addEventListener("click", (e) => {
  e.preventDefault();

  if (!$powerBtn.classList.contains("is-off")) {
    if (e.target === $btnStartSearch) {
      $searchInput.value !== ""
        ? getDataPokemon()
        : alert(
            "Debe ingresar el numero o nombre del pokémon que desea buscar"
          );
    }

    if (e.target === $btnStopSearch) {
      synth.cancel();
      $textPlaying.innerHTML = "";
    }

    if (e.target.matches(".btn-play") || e.target.matches(".btn-play img")) {
      if (synth.speaking) {
        onLightSpeak();
        $textPlaying.innerHTML = "";
        synth.resume();
      }
    }

    if (e.target.matches(".btn-pause") || e.target.matches(".btn-pause img")) {
      synth.pause();
      if (synth.speaking) {
        offLightSpeak();
        $textPlaying.innerHTML = "PAUSADO";
      }
    }
  }

  if (
    e.target.matches(".buttons-circle") ||
    e.target.matches(".buttons-circle img")
  ) {
    $soundPowerBtn.src = "assets/sound_on_pokedex.mp3";
    $soundPowerBtn.play();
    $powerBtn.classList.contains("is-off") ? onPokedex() : offPokedex();
  }
});

d.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    if (!$powerBtn.classList.contains("is-off")) {
      $btnStartSearch.classList.add("disabled");
      $searchInput.setAttribute("disabled", true);
      $searchInput.value !== ""
        ? getDataPokemon()
        : alert(
            "Debe ingresar el numero o nombre del pokémon que desea buscar"
          );
    }
  }
});

d.addEventListener("DOMContentLoaded", (e) => {
  window.speechSynthesis.addEventListener("voiceschanged", (e) => {
    voices = window.speechSynthesis.getVoices();
  });
  synth.cancel();
  $powerBtn.classList.add("is-off");
  $searchInput.setAttribute("disabled", true);
  $searchInput.setAttribute("placeholder", "");
  $btnStartSearch.classList.add("disabled");
  $btnStopSearch.classList.add("disabled");
});
